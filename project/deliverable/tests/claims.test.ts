// The claim lane, raced against a LOCAL bare origin per case — nothing
// leaves the machine. Every case is one step of tsp-claim-lane; the
// concurrent race is the register's scheduled origin probe
// (raid-asm-remote-serializes-claims).
import { strict as assert } from "node:assert";
import { execFile } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { hostname, tmpdir, userInfo } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { promisify } from "node:util";
import {
  announceClaims,
  claimEntry,
  claimIsDone,
  claimIteration,
  claimListing,
  claimsLedger,
  completeClaim,
  forceRelease,
  machineId,
  pushSeed,
  recordClaim,
} from "../engine/claims.ts";
import { git } from "../engine/gitlane.ts";

const run = promisify(execFile);

interface Lab {
  origin: string;
  clone: (name: string) => string;
}

const lab = (): Lab => {
  const dir = mkdtempSync(join(tmpdir(), "claims-"));
  git(dir, "init", "--bare", "origin.git");
  const origin = join(dir, "origin.git");
  git(dir, "clone", origin, "seed");
  const seed = join(dir, "seed");
  git(seed, "config", "user.email", "seed@machines.invalid");
  git(seed, "config", "user.name", "seed");
  git(seed, "checkout", "-b", "claims");
  mkdirSync(join(seed, "claims"), { recursive: true });
  writeFileSync(join(seed, "claims", ".keep"), "");
  git(seed, "add", "-A");
  git(seed, "commit", "-m", "claims branch opens");
  git(seed, "push", "origin", "claims");
  return {
    origin,
    clone: (name: string): string => {
      git(dir, "clone", "--branch", "claims", origin, name);
      const c = join(dir, name);
      git(c, "config", "user.email", `${name}@machines.invalid`);
      git(c, "config", "user.name", name);
      return c;
    },
  };
};

const sever = (repo: string, origin: string): void => {
  git(repo, "remote", "set-url", "origin", join(origin, "..", "gone.git"));
};
const restore = (repo: string, origin: string): void => {
  git(repo, "remote", "set-url", "origin", origin);
};

/** A POOL NOBODY HAS OPENED — a bare origin and one clone, with no claims
 *  branch anywhere. This is what a freshly seeded product actually looks
 *  like. `lab` above creates the branch by hand, so every case built on it
 *  starts PAST the interesting moment, and that is exactly why the gate
 *  could answer "no pool" and no test noticed. */
const virgin = (): { dir: string; origin: string; repo: string } => {
  const dir = mkdtempSync(join(tmpdir(), "virgin-"));
  git(dir, "init", "--bare", "origin.git");
  const origin = join(dir, "origin.git");
  git(dir, "clone", origin, "machine");
  const repo = join(dir, "machine");
  git(repo, "config", "user.email", "machine@machines.invalid");
  git(repo, "config", "user.name", "machine");
  return { dir, origin, repo };
};

describe("the claim verb", { concurrency: true }, () => {
  test("a claim is one add-only file naming the machine id and the UTC time, pushed in the same act", () => {
    const l = lab();
    const a = l.clone("machine-a");
    const r = claimIteration(a, "i-one", "aaaa1111");
    assert.equal(r.ok, true);
    assert.equal(r.offline, false);
    const reader = l.clone("reader");
    const row = claimsLedger(reader).find((x) => x.iteration === "i-one");
    assert.ok(row !== undefined, "a fresh clone reads the claim off the origin");
    assert.equal(row.machine, "aaaa1111");
    assert.match(row.at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  test("the race: two concurrent pushes for one claim — exactly one lands, the loser learns the holder", async () => {
    const l = lab();
    const a = l.clone("machine-a");
    const b = l.clone("machine-b");
    recordClaim(a, "i-race", "aaaa1111");
    recordClaim(b, "i-race", "bbbb2222");
    const push = (dir: string): Promise<boolean> =>
      run("git", ["push", "origin", "claims"], { cwd: dir }).then(
        () => true,
        () => false,
      );
    const [pa, pb] = await Promise.all([push(a), push(b)]);
    assert.notEqual(pa, pb, `exactly one push lands (A=${String(pa)} B=${String(pb)})`);
    const loser = pa ? b : a;
    const winner = pa ? "aaaa1111" : "bbbb2222";
    const after = announceClaims(loser);
    assert.equal(after.taken.length, 1, "the lost claim is reported, never dropped silently");
    assert.equal(after.taken[0].iteration, "i-race");
    assert.equal(after.taken[0].machine, winner);
    assert.equal(after.pushed, true, "the loser's branch reconciles onto the origin's tip");
  });

  test("claiming a taken iteration reports the holder without pushing anything", () => {
    const l = lab();
    const a = l.clone("machine-a");
    const b = l.clone("machine-b");
    assert.equal(claimIteration(a, "i-t", "aaaa1111").ok, true);
    const r = claimIteration(b, "i-t", "bbbb2222");
    assert.equal(r.ok, false);
    assert.equal(r.taken?.machine, "aaaa1111");
  });

  test("offline: the claim records locally without blocking, and lands at the next opportunity", () => {
    const l = lab();
    const a = l.clone("machine-a");
    sever(a, l.origin);
    const r = claimIteration(a, "i-off", "aaaa1111");
    assert.equal(r.ok, true);
    assert.equal(r.offline, true, "no network is a recorded claim, never a block");
    restore(a, l.origin);
    const rec = announceClaims(a);
    assert.equal(rec.pushed, true);
    assert.equal(rec.taken.length, 0);
    const reader = l.clone("reader");
    assert.ok(claimsLedger(reader).some((x) => x.iteration === "i-off"));
  });

  test("a reconcile conflict surfaces the holder, never resolves silently", () => {
    const l = lab();
    const a = l.clone("machine-a");
    const b = l.clone("machine-b");
    sever(a, l.origin);
    assert.equal(claimIteration(a, "i-c", "aaaa1111").offline, true);
    assert.equal(claimIteration(b, "i-c", "bbbb2222").ok, true);
    restore(a, l.origin);
    const rec = announceClaims(a);
    assert.equal(rec.taken.length, 1);
    assert.equal(rec.taken[0].machine, "bbbb2222");
  });

  test("a force release is a second recorded commit carrying who and why, and history keeps both", () => {
    const l = lab();
    const a = l.clone("machine-a");
    assert.equal(claimIteration(a, "i-rel", "aaaa1111").ok, true);
    const rel = forceRelease(a, "i-rel", "the owner", "judged abandoned");
    assert.equal(rel.ok, true);
    const reader = l.clone("reader");
    const row = claimsLedger(reader).find((x) => x.iteration === "i-rel");
    assert.equal(row?.released_by, "the owner");
    git(reader, "fetch", "origin", "claims");
    const log = git(reader, "log", "--oneline", "origin/claims", "--", "claims/i-rel.md");
    assert.ok(log.stdout.split("\n").length >= 2, `two commits touch the claim: ${log.stdout}`);
  });

  test("the pushed artifacts carry no personal datum, and nothing beyond the claims ref leaves", () => {
    const l = lab();
    const a = l.clone("machine-a");
    assert.equal(claimIteration(a, "i-g", "aaaa1111").ok, true);
    assert.equal(forceRelease(a, "i-g", "the owner", "guardrail sweep").ok, true);
    const reader = l.clone("reader");
    git(reader, "fetch", "origin", "claims");
    const meta = git(reader, "log", "--format=%an %ae %cn %ce", "origin/claims").stdout.toLowerCase();
    const files = git(reader, "ls-tree", "-r", "--name-only", "origin/claims").stdout.split("\n");
    const blobs = files.map((f) => git(reader, "show", `origin/claims:${f}`).stdout.toLowerCase()).join("\n");
    for (const needle of [hostname().toLowerCase(), userInfo().username.toLowerCase()]) {
      if (needle.length < 3) continue;
      assert.ok(!meta.includes(needle), `a commit identity carries ${needle}`);
      assert.ok(!blobs.includes(needle), `a pushed blob carries ${needle}`);
    }
    assert.match(meta, /machine-aaaa1111 aaaa1111@machines\.invalid/);
    const refs = git(reader, "ls-remote", "--heads", "origin")
      .stdout.split("\n")
      .filter((x) => x !== "");
    assert.equal(refs.length, 1, `only the claims branch leaves the machine: ${refs.join(" · ")}`);
    assert.match(refs[0], /refs\/heads\/claims$/);
  });

  test("a seeded stub reaches the origin, and a peer lists it from its next look", () => {
    const l = lab();
    const a = l.clone("machine-a");
    git(a, "checkout", "-b", "it/i-new");
    writeFileSync(join(a, "stub.md"), "seed\n");
    git(a, "add", "-A");
    git(a, "commit", "-m", "iteration i-new: seed");
    assert.equal(pushSeed(a, "it/i-new").ok, true);
    const b = l.clone("machine-b");
    const row = claimListing(b).find((x) => x.iteration === "i-new");
    assert.ok(row !== undefined, "the peer lists the seed off the remote");
    assert.equal(row.state, "unclaimed");
  });

  test("the listing shows claim state, machine id and age for every seed", () => {
    const l = lab();
    const a = l.clone("machine-a");
    git(a, "checkout", "-b", "it/i-l");
    writeFileSync(join(a, "stub.md"), "seed\n");
    git(a, "add", "-A");
    git(a, "commit", "-m", "seed");
    assert.equal(pushSeed(a, "it/i-l").ok, true);
    assert.equal(claimIteration(a, "i-l", "aaaa1111").ok, true);
    const row = claimListing(a).find((x) => x.iteration === "i-l");
    assert.equal(row?.state, "claimed");
    assert.equal(row?.machine, "aaaa1111");
    assert.ok((row?.age_ms ?? -1) >= 0, "the claim wears its age");
    assert.equal(forceRelease(a, "i-l", "the owner", "test release").ok, true);
    const after = claimListing(a).find((x) => x.iteration === "i-l");
    assert.equal(after?.state, "released");
  });

  test("the entry gate opens the pool itself when no claims branch exists", () => {
    const dir = mkdtempSync(join(tmpdir(), "gate-"));
    git(dir, "init");
    const g = claimEntry(dir, "i-any", "aaaa1111");
    assert.equal(g.ok, true);
    // NO BRANCH IS NOT NO POOL. The gate used to answer pool:false here and
    // record nothing, which made the branch uncreatable: only a claim mints
    // it, and no claim could run. Every entry anywhere was then unclaimed.
    assert.equal(g.pool, true);
    assert.equal(g.claimed_now, true);
    // No remote at all, so the claim lands locally and announces later.
    assert.equal(g.offline, true);
    const row = claimsLedger(dir).find((x) => x.iteration === "i-any");
    assert.ok(row !== undefined, "the ledger stands after the first entry");
    assert.equal(row.machine, "aaaa1111");
  });

  test("a first entry opens the pool on a remote that has no claims branch yet", () => {
    const v = virgin();
    const g = claimEntry(v.repo, "i-first", "aaaa1111");
    assert.equal(g.ok, true);
    assert.equal(g.pool, true);
    assert.equal(g.claimed_now, true);
    // ONLINE, so the claim announces in the same act. A fetch of a branch
    // that does not exist FAILS, and reading that failure as offline was the
    // second half of the bug — the first claim would mint the branch locally
    // and never push it, leaving every peer blind.
    assert.equal(g.offline, false);
    // The proof lives on the ORIGIN, never in the claimant's own repo.
    git(v.dir, "clone", "--branch", "claims", v.origin, "peer");
    const row = claimsLedger(join(v.dir, "peer")).find((x) => x.iteration === "i-first");
    assert.ok(row !== undefined, "a peer cloning the origin reads the first claim");
    assert.equal(row.machine, "aaaa1111");
  });

  test("the entry gate lifecycle: entry claims, a held record refuses with its holder, a release reopens it", () => {
    const l = lab();
    const a = l.clone("machine-a");
    const b = l.clone("machine-b");
    const ga = claimEntry(a, "i-e", "aaaa1111");
    assert.equal(ga.ok, true);
    assert.equal(ga.pool, true);
    assert.equal(ga.claimed_now, true);
    const gb = claimEntry(b, "i-e", "bbbb2222");
    assert.equal(gb.ok, false);
    assert.equal(gb.holder?.machine, "aaaa1111");
    assert.equal(forceRelease(a, "i-e", "the owner", "handover").ok, true);
    const gb2 = claimEntry(b, "i-e", "bbbb2222");
    assert.equal(gb2.ok, true);
    assert.equal(gb2.claimed_now, true);
    const gb3 = claimEntry(b, "i-e", "bbbb2222");
    assert.equal(gb3.ok, true);
    assert.equal(gb3.claimed_now, undefined);
  });

  // A CLAIM WAS TAKEN AT ENTRY AND NOTHING EVER ENDED IT. Both shipped
  // iterations stood in the ledger reading as live holdings on 2026-08-13,
  // so a peer asking what was free could not tell work in progress from work
  // that was over. These four cases pin the word that closes the door.
  test("a shipped iteration is DONE in the ledger, and done is not released", () => {
    const l = lab();
    const a = l.clone("machine-a");
    assert.equal(claimEntry(a, "i-done", "aaaa1111").ok, true);
    assert.equal(claimIsDone(a, "i-done"), false);
    assert.equal(completeClaim(a, "i-done", "aaaa1111").ok, true);
    assert.equal(claimIsDone(a, "i-done"), true);
    // THE LEDGER SAYS IT ON THE ORIGIN, not merely at home: a completion that
    // does not reach a peer leaves that peer free to walk finished work.
    const peer = l.clone("peer");
    const row = claimsLedger(peer).find((x) => x.iteration === "i-done");
    assert.ok(row?.done !== undefined, "the peer reads the completion off the origin");
    assert.equal(row.released_by, undefined, "done is its own word — a completion is not a release");
  });

  test("no second walk of a shipped record, by any machine including the one that shipped it", () => {
    const l = lab();
    const a = l.clone("machine-a");
    const b = l.clone("machine-b");
    claimEntry(a, "i8-x", "aaaa1111");
    completeClaim(a, "i8-x", "aaaa1111");
    // The OWNER'S RULE: there is not going to be another i8.
    const other = claimEntry(b, "i8-x", "bbbb2222");
    assert.equal(other.ok, false);
    assert.equal(other.shipped, true);
    // AND NOT THE SHIPPER EITHER. A holder's own claim admits it back in, so
    // the done check has to stand AHEAD of that branch or the machine that
    // finished the work walks it a second time.
    const again = claimEntry(a, "i8-x", "aaaa1111");
    assert.equal(again.ok, false);
    assert.equal(again.shipped, true);
  });

  test("a release reopens and a completion does not — the two words behave differently", () => {
    const l = lab();
    const a = l.clone("machine-a");
    const b = l.clone("machine-b");
    claimEntry(a, "i-two", "aaaa1111");
    forceRelease(a, "i-two", "the owner", "abandoned");
    assert.equal(claimEntry(b, "i-two", "bbbb2222").ok, true, "released means back in the pool");
    completeClaim(b, "i-two", "bbbb2222");
    assert.equal(claimEntry(b, "i-two", "bbbb2222").ok, false, "done means gone from the pool");
    assert.equal(claimListing(a).find((r) => r.iteration === "i-two")?.state, undefined, "no seed branch, so it is not offered at all");
  });

  test("completing is idempotent, and completing an unclaimed record still records it", () => {
    const l = lab();
    const a = l.clone("machine-a");
    // A record that shipped before the ledger existed has no claim to append
    // to. Skipping it would leave the ledger silent about exactly the records
    // that are finished, so the file is written carrying the stamp.
    assert.equal(completeClaim(a, "i-never-claimed", "aaaa1111").ok, true);
    assert.equal(claimIsDone(a, "i-never-claimed"), true);
    // A resumed walk re-runs its close, so a second call reports rather than
    // stacking another commit.
    const second = completeClaim(a, "i-never-claimed", "aaaa1111");
    assert.equal(second.ok, true);
    assert.equal(second.already, true);
  });

  test("the machine id mints once, eight hex, and stays put", () => {
    const dir = mkdtempSync(join(tmpdir(), "mid-"));
    const id = machineId(dir);
    assert.match(id, /^[0-9a-f]{8}$/);
    assert.equal(machineId(dir), id);
  });
});
