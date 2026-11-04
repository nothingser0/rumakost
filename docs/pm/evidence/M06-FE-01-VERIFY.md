# Evidence M06-FE-01 — Verify (2026-11-04)

- Verify commands: `npm run build` and `npm run dev`.
- Environment: clean copy used Node v24.22.2 with `.env.local` excluded and synthetic values; it did not connect to Neon. Workspace used `.env.local` through Next's normal loader. At Owner request, a local script set only `BETTER_AUTH_URL`, `APP_ORIGIN`, and a newly generated `BETTER_AUTH_SECRET`; the secret was not displayed or recorded. Workspace shell uses Node v26.13.0, outside the package `24.x` engine requirement.
- Result: after fixing the initial TypeScript errors described below, clean-copy Prisma generation, Next compilation, TypeScript checking, and static generation passed. Workspace dependency repair completed, `npm run dev` reached Ready, and `/login` returned 200 after correcting local Auth values. See the historical failure and final output below.
- Browser hydration check: not run; only an HTTP response check was performed.
- Historical dependency recovery: npm emitted cleanup warnings for unreadable directories, and an intermediate `npm run dev` found a corrupted `effect` file. The package was restored from the clean verification copy at the same lockfile version; current startup result is recorded below.

## Initial workspace failure before Prisma shim recovery (2026-11-04)

At first, the workspace used Node v26.13.0 and npm 11.20.0, outside the repo's Node `24.x` engine range, and the local Prisma shim was missing. The `npm run dev` command failed in `predev` before Next started. After npm re-created the shim, a later run found a corrupted `effect` source file; the package was restored from the clean verification copy before the final successful run.

```text
node --version
v26.13.0
npm --version
11.20.0
npm run dev

> rumakost@0.1.0 predev
> npm run db:generate

> rumakost@0.1.0 db:generate
> prisma generate --config prisma.config.generate.ts

'prisma' is not recognized as an internal or external command,
operable program or batch file.
```

Minimal reproduction:

```text
npm run db:generate

> rumakost@0.1.0 db:generate
> prisma generate --config prisma.config.generate.ts

'prisma' is not recognized as an internal or external command,
operable program or batch file.
```

With Node v24.22.2 and the same workspace dependencies:

```text
v24.22.2

> rumakost@0.1.0 db:generate
> prisma generate --config prisma.config.generate.ts

'prisma' is not recognized as an internal or external command,
operable program or batch file.
EXIT_CODE=1
```

Attempted dependency recovery in the workspace with Node v24.22.2:

```text
v24.22.2
npm error code UNKNOWN
npm error syscall scandir
npm error path D:\Workspace\RumaKost\node_modules\effect\dist\cjs
npm error errno -4094
npm error UNKNOWN: unknown error, scandir 'D:\Workspace\RumaKost\node_modules\effect\dist\cjs'
NPM_CI_EXIT_CODE=-4094
```

## Final clean-copy verification after fixes (2026-11-04)

`npm run build` on the isolated Node v24.22.2 copy completed with exit code 0. The environment used synthetic local values; the build did not connect to Neon.

```text
> rumakost@0.1.0 prebuild
> npm run db:generate

> rumakost@0.1.0 db:generate
> prisma generate --config prisma.config.generate.ts

Loaded Prisma config from prisma.config.generate.ts.
Prisma schema loaded from prisma\schema.prisma.
✔ Generated Prisma Client (7.10.1) to .\src\generated\prisma in 435ms

> rumakost@0.1.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
⚠ Warning: Next.js ignored pnpm-workspace.yaml in C:\Users\zen because it would include your home directory (C:\Users\zen).
 To use this directory, set `turbopack.root` in your Next.js config.

✓ Running next.config.ts took 46ms
- Cache Components enabled
- Partial Prefetching enabled

  Creating an optimized production build ...
✓ Compiled successfully in 1808ms
  Running TypeScript ...
  Finished TypeScript in 4.4s ...
  Collecting page data using 7 workers ...
  Generating static pages using 7 workers (0/12) ...
  Generating static pages using 7 workers (3/12)
  Generating static pages using 7 workers (6/12)
  Generating static pages using 7 workers (9/12)
✓ Generating static pages using 7 workers (12/12) in 1199ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ◐ /aktivasi-sandi
├ ƒ /api/auth/[...path]
├ ƒ /api/media/attachments/[attachmentId]/download-url
├ ƒ /api/media/upload-intents
├ ◐ /login
├ ○ /lupa-sandi
├ ◐ /pengaturan/akun
├ ◐ /portal/profil
├ ◐ /profil
├ ◐ /reset-sandi
└ ◐ /verifikasi-email

ƒ Proxy (Middleware)

○  (Static)             prerendered as static content
◐  (Partial Prerender)  prerendered as static HTML with dynamic server-streamed content
ƒ  (Dynamic)            server-rendered on demand
```

`npm run dev` on the same isolated copy reached Ready. The process was stopped with Ctrl+C after startup confirmation; no browser request was made.

```text
> rumakost@0.1.0 predev
> npm run db:generate

> rumakost@0.1.0 db:generate
> prisma generate --config prisma.config.generate.ts

Loaded Prisma config from prisma.config.generate.ts.
Prisma schema loaded from prisma\schema.prisma.
✔ Generated Prisma Client (7.10.1) to .\src\generated\prisma in 565ms

> rumakost@0.1.0 dev
> next dev --webpack

▲ Next.js 16.4.3 (webpack)
- Local: http://localhost:3000
⚠ Warning: Next.js ignored pnpm-workspace.yaml in C:\Users\zen because it would include your home directory (C:\Users\zen).
✓ Ready in 1103ms
^C
```

## Workspace startup and `.env.local` probe (2026-11-04)

In the workspace, `npm install --ignore-scripts --no-audit --no-fund` returned exit code 0 and recreated `node_modules/.bin/prisma.cmd`. Node reported an engine warning because this shell is v26.13.0 while the project requires `24.x`.

```text
npm install --ignore-scripts --no-audit --no-fund
npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'rumakost@0.1.0',
npm warn EBADENGINE   required: { node: '24.x' },
npm warn EBADENGINE   current: { node: 'v26.13.0', npm: '11.20.0' }
npm warn EBADENGINE }

up to date in 3s
EXIT_CODE=0
```

The owner-provided screenshot of a separate `npm install` run showed `UNKNOWN/-4094` cleanup warnings for stale package directories while also reporting packages added/changed. No `.env.local` contents were inspected.

A later owner-provided `npm install` screenshot returned to the PowerShell prompt after `up to date, audited 317 packages in 7s`. It showed warnings for Node v26 versus the required v24 engine, blocked Prisma lifecycle scripts, and an npm audit report of 15 vulnerabilities. These warnings did not stop npm from completing the install; they are separate from the `/login` environment-validation error below.

The workspace `npm run dev` then generated Prisma Client and reached Ready. Next explicitly reported `.env.local` loaded; the private Network address is redacted.

```text
> rumakost@0.1.0 predev
> npm run db:generate

> rumakost@0.1.0 db:generate
> prisma generate --config prisma.config.generate.ts

Loaded Prisma config from prisma.config.generate.ts.
Prisma schema loaded from prisma\schema.prisma.
✔ Generated Prisma Client (7.10.1) to .\src\generated\prisma in 513ms

> rumakost@0.1.0 dev
> next dev --webpack

▲ Next.js 16.4.3 (webpack)
- Local: http://localhost:3000
- Network: [redacted]
- Environments: .env.local
✓ Ready in 1006ms
✓ Running next.config.ts took 203ms
```

Initial HTTP smoke results before fixing the Auth variables:

```text
GET /       -> 307 (redirects to /login)
GET /login  -> 500
```

The server error names only the variables that failed validation; secret values were not printed or read:

```text
Error: Invalid server environment variables: BETTER_AUTH_SECRET, BETTER_AUTH_URL
    at parseEnvironment (src\lib\env.ts:96:9)
    at getAuthEnv (src\lib\env.ts:102:10)
```

`src/lib/env.ts` requires `BETTER_AUTH_SECRET` to be at least 32 characters and requires `BETTER_AUTH_URL` to be a valid application origin matching `APP_ORIGIN`. For local development, `.env.example` and `RUNBOOK_LOCAL.md` specify `http://localhost:3000` for both origins.

After setting those local origins, writing a new random 32-byte secret without displaying its value, restoring the locked `effect@3.20.0` package from the clean verification copy, and restarting `npm run dev`, the route probe passed:

```text
> npm run dev
✔ Generated Prisma Client (7.10.1) to .\src\generated\prisma in 622ms
▲ Next.js 16.4.3 (webpack)
- Local: http://localhost:3000
- Environments: .env.local
✓ Ready in 3.7s

GET /login -> 200 10.250304s
```

## Initial clean-copy build output before fixes

The first clean-copy build found 77 TypeScript errors across backend source files. Those errors were fixed in the current working tree; this output is retained as the original discovery record.

````text
> rumakost@0.1.0 prebuild
> npm run db:generate


> rumakost@0.1.0 db:generate
> prisma generate --config prisma.config.generate.ts

Loaded Prisma config from prisma.config.generate.ts.

Prisma schema loaded from prisma\schema.prisma.

✔ Generated Prisma Client (7.10.1) to .\src\generated\prisma in 565ms


> rumakost@0.1.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
⚠ Warning: Next.js ignored pnpm-workspace.yaml in C:\Users\zen because it would include your home directory (C:\Users\zen).
 To use this directory, set `turbopack.root` in your Next.js config.

✓ Running next.config.ts took 160ms
- Cache Components enabled
- Partial Prefetching enabled

  Creating an optimized production build ...
✓ Compiled successfully in 1609ms
  Running TypeScript ...
src/actions/activity.ts(41,7): error TS2322: Type 'AuthAppUser | null' is not assignable to type 'ActivityActor'.
  Type 'null' is not assignable to type 'ActivityActor'.
src/actions/dashboard.ts(42,7): error TS2322: Type 'AuthAppUser | null' is not assignable to type 'DashboardActor'.
  Type 'null' is not assignable to type 'DashboardActor'.
src/actions/dashboard.ts(45,26): error TS18047: 'access.user' is possibly 'null'.
src/actions/expenses.ts(63,7): error TS2322: Type 'AuthAppUser | null' is not assignable to type 'ExpenseActor'.
  Type 'null' is not assignable to type 'ExpenseActor'.
src/actions/expenses.ts(82,7): error TS2322: Type 'AuthAppUser | null' is not assignable to type 'ExpenseActor'.
  Type 'null' is not assignable to type 'ExpenseActor'.
src/actions/floors.ts(53,7): error TS2322: Type 'unknown' is not assignable to type '{} | undefined'.
src/actions/invoices.ts(68,13): error TS18047: 'access.user' is possibly 'null'.
src/actions/invoices.ts(69,15): error TS18047: 'access.user' is possibly 'null'.
src/actions/invoices.ts(70,19): error TS18047: 'access.user' is possibly 'null'.
src/actions/invoices.ts(71,29): error TS18047: 'access.user' is possibly 'null'.
src/actions/invoices.ts(95,15): error TS18047: 'access.user' is possibly 'null'.
src/actions/invoices.ts(96,17): error TS18047: 'access.user' is possibly 'null'.
src/actions/invoices.ts(97,21): error TS18047: 'access.user' is possibly 'null'.
src/actions/invoices.ts(98,31): error TS18047: 'access.user' is possibly 'null'.
src/actions/invoices.ts(120,15): error TS18047: 'access.user' is possibly 'null'.
src/actions/invoices.ts(121,17): error TS18047: 'access.user' is possibly 'null'.
src/actions/invoices.ts(122,21): error TS18047: 'access.user' is possibly 'null'.
src/actions/invoices.ts(123,31): error TS18047: 'access.user' is possibly 'null'.
src/actions/invoices.ts(143,13): error TS18047: 'access.user' is possibly 'null'.
src/actions/invoices.ts(144,15): error TS18047: 'access.user' is possibly 'null'.
src/actions/invoices.ts(145,19): error TS18047: 'access.user' is possibly 'null'.
src/actions/invoices.ts(146,29): error TS18047: 'access.user' is possibly 'null'.
src/actions/invoices.ts(172,13): error TS18047: 'access.user' is possibly 'null'.
src/actions/invoices.ts(173,15): error TS18047: 'access.user' is possibly 'null'.
src/actions/invoices.ts(174,19): error TS18047: 'access.user' is possibly 'null'.
src/actions/invoices.ts(175,29): error TS18047: 'access.user' is possibly 'null'.
src/actions/payments.ts(70,13): error TS18047: 'access.user' is possibly 'null'.
src/actions/payments.ts(71,15): error TS18047: 'access.user' is possibly 'null'.
src/actions/payments.ts(72,19): error TS18047: 'access.user' is possibly 'null'.
src/actions/payments.ts(73,29): error TS18047: 'access.user' is possibly 'null'.
src/actions/payments.ts(94,13): error TS18047: 'access.user' is possibly 'null'.
src/actions/payments.ts(95,15): error TS18047: 'access.user' is possibly 'null'.
src/actions/payments.ts(96,19): error TS18047: 'access.user' is possibly 'null'.
src/actions/payments.ts(97,29): error TS18047: 'access.user' is possibly 'null'.
src/actions/payments.ts(118,13): error TS18047: 'access.user' is possibly 'null'.
src/actions/payments.ts(119,15): error TS18047: 'access.user' is possibly 'null'.
src/actions/payments.ts(120,19): error TS18047: 'access.user' is possibly 'null'.
src/actions/payments.ts(121,29): error TS18047: 'access.user' is possibly 'null'.
src/actions/payments.ts(142,13): error TS18047: 'access.user' is possibly 'null'.
src/actions/payments.ts(143,15): error TS18047: 'access.user' is possibly 'null'.
src/actions/payments.ts(144,19): error TS18047: 'access.user' is possibly 'null'.
src/actions/payments.ts(145,29): error TS18047: 'access.user' is possibly 'null'.
src/actions/reports.ts(51,7): error TS2322: Type 'AuthAppUser | null' is not assignable to type 'ReportActor'.
  Type 'null' is not assignable to type 'ReportActor'.
src/actions/reports.ts(71,7): error TS2322: Type 'AuthAppUser | null' is not assignable to type 'ReportActor'.
  Type 'null' is not assignable to type 'ReportActor'.
src/actions/rooms.ts(54,7): error TS2322: Type 'unknown' is not assignable to type '{} | undefined'.
src/actions/tenant-profile.ts(46,20): error TS18047: 'access.user' is possibly 'null'.
src/actions/tickets.ts(62,13): error TS18047: 'access.user' is possibly 'null'.
src/actions/tickets.ts(63,15): error TS18047: 'access.user' is possibly 'null'.
src/actions/tickets.ts(64,19): error TS18047: 'access.user' is possibly 'null'.
src/actions/tickets.ts(65,29): error TS18047: 'access.user' is possibly 'null'.
src/lib/auth/password-actions.ts(52,38): error TS2339: Property 'status' does not exist on type '{ token: string | null; user: { id: string; createdAt: Date; updatedAt: Date; email: string; emailVerified: boolean; name: string; image?: string | null | undefined; } & Record<string, any> & { ...; }; }'.
src/lib/authorization/server.ts(21,16): error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.
  Type 'null' is not assignable to type 'string'.
src/lib/authorization/server.ts(24,16): error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.
  Type 'null' is not assignable to type 'string'.
src/lib/authorization/server.ts(27,16): error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.
  Type 'null' is not assignable to type 'string'.
src/lib/authorization/server.ts(48,42): error TS2345: Argument of type '{ roles: AppRole[]; resourceOwnerAppUserId?: string | undefined; requiresResourceOwnership?: boolean | undefined; allowForcedPasswordChange?: boolean | undefined; }' is not assignable to parameter of type '{ roles: any; resourceOwnerAppUserId: any; requiresResourceOwnership?: boolean | undefined; allowForcedPasswordChange?: boolean | undefined; }'.
  Property 'resourceOwnerAppUserId' is optional in type '{ roles: AppRole[]; resourceOwnerAppUserId?: string | undefined; requiresResourceOwnership?: boolean | undefined; allowForcedPasswordChange?: boolean | undefined; }' but required in type '{ roles: any; resourceOwnerAppUserId: any; requiresResourceOwnership?: boolean | undefined; allowForcedPasswordChange?: boolean | undefined; }'.
src/lib/billing/invoice-generation-repository.ts(255,45): error TS2339: Property 'lineCount' does not exist on type '{ eligibleCount: number; createdCount: number; duplicateCount: number; skippedCount: number; auditCount: number; }'.
src/lib/deposits/repository.ts(570,26): error TS2737: BigInt literals are not available when targeting lower than ES2020.
src/lib/payments/ledger-repository.ts(703,26): error TS2737: BigInt literals are not available when targeting lower than ES2020.
src/lib/payments/ledger-repository.ts(783,40): error TS2737: BigInt literals are not available when targeting lower than ES2020.
src/lib/payments/ledger-repository.ts(837,11): error TS2322: Type 'NeonQueryPromise<boolean, boolean, Record<string, any>[] | any[][] | FullQueryResults<boolean>>' is not assignable to type 'NeonQueryPromise<false, false, any>'.
  Types of property 'opts' are incompatible.
    Type 'HTTPQueryOptions<boolean, boolean> | undefined' is not assignable to type 'HTTPQueryOptions<false, false> | undefined'.
      Type 'HTTPQueryOptions<boolean, boolean>' is not assignable to type 'HTTPQueryOptions<false, false>'.
        Type 'boolean' is not assignable to type 'false'.
src/lib/payments/ledger-repository.ts(837,29): error TS2345: Argument of type 'NeonQueryFunction<false, false>' is not assignable to parameter of type 'NeonQueryFunction<boolean, boolean>'.
  Types of property 'transaction' are incompatible.
    Type '<ArrayModeOverride extends boolean = false, FullResultsOverride extends boolean = false>(queriesOrFn: NeonQueryPromise<false, false, any>[] | ((sql: NeonQueryFunctionInTransaction<ArrayModeOverride, FullResultsOverride>) => NeonQueryInTransaction[]), opts?: HTTPTransactionOptions<...> | undefined) => Promise<...>' is not assignable to type '<ArrayModeOverride extends boolean = boolean, FullResultsOverride extends boolean = boolean>(queriesOrFn: NeonQueryPromise<boolean, boolean, any>[] | ((sql: NeonQueryFunctionInTransaction<ArrayModeOverride, FullResultsOverride>) => NeonQueryInTransaction[]), opts?: HTTPTransactionOptions<...> | undefined) => Promise...'.
      Types of parameters 'queriesOrFn' and 'queriesOrFn' are incompatible.
        Type '((sql: NeonQueryFunctionInTransaction<any, any>) => NeonQueryInTransaction[]) | NeonQueryPromise<boolean, boolean, any>[]' is not assignable to type 'NeonQueryPromise<false, false, any>[] | ((sql: NeonQueryFunctionInTransaction<any, any>) => NeonQueryInTransaction[])'.
          Type 'NeonQueryPromise<boolean, boolean, any>[]' is not assignable to type 'NeonQueryPromise<false, false, any>[] | ((sql: NeonQueryFunctionInTransaction<any, any>) => NeonQueryInTransaction[])'.
            Type 'NeonQueryPromise<boolean, boolean, any>[]' is not assignable to type 'NeonQueryPromise<false, false, any>[]'.
              Type 'NeonQueryPromise<boolean, boolean, any>' is not assignable to type 'NeonQueryPromise<false, false, any>'.
                Types of property 'opts' are incompatible.
                  Type 'HTTPQueryOptions<boolean, boolean> | undefined' is not assignable to type 'HTTPQueryOptions<false, false> | undefined'.
                    Type 'HTTPQueryOptions<boolean, boolean>' is not assignable to type 'HTTPQueryOptions<false, false>'.
                      Type 'boolean' is not assignable to type 'false'.
src/lib/payments/ledger-repository.ts(838,11): error TS2322: Type 'NeonQueryPromise<false, false, Record<string, any>[]> | NeonQueryPromise<boolean, boolean, Record<string, any>[] | any[][] | FullQueryResults<boolean>>' is not assignable to type 'NeonQueryPromise<false, false, any>'.
  Type 'NeonQueryPromise<boolean, boolean, Record<string, any>[] | any[][] | FullQueryResults<boolean>>' is not assignable to type 'NeonQueryPromise<false, false, any>'.
    Types of property 'opts' are incompatible.
      Type 'HTTPQueryOptions<boolean, boolean> | undefined' is not assignable to type 'HTTPQueryOptions<false, false> | undefined'.
        Type 'HTTPQueryOptions<boolean, boolean>' is not assignable to type 'HTTPQueryOptions<false, false>'.
          Type 'boolean' is not assignable to type 'false'.
src/lib/payments/ledger-repository.ts(841,11): error TS2322: Type 'NeonQueryPromise<false, false, Record<string, any>[]> | NeonQueryPromise<boolean, boolean, Record<string, any>[] | any[][] | FullQueryResults<boolean>>' is not assignable to type 'NeonQueryPromise<false, false, any>'.
  Type 'NeonQueryPromise<boolean, boolean, Record<string, any>[] | any[][] | FullQueryResults<boolean>>' is not assignable to type 'NeonQueryPromise<false, false, any>'.
    Types of property 'opts' are incompatible.
      Type 'HTTPQueryOptions<boolean, boolean> | undefined' is not assignable to type 'HTTPQueryOptions<false, false> | undefined'.
        Type 'HTTPQueryOptions<boolean, boolean>' is not assignable to type 'HTTPQueryOptions<false, false>'.
          Type 'boolean' is not assignable to type 'false'.
src/lib/payments/ledger-repository.ts(844,11): error TS2322: Type 'NeonQueryPromise<false, false, Record<string, any>[]> | NeonQueryPromise<boolean, boolean, Record<string, any>[] | any[][] | FullQueryResults<boolean>>' is not assignable to type 'NeonQueryPromise<false, false, any>'.
  Type 'NeonQueryPromise<boolean, boolean, Record<string, any>[] | any[][] | FullQueryResults<boolean>>' is not assignable to type 'NeonQueryPromise<false, false, any>'.
    Types of property 'opts' are incompatible.
      Type 'HTTPQueryOptions<boolean, boolean> | undefined' is not assignable to type 'HTTPQueryOptions<false, false> | undefined'.
        Type 'HTTPQueryOptions<boolean, boolean>' is not assignable to type 'HTTPQueryOptions<false, false>'.
          Type 'boolean' is not assignable to type 'false'.
src/lib/payments/ledger-repository.ts(852,11): error TS2322: Type 'NeonQueryPromise<false, false, Record<string, any>[]> | NeonQueryPromise<boolean, boolean, Record<string, any>[] | any[][] | FullQueryResults<boolean>>' is not assignable to type 'NeonQueryPromise<false, false, any>'.
  Type 'NeonQueryPromise<boolean, boolean, Record<string, any>[] | any[][] | FullQueryResults<boolean>>' is not assignable to type 'NeonQueryPromise<false, false, any>'.
    Types of property 'opts' are incompatible.
      Type 'HTTPQueryOptions<boolean, boolean> | undefined' is not assignable to type 'HTTPQueryOptions<false, false> | undefined'.
        Type 'HTTPQueryOptions<boolean, boolean>' is not assignable to type 'HTTPQueryOptions<false, false>'.
          Type 'boolean' is not assignable to type 'false'.
src/lib/payments/ledger-repository.ts(885,11): error TS2322: Type 'NeonQueryPromise<boolean, boolean, Record<string, any>[] | any[][] | FullQueryResults<boolean>>' is not assignable to type 'NeonQueryPromise<false, false, any>'.
  Types of property 'opts' are incompatible.
    Type 'HTTPQueryOptions<boolean, boolean> | undefined' is not assignable to type 'HTTPQueryOptions<false, false> | undefined'.
      Type 'HTTPQueryOptions<boolean, boolean>' is not assignable to type 'HTTPQueryOptions<false, false>'.
        Type 'boolean' is not assignable to type 'false'.
src/lib/payments/ledger-repository.ts(885,29): error TS2345: Argument of type 'NeonQueryFunction<false, false>' is not assignable to parameter of type 'NeonQueryFunction<boolean, boolean>'.
  Types of property 'transaction' are incompatible.
    Type '<ArrayModeOverride extends boolean = false, FullResultsOverride extends boolean = false>(queriesOrFn: NeonQueryPromise<false, false, any>[] | ((sql: NeonQueryFunctionInTransaction<ArrayModeOverride, FullResultsOverride>) => NeonQueryInTransaction[]), opts?: HTTPTransactionOptions<...> | undefined) => Promise<...>' is not assignable to type '<ArrayModeOverride extends boolean = boolean, FullResultsOverride extends boolean = boolean>(queriesOrFn: NeonQueryPromise<boolean, boolean, any>[] | ((sql: NeonQueryFunctionInTransaction<ArrayModeOverride, FullResultsOverride>) => NeonQueryInTransaction[]), opts?: HTTPTransactionOptions<...> | undefined) => Promise...'.
      Types of parameters 'queriesOrFn' and 'queriesOrFn' are incompatible.
        Type '((sql: NeonQueryFunctionInTransaction<any, any>) => NeonQueryInTransaction[]) | NeonQueryPromise<boolean, boolean, any>[]' is not assignable to type 'NeonQueryPromise<false, false, any>[] | ((sql: NeonQueryFunctionInTransaction<any, any>) => NeonQueryInTransaction[])'.
          Type 'NeonQueryPromise<boolean, boolean, any>[]' is not assignable to type 'NeonQueryPromise<false, false, any>[] | ((sql: NeonQueryFunctionInTransaction<any, any>) => NeonQueryInTransaction[])'.
            Type 'NeonQueryPromise<boolean, boolean, any>[]' is not assignable to type 'NeonQueryPromise<false, false, any>[]'.
              Type 'NeonQueryPromise<boolean, boolean, any>' is not assignable to type 'NeonQueryPromise<false, false, any>'.
                Types of property 'opts' are incompatible.
                  Type 'HTTPQueryOptions<boolean, boolean> | undefined' is not assignable to type 'HTTPQueryOptions<false, false> | undefined'.
                    Type 'HTTPQueryOptions<boolean, boolean>' is not assignable to type 'HTTPQueryOptions<false, false>'.
                      Type 'boolean' is not assignable to type 'false'.
src/lib/payments/ledger-repository.ts(886,11): error TS2322: Type 'NeonQueryPromise<false, false, Record<string, any>[]> | NeonQueryPromise<boolean, boolean, Record<string, any>[] | any[][] | FullQueryResults<boolean>>' is not assignable to type 'NeonQueryPromise<false, false, any>'.
  Type 'NeonQueryPromise<boolean, boolean, Record<string, any>[] | any[][] | FullQueryResults<boolean>>' is not assignable to type 'NeonQueryPromise<false, false, any>'.
    Types of property 'opts' are incompatible.
      Type 'HTTPQueryOptions<boolean, boolean> | undefined' is not assignable to type 'HTTPQueryOptions<false, false> | undefined'.
        Type 'HTTPQueryOptions<boolean, boolean>' is not assignable to type 'HTTPQueryOptions<false, false>'.
          Type 'boolean' is not assignable to type 'false'.
src/lib/payments/ledger-repository.ts(920,11): error TS2322: Type 'NeonQueryPromise<boolean, boolean, Record<string, any>[] | any[][] | FullQueryResults<boolean>>' is not assignable to type 'NeonQueryPromise<false, false, any>'.
  Types of property 'opts' are incompatible.
    Type 'HTTPQueryOptions<boolean, boolean> | undefined' is not assignable to type 'HTTPQueryOptions<false, false> | undefined'.
      Type 'HTTPQueryOptions<boolean, boolean>' is not assignable to type 'HTTPQueryOptions<false, false>'.
        Type 'boolean' is not assignable to type 'false'.
src/lib/payments/ledger-repository.ts(920,29): error TS2345: Argument of type 'NeonQueryFunction<false, false>' is not assignable to parameter of type 'NeonQueryFunction<boolean, boolean>'.
  Types of property 'transaction' are incompatible.
    Type '<ArrayModeOverride extends boolean = false, FullResultsOverride extends boolean = false>(queriesOrFn: NeonQueryPromise<false, false, any>[] | ((sql: NeonQueryFunctionInTransaction<ArrayModeOverride, FullResultsOverride>) => NeonQueryInTransaction[]), opts?: HTTPTransactionOptions<...> | undefined) => Promise<...>' is not assignable to type '<ArrayModeOverride extends boolean = boolean, FullResultsOverride extends boolean = boolean>(queriesOrFn: NeonQueryPromise<boolean, boolean, any>[] | ((sql: NeonQueryFunctionInTransaction<ArrayModeOverride, FullResultsOverride>) => NeonQueryInTransaction[]), opts?: HTTPTransactionOptions<...> | undefined) => Promise...'.
      Types of parameters 'queriesOrFn' and 'queriesOrFn' are incompatible.
        Type '((sql: NeonQueryFunctionInTransaction<any, any>) => NeonQueryInTransaction[]) | NeonQueryPromise<boolean, boolean, any>[]' is not assignable to type 'NeonQueryPromise<false, false, any>[] | ((sql: NeonQueryFunctionInTransaction<any, any>) => NeonQueryInTransaction[])'.
          Type 'NeonQueryPromise<boolean, boolean, any>[]' is not assignable to type 'NeonQueryPromise<false, false, any>[] | ((sql: NeonQueryFunctionInTransaction<any, any>) => NeonQueryInTransaction[])'.
            Type 'NeonQueryPromise<boolean, boolean, any>[]' is not assignable to type 'NeonQueryPromise<false, false, any>[]'.
              Type 'NeonQueryPromise<boolean, boolean, any>' is not assignable to type 'NeonQueryPromise<false, false, any>'.
                Types of property 'opts' are incompatible.
                  Type 'HTTPQueryOptions<boolean, boolean> | undefined' is not assignable to type 'HTTPQueryOptions<false, false> | undefined'.
                    Type 'HTTPQueryOptions<boolean, boolean>' is not assignable to type 'HTTPQueryOptions<false, false>'.
                      Type 'boolean' is not assignable to type 'false'.
src/lib/payments/ledger-repository.ts(921,11): error TS2322: Type 'NeonQueryPromise<false, false, Record<string, any>[]> | NeonQueryPromise<boolean, boolean, Record<string, any>[] | any[][] | FullQueryResults<boolean>>' is not assignable to type 'NeonQueryPromise<false, false, any>'.
  Type 'NeonQueryPromise<boolean, boolean, Record<string, any>[] | any[][] | FullQueryResults<boolean>>' is not assignable to type 'NeonQueryPromise<false, false, any>'.
    Types of property 'opts' are incompatible.
      Type 'HTTPQueryOptions<boolean, boolean> | undefined' is not assignable to type 'HTTPQueryOptions<false, false> | undefined'.
        Type 'HTTPQueryOptions<boolean, boolean>' is not assignable to type 'HTTPQueryOptions<false, false>'.
          Type 'boolean' is not assignable to type 'false'.
src/lib/payments/repository.ts(284,26): error TS2737: BigInt literals are not available when targeting lower than ES2020.
src/lib/payments/repository.ts(348,3): error TS2739: Type '{ recordPayment(input: RecordPaymentRepositoryInput): Promise<PaymentRecord>; }' is missing the following properties from type 'PaymentRepository': verifyPayment, rejectPayment, reversePayment
src/lib/tickets/repository.ts(561,28): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'unknown[][]'.
  Type 'unknown' is not assignable to type 'unknown[]'.
src/lib/tickets/repository.ts(701,51): error TS2345: Argument of type 'unknown[]' is not assignable to parameter of type 'unknown[][]'.
  Type 'unknown' is not assignable to type 'unknown[]'.
src/lib/tickets/repository.ts(1101,6): error TS2552: Cannot find name 'operation'. Did you mean 'Option'?
src/lib/tickets/repository.ts(1101,43): error TS2552: Cannot find name 'operation'. Did you mean 'Option'?
Failed to type check.


````
