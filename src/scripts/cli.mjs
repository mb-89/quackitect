// The command line. Everything a person or a build asks of this tree is a verb
// here, and RUNME hands every argument through untouched.
//
// It calls Vale through the same file level zero calls it through, so the write
// door and this command never disagree about what is a breach.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { lintText, fromJson, unreasoned, valeBin, CONFIG } from "../level0/lib/vale.mjs";
import { standingLayer } from "../level0/lib/guidance.mjs";
import { line as asLine } from "../level0/lib/refuse.mjs";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const bin = join(root, valeBin(process.platform));
const STYLES = join(root, "spec", "config", "styles", "VoiceQuackitect");
const GUIDANCE = join(root, "spec", "guidance");

// The shape level zero hands Vale, over spawnSync instead of $.process.run.
const run = async (argv, init = {}) => {
  const ran = spawnSync(argv[0], argv.slice(1), {
    cwd: init.cwd ?? root,
    input: init.stdin ?? "",
    encoding: "utf8",
    shell: false,
  });
  if (ran.error) throw ran.error;
  return { exitCode: ran.status ?? 1, stdout: ran.stdout ?? "", stderr: ran.stderr ?? "" };
};

const verbs = {
  check: { says: "the tests, then the rules over the tree", run: async (w) => (test() || await lint(w)) },
  lint: { says: "the rules over the tree, or over what you name", run: lint },
  fix: { says: "the fixes a program can make", run: fix },
  test: { says: "the tests alone", run: async () => test() },
  rules: { says: "the mechanical rules Vale holds", run: async () => listRules() },
  standing: { says: "what level zero hands the agent every session", run: async () => standing() },
  doctor: { says: "what is installed, and what level zero found", run: async () => doctor() },
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
process.exit((await verbs[verb].run(where.length ? where : ["."])) ?? 0);

async function lint(where) {
  if (!existsSync(bin)) {
    console.error("Vale is missing. Run ./RUNME.sh once and it installs.");
    return 2;
  }

  // Vale walks a folder itself, so the tree goes to it whole and the reading of
  // what is prose stays Vale's.
  const ran = await run([bin, "--config=" + CONFIG, "--output=JSON", "--no-exit", ...where]);
  const found = fromJson(ran.stdout);

  // The one rule Vale cannot hold, because it is about Vale's own marker.
  for (const file of walk(where)) {
    for (const one of unreasoned(readFileSync(file, "utf8"))) {
      found.push({ ...one, file: show(file) });
    }
  }

  if (!found.length) {
    console.log("The rules pass.");
    return 0;
  }

  const perRule = new Map();
  for (const one of found) {
    perRule.set(one.rule, (perRule.get(one.rule) ?? 0) + 1);
    console.log(asLine(one, show(one.file ?? where[0])));
  }
  console.log("");
  for (const [rule, count] of [...perRule].sort((a, b) => b[1] - a[1])) {
    console.log(`${String(count).padStart(6)}  ${rule}`);
  }
  console.log(`${String(found.length).padStart(6)}  in all`);
  return 1;
}

// Vale applies the fix a rule carries in its Action. A rule with no action is
// left for lint, and this says nothing about it.
async function fix(where) {
  if (!existsSync(bin)) {
    console.error("Vale is missing. Run ./RUNME.sh once and it installs.");
    return 2;
  }
  const ran = spawnSync(bin, ["fix", "--apply", ...where], {
    cwd: root, encoding: "utf8", stdio: "inherit", shell: false,
  });
  if (ran.status !== 0) {
    console.log("Vale applied no fix. Run ./RUNME.sh lint to see what is left.");
  }
  return 0;
}

function test() {
  const ran = spawnSync(process.execPath, ["--test", "src/level0/test/*.test.mjs"], {
    cwd: root, stdio: "inherit",
  });
  return ran.status ?? 1;
}

function listRules() {
  if (!existsSync(STYLES)) {
    console.error("The style folder is missing.");
    return 2;
  }
  for (const name of readdirSync(STYLES).filter((n) => n.endsWith(".yml"))) {
    const text = readFileSync(join(STYLES, name), "utf8");
    const message = /^message:\s*"?(.*?)"?\s*$/m.exec(text)?.[1] ?? "";
    console.log(`${name.replace(/\.yml$/, "").padEnd(20)} ${message}`);
  }
  return 0;
}

// What level zero appends to the system prompt: every guidance note's
// Actionables chapter, and no other chapter.
function standing() {
  if (!existsSync(GUIDANCE)) {
    console.error("There is no spec/guidance, so nothing is handed over.");
    return 2;
  }
  const notes = readdirSync(GUIDANCE)
    .filter((n) => n.endsWith(".md"))
    .map((n) => ({ name: n, text: readFileSync(join(GUIDANCE, n), "utf8") }));
  const said = standingLayer(notes);
  console.log(said || "No guidance note carries an Actionables chapter.");
  return 0;
}

// What is here and what is missing, so a person in trouble has one command that
// answers rather than a search.
function doctor() {
  const rows = [
    ["node", process.version],
    ["vale", existsSync(bin) ? asked([bin, "--version"]) : "missing, run ./RUNME.sh"],
    ["rules", existsSync(STYLES) ? readdirSync(STYLES).filter((n) => n.endsWith(".yml")).length + " in the style folder" : "missing"],
    ["level zero stamp", readIf(join(root, ".se", "level0.stamp"))],
    ["cage", existsSync(join(root, ".claude", "settings.json")) ? "tracked, one file" : "missing"],
  ];
  for (const [what, said] of rows) {
    console.log(`${what.padEnd(18)} ${String(said).trim() || "missing"}`);
  }
  return 0;
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

function walk(where) {
  const out = [];
  const PROSE = /\.(md|markdown|txt)$/i;
  const SKIP = new Set([".git", "node_modules", ".se", ".claude", ".claude-plugin"]);
  const into = (path) => {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      if (SKIP.has(entry.name)) continue;
      const under = join(path, entry.name);
      if (entry.isDirectory()) into(under);
      else if (PROSE.test(entry.name)) out.push(under);
    }
  };
  for (const one of where) {
    const path = join(root, one);
    try {
      if (readdirSync(path)) into(path);
    } catch {
      if (PROSE.test(path)) out.push(path);
    }
  }
  return out;
}

function show(file) {
  const path = String(file);
  const from = path.includes(root) ? relative(root, path) : path;
  return from.split(sep).join("/");
}
