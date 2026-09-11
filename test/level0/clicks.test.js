// The browser side, driven with no browser. A fake page answers the four calls
// the script makes, so a click becomes a message here exactly as it does in the
// webview.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  matches,
  messageFor,
  picked,
  restore,
  show,
  wire,
} from "../../src/extension/webview/clicks.js";
import { fresh } from "../../src/extension/webview/gesture.js";

function node(sel, said = {}) {
  const classes = new Set(said.classes ?? []);
  return {
    sel,
    dataset: said.dataset ?? {},
    value: said.value ?? "",
    open: said.open,
    rows: said.rows ?? [],
    classList: {
      add: (one) => classes.add(one),
      remove: (one) => classes.delete(one),
      contains: (one) => classes.has(one),
    },
    closest: () => null,
    querySelectorAll: () => said.rows ?? [],
  };
}

function page(nodes) {
  const held = new Map();
  return {
    addEventListener: (name, said) => held.set(name, said),
    fire: (name, target) => held.get(name)?.({ target }),
    querySelectorAll: (want) =>
      nodes.filter((one) => want.split(",").some((part) => part.trim() === one.sel)),
    querySelector: (want) => nodes.find((one) => one.sel === want),
  };
}

const HOLD = {
  key: "stop.hold",
  widget: "toggle",
  options: "running finishing stopped",
  gesture: "5",
  value: "running",
};

// [[spec/design_output/extension#a-click-becomes-a-message]]
test("a click on an action asks for the run the declaration names", () => {
  const said = messageFor(
    { key: "log.open", widget: "action", runs: "./RUNME.sh log" },
    0,
    fresh(),
  );
  assert.deepEqual(said.message, {
    kind: "run",
    key: "log.open",
    runs: "./RUNME.sh log",
  });
});

test("a click on a toggle asks for the value one rung up, and never draws it", () => {
  const said = messageFor(HOLD, 0, fresh());
  assert.deepEqual(said.message, { kind: "set", key: "stop.hold", value: "finishing" });
});

test("a second click inside the burst asks for nothing", () => {
  const first = messageFor(HOLD, 0, fresh());
  assert.equal(messageFor(HOLD, 100, first.state).message, undefined);
});

test("a click on the page away from a widget posts nothing", () => {
  const root = page([]);
  const posted = [];
  wire(
    root,
    (one) => posted.push(one),
    { get: () => ({}), set: () => {} },
    () => 0,
  );
  root.fire("click", { closest: () => null });
  assert.deepEqual(posted, []);
});

test("a widget clicked on the page posts the message the gesture answers", () => {
  const widget = { dataset: HOLD };
  const root = page([]);
  const posted = [];
  wire(
    root,
    (one) => posted.push(one),
    { get: () => ({}), set: () => {} },
    () => 0,
  );
  root.fire("click", { closest: (want) => (want === ".widget" ? widget : null) });
  assert.deepEqual(posted, [{ kind: "set", key: "stop.hold", value: "finishing" }]);
});

test("an editor changed in the bottom section posts the key and what stands in it", () => {
  const root = page([]);
  const posted = [];
  wire(
    root,
    (one) => posted.push(one),
    { get: () => ({}), set: () => {} },
    () => 0,
  );
  root.fire("change", {
    dataset: { key: "judge.model" },
    value: "sonnet",
    closest: () => null,
  });
  assert.deepEqual(posted, [{ kind: "set", key: "judge.model", value: "sonnet" }]);
});

// [[spec/design_output/extension#the-filter-reads-an-expression]]
test("the filter reads a regular expression, and a bad one reads as plain words", () => {
  assert.equal(matches("stop.hold running", "^stop\\."), true);
  assert.equal(matches("stop.hold running", "judge"), false);
  assert.equal(matches("judge.model haiku", "mod(el"), false);
  assert.equal(matches("judge.mod(el haiku", "mod(el"), true);
  assert.equal(matches("anything", ""), true);
});

test("a node shows where a row under it matches, and goes where none does", () => {
  const hold = node(".row", { dataset: { said: "stop.hold running" } });
  const model = node(".row", { dataset: { said: "judge.model haiku" } });
  const stop = node("details.keys", { rows: [hold] });
  const judge = node("details.keys", { rows: [model] });
  const root = page([hold, model, stop, judge]);

  show(root, "^stop");
  assert.equal(hold.classList.contains("gone"), false);
  assert.equal(model.classList.contains("gone"), true);
  assert.equal(stop.classList.contains("gone"), false);
  assert.equal(judge.classList.contains("gone"), true);
});

test("the page takes back the filter and the sections the last look held", () => {
  const box = node(".filter");
  const one = node("details.section", { dataset: { section: "config" }, open: false });
  const root = page([box, one]);

  restore(root, { filter: "judge", open: { config: true } });
  assert.equal(box.value, "judge");
  assert.equal(one.open, true);
});

test("opening a section writes what the page holds, and no value with it", () => {
  const root = page([]);
  let held = {};
  wire(
    root,
    () => {},
    { get: () => held, set: (one) => (held = one) },
    () => 0,
  );
  root.fire("toggle", { dataset: { section: "config" }, open: true });
  assert.deepEqual(held, { open: { config: true } });
});

// [[spec/design_output/extension#the-gear-picks-the-sections]]
test("the gear opens the chooser, and a tick brings its section back", () => {
  const chooser = { sel: ".chooser", hidden: true };
  const gear = { sel: ".gear", closest: (want) => (want === ".gear" ? gear : null) };
  const section = node("details.section", { dataset: { section: "config" } });
  const box = {
    sel: '.pick[data-pick="config"]',
    checked: false,
    dataset: { pick: "config" },
    closest: () => null,
  };
  const root = page([chooser, gear, section, box]);

  let state = {};
  const view = {
    get: () => state,
    set: (one) => {
      state = one;
    },
  };
  wire(root, () => {}, view, () => 0);

  root.fire("click", gear);
  assert.equal(chooser.hidden, false, "the gear opens it");

  box.checked = true;
  root.fire("change", box);
  assert.deepEqual(state.picks, { config: true }, "the choice rides in the state");
  assert.ok(!section.classList.contains("gone"), "the section stands again");
});

test("a section a person unticks goes, and the tick rides through a redraw", () => {
  const section = node("details.section", {
    classes: [],
    dataset: { section: "agent control" },
  });
  const box = {
    sel: '.pick[data-pick="agent control"]',
    checked: true,
    dataset: { pick: "agent control" },
  };
  const root = page([section, box]);

  picked(root, { "agent control": false });
  assert.ok(section.classList.contains("gone"));
  assert.equal(box.checked, false);

  restore(root, { picks: { "agent control": true } });
  assert.ok(!section.classList.contains("gone"));
  assert.equal(box.checked, true);
});
