export function createTenantProfileAuditMetadata(changes) {
  return { updatedFields: Object.keys(changes).sort() };
}
