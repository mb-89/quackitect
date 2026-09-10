// The renderer, read as the string it answers. Every case asserts one thing
// the page has to carry, because the editor drawing it is what a person checks
// once and a string is what a box checks every time.
// [[spec/guidance/testing]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { markOf, panelHtml } from "../../src/extension/lib/panel.js";
import { groupsIn, treeIn, valuesOf } from "../../src/extension/lib/widgets.js";

const SCHEMA = {
  type: "object",
  properties: {
    log: {
      type: "object",
      properties: {
        open: {
          widget: "action",
          runs: "./RUNME.sh log",
          help: "Open the log in lnav.",
          keys: ["q leave", "G jump to the newest line"],
          at: "U+1F4DC",
          group: "agent control",
          row: 0,
          column: 0,
        },
        level: { type: "string", enum: ["info", "warn"], help: "What it writes." },
      },
    },
    stop: {
      type: "object",
      properties: {
        hold: {
          type: "string",
          enum: ["running", "finishing", "stopped"],
          widget: "toggle",
          gesture: 5,
          at: "U+270B U+1F916",
          group: "agent control",
          row: 0,
          column: 1,
          colSpan: 2,
        },
        mostInARow: { type: "number", unit: "turns", help: "The turns it carries." },
      },
    },
    engine: {
      type: "object",
      properties: {
        state: {
          type: "string",
          enum: ["rest", "running"],
          widget: "status",
          sets: "engine.state",
          watches: "engine.beat",
          group: "agent control",
          row: 1,
          column: 0,
        },
      },
    },
  },
};

const TRACKED = { log: { level: "info" }, stop: { hold: "running", mostInARow: 3 } };

function drawn(local = {}) {
  return panelHtml({
    groups: groupsIn(SCHEMA, valuesOf(TRACKED, local)),
    tree: treeIn(SCHEMA, [
      { path: "spec/config/level0.json", said: TRACKED },
      { path: ".se/config.json", said: local },
    ]),
    script: "https://box/webview/clicks.js",
    source: "https://box",
    nonce: "abc123",
  });
}

// [[spec/design_output/extension#a-mark-and-its-codepoints]]
test("a mark stands in the declaration as codepoints, and draws as the emoji", () => {
  assert.equal(markOf("U+270B U+1F916"), "✋\u{1F916}");
  assert.equal(markOf(""), "");
  assert.equal(markOf("the raised hand"), "");
});

test("every widget of a group draws, each in the cell the declaration names", () => {
  const said = drawn();
  assert.match(said, /data-key="log\.open"/);
  assert.match(said, /data-key="stop\.hold"/);
  assert.match(
    said,
    /\.at-0-1-1-2 \{ grid-row: 1 \/ span 1; grid-column: 2 \/ span 2; \}/,
  );
});

// [[spec/design_output/extension#the-log-opens-a-terminal]]
test("the log button's hover carries the lnav keys the declaration names", () => {
  const said = drawn();
  assert.match(
    said,
    /title="Open the log in lnav\.\nq leave\nG jump to the newest line/,
  );
});

test("a widget away from rest wears the mark saying so, and one at rest does not", () => {
  assert.ok(!/class="widget at-0-1-1-2 away"/.test(drawn()));
  assert.match(drawn({ stop: { hold: "stopped" } }), /class="widget at-0-1-1-2 away"/);
});

test("a status draws its light dark, because nothing writes a heartbeat yet", () => {
  assert.match(drawn(), /<span class="light dark"><\/span>/);
});

// [[spec/design_output/extension#the-editor-picks-the-colours]]
test("every colour the page names is a variable the editor sets", () => {
  const said = drawn();
  const colours = said.match(/(background|color|border):[^;}]+/g) ?? [];
  assert.ok(colours.length, "the page paints something");
  for (const one of colours) {
    assert.match(one, /var\(--vscode-/, `${one} takes the editor's own value`);
  }
});

// [[spec/design_output/extension#the-page-carries-a-nonce]]
test("the page runs one script, and the policy names its nonce and its source", () => {
  const said = drawn();
  assert.match(said, /default-src 'none';/);
  assert.match(said, /script-src 'nonce-abc123' https:\/\/box;/);
  assert.match(
    said,
    /<script type="module" nonce="abc123" src="https:\/\/box\/webview/,
  );
  assert.ok(!/<script>/.test(said), "no script stands without a nonce");
});

// [[spec/design_output/extension#the-bottom-section]]
test("the bottom section comes last and starts collapsed, and every other opens", () => {
  const said = drawn();
  const sections = said.match(
    /<details class="section" data-section="([^"]+)"( open)?>/g,
  );
  assert.deepEqual(sections, [
    '<details class="section" data-section="agent control" open>',
    '<details class="section" data-section="config">',
  ]);
});

test("the bottom section draws an editor matching the type, and the unit beside it", () => {
  const said = drawn();
  assert.match(said, /<select id="spec\/config\/level0\.json:log\.level"/);
  assert.match(said, /<option value="info" selected>info<\/option>/);
  assert.match(said, /type="number" value="3">/);
  assert.match(said, /<span class="unit">turns<\/span>/);
});

test("a row hovers its help, and carries the words the filter reads", () => {
  assert.match(drawn(), /data-said="stop\.mostInARow 3 The turns it carries\."/);
  assert.match(drawn(), /title="The turns it carries\."/);
});

test("a value carrying markup lands as text, and closes no tag", () => {
  const said = panelHtml({
    tree: treeIn(SCHEMA, [
      { path: ".se/config.json", said: { log: { level: '"><script>x</script>' } } },
    ]),
  });
  assert.ok(!said.includes("<script>x</script>"), "the value draws no tag");
  assert.match(said, /&lt;script&gt;/);
});
