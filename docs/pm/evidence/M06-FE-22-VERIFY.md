# M06-FE-22 Verify - Pemulihan kata sandi via email

Tanggal: 2026-11-03
Runtime: Node.js v24.22.2
Database/provider: tidak disentuh; email tidak dikirim.

## Suite `auth-reset-request`

Command: `npm run test -- auth-reset-request`

```text
> rumakost@0.1.0 test
> node scripts/run-tests.mjs auth-reset-request

✔ rejects invalid email input without contacting the provider (3.9779ms)
✔ trims the email and fixes the provider callback to the app reset route (0.3874ms)
✔ returns the same accepted state for known and unknown accounts (0.4017ms)
✔ provider errors do not change the generic response or expose details (0.2784ms)
✔ provider exceptions keep the same generic response (0.3311ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 206.7093
```

## Route probe

Command: GET `/lupa-sandi` and `/login` on local `next dev` using `curl.exe`.

```text
GET /lupa-sandi: 200
FORM_EMAIL_FIELD: True
NO_SIGNUP_CONTROL: True
GET /login: 200
LOGIN_RESET_LINK: True
```

Next.js dev log:

```text
▲ Next.js 16.4.3 (webpack)
- Local:         http://localhost:3000
✓ Ready in 6.6s
GET /lupa-sandi 200 in 58ms (next.js: 6ms, application-code: 52ms)
GET /login 200 in 272ms (next.js: 1.3ms, application-code: 271ms)
GET /lupa-sandi 200 in 293ms (next.js: 163ms, application-code: 130ms)
GET /login 200 in 616ms (next.js: 172ms, application-code: 444ms)
```

The first route-probe client attempt with PowerShell `Invoke-WebRequest` raised a local `NullReferenceException` before producing an HTTP response. The Next.js server logged both routes as 200; the rerun with `curl.exe` produced the results above.

## Scope limits

- Provider interaction is verified with a synthetic stub, not a live Neon Auth reset request. No real or synthetic reset email was sent. Live provider delivery remains in M07 per FSD SEC-02.
- The CUA browser host was unavailable. A headless Edge fallback launch was rejected by the execution policy (`blocked by policy`), so no screenshot or manual visual click-through was captured. The route response and interactive targets were checked by HTTP/source verification.
- Owner approved M06-FE-22 on 2026-11-03 (zeenn). Visual click-through remains unavailable as noted above.
