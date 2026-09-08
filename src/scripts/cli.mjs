// The command line. Everything a person or a build asks of this tree is a verb
// here, and RUNME hands every argument through untouched.
//
// It is a client of the same rules level zero holds at the write door, so the
// two never disagree about what is a breach.

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { check, applyFixes } from "../level0/lib/check.mjs";
import { rules, judged } from "../level0/lib/rules.mjs";
import { line as asLine } from "../level0/lib/refuse.mjs";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const PROSE = /\.(md|markdown|txt)$/i;
const SKIP = new Set([".git", "node_modules", ".se", ".claude", ".claude-plugin"]);

const verbs = {
  check: {
    says: "the tests, then the rules over the tree",
    run: (where) => (test() || lint(where)),
  },
  lint: { says: "the voice rules over the tree, or over what you name", run: lint },
  fix: { says: "the fixes a program can make", run: fix },
  test: { says: "the tests alone", run: test },
  rules: { says: "the rules this tree holds, and why", run: listRules },
  doctor: { says: "what is installed and what level zero found", run: doctor },
};

const argv = process.argv.slice(2);
const verb = argv.find((a) => !a.startsWith("-")) ?? "help";
const where = argv.filter((a) => !a.startsWith("-") && a !== verb);

if (verb === "help" || !verbs[verb]) {
  if (verb !== "help") console.error(`se: there is no verb called ${verb}\n`);
  console.log("Usage: ./RUNME.sh <verb> [path ...]\n");
  for (const [name, one] of Object.entries(verbs)) {
    console.log(`  ${name.padEnd(8)} ${one.says}`);
  }
  process.exit(verb === "help" ? 0 : 2);
}
process.exit(verbs[verb].run(where.length ? where : ["."]) ?? 0);

function lint(where) {
  const files = where.flatMap(walk);
  let broken = 0;
  const perRule = new Map();

  for (const file of files) {
    for (const one of check(readFileSync(file, "utf8"))) {
      broken++;
      perRule.set(one.rule, (perRule.get(one.rule) ?? 0) + 1);
      console.log(asLine(one, show(file)));
    }
  }

  if (broken) {
    console.log("");
    for (const [rule, count] of [...perRule].sort((a, b) => b[1] - a[1])) {
      console.log(`${String(count).padStart(6)}  ${rule}`);
    }
    console.log(`${String(broken).padStart(6)}  in ${files.length} file(s)`);
    return 1;
  }
  console.log(`The rules pass ${files.length} file(s).`);
  return 0;
}

function fix(where) {
  const files = where.flatMap(walk);
  let changed = 0;
  for (const file of files) {
    const was = readFileSync(file, "utf8");
    const now = applyFixes(was);
    if (now === was) continue;
    writeFileSync(file, now, { encoding: "utf8" });
    changed++;
    console.log(`fixed  ${show(file)}`);
  }
  console.log(`${changed} file(s) changed, of ${files.length} read.`);
  return 0;
}

function test() {
  const ran = spawnSync(process.execPath, ["--test", "src/level0/test/*.test.mjs"], {
    cwd: root,
    stdio: "inherit",
  });
  return ran.status ?? 1;
}

function listRules() {
  for (const one of [...rules, ...judged]) {
    console.log(`${one.name}\n  why:     ${one.why}\n  instead: ${one.instead}\n`);
  }
  return 0;
}

// What is here and what is missing, so a person who runs into trouble has one
// command that answers rather than a search.
function doctor() {
  const bin = join(root, ".se", "bin");
  const rows = [
    ["node", process.version],
    ["go", asked(["go", "version"])],
    ["vale", existsSync(join(bin, valeName())) ? asked([join(bin, valeName()), "--version"]) : "missing"],
    ["level zero stamp", readIf(join(root, ".se", "level0.stamp"))],
    ["cage", existsSync(join(root, ".claude", "settings.json")) ? "tracked, one file" : "missing"],
  ];
  for (const [what, said] of rows) {
    console.log(`${what.padEnd(18)} ${String(said).trim() || "missing"}`);
  }
  return 0;
}

function valeName() {
  return process.platform === "win32" ? "vale.exe" : "vale";
}

function asked(argv) {
  const ran = spawnSync(argv[0], argv.slice(1), { encoding: "utf8", shell: false });
  if (ran.error) return "missing";
  return (ran.stdout || ran.stderr || "").split("\n")[0];
}

function readIf(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "never loaded here";
  }
}

function walk(from) {
  const path = join(root, from) === from ? from : from;
  let how;
  try {
    how = statSync(path);
  } catch {
    console.error(`se: ${from} is not here`);
    process.exit(2);
  }
  if (how.isFile()) return PROSE.test(path) ? [path] : [];

  const out = [];
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const under = join(path, entry.name);
    if (entry.isDirectory()) out.push(...walk(under));
    else if (PROSE.test(entry.name)) out.push(under);
  }
  return out;
}

function show(file) {
  return relative(process.cwd(), file).split(sep).join("/");
}
