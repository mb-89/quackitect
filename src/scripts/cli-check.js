// What the check runs past the tests: the server, the grid, the viewer, the
// projections, the plugin, the doors, the rules and the sidebar.
// [[spec/design_output/level0#the-check]]

import { dirname, join, resolve, sep } from "node:path";
import { CONFIG_DIR } from "../../.claude/skills/level0/lib/code.js";
import { LOCAL } from "../../.claude/skills/level0/lib/config.js";
import { inherits, rooted } from "../../.claude/skills/level0/lib/layer.js";
import { validatePlugin } from "../../.claude/skills/level0/lib/plugin-check.js";
import { boxOf } from "../../.claude/skills/level0/lib/private.js";
import {
  entriesIn,
  PROJECTIONS,
  readAll,
  staleIn,
} from "../../.claude/skills/level0/lib/projection.js";
import { STAMP } from "../../.claude/skills/level0/lib/runs.js";
import { EDITOR_SETTINGS } from "../../.claude/skills/level0/lib/servers.js";
import { calmed, SHOUTED } from "../../.claude/skills/level0/lib/shout.js";
import { TOOLS, WANTED } from "../../.claude/skills/level0/lib/tools.js";
import { treeOf } from "../../.claude/skills/level0/lib/tree.js";
import { CONFIG, fromJson } from "../../.claude/skills/level0/lib/vale.js";
import { POINTER, PORT_BASE } from "../../.claude/skills/level0/lib/vehicle.js";
import { filesOn } from "../../.claude/skills/level0/lib/warnings.js";
import { guidanceHere } from "../bridge/guidance.js";
import {
  bin,
  biome,
  COL,
  CONTRACT,
  DOORS,
  files,
  GUIDANCE,
  go,
  HEALTH_WAIT,
  it,
  known,
  LEVEL1,
  lsp,
  OURS,
  outside,
  PLUGIN,
  ROUNDS,
  root,
  run,
  SCRIPTED,
  SHAPE,
  STYLES,
  settings,
} from "./cli-doors.js";
import { namesIn, show, walk, warningsStood } from "./cli-read.js";
import { homeIn, linkedAt, manifestPath, registered } from "./editor.js";
import { formatFaults, goEnvOf, goModulesIn } from "./go-tests.js";
import { HOOKS } from "./precommit.js";
import { writeSurvey } from "./tools.js";
import { viewerOf } from "./viewer.js";

export function serverFaults(where) {
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

export function treeHere() {
  return treeOf({
    disk: files,
    git: it.git,
    root,
    words: it.words,
    node: process.version.replace(/^v/, ""),
    box: boxOf(process.env, it.git),
  });
}

// The server runs as its own node process, so the debugger attaches to it and a restart loses the session nothing. [[spec/design_output/level0#the-bridgehead-and-the-server]]

export function tuiDoors() {
  return {
    root,
    join,
    disk: files,
    proc: outside,
    viewer: viewerHere,
    names: namesIn,
    show,
  };
}

export function viewerHere() {
  return viewerOf({
    disk: files,
    proc: outside,
    root: root.split(sep).join("/"),
    go,
    windows: process.platform === "win32",
  });
}

// Every Go module's tests run in the battery, the index's through the pinned Zig. [[spec/design_output/index#the-compiler-it-needs]]
export function goHolds() {
  const at = { disk: files, join, root };
  const env = goEnvOf(at);
  let worst = 0;
  for (const folder of goModulesIn(at)) {
    let ran;
    try {
      ran = outside.run([go, "test", "./..."], {
        cwd: join(root, folder),
        env,
        inherit: true,
      });
    } catch {
      console.log("go stands nowhere, so the Go tests go unrun here.");
      return 0;
    }
    worst = worst || ran.exitCode || goFormat(folder, env);
  }
  return worst;
}

// Go's own format rides in no other gate, so the check holds it. [[spec/design_output/index#the-compiler-it-needs]]
function goFormat(folder, env) {
  let ran;
  try {
    ran = outside.run(["gofmt", "-l", "."], { cwd: join(root, folder), env });
  } catch {
    return 0;
  }
  const faults = formatFaults(folder, ran.stdout);
  for (const one of faults) console.log(one);
  return faults.length ? 1 : 0;
}

// [[spec/design_output/config#the-verb-names-the-layer]]
export async function readConfig(argv) {
  const [key, ...said] = argv.filter((one) => !one.startsWith("-"));

  if (key && said.length) {
    const wrote = await settings.write(key, said.join(" "));
    // [[spec/design_output/log#a-setting-writes-a-line]]
    await it.log.say("info", "config", `${wrote.key} is ${wrote.value}`, {
      detail: wrote.layer,
    });
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

export async function fix(where) {
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

export async function calm(where) {
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

export function stamp(where) {
  return walk(where)
    .map((file) => `${file}\u0000${files.read(file)}`)
    .join("\u0000");
}

export function projections() {
  const at = join(root, PROJECTIONS);
  return files.exists(at) ? entriesIn(files.read(at)) : [];
}

// A target lands in the work root, and a source reads off both. [[spec/design_output/vehicle#the-work-root-inherits]]
export function under(path) {
  return join(it.work, String(path).split("/").join(sep));
}

function readsAll(entries) {
  return readAll(entries, inherits(files, it.method, it.work), rooted(files, it.work));
}

// [[spec/design_output/projection#check-refuses-a-stale-one]]
export function projectionsHold() {
  const entries = projections();
  if (!entries.length) {
    console.log(`${PROJECTIONS} names no projection, so nothing is projected.`);
    return 0;
  }

  const said = readsAll(entries);
  if (said.faults.length) {
    for (const one of said.faults) console.error(one);
    console.error(
      "A source stands away from the shape beside it, so no target is written.",
    );
    return 1;
  }
  const found = staleIn(said.wanted, said.standing);
  if (!found.length) {
    console.log(
      `${entries.length} projection(s), and every target reads as projected.`,
    );
    return 0;
  }
  for (const one of found) console.error(`${one.path} ${one.how}`);
  console.error("A projection is read-only, so edit the source it names instead.");
  console.error("Run ./RUNME.sh project, which writes every target again.");
  return 1;
}

// [[spec/design_output/projection#who-projects-and-when]]
export function project() {
  const entries = projections();
  const { wanted, standing } = readsAll(entries);

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

export function pluginHolds() {
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
export async function serverHolds() {
  const said = await serverSays();
  if (said.ok) {
    console.log(`The server stands at ${said.where}.`);
    return 0;
  }
  console.error(`No server answers at ${said.where}: ${said.why}`);
  console.error("Start it with ./RUNME.sh serve, or the hook button in the sidebar.");
  return 1;
}

export async function serverSays() {
  const where = `http://127.0.0.1:${portHere()}/health`;
  try {
    const answer = await fetch(where, { signal: AbortSignal.timeout(HEALTH_WAIT) });
    const body = await answer.json();
    return { ok: Boolean(body?.ok), where, why: String(body?.dead ?? "") };
  } catch (bad) {
    return { ok: false, where, why: bad?.message ?? String(bad) };
  }
}

export function portHere() {
  try {
    return Number(JSON.parse(files.read(join(root, POINTER)))?.port) || PORT_BASE;
  } catch {
    return PORT_BASE;
  }
}

// [[spec/design_output/work#the-battery-answers-first]]
export function stamped(code) {
  const sha = it.git.run(["rev-parse", "HEAD"], true).out;
  const clean = !it.git.run(["status", "--porcelain"], true).out;
  // The list the lint left, so a door reading the stamp counts the warnings without a lint of its own. [[spec/tickets/the-spawn-reaches-its-guidance]]
  const stood = warningsStood();
  const said = {
    sha,
    ok: code === 0,
    clean,
    at: it.clock.now().toISOString(),
    warnings: stood.length,
    files: filesOn(stood),
  };
  files.makeDir(join(root, ".se"));
  files.write(join(root, STAMP), `${JSON.stringify(said, null, 2)}\n`);
  return code;
}

// [[spec/guidance/code/testing]]

export function doorsHold() {
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

export function listRules() {
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

export async function standing(argv = []) {
  if (!files.exists(GUIDANCE)) {
    console.error("There is no spec/guidance, so nothing is handed over.");
    return 2;
  }
  const stop = (await settings.ask("stop.enabled")) !== false;
  const said = guidanceHere(files, it.method, it.work, process.env, stop, argv);
  if (!said.helper) {
    console.log("No guidance note carries an Actionables chapter.");
    return 0;
  }
  console.log(said.helper);
  console.log("");
  console.log(said.sentence);
  return 0;
}

// [[spec/design_output/tools#where-a-caller-looks]]
export function tools() {
  const found = writeSurvey(it, root, process.env);
  for (const one of WANTED)
    console.log(`${one.name.padEnd(COL.tool)} ${standsAt(found[one.name])}`);
  console.log(`\n${TOOLS} says this, and every caller reads it.`);
  return 0;
}

export function standsAt(one) {
  if (!one) return "missing, run ./RUNME.sh";
  return [one.version, one.path].filter(Boolean).join("  ");
}

// [[spec/design_output/extension#a-link-pointing-nowhere]]
export function sidebarSays() {
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
  if (files.isLink(dest) && !files.exists(dest))
    return "a link pointing nowhere: run ./RUNME.sh";
  if (files.isLink(dest)) return "a link into another tree: run ./RUNME.sh";
  if (files.exists(dest)) return "a copy in place of the link: run ./RUNME.sh";
  return "unlinked: run ./RUNME.sh";
}

export async function doctor() {
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
export function hooksSay() {
  const at = join(HOOKS, "pre-commit");
  const push = join(HOOKS, "pre-push");
  if (!files.exists(join(root, at))) return `${at} stands nowhere`;
  if (!files.exists(join(root, push))) return `${push} stands nowhere`;

  const said = it.git.run(["config", "--get", "core.hooksPath"], true).out;
  if (said === HOOKS) return `${at} and ${push}, which git reads`;
  return `git reads ${said || "its own folder"}, so run ./RUNME.sh`;
}

export async function serverLine() {
  const said = await serverSays();
  return said.ok ? `stands at ${said.where}` : `none at ${said.where}`;
}

export function lspProxy() {
  const ran = outside.run([biome, "lsp-proxy", "--help"]);
  return ran.exitCode === 0 ? "this biome carries one" : "this biome carries none";
}
