import { defineConfig } from "prisma/config";
import { resolve } from "node:path";

const root = process.cwd();

export default defineConfig({
  schema: resolve(root, "prisma/schema.prisma"),
  migrations: { path: resolve(root, "prisma/migrations") },
});
