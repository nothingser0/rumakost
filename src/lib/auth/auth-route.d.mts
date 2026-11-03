export function handleAuthMutation(
  request: Request,
  appOrigin: string,
  handler: (request: Request) => Promise<Response>,
): Promise<Response>;
