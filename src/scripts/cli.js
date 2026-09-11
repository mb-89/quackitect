// The command line. RUNME hands every argument through untouched, and every
// verb here calls the same checkers the write door calls.

import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  bindsHere,
  canary,
  countsOf,
  standingLayer,
} from "../../.claude/skills/level0/lib/guidance.js";
import { HEALTH, healthOf } from "../../.claude/skills/level0/lib/health.js";
import { asRow, rowsOf } from "../../.claude/skills/level0/lib/log.js";
import { line as asLine } from "../../.claude/skills/level0/lib/refuse.js";
import {
  entriesIn,
  PROJECTIONS,
  readAll,
  staleIn,
} from "../../.claude/skills/level0/lib/projection.js";
import { STAMP } from "../../.claude/skills/level0/lib/runs.js";
import { isDraft } from "../../.claude/skills/level0/lib/paths.js";
import {
  END as SCHEMA_END,
  mintNote,
  readYaml,
  schemaFaults,
  SCHEMAS,
} from "../../.claude/skills/level0/lib/schema.js";
import { treeFaults, treeOf } from "../../.claude/skills/level0/lib/tree.js";
import { EDITOR_SETTINGS } from "../../.claude/skills/level0/lib/servers.js";
import { calmed, SHOUTED } from "../../.claude/skills/level0/lib/shout.js";
import { configOf, LOCAL, SCHEMA } from "../../.claude/skills/level0/lib/config.js";
import {
  faultsIn as faultsInGrid,
  lineOf,
  RULE as GRID,
} from "../extension/lib/grid.js";
import { TOOLS, WANTED } from "../../.claude/skills/level0/lib/tools.js";
import {
  CONFIG,
  faultIn,
  fromJson,
  unreasoned,
} from "../../.claude/skills/level0/lib/vale.js";
import { clock } from "../doors/clock.js";
import { disk } from "../doors/disk.js";
import { git } from "../doors/git.js";
import { log } from "../doors/log.js";
import { proc } from "../doors/proc.js";
import { readTools, whereIs, writeSurvey } from "./tools.js";
import { work } from "./work.js";
import { validatePlugin } from "../../.claude/skills/level0/lib/plugin-check.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

// [[spec/design_output/config#the-resolver-holds-the-layers]]
function configHere(files) {
  return configOf({
    read: async (path) => files.read(join(root, path)),
    write: async (path, text) => files.write(join(root, path), text),
    makeDir: async (path) => files.makeDir(join(root, path)),
    readEnv: async (names) =>
      Object.fromEntries(names.map((name) => [name, process.env[name] ?? ""])),
  });
}

async function doorsHere() {
  const outside = proc();
  const files = disk();
  const time = clock();
  const said = configHere(files);
  return {
    proc: outside,
    disk: files,
    clock: time,
    git: git(outside, root),
    log: log(files, time, {
      folder: join(root, ".se", "log"),
      level: await said.ask("log.level"),
    }),
    config: said,
    words: await said.ask("names.words"),
    node: process.execPath,
    join,
  };
}

const it = await doorsHere();
const files = it.disk;
const outside = it.proc;

const known = readTools(files, root);
const bin = whereIs(files, root, "vale", known);
const lnav = whereIs(files, root, "lnav", known);
const LOG = join(root, ".se", "log");
const STYLES = join(root, "spec", "config", "styles", "VoiceVale");
const JUDGED = join(root, "spec", "config", "styles", "VoiceJudged");
const SHAPE = join(root, "spec", "config", "styles", "VoiceShape");
const SCRIPTED = join(root, "spec", "config", "styles", "VoiceScript");
const biome = whereIs(files, root, "biome", known);
const GUIDANCE = join(root, "spec", "guidance");
const DOORS = join(root, "src", "doors");
const PLUGIN = join(".claude", "skills", "level0");
const CONTRACT = join(root, "test", "contract");
const settings = it.config;
const PARKED = ["{.se,node_modules,.git}/**", "**/_*"];
const OURS = `--glob=!{${PARKED.join(",")}}`;
const TESTS = "test/level0/*.test.js";
const CONTRACT_TESTS = "test/contract/*.test.js";
const ROUNDS = 5;

const run = async (argv, init = {}) =>
  outside.run(argv, { ...init, cwd: init.cwd ?? root });

const verbs = {
  check: {
    says: "the tests, the doors, the cage, then the rules over the tree",
    run: async (w) =>
      stamped(
        test() ||
          doorsHold() ||
          projectionsHold() ||
          pluginHolds() ||
          cageHolds() ||
          (await lint(w)),
      ),
  },
  lint: { says: "the rules over the tree, or over what you name", run: lint },
  fix: { says: "the fixes a program can make", run: fix },
  test: { says: "the tests alone", run: async () => test() },
  rules: { says: "the mechanical rules Vale holds", run: async () => listRules() },
  standing: {
    says: "what level zero hands the agent every session",
    run: () => standing(),
  },
  doctor: {
    says: "what is installed, and what level zero found",
    run: () => doctor(),
  },
  tools: {
    says: "ask this box where every tool stands, and write it down",
    run: async () => tools(),
  },
  doors: {
    says: "every door, and the contract test that holds it",
    run: async () => doorsHold(),
  },
  project: {
    says: "write every projection again, from the source it names",
    run: async () => project(),
  },
  config: {
    says: "every key, its value, and the layer answering it",
    run: async () => readConfig(rest),
  },
  work: {
    says: "work branches: new, take, read, review, list",
    run: async () => work(root, rest, it),
  },
  mint: {
    says: "write a new note of a kind, in the shape its schema names",
    run: async () => mint(rest),
  },
  log: {
    says: "what every door says, through lnav where it stands",
    run: async () => readLog(rest),
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
  const began = it.clock.now().getTime();

  const ran = await run([
    bin,
    `--config=${CONFIG}`,
    "--output=JSON",
    "--no-exit",
    OURS,
    ...where,
  ]);
  const fault = faultIn(ran.stdout) || (ran.exitCode !== 0 && !ran.stdout ? ran.stderr.trim() : "");
  if (fault) {
    console.error(fault);
    console.error("Vale read no file, so every rule it holds stands unchecked.");
    return 1;
  }
  const found = fromJson(ran.stdout);

  for (const file of walk(where)) {
    for (const one of unreasoned(files.read(file))) {
      found.push({ ...one, file: show(file) });
    }
  }

  // [[spec/design_output/tree#when-the-sweep-runs]]
  if (where.includes(".")) {
    const tree = treeHere();
    found.push(...treeFaults(tree));
    found.push(...schemaFaults(tree));
  }

  found.push(...gridFaults(where));

  if (files.exists(biome)) {
    const code = outside.run(
      [biome, "lint", "--config-path=spec/config", "--reporter=github", ...where],
      { cwd: root },
    );
    for (const row of code.stdout.split("\n")) {
      const hit = /^::(\w+) title=([^,]+),file=([^,]+),line=(\d+).*?::(.*)$/.exec(row);
      if (!hit || isDraft(hit[3])) continue;
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

  const ms = it.clock.now().getTime() - began;
  if (!found.length) {
    await it.log.say("info", "vale", `the rules pass over ${where.join(" ")}`, { ms });
    console.log("The rules pass.");
    return 0;
  }
  await it.log.say("warn", "vale", `${found.length} line(s) break a rule`, {
    ms,
    detail: found
      .slice(0, 3)
      .map((one) => `${show(one.file ?? where[0])}:${one.line} ${one.rule}`)
      .join(", "),
  });

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

  // [[spec/design_output/schema#warning-now-and-error-later]]
  const refused = found.filter((one) => one.severity !== "warning").length;
  if (refused) return 1;
  console.log("");
  console.log(`${found.length} stand at warning, which the panel draws and check allows.`);
  return 0;
}

// [[spec/design_output/tree#the-tree-handed-in]]
function treeHere() {
  return treeOf({
    disk: files,
    git: it.git,
    root,
    words: it.words,
    node: process.version.replace(/^v/, ""),
  });
}

// [[spec/design_output/extension#the-grid-check]]
function gridFaults(where) {
  const at = join(root, SCHEMA);
  const reaches = where.some((one) => SCHEMA.startsWith(show(join(root, one))));
  if (!reaches || !files.exists(at)) return [];

  const text = files.read(at);
  return faultsInGrid(JSON.parse(text)).map((one) => ({
    file: SCHEMA,
    rule: GRID,
    line: lineOf(text, one.key),
    column: 1,
    message: one.why,
    severity: "error",
  }));
}

// [[spec/design_output/log#lnav-and-how-it-installs]]
function lnavHere() {
  if (files.exists(lnav)) return lnav;
  try {
    return outside.run(["lnav", "-V"]).exitCode === 0 ? "lnav" : "";
  } catch {
    return "";
  }
}

// [[spec/design_output/log#the-verb]]
function readLog(argv) {
  const names = files.exists(LOG) ? namesIn(LOG, ".jsonl").sort() : [];
  if (!names.length) {
    console.log("No log stands yet. A door writes one the next time it says a line.");
    return 0;
  }

  const all = argv.includes("--all");
  const newest = names[names.length - 1];
  const viewer = lnavHere();
  if (viewer) {
    return outside.run([viewer, all ? LOG : join(LOG, newest)], {
      cwd: root,
      inherit: true,
    }).exitCode;
  }

  for (const name of all ? names : [newest]) {
    console.log(name);
    for (const one of rowsOf(files.read(join(LOG, name)))) console.log(asRow(one));
  }
  console.log("");
  console.log("lnav draws these rows, and opens the rest of a line under it.");
  console.log("Run ./RUNME.sh once, which installs it into .se/bin.");
  return 0;
}

// [[spec/design_output/config#the-verb-names-the-layer]]
async function readConfig(argv) {
  const [key, ...said] = argv.filter((one) => !one.startsWith("-"));

  if (key && said.length) {
    const wrote = await settings.write(key, said.join(" "));
    console.log(`${wrote.key} is ${JSON.stringify(wrote.value)} in ${wrote.layer}.`);
    return 0;
  }

  const rows = await settings.all();
  const wanted = key ? rows.filter((one) => one.key === key) : rows;
  if (key && !wanted.length) {
    console.error(`No layer answers ${key}. Run ./RUNME.sh config to see every key.`);
    return 2;
  }
  for (const one of wanted) {
    console.log(
      `${one.key.padEnd(22)} ${String(one.value).padEnd(9)} ${one.layer}`,
    );
  }
  if (key) return 0;

  for (const fault of await settings.faults()) {
    console.error(`${fault}, and the code reading it finds nothing.`);
  }
  console.log("");
  console.log(`Write one: ./RUNME.sh config <key> <value>, which lands in ${LOCAL}.`);
  return 0;
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

// [[spec/design_output/projection#what-goes-where-is-data]]
function projections() {
  const at = join(root, PROJECTIONS);
  return files.exists(at) ? entriesIn(files.read(at)) : [];
}

function under(path) {
  return join(root, String(path).split("/").join(sep));
}

// [[spec/design_output/projection#check-refuses-a-stale-one]]
function projectionsHold() {
  const entries = projections();
  if (!entries.length) {
    console.log(`${PROJECTIONS} names no projection, so nothing is projected.`);
    return 0;
  }

  const said = readAll(entries, files, under);
  const found = staleIn(said.wanted, said.standing);
  if (!found.length) {
    console.log(`${entries.length} projection(s), and every target reads as projected.`);
    return 0;
  }
  for (const one of found) console.error(`${one.path} ${one.how}`);
  console.error("A projection is read-only, so edit the source it names instead.");
  console.error("Run ./RUNME.sh project, which writes every target again.");
  return 1;
}

// [[spec/design_output/projection#who-projects-and-when]]
function project() {
  const entries = projections();
  const { wanted, standing } = readAll(entries, files, under);

  for (const [path, text] of wanted) {
    files.makeDir(dirname(under(path)));
    if (standing.get(path) !== text) files.write(under(path), text);
  }
  for (const path of standing.keys()) {
    if (!wanted.has(path)) files.remove(under(path));
  }

  console.log(`${wanted.size} file(s) projected from ${entries.length} projection(s).`);
  return 0;
}

// [[spec/design_output/schema#mint-writes-a-valid-note]]
function mint(argv) {
  const [kind, path] = argv.filter((one) => !one.startsWith("-"));
  const kinds = namesIn(join(root, SCHEMAS), SCHEMA_END)
    .map((name) => name.slice(0, -SCHEMA_END.length))
    .sort();

  if (!kind || !path) {
    console.error("Usage: ./RUNME.sh mint <kind> <path>\n");
    console.error(`${SCHEMAS} holds ${kinds.join(", ")}.`);
    return 2;
  }
  if (!kinds.includes(kind)) {
    console.error(`${SCHEMAS} holds no ${kind}. It holds ${kinds.join(", ")}.`);
    return 2;
  }

  const at = under(path);
  if (files.exists(at)) {
    console.error(`${path} stands already. Name a path nothing holds yet.`);
    return 2;
  }

  const schema = readYaml(files.read(join(root, SCHEMAS, `${kind}${SCHEMA_END}`)));
  files.makeDir(dirname(at));
  files.write(at, mintNote(schema));
  console.log(`${path} stands, in the shape ${kind} names.`);
  console.log("Write it, then run ./RUNME.sh lint to read what is left.");
  return 0;
}

// [[spec/design_output/level0#no-computed-engine-access]]
function pluginHolds() {
  const ran = validatePlugin(outside.run, PLUGIN, root);
  if (ran.exitCode === 0) return 0;
  if (!ran.stdout && !ran.stderr) {
    console.log("claude stands nowhere, so the plugin goes unvalidated here.");
    return 0;
  }
  console.error(`${ran.stdout}${ran.stderr}`.trim());
  console.error("The engine reads this module's source, and it refuses the above.");
  return 1;
}

// [[spec/design_output/level0#god-mode]]
function cageHolds() {
  const at = join(root, HEALTH);
  if (!files.exists(at)) {
    console.log("Level zero loads in no session here yet, so it says nothing.");
    return 0;
  }
  const said = healthOf(files.read(at));
  if (said.ok) {
    console.log(`The cage holds, and it says so at ${said.at}.`);
    return 0;
  }
  console.error(`The cage holds nothing: ${said.why}`);
  console.error(`That session guards no write. Mend it, and ${HEALTH} turns green.`);
  return 1;
}

// [[spec/design_output/work#the-battery-answers-first]]
function stamped(code) {
  const sha = it.git.run(["rev-parse", "HEAD"], true).out;
  const clean = !it.git.run(["status", "--porcelain"], true).out;
  files.makeDir(join(root, ".se"));
  files.write(
    join(root, STAMP),
    `${JSON.stringify({ sha, ok: code === 0, clean, at: it.clock.now().toISOString() }, null, 2)}
`,
  );
  return code;
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
  for (const at of [STYLES, SHAPE, SCRIPTED]) {
    if (!files.exists(at)) continue;
    for (const name of namesIn(at, ".yml")) {
      const text = files.read(join(at, name));
      const message = /^message:\s*"?(.*?)"?\s*$/m.exec(text)?.[1] ?? "";
      console.log(`${name.replace(/\.yml$/, "").padEnd(20)} ${message}`);
    }
  }
  return 0;
}

async function standing() {
  if (!files.exists(GUIDANCE)) {
    console.error("There is no spec/guidance, so nothing is handed over.");
    return 2;
  }
  const notes = namesIn(GUIDANCE, ".md")
    .filter((name) => !isDraft(name))
    .map((n) => ({ name: n, text: files.read(join(GUIDANCE, n)) }))
    .filter(({ text }) => bindsHere(text, process.env));
  const said = standingLayer(notes);
  if (!said) {
    console.log("No guidance note carries an Actionables chapter.");
    return 0;
  }
  console.log(said);
  console.log("");
  const stop = (await settings.ask("stop.enabled")) !== false;
  console.log(canary({ ...countsOf(notes), stop }));
  return 0;
}

// [[spec/design_output/tools#where-a-caller-looks]]
function tools() {
  const found = writeSurvey(it, root, process.env);
  for (const one of WANTED)
    console.log(`${one.name.padEnd(18)} ${standsAt(found[one.name])}`);
  console.log(`\n${TOOLS} says this, and every caller reads it.`);
  return 0;
}

function standsAt(one) {
  if (!one) return "missing, run ./RUNME.sh";
  return [one.version, one.path].filter(Boolean).join("  ");
}

async function doctor() {
  const found = Object.keys(known).length ? known : writeSurvey(it, root, process.env);
  const rows = [
    ...WANTED.map((one) => [one.name, standsAt(found[one.name])]),
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
        ? `${namesIn(STYLES, ".yml").length} in VoiceVale, ${
            files.exists(SHAPE) ? namesIn(SHAPE, ".yml").length : 0
          } in VoiceShape, ${
            files.exists(SCRIPTED) ? namesIn(SCRIPTED, ".yml").length : 0
          } in VoiceScript`
        : "missing",
    ],
    [
      "judged rules",
      files.exists(JUDGED)
        ? `${namesIn(JUDGED, ".yml").length} in VoiceJudged`
        : "none",
    ],
    ["judge", await judgeStands()],
    [
      "survey",
      files.exists(join(root, TOOLS)) ? TOOLS : "absent, run ./RUNME.sh tools",
    ],
    ["level zero stamp", readIf(join(root, ".se", "level0.stamp"))],
    [
      "cage",
      files.exists(join(root, ".claude", "settings.json"))
        ? "tracked, one file"
        : "missing",
    ],
    ["cage holds", cageSays()],
  ];
  for (const [what, said] of rows) {
    console.log(`${what.padEnd(18)} ${String(said).trim() || "missing"}`);
  }
  return 0;
}

function cageSays() {
  const at = join(root, HEALTH);
  if (!files.exists(at)) return "no session says yet";
  const said = healthOf(files.read(at));
  return said.ok ? `yes, at ${said.at}` : `no, ${said.why}`;
}

async function judgeStands() {
  if ((await settings.ask("judge.enabled")) === false) {
    return `off in ${await settings.layerOf("judge.enabled")}`;
  }
  const model = await settings.ask("judge.model");
  return `on, model ${model} out of ${await settings.layerOf("judge.model")}`;
}

function lspProxy() {
  const ran = outside.run([biome, "lsp-proxy", "--help"]);
  return ran.exitCode === 0 ? "this biome carries one" : "this biome carries none";
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
      if (SKIP.has(entry.name) || isDraft(entry.name)) continue;
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
