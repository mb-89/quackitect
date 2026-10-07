// The hooks door standing: what the hook posts it, and what it does with the step the door answers.
// [[spec/tickets/level0-tests-move-to-plugin-test]] [[spec/tickets/level0-runs-on-the-door]]

import { expect, mock, test } from "claude-code/testing";
import { DONE, START, STEP, stepping, world } from "./world.ts";

const CALL = { tool: "Bash", input: { command: "ls" } } as never;

test("a call goes to the hook post with its root and fill, and the door's deny answers it", async ($, on) => {
  const w = world(on, { door: stepping({ "tool.call": { answer: { deny: "refused here" } } }) });
  await $.session.start(START);
  const said = await $.tool.call(CALL);
  const post = w.posts.find((one) => one.body.event === "tool.call");
  expect(post).toMatchObject({ path: "hook", body: { root: "/tree", fill: 42, e: { tool: "Bash" } } });
  expect(JSON.stringify(said)).toContain("refused here");
  expect(w.harness).toEqual([]);
});

test("an event the standing file leaves out reaches the harness and posts nothing", async ($, on) => {
  const w = world(on, { events: ["prompt.submit"] });
  await $.tool.call(CALL);
  expect(w.posts).toEqual([]);
  expect(w.harness).toHaveLength(1);
});

test("a prompt the door rewrites goes on to the harness rewritten", async ($, on) => {
  const event = { text: "the rules, then do it" };
  const w = world(on, { door: stepping({ "prompt.submit": { answer: { event } } }) });
  await $.prompt.submit({ text: "do it" } as never);
  expect(w.prompts).toEqual(["the rules, then do it"]);
});

test("the door's blocks and after reach its merge, and the merged value answers", async ($, on) => {
  const w = world(on, {
    door: stepping({
      "tool.call": { after: ["the rules"], blocks: [{ name: "canary", text: "c" }] },
      merge: { result: "merged" },
    }),
  });
  const said = await $.tool.call(CALL);
  const merge = w.posts.find((one) => one.path === "merge");
  expect(merge?.body).toEqual({
    said: { result: "the harness ran it" },
    adds: { blocks: [{ name: "canary", text: "c" }], context: ["the rules"] },
  });
  expect(JSON.stringify(said)).toContain("merged");
});

test("a held call asks back on agent.spoke with the effect's call id, and the second answer stands", async ($, on) => {
  const w = world(on, {
    door: stepping({ "tool.call": { rows: "c1" }, "agent.spoke": { answer: { deny: "held" } } }),
  });
  const said = await $.tool.call(CALL);
  const back = w.posts.find((one) => one.body.event === "agent.spoke");
  expect(back?.body).toMatchObject({ back: true, e: { call: "c1", tool: "Bash" } });
  expect(back?.body.messages).toHaveLength(1);
  expect(JSON.stringify(said)).toContain("held");
});

test("a spawn answer spawns the helper, and its answer goes back to the door", async ($, on) => {
  const spawn = { prompt: "review it", description: "a review" };
  const w = world(on, {
    door: stepping({
      "tool.call": { answer: { spawn, back: { event: "agent.answered", id: "r1" } } },
      "agent.answered": { answer: { result: "reviewed" } },
    }),
  });
  const said = await $.tool.call(CALL);
  expect(w.spawned[0]).toMatchObject(spawn);
  const back = w.posts.find((one) => one.body.event === "agent.answered");
  expect(back?.body.e).toMatchObject({ id: "r1", isError: false, deny: "" });
  expect(JSON.stringify(said)).toContain("reviewed");
});

test("a clear waits for the main turn's completion, runs once there, and the clock runs nothing more", async ($, on) => {
  const clock = mock.clock(on);
  const w = world(on, { door: stepping({ "tool.call": { answer: { clear: { prompt: "go on" } } } }) });
  await $.tool.call(CALL);
  expect(w.commands).toEqual([]);
  await $.turn.complete(DONE);
  await clock.advance(60_000);
  expect(w.commands).toEqual(["clear"]);
  expect(w.prompts).toEqual(["go on"]);
});

test("a clear no turn completion meets runs on the clock", async ($, on) => {
  const clock = mock.clock(on);
  const w = world(on, { door: stepping({ "tool.call": { answer: { clear: { prompt: "go on" } } } }) });
  await $.tool.call(CALL);
  await clock.advance(60_000);
  expect(w.commands).toEqual(["clear"]);
  expect(w.prompts).toEqual(["go on"]);
});

test("a prompt reaches the door with the raw rows, and the harness reads it bare", async ($, on) => {
  const w = world(on);
  await $.prompt.submit({ text: "do it" } as never);
  const post = w.posts.find((one) => one.body.event === "prompt.submit");
  expect(post?.body).toMatchObject({ e: { text: "do it" }, messages: [{ role: "user" }] });
});

test("a step's text reaches the door on turn.said once the step ends", async ($, on) => {
  const w = world(on);
  for await (const _ of $.turn.step(STEP)) {
  }
  const said = w.posts.find((one) => one.body.event === "turn.said");
  expect(said?.body.e).toMatchObject({ turnId: "t1", text: "level0 holds", kinds: { text: 1 } });
});
