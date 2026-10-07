// The cage's plumbing under new: the post the door takes, the verb road, and the cage verb's input and deny. Go holds the rules, and src/modules/hooks/guard_test.go and step_test.go test them. [[spec/tickets/a-down-index-refuses-calls]] [[spec/tickets/level0-hooks-hold-no-rule]]

import assert from "node:assert/strict";
import test from "node:test";
import {
  cageDeny,
  cageInput,
  hookOf,
  postOf,
  verbOf,
} from "../../.claude/skills/level0/hooks/cage.ts";

// [[spec/design_output/model#a-post-and-its-answer]]
test("the post goes to the standing port with its token as a bearer", () => {
  const post = hookOf(
    { port: 7001, token: "t0k" },
    "tool.call",
    { tool: "Bash" },
    "/tree",
    {
      fill: 9,
    },
  );
  assert.equal(post.where, "http://127.0.0.1:7001/hook");
  assert.equal(post.init.headers.authorization, "Bearer t0k");
  assert.deepEqual(JSON.parse(post.init.body), {
    event: "tool.call",
    e: { tool: "Bash" },
    root: "/tree",
    fill: 9,
  });
});

// [[spec/tickets/level0-hooks-hold-no-rule]]
test("a post at another path carries its body as given", () => {
  const post = postOf({ port: 7001, token: "t0k" }, "merge", { said: 1, adds: {} });
  assert.equal(post.where, "http://127.0.0.1:7001/merge");
  assert.deepEqual(JSON.parse(post.init.body), { said: 1, adds: {} });
});

// [[spec/tickets/level0-hooks-hold-no-rule]]
test("a verb runs the root's binary over its scripts, with the suffix a Windows root takes", () => {
  assert.deepEqual(verbOf("/m", "cage"), [
    "/m/.se/.runtime/bin/se-index",
    "verb",
    "/m/src/scripts",
    "cage",
  ]);
  assert.match(verbOf("C:/m", "cage")[0], /se-index\.exe$/);
});

// [[spec/tickets/level0-hooks-hold-no-rule]]
test("the cage verb reads the event and the call, and its deny line answers", () => {
  assert.deepEqual(JSON.parse(cageInput("tool.call", { tool: "Write" })), {
    event: "tool.call",
    e: { tool: "Write" },
  });
  assert.deepEqual(cageDeny('{"deny":"no"}\n'), { deny: "no" });
  assert.equal(cageDeny(""), null, "a verb printing nothing passes the call");
  assert.equal(cageDeny("not json"), null);
  assert.equal(cageDeny('{"other":1}'), null);
});
