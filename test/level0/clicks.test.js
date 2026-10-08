// The browser side, driven with no browser. A fake page answers the calls
// the script makes, so a click becomes a message here exactly as it does in the
// webview.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  callFor,
  matches,
  messageFor,
  picked,
  restore,
  show,
  wire,
} from "../../src/extension/webview/clicks.js";

function node(sel, said = {}) {
  const classes = new Set(said.classes ?? []);
  return {
    sel,
    dataset: said.dataset ?? {},
    value: said.value ?? "",
    open: said.open,
    classList: {
      add: (one) => classes.add(one),
      remove: (one) => classes.delete(one),
      contains: (one) => classes.has(one),
    },
    closest: () => null,
    querySelectorAll: () => said.rows ?? [],
  };
}

// A page holding the nodes, wired, recording what it posts and the look it keeps. [[spec/guidance/code/testing]]
function wired(nodes = []) {
  const held = new Map();
  const root = {
    posted: [],
    state: {},
    addEventListener: (name, said) => held.set(name, said),
    fire: (name, target) => held.get(name)?.({ target }),
    querySelectorAll: (want) =>
      nodes.filter((one) => want.split(",").some((part) => part.trim() === one.sel)),
    querySelector: (want) => nodes.find((one) => one.sel === want),
  };
  wire(root, (one) => root.posted.push(one), {
    get: () => root.state,
    set: (one) => (root.state = one),
  });
  return root;
}
const on = (sel, target) => ({ closest: (want) => (want === sel ? target : null) });

const HOLD = {
  key: "stop.hold",
  widget: "toggle",
  options: "off finish stop",
  gesture: "5",
  value: "off",
};

// [[spec/design_output/extension#a-click-becomes-a-message]] [[spec/design_output/pull#the-bless]]
test("a click asks the run an action names, and the bless value the button does not hold", () => {
  const run = { key: "log.open", widget: "action", runs: "./RUNME.sh tui" };
  assert.deepEqual(messageFor(run), {
    kind: "run",
    key: "log.open",
    runs: "./RUNME.sh tui",
  });
  assert.deepEqual(messageFor({ widget: "bless", key: "bless", value: "false" }), {
    kind: "bless",
    value: true,
  });
  assert.deepEqual(messageFor({ widget: "bless", key: "bless", value: "true" }), {
    kind: "bless",
    value: false,
  });
});

// [[spec/design_output/extension#a-gesture-picks-a-state]]
test("five clicks on a toggle post five presses, a click off a widget nothing, and an edit its key and value", () => {
  const root = wired();
  for (let i = 0; i < 5; i++) root.fire("click", on(".widget", { dataset: HOLD }));
  root.fire("click", { closest: () => null });
  root.fire("change", {
    dataset: { key: "helper.find" },
    value: "sonnet",
    closest: () => null,
  });
  assert.deepEqual(root.posted, [
    ...Array(5).fill({ kind: "press", key: "stop.hold" }),
    { kind: "set", key: "helper.find", value: "sonnet" },
  ]);
});

// [[spec/design_output/extension#the-filter-reads-an-expression]]
test("the filter reads a regular expression, a bad one as plain words, and a node goes where no row matches", () => {
  assert.equal(matches("stop.hold running", "^stop\\."), true);
  assert.equal(matches("stop.hold running", "helper"), false);
  assert.equal(matches("helper.find haiku", "fi(nd"), false);
  assert.equal(matches("helper.fi(nd haiku", "fi(nd"), true);
  assert.equal(matches("anything", ""), true);
  const hold = node(".row", { dataset: { said: "stop.hold running" } });
  const model = node(".row", { dataset: { said: "helper.find haiku" } });
  const stop = node("details.keys", { rows: [hold] });
  const helper = node("details.keys", { rows: [model] });
  show(wired([hold, model, stop, helper]), "^stop");
  assert.deepEqual(
    [hold, model, stop, helper].map((one) => one.classList.contains("gone")),
    [false, true, false, true],
  );
});

test("opening a section keeps the look, and the page takes back the filter and the sections it held", () => {
  const root = wired();
  root.fire("toggle", { dataset: { section: "config" }, open: true });
  assert.deepEqual(root.state, { open: { config: true } });
  const box = node(".filter");
  const one = node("details.section", { dataset: { section: "config" }, open: false });
  restore(wired([box, one]), { filter: "helper", open: { config: true } });
  assert.deepEqual([box.value, one.open], ["helper", true]);
});

// [[spec/design_output/extension#the-gear-picks-the-sections]]
test("the gear opens the chooser, a tick brings its section back, and an untick rides through a redraw", () => {
  const chooser = { sel: ".chooser", hidden: true };
  const gear = { sel: ".gear", closest: (want) => (want === ".gear" ? gear : null) };
  const section = node("details.section", {
    dataset: { section: "config" },
    classes: ["gone"],
  });
  const box = {
    sel: '.pick[data-pick="config"]',
    checked: false,
    dataset: { pick: "config" },
    closest: () => null,
  };
  const root = wired([chooser, gear, section, box]);
  root.fire("click", gear);
  assert.equal(chooser.hidden, false, "the gear opens it");
  box.checked = true;
  root.fire("change", box);
  assert.deepEqual(root.state.picks, { config: true });
  assert.ok(!section.classList.contains("gone"), "the section stands again");

  picked(root, { config: false });
  assert.deepEqual([section.classList.contains("gone"), box.checked], [true, false]);
  restore(root, { picks: { config: true } });
  assert.deepEqual([section.classList.contains("gone"), box.checked], [false, true]);
});

// [[spec/design_output/extension#the-folds-press-at-once]]
test("the open press opens every group of the config section, and the shut press shuts each", () => {
  const groups = [
    node("details.file", { open: false }),
    node("details.keys", { open: false }),
    node("details.keys", { open: true }),
  ];
  const root = wired(groups);
  root.fire("click", on(".fold", { dataset: { fold: "open" } }));
  assert.deepEqual(
    groups.map((one) => one.open),
    [true, true, true],
  );
  root.fire("click", on(".fold", { dataset: { fold: "shut" } }));
  assert.deepEqual(
    groups.map((one) => one.open),
    [false, false, false],
  );
});

// [[spec/design_output/extension#the-views-section]]
test("a click on a view button posts a call with every field of its row, keyed", () => {
  const fields = [{ dataset: { field: "name" }, value: "a-name" }];
  assert.deepEqual(callFor({ calls: "tickets/open" }, fields), {
    kind: "call",
    calls: "tickets/open",
    input: { name: "a-name" },
  });
  assert.deepEqual(callFor({ calls: "work/pull" }), {
    kind: "call",
    calls: "work/pull",
    input: {},
  });
  assert.equal(callFor({}), undefined);
});
