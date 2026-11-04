import { randomBytes, randomUUID } from "node:crypto";
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import nextEnv from "@next/env";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { handleAuthMutation } from "../src/lib/auth/auth-route.mjs";
import { createBetterAuth } from "../src/lib/auth/provider.mjs";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const targetBranch = "dev";
const targetDatabase = "neondb";
const allowedProjectIdPattern = /^[a-z0-9-]+$/i;
const demoUsers = [
  {
    key: "OWNER",
    role: "OWNER",
    name: "Owner Demo",
    email: "owner.demo@rumakost.test",
    emailEnv: "RUMAKOST_DEMO_OWNER_EMAIL",
    passwordEnv: "RUMAKOST_DEMO_OWNER_PASSWORD",
  },
  {
    key: "STAFF",
    role: "STAFF",
    name: "Staf Demo",
    email: "staff.demo@rumakost.test",
    emailEnv: "RUMAKOST_DEMO_STAFF_EMAIL",
    passwordEnv: "RUMAKOST_DEMO_STAFF_PASSWORD",
  },
  {
    key: "TENANT",
    role: "TENANT",
    name: "Penghuni Demo",
    email: "tenant.demo@rumakost.test",
    emailEnv: "RUMAKOST_DEMO_TENANT_EMAIL",
    passwordEnv: "RUMAKOST_DEMO_TENANT_PASSWORD",
  },
];

class BootstrapError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

function fail(code) {
  throw new BootstrapError(code);
}

function parseArguments(args) {
  const parsed = new Map();
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    if (!key?.startsWith("--") || !value || parsed.has(key)) fail("INVALID_ARGUMENTS");
    parsed.set(key, value);
  }

  const projectId = parsed.get("--project-id");
  const branch = parsed.get("--branch");
  if (!projectId || !allowedProjectIdPattern.test(projectId) || branch !== targetBranch) {
    fail("TARGET_MUST_BE_NEON_DEV");
  }
  return { projectId, branch };
}

function parseEnvValue(raw) {
  const value = raw.trim();
  if (value.startsWith('"') && value.endsWith('"')) {
    try {
      return JSON.parse(value);
    } catch {
      fail("ENV_VALUE_INVALID");
    }
  }
  if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1);
  return value;
}

function readLocalEnv(localEnvPath) {
  if (!existsSync(localEnvPath)) fail("ENV_LOCAL_MISSING");
  const text = readFileSync(localEnvPath, "utf8");
  const values = new Map();

  for (const key of [
    "DATABASE_URL",
    "DIRECT_URL",
    "BETTER_AUTH_URL",
    "BETTER_AUTH_SECRET",
    "APP_ORIGIN",
    ...demoUsers.flatMap((user) => [user.emailEnv, user.passwordEnv]),
  ]) {
    const matcher = new RegExp(`^\\s*${key}\\s*=\\s*(.*?)\\s*$`, "gm");
    const matches = [...text.matchAll(matcher)];
    if (matches.length > 1) fail("ENV_KEY_DUPLICATED");
    if (matches.length === 1) values.set(key, parseEnvValue(matches[0][1]));
  }

  return { text, values };
}

function verifyProcessEnvMatchesLocal(values) {
  for (const key of ["DATABASE_URL", "DIRECT_URL", "BETTER_AUTH_URL", "BETTER_AUTH_SECRET", "APP_ORIGIN"]) {
    if (!values.has(key) || process.env[key] !== values.get(key)) fail("ENV_LOCAL_NOT_ACTIVE");
  }
}

function quotePowerShell(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

function runNeonCli(args) {
  try {
    if (process.platform === "win32") {
      const command = `& ${["neon", ...args].map(quotePowerShell).join(" ")} 2>$null; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }`;
      return execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", command], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      }).trim();
    }

    return execFileSync("neon", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch {
    fail("NEON_CLI_FAILED");
  }
}

function parseConnectionOutput(output) {
  if (output.startsWith("postgres")) return new URL(output);
  try {
    const parsed = JSON.parse(output);
    const connectionString = typeof parsed === "string"
      ? parsed
      : ["connection_string", "connectionString", "url", "connection"]
          .map((key) => parsed?.[key])
          .find((value) => typeof value === "string" && value.startsWith("postgres"));
    if (!connectionString) fail("NEON_CONNECTION_INVALID");
    return new URL(connectionString);
  } catch (error) {
    if (error instanceof BootstrapError) throw error;
    fail("NEON_CONNECTION_INVALID");
  }
}

function verifyNeonTarget(projectId, branchName, envValues) {
  const branchOutput = runNeonCli([
    "branches", "get", branchName,
    "--project-id", projectId,
    "--output", "json",
    "--no-secrets",
  ]);
  let branch;
  try {
    branch = JSON.parse(branchOutput);
  } catch {
    fail("NEON_BRANCH_INVALID");
  }

  if (
    branch?.name !== targetBranch ||
    branch?.project_id !== projectId ||
    branch?.current_state !== "ready"
  ) {
    fail("NEON_BRANCH_MISMATCH");
  }

  const connectionArgs = [
    "connection-string", branchName,
    "--project-id", projectId,
    "--role-name", "neondb_owner",
    "--database-name", targetDatabase,
    "--output", "json",
  ];
  const expectedDirect = parseConnectionOutput(runNeonCli(connectionArgs));
  const expectedPooled = parseConnectionOutput(runNeonCli([...connectionArgs.slice(0, -2), "--pooled", "--output", "json"]));
  const direct = new URL(envValues.get("DIRECT_URL"));
  const pooled = new URL(envValues.get("DATABASE_URL"));
  const databaseFromPath = (url) => decodeURIComponent(url.pathname.replace(/^\//, ""));

  if (
    direct.hostname !== expectedDirect.hostname ||
    databaseFromPath(direct) !== targetDatabase ||
    pooled.hostname !== expectedPooled.hostname ||
    databaseFromPath(pooled) !== targetDatabase ||
    !/-pooler\./i.test(pooled.hostname)
  ) {
    fail("DATABASE_URL_BRANCH_MISMATCH");
  }

  return {
    primary: Boolean(branch.primary),
    default: Boolean(branch.default),
  };
}

function ensureLocalDemoCredentials(localEnvPath, text, values) {
  const updates = [];
  const credentials = [];

  for (const user of demoUsers) {
    const existingEmail = values.get(user.emailEnv);
    if (existingEmail && existingEmail !== user.email) fail("DEMO_EMAIL_MISMATCH");
    if (!existingEmail) {
      values.set(user.emailEnv, user.email);
      updates.push(`${user.emailEnv}=${JSON.stringify(user.email)}`);
    }

    let password = values.get(user.passwordEnv);
    if (password && (password.length < 32 || password.length > 128)) fail("DEMO_PASSWORD_INVALID");
    if (!password) {
      password = randomBytes(32).toString("base64url");
      values.set(user.passwordEnv, password);
      updates.push(`${user.passwordEnv}=${JSON.stringify(password)}`);
    }

    credentials.push({ ...user, password });
  }

  if (updates.length > 0) {
    const newline = text.includes("\r\n") ? "\r\n" : "\n";
    const separator = text.length > 0 && !text.endsWith("\n") ? newline : "";
    appendFileSync(localEnvPath, `${separator}${updates.join(newline)}${newline}`, "utf8");
  }

  return credentials;
}

function makeAuthRequest(baseURL, appOrigin, path, { method = "POST", body, cookie } = {}) {
  const headers = new Headers({ origin: appOrigin });
  if (body !== undefined) headers.set("content-type", "application/json");
  if (cookie) headers.set("cookie", cookie);
  return new Request(new URL(`/api/auth${path}`, baseURL), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function extractSessionCookie(response) {
  const setCookie = response.headers.get("set-cookie") ?? "";
  return setCookie.match(/(?:__Secure-)?better-auth\.session_token=[^;,]+/)?.[0] ?? null;
}

async function verifySignIn({ auth, user, appOrigin, baseURL, appUser }) {
  const signIn = await handleAuthMutation(
    makeAuthRequest(baseURL, appOrigin, "/sign-in/email", {
      body: { email: user.email, password: user.password },
    }),
    appOrigin,
    (request) => auth.handler(request),
  );
  if (!signIn.ok) fail(`LOGIN_FAILED_${user.key}`);

  const cookie = extractSessionCookie(signIn);
  if (!cookie) fail(`SESSION_COOKIE_MISSING_${user.key}`);

  try {
    const sessionResponse = await auth.handler(
      makeAuthRequest(baseURL, appOrigin, "/get-session", { method: "GET", cookie }),
    );
    const session = await sessionResponse.json();
    if (!sessionResponse.ok || session?.user?.id !== appUser.authSubject) {
      fail(`SESSION_USER_MISMATCH_${user.key}`);
    }
    return true;
  } finally {
    const signOut = await handleAuthMutation(
      makeAuthRequest(baseURL, appOrigin, "/sign-out", { cookie }),
      appOrigin,
      (request) => auth.handler(request),
    );
    if (!signOut.ok) fail(`SESSION_SIGNOUT_FAILED_${user.key}`);

    const revoked = await auth.handler(
      makeAuthRequest(baseURL, appOrigin, "/get-session", { method: "GET", cookie }),
    );
    if (await revoked.json() !== null) fail(`SESSION_REVOCATION_FAILED_${user.key}`);
  }
}

async function main() {
  let stage = "arguments";
  let prisma;
  try {
    const { projectId, branch } = parseArguments(process.argv.slice(2));
    const localEnvPath = resolve(process.cwd(), ".env.local");
    const { text, values } = readLocalEnv(localEnvPath);
    verifyProcessEnvMatchesLocal(values);

    stage = "local-secret-safety";
    execFileSync("git", ["check-ignore", "--quiet", ".env.local"], {
      stdio: "ignore",
      windowsHide: true,
    });
    process.stdout.write("ENV_LOCAL_GIT_IGNORED=true\n");

    stage = "neon-target";
    const branchFlags = verifyNeonTarget(projectId, branch, values);
    const credentials = ensureLocalDemoCredentials(localEnvPath, text, values);

    const baseURL = values.get("BETTER_AUTH_URL");
    const appOrigin = values.get("APP_ORIGIN");
    const secret = values.get("BETTER_AUTH_SECRET");
    const baseUrlOrigin = new URL(baseURL).origin;
    if (
      new URL(appOrigin).origin !== baseUrlOrigin ||
      secret.length < 32 ||
      process.env.NODE_ENV === "production"
    ) {
      fail("AUTH_LOCAL_CONFIG_INVALID");
    }

    const adapter = new PrismaNeon({
      connectionString: values.get("DATABASE_URL"),
      max: 1,
      connectionTimeoutMillis: 5_000,
    });
    prisma = new PrismaClient({ adapter });
    const allowedEmails = new Set(demoUsers.map(({ email }) => email));

    stage = "account-safety-check";
    const [existingAppUsers, existingAuthUsers] = await Promise.all([
      prisma.appUser.findMany({
        select: { emailNormalized: true },
      }),
      prisma.user.findMany({
        select: { email: true },
      }),
    ]);
    if (
      existingAppUsers.some((user) => !allowedEmails.has(user.emailNormalized)) ||
      existingAuthUsers.some((user) => !allowedEmails.has(user.email))
    ) {
      fail("NON_DEMO_ACCOUNTS_EXIST");
    }

    let suppressedVerificationEmails = 0;
    const emailSender = {
      async sendVerification() {
        suppressedVerificationEmails += 1;
      },
      async sendPasswordReset() {},
    };
    const isActiveAppUser = async (authSubject) => {
      const [appUser, authUser] = await Promise.all([
        prisma.appUser.findFirst({
          where: { authSubject, isActive: true },
          select: { id: true },
        }),
        prisma.user.findFirst({
          where: { id: authSubject, emailVerified: true },
          select: { id: true },
        }),
      ]);
      return appUser !== null && authUser !== null;
    };
    const fixtureAuth = createBetterAuth({
      prisma,
      baseURL,
      secret,
      appOrigin,
      emailSender,
      isActiveAppUser,
      disableSignUp: false,
    });
    const productionAuth = createBetterAuth({
      prisma,
      baseURL,
      secret,
      appOrigin,
      emailSender,
      isActiveAppUser,
      disableSignUp: true,
    });

    const appUsers = new Map();
    let ownerId = null;
    for (const user of credentials) {
      stage = `provision-${user.key.toLowerCase()}`;
      const authUser = await prisma.user.findUnique({ where: { email: user.email } });
      let verifiedAuthUser = authUser;

      if (!authUser) {
        const signup = await fixtureAuth.handler(
          makeAuthRequest(baseURL, appOrigin, "/sign-up/email", {
            body: { name: user.name, email: user.email, password: user.password },
          }),
        );
        if (!signup.ok) fail(`DEMO_SIGNUP_FAILED_${user.key}`);
        verifiedAuthUser = await prisma.user.findUnique({ where: { email: user.email } });
      }

      if (
        !verifiedAuthUser ||
        verifiedAuthUser.name !== user.name ||
        verifiedAuthUser.email !== user.email
      ) {
        fail(`DEMO_AUTH_USER_MISMATCH_${user.key}`);
      }

      const credentialAccount = await prisma.account.findFirst({
        where: {
          userId: verifiedAuthUser.id,
          accountId: verifiedAuthUser.id,
          providerId: "credential",
        },
        select: { password: true },
      });
      if (!credentialAccount?.password) fail(`DEMO_CREDENTIAL_MISSING_${user.key}`);

      const appUser = await prisma.appUser.findUnique({
        where: { emailNormalized: user.email },
      });
      if (appUser && !verifiedAuthUser.emailVerified) {
        fail(`DEMO_VERIFICATION_STATE_INVALID_${user.key}`);
      }
      if (!verifiedAuthUser.emailVerified) {
        verifiedAuthUser = await prisma.user.update({
          where: { id: verifiedAuthUser.id },
          data: { emailVerified: true },
        });
      }

      const expectedCreatorId = user.role === "OWNER" ? null : ownerId;
      if (user.role !== "OWNER" && !ownerId) fail("DEMO_OWNER_REQUIRED_FIRST");

      let ensuredAppUser = appUser;
      if (appUser) {
        if (
          appUser.authSubject !== verifiedAuthUser.id ||
          appUser.displayName !== user.name ||
          appUser.role !== user.role ||
          !appUser.isActive ||
          appUser.mustChangePassword ||
          appUser.createdById !== expectedCreatorId
        ) {
          fail(`DEMO_APP_USER_MISMATCH_${user.key}`);
        }
      } else {
        ensuredAppUser = await prisma.$transaction(async (transaction) => {
          const created = await transaction.appUser.create({
            data: {
              authSubject: verifiedAuthUser.id,
              emailNormalized: user.email,
              displayName: user.name,
              role: user.role,
              isActive: true,
              mustChangePassword: false,
              createdById: expectedCreatorId,
            },
          });

          if (user.role === "TENANT") {
            await transaction.tenantProfile.create({ data: { userId: created.id } });
          }

          if (user.role !== "OWNER") {
            await transaction.auditEvent.create({
              data: {
                actorId: ownerId,
                action: "APP_USER_ACCOUNT_CREATED",
                entityType: "APP_USER",
                entityId: created.id,
                safeMetadata: { role: user.role, source: "DEMO_BOOTSTRAP" },
              },
            });
          }

          return created;
        });
      }

      if (!ensuredAppUser) fail(`DEMO_APP_USER_MISSING_${user.key}`);
      if (user.role === "TENANT") {
        const profile = await prisma.tenantProfile.findUnique({ where: { userId: ensuredAppUser.id } });
        if (!profile) fail("DEMO_TENANT_PROFILE_MISSING");
      }
      if (user.role !== "OWNER") {
        const auditCount = await prisma.auditEvent.count({
          where: {
            actorId: ownerId,
            action: "APP_USER_ACCOUNT_CREATED",
            entityType: "APP_USER",
            entityId: ensuredAppUser.id,
          },
        });
        if (auditCount !== 1) fail(`DEMO_AUDIT_MISSING_${user.key}`);
      }

      appUsers.set(user.role, ensuredAppUser);
      if (user.role === "OWNER") ownerId = ensuredAppUser.id;
      process.stdout.write(`DEMO_${user.key}=READY email_verified=true app_user_active=true\n`);
    }

    stage = "login-verification";
    for (const user of credentials) {
      const appUser = appUsers.get(user.role);
      if (!appUser) fail(`DEMO_APP_USER_MISSING_${user.key}`);
      await verifySignIn({ auth: productionAuth, user, appOrigin, baseURL, appUser });
      process.stdout.write(`DEMO_${user.key}_LOGIN=PASS session_revoked=true\n`);
    }

    stage = "public-signup-guard";
    const probeEmail = `public-signup-${randomUUID()}@rumakost.test`;
    const publicSignup = await handleAuthMutation(
      makeAuthRequest(baseURL, appOrigin, "/sign-up/email", {
        body: {
          name: "Signup Probe",
          email: probeEmail,
          password: randomBytes(32).toString("base64url"),
        },
      }),
      appOrigin,
      (request) => productionAuth.handler(request),
    );
    const probeUser = await prisma.user.findUnique({ where: { email: probeEmail } });
    if (publicSignup.ok || probeUser) fail("PUBLIC_SIGNUP_NOT_DISABLED");

    const [ownerCount, staffCount, tenantCount] = await Promise.all([
      prisma.appUser.count({ where: { role: "OWNER" } }),
      prisma.appUser.count({ where: { role: "STAFF" } }),
      prisma.appUser.count({ where: { role: "TENANT" } }),
    ]);
    if (ownerCount !== 1 || staffCount !== 1 || tenantCount !== 1) {
      fail("DEMO_ROLE_COUNTS_INVALID");
    }

    process.stdout.write(`NEON_BRANCH=${branch}\n`);
    process.stdout.write(`NEON_BRANCH_PRIMARY=${branchFlags.primary}\n`);
    process.stdout.write(`NEON_BRANCH_DEFAULT=${branchFlags.default}\n`);
    process.stdout.write("DEMO_ROLE_COUNTS=OWNER:1,STAFF:1,TENANT:1\n");
    process.stdout.write("DEMO_RELATIONSHIPS=PASS\n");
    process.stdout.write("EMAIL_VERIFICATION=PASS\n");
    process.stdout.write("DEMO_CREDENTIALS_STORED=.env.local\n");
    process.stdout.write("LIVE_EMAILS_SENT=0\n");
    process.stdout.write(`SIGNUP_VERIFICATION_EMAILS_SUPPRESSED=${suppressedVerificationEmails}\n`);
    process.stdout.write("PUBLIC_SIGNUP=DISABLED\n");
    process.stdout.write("DEMO_BOOTSTRAP=PASS\n");
  } catch (error) {
    const code = error instanceof BootstrapError ? error.code : "UNEXPECTED";
    process.stderr.write(`DEMO_BOOTSTRAP=FAIL stage=${stage} code=${code}\n`);
    process.exitCode = 1;
  } finally {
    await prisma?.$disconnect().catch(() => undefined);
  }
}

await main();
