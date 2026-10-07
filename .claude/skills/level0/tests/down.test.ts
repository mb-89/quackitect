// The hooks door standing down: the start road, the cage verb, and the fall said once.
// [[spec/tickets/level0-tests-to-plugin-test]] [[spec/tickets/a-down-index-refuses-calls]]

import { expect, test } from "claude-code/testing";
import { STARTING } from "../hooks/level0.ts";
import { SESSION } from "../lib/log.js";
import { answering, START, world } from "./world.ts";

const CALL = { tool: "Bash", input: { command: "ls" } } as never;
const FELL = /LEVEL ZERO ANSWERS NOTHING/;

test("a door standing nowhere runs the start road once in its span, and the door it stands answers", async ($, on) => {
  const w = world(on, { up: false });
  w.run = (argv) => {
    if (argv.includes("serve")) w.up = true;
    return { exitCode: 0, stdout: "", stderr: "" };
  };
  await $.tool.call(CALL);
  await $.tool.call(CALL);
  const serves = w.runs.filter((one) => one.argv.includes("serve"));
  expect(serves.map((one) => one.argv.slice(-2))).toEqual([["serve", "--bridge"]]);
  expect(serves[0]?.init.timeoutMs).toBe(STARTING);
  expect(w.posts.filter((one) => one.body.event === "tool.call")).toHaveLength(2);
  expect(w.said).toEqual([]);
});

test("while the door stays down the cage verb's deny answers a call", async ($, on) => {
  const w = world(on, { up: false, run: answering({ cage: { stdout: '{"deny":"caged"}' } }) });
  const said = await $.tool.call(CALL);
  const cage = w.runs.find((one) => one.argv.includes("cage"));
  expect(JSON.parse(cage?.init.stdin)).toMatchObject({ event: "tool.call", e: { tool: "Bash" } });
  expect(JSON.stringify(said)).toContain("caged");
  expect(w.harness).toEqual([]);
});

test("a call the cage verb leaves alone passes to the harness", async ($, on) => {
  const w = world(on, { up: false });
  await $.tool.call(CALL);
  expect(w.harness).toHaveLength(1);
});

test("a fall says itself once, and again once the door answered and fell", async ($, on) => {
  const w = world(on, { up: false });
  await $.tool.call(CALL);
  await $.tool.call(CALL);
  expect(w.said.filter((one) => FELL.test(one))).toHaveLength(1);
  w.up = true;
  await $.tool.call(CALL);
  w.up = false;
  await $.tool.call(CALL);
  expect(w.said.filter((one) => FELL.test(one))).toHaveLength(2);
});

test("the row the start road prints lands through the log verb as it came", async ($, on) => {
  const row = { level: "warn", said: "no index starts on this box", event: "session.start" };
  const w = world(on, { up: false, run: answering({ serve: { stdout: JSON.stringify(row) } }) });
  await $.tool.call(CALL);
  const log = w.runs.find((one) => one.argv.includes("--say"));
  expect(JSON.parse(log?.argv.at(-1) ?? "{}")).toMatchObject({ level: "warn", said: row.said });
});

test("a binary standing nowhere writes the fall row into the session file", async ($, on) => {
  const w = world(on, { up: false, run: () => null });
  await $.tool.call(CALL);
  const file = [...w.wrote].find(([path]) => path.endsWith(SESSION));
  const rows = String(file?.[1] ?? "").trim().split("\n").map((one) => JSON.parse(one));
  expect(rows.map((one) => one.said)).toContain("the start road answers no row, so no index starts");
});
