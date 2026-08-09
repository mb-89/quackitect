// A BOUND FIELD IS A TWO-WAY VIEW OVER NODE FRONTMATTER.
//
// The keys are the nodes, the value is a frontmatter field on each one. Type
// an answer in the form and it lands on the node. Edit the note and the form
// shows it at the next look. Nothing is stored twice, so nothing can disagree
// with itself.
//
// What this replaces: a `probes` field that checked NOTHING. It declared
// per-item with no items, so the coverage check never ran; and `of: raid`,
// which does nothing on a per-item field because only the refs template
// declares `resolves: artifact`. A state whose whole rule is "probe every
// standing assumption" would accept one line saying "looks fine".
import { strict as assert } from "node:assert";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { withFrontmatter, withFrontmatterList } from "../engine/forms.ts";
import { parseStateNote } from "../engine/notes.ts";
import { assumptionItems, claimProblems, criterionAxisItems, nodeField, tableRow } from "../engine/stateform.ts";
import { freshRoot } from "./helpers.ts";

/** A register with three entries: two standing assumptions, one closed. */
function register(root: string): string {
  const dir = join(root, "project", "spec", "trace", "raid");
  mkdirSync(dir, { recursive: true });
  const node = (id: string, kind: string, status: string, extra = ""): void => {
    writeFileSync(
      join(dir, `${id}.md`),
      `---\nid: ${id}\ntype: "[[raid]]"\nkind: ${kind}\nstatement: something\nowner: the owner\ntrigger: on a change\nstatus: ${status}\n${extra}---\n\n## Probe\n\nhow it would be checked\n`,
      "utf8",
    );
  };
  node("raid-b-holds", "assumption", "open");
  node("raid-a-holds", "assumption", "open", "probe: holds — ran the battery\n");
  node("raid-gone", "assumption", "closed");
  node("raid-a-risk", "risk", "open");
  return dir;
}

// THE ORDERING STARTS FROM DAMAGE (owner report 2026-08-08). Ordered from
// MoSCoW alone, a response-time requirement came out above the foundations of
// the system, and no pairwise comparison discovers that — the comparison never
// reads what breaks.
test("the criteria hint order is led by how badly each one breaks things", () => {
  const root = freshRoot();
  const dir = join(root, "project", "spec", "trace", "requirement");
  mkdirSync(dir, { recursive: true });
  const req = (id: string, priority: string, damage: string): void => {
    const badly = damage === "" ? "" : `breaks_how_badly: ${damage}\n`;
    writeFileSync(
      join(dir, `${id}.md`),
      `---\nid: ${id}\ntype: "[[requirement]]"\nstatement: something\npriority: ${priority}\nbreaks_if_removed: something gives\n${badly}---\n`,
      "utf8",
    );
  };
  // A should that is merely annoying, against a could the system rests on.
  req("req-fast", "should", "abrasive");
  req("req-foundation", "could", "fatal");
  req("req-ungraded", "should", "");

  const order = criterionAxisItems(root);
  assert.equal(order[0], "req-foundation", `what breaks the system leads, whatever its MoSCoW: ${order.join(" > ")}`);
  assert.equal(order[order.length - 1], "req-fast", "and merely abrasive sinks, even as a should");
  // An ungraded row sorts as the middle. Last would sink everything written
  // before the scale existed; first would make a blank field the way to the top.
  assert.equal(order[1], "req-ungraded", `ungraded sits in the middle: ${order.join(" > ")}`);
});

test("the item list IS the register — standing assumptions only, and it does not freeze", () => {
  const root = freshRoot();
  const dir = register(root);

  assert.deepEqual(assumptionItems(root), ["raid-a-holds", "raid-b-holds"], "sorted, and only the standing assumptions");

  // A CLOSED ENTRY DROPS OUT. There is nothing to probe about an assumption
  // nobody is relying on any more.
  assert.equal(assumptionItems(root).includes("raid-gone"), false);
  // A RISK IS NOT AN ASSUMPTION. Only the kind this state is about.
  assert.equal(assumptionItems(root).includes("raid-a-risk"), false);

  // IT DOES NOT FREEZE, and that is the difference from the inbox. A new
  // assumption appears at once, because the claim "they are all probed"
  // stopped being true the moment it was written.
  writeFileSync(
    join(dir, "raid-c-holds.md"),
    `---\nid: raid-c-holds\ntype: "[[raid]]"\nkind: assumption\nstatement: new\nowner: the owner\ntrigger: on a change\nstatus: open\n---\n\n## Probe\n\nhow\n`,
    "utf8",
  );
  assert.deepEqual(assumptionItems(root), ["raid-a-holds", "raid-b-holds", "raid-c-holds"]);
});

test("the value is read off the node, and only out of its frontmatter", () => {
  const root = freshRoot();
  const dir = register(root);
  assert.equal(nodeField(join(dir, "raid-a-holds.md"), "probe"), "holds — ran the battery");
  assert.equal(nodeField(join(dir, "raid-b-holds.md"), "probe"), "", "absent reads empty, which is what makes the check refuse");

  // PAST THE CLOSING FENCE IS PROSE. A body line that looks like a key is a
  // sentence, and reading one as a value fills a field nobody answered.
  writeFileSync(
    join(dir, "raid-b-holds.md"),
    `---\nid: raid-b-holds\nstatus: open\n---\n\nprobe: this is a sentence in the body\n`,
    "utf8",
  );
  assert.equal(nodeField(join(dir, "raid-b-holds.md"), "probe"), "");
});

test("writing the field lands on the node, and clearing it removes the key", () => {
  const raw = `---\nid: raid-x\nstatus: open\n---\n\n## Probe\n\nhow\n`;

  // EVERY VALUE IS QUOTED, unconditionally. A bare scalar carrying ": " is a
  // YAML syntax error, and that broke two files on 2026-08-07 before the
  // rule went in. Quoting always beats sniffing for what is dangerous,
  // because the sniff already missed colon-space once.
  const set = withFrontmatter(raw, "probe", "holds — the flag is stable");
  assert.match(set, /^probe: "holds — the flag is stable"$/m);
  assert.match(set, /^status: open$/m, "an unrelated key is untouched");

  // AND THE PARSER GIVES IT BACK UNQUOTED, so nothing downstream has to undo
  // this. That is the half that makes the quoting invisible.
  assert.equal(parseStateNote(set).frontmatter.probe, "holds — the flag is stable");

  // A COLON IS THE CASE THE RULE EXISTS FOR.
  const risky = withFrontmatter(raw, "probe", "false — it was not size: the corpus reloaded");
  assert.equal(parseStateNote(risky).frontmatter.probe, "false — it was not size: the corpus reloaded");

  const changed = withFrontmatter(set, "probe", "false — it moved under us");
  assert.match(changed, /^probe: "false — it moved under us"$/m);
  assert.equal(changed.split("probe:").length - 1, 1, "replaced, never appended twice");

  // AN EMPTY ANSWER CLEARS THE KEY. A blank value and a missing one must read
  // the same to every check, or a cleared answer would count as answered.
  assert.doesNotMatch(withFrontmatter(changed, "probe", "  "), /^probe:/m);
});

test("a dollar sequence in the answer is written literally", () => {
  // The value is prose somebody typed. String.replace reads dollar sequences
  // in a replacement as instructions — see files.ts applyExactOp for what
  // that cost when it was missed.
  const D = String.fromCharCode(36);
  const raw = `---\nid: raid-x\nprobe: old\n---\n\nbody\n`;
  const out = withFrontmatter(raw, "probe", `false — the ${D}& in the pattern broke it`);
  assert.equal(parseStateNote(out).frontmatter.probe, `false — the ${D}& in the pattern broke it`);
  assert.equal(out.split("probe:").length - 1, 1, "and nothing was spliced in around it");
});

test("a multi-line answer folds onto one frontmatter line", () => {
  // Frontmatter holds one line per key. An answer with a newline in it would
  // otherwise write a second line the parser reads as a different key.
  const out = withFrontmatter(`---\nid: raid-x\n---\n\nbody\n`, "probe", "holds\nand here is more\nand more");
  assert.equal(parseStateNote(out).frontmatter.probe, "holds and here is more and more");
});

test("a key owns its block list, so a scalar write does not leave the old items dangling", () => {
  // THE DEFECT THIS PINS, 2026-08-09. The chart wrote picks as a scalar over
  // a block list. The key line was replaced and the indented items stayed, so
  // the file stopped being YAML. Five candidate notes lost their picks, and
  // the five lines vanished off the chart with no error anywhere.
  const raw = ["---", "id: cand-x", "picks:", '  - "[[opt-a]]"', '  - "[[opt-b]]"', "name: X", "---", "", "body", ""].join("\n");

  const scalar = withFrontmatter(raw, "picks", "one");
  assert.doesNotMatch(scalar, /^\s+- /m, "the old items went with the key");
  assert.match(scalar, /^name: X$/m, "and the key after the block survived");

  // A LIST FIELD IS WRITTEN AS A LIST. A comma-joined scalar reads back as
  // one value, so every consumer asking for items gets a sentence.
  const listed = withFrontmatterList(raw, "picks", ["[[opt-c]]", "[[opt-d]]", "[[opt-e]]"]);
  assert.deepEqual(parseStateNote(listed).frontmatter.picks, ["[[opt-c]]", "[[opt-d]]", "[[opt-e]]"]);
  assert.match(listed, /^name: X$/m);
  assert.equal(listed.split("picks:").length - 1, 1, "replaced, never appended twice");

  // AND IT CREATES THE KEY when the node has none yet.
  const fresh = withFrontmatterList(`---\nid: cand-y\n---\n\nbody\n`, "picks", ["[[opt-a]]"]);
  assert.deepEqual(parseStateNote(fresh).frontmatter.picks, ["[[opt-a]]"]);

  // AN EMPTY LIST CLEARS IT, the same way an empty scalar does.
  assert.doesNotMatch(withFrontmatterList(raw, "picks", []), /^picks:/m);
});

test("a table row yields its cells, and a header rule yields nothing", () => {
  assert.deepEqual(tableRow("| [[raid-x]] | holds | 2026-08-07 |"), ["[[raid-x]]", "holds", "2026-08-07"]);

  // THE RULE IS NOT A ROW. Filtering by shape rather than by position means
  // a table with no rule, or two, reads the same as one written properly.
  assert.deepEqual(tableRow("| --- | --- | --- |"), []);
  assert.deepEqual(tableRow("not a row"), []);
  assert.deepEqual(tableRow(""), []);

  // AN EMPTY CELL SURVIVES as an empty string. It is what makes the submit
  // refuse by name, so collapsing it would hide the unanswered row.
  assert.deepEqual(tableRow("| [[raid-x]] |  | 2026-08-07 |"), ["[[raid-x]]", "", "2026-08-07"]);

  // A PIPE INSIDE AN ANSWER is escaped, because a probe result may well
  // quote a shell command.
  assert.deepEqual(tableRow("| [[raid-x]] | ran a \\| b | today |"), ["[[raid-x]]", "ran a \\| b", "today"]);
});

test("a cell still carrying its comment is unanswered, exactly like an empty one", () => {
  const root = freshRoot();
  register(root);
  const state = {
    id: "probe-assumptions",
    kind: "work",
    statement: "",
    guidance: "",
    priority: 0,
    edges: [],
    evidence_form: [
      { name: "probes", description: "", required: true, template: "node-table", of: "raid", items: ["raid-a-holds"], columns: ["probe"] },
    ],
  } as unknown as Parameters<typeof claimProblems>[1];

  const body = (cell: string): string => `## probes\n\n| raid | probe |\n| --- | --- |\n| [[raid-a-holds]] | ${cell} |\n`;
  const corpus: never[] = [];

  // A MINTED PROMPT IS NOT A CLAIM. The node ships with the comment sitting
  // where the answer will sit, so the check has to tell the two apart —
  // otherwise every node would pass the moment it was created.
  assert.match(claimProblems(root, state, body("<!-- what the check found -->"), corpus).join(" "), /unanswered — raid-a-holds\.probe/);
  assert.match(claimProblems(root, state, body(""), corpus).join(" "), /unanswered — raid-a-holds\.probe/);

  // And a real answer passes.
  assert.deepEqual(claimProblems(root, state, body("holds — ran the battery"), corpus), []);

  // A MISSING ROW IS NAMED, not silently skipped. A node the register carries
  // and the table does not is the failure this field exists to catch.
  assert.match(claimProblems(root, state, "## probes\n\n| raid | probe |\n| --- | --- |\n", corpus).join(" "), /raid-a-holds \(no row\)/);
});
