// What the check runs past the tests: the server, the grid, the viewer, the
// projections, the plugin and the doors.
// [[spec/design_output/level0#the-check-reads-the-server]]

import { join, sep } from "node:path";
import { inherits, rooted } from "../../.claude/skills/level0/lib/layer.js";
import { validatePlugin } from "../../.claude/skills/level0/lib/plugin-check.js";
import { boxOf } from "../../.claude/skills/level0/lib/private.js";
import {
  entriesIn,
  PROJECTIONS,
  readAll,
  staleIn,
} from "../../.claude/skills/level0/lib/projection.js";
import { treeOf } from "../../.claude/skills/level0/lib/tree.js";
import { POINTER, PORT_BASE } from "../../.claude/skills/level0/lib/vehicle.js";
import { probeApart } from "./probe-dry.js";

export { deltaOf } from "./probe-dry.js";
import {
  CONTRACT,
  DOORS,
  files,
  go,
  HEALTH_WAIT,
  it,
  outside,
  PLUGIN,
  root,
} from "./cli-doors.js";
import { goEnvOf, goGate, goTestNames } from "./cli-go.js";
import { namesIn, show } from "./cli-read.js";
import { viewerOf } from "./tui-build.js";

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
    // The log verb reads a span against now, and a door answers the clock. [[spec/guidance/code/testing]]
    clock: it.clock,
    // The log verb reads its slice's mode, and runs quack under the method root. [[spec/tickets/readers-take-the-go-topics]]
    slices: it.slices,
    method: it.method,
  };
}

// The split verb writes files and a journal entry, and the clock names that entry. [[spec/design_output/level0#the-size-ceiling]]
export function splitDoors() {
  return { root, join, disk: files, clock: it.clock };
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

// Every Go module's tests run in the battery, the import rules among them. The one module stands at the root. [[spec/tickets/go-code-shares-one-module]]
// Under `check --errors` the run stays quiet, and each failing Go test reaches the error stream alone. [[spec/tickets/the-verbs-need-no-wrapper]]
export function goHolds(quiet = false, red = []) {
  const skip = skipOf(red, (path) => files.read(join(root, path)));
  // The gate names each run as quiet or not, and a quiet one keeps its output for the reader. [[spec/tickets/go-checks-need-go]]
  const run = (argv, asked) => {
    const ran = outside.run(argv, {
      cwd: root,
      env: goEnvOf(),
      inherit: !quiet && !asked.quiet,
    });
    if (quiet && ran.exitCode) {
      for (const row of String(ran.stdout ?? "").split("\n")) {
        if (/^\s*--- FAIL/.test(row)) console.error(row.trim());
      }
    }
    return ran;
  };
  return goGate({ go, run, say: (line) => console.log(line), quiet, skip });
}

// A red Go test file stands apart until its tests-green closes, as a red JavaScript one does, so the Go run skips the tests it names. [[spec/design_output/pull#the-gate]]
export function skipOf(red, read) {
  // A ticket names its red files in one comma-separated line. [[spec/design_output/pull#the-gate]]
  const paths = red.flatMap((one) => String(one).split(",")).map((one) => one.trim());
  const names = goTestNames(paths, read);
  return names.length ? ["-skip", `^(${names.join("|")})$`] : [];
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

// [[spec/design_output/schema#mint-writes-a-valid-note]]
// [[spec/design_output/schema#the-fields-a-caller-names]]

export function pluginHolds() {
  // One plugin stands, because the wrapper's trial ends kept. [[spec/design_output/work#an-experiment-decides]]
  for (const plugin of [PLUGIN]) {
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

// LEVEL ZERO RUNS, OR THE CHECK IS RED. A fresh clone of this tree, the working change on it, takes the install a cloud box takes, and the hook module the client loads runs a scripted session against the door the start road stands up, with no model and no key. The start road stands a cloud box alone, and a cloud box runs Linux, so a Windows desk says so and carries on. [[spec/tickets/level0-runs-on-the-door]]
export async function level0Runs(
  dry = probeApart,
  platform = process.platform,
  say = console.log,
  shout = console.error,
) {
  if (platform === "win32") {
    say("The start road stands a cloud box alone, so this Windows box runs no dry session.");
    return 0;
  }
  const lines = [];
  const code = await dry(root, it, (one) => lines.push(one));
  for (const one of lines) (code ? shout : say)(one);
  if (code) shout("Level zero does not run whole on a fresh box, so this tree is red.");
  return code;
}

// What the probe found, and whether the check carries on past it. A box running no server reads every rule, and a server standing and failing its health call is red. [[spec/design_output/level0#the-check-reads-the-server]]
export function serverRead(said) {
  if (said?.ok) return { code: 0, line: `The server stands at ${said.where}.` };
  if (said?.answers) {
    return {
      code: 1,
      red: true,
      line: `The server at ${said.where} fails its health call: ${said.why}`,
    };
  }
  return {
    code: 0,
    line: `No server answers at ${said?.where}, so the rules run without one. Start it with ./RUNME.sh serve, or the hook button in the sidebar.`,
  };
}

// [[spec/design_output/level0#the-check-reads-the-server]]
export async function serverHolds(get = fetch) {
  const read = serverRead(await serverSays(get));
  if (read.red) console.error(read.line);
  else console.log(read.line);
  return read.code;
}

// The answer of the probe: whether a server answers at all, and what it says of itself where it does. [[spec/design_output/level0#the-check-reads-the-server]]
export async function serverSays(get = fetch) {
  const where = `http://127.0.0.1:${portHere()}/health`;
  try {
    const answer = await get(where, { signal: AbortSignal.timeout(HEALTH_WAIT) });
    const body = await answer.json();
    return {
      answers: true,
      ok: Boolean(body?.ok),
      where,
      why: String(body?.dead ?? ""),
    };
  } catch (bad) {
    return { answers: false, ok: false, where, why: bad?.message ?? String(bad) };
  }
}

export function portHere() {
  try {
    return Number(JSON.parse(files.read(join(root, POINTER)))?.port) || PORT_BASE;
  } catch {
    return PORT_BASE;
  }
}

// The stamp the check leaves stands in cli-stamp.js. [[spec/design_output/work#the-battery-answers-first]]

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
