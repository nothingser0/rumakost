import { readFileSync } from "node:fs";
import { resolve as pathResolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const root = process.cwd();
const extensions = [".tsx", ".ts", ".jsx", ".js", ".mjs", ".cjs"];

export async function resolve(specifier, context, nextResolve) {
  let target = specifier;

  if (target.startsWith("@/")) {
    const localPath = pathResolve(root, "src", target.slice(2));
    target = pathToFileURL(localPath).href;
  }

  if (target.startsWith(".") || target.startsWith("file://")) {
    // If it has no extension, try candidates
    if (!/\.(?:[cm]?js|tsx?|css)$/.test(target)) {
      for (const ext of extensions) {
        try {
          return await nextResolve(`${target}${ext}`, context);
        } catch (err) {
          if (err.code !== "ERR_MODULE_NOT_FOUND") throw err;
        }
      }
    }
  }

  return nextResolve(target, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith(".css") || url.endsWith(".module.css")) {
    return {
      format: "module",
      shortCircuit: true,
      source: "export default new Proxy({}, { get: (_, prop) => typeof prop === 'string' ? prop : '' });",
    };
  }

  if (url.endsWith(".tsx") || (url.endsWith(".ts") && !url.includes("node_modules"))) {
    const filePath = fileURLToPath(url);
    const source = readFileSync(filePath, "utf8");
    const transpiled = ts.transpileModule(source, {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
      fileName: filePath,
    });
    return {
      format: "module",
      shortCircuit: true,
      source: transpiled.outputText,
    };
  }

  return nextLoad(url, context);
}
