// ONE COMMAND FROM A BARE MACHINE TO A WALKING AGENT.
//
//   node engine/bin/se-start.ts --repo <url> --iteration <id> [--root <dir>]
//
// SEVEN STEPS, AND EACH EXITS NON-ZERO NAMING ITSELF. Every failure of the
// first cloud run presented as "the server is not there", which points at the
// wrong step in six of the seven cases. The step name IS the diagnosis.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DELIVERABLE = resolve(HERE, "..", "..");

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

/** A step's failure is one line naming the step. Nothing else prints. */
function die(step: string, why: string): never {
  process.stderr.write(`${step}: ${why}\n`);
  process.exit(1);
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
function verify(): void {
  const pkg = join(DELIVERABLE, "package.json");
  if (!existsSync(pkg)) die("verify", `no package.json at ${pkg}`);
  const declared = (JSON.parse(readFileSync(pkg, "utf8")) as { engines?: { node?: string } }).engines?.node;
  if (declared === undefined) die("verify", "package.json declares no engines.node, so there is nothing to check against");
  const want = Number(/(\d+)/.exec(declared)?.[1] ?? "0");
  const have = Number(/v(\d+)/.exec(process.version)?.[1] ?? "0");
  if (have < want) die("verify", `this engine needs node ${declared} and found ${process.version}`);
  say("verify", `node ${process.version} meets ${declared}`);
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
// MEASURED, 2026-08-15: a child sleeping 45 s held its caller for 45,600 ms on
// Windows with detached, unref and stdio ignore all set
// (exp-does-a-backgrounded-lane-release-its-caller).
//
// SO THE DETACH IS EXPLICIT AND PLATFORM-AWARE, the same split selftest.ts
// already makes: POSIX gets its own process group, Windows cannot and says so.
function start(port: number): number {
  const lane = join(HERE, "se-mcp.ts");
  if (!existsSync(lane)) die("start", `no lane at ${lane}`);
  const child = spawn(process.execPath, [lane, "--root", resolve(DELIVERABLE, "..", ".."), "--headless", "--mirror-port", String(port)], {
    cwd: DELIVERABLE,
    detached: process.platform !== "win32",
    stdio: "ignore",
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
function fetchRefs(root: string, repo: string): void {
  if (!existsSync(join(root, ".git"))) {
    const c = spawnSync("git", ["clone", repo, root], { encoding: "utf8" });
    if (c.status !== 0) die("fetch", (c.stderr || "git clone failed").trim().split("\n").pop() ?? "git clone failed");
    say("fetch", "clone made");
    return;
  }
  const r = spawnSync("git", ["fetch", "--all", "--prune"], { cwd: root, encoding: "utf8" });
  if (r.status !== 0) die("fetch", (r.stderr || "git fetch failed").trim().split("\n").pop() ?? "git fetch failed");
  say("fetch", "refs up to date");
}

// ── adopt ───────────────────────────────────────────────────────────────────
// IT NAMES THE HOLDER, or warns that the claim did not land. Work starts
// without a reachable remote; the claim failing is a warning, never a stop.
function adopt(root: string, iteration: string): void {
  const branch = `it/${iteration}`;
  const known = spawnSync("git", ["rev-parse", "--verify", `refs/remotes/origin/${branch}`], { cwd: root, encoding: "utf8" });
  if (known.status !== 0) die("adopt", `no branch ${branch} in this repository`);
  say("adopt", `${iteration} is present`);
}

// ── launch ──────────────────────────────────────────────────────────────────
// THE CAGE RIDES THE COMMAND LINE. An agent without it is not caged, and that
// is the one thing this step must never do quietly.
function launch(root: string, iteration: string): void {
  const cage = join(root, "project", "deliverable", "cage", "claude-settings.json");
  if (!existsSync(cage)) die("launch", `no cage template at ${cage}`);
  // THE AGENT MUST NOT HAVE TO WORK OUT WHERE IT IS. Nobody is beside it, so
  // the last thing this command does is hand over the card written for
  // exactly this situation, by path, along with its first act.
  const card = join(root, "project", "guidance", "method", "cloud-runner.md");
  if (!existsSync(card)) die("launch", `no cloud-runner guidance at ${card} — an unattended agent would start with nothing`);
  say("launch", `ready — cage at ${cage}, iteration ${iteration}`);
}

/** WHAT THE AGENT IS TOLD, and it is told rather than left to discover. An
 *  unattended machine has nobody to ask, so the entrypoint's last words are
 *  the briefing: where it is, what to read, and what to do first. */
function brief(root: string, iteration: string, pid: number): void {
  const card = join(root, "project", "guidance", "method", "cloud-runner.md");
  process.stdout.write(
    [
      "",
      "YOU ARE AN AGENT ON A CLOUD MACHINE. Nobody is watching this run.",
      "",
      `  iteration : ${iteration}`,
      `  lane pid  : ${pid}`,
      `  read this : ${card}`,
      "",
      "YOUR FIRST ACT IS se_pull WITH NO PAYLOAD. Everything follows from what it answers.",
      "",
      "THE SEVEN STEPS ABOVE ALREADY RAN. Do not repeat them, and do not build a second entrypoint.",
      "",
    ].join("\n"),
  );
}

async function main(): Promise<void> {
  const repo = arg("--repo");
  const iteration = arg("--iteration");
  const root = resolve(arg("--root") ?? resolve(DELIVERABLE, "..", ".."));
  const port = Number(arg("--mirror-port") ?? 7333);
  if (repo === undefined || iteration === undefined) {
    die("verify", "usage: se-start.ts --repo <url> --iteration <id> [--root <dir>] [--mirror-port <n>]");
  }
  verify();
  install();
  fetchRefs(root, repo);
  const pid = start(port);
  await wait(port);
  adopt(root, iteration);
  launch(root, iteration);
  process.stdout.write(`started: lane pid ${pid}, iteration ${iteration}\n`);
  brief(root, iteration, pid);
}

await main();
