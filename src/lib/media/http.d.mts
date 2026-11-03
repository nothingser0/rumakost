import type { MediaActor, MediaRepository, MediaStorage } from "./operations.mjs";

export function createMediaRouteHandlers(input: {
  authenticate: () => Promise<MediaActor | null>;
  createRepository: () => MediaRepository;
  createStorage: () => MediaStorage;
  appOrigin: string | (() => string);
}): {
  uploadIntent(request: Request): Promise<Response>;
  downloadUrl(request: Request, attachmentId: string): Promise<Response>;
};
