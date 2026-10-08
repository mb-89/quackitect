// The pull as a tool, and the index tools the binary lists.
// [[spec/tickets/level0-tests-to-plugin-test]] [[spec/tickets/the-judge-leaves-the-code]] [[spec/tickets/level0-hooks-forward-to-go]]

import { expect, test } from "claude-code/testing";
import { answering, START, stepping, world } from "./world.ts";

const PULL = { tool: "mcp__level0__pull", input: { args: ["x", "--pass"] } } as never;
const TOOLS = [
  {
    name: "index_verb_check",
    description: "runs the check",
    action: "verb check",
    inputSchema: { type: "object", properties: { args: { type: "string" } } },
  },
];
const SPEC = { name: "pull", description: "pulls the next leaf", inputSchema: { type: "object" } };

test("the session start registers each tool the binary lists and the pull the pull verb prints", async ($, on) => {
  const w = world(on, {
    run: answering({ "--spec": { stdout: JSON.stringify(SPEC) }, tools: { stdout: JSON.stringify(TOOLS) } }),
  });
  await $.session.start(START);
  expect(w.registered).toEqual(["index_verb_check", "pull"]);
});

test("a binary that prints nothing registers no tool", async ($, on) => {
  const w = world(on, { run: () => null });
  await $.session.start(START);
  expect(w.registered).toEqual([]);
});

test("an index tool's call reaches the hooks door, and the door's result answers it", async ($, on) => {
  const w = world(on, { door: stepping({ "tool.call": { answer: { result: "green" } } }) });
  const said = await $.tool.call({ tool: "mcp__level0__index_verb_check", args: "--fast", input: {} } as never);
  expect(w.posts.find((one) => one.body.event === "tool.call")?.body.e).toMatchObject({ tool: "mcp__level0__index_verb_check" });
  expect(w.runs.some((one) => one.argv.includes("act"))).toBe(false);
  expect(JSON.stringify(said)).toContain("green");
});

test("the pull tool hands the call to the ticket pull verb, and answers the result it prints", async ($, on) => {
  const w = world(on, { run: answering({ pull: { stdout: JSON.stringify({ result: "work\n  x passes do" }) } }) });
  const said = await $.tool.call(PULL);
  const pull = w.runs.find((one) => one.argv.includes("pull"));
  expect(pull?.argv.slice(-4, -1)).toEqual(["ticket", "pull", "--tool"]);
  expect(JSON.parse(pull?.argv.at(-1) ?? "{}")).toMatchObject({ input: { args: ["x", "--pass"] } });
  expect(JSON.stringify(said)).toContain("x passes do");
  expect(w.spawned).toEqual([]);
});

test("a pull answering a spawn hands the step to one hand in the background", async ($, on) => {
  const answer = { result: "spawn\nthe leaf\n\ndo the step", spawn: "do the step" };
  const w = world(on, { run: answering({ pull: { stdout: JSON.stringify(answer) } }) });
  const said = await $.tool.call(PULL);
  expect(w.spawned).toHaveLength(1);
  expect(w.spawned[0]).toMatchObject({ prompt: "do the step", run_in_background: true });
  expect(JSON.stringify(said)).toContain("The hand works in the background");
});
