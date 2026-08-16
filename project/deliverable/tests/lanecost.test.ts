// i11's lane-cost demands, written before the build so each one is watched
// failing. Same shape as bucket.test.ts: drive the real verbs, fail on an
// assertion rather than on an import.
//
// THE MEASURED BASELINE these answer, from one logged day (2026-08-16):
// 2,850 calls, of which BUILDING was 7%. 494 se_test calls produced 66
// verdicts. 81 of 206 pulls broke the one-second rule.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
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
test("an agent-initiated full battery outside verification is refused, and names where it belongs", async () => {
  const root = freshRoot();
  committed(root);
  const server = await bootedServer(root);

  // No arguments IS the battery — engine/tools.ts routes a call with no
  // `files` through runBattery. The walk stands nowhere near verification.
  const answer = (await call(server, "se_test", {})).body as {
    kind?: string;
    expected?: string;
    got?: string;
    remedy?: { note?: string };
  };

  assert.equal(answer.kind, "rejected", `the battery ran outside verification: ${JSON.stringify(answer).slice(0, 300)}`);
  assert.ok(/verification/i.test(JSON.stringify(answer)), `the refusal did not name where the battery belongs: ${JSON.stringify(answer)}`);
});

// req-the-full-battery-runs-where-the-method-says, second clause
//
// THE TWO CLAUSES SHIP TOGETHER — raid-dec-blocking-and-the-battery-refusal-
// ship-together. The refusal alone strands 428 wasted polls. The answer alone
// removes the accidental deterrent that kept the count at five rather than
// fifty, which makes the measured problem worse.
test("a scoped run answers its caller without being asked a second time", async () => {
  const root = freshRoot();
  committed(root);
  const server = await bootedServer(root);

  const answer = (
    await call(server, "se_test", {
      files: ["bucket"],
      question: "does a scoped run answer the caller that asked for it?",
    })
  ).body as { handed_off?: boolean; running?: boolean };

  // THE CLAIM IS THAT IT ANSWERED, not what the answer said. A nested run
  // cannot report counts — node refuses to run tests recursively inside a test
  // file — so asserting on `tests` would be asserting on the fixture. What this
  // requirement demands is that the caller is not sent away to ask again.
  assert.notEqual(answer.handed_off, true, "a scoped run handed back a job id instead of a verdict");
  assert.equal(answer.running, false, `a scoped run did not answer the caller that asked: ${JSON.stringify(answer).slice(0, 300)}`);
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
