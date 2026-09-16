// The verb behind `./RUNME.sh branch test`: the tests the branch changes,
// run once, and one word on what came back.
// [[spec/design_output/pull#the-test-verb]]

import { shortOf } from "../../.claude/skills/level0/lib/runs.js";
import { TRUNK } from "../../.claude/skills/level0/lib/trunk.js";
import { recordIn } from "./group.js";
import { changedFiles, handOf, holdOf } from "./pull.js";

const CUT_ERROR = 160;

export function testVerb(it, argv) {
  const named = (argv ?? []).slice(1).filter((one) => !one.startsWith("--"));
  const hand = handOf(it);
  const held = holdOf(it, hand);
  const since = sinceOf(it, held);
  const files = named.length
    ? named
    : changedFiles(it, since).filter(
        (path) => /(^|\/)test\/.*\.test\.js$/.test(path) || /\.test\.js$/.test(path),
      );

  if (!files.length) {
    console.log(
      `missing, because the branch changes no test since ${since ? shortOf(since) : "the branch point"}`,
    );
    return 1;
  }

  const ran = it.proc.run(
    [it.node ?? "node", "--test", "--test-reporter=tap", ...files],
    {
      cwd: it.root,
    },
  );
  const said = testSays(ran, files);
  console.log(said);
  return said.startsWith("green") ? 0 : 1;
}

function sinceOf(it, held) {
  if (held?.path) {
    const at = it.join(it.root, ...held.path.split("/"));
    if (it.disk.exists(at)) {
      const first = recordIn(it.disk.read(at)).find((entry) => entry.hash_before);
      if (first) return String(first.hash_before);
    }
    if (held.hash) return held.hash;
  }
  return it.git.run(["merge-base", `origin/${TRUNK}`, "HEAD"], true).out;
}

export function testSays(ran, files) {
  const out = `${ran.stdout ?? ""}\n${ran.stderr ?? ""}`;
  const count = (key) =>
    Number((new RegExp(`^# ${key} (\\d+)`, "m").exec(out) ?? [])[1] ?? 0);
  if (ran.exitCode === 0 && count("tests") > 0) {
    return `green, ${count("pass")} test(s) pass in ${files.length} file(s)`;
  }
  if (
    /ERR_MODULE_NOT_FOUND|SyntaxError|Cannot find module|ReferenceError/.test(out) ||
    count("tests") === 0
  ) {
    const line = out.split("\n").find((row) => /Error/.test(row));
    return `build, because a file loads no test: ${(line ?? "the run answers nothing").trim().slice(0, CUT_ERROR)}`;
  }
  if (/ERR_ASSERTION|AssertionError/.test(out)) {
    return `assertion, ${count("fail")} test(s) fail on their own assertion`;
  }
  const line = out.split("\n").find((row) => /Error/.test(row));
  return `build, because ${count("fail")} test(s) fail outside an assertion: ${(line ?? "").trim().slice(0, CUT_ERROR)}`;
}
