// The routes this tree ships, read off disk. A fixture says what a route does,
// and this case says the shipped file still carries it.
// [[spec/design_output/work#a-successor-is-person-work]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { readYaml } from "../../.claude/skills/level0/lib/schema.js";
import { mintedNote } from "../../.claude/skills/level0/lib/schema-mint.js";
import { slotFaults } from "../../.claude/skills/level0/lib/schema-route.js";
import { disk } from "../../src/doors/disk.js";
import { fakeFront } from "../../src/doors/fake/front.js";
import { firstLeaf } from "../../src/engine/group.js";
import { proc } from "../../src/doors/proc.js";
import { readsFor } from "../../src/scripts/guidance-hand.js";
import { askRows, processAt, schemasHere } from "../../src/scripts/process.js";
import { leafOf, leavesOf, stepPathOf, walkOf } from "../../src/scripts/pull-route.js";
import { keptOf, PAST, REFUSES } from "../../src/scripts/quack-topic.js";
import { at, rulesIn } from "./ruled.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const routeOf = (name) =>
  readYaml(files.read(join(root, "spec", "processes", `${name}.yaml`)));

// A question opens at the step a cloud box answers itself. [[spec/guidance/cloud/cloud]]
test("the question route opens at a step waiting for a person", () => {
  const front = routeOf("question");
  const path = stepPathOf(front);

  assert.equal(path, "answer", "the route opens at its answer step");
  assert.equal(leafOf(front, path)?.by, "person", "and that step waits for a person");
});

// A desk mints a successor off this route, and `branch unblock` refuses one opening where an agent works. [[spec/design_output/work#a-successor-is-person-work]]
test("the person route opens at a step a person does, and an agent carries the result on", () => {
  const front = routeOf("person");
  const path = stepPathOf(front);

  assert.equal(path, "do", "the route opens at the person's step");
  assert.equal(leafOf(front, path)?.by, "person", "and that step waits for a person");
  assert.equal(
    leafOf(front, "follow")?.by,
    "anyone",
    "the step behind it takes any hand",
  );
});

// A standard ticket meets one review, on its design, and goes on to the code. [[spec/tickets/one-review-a-ticket]]
// [[spec/design_output/pull#the-gate]]
// A process inside a delivery ends after implement, so the delivery's own acceptance reads its children. [[spec/tickets/the-last-gate-accepts]]
test("the group route reads its children through a final acceptance", () => {
  const steps = routeOf("group").steps;
  const names = steps.map((one) => one.name);
  const gate = steps.find((one) => String(one.final) === "true");
  assert.ok(gate, "the group route carries a final gate");
  assert.ok(
    names.indexOf(gate.name) > names.indexOf("children"),
    "it follows the children",
  );
});

test("the standard route gates the design once, and its last leaf hands on to the retro", () => {
  const front = routeOf("standard");

  assert.deepEqual(
    leavesOf(front).map((one) => one.path),
    [
      "design/owner-read",
      "design/draft",
      "design/tests-red",
      "gate",
      "implement/change",
      "implement/tests-green",
      "accept",
      "view",
    ],
    "one gate on the design, then the final acceptance and the owner's view after the code",
  );
  const gate = leafOf(front, "gate");
  assert.ok(gate.gate, "the gate names its question, and the schema admits it");
  const reads = readsFor({ disk: files, root, method: root, join, env: {} }, gate);
  assert.ok(
    reads.includes("spec/guidance/review/design"),
    "the gate's tags resolve the design note",
  );
  assert.ok(
    !reads.includes("spec/guidance/review/reviewing"),
    "and no other review note",
  );
  assert.equal(
    gate.not,
    "design/draft",
    "the author of the draft reviews nothing of it",
  );
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
    ["design/draft", "gate"],
    "the code reads the draft and the gate's verdict",
  );
  assert.deepEqual(
    slotFaults(front, "spec/processes/standard.yaml"),
    [],
    "every slot fills",
  );
});

const ruled = rulesIn(root);
const CLEAN = "A line the voice passes.";

// Every route's minted ticket, declared up front, so one Vale run reads them all. [[spec/design_output/doors#one-contract-test-per-door]]
const routes = files
  .list(join(root, "spec", "processes"))
  .filter((one) => one.name.endsWith(".yaml"))
  .map((one) => one.name.replace(/\.yaml$/, ""));
const minted = new Map(
  routes.map((name) => {
    const held = processAt(files, root, join, name);
    const made = mintedNote(
      schemasHere({ disk: files, root, join }),
      {
        kind: "ticket",
        path: `spec/tickets/${name}-rendered.md`,
        fields: {
          state: "open",
          process: held.link,
          process_hash: held.hash,
          steps: held.route,
          step: firstLeaf(held.route),
          Ask: [askRows(held.ask), "", CLEAN].join("\n").trim(),
        },
      },
      fakeFront(),
    );
    return [name, made];
  }),
);

// Every route renders a ticket at its mint, and real Vale reads it the way the verbs read an Ask: the rows past the tense reader, at a severity that refuses. A line the route writes carries no finding, so no verb meets the door on its first write. [[spec/design_output/pull#the-voice-reads-the-evidence]]
ruled.ifVale(
  "a ticket minted off every route draws no finding from the voice rules, in one Vale run",
  ruled.proves(
    Object.fromEntries(
      routes.map((name) => [
        name,
        at(minted.get(name).text ?? "", `spec/tickets/${name}-rendered.md`),
      ]),
    ),
    ({ found, text }) => {
      assert.ok(routes.length > 1, "the tree ships its routes");
      const faults = [];
      for (const name of routes) {
        const made = minted.get(name);
        assert.equal(made.why, undefined, `${name} mints: ${made.why}`);
        const rows = text(name).split("\n");
        const past = keptOf({ disk: files, proc: proc(), root }, text(name), found(name), PAST);
        for (const one of past) {
          if (!REFUSES.has(one.severity)) continue;
          faults.push(`${name}:${one.line} ${one.rule} | ${rows[one.line - 1]}`);
        }
      }
      assert.deepEqual(faults, [], "a route writes no line the voice refuses");
      assert.equal(ruled.spawned(), 1, "one Vale run reads every route");
    },
  ),
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
