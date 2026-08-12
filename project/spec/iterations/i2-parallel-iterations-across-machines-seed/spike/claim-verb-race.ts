// THROWAWAY SPIKE — the claim verb, raced against a LOCAL bare origin.
// The finding promotes; this code does not ship. No push leaves the machine.
//
// Faked: the network and the real forge's receive layer. The pushes are
// issued sequentially, so what is proven is the rejection semantics
// (non-fast-forward on a taken ref), which is order-independent — the
// origin half against the real forge stays owed at M7.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const git = (cwd: string, ...args: string[]): { ok: boolean; out: string } => {
  try {
    return { ok: true, out: execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }) };
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; message: string };
    return { ok: false, out: `${err.stdout ?? ""}${err.stderr ?? ""}` || err.message };
  }
};

const results: string[] = [];
const check = (name: string, pass: boolean, detail: string): void => {
  results.push(`${pass ? "PASS" : "FAIL"} ${name} — ${detail.replace(/\s+/g, " ").slice(0, 180)}`);
  if (!pass) process.exitCode = 1;
};

const lab = mkdtempSync(join(tmpdir(), "claim-spike-"));
git(lab, "init", "--bare", "origin.git");
const origin = join(lab, "origin.git");

// Seed the claims branch so every clone shares one base.
git(lab, "clone", origin, "seed");
const seed = join(lab, "seed");
git(seed, "config", "user.email", "spike@local");
git(seed, "config", "user.name", "machine-seed");
git(seed, "checkout", "-b", "claims");
mkdirSync(join(seed, "claims"), { recursive: true });
writeFileSync(join(seed, "claims", ".keep"), "");
git(seed, "add", "-A");
git(seed, "commit", "-m", "claims branch opens");
git(seed, "push", "origin", "claims");

const clone = (name: string): string => {
  git(lab, "clone", "--branch", "claims", origin, name);
  const dir = join(lab, name);
  git(dir, "config", "user.email", `${name}@local`);
  git(dir, "config", "user.name", name);
  return dir;
};
const a = clone("machine-a");
const b = clone("machine-b");

// THE CLAIM VERB, two acts wearing one name: record (local, always
// possible), then announce (push, needs the remote).
const record = (dir: string, iteration: string, machine: string): void => {
  writeFileSync(join(dir, "claims", `${iteration}.md`), `machine: ${machine}\nat: ${new Date().toISOString()}\n`);
  git(dir, "add", "-A");
  git(dir, "commit", "-m", `claim ${iteration} by ${machine}`);
};
const announce = (dir: string): { ok: boolean; out: string } => git(dir, "push", "origin", "claims");

// 1 — THE RACE. Both record the same iteration, both announce.
record(a, "i-race", "machine-a");
record(b, "i-race", "machine-b");
const pushA = announce(a);
const pushB = announce(b);
check("race: exactly one push lands", pushA.ok !== pushB.ok, `A ok=${pushA.ok}, B ok=${pushB.ok}`);
const loserOut = pushA.ok ? pushB.out : pushA.out;
check("race: the loser rejects non-fast-forward", /fetch first|non-fast-forward|rejected|behind/i.test(loserOut), loserOut);

// 2 — THE LOST RACE RESOLVES. The loser re-fetches and sees the holder.
const winnerDir = pushA.ok ? a : b;
const loserDir = pushA.ok ? b : a;
const winnerName = pushA.ok ? "machine-a" : "machine-b";
git(loserDir, "fetch", "origin", "claims");
git(loserDir, "reset", "--hard", "origin/claims");
const holder = readFileSync(join(loserDir, "claims", "i-race.md"), "utf8");
check("lost race: re-fetch shows the holder", holder.includes(`machine: ${winnerName}`), holder);

// 3 — OFFLINE. The loser records a new claim without the remote; the winner
// claims another iteration and announces; the loser comes online, rebases,
// and its claim lands — add-only files never conflict.
record(loserDir, "i-offline", "offline-machine");
record(winnerDir, "i-other", winnerName);
check("winner's next claim lands", announce(winnerDir).ok, "sequential announce on a fresh ref");
const staleAnnounce = announce(loserDir);
check("offline announce is rejected while behind", !staleAnnounce.ok, staleAnnounce.out);
git(loserDir, "pull", "--rebase", "origin", "claims");
check("offline claim reconciles and lands", announce(loserDir).ok, "rebase then push");

// 4 — THE FORCE RELEASE. A person's second commit records who and why;
// the history keeps who held what.
git(winnerDir, "pull", "--rebase", "origin", "claims");
const claimFile = join(winnerDir, "claims", "i-race.md");
writeFileSync(claimFile, `${readFileSync(claimFile, "utf8")}released_by: the owner\nwhy: judged abandoned\nat: ${new Date().toISOString()}\n`);
git(winnerDir, "add", "-A");
git(winnerDir, "commit", "-m", "force release i-race — the owner: judged abandoned");
check("force release pushes", announce(winnerDir).ok, "release is one more commit");
const log = git(winnerDir, "log", "--oneline", "--", "claims/i-race.md").out;
check("history keeps who held what", log.trim().split("\n").length >= 2, log);

// 5 — THE LEDGER READS WHOLE from a fresh fetch.
git(seed, "pull", "--rebase", "origin", "claims");
const ledger = ["i-race.md", "i-offline.md", "i-other.md"].every((f) => {
  try {
    readFileSync(join(seed, "claims", f), "utf8");
    return true;
  } catch {
    return false;
  }
});
check("ledger: all three claims stand on the origin", ledger, "fresh pull of the claims branch");

process.stdout.write(`claim-verb spike — lab ${lab}\n${results.join("\n")}\n`);
