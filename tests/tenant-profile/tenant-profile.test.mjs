import assert from "node:assert/strict";
import test from "node:test";
import { ZodError } from "zod";
import { DomainError } from "../../src/lib/errors/domain-error.mjs";
import { updateTenantProfile } from "../../src/lib/tenant-profile/operations.mjs";

const owner = {
  id: "00000000-0000-4000-8000-000000000001",
  role: "OWNER",
  isActive: true,
  mustChangePassword: false,
};
const staff = { ...owner, id: "00000000-0000-4000-8000-000000000002", role: "STAFF" };
const tenant = { ...owner, id: "00000000-0000-4000-8000-000000000003", role: "TENANT" };
const otherTenant = { ...owner, id: "00000000-0000-4000-8000-000000000004", role: "TENANT" };

function createRepository() {
  const calls = [];
  const state = {
    emailNormalized: "tenant@example.test",
    leaseIds: ["40000000-0000-4000-8000-000000000001"],
    profile: {},
    audit: [],
  };
  const repository = {
    calls,
    state,
    async updateTenantProfile(input) {
      calls.push(input);
      const changed = Object.entries(input.changes).some(
        ([field, value]) => state.profile[field] !== value,
      );
      if (changed) {
        Object.assign(state.profile, input.changes);
        state.audit.push(input.safeMetadata);
      }
      return { tenantUserId: input.tenantUserId, changed };
    },
  };
  return repository;
}

function request(tenantUserId, profile) {
  return { tenantUserId, profile };
}

test("Tenant can update only their own profile", async () => {
  const repository = createRepository();
  const result = await updateTenantProfile({
    actor: tenant,
    input: request(tenant.id, { phoneE164: "+628123456789" }),
    repository,
  });

  assert.deepEqual(result, { tenantUserId: tenant.id, changed: true });
  assert.equal(repository.calls.length, 1);
  assert.equal(repository.calls[0].actorId, tenant.id);
  assert.equal(repository.calls[0].tenantUserId, tenant.id);
  assert.equal(repository.state.emailNormalized, "tenant@example.test");
  assert.deepEqual(repository.state.leaseIds, ["40000000-0000-4000-8000-000000000001"]);
});

test("Tenant cannot update another Tenant profile", async () => {
  const repository = createRepository();

  await assert.rejects(
    updateTenantProfile({
      actor: tenant,
      input: request(otherTenant.id, { phoneE164: "+628123456789" }),
      repository,
    }),
    (error) => error instanceof DomainError && error.code === "FORBIDDEN",
  );
  assert.equal(repository.calls.length, 0);
});

test("Owner can update a target Tenant profile", async () => {
  const repository = createRepository();
  const result = await updateTenantProfile({
    actor: owner,
    input: request(tenant.id, { occupation: "Guru" }),
    repository,
  });

  assert.deepEqual(result, { tenantUserId: tenant.id, changed: true });
  assert.equal(repository.calls[0].actorId, owner.id);
  assert.equal(repository.calls[0].actorRole, "OWNER");
});

test("Staff cannot write Tenant profiles", async () => {
  const repository = createRepository();

  await assert.rejects(
    updateTenantProfile({
      actor: staff,
      input: request(tenant.id, { occupation: "Guru" }),
      repository,
    }),
    (error) => error instanceof DomainError && error.code === "FORBIDDEN",
  );
  assert.equal(repository.calls.length, 0);
});

test("inactive or forced-password-change actors cannot update a profile", async () => {
  const repository = createRepository();

  for (const actor of [
    { ...tenant, isActive: false },
    { ...tenant, mustChangePassword: true },
  ]) {
    await assert.rejects(
      updateTenantProfile({
        actor,
        input: request(tenant.id, { occupation: "Guru" }),
        repository,
      }),
      (error) => error instanceof DomainError && error.code === "UNAUTHENTICATED",
    );
  }
  assert.equal(repository.calls.length, 0);
});

test("phone and bounded profile fields follow E.164 and database lengths", async () => {
  const repository = createRepository();
  const cases = [
    { phoneE164: "08123456789" },
    { phoneE164: `+${"1".repeat(16)}` },
    { occupation: "x".repeat(101) },
    { employer: "x".repeat(151) },
    { cityOfOrigin: "x".repeat(101) },
    { emergencyContactName: "x".repeat(101), emergencyContactPhoneE164: "+628123456789" },
    { emergencyContactRelation: "x".repeat(51) },
  ];

  for (const profile of cases) {
    await assert.rejects(
      updateTenantProfile({ actor: tenant, input: request(tenant.id, profile), repository }),
      ZodError,
    );
  }
  assert.equal(repository.calls.length, 0);
});

test("emergency contact name and phone are changed or cleared together", async () => {
  const repository = createRepository();

  for (const profile of [
    { emergencyContactName: "Ibu" },
    { emergencyContactPhoneE164: "+628123456789" },
  ]) {
    await assert.rejects(
      updateTenantProfile({ actor: tenant, input: request(tenant.id, profile), repository }),
      ZodError,
    );
  }

  const result = await updateTenantProfile({
    actor: tenant,
    input: request(tenant.id, {
      emergencyContactName: null,
      emergencyContactPhoneE164: null,
    }),
    repository,
  });

  assert.equal(result.changed, true);
  assert.equal(repository.calls.length, 1);
});

test("profile input rejects email, Lease, and unknown fields", async () => {
  const repository = createRepository();
  const emailBefore = repository.state.emailNormalized;
  const leaseIdsBefore = [...repository.state.leaseIds];

  for (const profile of [
    { email: "tenant@example.test" },
    { leaseId: "40000000-0000-4000-8000-000000000001" },
    { occupation: "Guru", unknown: true },
  ]) {
    await assert.rejects(
      updateTenantProfile({ actor: tenant, input: request(tenant.id, profile), repository }),
      ZodError,
    );
  }
  assert.equal(repository.calls.length, 0);
  assert.equal(repository.state.emailNormalized, emailBefore);
  assert.deepEqual(repository.state.leaseIds, leaseIdsBefore);
});

test("audit metadata contains changed field names without contact values", async () => {
  const repository = createRepository();
  const phoneE164 = "+628123456789";

  await updateTenantProfile({
    actor: tenant,
    input: request(tenant.id, { phoneE164 }),
    repository,
  });
  const retryResult = await updateTenantProfile({
    actor: tenant,
    input: request(tenant.id, { phoneE164 }),
    repository,
  });

  assert.deepEqual(repository.calls[0].safeMetadata, { updatedFields: ["phoneE164"] });
  assert.equal(JSON.stringify(repository.calls[0].safeMetadata).includes(phoneE164), false);
  assert.equal(retryResult.changed, false);
  assert.equal(repository.state.audit.length, 1);
});
