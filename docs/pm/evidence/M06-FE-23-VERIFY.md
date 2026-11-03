# M06-FE-23 Verify - Penyelesaian reset kata sandi

Tanggal: 2026-11-03
Runtime: Node.js v24.22.2
Provider/database: tidak disentuh; tidak ada email reset dikirim.

## Suite `auth-reset-completion`

Command: `npm run test -- auth-reset-completion`

```text
> rumakost@0.1.0 test
> node scripts/run-tests.mjs auth-reset-completion

✔ rejects missing or malformed reset input without contacting the provider (5.0406ms)
✔ rejects short, long, or mismatched new passwords before provider access (0.6778ms)
✔ uses the provider token and reports success only after provider confirmation (0.3393ms)
✔ an invalid or expired provider token leaves the account unchanged (0.3255ms)
✔ provider rejection and exceptions never expose provider details (0.6472ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 261.4816
```

## Route probe

Command: GET `/reset-sandi` on local `next dev` using `curl.exe`. The token values below are synthetic fixtures.

```text
GET /reset-sandi: 200
MISSING_TOKEN_GENERIC_STATE: True
MISSING_TOKEN_DOES_NOT_RENDER_PASSWORD_FIELDS: True
RESET_PAGE_REFERRER_POLICY_NO_REFERRER: True
GET /reset-sandi?token=<synthetic>: 200
TOKEN_FORM_HAS_NEW_PASSWORD: True
TOKEN_FORM_HAS_CONFIRM_PASSWORD: True
GET /reset-sandi?token=<synthetic>&error=INVALID_TOKEN: 200
ERROR_QUERY_REJECTS_TOKEN: True
```

Next.js dev log:

```text
GET /reset-sandi 200 in 455ms (next.js: 246ms, application-code: 209ms)
GET /reset-sandi?token=synthetic-reset-token 200 in 111ms (next.js: 3ms, application-code: 108ms)
GET /reset-sandi?token=synthetic-reset-token&error=INVALID_TOKEN 200 in 92ms (next.js: 1.6ms, application-code: 90ms)
```

## Scope and limits

- Server Action validates token presence, new-password length (8–128), and confirmation before invoking the installed Neon Auth server method `auth.resetPassword({ token, newPassword })`. UI state contains only `idle`, `invalid`, `failed`, or `success`; provider errors, token, and password are not returned in action state.
- The fake-provider test models an invalid/expired token as provider rejection and confirms the synthetic account password stays unchanged. It does not claim a live Neon Auth account mutation was exercised.
- Supplementary project TypeScript diagnostic (Node.js v24.22.2): `npm run typecheck` exited 2 with 79 project errors; the changed FE-23 TypeScript files had 0 errors. The project errors are outside the FE-23 files and are not treated as this task's Verify gate.
- No Neon Auth request, database query, or email delivery was performed. Live reset delivery, provider token behavior, and account/session effects remain for M07.
- Visual browser click-through was not captured. This Verify covers the specified local route and server-side provider contract with synthetic fixtures.
- Approved: 2026-11-03 by zeenn. The task-specific Verify criteria pass; the supplementary project-wide TypeScript diagnostic remains documented above and is outside this task's Verify gate.
