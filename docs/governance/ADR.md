# ADR — RumaKost Architecture Decisions

## ADR-001: Modular monolith and low-cost managed stack

**Date**: 2026-10-30  
**Status**: Accepted for non-commercial portfolio demo  
**Decider**: zeenn  
**Technical spec status**: Draft; final M05 technical review remains pending

### Context

RumaKost is a one-property portfolio demo with seven frozen P0 feature groups, three roles, financial mutations, private ticket media, synthetic data, a zero-cost/no-card constraint, and no production SLA. The project needs relational constraints, private storage, role isolation, and low operations overhead within the owner's chosen stack.

### Decision

Use a modular monolith: Next.js App Router with TypeScript and the approved prototype CSS approach, PostgreSQL with Prisma on Neon Free, Neon Auth managed and private Object Storage beta, and Vercel Hobby for non-commercial portfolio use. The authentication component is superseded by ADR-003; the database, hosting, and private storage decisions remain in force. Keep all provider secrets server-side. Use server authorization, ownership checks, database transactions, idempotency, and immutable correction/audit records for sensitive mutations. Do not add a payment gateway, multiple properties, cache, queue, or paid services to MVP.

### Alternatives considered

1. **Cloudflare Workers + Neon** — no-card fit was not confirmed, and the Next.js compatibility path adds a runtime/framework translation risk for this project.
2. **Vercel Hobby + Supabase Free** — more integrated managed services, but the documented storage allowance is below the current media forecast and Vercel onboarding still needed direct no-card confirmation at comparison time.
3. **Selected option** — owner confirmed Vercel Hobby signup succeeded without a card and accepted Neon beta for a portfolio demo.

### Consequences

- The service is limited to non-commercial portfolio/demo usage under Vercel Hobby terms.
- Neon Auth and Object Storage are beta dependencies; avoid real personal or financial documents, monitor provider changes, and retain a migration option.
- Free-tier quotas and dormancy mean no uptime SLA. Enforce an internal 4 GB storage cap, fail closed at quota, and never enable paid upgrades.
- Before technical sign-off, pin remaining package versions, verify actual auth/storage setup, document backups and restore limits, resolve open billing/seed/account decisions, and finish the M04 scenario mapping.

## ADR-002: Single-property authorization without multi-tenant RLS

**Date**: 2026-10-30  
**Status**: Accepted as MVP boundary  
**Decider**: zeenn (scope baseline recorded in `docs/pm/SCOPE_STATEMENT.md`)

### Context

MVP is explicitly limited to one property and there is no branch or multi-organization hierarchy. The application nevertheless has Owner, Staff, and Tenant roles, including financial and private ticket data.

### Decision

Use explicit server-side role and resource ownership checks on every Server Action, Route Handler, and data-access operation. Tenant data queries must scope to the authenticated Tenant's active or historical lease/tickets. Staff financial views and Owner-only operations are omitted from server responses, not merely hidden in the UI. Database RLS is N/A for the single-property model; add database isolation if the product later introduces multiple properties or organizations through a scope change.

### Consequences

- M07 must test unauthorized server operations and cross-tenant resource access.
- UI route guards are supplemental and are never the sole access control.
- Multi-property support requires a new ADR and tenant-isolation design before implementation.

## ADR-003: Better Auth self-hosted with Neon PostgreSQL

- **Date:** 2026-11-03
- **Status:** Accepted for M06 implementation; no active identity migration performed
- **Decider:** zeenn

### Context

The managed Neon Auth interface did not provide the scoped runtime account provisioning and target-account email verification required by FSD/M05. The M06-AUTH-03 spike passed 13/13 checks on a disposable Neon PostgreSQL project for invite-only creation, role boundaries, session revocation, and verification primitives. The built-in email-change endpoint remains tied to the current session, so target-account email change still needs an application workflow.

### Decision

Replace Neon Auth managed runtime integration with Better Auth hosted in the Next.js application and backed by the project's Neon PostgreSQL database. Keep Neon PostgreSQL/Prisma, Neon private Object Storage, and Vercel Hobby. Put Better Auth schema changes in the project's Prisma migration chain. Keep application roles in `AppUser`; authorize every account-management operation in server code before invoking provider helpers. Do not give Staff provider-admin rights and do not enable public signup.

Users enter passwords over HTTPS to Better Auth endpoints. Better Auth hashes passwords before persistence; application code must never persist, return, or log raw passwords, verification tokens, or session tokens. Store sessions as server-managed HTTP-only cookies with secure settings for HTTPS. Account activation, password recovery, and target-email verification use a server-side email adapter. The delivery vendor is not selected in this decision; local tests use a fake sender and live delivery remains an M07 acceptance check.

For target-account email change, Owner initiates the request, the new address is verified before the Better Auth user and `AppUser.emailNormalized` are updated, `authSubject` stays stable, and audit metadata excludes email/token values. The built-in self-session change-email route does not satisfy this contract.

### Consequences and limits

- M06-AUTH-05 must replace the runtime adapter and environment contract on a disposable Neon database before the account lifecycle tasks proceed.
- Better Auth does not remove the need for a mail delivery service. No paid provider is added without a separate decision.
- Existing Neon Auth accounts, active branches, deployments, and `.env.local` are not migrated or changed by this decision. Any future migration to an active branch requires its own task and explicit Owner direction.
- M06-BE-18 and M06-AUTH-01 are unblocked from the managed-provider limitation only after M06-AUTH-05; their domain checks, verification, auditing, and failure behavior remain required.

### References

- [Better Auth with PostgreSQL](https://better-auth.com/docs/1.6/adapters/postgresql)
- [Better Auth with Prisma](https://better-auth.com/docs/adapters/prisma)
- [Better Auth Admin plugin](https://better-auth.com/docs/1.6/plugins/admin)
- [Better Auth email flows](https://better-auth.com/docs/concepts/email)
- [Better Auth security and password hashing](https://better-auth.com/docs/1.6/reference/security)
- [Neon Auth architecture and custom-handler boundary](https://neon.com/blog/neon-auth-branchable-identity-in-your-database)
