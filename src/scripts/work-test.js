// The verb behind `./RUNME.sh branch test`: the tests the branch changes,
// run once, and one word on what came back.
// [[spec/design_output/pull#the-test-verb]]

import { dirname } from "node:path";
import { inRun } from "../../.claude/skills/level0/lib/folders.js";
import { shortOf } from "../../.claude/skills/level0/lib/runs.js";
import { TRUNK } from "../../.claude/skills/level0/lib/trunk.js";
import { recordIn } from "../engine/group.js";
import { goEnvOf } from "./cli-go.js";
import { changedFiles, handOf, holdOf } from "./pull.js";

const CUT_ERROR = 160;
// The working text of each source waits here while a red run reads the source at HEAD. [[spec/design_output/pull#a-test-proves-red]]
const ASIDE = inRun("red");
const LIST = "sources.json";
const RED = "--red";
const ASSERTION = "assertion, ";

// The env is the check's own, so a named run tallies its spawns the way the battery does. [[spec/design_output/pull#the-test-verb]]
export function testVerb(it, argv, env = {}) {
  if ((argv ?? []).includes(RED)) return redTest(it, argv.slice(1), env);
  const named = (argv ?? []).slice(1).filter((one) => !one.startsWith("--"));
  const since = named.length ? "" : sinceOf(it, holdOf(it, handOf(it)));
  const changed = named.length ? named : changedFiles(it, since);
  const files = changed.filter((path) => /\.test\.js$/.test(path));
  // A branch changing a Go test names its module, and the verb runs that too. [[spec/design_output/pull#the-test-verb]]
  const modules = goModulesOf(changed, it);

  if (!files.length && !modules.length) {
    console.log(
      `missing, because the branch changes no test since ${since ? shortOf(since) : "the branch point"}`,
    );
    return 1;
  }

  const said = [];
  if (files.length) {
    const ran = it.proc.run(
      [it.node ?? "node", "--test", "--test-reporter=tap", ...files],
      { cwd: it.root, env },
    );
    said.push(testSays(ran, files));
  }
  for (const one of modules) {
    said.push(
      goSays(
        it.proc.run(["go", "-C", one, "test", "./..."], {
          cwd: it.root,
          env: { ...env, ...goEnvOf(it) },
        }),
        one,
      ),
    );
  }

  const bad = said.find((one) => !one.startsWith("green"));
  console.log(bad ?? said.join("; "));
  return bad ? 1 : 0;
}

// A changed test names the module holding it, which is the nearest folder above it carrying a go.mod. A handle reads that folder, because a module stands any depth under src. A named folder names the module at or above it. [[spec/design_output/pull#the-test-verb]]
export function goModulesOf(paths, it) {
  const out = new Set();
  for (const path of paths ?? []) {
    const said = String(path).replace(/\/+$/, "");
    const test = /^src\/.*_test\.go$/.test(said);
    if (!test && !isFolder(said)) continue;
    const found = moduleOver(test ? said : `${said}/`, it);
    if (found) out.add(found);
  }
  return [...out];
}

// A folder under src carries no extension on its last name. [[spec/design_output/pull#the-test-verb]]
function isFolder(path) {
  return /^src\/[^.]*$/.test(path);
}

// The folders above a path, nearest first, down to the one under src. [[spec/tickets/an-engine-takes-bridge-work]]
function moduleOver(path, it) {
  const parts = path.split("/").slice(0, -1);
  while (parts.length > 1) {
    const folder = parts.join("/");
    if (!it?.disk || it.disk.exists(it.join(it.root, ...parts, "go.mod")))
      return folder;
    parts.pop();
  }
  return "";
}

// [[spec/design_output/pull#the-test-verb]]
export function goSays(ran, where) {
  const out = `${ran.stdout ?? ""}\n${ran.stderr ?? ""}`;
  if (ran.exitCode === 0) return `green, ${where} passes`;
  if (/^(---\s+)?FAIL/m.test(out)) return `assertion, a test of ${where} fails`;
  const line = out.split("\n").find((row) => /[Ee]rror|cannot|undefined/.test(row));
  return `build, because ${where} builds not: ${(line ?? "the run answers nothing").trim().slice(0, CUT_ERROR)}`;
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

// The test runs over each source as HEAD holds it, and an assertion answers red. [[spec/design_output/pull#a-test-proves-red]]
export function redTest(it, argv, env = {}) {
  const [file, ...sources] = (argv ?? []).filter((one) => !one.startsWith("--"));
  if (!file || !sources.length) {
    console.log(
      "refused, because the verb names a test and its sources: ./RUNME.sh test --red <test> <source>...",
    );
    return 2;
  }
  putBack(it);
  let said = "";
  try {
    setAside(it, sources);
    const ran = it.proc.run(
      [it.node ?? "node", "--test", "--test-reporter=tap", file],
      {
        cwd: it.root,
        env,
      },
    );
    said = testSays(ran, [file]);
  } finally {
    putBack(it);
  }
  if (said.startsWith(ASSERTION)) {
    console.log(`red, ${said.slice(ASSERTION.length)}`);
    return 0;
  }
  console.log(`refused, because the test answers ${said} with the sources set aside`);
  return 1;
}

function asideAt(it, ...path) {
  return it.join(it.root, ...ASIDE.split("/"), ...path);
}

// Each working text goes to disk before HEAD's text takes its place, and a source HEAD lacks stands aside whole. [[spec/design_output/pull#a-test-proves-red]]
function setAside(it, sources) {
  const list = [];
  it.disk.makeDir(asideAt(it));
  for (const path of sources) {
    const at = it.join(it.root, ...path.split("/"));
    const kept = it.disk.exists(at);
    if (kept) {
      const held = asideAt(it, ...path.split("/"));
      it.disk.makeDir(dirname(held));
      it.disk.write(held, it.disk.read(at));
    }
    list.push({ path, kept });
    it.disk.write(asideAt(it, LIST), `${JSON.stringify(list, null, 2)}\n`);
    const head = it.proc.run(["git", "show", `HEAD:${path}`], { cwd: it.root });
    if (head.exitCode === 0) it.disk.write(at, head.stdout ?? "");
    else if (kept) it.disk.remove(at);
  }
}

// A run killed while the sources stand aside leaves the list, and the next run puts them back first. [[spec/design_output/pull#a-test-proves-red]]
function putBack(it) {
  const listed = asideAt(it, LIST);
  if (!it.disk.exists(listed)) return;
  for (const one of JSON.parse(String(it.disk.read(listed)))) {
    const at = it.join(it.root, ...one.path.split("/"));
    if (one.kept) it.disk.write(at, it.disk.read(asideAt(it, ...one.path.split("/"))));
    else if (it.disk.exists(at)) it.disk.remove(at);
  }
  it.disk.remove(asideAt(it));
}
