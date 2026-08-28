// The corpus sweeps i44 arms: one question per case, a fresh root per case.
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { deadLaneVerbs, duplicateHeadings, staleCitations, unreferencedTokens } from "../engine/corpus-sweeps.ts";
import { danglingReferences, REFERENCE_KEYS } from "../engine/guard.ts";

function fresh(): string {
  return mkdtempSync(join(tmpdir(), "se-i44-"));
}

function node(root: string, rel: string, text: string): void {
  const abs = join(root, rel);
  mkdirSync(join(abs, ".."), { recursive: true });
  writeFileSync(abs, text, "utf8");
}

test("every key the corpus points with is a checked reference key", () => {
  for (const key of ["refines", "satisfies", "implements", "verifies", "demonstrates", "probes", "picks"]) {
    assert.ok(REFERENCE_KEYS.includes(key), `${key} is not swept for dangling references`);
  }
});

test("a node repeating a section heading is reported", () => {
  const found = duplicateHeadings("# Title\n\n## Detail\n\n## Detail\n\ntext\n");
  assert.deepEqual(found, ["## Detail"]);
});

test("the same words at a different heading level are two different headings", () => {
  const found = duplicateHeadings("# Detail\n\n## Detail\n\ntext\n");
  assert.deepEqual(found, []);
});

test("a heading repeated three times is reported once", () => {
  const found = duplicateHeadings("## Scope\n\n## Scope\n\n## Scope\n");
  assert.deepEqual(found, ["## Scope"]);
});

test("a citation naming a file the tree does not hold is reported", () => {
  const root = fresh();
  const found = staleCitations(root, "see `engine/gone.ts` for the rule\n");
  assert.deepEqual(found, ["engine/gone.ts"]);
});

test("a citation naming a file that exists is not reported", () => {
  const root = fresh();
  node(root, "engine/here.ts", "export const x = 1;\n");
  const found = staleCitations(root, "see `engine/here.ts` for the rule\n");
  assert.deepEqual(found, []);
});

test("a citation carrying a line number is checked on the file and not the line", () => {
  const root = fresh();
  node(root, "engine/here.ts", "export const x = 1;\n");
  const found = staleCitations(root, "see `engine/here.ts:900` for the rule\n");
  assert.deepEqual(found, []);
});

test("a lane verb named in the trace that the tool surface does not define is reported", () => {
  const root = fresh();
  node(root, "deliverable/engine/tools.ts", 'name: "se_pull",\nname: "se_git",\n');
  const found = deadLaneVerbs(root, "the agent calls se_git_sync and then se_pull\n");
  assert.deepEqual(found, ["se_git_sync"]);
});

test("a citation written at a shallower depth than the file still resolves", () => {
  const root = fresh();
  node(root, "deliverable/engine/guard.ts", "export const x = 1;\n");
  assert.deepEqual(staleCitations(root, "see `guard.ts` for the rule\n"), []);
  assert.deepEqual(staleCitations(root, "see `engine/guard.ts` for the rule\n"), []);
});

test("a verb declared outside the tool surface file is still alive", () => {
  const root = fresh();
  node(root, "deliverable/engine/tools.ts", 'name: "se_pull",\n');
  node(root, "deliverable/engine/dispatch.ts", 'case "se_survey":\n');
  assert.deepEqual(deadLaneVerbs(root, "the agent calls se_survey then se_pull\n"), []);
});

test("a work token no node references is named", () => {
  const root = fresh();
  node(root, "spec/trace/work-token/wt-alone.md", "---\nid: wt-alone\n---\n");
  node(root, "spec/trace/work-token/wt-cited.md", "---\nid: wt-cited\n---\n");
  node(root, "spec/trace/requirement/req-a.md", "---\nid: req-a\nsource_refs:\n  - wt-cited\n---\n");
  const found = unreferencedTokens(root);
  assert.deepEqual(found, ["wt-alone"]);
});

test("a citation the node marks unreachable is not reported", () => {
  const root = fresh();
  node(root, "deliverable/engine/guard.ts", "export const x = 1;\n");
  const text = [
    "---",
    'type: "[[raid]]"',
    "unreachable_citations:",
    "  - scratchpad/spike-left-check.mjs",
    "---",
    "",
    "The spike was `scratchpad/spike-left-check.mjs`, deleted after the run.",
    "",
  ].join("\n");
  assert.deepEqual(staleCitations(root, text), []);
});

test("the marker silences only the paths it names", () => {
  const root = fresh();
  node(root, "deliverable/engine/guard.ts", "export const x = 1;\n");
  const text = [
    "---",
    'type: "[[raid]]"',
    "unreachable_citations:",
    "  - scratchpad/spike-left-check.mjs",
    "---",
    "",
    "The spike was `scratchpad/spike-left-check.mjs`, and `engine/gone.ts` never landed.",
    "",
  ].join("\n");
  assert.deepEqual(staleCitations(root, text), ["engine/gone.ts"]);
});

// AN ID RESOLVES TO A PATH ONLY WHERE THE TEMPLATE DECLARING ITS PREFIX STANDS.
// A bare temp root has no templates, every id resolves to nothing, and a case
// built on one would pass by finding nothing at all.
//
// SO THE ROOT CARRIES THE TEMPLATE. The test-spec says no case reads the live
// corpus, and this is what it takes to keep that true.
function rootWithUseCaseTemplate(): string {
  const root = fresh();
  node(root, "deliverable/machines/items/use-case.md", "---\nid_prefix: uc-\nfolder: spec/trace/use-case\n---\n");
  return root;
}

const ABSENT = ["uc-a-node-this-corpus-does-not-hold", "uc-another-node-this-corpus-does-not-hold"];

test("a reference the node marks unreachable is not reported", () => {
  const root = rootWithUseCaseTemplate();
  const bare = { source_refs: [ABSENT[0]] };
  assert.equal(danglingReferences(root, bare).length, 1, "it dangles before the marker");
  const marked = { ...bare, unreachable_refs: [ABSENT[0]] };
  assert.deepEqual(danglingReferences(root, marked), []);
});

test("the reference marker silences only the ids it names", () => {
  const root = rootWithUseCaseTemplate();
  const bare = { source_refs: ABSENT };
  assert.equal(danglingReferences(root, bare).length, 2, "both dangle before the marker");
  const marked = { ...bare, unreachable_refs: [ABSENT[0]] };
  const found = danglingReferences(root, marked);
  assert.equal(found.length, 1);
  assert.ok(found[0].includes(ABSENT[1]), found[0]);
});

test("a verb named only in an engine comment is not alive", () => {
  const root = fresh();
  node(root, "deliverable/engine/tools.ts", '  { name: "se_pull" },\n  // se_git_sync was retired at i34\n');
  node(root, "deliverable/engine/session.ts", "// the walk once called se_version here\n");
  const found = deadLaneVerbs(root, "the agent calls se_version, se_git_sync and se_pull\n");
  assert.deepEqual(found.sort(), ["se_git_sync", "se_version"]);
});

test("a verb declared in any tools file is alive, whichever shape declares it", () => {
  const root = fresh();
  node(root, "deliverable/engine/tools.ts", '  { name: "se_pull" },\n');
  node(root, "deliverable/engine/tools-file.ts", '    "se_file_read": handler,\n');
  node(root, "deliverable/engine/tools-desk.ts", '      case "se_survey":\n');
  const found = deadLaneVerbs(root, "se_pull, se_file_read and se_survey all stand\n");
  assert.deepEqual(found, []);
});

test("with no tools file to read, the dead-verb check answers nothing", () => {
  const root = fresh();
  node(root, "deliverable/engine/session.ts", "// se_pull is mentioned but nothing declares it\n");
  assert.deepEqual(deadLaneVerbs(root, "the agent calls se_anything\n"), []);
});
