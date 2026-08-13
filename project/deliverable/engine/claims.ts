// THE CLAIM LEDGER — one add-only file per iteration on the claims branch,
// pushed at claim time; the remote's push acceptance is the lock.
//
// Everything here works on REFS through a temporary index, never on the
// working tree: the caller's checkout (a record worktree, trunk) is not
// touched, and no checkout of the claims branch is needed. The two pushes
// this module issues are the sanctioned machinery artifacts; the agent
// lane's push refusal (SE-C-003) stands untouched.
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gitIO } from "./gitlane.ts";

const CLAIMS_REF = "refs/heads/claims";
const ORIGIN_REF = "refs/remotes/origin/claims";

export interface ClaimTaken {
  iteration: string;
  machine: string;
  at: string;
}

export interface ClaimResult {
  ok: boolean;
  offline: boolean;
  taken?: ClaimTaken;
}

export interface AnnounceResult {
  pushed: boolean;
  offline: boolean;
  taken: ClaimTaken[];
}

export interface LedgerRow {
  iteration: string;
  machine: string;
  at: string;
  released_by?: string;
}

/** Mint once, eight hex, machine-local and outside every push. */
export function machineId(dir: string): string {
  mkdirSync(dir, { recursive: true });
  const file = join(dir, "machine-id");
  if (existsSync(file)) return readFileSync(file, "utf8").trim();
  const id = randomBytes(4).toString("hex");
  writeFileSync(file, `${id}\n`, "utf8");
  return id;
}

/** The commit identity is the machine, never a person. */
const identity = (machine: string): Record<string, string> => ({
  GIT_AUTHOR_NAME: `machine-${machine}`,
  GIT_AUTHOR_EMAIL: `${machine}@machines.invalid`,
  GIT_COMMITTER_NAME: `machine-${machine}`,
  GIT_COMMITTER_EMAIL: `${machine}@machines.invalid`,
});

const claimPath = (iteration: string): string => `claims/${iteration}.md`;

const rev = (repo: string, ref: string): string | undefined => {
  const r = gitIO(repo, ["rev-parse", "--verify", "--quiet", ref]);
  return r.ok ? r.stdout : undefined;
};

/** ONLINE MEANS THE REMOTE ANSWERS, never that the branch is already there.
 *  A fetch of a branch nobody has created yet FAILS, and that failure used to
 *  read as offline — so the very first claim recorded locally and never
 *  announced. ls-remote tells the two apart: it exits clean for a remote that
 *  answers, whatever branches it happens to hold, and fails only when the
 *  remote is genuinely out of reach. */
const fetchClaims = (repo: string): boolean => {
  if (gitIO(repo, ["fetch", "origin", "claims"]).ok) return true;
  return gitIO(repo, ["ls-remote", "--heads", "origin"]).ok;
};

const treeHas = (repo: string, ref: string, path: string): boolean => gitIO(repo, ["cat-file", "-e", `${ref}:${path}`]).ok;

const readBlob = (repo: string, ref: string, path: string): string => gitIO(repo, ["show", `${ref}:${path}`]).stdout;

const parseClaim = (iteration: string, body: string): ClaimTaken & { released_by?: string } => {
  const key = (k: string): string | undefined => body.match(new RegExp(`^${k}: (.*)$`, "m"))?.[1]?.trim();
  return {
    iteration,
    machine: key("machine") ?? "",
    at: key("at") ?? "",
    ...(key("released_by") === undefined ? {} : { released_by: key("released_by") }),
  };
};

/** One commit adding (or rewriting) one claim file on top of `base`,
 *  built through a throwaway index so no working tree is involved. */
function buildClaimCommit(repo: string, base: string | undefined, path: string, content: string, message: string, machine: string): string {
  const index = join(tmpdir(), `claims-index-${randomBytes(6).toString("hex")}`);
  const env = { GIT_INDEX_FILE: index };
  try {
    if (base === undefined) gitIO(repo, ["read-tree", "--empty"], { env });
    else gitIO(repo, ["read-tree", base], { env });
    const blob = gitIO(repo, ["hash-object", "-w", "--stdin"], { input: content }).stdout;
    gitIO(repo, ["update-index", "--add", "--cacheinfo", `100644,${blob},${path}`], { env });
    const tree = gitIO(repo, ["write-tree"], { env }).stdout;
    const parent = base === undefined ? [] : ["-p", base];
    const commit = gitIO(repo, ["commit-tree", tree, ...parent, "-m", message], { env: { ...env, ...identity(machine) } }).stdout;
    gitIO(repo, ["update-ref", CLAIMS_REF, commit]);
    return commit;
  } finally {
    rmSync(index, { force: true });
  }
}

/** RECORD — the local half, always possible. Commits onto the local
 *  claims ref, stacking on whatever stands there. */
export function recordClaim(repo: string, iteration: string, machine: string): void {
  const base = rev(repo, CLAIMS_REF) ?? rev(repo, ORIGIN_REF);
  const content = `machine: ${machine}\nat: ${new Date().toISOString()}\n`;
  buildClaimCommit(repo, base, claimPath(iteration), content, `claim ${iteration} by machine-${machine}`, machine);
}

const push = (repo: string): boolean => gitIO(repo, ["push", "origin", `${CLAIMS_REF}:refs/heads/claims`]).ok;

/** The claim files the local ref carries beyond the origin's. */
function pendingPaths(repo: string, originTip: string): string[] {
  const r = gitIO(repo, ["diff", "--name-only", "--diff-filter=AM", originTip, CLAIMS_REF, "--", "claims/"]);
  return r.stdout === "" ? [] : r.stdout.split("\n");
}

/** ANNOUNCE — push the recorded claims; on rejection re-fetch, drop what
 *  the origin already holds (REPORTED, never silent), rebuild the rest on
 *  the new tip and retry. */
export function announceClaims(repo: string): AnnounceResult {
  if (!fetchClaims(repo)) return { pushed: false, offline: true, taken: [] };
  const taken: ClaimTaken[] = [];
  for (let round = 0; round < 5; round++) {
    if (push(repo)) return { pushed: true, offline: false, taken };
    if (!fetchClaims(repo)) return { pushed: false, offline: true, taken };
    const originTip = rev(repo, ORIGIN_REF);
    const oldTip = rev(repo, CLAIMS_REF);
    if (originTip === undefined || oldTip === undefined) return { pushed: false, offline: false, taken };
    const pending = pendingPaths(repo, originTip);
    gitIO(repo, ["update-ref", CLAIMS_REF, originTip]);
    for (const path of pending) {
      const iteration = path.replace(/^claims\//, "").replace(/\.md$/, "");
      const body = readBlob(repo, oldTip, path);
      const mine = parseClaim(iteration, body);
      if (treeHas(repo, originTip, path)) {
        const holder = parseClaim(iteration, readBlob(repo, originTip, path));
        if (holder.machine !== mine.machine) taken.push(holder);
        continue;
      }
      buildClaimCommit(repo, rev(repo, CLAIMS_REF), path, body, `claim ${iteration} by machine-${mine.machine}`, mine.machine);
    }
  }
  return { pushed: false, offline: false, taken };
}

/** CLAIM — record then announce. A taken iteration reports its holder and
 *  pushes nothing. */
export function claimIteration(repo: string, iteration: string, machine: string): ClaimResult {
  const online = fetchClaims(repo);
  const path = claimPath(iteration);
  if (online) {
    const originTip = rev(repo, ORIGIN_REF);
    if (originTip !== undefined) {
      if (treeHas(repo, originTip, path)) {
        const holder = parseClaim(iteration, readBlob(repo, originTip, path));
        // A RELEASED claim is claimable again: the new claim rewrites the file.
        if (holder.released_by === undefined) {
          if (holder.machine !== machine) return { ok: false, offline: false, taken: holder };
          return { ok: true, offline: false };
        }
      }
      const local = rev(repo, CLAIMS_REF);
      if (local === undefined || gitIO(repo, ["merge-base", "--is-ancestor", CLAIMS_REF, originTip]).ok) {
        gitIO(repo, ["update-ref", CLAIMS_REF, originTip]);
      }
    }
  }
  recordClaim(repo, iteration, machine);
  if (!online) return { ok: true, offline: true };
  const announced = announceClaims(repo);
  const lost = announced.taken.find((t) => t.iteration === iteration);
  if (lost !== undefined) return { ok: false, offline: false, taken: lost };
  return { ok: announced.pushed, offline: announced.offline };
}

export interface EntryGate {
  ok: boolean;
  /** A ledger governs this entry. Always true since the pool opens itself —
   *  kept because a caller reads intent from it, not just from `ok`. */
  pool: boolean;
  claimed_now?: boolean;
  offline?: boolean;
  holder?: ClaimTaken;
}

/** THE ENTRY GATE — the record store opens a record only over a standing
 *  claim, and entry is what mints one. This machine's claim admits,
 *  another's refuses naming the holder, and an unclaimed iteration is
 *  claimed in the entry act.
 *
 *  THE POOL OPENS ITSELF. A missing claims branch is not a product without a
 *  pool; it is a pool nobody has opened, and only a claim can open it. This
 *  used to return "no pool" and record nothing, which made the branch
 *  uncreatable: no branch meant no claim, and no claim meant no branch. Every
 *  entry was admitted and none was recorded, which is how a second machine
 *  worked i8 on 2026-08-12 with no claim to show for it. So a missing branch
 *  falls straight through to the claim, which mints it from an empty tree.
 *  Owner ruling 2026-08-13: no product needs an opening act of its own. */
export function claimEntry(repo: string, iteration: string, machine: string): EntryGate {
  fetchClaims(repo);
  const tip = rev(repo, ORIGIN_REF) ?? rev(repo, CLAIMS_REF);
  const path = claimPath(iteration);
  if (tip !== undefined && treeHas(repo, tip, path)) {
    const holder = parseClaim(iteration, readBlob(repo, tip, path));
    if (holder.released_by === undefined) {
      if (holder.machine === machine) return { ok: true, pool: true };
      return { ok: false, pool: true, holder };
    }
  }
  const r = claimIteration(repo, iteration, machine);
  if (r.ok) return { ok: true, pool: true, claimed_now: true, offline: r.offline };
  return { ok: false, pool: true, holder: r.taken };
}

/** RELEASE — a person's second commit on the same file, recording who
 *  forced and why. Needs the remote: a release is never recorded blind. */
export function forceRelease(repo: string, iteration: string, who: string, why: string): { ok: boolean; offline: boolean } {
  const path = claimPath(iteration);
  for (let round = 0; round < 2; round++) {
    if (!fetchClaims(repo)) return { ok: false, offline: true };
    const originTip = rev(repo, ORIGIN_REF);
    if (originTip === undefined || !treeHas(repo, originTip, path)) return { ok: false, offline: false };
    const holder = parseClaim(iteration, readBlob(repo, originTip, path));
    gitIO(repo, ["update-ref", CLAIMS_REF, originTip]);
    const content = `${readBlob(repo, originTip, path)}\nreleased_by: ${who}\nwhy: ${why}\nreleased_at: ${new Date().toISOString()}\n`;
    buildClaimCommit(repo, originTip, path, content, `force release ${iteration} — ${who}: ${why}`, holder.machine);
    if (push(repo)) return { ok: true, offline: false };
  }
  return { ok: false, offline: false };
}

/** SEED PUSH — the other machinery artifact: the iteration's stub branch
 *  reaches the remote in the seeding act, so every peer lists it from its
 *  next fetch. Best-effort: no remote is a recorded seed, never a block. */
export function pushSeed(repo: string, branch: string): { ok: boolean } {
  return { ok: gitIO(repo, ["push", "origin", `refs/heads/${branch}:refs/heads/${branch}`]).ok };
}

export interface ListingRow {
  iteration: string;
  state: "unclaimed" | "claimed" | "released";
  machine?: string;
  at?: string;
  age_ms?: number;
}

/** THE CLAIMABLE LISTING — every seeded iteration with its claim state,
 *  the claiming machine and the claim's age. Seeds are the it/* branches
 *  on the remote, the local ones standing in when the remote is out of
 *  reach; claims come off the ledger. */
export function claimListing(repo: string): ListingRow[] {
  const remote = gitIO(repo, ["ls-remote", "--heads", "origin", "it/*"]).stdout;
  const seeds =
    remote !== ""
      ? remote.split("\n").map((l) => l.replace(/^\S+\s+refs\/heads\/it\//, ""))
      : gitIO(repo, ["branch", "--list", "--format=%(refname:short)", "it/*"])
          .stdout.split("\n")
          .filter((b) => b !== "")
          .map((b) => b.replace(/^it\//, ""));
  const ledger = new Map(claimsLedger(repo).map((r) => [r.iteration, r]));
  return seeds
    .filter((s) => s !== "")
    .map((iteration) => {
      const claim = ledger.get(iteration);
      if (claim === undefined) return { iteration, state: "unclaimed" as const };
      const age = Number.isNaN(Date.parse(claim.at)) ? {} : { age_ms: Date.now() - Date.parse(claim.at) };
      return {
        iteration,
        state: claim.released_by === undefined ? ("claimed" as const) : ("released" as const),
        machine: claim.machine,
        at: claim.at,
        ...age,
      };
    });
}

/** The ledger, read whole from the freshest ref in reach. */
export function claimsLedger(repo: string): LedgerRow[] {
  fetchClaims(repo);
  const ref = rev(repo, ORIGIN_REF) ?? rev(repo, CLAIMS_REF);
  if (ref === undefined) return [];
  const list = gitIO(repo, ["ls-tree", "-r", "--name-only", ref, "claims/"]).stdout;
  if (list === "") return [];
  return list
    .split("\n")
    .filter((p) => p.endsWith(".md"))
    .map((p) => parseClaim(p.replace(/^claims\//, "").replace(/\.md$/, ""), readBlob(repo, ref, p)));
}
