// The voice rules over files, for a person and for a build. A client of the
// same rules the write door holds, so the two never disagree.
//
//   node src/level0/bin/lint.mjs [path ...]      report and exit non-zero
//   node src/level0/bin/lint.mjs --fix [path]    apply the fixes a program makes
//
// The judged rules need a model and this client has none, so it runs the
// patterns. The write door and the language server run both.

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { check, applyFixes } from "../lib/check.mjs";
import { line as asLine } from "../lib/refuse.mjs";

const PROSE = /\.(md|markdown|txt)$/i;
const SKIP = new Set([".git", "node_modules", ".se", ".claude"]);

const argv = process.argv.slice(2);
const fixing = argv.includes("--fix");
const where = argv.filter((a) => !a.startsWith("--"));
const roots = where.length ? where : ["."];

const files = roots.flatMap(walk);
let broken = 0;
let fixed = 0;
const perRule = new Map();

for (const file of files) {
  const text = readFileSync(file, "utf8");

  if (fixing) {
    const put = applyFixes(text);
    if (put !== text) {
      writeFileSync(file, put, { encoding: "utf8" });
      fixed++;
      console.log(`fixed  ${show(file)}`);
    }
    continue;
  }

  for (const one of check(text)) {
    broken++;
    perRule.set(one.rule, (perRule.get(one.rule) ?? 0) + 1);
    console.log(asLine(one, show(file)));
  }
}

if (fixing) {
  console.log(`\n${fixed} file(s) changed, of ${files.length} read.`);
  process.exit(0);
}

if (broken) {
  console.log("");
  for (const [rule, count] of [...perRule].sort((a, b) => b[1] - a[1])) {
    console.log(`${String(count).padStart(6)}  ${rule}`);
  }
  console.log(`${String(broken).padStart(6)}  in ${files.length} file(s)`);
}
process.exit(broken ? 1 : 0);

function walk(root) {
  let how;
  try {
    how = statSync(root);
  } catch {
    console.error(`lint: ${root} is not here`);
    process.exit(2);
  }
  if (how.isFile()) return PROSE.test(root) ? [root] : [];

  const out = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const path = join(root, entry.name);
    if (entry.isDirectory()) out.push(...walk(path));
    else if (PROSE.test(entry.name)) out.push(path);
  }
  return out;
}

function show(file) {
  return relative(process.cwd(), file).split(sep).join("/");
}
