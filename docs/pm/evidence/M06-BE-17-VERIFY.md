# M06-BE-17 Verify - Pengamanan batas autentikasi dan request

Tanggal: 2026-11-03

Runtime: Next.js 16.4.3; Node.js 24.22.2 via `npx node@24.22.2` sesuai `package.json`.
Provider/database: konfigurasi Neon Auth tidak dibaca atau diubah; tidak ada email reset, mutasi akun, atau query database.

## Suite `auth-security`

Command: PowerShell temporarily put Node 24.22.2 from npm's cache first in the process `PATH`, then ran `npm run test -- auth-security`.

```text
v24.22.2

> rumakost@0.1.0 test
> node scripts/run-tests.mjs auth-security

✔ requires a serialized same-origin Origin header for auth mutations (1.3927ms)
✔ rejects malformed configured origins before running an auth mutation (0.2617ms)
✔ does not invoke the auth provider for cross-origin or missing-origin mutations (1.072ms)
✔ same-origin requests can invoke the auth provider (0.3229ms)
✔ password reset callback remains on APP_ORIGIN despite a hostile returnTo field (2.5129ms)
✔ password reset remains non-enumerating when the provider rejects or throws (0.4925ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 220.0953
```

## Local route probe

Dev server startup:

```text
Command: npx --yes node@24.22.2 node_modules/next/dist/bin/next dev --webpack --port=3000

▲ Next.js 16.4.3 (webpack)
- Local:         http://localhost:3000
- Network:       http://100.105.236.106:3000
- Environments: .env.local
✓ Ready in 515ms
✓ Running next.config.ts took 56ms
- Cache Components enabled
- Partial Prefetching enabled
```

Route probe command: PowerShell `Invoke-WebRequest` GET to the listed local URLs; only status and selected security headers were printed.

Route probe output:

```text
GET /reset-sandi HTTP=200
X-Frame-Options=DENY
X-Content-Type-Options=nosniff
Referrer-Policy=no-referrer
X-Powered-By=
MISSING_TOKEN_HAS_PASSWORD_FIELDS=False
GET /reset-sandi?token=synthetic-reset-token HTTP=200
X-Frame-Options=DENY
X-Content-Type-Options=nosniff
Referrer-Policy=no-referrer
X-Powered-By=
GET /reset-sandi?token=synthetic-reset-token&error=INVALID_TOKEN HTTP=200
X-Frame-Options=DENY
X-Content-Type-Options=nosniff
Referrer-Policy=no-referrer
X-Powered-By=
ERROR_QUERY_REJECTS_TOKEN=True
ERROR_QUERY_HAS_PASSWORD_FIELDS=False
GET /lupa-sandi HTTP=200
X-Frame-Options=DENY
X-Content-Type-Options=nosniff
Referrer-Policy=strict-origin-when-cross-origin
X-Powered-By=
```

Next.js dev request log:

```text
GET /reset-sandi 200 in 470ms (next.js: 251ms, application-code: 218ms)
GET /reset-sandi?token=synthetic-reset-token 200 in 112ms (next.js: 2ms, application-code: 109ms)
GET /reset-sandi?token=synthetic-reset-token&error=INVALID_TOKEN 200 in 62ms (next.js: 1.2ms, application-code: 61ms)
GET /lupa-sandi 200 in 261ms (next.js: 106ms, application-code: 156ms)
```

## Rate-limit gate

CLI help command: `neon neon-auth config email-password update --help`.

```text
neon neon-auth config email-password update

Options:
--project-id
└────────────────>  Project ID [string]
--branch
└────────────────>  Branch ID or name [string]
--enabled
└────────────────>  Enable email and password authentication [boolean]
--email-verification-method
└────────────────>  Email verification method [string] [choices: "link",
                    "otp"]
--require-email-verification
└────────────────>  Require email verification before users can sign in
                    [boolean]
--auto-sign-in-after-verification
└────────────────>  Auto sign in users after verifying their email
                    [boolean]
--send-verification-email-on-sign-up
└────────────────>  Send verification email on sign up [boolean]
--send-verification-email-on-sign-in
└────────────────>  Send verification email on sign in [boolean]
--disable-sign-up
└────────────────>  Disable new user sign ups [boolean]
```

Read-only project discovery output summary: `neon projects list --output table --color false` returned `EXIT_CODE=0`, `RUMAKOST_MATCHING_LINES=0`, `PROJECT_SELECTION=UNRESOLVED`; the JSON-format attempt returned non-JSON output. No project or branch was selected, no auth branch setting was queried, and no Neon or Vercel configuration was changed. The CLI help above lists no rate-limit option. The local Neon Auth SDK exposes the managed auth adapter, not its provider's rate-limit configuration.

Official references:

- [Neon Auth is a managed Better Auth service and does not support custom Better Auth plugins or custom server-side handlers](https://neon.com/blog/neon-auth-branchable-identity-in-your-database).
- [Vercel WAF rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting) documents fixed-window limits and Hobby counting keys (IP and JA4); Hobby supports one rate-limit rule per project. This can support an IP rule but does not prove the FSD target's account-based progressive delay.

Status historis: application checks PASS 6/6 dan route probes pass sebelum wiring limiter akun. Follow-up di bawah mencatat Verify auth-security 16/16 dan wiring per akun; tidak ada live Neon atau Vercel WAF proof, jadi M06-BE-17 tetap unchecked.

## Follow-up Verify: limiter akun di Server Action (2026-11-03)

Implementasi login sekarang mencari `AppUser` memakai email canonical, mereservasi percobaan melalui `reserve_auth_login_attempt` sebelum memanggil Neon Auth, mencatat hanya kegagalan kredensial melalui `record_auth_login_failure`, lalu mereset eskalasi melalui `record_auth_login_success` setelah autentikasi berhasil. Query limiter hanya mengirim ID `AppUser`; tabel tidak menyimpan email, IP, sandi, atau token. Akun yang belum ada di `app_users` tetap mendapat respons generik dan hanya terlindungi oleh limiter IP edge.

Suite memakai callback provider/database sintetis; tidak ada query ke Neon, request Neon Auth, reset email, atau mutasi akun live. Invariant SQL migration sudah diverifikasi terpisah dengan PGlite di [M06-DB-57-VERIFY.md](M06-DB-57-VERIFY.md); migration belum diterapkan ke Neon.

Command: `npm run test -- auth-security`, dijalankan dengan Node.js v24.22.2.

```text
> rumakost@0.1.0 test
> node scripts/run-tests.mjs auth-security

✔ blocks a reserved account before calling the auth provider (5.1927ms)
✔ records failed credentials after reserving an account attempt (0.4387ms)
✔ clears progressive failures after successful authentication (0.4096ms)
✔ uses the provider for an unknown app account without storing an identity key (0.3543ms)
✔ fails closed before provider authentication when account lookup fails (0.3721ms)
✔ fails closed before provider authentication when attempt reservation fails (0.3167ms)
✔ does not record a progressive credential failure when the provider is unavailable (0.4277ms)
✔ fails closed when an invalid credential cannot update the account limiter (0.3416ms)
✔ marks a successful provider login for sign-out when the limiter reset fails (0.5458ms)
✔ counts invalid credentials without treating provider outages as password failures (0.5538ms)
✔ requires a serialized same-origin Origin header for auth mutations (1.4611ms)
✔ rejects malformed configured origins before running an auth mutation (0.3176ms)
✔ does not invoke the auth provider for cross-origin or missing-origin mutations (1.2422ms)
✔ same-origin requests can invoke the auth provider (0.2887ms)
✔ password reset callback remains on APP_ORIGIN despite a hostile returnTo field (2.5774ms)
✔ password reset remains non-enumerating when the provider rejects or throws (0.526ms)
ℹ tests 16
ℹ suites 0
ℹ pass 16
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 292.9402
VERIFY_AUTH_SECURITY_EXIT=0
```

Supplemental typecheck: project-wide TypeScript still exits `2` with 77 diagnostics in modules outside `src/lib/auth/`; the auth directory has 0 diagnostics. This full-project check is not part of the task Verify and its unrelated diagnostics remain unresolved.

## Edge/WAF gate remains open

No Vercel rate-limit rule was configured or published. The global CLI is absent; `npx vercel@latest` runs v65.10.0, but `vercel whoami` exits 1 because this shell is unauthenticated. `.vercel/project.json` is absent and the computer-use browser host is unavailable. A suitable single rule for the FSD target would match POST `/login` and `/lupa-sandi`, use a 60-second fixed window keyed by IP, limit 5 requests, and return 429. Vercel documents one rate-limit rule and 1,000,000 included allowed requests on Hobby; the published rate is $0.50 per million allowed requests after applicable included usage. See [Vercel WAF rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting) and [WAF usage and pricing](https://vercel.com/docs/vercel-firewall/vercel-waf/usage-and-pricing).

Because the rule is not configured and observed on the linked deployment, IP edge protection is unverified. M06-BE-17 remains `[ ]`; this is not full Verify PASS or Owner approval.

### Follow-up access probe (2026-11-03)

The latest Vercel CLI can run ephemerally through npm, but the current shell is not authenticated and this worktree is not linked to a Vercel project. No firewall configuration was read or changed.

```text
VERCEL_CLI=NOT_FOUND
VERCEL_LINK=absent
CLI_VERSION=65.10.0 (via npx vercel@latest)
VERCEL_AUTH=unavailable
WHOAMI_EXIT=1
FIREWALL_HELP_EXIT=0
```

The computer-use probe found no browser access host, so there was no signed-in dashboard session available:

```text
Browsers: Error: The browser access host is unavailable
```

Vercel documents firewall rule management via its CLI, but those commands require an authenticated project context. The account owner must authenticate and link the intended project before the rule can be configured and observed. See [Vercel CLI firewall management](https://vercel.com/changelog/manage-vercel-firewall-in-the-cli) and [WAF rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting).

### WAF draft status (2026-11-03)

The follow-up shell now has an authenticated Vercel session and linked project. Read-only firewall status initially reported `Not configured`. A draft rule was created and inspected; its two OR groups each require `method = POST` and an exact path, and Vercel validated the rule. The user requested that it remain unpublished for now.

Rule configuration:

- Project: `rumakost`
- Conditions: `(POST AND /login) OR (POST AND /lupa-sandi)`
- Rate limit: 5 requests per IP per fixed 60-second window
- Exceeded action: `rate_limit` (429 behavior)
- Draft rule ID: `rule_m06_be_17_auth_login_ip_rate_limit_mQlNi1`
- Rule validation: `valid: true`

Raw CLI output:

```text
Firewall        Not configured
Bypass          Requires Pro or Enterprise
Mitigations     Active
Attack Mode     Off
Bot Protection  Off
AI Bots         Allow
OWASP           Off

M06-BE-17 Auth Login IP Rate Limit [Enabled]
   Limit POST login and password reset to five requests per 60 seconds per IP
   Group 1 (AND): method equals POST; path equals /login
   OR Group 2 (AND): method equals POST; path equals /lupa-sandi
   Action: Rate Limit
   Rate Limit: 5 req / 60s (fixed_window)
   Keys: ip
   If exceeded: rate_limit
Success! Rule "M06-BE-17 Auth Login IP Rate Limit" staged

Pending changes (1):
  + Added rule "M06-BE-17 Auth Login IP Rate Limit"

RULE_INSPECT_EXIT=0
"valid": true
"active": true
"limit": 5
"window": 60
"keys": ["ip"]
"algo": "fixed_window"
```

Publish was attempted with `--yes`, but Vercel required explicit human approval. No publish confirmation command was run; the rule is not live:

```text
"status": "action_required"
"reason": "confirmation_required"
"message": "Can't publish firewall changes for project rumakost without approval."
"userActionRequired": true
"hint": "Show the user what this does (data.effects) and run next[] only after they approve. --yes doesn't approve this command."
"effects": ["Makes 1 draft change live for rumakost immediately."]
FIREWALL_PUBLISH_EXIT=2
```

At the time of this snapshot, M06-BE-17 remained `[ ]`; the WAF draft was staged but unpublished. The later publication and status are recorded below.

### Live WAF publication and task Verify (2026-11-03)

The Owner approved publishing the staged rule. Vercel published it to production, and read-only status plus rule inspection confirmed it is valid and active with the intended conditions and limit. No requests were sent to production to trigger the limit; this verifies the deployed configuration, not an observed 429 response. Neon was not accessed.

Raw Vercel output:

```text
> Success! Firewall config published to production [306ms]
FIREWALL_PUBLISH_EXIT=0

Firewall        Enabled
IP Blocks       0
Rules           1 active, 0 inactive (1 total)
Attack Mode     Off
FIREWALL_STATUS_EXIT=0

"active": true
"valid": true
"conditionGroup": (POST AND /login) OR (POST AND /lupa-sandi)
"rateLimit": {"action":"rate_limit","algo":"fixed_window","keys":["ip"],"limit":5,"window":60}
RULE_INSPECT_EXIT=0

> No pending changes.
FIREWALL_DIFF_EXIT=0
```

Raw task Verify rerun:

```text
# tests 16
# suites 0
# pass 16
# fail 0
# cancelled 0
# skipped 0
# todo 0
EXIT_CODE=0
```

BE-17 Verify is not complete yet. Its M06-DB-57 prerequisite awaits Owner review, and a live 429 was not observed because the linked project has no production deployment or custom domain. Keep M06-BE-17 `[ ]` until those gates are resolved and the Owner reviews the task.

### Production host availability (2026-11-03)

The production project has no deployment or custom domain to send a safe synthetic request to. No POST requests were sent, and no HTTP 429 response was observed.

```text
VERCEL_LIST_EXIT=0
> No deployments found under nothingser0.
PROJECT_PROD_LIST_EXIT=0
> 0 Domains found under nothingser0 [279ms]
```

### Verify M06-BE-17 after M06-DB-57 review (2026-11-03)

M06-DB-57 telah disetujui Owner pada 2026-11-03. Bukti PGlite-nya menguji reservation lima percobaan/60 detik, penolakan percobaan keenam, progressive delay, dan reset setelah login sukses; lihat `docs/pm/evidence/M06-DB-57-VERIFY.md`. Adapter login memanggil fungsi reservation/failure/success database di `src/lib/auth/login-rate-limit.ts`. `next.config.ts` menetapkan `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, serta kebijakan Referrer-Policy. Bukti rule WAF aktif dan valid tetap tercatat di bagian publikasi di atas.

Verify task `npm run test -- auth-security` lulus 16/16. Belum ada deployment/domain production, jadi tidak ada request yang dikirim dan respons HTTP 429 live tidak diamati. Konfigurasi aktif sudah diperiksa; respons runtime tidak diklaim lulus.

Raw output:

```text
> rumakost@0.1.0 test
> node scripts/run-tests.mjs auth-security

TAP version 13
# Subtest: blocks a reserved account before calling the auth provider
ok 1 - blocks a reserved account before calling the auth provider
  ---
  duration_ms: 4.0978
  ...
# Subtest: records failed credentials after reserving an account attempt
ok 2 - records failed credentials after reserving an account attempt
  ---
  duration_ms: 1.9389
  ...
# Subtest: clears progressive failures after successful authentication
ok 3 - clears progressive failures after successful authentication
  ---
  duration_ms: 0.7811
  ...
# Subtest: uses the provider for an unknown app account without storing an identity key
ok 4 - uses the provider for an unknown app account without storing an identity key
  ---
  duration_ms: 0.5114
  ...
# Subtest: fails closed before provider authentication when account lookup fails
ok 5 - fails closed before provider authentication when account lookup fails
  ---
  duration_ms: 0.5035
  ...
# Subtest: fails closed before provider authentication when attempt reservation fails
ok 6 - fails closed before provider authentication when attempt reservation fails
  ---
  duration_ms: 0.5202
  ...
# Subtest: does not record a progressive credential failure when the provider is unavailable
ok 7 - does not record a progressive credential failure when the provider is unavailable
  ---
  duration_ms: 0.4555
  ...
# Subtest: fails closed when an invalid credential cannot update the account limiter
ok 8 - fails closed when an invalid credential cannot update the account limiter
  ---
  duration_ms: 0.4105
  ...
# Subtest: marks a successful provider login for sign-out when the limiter reset fails
ok 9 - marks a successful provider login for sign-out when the limiter reset fails
  ---
  duration_ms: 0.6993
  ...
# Subtest: counts invalid credentials without treating provider outages as password failures
ok 10 - counts invalid credentials without treating provider outages as password failures
  ---
  duration_ms: 0.4553
  ...
# Subtest: requires a serialized same-origin Origin header for auth mutations
ok 11 - requires a serialized same-origin Origin header for auth mutations
  ---
  duration_ms: 2.4227
  ...
# Subtest: rejects malformed configured origins before running an auth mutation
ok 12 - rejects malformed configured origins before running an auth mutation
  ---
  duration_ms: 0.6255
  ...
# Subtest: does not invoke the auth provider for cross-origin or missing-origin mutations
ok 13 - does not invoke the auth provider for cross-origin or missing-origin mutations
  ---
  duration_ms: 1.864
  ...
# Subtest: same-origin requests can invoke the auth provider
ok 14 - same-origin requests can invoke the auth provider
  ---
  duration_ms: 0.6603
  ...
# Subtest: password reset callback remains on APP_ORIGIN despite a hostile returnTo field
ok 15 - password reset callback remains on APP_ORIGIN despite a hostile returnTo field
  ---
  duration_ms: 3.2182
  ...
# Subtest: password reset remains non-enumerating when the provider rejects or throws
ok 16 - password reset remains non-enumerating when the provider rejects or throws
  ---
  duration_ms: 0.9369
  ...
1..16
# tests 16
# suites 0
# pass 16
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 312.0734
EXIT_CODE=0
```

M06-BE-17 Verify lulus sesuai pengujian lokal dan bukti konfigurasi pendukung. Owner menyetujui task pada 2026-11-03. Neon dan production app tidak disentuh.
