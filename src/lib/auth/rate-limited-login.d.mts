type LoginAuthenticationResult = "success" | "invalid" | "unavailable";

type RateLimitedLoginResult =
  | { status: "invalid" }
  | { status: "unavailable" }
  | { status: "authenticated-but-unavailable" }
  | { status: "success"; appUserId: string | null };

export function isCredentialAuthError(error: unknown): boolean;

export function performRateLimitedLogin(input: {
  email: string;
  findAccountId(email: string): Promise<string | null>;
  reserveAttempt(appUserId: string): Promise<{ allowed: boolean }>;
  authenticate(): Promise<LoginAuthenticationResult>;
  recordFailure(appUserId: string): Promise<void>;
  recordSuccess(appUserId: string): Promise<void>;
}): Promise<RateLimitedLoginResult>;
