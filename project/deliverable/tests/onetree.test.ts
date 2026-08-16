// i34's new demands, written before the build so each one is watched failing.
//
// Three requirements, three cases. The fourth new requirement of the iteration
// —— req-every-record-path-resolves-in-one-tree —— is verified by INSPECTION and
// has no case here on purpose: it demands the ABSENCE of a tree-chooser, and a
// test can only show one path resolving, never that nothing anywhere chooses.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { itList } from "../engine/iterations.ts";
import { itCloseShipped } from "../engine/worktree.ts";
import { bootedServer, call, freshRoot, gitInit } from "./helpers.ts";

// A second worktree needs a HEAD that points at something, so the fixture
// commits once before any seed. Copied from containerchoice.test.ts, which
// found this the hard way: without it the first seed succeeds and the second
// refuses with "HEAD points to an invalid (or orphaned) reference".
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
    vision: `seeded so i34's demands can be driven against a real container`,
  });
  const id = String((r.body as { seeded?: string }).seeded ?? "");
  assert.notEqual(id, "", `the seed answers with its id: ${JSON.stringify(r.body)}`);
  return id;
}

// req-a-pull-carrying-no-choice-enters-no-iteration
//
// The container's own guidance already promises this: "with several open the
// pull OFFERS them rather than entering one for you." The offer path keeps it.
// THE RECOVERY PATH DOES NOT, and that is what this case drives: a bare pull,
// carrying no form at all, which is what a dropped connection produces.
//
// Observed five times on 2026-08-16. Each one entered iterations/i4, the first
// alternative on the list. Entering BINDS the record and stamps it started, so
// a freshly seeded stub would have been started by a connection failure with
// nobody choosing it and nothing recording that nobody did.
test("a bare pull at the container enters no iteration", async () => {
  const root = freshRoot();
  committed(root);
  const server = await bootedServer(root);
  const first = await seed(server, 1);
  const second = await seed(server, 2);
  assert.notEqual(first, second, "two distinct iterations stand open");

  // Reach the container the legitimate way, through a choice.
  const entered = (await call(server, "se_pull", { form: { choice: "iterations" } })).body as { where: string[] };
  assert.deepEqual(entered.where, ["iterations/select"], "the choice lands on the selection state");

  // NOW THE RECOVERY PULL. No form, no choice, nothing to say which door.
  const bare = (await call(server, "se_pull", {})).body as {
    pull: string;
    where: string[];
    options?: { to: string }[];
  };

  // THE DEMAND IS THAT NO ITERATION WAS ENTERED, which is what the node says
  // breaks: "a dropped connection binds a record nobody chose and stamps it
  // started". Standing on the selection state and leaving the container are
  // both fine; being three segments deep inside a record is not.
  const inside = bare.where.filter((w) => /^iterations\/i\d+\//.test(w));
  assert.deepEqual(inside, [], `a pull carrying no choice entered an iteration: ${JSON.stringify(bare.where)}`);

  // AND NOTHING WAS BOUND OR STAMPED. Entering is what writes `started:`, so
  // its absence is the mechanical proof that no record was taken up.
  for (const rec of itList(root)) {
    const abs = join(rec.path, `project/spec/iterations/${rec.id}/record.md`);
    if (!existsSync(abs)) continue;
    assert.doesNotMatch(readFileSync(abs, "utf8"), /^started: /m, `${rec.id} was stamped started by a choiceless pull`);
  }
});

// req-a-records-own-status-decides-whether-it-is-open
//
// Six sites decide "is this open" today and every one asks the filesystem
// whether a directory exists. The record's own status field is ignored.
//
// The proof it is already broken, observed 2026-08-16: i28 carried
// `status: shipped` and a `closed:` stamp while its worktree still stood. The
// survey left it out; the container kept it in. Two readers, one record,
// opposite answers, and nothing said they disagreed.
test("a record stamped shipped leaves the container, whatever stands on disk", async () => {
  const root = freshRoot();
  committed(root);
  const server = await bootedServer(root);
  const shipped = await seed(server, 1);
  await seed(server, 2);

  // Stamp it shipped WHERE THE RECORD ACTUALLY IS, and leave every directory
  // exactly as it stands. The demand is that the status decides, not the disk.
  const rec = itList(root).find((i) => i.id === shipped);
  assert.ok(rec !== undefined, `the seeded record is listed: ${shipped}`);
  const recAbs = join(rec.path, `project/spec/iterations/${shipped}/record.md`);
  assert.ok(existsSync(recAbs), `the record file stands at ${recAbs}`);
  const raw = readFileSync(recAbs, "utf8");
  assert.match(raw, /^status: /m, "the record carries a status field to stamp");
  writeFileSync(recAbs, raw.replace(/^status: .*$/m, "status: shipped"), "utf8");
  assert.ok(existsSync(rec.path), "the directory is deliberately left in place");

  // THE OFFER CARRIES THE SHORT ID, never the seeded one. `generateIterations`
  // keys every node by `itShortId`, so an option reads `iterations/i1` while
  // the seed answered `i1-open-iteration-number-1`.
  //
  // Asserting against the seeded id passed on the first run and proved nothing:
  // the string it looked for could not have been in the list under ANY
  // behaviour. A check that cannot fail is worse than no check, because it
  // reports coverage it does not have.
  const short = shipped.match(/^(i\d+)-/)?.[1] ?? shipped;
  assert.notEqual(short, shipped, "the short id really is shorter — the fixture ids carry the i<N>- prefix");

  const answer = (await call(server, "se_pull", { form: { choice: "iterations" } })).body as {
    options?: { to: string }[];
  };
  const offered = (answer.options ?? []).map((o) => o.to);
  assert.ok(offered.length > 0, `the container offers something at all: ${JSON.stringify(offered)}`);
  assert.ok(!offered.includes(`iterations/${short}`), `a shipped record is off the container's offer: ${JSON.stringify(offered)}`);
});

// req-a-closed-records-folder-stays-on-trunk
//
// `mergeAndRetire` runs `git rm -r` on the record directory as it closes,
// under the ruling that closed records live in git and the tree carries only
// live work. i34 reverses that ruling: the folder stays, and every path that
// read a closed record out of git —— `git show <branch>:<rel>`, the batched
// cat-file, and the whole manifest idea —— stops being needed.
test("a closed record's folder stays in the working tree", async () => {
  const root = freshRoot();
  committed(root);
  const server = await bootedServer(root);
  const id = await seed(server, 1);

  const rec = itList(root).find((i) => i.id === id);
  assert.ok(rec !== undefined, `the seeded record is listed: ${id}`);
  itCloseShipped(root, { id: rec.id, branch: rec.branch, path: rec.path });

  const dirRel = `project/spec/iterations/${id}`;
  assert.ok(existsSync(join(root, dirRel)), `the closed record's folder stands on trunk at ${dirRel}`);
  assert.ok(existsSync(join(root, dirRel, "record.md")), "the record itself is readable from the tree, with no git retrieval path");
});
