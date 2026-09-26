// The routes this tree ships, read off disk. A fixture says what a route does,
// and this case says the shipped file still carries it.
// [[spec/design_output/work#a-successor-stands-on-question]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { skip, test } from "node:test";
import { fileURLToPath } from "node:url";
import { readYaml } from "../../.claude/skills/level0/lib/schema.js";
import { mintedNote } from "../../.claude/skills/level0/lib/schema-mint.js";
import { slotFaults } from "../../.claude/skills/level0/lib/schema-route.js";
import { voiceOver } from "../../src/bridge/findings.js";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";
import { firstLeaf } from "../../src/engine/group.js";
import { readTools, whereIs } from "../../src/engine/tools.js";
import { askRows, processAt } from "../../src/scripts/process.js";
import { leafOf, stepPathOf } from "../../src/scripts/pull.js";
import { leavesOf, walkOf } from "../../src/scripts/pull-route.js";
import { schemasHere } from "../../src/scripts/ticket.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const routeOf = (name) =>
  readYaml(files.read(join(root, "spec", "processes", `${name}.yaml`)));

// A desk mints a successor off this route, and `branch unblock` refuses one opening where an agent works. [[spec/design_output/work#a-successor-stands-on-question]]
test("the question route opens at a step waiting for a person", () => {
  const front = routeOf("question");
  const path = stepPathOf(front);

  assert.equal(path, "answer", "the route opens at its answer step");
  assert.equal(leafOf(front, path)?.by, "person", "and that step waits for a person");
});

// A standard ticket meets one review, on its design, and goes on to the code. [[spec/tickets/one-review-a-ticket]]
test("the standard route reviews the design once, and its last leaf hands on to the retro", () => {
  const front = routeOf("standard");

  assert.deepEqual(
    leavesOf(front).map((one) => one.path),
    [
      "design/owner-read",
      "design/draft",
      "design/review",
      "implement/tests-red",
      "implement/change",
      "implement/tests-green",
      "view",
    ],
    "one review, and the owner's view the one verdict after the code",
  );
  const review = leafOf(front, "design/review");
  assert.ok(
    review.reads.includes("spec/guidance/review/design"),
    "the review reads the design note",
  );
  assert.ok(
    !review.reads.includes("spec/guidance/review/reviewing"),
    "and no other review note",
  );
  assert.equal(review.on_fail, "draft", "a fail goes back to the draft");
  const draft = leafOf(front, "design/draft");
  assert.equal(
    draft.evidence.find((one) => one.name === "tests")?.form,
    "list",
    "the draft names its tests, one a line",
  );
  assert.ok(
    [draft.said.checklist ?? []].flat().length > 0,
    "the draft leaf holds its own checklist",
  );
  // The review weighs the spread against the ask. [[spec/tickets/a-small-ask-stays-small]]
  assert.equal(
    draft.evidence.find((one) => one.name === "size")?.form,
    "list",
    "the draft names every file it touches, one a line",
  );
  assert.equal(leafOf(front, "implement/tests-green").said.to, "retro");
  assert.deepEqual(
    walkOf(front).find((one) => one.path === "implement")?.said.input,
    ["design/draft", "design/review"],
    "the code reads the draft and the review's findings",
  );
  assert.deepEqual(
    slotFaults(front, "spec/processes/standard.yaml"),
    [],
    "every slot fills",
  );
});

const vale = whereIs(files, root, "vale", readTools(files, root));
const ifVale = files.exists(vale) ? test : skip;
const CLEAN = "A line the voice passes.";

// Every route renders a ticket at its mint, and real Vale reads it the way the verbs read an Ask. A line the route writes carries no finding, so no verb meets the door on its first write. [[spec/design_output/pull#the-voice-reads-the-evidence]]
ifVale(
  "a ticket minted off every route under spec/processes draws no finding from the voice rules",
  () => {
    const it = { disk: files, proc: proc(), root, join, vale };
    const names = files
      .list(join(root, "spec", "processes"))
      .filter((one) => one.name.endsWith(".yaml"))
      .map((one) => one.name.replace(/\.yaml$/, ""));
    assert.ok(names.length > 1, "the tree ships its routes");
    const found = [];
    for (const name of names) {
      const held = processAt(files, root, join, name);
      const path = `spec/tickets/${name}-rendered.md`;
      const made = mintedNote(schemasHere(it), {
        kind: "ticket",
        path,
        fields: {
          state: "open",
          process: held.link,
          process_hash: held.hash,
          steps: held.route,
          step: firstLeaf(held.route),
          Ask: [askRows(held.ask), "", CLEAN].join("\n").trim(),
        },
      });
      assert.equal(made.why, undefined, `${name} mints: ${made.why}`);
      const rows = made.text.split("\n");
      for (const one of voiceOver(it, path, made.text)) {
        found.push(`${name}:${one.line} ${one.rule} | ${rows[one.line - 1]}`);
      }
    }
    assert.deepEqual(found, [], "a route writes no line the voice refuses");
  },
);

const guidanceOf = (name) =>
  files.read(join(root, "spec", "guidance", "retro", `${name}.md`));

// [[spec/tickets/the-retro-finishes-its-asks]]
test("the retro route ends on the report the owner passes, then the mint", () => {
  const steps = routeOf("retro").steps;
  const named = (name) => steps.find((one) => one.name === name);
  assert.deepEqual(
    steps.slice(-3).map((one) => one.name),
    ["check", "report", "mint"],
  );
  assert.match(named("check").evidence[0].says, /retro matrix/);
  assert.equal(named("report").by, "person");
  assert.equal(named("report").on_fail, "check");
  assert.equal(named("report").evidence[0].form, "verdict");
  assert.match(named("mint").evidence[0].says, /retro mint/);
  const check = guidanceOf("check");
  assert.match(check, /`report` step/);
  assert.match(check, /`mint` step/);
});

// [[spec/tickets/the-retro-finishes-its-asks]]
test("the audit checklist reads whole, and collect names .se/scripts beside the dot folders", () => {
  const audit = routeOf("retro").steps.find((one) => one.name === "audit");
  assert.ok(
    audit.checklist.every((one) => typeof one === "string"),
    "every item reads as text",
  );
  assert.match(guidanceOf("collect"), /`\.se\/scripts`/);
  const collect = routeOf("retro").steps.find((one) => one.name === "collect");
  assert.match(collect.evidence[0].says, /\.se\/scripts/);
});

// A box's transcript stays home, so the group's `write` step carries its account off it. [[spec/tickets/the-retro-reads-cloud-retros]]
test("the group's write step asks the owner prompts and errors of the run off the transcript, with their times", () => {
  const retroStep = routeOf("group").steps.find((one) => one.name === "retro");
  const write = retroStep.steps.find((one) => one.name === "write");
  const badly = write.evidence.find((one) => one.name === "badly");
  assert.match(badly.says, /each error of the run/);
  assert.match(badly.says, /each owner prompt/);
  assert.match(badly.says, /with its time/);
  assert.ok(
    write.checklist.includes(
      "the chapter carries the run's owner prompts and errors off the transcript, each with its time",
    ),
    "the checklist asks the prompts and the errors",
  );
  assert.ok(
    write.checklist.includes(
      "the chapter says the role, and carries no name, address or path of the box",
    ),
    "the checklist keeps the box's names off the chapter",
  );
});

// [[spec/tickets/the-retro-reads-cloud-retros]]
test("the reader rule hands each group chapter to the reader whose hours hold its close, as the one reach past its lines", () => {
  const read = guidanceOf("read");
  const rules = read.split("\n").filter((row) => /^\d+\. /.test(row));
  const reach = rules.find((row) => row.includes("input/groups/closed.json"));
  assert.ok(reach, "a rule reads the closes");
  assert.match(reach, /`input\/groups\/<group>\.md`/);
  assert.match(reach, /hours hold/);
  const number = reach.split(".")[0];
  assert.match(
    rules[0],
    new RegExp(`the one reach rule ${number} names`),
    "rule one names the reach",
  );
});

// The owner names the view and its number, and the owner's view closes the route. [[spec/tickets/the-owner-view-decides-done]]
test("the standard route asks for the view the owner reads, in the owner's words", () => {
  const held = processAt(files, root, join, "standard");
  const view = held.ask.find((one) => one.name === "view");

  assert.equal(view?.form, "text", "the ask carries a view field");
  assert.match(view.says, /owner's words/, "in the owner's words");
  const last = held.route.at(-1);
  assert.equal(last.name, "view", "the view step closes the route");
  assert.equal(last.by, "person", "and a person passes it");
  assert.equal(last.when, "view", "where the ask names a view");
  assert.equal(last.on_fail, "implement", "a fail goes back to the code");
});

// The owner's words travel as quoted, and a ticket off a handover waits on the owner's read. [[spec/tickets/the-owners-words-travel-verbatim]]
test("the note route asks for the owner's quoted words with their transcript line", () => {
  const said = processAt(files, root, join, "note").ask.find(
    (one) => one.name === "said",
  );
  assert.equal(said?.form, "list", "the note asks for the owner's words, one a line");
  assert.match(said.says, /transcript line/, "each with its transcript line");
});

test("the standard route opens on the owner's read where the ask comes off a handover", () => {
  const held = processAt(files, root, join, "standard");
  assert.equal(held.ask.find((one) => one.name === "from")?.form, "text");
  const first = leavesOf(
    readYaml(files.read(join(root, "spec", "processes", "standard.yaml"))),
  )[0];
  assert.equal(first.path, "design/owner-read", "the owner's read stands first");
  const read = leafOf(routeOf("standard"), "design/owner-read");
  assert.equal(read.by, "person");
  assert.equal(read.when, "handed");
});
