import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const requestedSuite = process.argv[2];
const testRoot = resolve("tests");
const suites = requestedSuite ? [requestedSuite] : readdirSync(testRoot);

if (suites.some((suite) => !/^[a-z0-9-]+$/i.test(suite))) {
  process.stderr.write("Invalid test suite name.\n");
  process.exit(2);
}

const testFiles = suites.flatMap((suite) => {
  const suitePath = resolve(testRoot, suite);
  try {
    return readdirSync(suitePath)
      .filter((file) => file.endsWith(".test.mjs"))
      .map((file) => resolve(suitePath, file));
  } catch {
    return [];
  }
});

if (testFiles.length === 0) {
  process.stderr.write(`No tests found for suite: ${requestedSuite ?? "all"}\n`);
  process.exit(1);
}

const nodeArguments = [
  ...(requestedSuite === "auth-provider"
    ? [
        "--experimental-strip-types",
        "--loader",
        pathToFileURL(resolve("tests/auth-provider/typescript-loader.mjs")).href,
      ]
    : []),
  "--test",
  ...testFiles,
];

const result = spawnSync(process.execPath, nodeArguments, {
  stdio: "inherit",
});

process.exit(result.status ?? 1);
