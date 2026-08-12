// FRESH-EYES DEMO — the claim lane across two machines over a shared bare remote.
// Engine surfaces under observation: itSeed (the seed push), claimEntry (the
// entry gate), claimIteration (the claim verb), claimListing / claimsLedger.
process.env.SE_SELFTEST_SKIP = "1";
process.env.SE_KEEPAWAKE_DISABLE = "1";
process.env.SE_SCRIPT_SKIP = "1";
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { claimEntry, claimIteration, claimListing, claimsLedger, machineId } from "../../deliverable/engine/claims.ts";
import { itSeed } from "../../deliverable/engine/iterations.ts";

const say = (k: string, v: unknown): void => {
  console.log(`\n== ${k}\n${typeof v === "string" ? v : JSON.stringify(v, null, 1)}`);
};

const LAB = String.raw`C:\Users\ichbi\AppData\Local\Temp\claude\c--Users-ichbi-Desktop-ai-quackitect-v3-project\573767c6-e96e-49d4-8e8b-4a691e25a5d3\scratchpad\claimlab`;
rmSync(LAB, { recursive: true, force: true });
mkdirSync(LAB, { recursive: true });

const g = (cwd: string, ...a: string[]): string => {
  const r = spawnSync("git", a, { cwd, encoding: "utf8", windowsHide: true });
  if (r.status !== 0) throw new Error(`git ${a.join(" ")} in ${cwd}: ${r.stderr}`);
  return (r.stdout ?? "").trim();
};

g(LAB, "init", "--bare", "origin.git");
const origin = join(LAB, "origin.git");
g(LAB, "clone", origin, "m1");
const one = join(LAB, "m1");
g(one, "config", "user.email", "one@machines.invalid");
g(one, "config", "user.name", "machine one");
// FINDING RECORDED SEPARATELY: without core.longpaths, itSeed's doubled-id
// record path breaks git on Windows in deep roots ('Filename too long').
g(one, "config", "core.longpaths", "true");
g(one, "checkout", "-b", "main");
mkdirSync(join(one, "project"), { recursive: true });
writeFileSync(join(one, "project", "README.md"), "a scratch product for the claim-lane demonstration\n");
g(one, "add", "-A");
g(one, "commit", "-m", "product root");
g(one, "push", "origin", "HEAD:refs/heads/main");
say("remote heads before seeding", g(one, "ls-remote", "--heads", origin));

// 1. THE SEEDING ACT — engine/iterations.ts itSeed, the shipped one.
const it = itSeed(one, "claim lane demo", "seed here, claim from the second clone, the first clone's listing names the holder");
say("itSeed returned (announced = the stub push reached the remote in the seeding act)", it);
say("remote heads after seeding", g(one, "ls-remote", "--heads", origin));

// 2. THE SECOND MACHINE — its own clone, its own minted id.
g(LAB, "clone", origin, "m2");
const two = join(LAB, "m2");
g(two, "config", "user.email", "two@machines.invalid");
g(two, "config", "user.name", "machine two");
g(two, "config", "core.longpaths", "true");
const midOne = machineId(join(one, ".se"));
const midTwo = machineId(join(two, ".se"));
say("minted machine ids", { one: midOne, two: midTwo });
say("machine-two listing before any claim", claimListing(two));

// 3. The entry gate BEFORE any pool exists: free entry expected, no claim recorded.
say("machine-two claimEntry with no claims branch anywhere", claimEntry(two, it.id, midTwo));

// 4. THE POOL OPENS. No shipped surface creates the claims branch; the test
// lab's ceremony is used (claims branch with a .keep, pushed from machine one).
g(one, "checkout", "-b", "claims");
mkdirSync(join(one, "claims"), { recursive: true });
writeFileSync(join(one, "claims", ".keep"), "");
g(one, "add", "claims");
g(one, "commit", "-m", "claims branch opens");
g(one, "push", "origin", "claims");
g(one, "checkout", "main");

// 5. THE CLAIM — the entry act from machine two claims the unclaimed iteration.
say("machine-two claimEntry with the pool open (the entry act claims)", claimEntry(two, it.id, midTwo));
say("remote heads after the claim", g(two, "ls-remote", "--heads", origin));
say("the claim file on origin/claims", g(two, "show", `origin/claims:claims/${it.id}.md`));

// 6. THE FIRST CLONE'S VIEW.
say("machine-one listing after machine-two's claim", claimListing(one));
say("machine-one claimEntry on the taken iteration", claimEntry(one, it.id, midOne));
say("machine-two claimEntry over its own standing claim", claimEntry(two, it.id, midTwo));
say("machine-one ledger", claimsLedger(one));
say("machine-one direct claimIteration on the taken iteration", claimIteration(one, it.id, midOne));
console.log("\nDONE claimlane");
