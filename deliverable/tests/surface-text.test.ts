// THE SURFACE, READ AS WORDS. An agent's everyday way to see what the person
// is looking at, without asking to look at their screen.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { mirrorText } from "../engine/mirrortext.ts";
import { Session } from "../engine/session.ts";
import { freshRoot } from "./helpers.ts";

function textFor(): string {
  const root = freshRoot();
  const session = new Session(root);
  return mirrorText({ session, root, lastPacket: null, mode: "agent" });
}

test("the text render names where the walk stands and what is legal there", () => {
  const text = textFor();
  assert.match(text, /## Where the walk stands/);
  assert.match(text, /- state: \S/, "a state is named, not left blank");
  assert.match(text, /## Legal here/);
  assert.match(text, /se_pull/, "the one verb that drives the walk is on the list");
});

test("a tool is named once on the legal list", () => {
  // se_pull is BOTH always-legal and machinery, so the two lists overlapped and
  // every packet carrying a list named it twice.
  const text = textFor();
  const legal = text.split("## Legal here")[1]?.split("\n##")[0] ?? "";
  const names = legal
    .split("\n")
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2).trim());
  assert.equal(new Set(names).size, names.length, `a name appears twice: ${names.join(", ")}`);
});

test("the state the walk stands in is marked, and the marks come from the drawing", () => {
  const text = textFor();
  assert.match(text, /^- \S+ — HERE/m, "exactly the state the walk is in carries HERE");
  const heres = text.split("\n").filter((l) => l.includes("— HERE") || l.includes(", HERE"));
  assert.equal(heres.length, 1, `one state is HERE, got ${heres.join(" | ")}`);
});

test("the render is small enough to read without paging", () => {
  // IT IS A GLANCE, NOT A DUMP. A surface read that has to be paged is a
  // surface read nobody makes, and the agent would go back to screenshots.
  const text = textFor();
  assert.ok(text.length < 20_000, `${String(text.length)} characters is too long for a glance`);
  assert.ok(text.length > 100, "and it is not empty");
});
