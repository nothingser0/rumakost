export async function resolve(specifier, context, nextResolve) {
  if (
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    !/\.(?:[cm]?js|tsx?)$/.test(specifier)
  ) {
    for (const extension of [".ts", ".js", ".mjs", ".cjs"]) {
      try {
        return await nextResolve(`${specifier}${extension}`, context);
      } catch (error) {
        if (error.code !== "ERR_MODULE_NOT_FOUND") throw error;
      }
    }
  }

  return nextResolve(specifier, context);
}
