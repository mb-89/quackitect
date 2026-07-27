// Seeding is a FUNCTION (owner design 2026-07-27): a seed mints the
// record and its worktree, and the iteration stands VISIBLE in the
// iterations container as its KICKOFF from that moment. The needs-retro
// gate holds only the FIRST start of a never-walked iteration.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { generateIterations, itSeed } from "../engine/iterations.ts";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { call, freshRoot, readHashesFor } from "./helpers.ts";

function gitInit(root: string): void {
  for (const a of [["init"], ["config", "user.email", "se@test.local"], ["config", "user.name", "se test"], ["add", "-A"], ["commit", "-q", "-m", "seed"]]) {
    const r = spawnSync("git", a, { cwd: root, encoding: "utf8", windowsHide: true });
    if (r.status !== 0) throw new Error(`git ${a.join(" ")} failed: ${r.stderr}`);
  }
}

test("a seed stands in the container at once — kickoff only, gate armed", () => {
  const root = freshRoot();
  gitInit(root);
  const it = itSeed(root, "first visible iteration", "the container shows it as a kickoff", ["e13"]);
  assert.match(it.id, /^i1-/);
  const rec = readFileSync(join(it.path, "product", "spec", "iterations", it.id, "record.md"), "utf8");
  assert.match(rec, /^status: seeded$/m);
  assert.match(rec, /^vision: /m);
  assert.match(rec, /- "e13"/);
  const gen = generateIterations(root);
  const kick = gen.decl.states.find((s) => s.id === "i1")!;
  assert.equal(kick.statement, "first visible iteration");
  assert.deepEqual(kick.entry, { no_pending_note: ["needs retro"] });
  assert.equal(gen.expByState["i1"], it.id);
  // Not a git repo → an empty container that runs start to end.
  const empty = generateIterations(freshRoot());
  assert.deepEqual(empty.decl.states.find((s) => s.id === "start")!.edges, [{ to: "end", role: "normal" }]);
});

test("the seed refuses a missing vision — the seed is a small form", () => {
  const root = freshRoot();
  gitInit(root);
  assert.throws(() => itSeed(root, "goal only", "  "), (e) => (e as { clause?: string }).clause === "SE-C-046");
});

test("needs-retro holds the FIRST start; draining opens it; a started iteration never blocks", async () => {
  const root = freshRoot();
  gitInit(root);
  const session = new Session(root);
  const server = buildServer(root, session);
  const hashes = readHashesFor(root);
  for (let i = 0; i < 8; i++) {
    const step = await call(server, "se_tick", { advance: true, read_hashes: hashes });
    if (step.body.booted === true) break;
  }
  session.setAutonomy(1); // the kickoff weighs 0.6 — lift the slider clear
  const seeded = session.iterationSeed("prove the gate", "the first start waits on the retro");
  const sid = String(seeded.seeded).match(/^(i\d+)-/)![1];
  await call(server, "se_note", { text: "needs retro — iteration wrapped" });
  await call(server, "se_tick", { to: "iterations", read_hashes: hashes });
  const refused = await call(server, "se_tick", { to: sid, read_hashes: hashes });
  assert.equal(refused.isError, true);
  assert.equal(refused.body.clause, "SE-C-112");
  assert.match(JSON.stringify(refused.body), /needs retro/);
  // Escape out, drain at the retro, come back — the first start opens.
  await call(server, "se_tick", { escape: "gated by needs-retro", read_hashes: hashes });
  const { contentHash } = await import("../engine/hash.ts");
  const method = "product/guidance/method/retro.md";
  const withMethod = { ...hashes, [method]: contentHash(readFileSync(join(root, ...method.split("/")))) };
  await call(server, "se_tick", { to: "retro", read_hashes: hashes });
  await call(server, "se_tick", { to: "drain", read_hashes: withMethod });
  const pending = (await call(server, "se_tick", {})).body; // position read; the note ref rides the notes file
  void pending;
  const notesRaw = readFileSync(join(root, ".se", "notes.jsonl"), "utf8");
  const ref = JSON.parse(notesRaw.trim().split("\n").filter((l) => l.includes("needs retro"))[0]).ref as string;
  await call(server, "se_note_drain", { ref, disposition: "done", where: "retro ran" });
  await call(server, "se_tick", { to: "end", read_hashes: withMethod });
  await call(server, "se_tick", { advance: true, read_hashes: hashes });
  await call(server, "se_tick", { to: "iterations", read_hashes: hashes });
  const open = await call(server, "se_tick", { to: sid, read_hashes: hashes });
  assert.equal(open.isError, false, JSON.stringify(open.body));
  // Entering bound the worktree and stamped `started:` — from now on a
  // fresh needs-retro note gates only NEW iterations, never this one.
  const rec = readFileSync(join(root, ".worktrees", String(seeded.seeded), "product", "spec", "iterations", String(seeded.seeded), "record.md"), "utf8");
  assert.match(rec, /^started: /m);
  assert.match(rec, /^status: open$/m);
});
