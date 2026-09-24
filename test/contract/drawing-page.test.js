// The drawing in a browser, driven by a fake host: the host posts a graph and a
// theme, and the case reads the page back and what the page posts.
// [[spec/design_output/drawing#a-fake-host-drives-it]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { disk } from "../../src/doors/disk.js";
import { browserFrom } from "../../src/scripts/browser.js";
import { bundle, bundled, OUT, WEBVIEW } from "../../src/scripts/bundle.js";
import { graphIn } from "../../src/scripts/graph.js";

const files = disk();
const DRIVER = join(WEBVIEW, "node_modules", "playwright-core", "index.mjs");
const browser = browserFrom(process.env).path;
const why = !files.exists(DRIVER)
  ? "the drawing's modules stand uninstalled, so run ./RUNME.sh"
  : !browser && "no browser stands here, so run ./RUNME.sh";

// A ticket carrying each mark the page draws. [[spec/design_output/drawing#the-layout-reads-the-graph]]
const TICKET = `---
steps:
  - name: sync
    when: cloud
  - name: design
    steps:
      - name: draft
      - name: review
        on_fail: draft
        by: person
  - name: ship
step: design/review
record:
  - step: sync
    skipped: true
    why: a desk box
  - step: design/draft
    returns: 2
---
`;

// The page a webview carries, with the one call a webview carries faked. [[spec/design_output/drawing#a-fake-host-drives-it]]
const PAGE = `<!doctype html><html><head><style>html,body{width:900px;height:700px}</style>
<script>window.posted=[];window.acquireVsCodeApi=()=>({postMessage:(one)=>window.posted.push(one)});</script>
</head><body><div id="route"></div></body></html>`;

let driven;
let page;

before(async () => {
  if (why) return;
  if (!bundled(files)) await bundle();
  const { chromium } = await import(DRIVER);
  driven = await chromium.launch({ executablePath: browser, headless: true });
  page = await driven.newPage();
  await page.setContent(PAGE);
  await page.addStyleTag({ path: OUT.replace(/\.js$/, ".css") });
  await page.addScriptTag({ path: OUT });
});

after(async () => {
  await driven?.close();
});

test("the page posts ready once it mounts, and draws nothing before a graph", {
  skip: why,
}, async () => {
  await page.waitForFunction(() => window.posted.some((one) => one.kind === "ready"));
  assert.equal(await page.locator(".react-flow__node").count(), 0);
});

test("a graph message draws every node and edge the graph carries", {
  skip: why,
}, async () => {
  const graph = graphIn(TICKET);
  await page.evaluate(
    (one) => window.postMessage({ kind: "graph", graph: one }, "*"),
    graph,
  );
  await page.waitForFunction(
    (want) => document.querySelectorAll(".react-flow__node").length === want,
    graph.nodes.length,
  );
  await page.waitForFunction(
    (want) => document.querySelectorAll(".react-flow__edge").length === want,
    graph.edges.length,
  );
  const classes = async (id) =>
    (
      await page.locator(`.react-flow__node[data-id="${id}"]`).getAttribute("class")
    ).split(/\s+/);
  assert.ok(
    (await classes("design/review")).includes("at"),
    "the pointer stands on review",
  );
  assert.ok(
    (await classes("design/review")).includes("person"),
    "review waits on a person",
  );
  assert.ok((await classes("sync")).includes("dotted"), "sync runs on a condition");
  assert.ok((await classes("sync")).includes("skipped"), "sync stands skipped");
  assert.ok(
    (await classes("design/draft")).includes("returns"),
    "draft carries its returns",
  );
  assert.ok((await classes("design")).includes("phase"), "design is a phase");
  assert.match(await page.locator('[data-id="design/draft"]').innerText(), /↺2/);
  assert.equal(await page.locator(".react-flow__edge.fail").count(), 1);
});

test("a theme message turns the scheme, and a stray kind changes nothing", {
  skip: why,
}, async () => {
  await page.evaluate(() => window.postMessage({ kind: "theme", theme: "dark" }, "*"));
  await page.waitForSelector(".react-flow.dark");
  const before = await page.locator(".react-flow__node").count();
  await page.evaluate(() => window.postMessage({ kind: "nothing" }, "*"));
  await page.evaluate(() => window.postMessage({ kind: "theme", theme: "sepia" }, "*"));
  assert.equal(await page.locator(".react-flow.dark").count(), 1);
  assert.equal(await page.locator(".react-flow__node").count(), before);
});
