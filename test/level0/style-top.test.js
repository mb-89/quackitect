// Every note at the top of spec/guidance rides the output style, so the
// standing layer carries the canary and the handover alone.
// [[spec/tickets/the-style-carries-the-top]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { HANDOVER } from "../../.claude/skills/level0/lib/folders.js";
import {
  STYLE,
  STYLE_NAME,
  writesOf,
} from "../../.claude/skills/level0/lib/projection.js";
import { TOOLS } from "../../.claude/skills/level0/lib/tools.js";
import {
  guidanceHere,
  HANDOVER_BLOCK,
  onPromptContext,
  onSessionStart,
} from "../../src/bridge/guidance.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));
const note = (rules) => `---\nkind: [[guidance]]\n---\n\n# Actionables\n\n${rules}`;
const VOICE = note("1. Say what is.\n2. Put the bottom line first.\n");
const WORKING = note("1. Answer the owner first.\n");
const CODE = note("1. Reach the outside through a door.\n");

const STYLED = {
  name: "the output style",
  shape: STYLE,
  target: ".claude/output-styles",
  from: "spec/guidance",
  wrap: "frontmatter",
};

function box(files = {}) {
  return {
    disk: fakeDisk({
      [at(TOOLS)]: "{}",
      [at("spec/guidance/voice.md")]: VOICE,
      [at("spec/guidance/working.md")]: WORKING,
      [at("spec/guidance/code/code.md")]: CODE,
      ...files,
    }),
    proc: fakeProc({}),
    work: ROOT,
    method: ROOT,
    env: {},
    specs: [],
    index: { dead: () => "" },
    log: { say: () => {} },
  };
}

// [[spec/tickets/the-style-carries-the-top]]
test("the projection writes every note at the top of spec/guidance into the output style", () => {
  const files = writesOf(
    STYLED,
    new Map([
      ["spec/guidance/voice.md", VOICE],
      ["spec/guidance/working.md", WORKING],
    ]),
  );
  const said = files.get(`.claude/output-styles/${STYLE_NAME}.md`);
  assert.match(
    said,
    /1\. Say what is\./,
    "a note carrying no style key rides the style",
  );
  assert.match(said, /1\. Answer the owner first\./, "every top note rides the style");
});

// [[spec/tickets/the-style-carries-the-top]]
test("the standing layer carries the canary and the handover alone", () => {
  const it = box({ [at(HANDOVER)]: "# Where it stands\n\nThe probe runs next.\n" });
  onSessionStart({}, it);

  const blocks = onPromptContext({}, it).after.blocks;
  const names = blocks.map((one) => one.name).filter((one) => one !== "level0-tools");

  assert.deepEqual(names, ["level0-canary", HANDOVER_BLOCK]);
  const said = guidanceHere(it.disk, ROOT, ROOT, {}, true);
  assert.equal(said.standing, "", "the session layer hands no note");
  assert.match(
    said.sentence,
    /3 rules, 2 notes/,
    "the canary counts the style's notes",
  );
  assert.match(said.helper, /Say what is\./, "a helper still carries the top notes");
});
