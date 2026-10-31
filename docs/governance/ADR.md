# ADR — RumaKost Architecture Decisions

## ADR-001: Modular monolith and low-cost managed stack

**Date**: 2026-10-30  
**Status**: Accepted for non-commercial portfolio demo  
**Decider**: zeenn  
**Technical spec status**: Draft; final M05 technical review remains pending

### Context

RumaKost is a one-property portfolio demo with seven frozen P0 feature groups, three roles, financial mutations, private ticket media, synthetic data, a zero-cost/no-card constraint, and no production SLA. The project needs relational constraints, private storage, role isolation, and low operations overhead within the owner's chosen stack.

### Decision

Use a modular monolith: Next.js App Router with TypeScript and the approved prototype CSS approach, PostgreSQL with Prisma on Neon Free, Neon Auth and private Object Storage beta, and Vercel Hobby for non-commercial portfolio use. Keep all provider secrets server-side. Use server authorization, ownership checks, database transactions, idempotency, and immutable correction/audit records for sensitive mutations. Do not add a payment gateway, multiple properties, cache, queue, or paid services to MVP.

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
