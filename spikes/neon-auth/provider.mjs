import { Pool } from "@neondatabase/serverless";
import { betterAuth } from "better-auth";
import { getMigrations } from "better-auth/db/migration";
import { admin, magicLink } from "better-auth/plugins";

export function createProvider({ databaseUrl, secret, inbox }) {
  const pool = new Pool({ connectionString: databaseUrl });
  const auth = betterAuth({
    database: pool,
    secret,
    baseURL: "http://localhost:3000",
    emailAndPassword: { enabled: false },
    user: {
      additionalFields: {
        appRole: { type: "string", required: true, input: true },
      },
      changeEmail: {
        enabled: true,
        updateEmailWithoutVerification: false,
        sendChangeEmailConfirmation: async ({ user, newEmail, url, token }) => {
          inbox.push({ kind: "old-email-confirmation", email: user.email, newEmail, url, token });
        },
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url, token }) => {
        inbox.push({ kind: "email-verification", email: user.email, url, token });
      },
    },
    plugins: [
      admin({ defaultRole: "user" }),
      magicLink({
        disableSignUp: true,
        storeToken: "hashed",
        sendMagicLink: async ({ email, url, token }) => {
          inbox.push({ kind: "magic-link", email, url, token });
        },
      }),
    ],
  });

  return { auth, pool };
}

export async function migrateProvider(auth) {
  const migration = await getMigrations(auth.options);
  await migration.runMigrations();
  return {
    createdTables: migration.toBeCreated.map(({ table }) => table),
    addedColumns: migration.toBeAdded.flatMap(({ table, fields }) =>
      Object.keys(fields).map((field) => `${table}.${field}`),
    ),
  };
}
