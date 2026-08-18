// ONE COMMAND FROM A CLONED REPOSITORY TO A WALKING AGENT.
//
//   node project/deliverable/engine/bin/se-start.ts --repo <url> --iteration <id>
//
// SEVEN STEPS, AND EACH EXITS NON-ZERO NAMING ITSELF. Every failure of the
// first cloud run presented as "the server is not there", which points at the
// wrong step in six of the seven cases. The step name IS the diagnosis.
//
// THE ROOT IS WHERE THIS FILE LIVES, and there is no flag to say otherwise.
// A `--root` flag stood here and was honoured by three steps while two ignored
// it, so `--root <fresh dir>` cloned there and then started the lane on the
// entrypoint's own tree. Found at i28's verification. One tree, derived, is
// the fix — a flag that is right for some steps is worse than no flag.
//
// SO THE HOST CLONES AND THEN RUNS THIS. It already must: this file is IN the
// repository, so nothing can invoke it before a clone exists. `--repo` is
// therefore CHECKED against origin rather than used to clone. That catches the
// real failure, which is a machine walking the wrong checkout.
import { spawn, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DELIVERABLE = resolve(HERE, "..", "..");
const ROOT = resolve(DELIVERABLE, "..", "..");

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

/** A step's failure is one line naming the step. Nothing else prints. */
function die(step: string, why: string): never {
  process.stderr.write(`${step}: ${why}\n`);
  process.exit(1);
}

/** NOT A STEP FAILURE, so it does not wear a step's name. A caller who forgot
 *  an argument was told `verify:` and went looking at the runtime. Exit 2
 *  separates "you called it wrong" from "a step failed". */
function usage(why: string): never {
  process.stderr.write(`${why}\nusage: se-start.ts --repo <url> --iteration <id> [--mirror-port <n>] [--agent <cmd>]\n`);
  process.exit(2);
}

const say = (step: string, what: string): void => {
  process.stdout.write(`${step}: ${what}\n`);
};

// ── verify ──────────────────────────────────────────────────────────────────
// THE PIN LIVES IN package.json AND IS READ, NEVER COPIED. A second copy here
// would drift the first time somebody bumped one of them.
//
// IT COMPARES AGAINST A PIN, NOT A FLOOR WE CANNOT PROVE. The declaration said
// >=22.6 while the engine spawns `node <file>.ts` with no flag, so a host on
// 22.x satisfied the check and then died inside a spawned script.
function verify(repo: string): void {
  const pkg = join(DELIVERABLE, "package.json");
  if (!existsSync(pkg)) die("verify", `no package.json at ${pkg}`);
  const declared = (JSON.parse(readFileSync(pkg, "utf8")) as { engines?: { node?: string } }).engines?.node;
  if (declared === undefined) die("verify", "package.json declares no engines.node, so there is nothing to check against");
  // MAJOR AND MINOR BOTH. The floor now sits INSIDE a major — unflagged
  // TypeScript execution landed in Node 22 at 22.18 — so a major-only compare
  // would accept 22.6 and die in the first spawned script, which is exactly
  // the failure the comment above records.
  const ver = (s: string): [number, number] => {
    const m = /(\d+)\.(\d+)/.exec(s);
    return m === null ? [Number(/(\d+)/.exec(s)?.[1] ?? "0"), 0] : [Number(m[1]), Number(m[2])];
  };
  const want = ver(declared);
  const have = ver(process.version);
  if (have[0] < want[0] || (have[0] === want[0] && have[1] < want[1])) {
    die("verify", `this engine needs node ${declared} and found ${process.version}`);
  }
  // THE CHECKOUT IS THE ONE THE CALLER MEANT. A machine walking the wrong
  // repository looks healthy the whole way and ships to the wrong place.
  const origin = spawnSync("git", ["remote", "get-url", "origin"], { cwd: ROOT, encoding: "utf8" });
  if (origin.status !== 0) die("verify", `no git origin at ${ROOT}, so this is not a clone of ${repo}`);
  const url = origin.stdout.trim();
  if (!sameRepo(url, repo)) die("verify", `this checkout is ${url} and the run asked for ${repo}`);
  say("verify", `node ${process.version} meets ${declared}, origin is ${url}`);
}

/** Two addresses for one repository. ssh and https spellings differ, and a
 *  trailing `.git` is optional, so compare the part that identifies it. */
function sameRepo(a: string, b: string): boolean {
  const bare = (s: string): string =>
    s
      .trim()
      .replace(/\.git$/, "")
      .replace(/^git@([^:]+):/, "$1/")
      .replace(/^[a-z+]+:\/\//, "")
      .replace(/\/+$/, "")
      .toLowerCase();
  return bare(a) === bare(b);
}

// ── install ─────────────────────────────────────────────────────────────────
// IT INSTALLS THE PROJECT AND NOTHING ELSE. The first cloud run installed
// python3, make and g++, none of which was needed.
function install(): void {
  const r = spawnSync("npm", ["install", "--no-audit", "--no-fund"], {
    cwd: DELIVERABLE,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  if (r.status !== 0)
    die("install", (r.stderr || r.error?.message || "npm install failed").trim().split("\n").pop() ?? "npm install failed");
  say("install", "dependencies present");
}

// ── start ───────────────────────────────────────────────────────────────────
// THE LANE STARTS AND THIS COMMAND RETURNS. Four steps run after this one, and
// none of them runs if start blocks.
//
// MEASURED TWICE, AND THE FIRST MEASUREMENT WAS WRONG. i28 recorded a caller
// held for 45,600 ms and built a platform split on it. At verification the
// same shape was re-timed against the PARENT PROCESS rather than the lane
// runner that launched it: 74 ms, with a child sleeping 20 s. The first run
// timed the harness, which waits on the child it inherited. See
// exp-does-a-backgrounded-lane-release-its-caller, which carries both numbers.
//
// SO THE CALLER IS RELEASED ON BOTH PLATFORMS. The detach below is NOT for
// that. On POSIX it puts the lane in its own process group so a closing
// session does not take it down. Windows has no process group to ask for, and
// `detached` there opens a console instead — which an unattended host has
// nobody to see. Whether a POSIX host reaps the lane anyway is still owed, on
// a machine this one cannot make.
/** THE OPTIONS ARE EXPORTED SO THE TEST BINDS TO THEM. The release test used
 *  to re-declare this shape as a string literal, which meant changing the real
 *  spawn left it green. Found at i28's verification. */
export const LANE_SPAWN = {
  detached: process.platform !== "win32",
  stdio: "ignore",
} as const;

function start(port: number): number {
  const lane = join(HERE, "se-mcp.ts");
  if (!existsSync(lane)) die("start", `no lane at ${lane}`);
  const child = spawn(process.execPath, [lane, "--root", ROOT, "--headless", "--mirror-port", String(port)], {
    ...LANE_SPAWN,
    cwd: DELIVERABLE,
    env: { ...process.env, SE_PANEL_SUPPRESS: "1" },
  });
  if (child.pid === undefined) die("start", "the lane process did not spawn");
  child.unref();
  say("start", `lane spawned as pid ${child.pid}`);
  return child.pid;
}

// ── wait ────────────────────────────────────────────────────────────────────
// IT WAITS FOR THE HEALTH CHECK RATHER THAN RACING IT. A fixed sleep is a race
// with a friendly face.
async function wait(port: number, seconds = 60): Promise<void> {
  const until = Date.now() + seconds * 1000;
  for (;;) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(2000) });
      if (r.ok) {
        say("wait", `lane answering on ${port}`);
        return;
      }
    } catch {
      // not up yet — the loop is the wait
    }
    if (Date.now() > until) die("wait", `the lane did not answer on port ${port} within ${seconds}s`);
    await new Promise((r) => setTimeout(r, 500));
  }
}

// ── fetch ───────────────────────────────────────────────────────────────────
// IT BRINGS THE REFS AND THEN PROVES THE ONE IT CAME FOR IS THERE. A fetch
// that succeeds against a repository missing the iteration is a green light
// into a failure four steps later.
//
// THE PROOF IS THE FOLDER ON TRUNK, NOT A BRANCH (i6). This asked git for
// `refs/remotes/origin/it/<id>` and died without it. i34 made a record a
// FOLDER on trunk: the seed mints no branch, pushes nothing, and there is
// nothing for a peer to claim. So the branch a cloud start demanded stopped
// being created the day the seed stopped creating it, and every one still on
// the remote is a leftover — twenty-six of them, which can go once nothing
// reads them.
//
// WHAT IS ACTUALLY BEING ASKED: does this clone hold the record the run was
// sent for? A folder with a record.md in it answers that, and it answers it
// after the fetch has brought trunk up to date.
/** THE PATH THAT IS THE ITERATION, and "" when this clone does not hold it.
 *  Split out from the step so the question can be asked without a process
 *  exiting — `die` is the right ending for a step and the wrong one for a
 *  check somebody wants to drive. */
export function recordOnTrunk(root: string, iteration: string): string {
  const rel = `project/spec/iterations/${iteration}/record.md`;
  return existsSync(join(root, rel)) ? rel : "";
}

function fetchRefs(iteration: string): void {
  const r = spawnSync("git", ["fetch", "--all", "--prune"], { cwd: ROOT, encoding: "utf8" });
  if (r.status !== 0) die("fetch", (r.stderr || "git fetch failed").trim().split("\n").pop() ?? "git fetch failed");
  if (recordOnTrunk(ROOT, iteration) === "") {
    die(
      "fetch",
      `refs are up to date and this repository has no project/spec/iterations/${iteration}/record.md — a record is a folder on trunk, so that path IS the iteration`,
    );
  }
  say("fetch", `refs up to date, ${iteration} stands on trunk`);
}

// ── adopt: DELETED (i34) ────────────────────────────────────────────────────
// A cloned host used to CLAIM its iteration here, so two machines could not
// walk one record. The claim system is retired: a record is a folder on trunk,
// a clone that has trunk has every record, and one agent works one clone.
//
// WHAT REPLACED THE GUARD is an assumption rather than a lock —
// raid-asm-only-one-agent-works-a-clone-at-a-time, with its own trigger.

// ── launch ──────────────────────────────────────────────────────────────────
// IT STARTS THE AGENT. It stood here checking two files existed and printing
// "ready", which produced no walking agent at all — the one thing
// req-one-command-starts-an-unattended-machine demands, graded fatal. Found at
// i28's verification.
//
// THE CAGE RIDES THE COMMAND LINE. An agent without it is not caged, and that
// is the one thing this step must never do quietly.
function launch(iteration: string, agent: string, pid: number): void {
  const cage = join(ROOT, "project", "deliverable", "cage", "claude-settings.json");
  if (!existsSync(cage)) die("launch", `no cage template at ${cage}`);
  // THE AGENT MUST NOT HAVE TO WORK OUT WHERE IT IS. Nobody is beside it, so
  // the card written for exactly this situation is handed over by path.
  const card = join(ROOT, "project", "guidance", "method", "cloud-runner.md");
  if (!existsSync(card)) die("launch", `no cloud-runner guidance at ${card} — an unattended agent would start with nothing`);

  // THE CAGE IS PLACED, not assumed. A fresh clone carries the template and
  // not the host's settings file, so an agent started here would run uncaged.
  const settings = join(ROOT, "project", ".claude", "settings.json");
  if (!existsSync(settings)) {
    mkdirSync(dirname(settings), { recursive: true });
    copyFileSync(cage, settings);
    say("launch", `cage placed at ${settings}`);
  }

  const probe = spawnSync(agent, ["--version"], { encoding: "utf8", shell: process.platform === "win32" });
  if (probe.status !== 0) die("launch", `no agent named ${agent} on this machine — pass --agent <cmd> for the one that is`);

  const child = spawn(agent, [briefing(iteration, card, pid)], {
    ...LANE_SPAWN,
    cwd: join(ROOT, "project"),
    shell: process.platform === "win32",
  });
  if (child.pid === undefined) die("launch", `${agent} did not spawn`);
  child.unref();
  say("launch", `${agent} walking ${iteration} as pid ${child.pid}, caged by ${settings}`);
}

/** WHAT THE AGENT IS TOLD, and it is told rather than left to discover. An
 *  unattended machine has nobody to ask, so this is the briefing: where it is,
 *  what to read, and what to do first. */
function briefing(iteration: string, card: string, pid: number): string {
  return [
    "YOU ARE AN AGENT ON A CLOUD MACHINE. Nobody is watching this run.",
    "",
    `  iteration : ${iteration}`,
    `  lane pid  : ${pid}`,
    `  read this : ${card}`,
    "",
    "READ THAT CARD FIRST. It says what is different about running unattended.",
    "",
    "YOUR FIRST ACT AFTER IT IS se_pull WITH NO PAYLOAD. Everything follows from what it answers.",
    "",
    "THE SEVEN STEPS ALREADY RAN. Do not repeat them, and do not build a second entrypoint.",
  ].join("\n");
}

async function main(): Promise<void> {
  const repo = arg("--repo");
  const iteration = arg("--iteration");
  const port = Number(arg("--mirror-port") ?? 7333);
  const agent = arg("--agent") ?? "claude";
  if (repo === undefined || iteration === undefined) usage("--repo and --iteration are both required");
  verify(repo);
  install();
  const pid = start(port);
  await wait(port);
  fetchRefs(iteration);
  launch(iteration, agent, pid);
  process.stdout.write(`started: lane pid ${pid}, iteration ${iteration}, agent ${agent}\n`);
}

// RUN ONLY WHEN INVOKED, so a test may import the parts above without
// standing up a lane as a side effect of the import.
if (process.argv[1] !== undefined && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  await main();
}
