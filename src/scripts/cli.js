// The command line. RUNME hands every argument through untouched, and every
// verb here calls the same checkers the write door calls.

import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { clock } from "../doors/clock.js";
import { disk } from "../doors/disk.js";
import { git } from "../doors/git.js";
import { proc } from "../doors/proc.js";
import { biomeBin } from "../../.claude/skills/level0/lib/code.js";
import { actionables, bindsHere, standingLayer } from "../../.claude/skills/level0/lib/guidance.js";
import { line as asLine } from "../../.claude/skills/level0/lib/refuse.js";
import { pathInScript, SCRIPT } from "../../.claude/skills/level0/lib/scripts.js";
import { EDITOR_SETTINGS, valeLsBin } from "../../.claude/skills/level0/lib/servers.js";
import { calmed, SHOUTED } from "../../.claude/skills/level0/lib/shout.js";
import { CONFIG, fromJson, unreasoned, valeBin } from "../../.claude/skills/level0/lib/vale.js";
import { work } from "./work.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

function doorsHere() {
  const outside = proc();
  return { proc: outside, disk: disk(), clock: clock(), git: git(outside, root), join };
}

const it = doorsHere();
const files = it.disk;
const outside = it.proc;

const bin = join(root, valeBin(process.platform));
const STYLES = join(root, "spec", "config", "styles", "VoiceVale");
const JUDGED = join(root, "spec", "config", "styles", "VoiceJudged");
const biome = join(root, biomeBin(process.platform));
const valeLs = join(root, valeLsBin(process.platform));
const GUIDANCE = join(root, "spec", "guidance");
const DOORS = join(root, "src", "doors");
const CONTRACT = join(root, "test", "contract");
const LEVEL0 = join(root, "spec", "config", "level0.json");
const config = files.exists(LEVEL0) ? JSON.parse(files.read(LEVEL0)) : {};
const OURS = "--glob=!{.se,node_modules,.git}/**";
const TESTS = "test/level0/*.test.js";
const CONTRACT_TESTS = "test/contract/*.test.js";
const ROUNDS = 5;

const run = async (argv, init = {}) =>
  outside.run(argv, { ...init, cwd: init.cwd ?? root });

const verbs = {
  check: {
    says: "the tests, the doors, then the rules over the tree",
    run: async (w) => test() || doorsHold() || (await lint(w)),
  },
  lint: { says: "the rules over the tree, or over what you name", run: lint },
  fix: { says: "the fixes a program can make", run: fix },
  test: { says: "the tests alone", run: async () => test() },
  rules: { says: "the mechanical rules Vale holds", run: async () => listRules() },
  standing: {
    says: "what level zero hands the agent every session",
    run: async () => standing(),
  },
  doctor: {
    says: "what is installed, and what level zero found",
    run: async () => doctor(),
  },
  doors: {
    says: "every door, and the contract test that holds it",
    run: async () => doorsHold(),
  },
  work: {
    says: "work branches: new, take, read, list",
    run: async () => work(root, rest, it),
  },
};

const argv = process.argv.slice(2);
const verb = argv.find((a) => !a.startsWith("-")) ?? "help";
const where = argv.filter((a) => !a.startsWith("-") && a !== verb);
const rest = argv.slice(argv.indexOf(verb) + 1);

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
  if (!files.exists(bin)) {
    console.error("Vale is missing. Run ./RUNME.sh once and it installs.");
    return 2;
  }

  const ran = await run([
    bin,
    `--config=${CONFIG}`,
    "--output=JSON",
    "--no-exit",
    OURS,
    ...where,
  ]);
  const found = fromJson(ran.stdout);

  for (const file of walk(where)) {
    for (const one of unreasoned(files.read(file))) {
      found.push({ ...one, file: show(file) });
    }
  }

  for (const file of walk(where, SCRIPT)) {
    found.push(...pathInScript(files.read(file), show(file)));
  }

  if (files.exists(biome)) {
    const code = outside.run(
      [biome, "lint", "--config-path=spec/config", "--reporter=github", ...where],
      { cwd: root },
    );
    for (const row of code.stdout.split("\n")) {
      const hit = /^::(\w+) title=([^,]+),file=([^,]+),line=(\d+).*?::(.*)$/.exec(row);
      if (!hit) continue;
      found.push({
        file: hit[3],
        rule: hit[2].replace(/^lint\//, ""),
        line: Number(hit[4]),
        column: 1,
        message: hit[5],
        severity: hit[1] === "warning" ? "warning" : "error",
      });
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

async function fix(where) {
  if (!files.exists(bin)) {
    console.error("Vale is missing. Run ./RUNME.sh once and it installs.");
    return 2;
  }
  for (let round = 0; round < ROUNDS; round++) {
    const was = stamp(where);
    await calm(where);
    outside.run([bin, "fix", "--apply", `--config=${CONFIG}`, OURS, ...where], {
      cwd: root,
      inherit: true,
    });
    if (stamp(where) === was) break;
  }

  if (files.exists(biome)) {
    outside.run([biome, "check", "--write", "--config-path=spec/config", ...where], {
      cwd: root,
      inherit: true,
    });
  }
  console.log("Run ./RUNME.sh lint to see what is left for a person.");
  return 0;
}

async function calm(where) {
  const ran = await run([
    bin,
    `--config=${CONFIG}`,
    "--output=JSON",
    "--no-exit",
    OURS,
    ...where,
  ]);

  const perFile = new Map();
  for (const one of fromJson(ran.stdout)) {
    if (one.rule !== SHOUTED) continue;
    perFile.set(one.file, [...(perFile.get(one.file) ?? []), one]);
  }

  for (const [file, rows] of perFile) {
    const path = resolve(root, file);
    const was = files.read(path);
    const now = calmed(was, rows);
    if (now !== was) files.write(path, now);
  }
}

function stamp(where) {
  return walk(where)
    .map((file) => `${file}\u0000${files.read(file)}`)
    .join("\u0000");
}

function test() {
  const ran = outside.run([process.execPath, "--test", TESTS, CONTRACT_TESTS], {
    cwd: root,
    inherit: true,
  });
  return ran.exitCode;
}

// [[spec/guidance/testing]]
function doorsHold() {
  const named = (at, end) =>
    files
      .list(at)
      .filter((one) => one.kind === "file" && one.name.endsWith(end))
      .map((one) => one.name.slice(0, -end.length));

  const doors = named(DOORS, ".js");
  const held = named(CONTRACT, ".test.js");
  const missing = doors.filter((name) => !held.includes(name));

  for (const name of missing) {
    console.error(`src/doors/${name}.js has no test/contract/${name}.test.js.`);
  }
  if (missing.length) {
    console.error("A door with no contract test lets its fake drift. Write one.");
    return 1;
  }
  console.log(`${doors.length} doors, and a contract test holds each one.`);
  return 0;
}

function listRules() {
  if (!files.exists(STYLES)) {
    console.error("The style folder is missing.");
    return 2;
  }
  for (const name of namesIn(STYLES, ".yml")) {
    const text = files.read(join(STYLES, name));
    const message = /^message:\s*"?(.*?)"?\s*$/m.exec(text)?.[1] ?? "";
    console.log(`${name.replace(/\.yml$/, "").padEnd(20)} ${message}`);
  }
  return 0;
}

function standing() {
  if (!files.exists(GUIDANCE)) {
    console.error("There is no spec/guidance, so nothing is handed over.");
    return 2;
  }
  const notes = namesIn(GUIDANCE, ".md")
    .map((n) => ({ name: n, text: files.read(join(GUIDANCE, n)) }))
    .filter(({ text }) => bindsHere(text, process.env));
  const said = standingLayer(notes);
  if (!said) {
    console.log("No guidance note carries an Actionables chapter.");
    return 0;
  }
  console.log(said);
  const count = notes.reduce((n, one) => n + actionables(one.text).length, 0);
  console.log(`
rules: ${count}`);
  return 0;
}

function doctor() {
  const rows = [
    ["node", process.version],
    ["vale", files.exists(bin) ? asked([bin, "--version"]) : "missing, run ./RUNME.sh"],
    [
      "biome",
      files.exists(biome) ? asked([biome, "--version"]) : "missing, run ./RUNME.sh",
    ],
    [
      "vale-ls",
      files.exists(valeLs) ? asked([valeLs, "--version"]) : "missing, run ./RUNME.sh",
    ],
    ["biome lsp-proxy", files.exists(biome) ? lspProxy() : "missing, run ./RUNME.sh"],
    [
      "editor",
      files.exists(join(root, EDITOR_SETTINGS))
        ? `${EDITOR_SETTINGS}, both servers`
        : "missing",
    ],
    [
      "vale rules",
      files.exists(STYLES)
        ? `${namesIn(STYLES, ".yml").length} in VoiceVale`
        : "missing",
    ],
    [
      "judged rules",
      files.exists(JUDGED)
        ? `${namesIn(JUDGED, ".yml").length} in VoiceJudged`
        : "none",
    ],
    [
      "judge",
      config.judge?.enabled === false
        ? "off in spec/config/level0.json"
        : `on, model ${config.judge?.model ?? "default"}`,
    ],
    ["level zero stamp", readIf(join(root, ".se", "level0.stamp"))],
    [
      "cage",
      files.exists(join(root, ".claude", "settings.json"))
        ? "tracked, one file"
        : "missing",
    ],
  ];
  for (const [what, said] of rows) {
    console.log(`${what.padEnd(18)} ${String(said).trim() || "missing"}`);
  }
  return 0;
}

function lspProxy() {
  const ran = outside.run([biome, "lsp-proxy", "--help"]);
  if (ran.exitCode !== 0) return "this biome carries no lsp-proxy";
  return asked([biome, "--version"]).replace(/^Version:\s*/, "biome ");
}

function asked(argv) {
  let ran;
  try {
    ran = outside.run(argv);
  } catch {
    return "missing";
  }
  return (ran.stdout || ran.stderr || "").split("\n")[0];
}

function namesIn(at, end) {
  return files
    .list(at)
    .filter((one) => one.kind === "file" && one.name.endsWith(end))
    .map((one) => one.name);
}

function readIf(path) {
  try {
    return files.read(path);
  } catch {
    return "never loaded here";
  }
}

function walk(where, wanted = /\.(md|markdown|txt)$/i) {
  const out = [];
  const SKIP = new Set([".git", "node_modules", ".se", ".claude", ".claude-plugin"]);
  const into = (path) => {
    for (const entry of files.list(path)) {
      if (SKIP.has(entry.name)) continue;
      const under = join(path, entry.name);
      if (entry.kind === "dir") into(under);
      else if (wanted.test(entry.name)) out.push(under);
    }
  };
  for (const one of where) {
    const path = join(root, one);
    try {
      into(path);
    } catch {
      if (wanted.test(path)) out.push(path);
    }
  }
  return out;
}

function show(file) {
  const path = String(file);
  const from = path.includes(root) ? relative(root, path) : path;
  return from.split(sep).join("/");
}
