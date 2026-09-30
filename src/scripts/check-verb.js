// The check and test verbs: the battery's parts, the test runner's argv, the
// red list apart, and the tallies the stamp reads.
// [[spec/tickets/cli-js-leaves]]

import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { RUN } from "../../.claude/skills/level0/lib/folders.js";
import { batteryOf, spawnsIn } from "./battery.js";
import {
  doorsHold,
  goHolds,
  pluginHolds,
  projectionsHold,
  serverHolds,
} from "./cli-check.js";
import { CONTRACT_TESTS, files, it, outside, root, TESTS } from "./cli-doors.js";
import { errorsSaid, errorsStood, lint } from "./cli-read.js";
import { batteryRun, stamped } from "./cli-stamp.js";
import { ticketsHere } from "./pull-hand.js";
import { expectedRed } from "./red-list.js";
import { whereOf } from "./verb-run.js";
import { testVerb } from "./work-test.js";

// The runner's own reporter writes a line a case beside the stamp, so the battery's report names the slowest cases and their files. [[spec/design_output/work#the-battery-answers-first]]
const TIMES = `${RUN}/tests.jsonl`;
const REPORTER = "src/scripts/battery-reporter.js";
// The process door writes one line a spawn here while the tests run, so the stamp counts them. [[spec/design_output/work#the-battery-answers-first]]
const SPAWNS = `${RUN}/spawns.txt`;

// Each part runs timed, so the stamp carries the battery's report and a retro reads it. [[spec/guidance/retro/effect]]
// Under --errors the parts run quiet, and the check prints the red cases and the findings at error alone. [[spec/tickets/the-verbs-need-no-wrapper]]
export async function check(words) {
  const errors = words.includes("--errors");
  const loud = console.log;
  if (errors) console.log = () => {};
  let ran;
  try {
    ran = await batteryRun(
      [
        ["tests", () => test(errors)],
        ["go", () => goHolds(errors, redHere())],
        ["doors", () => doorsHold()],
        ["projections", () => projectionsHold()],
        ["plugin", () => pluginHolds()],
        ["server", () => serverHolds()],
        ["rules", () => lint(whereOf(words))],
      ],
      it.clock,
    );
  } finally {
    console.log = loud;
  }
  const { code, parts, unrun } = ran;
  if (errors)
    for (const row of errorsSaid(timesHere(), errorsStood())) console.log(row);
  return stamped(code, batteryOf(parts, timesHere(), { unrun, spawns: spawnsHere() }));
}

// The runner's flags after the node path: the spec report to the screen, and the battery's reporter to its file. [[spec/design_output/work#the-battery-answers-first]]
export function testArgv(at, red = []) {
  return [
    "--test",
    "--test-reporter=spec",
    "--test-reporter-destination=stdout",
    // A reporter loads as a module, and a drive letter reads as a URL scheme, so the path goes as a file URL. [[spec/design_output/work#the-battery-answers-first]]
    `--test-reporter=${pathToFileURL(join(at, ...REPORTER.split("/"))).href}`,
    `--test-reporter-destination=${join(at, ...TIMES.split("/"))}`,
    ...(red.length ? testFiles(at, red) : [TESTS, CONTRACT_TESTS]),
  ];
}

// Every test file the two globs reach, less the red list. [[spec/design_output/pull#the-gate]]
function testFiles(at, red) {
  const out = [];
  for (const glob of [TESTS, CONTRACT_TESTS]) {
    const folder = glob.slice(0, glob.lastIndexOf("/"));
    const end = glob.slice(glob.lastIndexOf("*") + 1);
    for (const one of files.list(join(at, ...folder.split("/")))) {
      const path = `${folder}/${one.name}`;
      if (one.kind === "file" && one.name.endsWith(end) && !red.includes(path))
        out.push(path);
    }
  }
  return out.sort();
}

// The tests the open tickets list as red. [[spec/design_output/pull#the-gate]]
function redHere() {
  return expectedRed(ticketsHere({ ...it, root }).filter((one) => !one.private));
}

export function test(quiet = false) {
  const tally = freshTally();
  const red = redHere();
  if (red.length) {
    console.log(
      `The red list stands apart until its tests-green closes: ${red.join(", ")}`,
    );
  }
  const ran = outside.run([process.execPath, ...testArgv(root, red)], {
    cwd: root,
    inherit: !quiet,
    env: { SE_SPAWNS: tally },
  });
  return ran.exitCode;
}

// The named run goes through the branch's runner, under the check's own tally. [[spec/design_output/pull#the-test-verb]]
export function namedTests(names) {
  return testVerb({ ...it, root }, ["test", ...names], { SE_SPAWNS: freshTally() });
}

function freshTally() {
  files.makeDir(join(root, ...RUN.split("/")));
  const tally = join(root, ...SPAWNS.split("/"));
  files.write(tally, "");
  return tally;
}

// [[spec/guidance/retro/effect]]
function timesHere() {
  const at = join(root, ...TIMES.split("/"));
  return files.exists(at) ? files.read(at) : "";
}

// The spawns the last test run tallied, or nothing where no run wrote one. [[spec/guidance/retro/effect]]
function spawnsHere() {
  const at = join(root, ...SPAWNS.split("/"));
  return files.exists(at) ? spawnsIn(files.read(at)) : null;
}
