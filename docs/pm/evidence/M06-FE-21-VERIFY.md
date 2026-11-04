# M06-FE-21 — Verify (2026-11-04)

## Scope

Ported the SCR-01 login screen from `docs/design/screens/WF-01-login.html` into the existing Next.js route. The implementation uses the wireframe's centered split card, image-only left panel, brand and copy, role pills, email/password fields, remember-me row, and orange submit button. The image comes from `public/login-showcase.png`; Poppins is loaded through the installed Next.js font API. Login still submits to the existing server action, and the role picker remains a navigation hint rather than an authorization control.

No test suite, Neon account, migration, or live authentication was run for this UI port.

## Verify output

`npx tsc --noEmit`:

```text
TSC_EXIT=0
```

`npx eslint 'src/app/(auth)/login/page.tsx' 'src/app/(auth)/login/login-form.tsx' 'src/app/layout.tsx'`:

```text
ESLINT_EXIT=0
```

HTTP probe of the running local dev server and the public prototype image:

```text
LOGIN_STATUS=200
HAS_WF_TITLE=True
HAS_IMAGE_REFERENCE=True
HAS_ROLE_LABEL=True
HAS_MARKETING_COPY=False
IMAGE_STATUS=200
IMAGE_TYPE=image/png
```

The HTTP probe confirms the rendered route markup and image resource are available. A browser screenshot/pixel comparison was not captured in this verification; visual review remains pending in the Owner's browser. The task remains open for Owner review.

## Follow-up after Owner screenshot (2026-11-04)

### Findings against the WF-01 source

- `docs/design/screens/WF-01-login.html` sets the page's inherited font weight to `500` and the login input text to `13px` on desktop. The app's global stylesheet had reset body weight to `400` and applied `16px` to every text input. That global selector had greater specificity than `.input`, so the inputs appeared larger than the prototype.
- The login form already used the prototype's `20px` title, `13px` subtitle, `12px` labels, and `14px` submit text. The fix restores page weight `500`, lets the prototype's `13px` input size win on desktop, and retains the design's `16px` minimum for mobile inputs.
- Better Auth's actual invalid-credential error was `status=UNAUTHORIZED`, `statusCode=401`, with no `code`. The mapper recognized numeric `status === 401` and selected code values only, so it returned `unavailable`, which displayed "Belum bisa masuk. Coba lagi sebentar." The mapper now recognizes the provider's status shape and shows the WF-01 invalid-credential message. Service and rate-limit failures still show the temporary-unavailable message.

### Red reproduction before the fix

The temporary reproduction used an unregistered synthetic `.test` email; no real identity was queried or mutated.

```text
2026-11-04T11:25:38.991Z WARN [Better Auth]: User not found
AUTH_ERROR_STATUS=UNAUTHORIZED
AUTH_ERROR_STATUS_CODE=401
AUTH_ERROR_CODE=missing
AUTH_ERROR_CLASSIFIED_AS_CREDENTIAL=false
LOGIN_PIPELINE_RESULT=unavailable
REAL_ACCOUNT_MUTATED=false
EXIT_CODE=0
```

The new assertion was run red before the code fix:

```text
# tests 16
# pass 15
# fail 1
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
false !== true
```

### Verify after the fix

`npm run test -- auth-security`:

```text
✔ counts invalid credentials without treating provider outages as password failures
ℹ tests 16
ℹ suites 0
ℹ pass 16
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 398.1857
EXIT_CODE=0
```

The same synthetic invalid-login reproduction after the fix:

```text
2026-11-04T11:30:39.917Z WARN [Better Auth]: User not found
AUTH_ERROR_STATUS=UNAUTHORIZED
AUTH_ERROR_STATUS_CODE=401
AUTH_ERROR_CODE=missing
AUTH_ERROR_CLASSIFIED_AS_CREDENTIAL=true
LOGIN_PIPELINE_RESULT=invalid
REAL_ACCOUNT_MUTATED=false
EXIT_CODE=0
```

Other task verification:

```text
npx eslint 'src/lib/auth/rate-limited-login.mjs' 'src/lib/auth/actions.ts' 'src/app/(auth)/login/login-form.tsx' 'tests/auth-security/auth-login-rate-limit.test.mjs'
ESLINT_EXIT=0
npx tsc --noEmit
TSC_EXIT=0
LOGIN_HTTP_STATUS=200
LOGIN_PAGE_TITLE_PRESENT=True
```

The temporary reproduction script was removed after use. The task remains `[ ]` for Owner review; the route was not screenshot-tested after hot reload.

The live dev server's emitted CSS was checked after hot reload:

```text
LOGIN_HTTP_STATUS=200
LOGIN_CSS_DESKTOP_INPUT_13PX=true
LOGIN_CSS_MOBILE_INPUT_16PX=true
EXIT_CODE=0
```

The browser-control host was unavailable (`Browsers: Error: The browser access host is unavailable`), so a refreshed screenshot could not be captured. The served CSS assets and route were verified directly instead.

### Follow-up: animated login error and role route clarification — 2026-11-04

The invalid-credential alert now uses the same expand-and-slide pattern as the WF-01 Caps Lock badge. It collapses while the server action is pending so a repeated failed attempt animates again. The `prefers-reduced-motion` rule disables the transitions. Authentication logic and the alert's error copy are unchanged.

```text
npm run test -- auth-security
tests 16
pass 16
fail 0
EXIT_CODE=0

npx eslint 'src/app/(auth)/login/login-form.tsx'
EXIT_CODE=0

npx tsc --noEmit
EXIT_CODE=0

curl.exe -sS -o NUL -w '%{http_code}' http://127.0.0.1:3000/login
LOGIN_HTTP_STATUS=200
EXIT_CODE=0

Compiled CSS: errorSlot/errorVisible rules present; expand/slide transitions present; prefers-reduced-motion disables transitions.
EXIT_CODE=0
```

`npm run dev` was also attempted for the route probe. It found the existing dev server on port 3000 (PID 15740), selected port 3001, and exited with “Another next dev server is already running.” The existing server was left running.

Role routing in the approved sitemap uses `/dashboard` for both Owner and Staff, with content and financial data controlled by the authenticated role; Tenant uses `/portal`. The Owner and Staff source prototypes are separate (`WF-02-dashboard.html` and `WF-02-staf-dashboard.html`). The dashboard UI task M06-FE-25 is still pending, and `src/app/dashboard/page.tsx` is not present yet, so the role-specific dashboard views are not implemented in this checkout. M06-FE-21 remains `[ ]` for Owner review.
