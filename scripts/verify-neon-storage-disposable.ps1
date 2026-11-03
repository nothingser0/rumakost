param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[a-z0-9-]+$')]
  [string]$ProjectId,

  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[a-z0-9-]+$')]
  [string]$ParentBranch,

  [ValidatePattern('^[a-z0-9.-]+$')]
  [string]$BucketName = 'uploads'
)

$ErrorActionPreference = 'Stop'
$branchName = "int02-verify-$([guid]::NewGuid().ToString('N').Substring(0, 10))"
$environmentFile = Join-Path ([IO.Path]::GetTempPath()) "rumakost-int02-$([guid]::NewGuid().ToString('N')).env"
$branchId = $null
$previousIntegrationFlag = $env:NEON_STORAGE_INTEGRATION
$previousBucketName = $env:NEON_STORAGE_BUCKET
$verificationExitCode = 1

try {
  $createOutput = & neon branches create `
    --project-id $ProjectId `
    --name $branchName `
    --parent $ParentBranch `
    --no-secrets `
    --expires-at ([DateTimeOffset]::UtcNow.AddHours(2).ToString('o')) `
    --output json `
    --color false

  if ($LASTEXITCODE -ne 0) { throw 'Neon disposable branch creation failed.' }
  $createdBranch = ($createOutput -join "`n") | ConvertFrom-Json
  $branchId = if ($createdBranch.branch.id) { $createdBranch.branch.id } else { $createdBranch.id }
  if (-not $branchId) { throw 'Neon CLI did not return the disposable branch ID.' }
  Write-Output "disposable_branch_created=True"

  $bucketOutput = & neon bucket list `
    --project-id $ProjectId `
    --branch $branchId `
    --output json `
    --color false
  if ($LASTEXITCODE -ne 0) { throw 'Neon bucket listing failed.' }
  $buckets = @($bucketOutput -join "`n" | ConvertFrom-Json)
  $bucket = $buckets | Where-Object { $_.name -eq $BucketName } | Select-Object -First 1
  if (-not $bucket -or $bucket.access_level -ne 'private') {
    throw 'The expected Neon bucket is missing or is not private on the disposable branch.'
  }
  Write-Output "private_bucket=$($bucket.name)"
  Write-Output "bucket_access_level=$($bucket.access_level)"

  $null = & neon env pull `
    --project-id $ProjectId `
    --branch $branchId `
    --service object-storage `
    --file $environmentFile `
    --color false
  if ($LASTEXITCODE -ne 0) { throw 'Neon Object Storage environment retrieval failed.' }
  if (-not (Test-Path -LiteralPath $environmentFile)) { throw 'Neon CLI did not write the temporary environment file.' }
  Write-Output 'provider_environment_retrieved=True (values suppressed)'

  $storageEnvironmentNames = @(
    'NEON_STORAGE_ENDPOINT', 'NEON_STORAGE_REGION', 'NEON_STORAGE_ACCESS_KEY', 'NEON_STORAGE_SECRET_KEY',
    'AWS_ENDPOINT_URL_S3', 'AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN'
  )
  $inheritedStorageEnvironment = @($storageEnvironmentNames | Where-Object { Test-Path -LiteralPath "Env:$_" })
  if ($inheritedStorageEnvironment.Count -gt 0) {
    throw "Clear inherited storage environment variables before running this disposable-branch verification: $($inheritedStorageEnvironment -join ', '). Values are not inspected."
  }

  $env:NEON_STORAGE_INTEGRATION = '1'
  $env:NEON_STORAGE_BUCKET = $BucketName
  & node "--env-file=$environmentFile" scripts/run-tests.mjs neon-object-storage
  $verificationExitCode = $LASTEXITCODE
  if ($verificationExitCode -ne 0) { throw "Neon Object Storage Verify failed with exit code $verificationExitCode." }
} finally {
  $env:NEON_STORAGE_INTEGRATION = $previousIntegrationFlag
  $env:NEON_STORAGE_BUCKET = $previousBucketName

  if ($branchId) {
    $null = & neon branches delete $branchId --project-id $ProjectId --output json --color false
    if ($LASTEXITCODE -eq 0) {
      $remainingBranches = @()
      for ($attempt = 0; $attempt -lt 8; $attempt++) {
        $remainingOutput = & neon branches list --project-id $ProjectId --output json --color false
        if ($LASTEXITCODE -ne 0) { break }
        $allBranches = @($remainingOutput -join "`n" | ConvertFrom-Json)
        $remainingBranches = @($allBranches | Where-Object { $_.id -eq $branchId })
        if ($remainingBranches.Count -eq 0) { break }
        Start-Sleep -Seconds 2
      }
      if ($remainingBranches.Count -eq 0) {
        Write-Output 'disposable_branch_deleted=True'
      } else {
        Write-Output "disposable_branch_deleted=False branch_id=$branchId"
        $verificationExitCode = 1
      }
    } else {
      Write-Output "disposable_branch_deleted=False branch_id=$branchId"
      $verificationExitCode = 1
    }
  }

  if (Test-Path -LiteralPath $environmentFile) {
    Remove-Item -LiteralPath $environmentFile -Force
  }
}

if ($verificationExitCode -ne 0) { exit $verificationExitCode }
