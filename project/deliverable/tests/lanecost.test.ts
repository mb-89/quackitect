// i11's lane-cost demands, written before the build so each one is watched
// failing. Same shape as bucket.test.ts: drive the real verbs, fail on an
// assertion rather than on an import.
//
// THE MEASURED BASELINE these answer, from one logged day (2026-08-16):
// 2,850 calls, of which BUILDING was 7%. 494 se_test calls produced 66
// verdicts. 81 of 206 pulls broke the one-second rule.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { test } from "node:test";
import { testRecord } from "../engine/discipline.ts";
import { bootedServer, call, freshRoot, gitInit } from "./helpers.ts";

function committed(root: string): void {
  gitInit(root);
  spawnSync("git", ["add", "-A"], { cwd: root, encoding: "utf8" });
  spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "fixture"], {
    cwd: root,
    encoding: "utf8",
  });
}

// req-the-full-battery-runs-where-the-method-says, first clause
//
// M7_50_verification ALREADY SAYS THIS and nothing enforces it: `filled_by:
// engine`, "THE ONE PLACE the full battery runs", and the battery "carries no
// field: it runs mechanically and its verdict records itself".
//
// FIVE RAN ON 2026-08-16 against a designed maximum of two, every one on the
// agent's own judgment. A rule that only asks is what this row replaces.
// THE REFUSAL IS GONE AND THE DEMAND IS NOT (owner ruling 2026-08-16). This
// case asserted that an agent-initiated battery outside verification REFUSES.
// That refusal and its sibling closed on each other — each remedy was the other
// — and no test call was legal at all for four milestones.
//
// WHAT REPLACED IT IS STRONGER. The agent cannot choose the battery because the
// agent cannot choose ANYTHING: there is no scope argument, and `decideScope`
// reads what changed. A choice that cannot be expressed cannot be abused.
test("the agent cannot choose the scope, and the engine says what it chose and why", async () => {
  const root = freshRoot();
  committed(root);
  const server = await bootedServer(root);

  const answer = (await call(server, "se_test", { question: "what does the engine decide here?" })).body as {
    decided?: { scope?: string; why?: string };
    job?: string;
  };

  // THE DECISION RIDES THE ANSWER. Whatever it picked, the caller can say what
  // ran and why without having chosen it.
  const said = JSON.stringify(answer);
  assert.ok(answer.job !== undefined || answer.decided !== undefined, `the call is answered, not refused: ${said.slice(0, 300)}`);

  // AND NO SCOPE ARGUMENT EXISTS TO PASS. Naming one is refused rather than
  // quietly ignored, which is what stops a caller believing it chose.
  const named = (await call(server, "se_test", { files: ["bucket"], question: "can I still pick?" })).body as { kind?: string };
  assert.equal(named.kind, "rejected", `naming a scope refuses: ${JSON.stringify(named).slice(0, 300)}`);
});

// req-the-full-battery-runs-where-the-method-says, second clause
//
// THE TWO CLAUSES SHIP TOGETHER — raid-dec-blocking-and-the-battery-refusal-
// ship-together. The refusal alone strands 428 wasted polls. The answer alone
// removes the accidental deterrent that kept the count at five rather than
// fifty, which makes the measured problem worse.
test("a run short enough to answer answers, rather than sending the caller away", async () => {
  const root = freshRoot();
  committed(root);
  // ONE GREEN BATTERY ON RECORD AND NOTHING CHANGED SINCE, which is the
  // shortest run there is: the engine answers `nothing` and quotes the standing
  // verdict. A genuinely scoped run needs a change mapped to a test file, and
  // staging one tests the fixture rather than the demand.
  testRecord(join(root, ".se"), root, true);
  const server = await bootedServer(root);

  const answer = (
    await call(server, "se_test", {
      question: "does a short run answer the caller that asked for it?",
    })
  ).body as { handed_off?: boolean; ran?: boolean; decided?: { scope?: string } };

  // THE CLAIM IS THAT IT ANSWERED, not what the answer said. What this
  // requirement demands is that the caller is not sent away to ask again.
  assert.notEqual(
    answer.handed_off,
    true,
    `a short run handed back a job id instead of a verdict: ${JSON.stringify(answer).slice(0, 300)}`,
  );
  assert.equal(answer.decided?.scope, "nothing", `and it says what it decided: ${JSON.stringify(answer).slice(0, 300)}`);
});

// req-a-deletion-names-what-points-at-the-node
//
// FOUR TIMES IN ONE ITERATION, and every one found late. i34's deletions each
// orphaned something and a coverage law caught it several states downstream.
//
// THE GRAPH IS NOT ENOUGH ON ITS OWN — raid-asm-the-trace-graph-holds-every-
// reference probed FALSE IN PART. It found the frontmatter orphans and missed
// seventeen prose citations. This case drives the prose half, because that is
// the half a graph-only implementation would silently skip.
test("deleting a node names what points at it, including a mention in prose", async () => {
  const root = freshRoot();
  committed(root);
  const server = await bootedServer(root);

  await call(server, "se_file_write", {
    path: "project/spec/trace/raid/raid-asm-a-throwaway-for-this-case.md",
    base_hash: null,
    content: '---\nid: raid-asm-a-throwaway-for-this-case\ntype: "[[raid]]"\nkind: assumption\n---\n',
  });
  await call(server, "se_file_write", {
    path: "project/spec/trace/raid/raid-asm-the-one-that-points-at-it.md",
    base_hash: null,
    content:
      '---\nid: raid-asm-the-one-that-points-at-it\ntype: "[[raid]]"\nkind: assumption\n---\n\nThis body cites raid-asm-a-throwaway-for-this-case in prose only.\n',
  });

  const doomed = "project/spec/trace/raid/raid-asm-a-throwaway-for-this-case.md";
  const read = (await call(server, "se_file_read", { path: doomed })).body as { hash?: string };
  const answer = (await call(server, "se_file_delete", { path: doomed, base_hash: read.hash })).body as Record<string, unknown>;

  assert.ok(
    JSON.stringify(answer).includes("raid-asm-the-one-that-points-at-it"),
    `the delete did not name the node citing it in prose: ${JSON.stringify(answer).slice(0, 300)}`,
  );
});
