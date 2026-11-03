param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[a-z0-9-]+$')]
  [string]$ProjectId,

  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[a-z0-9-]+$')]
  [string]$ParentBranch
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$branchSuffix = [guid]::NewGuid().ToString('N').Substring(0, 12)
$branchName = "auth05-verify-$branchSuffix"
$databaseName = "auth05_verify_$branchSuffix"
$configPath = Join-Path $repoRoot 'prisma.config.auth-provider-disposable.ts'
$connectionUrl = $null
$betterAuthSecret = $null
$configCreated = $false
$setEnvironmentNames = @()
$verificationExitCode = 1
$stage = 'preflight'
$failureReported = $false
$neonAvailable = $false
$locationPushed = $false

function Invoke-CapturedCommand {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Executable,
    [Parameter(Mandatory = $true)]
    [string[]]$Arguments
  )

  $savedPreference = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    $output = & $Executable @Arguments 2>&1
    $exitCode = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $savedPreference
  }

  [pscustomobject]@{
    ExitCode = $exitCode
    Text = ($output | ForEach-Object { [string]$_ }) -join "`n"
  }
}

function ConvertTo-SafeText {
  param([string]$Text)

  if ($connectionUrl) {
    $Text = $Text.Replace($connectionUrl, '<connection-string-redacted>')
  }
  if ($betterAuthSecret) {
    $Text = $Text.Replace($betterAuthSecret, '<secret-redacted>')
  }

  [regex]::Replace($Text, 'postgres(?:ql)?://[^\s''"]+', '<connection-string-redacted>')
}

function Write-SafeOutput {
  param([string]$Text)

  $safeText = ConvertTo-SafeText $Text
  if ($safeText) {
    Write-Output $safeText
  }
}

function ConvertFrom-NeonJson {
  param([string]$Text)

  try {
    ConvertFrom-Json -InputObject $Text
  } catch {
    throw 'Neon CLI returned invalid JSON.'
  }
}

function Get-BranchInfo {
  param([object]$Payload)

  if ($Payload.PSObject.Properties.Name -contains 'branch') {
    return $Payload.branch
  }

  return $Payload
}

function Get-BranchRows {
  param([object]$Payload)

  if ($Payload.PSObject.Properties.Name -contains 'branches') {
    return @($Payload.branches)
  }

  return @($Payload)
}

$environmentNames = @(
  'DATABASE_URL',
  'DIRECT_URL',
  'AUTH_PROVIDER_TEST_DATABASE_URL',
  'BETTER_AUTH_URL',
  'BETTER_AUTH_SECRET',
  'APP_ORIGIN'
)

try {
  if (Test-Path -LiteralPath $configPath) {
    throw 'Temporary Prisma config path already exists.'
  }

  $inheritedEnvironmentNames = @(
    $environmentNames | Where-Object { Test-Path -LiteralPath "Env:$_" }
  )
  if ($inheritedEnvironmentNames.Count -gt 0) {
    throw "Clear inherited environment variables before verification: $($inheritedEnvironmentNames -join ', '). Values were not inspected."
  }

  $neonCommand = Get-Command neon -ErrorAction Stop
  $neonAvailable = $true
  $nodeCommand = Get-Command node -ErrorAction Stop
  $npmCommand = Get-Command npm.cmd -ErrorAction Stop
  $prismaCommand = Join-Path $repoRoot 'node_modules/.bin/prisma.cmd'
  if (-not (Test-Path -LiteralPath $prismaCommand)) {
    throw 'Prisma CLI is not installed in this workspace.'
  }
  Write-Output "NODE_VERSION=$(& $nodeCommand.Source --version)"

  $stage = 'parent-branch-check'
  $parentResult = Invoke-CapturedCommand 'neon' @(
    'branches', 'get', $ParentBranch,
    '--project-id', $ProjectId,
    '--output', 'json',
    '--color', 'false'
  )
  if ($parentResult.ExitCode -ne 0) {
    throw 'Could not inspect the requested Neon parent branch.'
  }
  $parentInfo = Get-BranchInfo (ConvertFrom-NeonJson $parentResult.Text)
  if ($parentInfo.project_id -ne $ProjectId -or $parentInfo.current_state -ne 'ready') {
    throw 'Requested Neon parent branch is not ready in the selected project.'
  }
  Write-Output 'PARENT_BRANCH_READY=true'

  $stage = 'branch-create'
  $expiresAt = [DateTimeOffset]::UtcNow.AddHours(2).ToString('yyyy-MM-ddTHH:mm:ssZ')
  $createResult = Invoke-CapturedCommand 'neon' @(
    'branches', 'create',
    '--project-id', $ProjectId,
    '--name', $branchName,
    '--parent', $ParentBranch,
    '--schema-only',
    '--no-secrets',
    '--expires-at', $expiresAt,
    '--output', 'json',
    '--color', 'false'
  )
  if ($createResult.ExitCode -ne 0) {
    throw "Neon disposable branch creation failed (exit $($createResult.ExitCode))."
  }
  $createdInfo = Get-BranchInfo (ConvertFrom-NeonJson $createResult.Text)
  if ($createdInfo.name -ne $branchName -or $createdInfo.project_id -ne $ProjectId -or -not $createdInfo.id) {
    throw 'Neon CLI did not confirm the requested disposable branch.'
  }
  $branchId = [string]$createdInfo.id
  Write-Output 'DISPOSABLE_BRANCH_CREATED=true'
  Write-Output 'BRANCH_SCHEMA_ONLY=true'
  Write-Output 'BRANCH_SECRETS_IN_OUTPUT=false'

  $stage = 'branch-safety-check'
  $branchInfo = $null
  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    $branchResult = Invoke-CapturedCommand 'neon' @(
      'branches', 'get', $branchId,
      '--project-id', $ProjectId,
      '--output', 'json',
      '--color', 'false'
    )
    if ($branchResult.ExitCode -ne 0) {
      throw 'Could not verify the disposable Neon branch.'
    }
    $branchInfo = Get-BranchInfo (ConvertFrom-NeonJson $branchResult.Text)
    if ($branchInfo.current_state -eq 'ready') { break }
    if ($branchInfo.current_state -eq 'broken') {
      throw 'Neon reported the disposable branch as broken.'
    }
    Start-Sleep -Seconds 2
  }
  if (
    $branchInfo.name -ne $branchName -or
    $branchInfo.project_id -ne $ProjectId -or
    $branchInfo.current_state -ne 'ready' -or
    $branchInfo.primary -ne $false -or
    $branchInfo.default -ne $false
  ) {
    throw 'Refusing to use a branch that is not a ready, non-primary disposable branch.'
  }
  Write-Output 'DISPOSABLE_BRANCH_SAFE=true'

  $stage = 'database-create'
  $databaseResult = Invoke-CapturedCommand 'neon' @(
    'databases', 'create',
    '--project-id', $ProjectId,
    '--branch', $branchId,
    '--name', $databaseName,
    '--owner-name', 'neondb_owner'
  )
  if ($databaseResult.ExitCode -ne 0) {
    throw "Could not create the empty disposable database (exit $($databaseResult.ExitCode))."
  }
  Write-Output 'EMPTY_DISPOSABLE_DATABASE_CREATED=true'

  $stage = 'connection-string'
  $connectionResult = Invoke-CapturedCommand 'neon' @(
    'connection-string', $branchId,
    '--project-id', $ProjectId,
    '--role-name', 'neondb_owner',
    '--database-name', $databaseName,
    '--output', 'json',
    '--color', 'false'
  )
  if ($connectionResult.ExitCode -ne 0) {
    throw 'Could not obtain the disposable database connection.'
  }

  $connectionText = $connectionResult.Text.Trim()
  if ($connectionText.StartsWith('postgres')) {
    $connectionUrl = $connectionText
  } else {
    $connectionPayload = ConvertFrom-NeonJson $connectionText
    if ($connectionPayload -is [string]) {
      $connectionUrl = $connectionPayload
    } else {
      foreach ($fieldName in @('connection_string', 'connectionString', 'url', 'connection')) {
        $fieldValue = $connectionPayload.$fieldName
        if ($fieldValue -is [string] -and $fieldValue.StartsWith('postgres')) {
          $connectionUrl = $fieldValue
          break
        }
      }
    }
  }
  if (-not $connectionUrl -or -not $connectionUrl.StartsWith('postgres')) {
    throw 'Neon connection output did not contain a PostgreSQL URL.'
  }

  $stage = 'temporary-config'
  $configText = @"
import { defineConfig, env } from "prisma/config";
import { resolve } from "node:path";
const root = process.cwd();
export default defineConfig({
  schema: resolve(root, "prisma/schema.prisma"),
  migrations: { path: resolve(root, "prisma/migrations") },
  datasource: { url: env("DIRECT_URL") },
});
"@
  Set-Content -LiteralPath $configPath -Value $configText -Encoding utf8
  $configCreated = $true

  Push-Location $repoRoot
  $locationPushed = $true
  try {
    $stage = 'prisma-generate'
    $generateResult = Invoke-CapturedCommand $npmCommand.Source @('run', 'db:generate')
    Write-SafeOutput $generateResult.Text
    Write-Output "PRISMA_GENERATE_EXIT_CODE=$($generateResult.ExitCode)"
    if ($generateResult.ExitCode -ne 0) {
      throw 'Prisma Client generation failed.'
    }

    $randomGenerator = [Security.Cryptography.RandomNumberGenerator]::Create()
    $betterAuthSecretBytes = New-Object byte[] 32
    try {
      $randomGenerator.GetBytes($betterAuthSecretBytes)
    } finally {
      $randomGenerator.Dispose()
    }
    $betterAuthSecret = [Convert]::ToBase64String($betterAuthSecretBytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
    $environmentValues = @{
      DATABASE_URL = $connectionUrl
      DIRECT_URL = $connectionUrl
      AUTH_PROVIDER_TEST_DATABASE_URL = $connectionUrl
      BETTER_AUTH_URL = 'http://localhost:3000'
      BETTER_AUTH_SECRET = $betterAuthSecret
      APP_ORIGIN = 'http://localhost:3000'
    }
    foreach ($name in $environmentValues.Keys) {
      [Environment]::SetEnvironmentVariable($name, $environmentValues[$name], 'Process')
      $setEnvironmentNames += $name
    }
    Write-Output 'DISPOSABLE_ENVIRONMENT_SET=true'

    $stage = 'prisma-migrate-deploy'
    $migrationResult = Invoke-CapturedCommand $prismaCommand @('migrate', 'deploy', '--config', $configPath)
    Write-SafeOutput $migrationResult.Text
    Write-Output "PRISMA_MIGRATE_DEPLOY_EXIT_CODE=$($migrationResult.ExitCode)"
    if ($migrationResult.ExitCode -ne 0) {
      throw 'Prisma migration deployment failed on the disposable database.'
    }

    $stage = 'auth-provider-tests'
    $testResult = Invoke-CapturedCommand $npmCommand.Source @('run', 'test', '--', 'auth-provider')
    Write-SafeOutput $testResult.Text
    Write-Output "AUTH_PROVIDER_TEST_EXIT_CODE=$($testResult.ExitCode)"
    if ($testResult.ExitCode -ne 0) {
      throw 'Better Auth disposable integration tests failed.'
    }
  } finally {
    if ($locationPushed) {
      Pop-Location
      $locationPushed = $false
    }
  }

  $verificationExitCode = 0
} catch {
  $verificationExitCode = 1
  Write-Output "AUTH_PROVIDER_VERIFY=FAIL_AT_$stage"
  $failureReported = $true
  $safeError = ConvertTo-SafeText ($_.Exception.Message)
  if ($safeError) {
    Write-Output "ERROR_SAFE=$safeError"
  }
} finally {
  foreach ($name in $setEnvironmentNames) {
    [Environment]::SetEnvironmentVariable($name, $null, 'Process')
  }
  if ($configCreated -and (Test-Path -LiteralPath $configPath)) {
    Remove-Item -LiteralPath $configPath -Force
  }

  $branchToDelete = $null
  $branchListResult = $null
  if ($neonAvailable) {
    $branchListResult = Invoke-CapturedCommand 'neon' @(
      'branches', 'list',
      '--project-id', $ProjectId,
      '--output', 'json',
      '--color', 'false'
    )
  }
  if ($branchListResult -and $branchListResult.ExitCode -eq 0) {
    try {
      $branchRows = Get-BranchRows (ConvertFrom-NeonJson $branchListResult.Text)
      $matchingBranch = @($branchRows | Where-Object { $_.name -eq $branchName -and $_.project_id -eq $ProjectId }) | Select-Object -First 1
      if ($matchingBranch) {
        $branchToDelete = [string]$matchingBranch.id
      }
    } catch {
      $branchListResult = $null
    }
  }

  if ($branchToDelete) {
    $null = Invoke-CapturedCommand 'neon' @(
      'branches', 'delete', $branchToDelete,
      '--project-id', $ProjectId,
      '--output', 'json',
      '--color', 'false'
    )

    $branchDeleted = $false
    for ($attempt = 0; $attempt -lt 15; $attempt++) {
      $remainingResult = Invoke-CapturedCommand 'neon' @(
        'branches', 'list',
        '--project-id', $ProjectId,
        '--output', 'json',
        '--color', 'false'
      )
      if ($remainingResult.ExitCode -eq 0) {
        try {
          $remainingRows = Get-BranchRows (ConvertFrom-NeonJson $remainingResult.Text)
          $remainingBranch = @($remainingRows | Where-Object { $_.id -eq $branchToDelete }) | Select-Object -First 1
          if (-not $remainingBranch) {
            $branchDeleted = $true
            break
          }
        } catch {
          $branchDeleted = $false
        }
      }
      Start-Sleep -Seconds 2
    }
    Write-Output "DISPOSABLE_BRANCH_DELETED=$($branchDeleted.ToString().ToLowerInvariant())"
    if (-not $branchDeleted) {
      $verificationExitCode = 1
    }
  } elseif ($branchListResult -and $branchListResult.ExitCode -eq 0) {
    Write-Output 'DISPOSABLE_BRANCH_DELETED=true'
  } else {
    Write-Output 'DISPOSABLE_BRANCH_DELETED=unverified'
    $verificationExitCode = 1
  }

  if ($verificationExitCode -eq 0) {
    Write-Output 'AUTH_PROVIDER_VERIFY=PASS'
  } elseif (-not $failureReported) {
    Write-Output 'AUTH_PROVIDER_VERIFY=FAIL_AT_BRANCH_CLEANUP'
  }
  Write-Output "VERIFY_EXIT_CODE=$verificationExitCode"
}

if ($verificationExitCode -ne 0) {
  exit $verificationExitCode
}
