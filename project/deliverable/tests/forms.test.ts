// Evidence forms — the mechanical lint and THE PREFILL LAW: commented
// content is invisible; a form never passes on unconfirmed prefills.
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { TABLE_EDITOR } from "../engine/editors/table.ts";
import {
  confirmPrefill,
  lintForm,
  parseFormTemplate,
  scaffoldInstance,
  stripComments,
  withFieldContent,
  withStatus,
} from "../engine/forms.ts";
import {
  compoundingSuspectItems,
  compoundingSuspectPairs,
  criterionAxisItems,
  criterionPoolItems,
  nodeList,
  registerPull,
} from "../engine/stateform.ts";

const TPL = `---
form: t1
instance: report.md
---

# T1 — the page

## Fields

- Goal | the goal | required
- Done | what happened | required
- Files | evidence files | optional
`;

test("a template parses: fields, requiredness, the instance name — garbage refuses", () => {
  const t = parseFormTemplate("t1", TPL);
  assert.equal(t.instance, "report.md");
  assert.equal(t.statement, "T1 — the page");
  assert.deepEqual(
    t.fields.map((f) => f.name),
    ["Goal", "Done", "Files"],
  );
  assert.equal(t.fields[2].required, false);
  assert.throws(() => parseFormTemplate("t2", "---\nform: t2\n---\n\n# X\n\n## Fields\n\n- broken line\n"));
  assert.throws(() => parseFormTemplate("t3", "---\nform: t3\n---\n\n# X\n"));
});

test("the lint: missing instance, empty required, files, status — and the prefill law end to end", () => {
  const t = parseFormTemplate("t1", TPL);
  const ev = mkdtempSync(join(tmpdir(), "se-ev-"));
  // No instance: unmet, and it says so.
  assert.equal(lintForm(t, undefined, ev).met, false);
  // A fresh scaffold: draft, empty — unmet with the sections named.
  let raw = scaffoldInstance(t, "t1 page");
  let l = lintForm(t, raw, ev);
  assert.equal(l.met, false);
  assert.ok(l.problems.some((p) => p.includes('"Goal"')));
  // THE PREFILL LAW: commented content counts as EMPTY.
  raw = withFieldContent(raw, "Goal", "<!-- prefilled goal text -->");
  raw = withFieldContent(raw, "Done", "did the thing");
  l = lintForm(t, raw, ev);
  assert.equal(l.met, false);
  assert.ok(l.problems.some((p) => p.includes("unconfirmed prefills")));
  assert.deepEqual(l.fields[0].prefills, ["prefilled goal text"]);
  // CONFIRM = uncomment: the content stands, the prefill list empties.
  raw = confirmPrefill(raw, "Goal", 0);
  assert.ok(stripComments(raw).includes("prefilled goal text"));
  // A listed file must exist in evidence/.
  raw = raw.replace(/^files:$/m, "files:\n  - proof.txt");
  l = lintForm(t, raw, ev);
  assert.ok(l.problems.some((p) => p.includes("proof.txt")));
  writeFileSync(join(ev, "proof.txt"), "x");
  // Status done + everything visible: the lint passes.
  raw = withStatus(raw, "done", "human");
  l = lintForm(t, raw, ev);
  assert.equal(l.met, true, JSON.stringify(l.problems));
  assert.equal(l.status, "done");
  assert.equal(l.files[0].present, true);
  assert.deepEqual(l.fields[0].prefills, []);
});

test("surgical writes hold their shape: section replace, append, second prefill untouched", () => {
  const t = parseFormTemplate("t1", TPL);
  let raw = scaffoldInstance(t, "page");
  raw = withFieldContent(raw, "Goal", "<!-- a -->\n<!-- b -->");
  // Confirming index 1 leaves index 0 commented.
  raw = confirmPrefill(raw, "Goal", 1);
  const l = lintForm(t, raw, mkdtempSync(join(tmpdir(), "se-ev-")));
  assert.deepEqual(l.fields[0].prefills, ["a"]);
  assert.equal(l.fields[0].content, "b");
  // Replacing a section touches only that section.
  raw = withFieldContent(raw, "Done", "done text");
  assert.ok(raw.includes("<!-- a -->"));
  assert.ok(raw.includes("done text"));
  // A section the instance lacks is appended, not lost.
  raw = withFieldContent(raw, "Extra", "appended");
  assert.ok(raw.includes("## Extra"));
});

// A FILL THAT COMES BACK IS A REFUSAL, AND IT CARRIES ITS REMEDY (owner
// ruling 2026-08-07). The problems used to sit deep inside the form model,
// and a big form is moved to disk by the host, which hands back only the head
// of the JSON. The problems fell in the dropped part, so five calls went on
// guessing at a one-word mistake.
//
// THE POSITION IS THE TEST. It is not enough that the problems exist; they
// must sit near the FRONT, or a preview loses them again.
test("an unmet form's problems ride at the top of the fill, with what to do", () => {
  const src = readFileSync(join(import.meta.dirname, "..", "engine", "session.ts"), "utf8");

  // THE BLOCK EXISTS AND SAYS ALL THREE THINGS: what is wrong, why it blocks,
  // and what to do about it. A problem list with no remedy is the shape of a
  // refusal with the useful half removed.
  const at = src.indexOf("refusedBlock(names: string[])");
  assert.ok(at > 0, "the session builds a refused block");
  const body = src.slice(at, at + 900);
  assert.match(body, /problems/, "it carries the problems");
  assert.match(body, /why:/, "it says why the submit did not stamp");
  assert.match(body, /fix:/, "and it says what to do next");
  // EVERY LINE NAMES ITS FORM, so a pull carrying several forms is readable —
  // "required section X is empty" alone does not say whose X.
  assert.match(body, /\$\{n\}: \$\{p\}/, "each problem line names the form it belongs to");

  // AND IT SITS BEFORE THE FORM MODEL AT EVERY FILL. This is the whole point:
  // a host that moves a big answer to disk hands back the HEAD, so a block
  // spread after `forms` is a block the agent never sees.
  let fills = 0;
  for (const m of src.matchAll(/pull: "fill",/g)) {
    fills++;
    const window = src.slice(m.index, m.index + 400);
    const refused = window.indexOf("refusedBlock(");
    const forms = window.indexOf("forms:");
    assert.ok(refused > 0, `fill #${fills} carries the refused block`);
    assert.ok(refused < forms, `fill #${fills} puts refused BEFORE the form model`);
  }
  assert.ok(fills >= 3, `every fill site is covered — found ${fills}`);
});

// nodeList — the list-valued frontmatter reader. nodeField reads ONE line and
// slices after the colon, so every list came back empty before this existed:
// "no value" where the truth was "wrong reader".
test("nodeList reads a block list, an inline list and a bare scalar", () => {
  const dir = mkdtempSync(join(tmpdir(), "se-nl-"));
  const write = (name: string, body: string): string => {
    const p = join(dir, name);
    writeFileSync(p, body);
    return p;
  };

  const block = write("block.md", "---\nid: req-a\nrefines:\n  - uc-one\n  - uc-two\npriority: should\n---\n\nbody\n");
  assert.deepEqual(nodeList(block, "refines"), ["uc-one", "uc-two"]);

  // The block stops at the first non-item line, so a later key never leaks in.
  assert.deepEqual(nodeList(block, "priority"), ["should"]);

  const inline = write("inline.md", "---\nid: req-b\nrefines: [uc-one, uc-two]\n---\n");
  assert.deepEqual(nodeList(inline, "refines"), ["uc-one", "uc-two"]);

  // A COMMENT IS THE UNANSWERED STATE. Reading the prompt as a value is how a
  // field silently fills, so both shapes of comment yield nothing.
  const prompted = write(
    "prompted.md",
    "---\nid: req-c\nweighs_against: <!-- one line per pair -->\nweighs_with:\n  - <!-- a pool id -->\n---\n",
  );
  assert.deepEqual(nodeList(prompted, "weighs_against"), []);
  assert.deepEqual(nodeList(prompted, "weighs_with"), []);

  // An absent key and an unreadable path are both empty, never a throw.
  assert.deepEqual(nodeList(block, "nope"), []);
  assert.deepEqual(nodeList(join(dir, "missing.md"), "refines"), []);

  // FRONTMATTER ONLY. Past the closing fence a key-shaped line is prose.
  const prose = write("prose.md", "---\nid: req-d\n---\n\nrefines:\n  - uc-nope\n");
  assert.deepEqual(nodeList(prose, "refines"), []);
});

// The three criterion sources. The union-find is the risky part: a
// weighs_with group must collapse to ONE axis with a stable name, whichever
// member you came in through.
test("the criterion sources: pool, suspects, and axes collapsed by weighs_with", () => {
  // traceDir joins root/project/spec/trace, so the root is the REPO root and
  // the fixture has to carry the project folder inside it.
  const root = mkdtempSync(join(tmpdir(), "se-cs-"));
  const reqDir = join(root, "project", "spec", "trace", "requirement");
  mkdirSync(reqDir, { recursive: true });
  const req = (id: string, fm: string): void =>
    writeFileSync(join(reqDir, `${id}.md`), `---\nid: ${id}\ntype: "[[requirement]]"\n${fm}---\n\nbody\n`);

  // BOTH SIGNALS FIRE OR NEITHER. a and b share a characteristic AND a use
  // case, so they are a suspect pair. c shares only the use case, d only the
  // characteristic — neither is offered, because either signal alone flags
  // most of a real register.
  req(
    "req-a",
    "priority: should\ncharacteristic: reliability\nrefines:\n  - uc-one\nweighs_with: req-b — both measure whether a call survives\n",
  );
  req("req-b", "priority: should\ncharacteristic: reliability\nrefines:\n  - uc-one\n");
  req("req-c", "priority: should\ncharacteristic: security\nrefines:\n  - uc-one\nweighs_with: req-a — chained into the same group\n");
  req("req-d", "priority: could\ncharacteristic: reliability\nrefines:\n  - uc-two\n");
  // A DEMAND IS NOT AN AXIS. Every survivor meets it, so it separates nothing.
  req("req-gate", "priority: must\n");

  assert.deepEqual(criterionPoolItems(root), ["req-a", "req-b", "req-c", "req-d", "req-gate"]);

  // a, b and c are one axis; the group takes its LOWEST id. d stands alone.
  // The must row is gone, and it is the only pool member that is.
  assert.deepEqual(criterionAxisItems(root), ["req-a", "req-d"]);

  assert.deepEqual(compoundingSuspectItems(root), ["req-a", "req-b"]);

  // THE PAIRS ARE THE POINT. Flagging nodes and crossing them asks n(n-1)/2
  // questions, and over the real register that was 10,440 — not a form.
  assert.deepEqual(compoundingSuspectPairs(root), [["req-a", "req-b"]]);
});

// THE ROOT COMES FROM THIS FILE, never from the cwd. Scoped and battery runs
// start in different directories, so "." passed one and failed the other.
const REPO = fileURLToPath(new URL("../../../", import.meta.url));

test("the criterion sources resolve against the live register", () => {
  const pool = criterionPoolItems(REPO);
  // The screenshot that started this: an unresolved source renders its own
  // name in a cell. A non-empty pool is what says the source is real.
  assert.ok(pool.length > 0, "the criterion pool resolved to nothing");
  assert.ok(pool.every((id) => id.startsWith("req-") || id.startsWith("raid-")));

  // Every axis is a pool member. Nothing is invented on the way through.
  const axes = new Set(criterionAxisItems(REPO));
  const inPool = new Set(pool);
  for (const a of axes) assert.ok(inPool.has(a), `${a} is an axis but not in the pool`);

  for (const s of compoundingSuspectItems(REPO)) assert.ok(inPool.has(s), `${s} is a suspect but not in the pool`);
});

// A CLOSED ENTRY IS RULED AWAY, and a register entry is not a criterion at
// all. The card put up "no vendor ships adjudication provenance" against a
// requirement and asked which mattered more — a claim about the market beside
// a demand on the system, with no honest answer available. It was also
// closed, and nothing checked.
test("the pool is requirements only, and a closed register entry pulls nothing", () => {
  const root = mkdtempSync(join(tmpdir(), "se-pool-"));
  const reqDir = join(root, "project", "spec", "trace", "requirement");
  const raidDir = join(root, "project", "spec", "trace", "raid");
  mkdirSync(reqDir, { recursive: true });
  mkdirSync(raidDir, { recursive: true });
  const req = (id: string, fm: string): void =>
    writeFileSync(join(reqDir, `${id}.md`), `---\nid: ${id}\ntype: "[[requirement]]"\n${fm}---\n\nbody\n`);
  const raid = (id: string, fm: string): void =>
    writeFileSync(join(raidDir, `${id}.md`), `---\nid: ${id}\ntype: "[[raid]]"\n${fm}---\n\nbody\n`);

  req("req-leaned-on", "priority: could\n");
  req("req-quiet", "priority: could\n");
  req("req-demanded", "priority: must\n");
  raid("raid-open-worry", "kind: risk\nstatus: open\nsource_refs:\n  - req-leaned-on\n");
  raid("raid-ruled-away", "kind: assumption\nstatus: closed\nsource_refs:\n  - req-quiet\n");

  // NO raid- ID ANYWHERE. The register feeds the criteria by pointing at
  // requirements, never by standing beside them.
  assert.deepEqual(criterionPoolItems(root), ["req-demanded", "req-leaned-on", "req-quiet"]);

  // The closed entry contributes nothing. A concern somebody ruled away
  // cannot make a requirement matter more.
  assert.deepEqual(registerPull(root), { "req-leaned-on": 1 });

  // THE HINT ORDERS THE AXES. The must row is not an axis at all; of the two
  // that remain, the one the open register leans on comes first, so the
  // walk's bottom probe is the question most likely to be confirmed.
  assert.deepEqual(criterionAxisItems(root), ["req-leaned-on", "req-quiet"]);
});

// A HEADING INSIDE A FIELD STAYS INSIDE THE FIELD (2026-08-09, four times in
// one sitting). A `##` line in a body ended the section: the rest parsed as a
// made-up sibling, the required-check still saw the first paragraph, and the
// loss was invisible at the moment it happened. The author's heading is MEANT
// — voice.md asks for small headings in long prose — so it demotes to `###`
// on write instead of being refused.
test("a heading written into a field demotes and the field survives whole", () => {
  const t = parseFormTemplate("t1", TPL);
  let raw = scaffoldInstance(t, "page");
  raw = withFieldContent(raw, "Goal", "first paragraph\n\n## A small heading\n\nsecond paragraph\n\n# a top heading too\n\ntail");
  raw = withFieldContent(raw, "Done", "done");
  const l = lintForm(t, raw, mkdtempSync(join(tmpdir(), "se-ev-")));
  assert.ok(l.fields[0].content.includes("### A small heading"), "the heading demoted");
  assert.ok(l.fields[0].content.includes("### a top heading too"), "a # demotes the same way");
  assert.ok(l.fields[0].content.includes("tail"), "nothing after a heading is lost");
  assert.doesNotMatch(raw, /^## A small heading$/m, "no made-up sibling section exists");
});

// THE GRID READ VIEW (owner, 2026-08-09: "the rows are the candidates, the
// columns are the axes, the points in the cells"). A pairwise table — two
// closed-pick key columns and a value — renders as a matrix beside its flat
// rows: first key down, second across, the value in the cell, the remaining
// columns behind a cell click. A plain table stays flat.
test("a pairwise table renders its grid read view, and a plain table stays flat", () => {
  const render = new Function("name", "fl", "args", "escText", "sfRowBtns", TABLE_EDITOR.render) as (
    n: string,
    f: { content: string },
    a: Record<string, unknown>,
    e: (s: unknown) => string,
    b: () => string,
  ) => string;
  const escText = (s: unknown): string => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  const btns = (): string => "";
  const content = [
    "| candidate | axis | score | anchor | prior_art |",
    "| --- | --- | --- | --- | --- |",
    "| cand-a | req-x | 3 | solid | none |",
    "| cand-a | req-y | 4 | par | tool-z |",
    "| cand-b | req-x | 1 | gesture | none |",
  ].join("\n");
  const args = {
    columns: ["candidate", "axis", "score", "anchor", "prior_art"],
    column_help: [],
    picks: { candidate: ["cand-a", "cand-b"], axis: ["req-x", "req-y"], score: ["0", "1", "2", "3", "4", "5"] },
    pick_free: [],
    pick_sources: {},
  };
  const html = render("scores", { content }, args, escText, btns);
  assert.match(html, /sfgridcell/, "the grid renders");
  assert.match(html, /data-cols=/, "the grid carries its columns for the cell click");
  assert.ok(html.includes("<details>"), "the flat rows fold under the grid, still the editor");
  assert.match(html, /data-cell="\[&quot;cand-a&quot;,&quot;req-x&quot;/, "a cell carries its whole row for the details pane");

  const flat = render("scores", { content }, { ...args, picks: {} }, escText, btns);
  assert.doesNotMatch(flat, /sfgridcell/, "free key columns stay a flat table");
});
