export function isSameOriginAuthMutation(
  originHeader: string | null,
  appOrigin: string,
): boolean;

export function runSameOriginAuthMutation<Result>(options: {
  originHeader: string | null;
  appOrigin: string;
  rejectedValue: Result;
  operation: () => Promise<Result>;
}): Promise<Result>;
