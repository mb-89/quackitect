// The drawing in a browser, driven by a fake host: the host posts a graph and a
// theme, and the case reads the page back and what the page posts.
// [[spec/design_output/drawing#a-fake-host-drives-it]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { pathToFileURL } from "node:url";
import { disk } from "../../src/doors/disk.js";
import { browserFrom } from "../../src/scripts/browser.js";
import { bundle, bundled, OUT, WEBVIEW } from "../../src/scripts/bundle.js";
import { readNote } from "../../.claude/skills/level0/lib/schema.js";
import { graphIn } from "../../src/scripts/graph.js";
import { aheadOnly } from "../../src/scripts/ticket-route.js";

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
  - name: tell
step: design/review
record:
  - step: sync
    skipped: true
    why: a desk box
  - step: design/draft
    returns: 2
---

# design

## draft

## review
`;
const FRONT = readNote(TICKET).front.said;

// The page a webview carries, with the one call a webview carries faked. [[spec/design_output/drawing#a-fake-host-drives-it]]
const PAGE = `<!doctype html><html><head><style>html,body{width:900px;height:700px}</style>
<script>window.posted=[];window.acquireVsCodeApi=()=>({postMessage:(one)=>window.posted.push(one)});</script>
</head><body><div id="route"></div></body></html>`;

let driven;
let page;

before(async () => {
  if (why) return;
  if (!bundled(files)) await bundle();
  const { chromium } = await import(pathToFileURL(DRIVER).href);
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
    ([one, steps]) => window.postMessage({ kind: "graph", graph: one, steps }, "*"),
    [graph, FRONT.steps],
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

// What the page posted past a mark, so each case reads its own messages. [[spec/design_output/drawing#the-page-speaks-in-messages]]
async function postedAfter(press) {
  const from = await page.evaluate(() => window.posted.length);
  await press();
  await page.waitForFunction((was) => window.posted.length > was, from);
  return page.evaluate((was) => window.posted.slice(was), from);
}

const node = (id) => page.locator(`.react-flow__node[data-id="${id}"]`);

test("a press on a node posts jump with the place the engine names", {
  skip: why,
}, async () => {
  const want = graphIn(TICKET).nodes.find((one) => one.id === "design/draft");
  const said = await postedAfter(() => node("design/draft").click());
  assert.deepEqual(said, [
    { kind: "jump", step: "design/draft", chapter: want.chapter, line: want.line },
  ]);
});

test("a press on the pointer posts take, or handback where the person holds it", {
  skip: why,
}, async () => {
  const took = await postedAfter(() => node("design/review").locator("button.take").click());
  assert.deepEqual(took, [{ kind: "take", step: "design/review" }]);
  await page.evaluate(
    ([one, steps]) =>
      window.postMessage({ kind: "graph", graph: one, steps, held: true }, "*"),
    [graphIn(TICKET), FRONT.steps],
  );
  const back = node("design/review").locator("button.handback");
  const gave = await postedAfter(() => back.click());
  assert.deepEqual(gave, [{ kind: "handback", step: "design/review" }]);
});

test("an edit to a step ahead posts the whole route ticket route takes", {
  skip: why,
}, async () => {
  const said = await postedAfter(() => node("ship").locator("button.down").click());
  assert.equal(said.length, 1);
  assert.equal(said[0].kind, "edit");
  assert.deepEqual(
    said[0].steps.map((one) => one.name),
    ["sync", "design", "tell", "ship"],
  );
  assert.deepEqual(aheadOnly(FRONT, said[0].steps), { steps: said[0].steps });
  const gone = await postedAfter(() => node("tell").locator("button.drop").click());
  assert.deepEqual(
    gone[0].steps.map((one) => one.name),
    ["sync", "design", "ship"],
  );
});

test("the page refuses an edit to a step behind the pointer", {
  skip: why,
}, async () => {
  for (const id of ["sync", "design", "design/draft", "design/review"]) {
    assert.equal(await node(id).locator("button.up, button.down, button.drop").count(), 0);
    assert.ok((await node(id).getAttribute("class")).split(/\s+/).includes("reached"));
  }
  assert.ok(await node("ship").locator("button.up").isDisabled(), "ship moves past no reached step");
  const before = await page.evaluate(() => window.posted.length);
  await node("ship").locator("button.up").click({ force: true });
  assert.equal(await page.evaluate(() => window.posted.length), before);
});
