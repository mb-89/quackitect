// THE COMPACTION RE-OWES THE READING, and until now nothing made it true.
//
// A compaction happens inside the agent's head. The engine is not restarted and
// its session token does not move, so every guard that re-owes the reading on a
// fresh session sleeps through it. The credit stood, the pull served nothing,
// and the reader walked on holding a contract and no method.
//
// The hook is the only party present when it happens and it cannot call the
// lane, so it leaves a marker. These cases are about that marker.
//
// req-compaction-reowes-the-reading
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { markCompacted, takeCompacted } from "../engine/compaction.ts";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { call, freshRoot } from "./helpers.ts";

test("a compaction re-owes the reading inside one live session", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);

  // READING THE READING CREDITS EVERY DOCUMENT IN IT, in one call.
  const first = await call(server, "se_file_read", { path: ".se/reading.md" });
  assert.equal(first.isError, false, JSON.stringify(first.body));
  assert.ok((first.body.credited as string[]).length > 0, "a fresh root owes reading, or this case proves nothing");

  // THE CONTROL, and without it the case below proves only that reading works.
  // The credit stands inside one session: nothing is owed a second time.
  const again = await call(server, "se_file_read", { path: ".se/reading.md" });
  assert.deepEqual(again.body.credited, [], "the credit stands inside one session, or the compaction below proves nothing");

  // NOW THE HOOK'S HALF, exactly as se-hook-start.ts writes it.
  markCompacted(root);
  const pulled = await call(server, "se_pull", {});
  assert.equal(pulled.isError, false, JSON.stringify(pulled.body));

  const afterCompaction = await call(server, "se_file_read", { path: ".se/reading.md" });
  assert.ok(
    (afterCompaction.body.credited as string[]).length > 0,
    "the pull collected the marker and dropped the credit, so the way ahead demands its documents again",
  );
});

test("the marker is collected once and then gone", () => {
  const root = freshRoot();
  markCompacted(root);

  assert.equal(takeCompacted(root), true, "the first take collects it");
  assert.equal(takeCompacted(root), false, "a marker outliving its own consume would re-owe the reading on every pull forever");
});
