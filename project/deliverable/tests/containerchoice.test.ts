// req-container-offers-its-records: entering an iteration BINDS it, so with
// several open a bare pull was taking the walker's decision without saying so.
//
// What it cost, measured on 2026-08-15: a pull at the container's start walked
// into the first already-started record. Reaching a sibling from inside it drew
// fifteen hops through two unrelated iterations, and the only way out was an
// escape to the front desk — which in an unattended run is a dead stop.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { bootedServer, call, freshRoot, gitInit } from "./helpers.ts";

// A SECOND worktree needs a HEAD that points at something. gitInit leaves the
// default branch unborn, so the first seed succeeds and the second refuses
// with "HEAD points to an invalid (or orphaned) reference".
function committed(root: string): void {
  gitInit(root);
  spawnSync("git", ["add", "-A"], { cwd: root, encoding: "utf8" });
  spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "fixture"], {
    cwd: root,
    encoding: "utf8",
  });
}

async function seed(server: Awaited<ReturnType<typeof bootedServer>>, n: number): Promise<string> {
  const r = await call(server, "se_seed_iteration", {
    goal: `open iteration number ${n}`,
    vision: `seeded so the container can be asked what it does with more than one open iteration`,
  });
  const id = String((r.body as { seeded?: string }).seeded ?? "");
  assert.notEqual(id, "", `the seed answers with its id: ${JSON.stringify(r.body)}`);
  return id;
}

test("a container holding one open iteration walks into it", async () => {
  const root = freshRoot();
  committed(root);
  const server = await bootedServer(root);
  await seed(server, 1);

  const answer = (await call(server, "se_pull", { form: { choice: "iterations" } })).body as {
    pull: string;
    where: string[];
  };
  assert.notEqual(answer.pull, "choose", `one open iteration is not a choice: ${JSON.stringify(answer)}`);
});

test("a container holding two open iterations offers them rather than entering one", async () => {
  const root = freshRoot();
  committed(root);
  const server = await bootedServer(root);
  const first = await seed(server, 1);
  const second = await seed(server, 2);
  assert.notEqual(first, second, "two distinct iterations stand open");

  const answer = (await call(server, "se_pull", { form: { choice: "iterations" } })).body as {
    pull: string;
    options?: { to: string }[];
    where: string[];
  };

  // THE ENGINE HAS NO `choose` INSTRUCTION. The contract names five and the
  // code emits four: an offer rides as `options` on the answer, which is what
  // idle and the front desk already do. The demand is that the walker is
  // ASKED, and this is the shape the asking has.
  const offered = (answer.options ?? []).map((o) => o.to);
  assert.ok(offered.length >= 2, `both iterations are on the offer: ${JSON.stringify(offered)}`);
  // The walk stands at the container's OWN start. Entering a record would put
  // it three segments deep, at iterations/<id>/<state>, and would have bound
  // that record on the way in.
  assert.deepEqual(answer.where, ["iterations/start"], "nothing was entered while the offer stands");
});
