// The kept red leaf. A rewind meets a leaf that proved its tests red, and a
// later leaf passed since. Where every test its pass commit lands still stands
// at HEAD, through a rename, the leaf stands kept and the walk goes on.
// [[spec/design_output/pull#kept-red-leaves]]

import { frontOf, recordIn } from "../engine/group.js";
import { chapterOf } from "./pull-chapter.js";
import { walkOf } from "./pull-route.js";

const RED = "assertion";
const TESTS = "test/";
const GONE = "D";
const SHORT = 9;
const FIELD = "red";

// The files one red leaf names under its red field. [[spec/design_output/pull#kept-red-leaves]]
export function redListOf(text, path) {
  // A row a list payload wrote before formatted took arrays holds its paths joined by commas. [[spec/design_output/pull#kept-red-leaves]]
  return (chapterOf(text, path).fields.get(FIELD) ?? [])
    .flatMap((row) =>
      String(row)
        .replace(/^[-*]\s+/, "")
        .split(","),
    )
    .map((one) => one.replaceAll("`", "").trim())
    .filter(Boolean);
}

// [[spec/design_output/pull#kept-red-leaves]]
export function keptRed(it, text, leaf, name = "") {
  if (!isRed(leaf)) return null;
  const record = recordIn(text);
  const redAt = record.findLastIndex(
    (entry) => entry.step === leaf.path && isPass(entry),
  );
  if (redAt < 0) return null;
  const after = String(record[redAt].hash_after ?? "");
  if (!after) return null;
  const order = walkOf(frontOf(text))
    .filter((one) => one.leaf)
    .map((one) => one.path);
  const past = order.indexOf(leaf.path);
  const later = record
    .slice(redAt + 1)
    .some((entry) => isPass(entry) && order.indexOf(entry.step) > past);
  if (!later) return null;

  const commit = redCommit(it, after, leaf.path, name);
  if (!commit) return null;
  const listed = redListOf(text, leaf.path);
  const tests = listed.length ? listed : landedTests(it, commit);
  if (!tests.length) return null;
  const gone = goneSince(it, commit);
  if (!gone || tests.some((path) => gone.has(path))) return null;
  return {
    step: leaf.path,
    skipped: true,
    kept: commit,
    why: `its red tests stand as ${commit.slice(0, SHORT)} landed them, and a later leaf passed since`,
  };
}

function isRed(leaf) {
  return [leaf?.said?.evidence ?? []]
    .flat()
    .some((field) => field?.form === "command" && String(field.expects) === RED);
}

function isPass(entry) {
  return (
    Boolean(entry.def) && !entry.stale && !entry.skipped && entry.returns === undefined
  );
}

// [[spec/design_output/pull#kept-red-leaves]]
function redCommit(it, after, path, name) {
  const said = it.git.run(
    ["log", "--reverse", "--ancestry-path", "--format=%H%x09%s", `${after}..HEAD`],
    true,
  );
  if (!said.ok) return "";
  for (const row of said.out.split("\n")) {
    const [hash = "", subject = ""] = row.split("\t");
    const cut = subject.indexOf(": ");
    if (cut < 0) continue;
    if (name && subject.slice(0, cut) !== name) continue;
    const changes = subject
      .slice(cut + 2)
      .replace(/\.$/, "")
      .split(", ");
    if (changes.includes(`passes ${path}`)) return hash.trim();
  }
  return "";
}

function landedTests(it, commit) {
  const said = it.git.run(["show", "--name-status", "--format=", commit], true);
  if (!said.ok) return [];
  return rowsOf(said.out)
    .filter((row) => row.status !== GONE)
    .map((row) => row.paths.at(-1))
    .filter((path) => path.startsWith(TESTS));
}

function goneSince(it, commit) {
  const said = it.git.run(["diff", "-M", "--name-status", commit, "HEAD"], true);
  if (!said.ok) return null;
  return new Set(
    rowsOf(said.out)
      .filter((row) => row.status === GONE)
      .map((row) => row.paths[0]),
  );
}

function rowsOf(out) {
  return String(out ?? "")
    .split("\n")
    .filter((row) => row.trim())
    .map((row) => {
      const [status = "", ...paths] = row.split("\t");
      return { status: status.slice(0, 1), paths };
    })
    .filter((row) => row.paths.length);
}
