import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFileSync(resolve(projectRoot, path), "utf8");
const task = (id) => {
  const row = read("TODO.md").split(/\r?\n/).find((line) => line.includes(`| ${id} |`));
  assert.ok(row, `TODO row exists for ${id}`);
  return row;
};

test("selected Better Auth architecture is reflected in the active contracts", () => {
  assert.match(read("docs/governance/ADR.md"), /ADR-003: Better Auth self-hosted with Neon PostgreSQL/);
  assert.match(read("docs/specs/FSD.md"), /Better Auth runs in the application and stores identity\/session records in the same Neon PostgreSQL database/);
  assert.match(read("docs/specs/PRD.md"), /alur Better Auth yang dikendalikan aplikasi/);
  assert.match(read("docs/architecture/M05-DATA-API-SPEC-DRAFT.md"), /authSubject.*ID user Better Auth/);
  assert.match(read("docs/pm/SCOPE_STATEMENT.md"), /CR-2026-003 mengganti runtime Auth .*Better Auth self-hosted pada Neon PostgreSQL/);
  assert.match(read("docs/pm/SCOPE_STATEMENT.md"), /Scope-P0-Count: 7/);
  assert.match(read("ARCHITECTURE.md"), /Better Auth yang berjalan di aplikasi dengan tabel identitas\/sesi di Neon PostgreSQL/);
  assert.match(read("docs/architecture/M06-AUTH-ARCHITECTURE-REVIEW.md"), /Owner memilih Better Auth self-hosted pada Neon PostgreSQL/);
  const projectState = read("docs/pm/PROJECT_STATE.md");
  assert.match(projectState, /Better Auth with PostgreSQL\/Prisma on Neon Free/);
  assert.doesNotMatch(projectState, /task berikutnya adalah pemasangan harness root/);
});

test("password, email, and provider boundaries remain explicit", () => {
  const fsd = read("docs/specs/FSD.md");
  const adr = read("docs/governance/ADR.md");
  const dataApi = read("docs/architecture/M05-DATA-API-SPEC-DRAFT.md");

  assert.match(fsd, /Passwords reach the Better Auth application endpoint over HTTPS and are hashed by Better Auth/);
  assert.match(fsd, /delivery vendor remains unselected/);
  assert.match(dataApi, /Alamat baru diverifikasi sebelum identitas Better Auth/);
  assert.match(adr, /The delivery vendor is not selected in this decision/);
  assert.match(adr, /Existing Neon Auth accounts, active branches, deployments, and `\.env\.local` are not migrated/);
  assert.match(read("RUNBOOK_LOCAL.md"), /Bagian Auth di bawah ini hanya catatan implementasi lama/);
  assert.match(read(".env.example"), /M06-AUTH-05 akan menggantinya dengan BETTER_AUTH_URL dan BETTER_AUTH_SECRET/);
});

test("Auth migration gates the remaining dependent BE tasks", () => {
  const auth05 = task("M06-AUTH-05");
  const accountLifecycle = task("M06-BE-18");
  const emailChange = task("M06-AUTH-01");
  const audit = task("M06-BE-13");
  const dashboard = task("M06-BE-15");

  assert.match(auth05, /M06-AUTH-04/);
  assert.match(accountLifecycle, /M06-AUTH-05/);
  assert.match(emailChange, /M06-AUTH-05/);
  assert.doesNotMatch(accountLifecycle, /BLOCKED/);
  assert.doesNotMatch(emailChange, /BLOCKED/);
  assert.match(audit, /M06-BE-01–12\/16\/18/);
  assert.match(audit, /M06-AUTH-01/);
  assert.match(audit, /M06-AUTH-05/);
  assert.match(dashboard, /M06-BE-10\/11\/13\/14/);
});
