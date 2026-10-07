// The pull as a tool, and the index tools the binary lists.
// [[spec/tickets/level0-tests-move-to-plugin-test]] [[spec/tickets/the-judge-leaves-the-code]]

import { expect, test } from "claude-code/testing";
import { SESSION } from "../lib/pull.js";
import { answering, START, world } from "./world.ts";

const PULL = { tool: "mcp__level0__pull", input: { args: ["x", "--pass"] } } as never;
const TOOLS = [
  {
    name: "index_verb_check",
    description: "runs the check",
    action: "verb check",
    inputSchema: { type: "object", properties: { args: { type: "string" } } },
  },
];

test("the session start registers the pull and each tool the binary lists, and writes the session file", async ($, on) => {
  const w = world(on, { run: answering({ tools: { stdout: JSON.stringify(TOOLS) } }) });
  await $.session.start({ ...(START as object), sessionId: "s1" } as never);
  expect(w.registered).toEqual(["pull", "index_verb_check"]);
  const file = [...w.wrote].find(([path]) => path.endsWith(SESSION));
  expect(JSON.parse(file?.[1] ?? "{}")).toMatchObject({ id: "s1" });
});

test("an index tool runs its action with the arguments it declares, and answers what it prints", async ($, on) => {
  const w = world(on, {
    run: answering({ tools: { stdout: JSON.stringify(TOOLS) }, act: { stdout: "green" } }),
  });
  await $.session.start(START);
  const said = await $.tool.call({ tool: "mcp__level0__index_verb_check", args: "--fast", input: {} } as never);
  const act = w.runs.find((one) => one.argv.includes("act"));
  expect(act?.argv.slice(-3)).toEqual(["act", "verb check", '{"args":"--fast"}']);
  expect(JSON.stringify(said)).toContain("green");
});

test("the pull tool hands the call to the ticket pull verb, and answers what it prints", async ($, on) => {
  const w = world(on, { run: answering({ pull: { stdout: "work\n  x passes do" } }) });
  const said = await $.tool.call(PULL);
  const pull = w.runs.find((one) => one.argv.includes("pull"));
  expect(pull?.argv.slice(-4, -1)).toEqual(["ticket", "pull", "--tool"]);
  expect(JSON.parse(pull?.argv.at(-1) ?? "{}")).toMatchObject({ input: { args: ["x", "--pass"] } });
  expect(JSON.stringify(said)).toContain("x passes do");
  expect(w.spawned).toEqual([]);
});

test("a pull answering a spawn hands the step to one hand in the background", async ($, on) => {
  const w = world(on, { run: answering({ pull: { stdout: "spawn\nthe leaf\n\ndo the step" } }) });
  const said = await $.tool.call(PULL);
  expect(w.spawned).toHaveLength(1);
  expect(w.spawned[0]).toMatchObject({ prompt: "do the step", run_in_background: true });
  expect(JSON.stringify(said)).toContain("The hand works in the background");
});
