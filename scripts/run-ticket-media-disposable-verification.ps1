param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectId,
  [Parameter(Mandatory = $true)]
  [string]$BranchName,
  [string]$DatabaseName = "neondb",
  [switch]$CreateDatabase
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$configPath = Join-Path $repoRoot "prisma.config.media-disposable.ts"
$connectionUrl = $null
$stage = "branch-check"
$migrationExitCode = 1
$probeExitCode = 1

try {
  if (Test-Path -LiteralPath $configPath) {
    throw "Temporary Prisma config path already exists."
  }

  $branchOutput = & neon branches get $BranchName --project-id $ProjectId --output json
  if ($LASTEXITCODE -ne 0) {
    throw "Could not inspect disposable branch."
  }
  $branchInfo = ($branchOutput -join "`n") | ConvertFrom-Json
  if ($branchInfo.name -ne $BranchName -or $branchInfo.current_state -ne "ready" -or $branchInfo.primary -or $branchInfo.default) {
    throw "Refusing to migrate a primary or default branch."
  }
  Write-Output "BRANCH_TARGET_SAFE=true"

  if ($CreateDatabase) {
    $stage = "database-create"
    $databaseOutput = & neon databases create `
      --project-id $ProjectId `
      --branch $BranchName `
      --name $DatabaseName `
      --owner-name neondb_owner
    if ($LASTEXITCODE -ne 0) {
      Write-Output "DATABASE_CREATE_EXIT_CODE=$LASTEXITCODE"
      throw "Could not create the disposable verification database."
    }
    Write-Output "DISPOSABLE_DATABASE_CREATED=true"
  }

  $stage = "connection-string"
  $connectionOutput = & neon connection-string $BranchName `
    --project-id $ProjectId `
    --role-name neondb_owner `
    --database-name $DatabaseName `
    --output json
  if ($LASTEXITCODE -ne 0) {
    Write-Output "CONNECTION_CLI_EXIT_CODE=$LASTEXITCODE"
    throw "Could not obtain the disposable branch connection."
  }

  $stage = "connection-parse"
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
  $stage = "migration-deploy"
  Set-Content -LiteralPath $configPath -Value $configText -Encoding utf8
  $env:DIRECT_URL = $connectionUrl

  $nativeErrorPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    $migrationOutput = & (Join-Path $repoRoot "node_modules/.bin/prisma.cmd") `
      migrate deploy --config $configPath 2>&1
    $migrationExitCode = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $nativeErrorPreference
  }
  $migrationText = ($migrationOutput | ForEach-Object { [string]$_ }) -join "`n"
  $migrationText = $migrationText.Replace($connectionUrl, "<connection-string-redacted>")
  $migrationText = [regex]::Replace($migrationText, 'postgres(?:ql)?://[^\s''"]+', "<connection-string-redacted>")
  if ($migrationText) {
    Write-Output $migrationText
  }
  Write-Output "MIGRATION_EXIT_CODE=$migrationExitCode"

  if ($migrationExitCode -eq 0) {
    $stage = "migration-probe"
    $ErrorActionPreference = "Continue"
    try {
      $probeOutput = & node `
        (Join-Path $repoRoot "scripts/verify-ticket-media-migration.mjs") 2>&1
      $probeExitCode = $LASTEXITCODE
    } finally {
      $ErrorActionPreference = $nativeErrorPreference
    }
    $probeText = ($probeOutput | ForEach-Object { [string]$_ }) -join "`n"
    $probeText = $probeText.Replace($connectionUrl, "<connection-string-redacted>")
    $probeText = [regex]::Replace($probeText, 'postgres(?:ql)?://[^\s''"]+', "<connection-string-redacted>")
    if ($probeText) {
      Write-Output $probeText
    }
    Write-Output "MIGRATION_PROBE_EXIT_CODE=$probeExitCode"
  }

  if ($migrationExitCode -ne 0 -or $probeExitCode -ne 0) {
    exit 1
  }
} catch {
  Write-Output "DISPOSABLE_VERIFICATION=FAILED_AT_$stage"
  $safeError = ($_ | Out-String).Trim()
  if ($connectionUrl) {
    $safeError = $safeError.Replace($connectionUrl, "<connection-string-redacted>")
  }
  $safeError = [regex]::Replace($safeError, 'postgres(?:ql)?://[^\s''"]+', "<connection-string-redacted>")
  if ($safeError) {
    Write-Output "ERROR_SAFE=$safeError"
  }
  exit 1
} finally {
  Remove-Item Env:DIRECT_URL -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath $configPath -Force -ErrorAction SilentlyContinue
}
