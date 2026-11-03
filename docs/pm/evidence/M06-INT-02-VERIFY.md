# Raw Verify M06-INT-02 (2026-11-03)

## Neon provider verification

Command:

~~~powershell
& .\scripts\verify-neon-storage-disposable.ps1 -ProjectId floral-wind-91503829 -ParentBranch dev -BucketName uploads
~~~

Raw output (ANSI color controls removed; secret values were not printed):

~~~text
disposable_branch_created=True
private_bucket=uploads
bucket_access_level=private
Pulled 5 Neon variables into C:\Users\zen\AppData\Local\Temp\rumakost-int02-77afa43607e94583bb16e4492858d2ab.env from branch int02-verify-64b7b523f9 (br-purple-fire-b3ebwdjf)
  Branch          NEON_BRANCH
  Object Storage  AWS_ACCESS_KEY_ID*, AWS_SECRET_ACCESS_KEY*, AWS_ENDPOINT_URL_S3, AWS_REGION
  * new credential value
provider_environment_retrieved=True (values suppressed)
TAP version 13
# Subtest: Neon private bucket accepts signed upload/download and rejects anonymous reads
ok 1 - Neon private bucket accepts signed upload/download and rejects anonymous reads
  ---
  duration_ms: 1008.7051
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1649.0126
disposable_branch_deleted=True
~~~

The integration test exercised a synthetic JPEG object through the same Neon S3 adapter composition used by the server: signed PUT, anonymous GET rejection, server-side read, signed GET, private cache header, and two idempotent deletes followed by a missing-object read. The disposable child branch was deleted and confirmed absent. The parent dev branch was not used for object writes. The temporary environment file was removed by the verification script. The app's .env.local was not read or changed.

## Additional static diagnostics

Command: npm run typecheck.

The repository-wide TypeScript check exits 2 with 77 errors in other modules; none of the reported paths are src/lib/storage/neon-object-storage.ts, src/lib/storage/s3-media-storage.mjs, src/lib/env.ts, or tests/neon-object-storage/. This does not change the provider Verify result, but the full project is not currently typecheck-clean.

PowerShell parser check: powershell_syntax=PASS. node --check passed for the provider adapter and integration test. git diff --check passed with only the repository's LF-to-CRLF working-copy notices.
