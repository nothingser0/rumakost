const appRoles = ["OWNER", "STAFF", "TENANT"];

export function canManageRole(actorRole, targetRole) {
  if (actorRole === "OWNER") return targetRole === "STAFF" || targetRole === "TENANT";
  return actorRole === "STAFF" && targetRole === "TENANT";
}

export function listVisibleRoles(actorRole) {
  if (actorRole === "OWNER") return ["OWNER", "STAFF", "TENANT"];
  if (actorRole === "STAFF") return ["TENANT"];
  return [];
}

export function validateAccountInput(input, actorRole) {
  const displayName = typeof input.displayName === "string" ? input.displayName.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const role = typeof input.role === "string" ? input.role : "";

  if (displayName.length < 2 || displayName.length > 100) {
    return { success: false, error: "Nama harus berisi 2 sampai 100 karakter." };
  }

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Masukkan alamat email yang valid." };
  }

  if (!appRoles.includes(role) || !canManageRole(actorRole, role)) {
    return { success: false, error: "Anda tidak berwenang membuat akun dengan peran tersebut." };
  }

  return { success: true, data: { displayName, email, role } };
}

export function validateAccountStatusInput(input) {
  const id = typeof input.id === "string" ? input.id.trim() : "";
  const isActive = input.isActive;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return { success: false, error: "Akun tidak ditemukan." };
  }

  if (isActive !== "true" && isActive !== "false") {
    return { success: false, error: "Status akun tidak valid." };
  }

  return { success: true, data: { id, isActive: isActive === "true" } };
}
