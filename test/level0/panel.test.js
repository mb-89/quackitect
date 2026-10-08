// The renderer, read as the string it answers. Every case asserts one thing
// the page has to carry, because the editor drawing it is what a person checks
// once and a string is what a box checks every time.
// [[spec/guidance/code/testing]]

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
          runs: "./RUNME.sh tui",
          help: "Open the log viewer.",
          keys: ["q leave", "end follow the newest line"],
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
          enum: ["off", "finish", "stop"],
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
          enum: ["rest", "off"],
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

const TRACKED = { log: { level: "info" }, stop: { hold: "off", mostInARow: 3 } };

function drawn(local = {}) {
  return panelHtml({
    groups: groupsIn(SCHEMA, valuesOf(TRACKED, local)),
    tree: treeIn(SCHEMA, [
      { path: "spec/config/level0.json", said: TRACKED },
      { path: ".se/.runtime/config.json", said: local },
    ]),
    script: "https://box/webview/clicks.js",
    source: "https://box",
    nonce: "abc123",
  });
}

// [[spec/design_output/extension#a-mark-a-person-types]]
test("a mark stands as the emoji a person types, and codepoints draw the same", () => {
  assert.equal(markOf("✋\u{1F916}"), "✋\u{1F916}");
  assert.equal(markOf("❌\u{1F517}\u{1F916}"), "❌\u{1F517}\u{1F916}");
  assert.equal(markOf("U+270B U+1F916"), "✋\u{1F916}");
  assert.equal(markOf(""), "");
});

// [[spec/design_output/extension#the-gear-picks-the-sections]] [[spec/design_output/extension#a-mark-alone-says-it]]
test("the page lays out the gear, the controls and config, each widget in its cell with its mark alone", () => {
  const said = drawn();
  const at = (one) => said.indexOf(one);
  assert.match(
    said,
    /\.at-0-1-1-2 \{ grid-row: 1 \/ span 1; grid-column: 2 \/ span 2; \}/,
  );
  assert.ok(at('class="gear"') < at('<div class="top">'));
  assert.ok(at('<div class="top">') < at('data-section="agent control"'));
  assert.ok(at('data-section="agent control"') < at('data-section="config"'));
  assert.match(said, /body \{ display: flex; flex-direction: column;/);
  assert.match(
    said,
    /details\.section\[data-section='config'\] \{ margin-top: auto; flex: 0 1 auto;/,
  );
  assert.match(said, /\.chooser \{[^}]*top: 100%;/);
  assert.match(said, /\.top \{ flex: 1 1000 auto; min-height: 0; overflow-y: auto; \}/);
  const widget = /\.widget \{([^}]*)\}/.exec(said)?.[1] ?? "";
  for (const one of ["align-items", "justify-content", "text-align"])
    assert.match(widget, new RegExp(`${one}: center;`));
  assert.ok(!/class="said"/.test(said), "no word stands under a mark");
  // [[spec/design_output/extension#the-log-opens-a-terminal]]
  assert.match(
    said,
    /title="Open the log viewer\.\nq leave\nend follow the newest line/,
  );
  assert.match(
    said,
    /<span class="light dark"><\/span>/,
    "a status draws its light dark",
  );
});

// [[spec/design_output/extension#the-editor-picks-the-colours]] [[spec/design_output/extension#the-page-carries-a-nonce]]
test("every colour is the editor's variable, and the one script carries the nonce the policy names", () => {
  const said = drawn();
  const colours = said.match(/(background|color|border):[^;}]+/g) ?? [];
  assert.ok(colours.length, "the page paints something");
  for (const one of colours) assert.match(one, /var\(--vscode-/, one);
  assert.match(said, /default-src 'none';/);
  assert.match(said, /script-src 'nonce-abc123' https:\/\/box;/);
  assert.match(
    said,
    /<script type="module" nonce="abc123" src="https:\/\/box\/webview/,
  );
  assert.ok(!/<script>/.test(said), "no script stands without a nonce");
});

// [[spec/design_output/extension#the-bottom-section]] [[spec/design_output/extension#the-folds-press-at-once]]
test("config starts collapsed with a press each way beside its filter, each row an editor of its type", () => {
  const said = drawn();
  assert.deepEqual(
    said.match(/<details class="section" data-section="([^"]+)"( open)?>/g),
    ['<details class="section" data-section="agent control" open>'],
  );
  assert.match(said, /<details class="section gone" data-section="config">/);
  const at = (one) => said.indexOf(one);
  assert.ok(at('<div class="find">') < at('<input class="filter"'));
  assert.ok(at('<input class="filter"') < at('data-fold="open"'));
  assert.ok(at('data-fold="open"') < at('data-fold="shut"'));
  assert.ok(at('data-fold="shut"') < at('<div class="tree">'));
  assert.match(said, /<select id="spec\/config\/level0\.json:log\.level"/);
  assert.match(said, /<option value="info" selected>info<\/option>/);
  assert.match(said, /type="number" value="3">/);
  assert.match(said, /<span class="unit">turns<\/span>/);
  assert.match(said, /data-said="stop\.mostInARow 3 The turns it carries\."/);
  assert.match(said, /title="The turns it carries\."/);
});

test("a value carrying markup lands as text, and closes no tag", () => {
  const said = panelHtml({
    tree: treeIn(SCHEMA, [
      {
        path: ".se/.runtime/config.json",
        said: { log: { level: '"><script>x</script>' } },
      },
    ]),
  });
  assert.ok(!said.includes("<script>x</script>"), "the value draws no tag");
  assert.match(said, /&lt;script&gt;/);
});

// [[spec/design_output/pull#the-bless]]
test("the bless button draws held where an agent at this desk blesses, and plain where it does not", () => {
  const held = panelHtml({ bless: true });
  assert.match(held, /class="widget bless held" data-key="bless" data-widget="bless"/);
  assert.match(held, /data-value="true"/);

  const plain = panelHtml({ bless: false });
  assert.match(plain, /class="widget bless" data-key="bless" data-widget="bless"/);
  assert.match(plain, /data-value="false"/);
});

// [[spec/design_output/extension#the-views-section]]
test("a view section draws below the groups, its texts escaped and its button carrying the action it calls", () => {
  const said = panelHtml({
    groups: [],
    views: [
      {
        name: "work",
        badge: "work <3>",
        icon: "💼",
        buttons: [
          {
            name: "new",
            calls: "tickets/open",
            label: "New & ticket",
            doc: "opens a ticket",
            icon: "📝",
            form: { fields: [{ key: "name", label: "name", doc: "the name" }] },
          },
        ],
      },
    ],
  });
  assert.match(said, /<summary>💼 work &lt;3&gt;<\/summary>/);
  assert.match(said, /data-calls="tickets\/open" title="opens a ticket"/);
  assert.match(said, /New &amp; ticket/);
  assert.match(said, /<input class="field" data-field="name">/);
  assert.ok(said.indexOf('class="top"') < said.indexOf('class="section view"'));
});
