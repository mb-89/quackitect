// The command line. One verb a row, each one naming what it does and the
// function behind it, and the dispatch at the foot of the table.
// [[spec/design_output/level0#one-command-does-it]]

import { dirname, join } from "node:path";
import { RUN } from "../../.claude/skills/level0/lib/folders.js";
import { runsHere } from "../../.claude/skills/level0/lib/paths.js";
import { line as asLine } from "../../.claude/skills/level0/lib/refuse.js";
import { SCHEMAS, schemasIn } from "../../.claude/skills/level0/lib/schema.js";
import { fieldsIn, mintedNote } from "../../.claude/skills/level0/lib/schema-mint.js";
import { attachTo } from "../bridge/vehicle.js";
import { git } from "../doors/git.js";
import { whereIs } from "../engine/tools.js";
import { batteryOf } from "./battery.js";
import {
  commitDoors,
  doctor,
  doorsHold,
  fix,
  goHolds,
  listRules,
  pluginHolds,
  project,
  projectionsHold,
  readConfig,
  serverHolds,
  splitDoors,
  standing,
  tools,
  treeHere,
  tuiDoors,
  under,
} from "./cli-check.js";
import {
  atRoot,
  bin,
  COL,
  CONTRACT_TESTS,
  files,
  it,
  known,
  outside,
  root,
  TESTS,
} from "./cli-doors.js";
import { asksIndex, lint, version } from "./cli-read.js";
import { batteryRun, stamped } from "./cli-stamp.js";
import { graphIn } from "./graph.js";
import { probe } from "./probe.js";
import { withRoute } from "./process.js";
import { pullArgvOf } from "./pull-tool.js";
import { renaming, renamingText } from "./rename.js";
import { retro } from "./retro.js";
import { stubInto } from "./stub.js";
import { ticket } from "./ticket.js";
import {
  detach,
  entryFor,
  produce,
  readRegister,
  registerVehicle,
  rootsHere,
} from "./vehicle.js";
import { voice } from "./voice.js";
import { cloud, pulling, work } from "./work.js";

// The root reads the platform once, and the register road takes it off the hand. [[spec/design_output/doors#a-door-reads-the-outside]]
const WINDOWS = process.platform === "win32";
// The runner writes its TAP beside the stamp, so the battery's report names the slowest cases. [[spec/guidance/retro/effect]]
const TAP = `${RUN}/tests.tap`;

export const verbs = {
  check: {
    says: "the tests, the doors, the server, then the rules over the tree",
    // Each part runs timed, so the stamp carries the battery's report and a retro reads it. [[spec/guidance/retro/effect]]
    run: async (w) => {
      const { code, parts } = await batteryRun(
        [
          ["tests", () => test()],
          ["go", () => goHolds()],
          ["doors", () => doorsHold()],
          ["projections", () => projectionsHold()],
          ["plugin", () => pluginHolds()],
          ["server", () => serverHolds()],
          ["rules", () => lint(w)],
        ],
        it.clock,
      );
      return stamped(code, batteryOf(parts, tapHere()));
    },
  },
  lint: { says: "the rules over the tree, or over what you name", run: lint },
  fix: { says: "the fixes a program can make", run: fix },
  test: { says: "the tests alone", run: async () => test() },
  rules: { says: "the mechanical rules Vale holds", run: async () => listRules() },
  standing: {
    says: "what level zero hands the agent every session",
    run: () => standing(rest),
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
    says: "work branches and groups: new, take, sync, done, list, merge, close, test",
    run: async () => work(it.work, rest, it),
  },
  cloud: {
    says: "the cloud routine: trigger",
    run: async () => cloud(it.work, rest, it),
  },
  ticket: {
    says: "tickets: pull, note, update, open, todo",
    // You pull a ticket, and the engine takes the branch it stands on. [[spec/design_output/pull#the-hand-out]]
    run: async () =>
      rest[0] === "pull"
        ? pulling(it.work, pullArgvOf(rest), it)
        : ticket(it.work, rest, it),
  },
  retro: {
    says: "the retro a group's route runs: notes",
    run: async () => retro(it.work, rest, it),
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
  tui: {
    says: "the window this tree builds: the log, the work, and a tab it opens on",
    run: async () => (await import("./tui.js")).openTui(tuiDoors(), rest),
  },
  log: {
    says: "the session log, narrowed by span, level, kind and count",
    run: async () => (await import("./log-verb.js")).logVerb(tuiDoors(), rest),
  },
  split: {
    says: "cut a file past the ceiling into the targets you name, with one undo",
    run: async () => (await import("./split-verb.js")).splitVerb(splitDoors(), rest),
  },
  commit: {
    says: "read the message, land the commit, run the check, and push on green",
    run: async () => (await import("./commit-verb.js")).commitVerb(commitDoors(), rest),
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
    says: "this vehicle, the project it drives, and a vehicle made elsewhere",
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
  // [[spec/design_output/index#a-rename-reaches-a-name]]
  rename: {
    says: "move a name and rewrite every reach: rename <from> <to>",
    run: async () => renameHere(rest),
  },
};

export const argv = process.argv.slice(2);
export const verb = argv.find((a) => !a.startsWith("-")) ?? "help";
export const where = argv.filter((a) => !a.startsWith("-") && a !== verb);
export const rest = argv.slice(argv.indexOf(verb) + 1);

// [[spec/design_output/doors#a-script-guards-its-main]]
if (runsHere(import.meta.url, process.argv)) {
  if (verb === "help" || !verbs[verb]) {
    if (verb !== "help") console.error(`se: there is no verb called ${verb}\n`);
    console.log("Usage: ./RUNME.sh <verb> [path ...]\n");
    for (const [name, one] of Object.entries(verbs)) {
      console.log(`  ${name.padEnd(COL.verb)} ${one.says}`);
    }
    process.exit(verb === "help" ? 0 : 2);
  }
  process.exit((await verbs[verb].run(where.length ? where : ["."])) ?? 0);
}

// [[spec/design_output/vehicle#three-things-a-vehicle-needs]]
export function theVehicle(argv) {
  const env = process.env;
  const said = argv[0] ?? "here";
  const pair = rootsHere(files, env, root);
  const made = entryFor(files, it.clock, env, pair.method, version());

  if (said === "produce" || said === "into") {
    const dest = argv[1];
    if (!dest) {
      console.error("se vehicle produce <folder>: say where the vehicle lands.");
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
    const settled = attachTo(files, env, it.clock, pair.work, pair.method, WINDOWS);
    console.log(
      `${pair.work} names ${made.id} as the vehicle driving it, at port ${settled.port}.`,
    );
    return 0;
  }
  if (said === "detach") {
    detach(files, pair.work);
    console.log(`${pair.work} names no driver, so the next start asks again.`);
    return 0;
  }
  if (said === "register") {
    const wrote = registerVehicle(files, env, made.entry, WINDOWS);
    console.log(
      wrote ? `${made.id} stands in the register.` : "no register takes a write here.",
    );
    return wrote ? 0 : 1;
  }

  console.log(`method  ${pair.method}`);
  console.log(`work    ${pair.work}`);
  console.log(`vehicle ${made.id}${pair.itself ? "  (this tree drives itself)" : ""}`);
  for (const one of readRegister(files, env, WINDOWS)) {
    console.log(`  ${one.id}  ${one.version}  ${one.method_root}`);
  }
  return 0;
}

// [[spec/design_output/index#a-rename-reaches-a-name]]
export function renameHere(argv) {
  const [from, to] = argv.filter((one) => !one.startsWith("-"));
  if (!from || !to) {
    console.error(
      "se rename <from> <to>: say the name that moves and the one it takes.",
    );
    return 2;
  }
  const it = { disk: files, join, root, git: git(outside, root) };
  // A module's name stands as no path, so `--text` rewrites it and moves nothing. [[spec/design_output/index#a-rename-reaches-a-name]]
  const said = argv.includes("--text")
    ? renamingText(it, from, to)
    : renaming(it, from, to);
  if (said.why) {
    console.error(said.why);
    return 1;
  }
  console.log(`${from} stands at ${to}.`);
  for (const one of said.wrote) console.log(`  ${one}`);
  // A rule that skips says what it skips, so a hand reads what the run left out. [[spec/design_output/index#a-rename-reaches-a-name]]
  for (const one of said.skipped ?? []) {
    console.log(
      `  the reader reads ${one} as a picture, so the rewrite leaves it alone`,
    );
  }
  console.log("Run ./RUNME.sh links, then ./RUNME.sh check.");
  return 0;
}

// [[spec/design_output/vehicle#a-stub-takes-its-vehicle]]
export function theStub(argv) {
  const flag = argv.indexOf("--upstream");
  const upstream = flag >= 0 ? (argv[flag + 1] ?? "") : "";
  const plain =
    flag < 0 ? argv : argv.filter((_one, i) => i !== flag && i !== flag + 1);
  const dest = plain[1];
  if (plain[0] !== "into" || !dest) {
    console.error(
      "se stub into <folder> [--upstream <url>]: say where the stub lands.",
    );
    return 2;
  }
  const pair = rootsHere(files, process.env, root);
  const put = stubInto(
    files,
    git(outside, pair.method),
    it.clock,
    pair.method,
    atRoot(dest),
    {
      upstream,
    },
  );
  if (!put.ok) {
    console.error(put.why);
    return 1;
  }
  console.log(`${put.files.length} file(s) written into ${dest}.`);
  console.log(
    "Its shim finds the vehicle through SE_VEHICLE, the register, or where a cloud box clones it.",
  );
  return 0;
}

export function serveBridge(argv) {
  const inspect = argv.filter((one) => one.startsWith("--inspect"));
  const server = join(root, "src", "bridge", "server.js");
  return outside.run([process.execPath, ...inspect, server, root], {
    cwd: root,
    inherit: true,
    env: inspect.length ? { SE_BREAK_ON_STOP: "1" } : undefined,
  }).exitCode;
}

// [[spec/design_output/tui#the-verb-builds-it]]

export function test() {
  files.makeDir(join(root, ...RUN.split("/")));
  const ran = outside.run(
    [
      process.execPath,
      "--test",
      "--test-reporter=spec",
      "--test-reporter-destination=stdout",
      "--test-reporter=tap",
      `--test-reporter-destination=${join(root, ...TAP.split("/"))}`,
      TESTS,
      CONTRACT_TESTS,
    ],
    { cwd: root, inherit: true },
  );
  return ran.exitCode;
}

// [[spec/guidance/retro/effect]]
function tapHere() {
  const at = join(root, ...TAP.split("/"));
  return files.exists(at) ? files.read(at) : "";
}

// [[spec/design_output/projection#what-goes-where-is-data]]

export function mint(argv) {
  const [kind, path] = argv.filter((one) => !one.startsWith("-"));
  const schemas = schemasIn(treeHere());
  const kinds = [...schemas.keys()].sort();

  if (!kind || !path) {
    console.error("Usage: ./RUNME.sh mint <kind> <path> [--field=value ...]\n");
    console.error(`${SCHEMAS} holds ${kinds.join(", ")}.`);
    console.error(
      "A ticket takes --process=<name>, and the route and its hash copy in.",
    );
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
export function drawing(argv) {
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
