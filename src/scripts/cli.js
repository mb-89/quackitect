// The command line. RUNME hands every argument through untouched, and every
// verb here calls the same checkers the write door calls.

import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  bindsHere,
  canary, canaryText,
  countsOf,
  standingLayer,
} from "../../.claude/skills/level0/lib/guidance.js";
import { asRow, OLD, rowsOf, SESSION } from "../../.claude/skills/level0/lib/log.js";
import { POINTER, PORT_BASE } from "../../.claude/skills/level0/lib/vehicle.js";
import { withoutFalsePast } from "../bridge/tense.js";
import { line as asLine } from "../../.claude/skills/level0/lib/refuse.js";
import {
  entriesIn,
  PROJECTIONS,
  readAll,
  staleIn,
} from "../../.claude/skills/level0/lib/projection.js";
import { STAMP } from "../../.claude/skills/level0/lib/runs.js";
import { isDraft } from "../../.claude/skills/level0/lib/paths.js";
import { CONFIG_DIR, fromJson as codeRows } from "../../.claude/skills/level0/lib/code.js";
import { boxOf } from "../../.claude/skills/level0/lib/private.js";
import {
  fieldsIn,
  mintedNote,
  schemaFaults,
  SCHEMAS,
  schemasIn,
} from "../../.claude/skills/level0/lib/schema.js";
import {
  stopFolderIsData,
  treeFaults,
  treeOf,
} from "../../.claude/skills/level0/lib/tree.js";
import { EDITOR_SETTINGS } from "../../.claude/skills/level0/lib/servers.js";
import { calmed, SHOUTED } from "../../.claude/skills/level0/lib/shout.js";
import {
  configOf,
  LOCAL,
  SCHEMA,
  TRACKED,
} from "../../.claude/skills/level0/lib/config.js";
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
import { codeFaults } from "../../.claude/skills/level0/lib/magic.js";
import { SIZED } from "../../.claude/skills/level0/lib/size.js";
import { clock } from "../doors/clock.js";
import { disk } from "../doors/disk.js";
import { git } from "../doors/git.js";
import { log } from "../doors/log.js";
import { proc } from "../doors/proc.js";
import { homeIn, linkedAt, manifestPath, registered } from "./editor.js";
import { readTools, whereIs, writeSurvey } from "./tools.js";
import { SHARED, SOURCE as VIEWER, viewerOf } from "./viewer.js";
import {
  detach,
  entryFor,
  produce,
  registerCopy,
  readRegister,
  rootsHere,
} from "./vehicle.js";
import { attachTo } from "../bridge/vehicle.js";
import { stubInto } from "./stub.js";
import { HOOKS } from "./precommit.js";
import { graphIn } from "./graph.js";
import { withRoute } from "./process.js";
import { probe } from "./probe.js";
import { voice } from "./voice.js";
import { retro } from "./retro.js";
import { ticket } from "./ticket.js";
import { cloud, work } from "./work.js";
import { validatePlugin } from "../../.claude/skills/level0/lib/plugin-check.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

// [[spec/design_output/vehicle#the-work-root-inherits]]
function atRoot(path) {
  const said = String(path ?? "");
  return said.startsWith("/") || /^[A-Za-z]:/.test(said) ? said : join(root, said);
}

// [[spec/design_output/config#the-resolver-holds-the-layers]]
function configHere(files, pair) {
  return configOf({
    tracked: pair?.itself === false ? [join(pair.method, TRACKED), TRACKED] : [TRACKED],
    schema: pair?.itself === false ? join(pair.method, SCHEMA) : SCHEMA,
    read: async (path) => files.read(atRoot(path)),
    write: async (path, text) => files.write(atRoot(path), text),
    makeDir: async (path) => files.makeDir(atRoot(path)),
    readEnv: async (names) =>
      Object.fromEntries(names.map((name) => [name, process.env[name] ?? ""])),
  });
}

async function doorsHere() {
  const outside = proc();
  const files = disk();
  const time = clock();
  const said = configHere(files, rootsHere(files, process.env, root));
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
    stale: await said.ask("work.staleAfter"),
    fails: await said.ask("work.failsBeforePerson"),
    refusals: await said.ask("work.refusalsBeforePerson"),
    splits: await said.ask("work.stepsBeforeSplit"),
    // [[spec/design_output/pull#the-hand-rule]]
    agent: Boolean(process.env.CLAUDECODE || process.env.CLAUDE_CODE_REMOTE || process.env.SE_CLOUD),
    cloud: Boolean(process.env.CLAUDE_CODE_REMOTE || process.env.SE_CLOUD),
    node: process.execPath,
    join,
  };
}

const it = await doorsHere();
const files = it.disk;
const outside = it.proc;

const known = readTools(files, root);
const bin = whereIs(files, root, "vale", known);
// [[spec/design_output/pull#the-voice-reads-the-evidence]]
it.vale = bin;
const go = whereIs(files, root, "go", known);
const LOG = join(root, ".se", "log");
const STYLES = join(root, "spec", "config", "styles", "VoiceVale");
const SHAPE = join(root, "spec", "config", "styles", "VoiceShape");
const SCRIPTED = join(root, "spec", "config", "styles", "VoiceScript");
const biome = whereIs(files, root, "biome", known);
const lsp = whereIs(files, root, "se-lsp", known);
const GUIDANCE = join(root, "spec", "guidance");
const DOORS = join(root, "src", "doors");
const PLUGIN = join(".claude", "skills", "level0");
const LEVEL1 = join(".claude", "skills", "level1");
const CONTRACT = join(root, "test", "contract");
const settings = it.config;
const PARKED = ["{.se,node_modules,.git,.claude/types,.claude/worktrees}/**", "**/_*"];
const OURS = `--glob=!{${PARKED.join(",")}}`;
const TESTS = "test/level0/*.test.js";
const CONTRACT_TESTS = "test/contract/*.test.js";
const ROUNDS = 5;
const COL = { verb: 8, count: 6, key: 22, value: 9, rule: 20, tool: 18 };
const SHOWN = 3;
const HEALTH_WAIT = 2000;

const run = async (argv, init = {}) =>
  outside.run(argv, { ...init, cwd: init.cwd ?? root });

const verbs = {
  check: {
    says: "the tests, the doors, the server, then the rules over the tree",
    run: async (w) =>
      stamped(
        test() ||
          viewerHolds() ||
          doorsHold() ||
          projectionsHold() ||
          pluginHolds() ||
          (await serverHolds()) ||
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
  branch: {
    says: "work branches and groups: new, take, sync, done, list, merge, close, pull, test",
    run: async () => work(root, rest, it),
  },
  cloud: {
    says: "the cloud routine: trigger",
    run: async () => cloud(root, rest, it),
  },
  ticket: {
    says: "tickets that stay on this box: note, update, open, todo",
    run: async () => ticket(root, rest, it),
  },
  retro: {
    says: "the retro a group's route runs: notes",
    run: async () => retro(root, rest, it),
  },
  mint: {
    says: "write a new note of a kind, in the shape its schema names",
    run: async () => mint(rest),
  },
  graph: {
    says: "a process or a ticket, drawn as the graph the editor reads",
    run: async () => drawing(rest),
  },
  probe: {
    says: "measure the client itself: compact says what a compaction keeps",
    run: async () => probe(root, rest, it, whereIs(files, root, "claude", known)),
  },
  voice: {
    says: "measure scores a folder, and refused ranks what the doors turn away",
    run: async () => voice(root, rest, it, bin),
  },
  log: {
    says: "what every door says, in the viewer this tree builds",
    run: async () => readLog(rest),
  },
  serve: {
    says: "the server behind the bridgehead, under the debugger with --inspect",
    run: async () => serveBridge(rest),
  },
  find: {
    says: "every line carrying the words, out of the index",
    run: async () => asksIndex(["find", ...rest]),
  },
  vehicle: {
    says: "this copy, the project it drives, and a copy made elsewhere",
    run: async () => theVehicle(rest),
  },
  stub: {
    says: "a bare project this vehicle drives: into <folder> [--upstream <url>]",
    run: async () => theStub(rest),
  },
  notes: {
    says: "the notes the words belong to, ranked by name and body",
    run: async () => asksIndex(["notes", ...rest]),
  },
  links: {
    says: "what reaches a note, and what reaches nothing",
    run: async () => asksIndex(rest.length ? ["links", ...rest] : ["dangling"]),
  },
  index: {
    says: "the index itself: standing, reindex, or same <path>",
    run: async () => asksIndex(rest.length ? rest : ["standing"]),
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
    console.log(`  ${name.padEnd(COL.verb)} ${one.says}`);
  }
  process.exit(verb === "help" ? 0 : 2);
}
process.exit((await verbs[verb].run(where.length ? where : ["."])) ?? 0);

// [[spec/design_output/vehicle#three-things-a-copy-needs]]
function theVehicle(argv) {
  const env = process.env;
  const said = argv[0] ?? "here";
  const pair = rootsHere(files, env, root);
  const made = entryFor(files, it.clock, env, pair.method, version());

  if (said === "produce" || said === "into") {
    const dest = argv[1];
    if (!dest) {
      console.error("se vehicle produce <folder>: say where the copy lands.");
      return 2;
    }
    const put = produce(files, pair.method, dest, said === "into");
    if (!put.ok) {
      console.error(put.why);
      return 1;
    }
    console.log(`${put.count} file(s) copied into ${dest}.`);
    console.log("It makes its own identity the first time it runs.");
    return 0;
  }
  if (said === "attach") {
    const settled = attachTo(files, env, it.clock, pair.work, pair.method);
    console.log(`${pair.work} names ${made.id} as the copy driving it, at port ${settled.port}.`);
    return 0;
  }
  if (said === "detach") {
    detach(files, pair.work);
    console.log(`${pair.work} names no driver, so the next start asks again.`);
    return 0;
  }
  if (said === "register") {
    const wrote = registerCopy(files, env, made.entry);
    console.log(wrote ? `${made.id} stands in the register.` : "no register takes a write here.");
    return wrote ? 0 : 1;
  }

  console.log(`method  ${pair.method}`);
  console.log(`work    ${pair.work}`);
  console.log(`copy    ${made.id}${pair.itself ? "  (this tree drives itself)" : ""}`);
  for (const one of readRegister(files, env)) {
    console.log(`  ${one.id}  ${one.version}  ${one.method_root}`);
  }
  return 0;
}

// [[spec/design_output/vehicle#a-stub-takes-its-vehicle]]
function theStub(argv) {
  const flag = argv.indexOf("--upstream");
  const upstream = flag >= 0 ? (argv[flag + 1] ?? "") : "";
  const plain = flag < 0 ? argv : argv.filter((_one, i) => i !== flag && i !== flag + 1);
  const dest = plain[1];
  if (plain[0] !== "into" || !dest) {
    console.error("se stub into <folder> [--upstream <url>]: say where the stub lands.");
    return 2;
  }
  const pair = rootsHere(files, process.env, root);
  const put = stubInto(files, git(outside, pair.method), it.clock, pair.method, atRoot(dest), {
    upstream,
  });
  if (!put.ok) {
    console.error(put.why);
    return 1;
  }
  console.log(`${put.files.length} file(s) written into ${dest}.`);
  console.log("Its shim finds the vehicle through SE_VEHICLE, the register, or where a cloud box clones it.");
  return 0;
}

function version() {
  try {
    return JSON.parse(files.read(join(root, "package.json"))).version ?? "0";
  } catch {
    return "0";
  }
}

// [[spec/design_output/index#the-door-owns-the-database]]
function asksIndex(argv) {
  const at = join(root, ".se", "bin", `se-index${process.platform === "win32" ? ".exe" : ""}`);
  if (!files.exists(at)) {
    console.error("The index stands unbuilt here, so nothing answers.");
    console.error("Run ./RUNME.sh once, which builds it where a C compiler stands.");
    return 1;
  }

  const said = it.proc.run([at, ...argv], { cwd: root, inherit: true });
  return said.exitCode;
}

// [[spec/design_output/level0#the-tense-reader]]
function readThroughTheReader(found) {
  const byFile = new Map();
  for (const one of found) {
    const list = byFile.get(one.file) ?? [];
    list.push(one);
    byFile.set(one.file, list);
  }
  const kept = [];
  for (const [file, list] of byFile) {
    let text = "";
    try {
      text = files.read(join(root, file));
    } catch {}
    kept.push(...withoutFalsePast(text, list));
  }
  return kept;
}

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
  const found = readThroughTheReader(fromJson(ran.stdout));

  for (const file of walk(where)) {
    for (const one of unreasoned(files.read(file))) {
      found.push({ ...one, file: show(file) });
    }
  }

  // The check names what stands past a ceiling as a warning, and the write door refuses the growth. [[spec/design_output/level0#the-size-ceiling]]
  const ceilings = {
    function: await it.config.ask("code.functionLines"),
    file: await it.config.ask("code.fileLines"),
  };
  for (const file of walk(where, SIZED)) {
    found.push(...codeFaults(files.read(file), show(file), ceilings));
  }

  // [[spec/design_output/lsp#one-checker-every-front-asks]]
  const said = serverFaults(where);
  if (said) found.push(...said);

  // [[spec/design_output/tree#when-the-sweep-runs]]
  if (where.includes(".")) {
    const tree = treeHere();
    if (said) {
      // [[spec/design_output/lsp#one-checker-every-front-asks]]
      found.push(...stopFolderIsData(tree));
    } else {
      found.push(...treeFaults(tree));
      found.push(...schemaFaults(tree));
    }
  }

  found.push(...gridFaults(where));

  if (files.exists(biome)) {
    const code = outside.run(
      [biome, "lint", `--config-path=${CONFIG_DIR}`, "--reporter=json", "--max-diagnostics=none", ...where],
      { cwd: root },
    );
    found.push(...codeRows(code.stdout, where[0]).filter((one) => !isDraft(one.file)));
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
      .slice(0, SHOWN)
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
    console.log(`${String(count).padStart(COL.count)}  ${rule}`);
  }
  console.log(`${String(found.length).padStart(COL.count)}  in all`);

  // [[spec/design_output/schema#warning-now-and-error-later]]
  const refused = found.filter((one) => one.severity !== "warning").length;
  if (refused) return 1;
  console.log("");
  console.log(`${found.length} stand at warning, which the panel draws and check allows.`);
  return 0;
}

// [[spec/design_output/tree#the-tree-handed-in]]
// [[spec/design_output/lsp#one-checker-every-front-asks]]
function serverFaults(where) {
  if (!files.exists(lsp)) return null;
  const ran = outside.run([lsp, "check", ...where], { cwd: root });
  if (ran.exitCode !== 0) return null;
  try {
    const said = JSON.parse(ran.stdout || "[]");
    return Array.isArray(said) ? said : null;
  } catch {
    return null;
  }
}

function treeHere() {
  return treeOf({
    disk: files,
    git: it.git,
    root,
    words: it.words,
    node: process.version.replace(/^v/, ""),
    box: boxOf(process.env, it.git),
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

// The server runs as its own node process, so the debugger attaches to it and a restart loses the session nothing. [[spec/design_output/level0#the-bridgehead-and-the-server]]
function serveBridge(argv) {
  const inspect = argv.filter((one) => one.startsWith("--inspect"));
  const server = join(root, "src", "bridge", "server.js");
  return outside.run([process.execPath, ...inspect, server, root], { cwd: root, inherit: true, env: inspect.length ? { SE_BREAK_ON_STOP: "1" } : undefined }).exitCode;
}

// [[spec/design_output/viewer#the-verb-builds-it]]
function readLog(argv) {
  const plain = argv.includes("--plain");
  const viewer = plain ? { exe: "", why: "" } : viewerHere();
  if (viewer.why) console.error(viewer.why);
  const session = join(root, SESSION);
  if (viewer.exe) {
    files.makeDir(LOG);
    return outside.run([viewer.exe, session], { cwd: root, inherit: true }).exitCode;
  }

  const old = join(root, OLD);
  const read = [
    ...(argv.includes("--all") && files.exists(old)
      ? namesIn(old, ".jsonl").sort().map((name) => join(old, name))
      : []),
    ...(files.exists(session) ? [session] : []),
  ];
  if (!read.length) {
    console.log("No log stands yet. A writer starts one the next time it says a line.");
    return 0;
  }
  for (const path of read) {
    console.log(show(path));
    for (const one of rowsOf(files.read(path))) console.log(asRow(one));
  }
  if (!plain) {
    console.log("");
    console.log("Go builds the viewer these rows open in. Install Go, and run this again.");
  }
  return 0;
}

function viewerHere() {
  return viewerOf({
    disk: files,
    proc: outside,
    root: root.split(sep).join("/"),
    go,
    windows: process.platform === "win32",
  });
}

// [[spec/design_output/viewer#the-check-runs-its-tests]]
function viewerHolds() {
  const folders = [VIEWER];
  for (let at = 1; at < SHARED.length; at += 2) folders.push(SHARED[at]);
  let worst = 0;
  for (const folder of folders) {
    let ran;
    try {
      ran = outside.run([go, "test", "./..."], { cwd: join(root, folder), inherit: true });
    } catch {
      console.log("go stands nowhere, so the viewer's tests go unrun here.");
      return 0;
    }
    worst = worst || ran.exitCode;
  }
  return worst;
}

// [[spec/design_output/config#the-verb-names-the-layer]]
async function readConfig(argv) {
  const [key, ...said] = argv.filter((one) => !one.startsWith("-"));

  if (key && said.length) {
    const wrote = await settings.write(key, said.join(" "));
    // [[spec/design_output/log#a-setting-writes-a-line]]
    await it.log.say("info", "config", `${wrote.key} is ${wrote.value}`, { detail: wrote.layer });
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
      `${one.key.padEnd(COL.key)} ${String(one.value).padEnd(COL.value)} ${one.layer}`,
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
    outside.run([biome, "check", "--write", `--config-path=${CONFIG_DIR}`, ...where], {
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
  if (said.faults.length) {
    for (const one of said.faults) console.error(one);
    console.error("A source stands away from the shape beside it, so no target is written.");
    return 1;
  }
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
// [[spec/design_output/schema#the-fields-a-caller-names]]
function mint(argv) {
  const [kind, path] = argv.filter((one) => !one.startsWith("-"));
  const schemas = schemasIn(treeHere());
  const kinds = [...schemas.keys()].sort();

  if (!kind || !path) {
    console.error("Usage: ./RUNME.sh mint <kind> <path> [--field=value ...]\n");
    console.error(`${SCHEMAS} holds ${kinds.join(", ")}.`);
    console.error("A ticket takes --process=<name>, and the route and its hash copy in.");
    return 2;
  }

  const schema = schemas.get(kind);
  if (!schema) {
    console.error(`${SCHEMAS} holds no ${kind}. It holds ${kinds.join(", ")}.`);
    return 2;
  }

  const handed = fieldsIn(argv, schema);
  if (handed.why) {
    console.error(handed.why);
    return 2;
  }

  // [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
  const copied = withRoute(files, root, join, schema, handed.fields);
  if (copied.why) {
    console.error(copied.why);
    return 2;
  }

  const at = under(path);
  if (files.exists(at)) {
    console.error(`${path} stands already. Name a path nothing holds yet.`);
    return 2;
  }

  const made = mintedNote(schemas, { kind, path, fields: copied.fields });
  if (made.why) {
    console.error(made.why);
    return 2;
  }

  files.makeDir(dirname(at));
  files.write(at, made.text);
  console.log(`${path} stands, in the shape ${kind} names.`);
  for (const one of made.left) console.log(asLine(one, one.file));
  console.log("Write it, then run ./RUNME.sh lint to read what is left.");
  return 0;
}

// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
function drawing(argv) {
  const path = argv.filter((one) => !one.startsWith("-"))[0];
  if (!path) {
    console.error("Usage: ./RUNME.sh graph <process or ticket>\n");
    console.error("It answers the nodes and the edges as JSON, and draws nothing.");
    return 2;
  }
  const at = under(path);
  if (!files.exists(at)) {
    console.error(`${path} stands nowhere.`);
    return 2;
  }
  console.log(JSON.stringify(graphIn(files.read(at)), null, 2));
  return 0;
}

// [[spec/design_output/level0#no-computed-engine-access]]
function pluginHolds() {
  for (const plugin of [PLUGIN, LEVEL1]) {
    const ran = validatePlugin(outside.run, plugin, root);
    if (ran.exitCode === 0) continue;
    if (!ran.stdout && !ran.stderr) {
      console.log("claude stands nowhere, so the plugin goes unvalidated here.");
      return 0;
    }
    console.error(`${ran.stdout}${ran.stderr}`.trim());
    console.error("The engine reads this module's source, and it refuses the above.");
    return 1;
  }
  return 0;
}

// [[spec/design_output/level0#the-bridgehead-and-the-server]]
async function serverHolds() {
  const said = await serverSays();
  if (said.ok) {
    console.log(`The server stands at ${said.where}.`);
    return 0;
  }
  console.error(`No server answers at ${said.where}: ${said.why}`);
  console.error("Start it with ./RUNME.sh serve, or the hook button in the sidebar.");
  return 1;
}

async function serverSays() {
  const where = `http://127.0.0.1:${portHere()}/health`;
  try {
    const answer = await fetch(where, { signal: AbortSignal.timeout(HEALTH_WAIT) });
    const body = await answer.json();
    return { ok: Boolean(body?.ok), where, why: String(body?.dead ?? "") };
  } catch (bad) {
    return { ok: false, where, why: bad?.message ?? String(bad) };
  }
}

function portHere() {
  try {
    return Number(JSON.parse(files.read(join(root, POINTER)))?.port) || PORT_BASE;
  } catch {
    return PORT_BASE;
  }
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

// [[spec/guidance/code/testing]]
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
      console.log(`${name.replace(/\.yml$/, "").padEnd(COL.rule)} ${message}`);
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
  console.log(`\n${canaryText(canary({ ...countsOf(notes), stop: (await settings.ask("stop.enabled")) !== false }))}`);
  return 0;
}

// [[spec/design_output/tools#where-a-caller-looks]]
function tools() {
  const found = writeSurvey(it, root, process.env);
  for (const one of WANTED)
    console.log(`${one.name.padEnd(COL.tool)} ${standsAt(found[one.name])}`);
  console.log(`\n${TOOLS} says this, and every caller reads it.`);
  return 0;
}

function standsAt(one) {
  if (!one) return "missing, run ./RUNME.sh";
  return [one.version, one.path].filter(Boolean).join("  ");
}

// [[spec/design_output/extension#a-link-pointing-nowhere]]
function sidebarSays() {
  const home = homeIn(process.env);
  const folder = join(home, ".vscode", "extensions");
  if (!home || !files.exists(folder)) return "no editor folder on this box, so no link";

  const said = JSON.parse(files.read(manifestPath(root)));
  const id = `${said.publisher}.${said.name}`;
  const dest = join(folder, `${id}-${said.version}`);
  if (linkedAt(files, dest, dirname(manifestPath(root)))) {
    return registered(files, folder, id)
      ? `linked, and the list names ${id}`
      : `linked, and the list misses ${id}: run ./RUNME.sh`;
  }
  if (files.isLink(dest) && !files.exists(dest)) return "a link pointing nowhere: run ./RUNME.sh";
  if (files.isLink(dest)) return "a link into another tree: run ./RUNME.sh";
  if (files.exists(dest)) return "a copy in place of the link: run ./RUNME.sh";
  return "unlinked: run ./RUNME.sh";
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
    ["sidebar", sidebarSays()],
    ["commit hook", hooksSay()],
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
      "survey",
      files.exists(join(root, TOOLS)) ? TOOLS : "absent, run ./RUNME.sh tools",
    ],
    ["server", await serverLine()],
  ];
  for (const [what, said] of rows) {
    console.log(`${what.padEnd(COL.tool)} ${String(said).trim() || "missing"}`);
  }
  return 0;
}

// [[spec/design_output/private#two-doors-one-check]]
function hooksSay() {
  const at = join(HOOKS, "pre-commit");
  const push = join(HOOKS, "pre-push");
  if (!files.exists(join(root, at))) return `${at} stands nowhere`;
  if (!files.exists(join(root, push))) return `${push} stands nowhere`;

  const said = it.git.run(["config", "--get", "core.hooksPath"], true).out;
  if (said === HOOKS) return `${at} and ${push}, which git reads`;
  return `git reads ${said || "its own folder"}, so run ./RUNME.sh`;
}

async function serverLine() {
  const said = await serverSays();
  return said.ok ? `stands at ${said.where}` : `none at ${said.where}`;
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
