param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectId,
  [Parameter(Mandatory = $true)]
  [string]$BranchName
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$configPath = Join-Path $repoRoot "prisma.config.data-boundaries-disposable.ts"
$connectionUrl = $null
$createdBranch = $false
$stage = "preflight"
$finalExitCode = 0

function Write-SafeNativeOutput($Output, [string]$Secret) {
  $value = ($Output | ForEach-Object { [string]$_ }) -join "`n"
  if ($Secret) {
    $value = $value.Replace($Secret, "<connection-string-redacted>")
  }
  $value = [regex]::Replace($value, 'postgres(?:ql)?://[^\s''"]+', "<connection-string-redacted>")
  if ($value) { Write-Output $value }
}

try {
  if (Test-Path -LiteralPath $configPath) {
    throw "Temporary Prisma config path already exists."
  }

  $branchOutput = & neon branches list --project-id $ProjectId --output json --no-secrets 2>&1
  if ($LASTEXITCODE -ne 0) {
    throw "Could not list Neon branches."
  }
  $branches = (($branchOutput -join "`n") | ConvertFrom-Json)
  $sourceBranch = $branches | Where-Object { $_.name -eq "dev" -and $_.primary -and $_.default } | Select-Object -First 1
  if (-not $sourceBranch) {
    throw "Expected the project dev branch to be both primary and default."
  }
  if ($branches | Where-Object { $_.name -eq $BranchName }) {
    throw "Disposable branch name already exists; refusing to reuse it."
  }
  Write-Output "SOURCE_BRANCH=dev"

  $stage = "branch-create"
  $createOutput = & neon branches create --project-id $ProjectId --name $BranchName --parent dev --no-secrets 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-SafeNativeOutput $createOutput $null
    throw "Could not create the disposable Neon branch."
  }
  $createdBranch = $true

  $stage = "branch-ready"
  $branchInfo = $null
  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    $branchOutput = & neon branches get $BranchName --project-id $ProjectId --output json --no-secrets 2>&1
    if ($LASTEXITCODE -eq 0) {
      try { $branchInfo = (($branchOutput -join "`n") | ConvertFrom-Json) } catch { $branchInfo = $null }
      if ($branchInfo -and $branchInfo.current_state -eq "ready") { break }
    }
    Start-Sleep -Seconds 2
  }
  if (-not $branchInfo -or $branchInfo.name -ne $BranchName -or $branchInfo.current_state -ne "ready" -or $branchInfo.primary -or $branchInfo.default) {
    throw "Disposable branch is not ready or is protected as a primary/default branch."
  }
  Write-Output "DISPOSABLE_BRANCH_READY=true"
  Write-Output "BRANCH_TARGET_SAFE=true"

  $stage = "connection-string"
  $connectionOutput = & neon connection-string $BranchName --project-id $ProjectId --role-name neondb_owner --database-name neondb --output json 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-SafeNativeOutput $connectionOutput $null
    throw "Could not obtain the disposable branch connection."
  }
  $connectionText = ($connectionOutput -join "`n").Trim()
  if ($connectionText.StartsWith("postgres")) {
    $connectionUrl = $connectionText
  } else {
    $connectionPayload = $connectionText | ConvertFrom-Json
    if ($connectionPayload -is [string]) {
      $connectionUrl = $connectionPayload
    } else {
      foreach ($fieldName in @("connection_string", "connectionString", "url", "connection")) {
        $fieldValue = $connectionPayload.$fieldName
        if ($fieldValue -is [string] -and $fieldValue.StartsWith("postgres")) {
          $connectionUrl = $fieldValue
          break
        }
      }
    }
  }
  if (-not $connectionUrl -or -not $connectionUrl.StartsWith("postgres")) {
    throw "Connection output did not contain a PostgreSQL URL."
  }

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
  $env:DIRECT_URL = $connectionUrl

  $stage = "migration-deploy"
  $nativeErrorPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    $migrationOutput = & (Join-Path $repoRoot "node_modules/.bin/prisma.cmd") migrate deploy --config $configPath 2>&1
    $migrationExitCode = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $nativeErrorPreference
  }
  Write-SafeNativeOutput $migrationOutput $connectionUrl
  Write-Output "MIGRATION_EXIT_CODE=$migrationExitCode"
  if ($migrationExitCode -ne 0) { throw "Prisma migration deploy failed on the disposable branch." }

  $stage = "index-catalog-and-plan-probe"
  $ErrorActionPreference = "Continue"
  try {
    $probeOutput = & node (Join-Path $repoRoot "scripts/verify-data-boundaries-indexes.mjs") 2>&1
    $probeExitCode = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $nativeErrorPreference
  }
  Write-SafeNativeOutput $probeOutput $connectionUrl
  Write-Output "INDEX_PROBE_EXIT_CODE=$probeExitCode"
  if ($probeExitCode -ne 0) { throw "Index catalog or order-plan verification failed." }
} catch {
  $finalExitCode = 1
  Write-Output "DISPOSABLE_VERIFICATION=FAILED_AT_$stage"
  $safeError = ($_ | Out-String).Trim()
  if ($connectionUrl) { $safeError = $safeError.Replace($connectionUrl, "<connection-string-redacted>") }
  $safeError = [regex]::Replace($safeError, 'postgres(?:ql)?://[^\s''"]+', "<connection-string-redacted>")
  if ($safeError) { Write-Output "ERROR_SAFE=$safeError" }
} finally {
  Remove-Item Env:DIRECT_URL -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath $configPath -Force -ErrorAction SilentlyContinue

  if ($createdBranch) {
    $stage = "branch-delete"
    $deleteOutput = & neon branches delete $BranchName --project-id $ProjectId 2>&1
    $deleteExitCode = $LASTEXITCODE
    if ($deleteExitCode -ne 0) {
      $finalExitCode = 1
      Write-SafeNativeOutput $deleteOutput $connectionUrl
      Write-Output "DISPOSABLE_BRANCH_DELETE_EXIT_CODE=$deleteExitCode"
    } else {
      $remainingOutput = & neon branches list --project-id $ProjectId --output json --no-secrets 2>&1
      if ($LASTEXITCODE -ne 0) {
        $finalExitCode = 1
        Write-Output "DISPOSABLE_BRANCH_CLEANUP=UNVERIFIED"
      } else {
        $remainingBranches = (($remainingOutput -join "`n") | ConvertFrom-Json)
        $stillExists = @($remainingBranches | Where-Object { $_.name -eq $BranchName }).Count -gt 0
        if ($stillExists) {
          $finalExitCode = 1
          Write-Output "DISPOSABLE_BRANCH_CLEANUP=FAIL"
        } else {
          Write-Output "DISPOSABLE_BRANCH_DELETED=true"
          Write-Output "ONLY_SOURCE_BRANCH_REMAINS=$(@($remainingBranches).Count -eq 1 -and $remainingBranches[0].name -eq 'dev')"
        }
      }
    }
  }
}

exit $finalExitCode
