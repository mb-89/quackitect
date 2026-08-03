// Evidence forms — the mechanical lint and THE PREFILL LAW: commented
// content is invisible; a form never passes on unconfirmed prefills.
import { strict as assert } from "node:assert";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  confirmPrefill,
  lintForm,
  parseFormTemplate,
  scaffoldInstance,
  stripComments,
  withFieldContent,
  withStatus,
} from "../engine/forms.ts";

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
