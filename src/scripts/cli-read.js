// What the command line reads: the version, the check's own lint, and the
// walk over a folder. The index, links, notes and find verbs run in Go.
// [[spec/design_output/tree#the-tree-handed-in]]

import { join } from "node:path";
import { line as asLine } from "../../.claude/skills/level0/lib/refuse.js";
import { surveyFindsNode } from "../../.claude/skills/level0/lib/tree.js";
import { WARNING } from "../../.claude/skills/level0/lib/warnings.js";
import {
  biomeFor,
  findingsOver,
  pastHistory,
  showOf,
  walkOver,
} from "../bridge/findings.js";
import { readTools } from "../engine/tools.js";
import { treeHere } from "./cli-check.js";
import { bin, COL, files, it, outside, root, SHOWN } from "./cli-doors.js";
import { rowsUnder, sweepRowsOf } from "./quack-topic.js";

// The file the check names for what the lint found. The stamp takes the warnings, and `check --errors` prints the lines at error. [[spec/design_output/work#the-battery-answers-first]]
const FOUND_AT = "SE_LINT_FOUND";

// What the lint leaves for the check: each warning as its file and source, and each finding at error as its line. [[spec/design_output/work#the-battery-answers-first]]
export function lintFoundOf(found, lineOf) {
  return {
    stood: found
      .filter((one) => one.severity === WARNING)
      .map((one) => ({ file: one.file ?? "", source: one.source ?? "" })),
    erred: found.filter((one) => one.severity !== WARNING).map(lineOf),
  };
}

function leavesFound(said) {
  const at = process.env[FOUND_AT];
  if (at) files.write(at, `${JSON.stringify(said)}\n`);
}

export function version() {
  try {
    return JSON.parse(files.read(join(root, "package.json"))).version ?? "0";
  } catch {
    return "0";
  }
}

// The command line's own reading, which `lint` prints and a case counts: the tools' rows, and the check module's sweep under the paths asked, which quack answers. [[spec/tickets/the-lsp-server-leaves]]
// The sweep comes in where a caller holds it already, so one reading serves both. findingsOver draws the stop folder rule, so the sweep's row of it stays out and each row reads once. [[spec/design_output/lsp#one-checker-every-front-asks]]
// The survey stands on this box alone, and the sweep reads the tracked files, so the rule reads the box here in place of the sweep. [[spec/tickets/the-lsp-server-leaves]]
const BOX_BOUND = "SurveyFindsNode";

export async function readingFor(where, swept) {
  const doors = await findingsDoors();
  const got = await findingsOver(doors, where);
  if (got.fault)
    return {
      found: [],
      fault: `${got.fault}\nVale read no file, so every rule it holds stands unchecked.`,
    };
  const rows = swept === undefined ? sweepRowsOf(doors, where) : swept;
  if (!rows)
    return {
      found: [],
      fault:
        "quack answers no check sweep, so every rule the check module holds stands unchecked. Run ./RUNME.sh, which builds the index.",
    };
  const kept = rows.filter(
    (one) => one.rule !== "StopFolderIsData" && one.rule !== BOX_BOUND,
  );
  const box = rowsUnder(surveyFindsNode(treeHere()), where);
  return { found: pastHistory(doors, [...got.found, ...kept, ...box]), fault: "" };
}

// The doors the command line's own reading runs on. [[spec/design_output/lsp]]
export async function findingsDoors() {
  return {
    disk: files,
    proc: outside,
    join,
    root,
    vale: bin,
    biome: biomeFor(files, root, readTools(files, root)),
    // The command line's lint keeps Vale's rows a file, so a file unchanged since the last lint takes no Vale run. [[spec/tickets/the-check-runs-fast-again]]
    valeCache: true,
    // The prose reader reads its slice's mode, and runs quack under the method root. [[spec/tickets/readers-take-the-go-topics]]
    slices: it.slices,
    method: it.method,
    // The check names what stands past a ceiling as a warning, and the write door refuses the growth. [[spec/design_output/level0#the-size-ceiling]]
    ceilings: {
      function: await it.config.ask("code.functionLines"),
      file: await it.config.ask("code.fileLines"),
    },
  };
}

export async function lint(where) {
  if (!files.exists(bin)) {
    console.error("Vale is missing. Run ./RUNME.sh once and it installs.");
    return 2;
  }
  const began = it.clock.now().getTime();

  const got = await readingFor(where);
  if (got.fault) {
    console.error(got.fault);
    return 1;
  }
  const found = got.found;

  const ms = it.clock.now().getTime() - began;
  const lineOf = (one) => asLine(one, show(one.file ?? where[0]));
  leavesFound(lintFoundOf(found, lineOf));
  if (!found.length) {
    // The rules passing is the expected road, so the row stands at debug and the floor hides it. [[spec/design_output/log#which-kind-says-what]]
    await it.log.say("debug", "vale", `the rules pass over ${where.join(" ")}`, { ms });
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

  // [[spec/design_output/schema#warning-now-and-error-later]]
  const refused = found.filter((one) => one.severity !== WARNING).length;
  const note = refused
    ? []
    : [
        "",
        `${found.length} stand at warning. They stand in the Problems panel, and the push waits until the panel stands clear.`,
      ];
  for (const row of lintRows(found, lineOf, note)) console.log(row);
  if (refused) return 1;
  // A warning turns nothing red, because the doors let it land and the push waits on the panel. [[spec/design_output/config#the-engine-controls]]
  return 0;
}

// The count reads first, and the finding lines stand last, where the reader's eye lands. [[spec/design_output/lsp#the-lint-ends-on-findings]]
export function lintRows(found, lineOf, note = []) {
  const perRule = new Map();
  for (const one of found) perRule.set(one.rule, (perRule.get(one.rule) ?? 0) + 1);
  return [
    ...[...perRule]
      .sort((a, b) => b[1] - a[1])
      .map(([rule, count]) => `${String(count).padStart(COL.count)}  ${rule}`),
    `${String(found.length).padStart(COL.count)}  in all`,
    ...note,
    "",
    ...found.map(lineOf),
  ];
}

// [[spec/design_output/tree#the-tree-handed-in]]
// [[spec/design_output/lsp#one-checker-every-front-asks]]

export function namesIn(at, end) {
  return files
    .list(at)
    .filter((one) => one.kind === "file" && one.name.endsWith(end))
    .map((one) => one.name);
}

export function walk(where, wanted) {
  return walkOver({ disk: files, join, root }, where, wanted);
}

export function show(file) {
  return showOf({ root }, file);
}
