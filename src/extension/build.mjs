import { build, context } from "esbuild";
import { mkdirSync } from "node:fs";

// One command builds the extension. It writes into out/, which the manifest
// points at, and it copies the files the editor loads directly.
const options = {
  entryPoints: ["extension.ts"],
  bundle: true,
  outfile: "out/extension.js",
  external: ["vscode", "koffi"],
  format: "cjs",
  platform: "node",
  target: "node18",
  sourcemap: true,
  logLevel: "info",
};

mkdirSync("out", { recursive: true });

if (process.argv.includes("--watch")) {
  const ctx = await context(options);
  await ctx.watch();
} else {
  await build(options);
}
