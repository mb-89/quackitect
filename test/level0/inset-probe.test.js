// The inset probe's page and its height, with no editor.
// [[spec/tickets/the-editor-takes-an-inset]]

import assert from "node:assert/strict";
import { test } from "node:test";
import probe from "../../.claude/skills/inset-probe/lib.js";

const { ROUTE, escaped, linesFor, pageOf } = probe;

test("the page draws a box a step, and posts its height once it stands", () => {
  const page = pageOf(["design", "review"]);
  assert.equal(page.match(/class="step"/g).length, 2);
  assert.match(
    page,
    /postMessage\(\{ drawn: true, height: document\.body\.scrollHeight \}\)/,
  );
});

test("a step name reaches the page as text and never as markup", () => {
  assert.equal(escaped('<b>"x" & y</b>'), "&#60;b&#62;&#34;x&#34; &#38; y&#60;/b&#62;");
  assert.doesNotMatch(pageOf(["<script>"]), /<div class="step"><script>/);
});

test("the lines hold the page, and one more for the border", () => {
  assert.equal(linesFor(190, 19), 11);
  assert.equal(linesFor(191, 19), 12);
  assert.equal(linesFor(0, 19), 1);
  assert.equal(linesFor(190, 0), 1);
});

test("the route runs long enough to outgrow the first inset", () => {
  assert.ok(ROUTE.length > 10);
});
