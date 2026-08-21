// se-arrive — ARRIVAL A IN ONE COMMAND.
//
// WHO THIS IS FOR: an agent that woke up inside a cloud chat session with a
// checkout and no `se_` tools. Nobody ran the entrypoint and nobody is beside
// it.
//
// `.mcp.json` IS IN GIT NOW, so a cloud clone carries the lane's config and the
// client attaches before this ever runs. What is left for this script is the
// rest of the arrival: the refs, the runtime, the install and the headless
// lane. It still writes the cage for a checkout older than that change.
//
// WHY IT EXISTS AT ALL. The five acts of Arrival A were written as prose in
// guidance/method/cloud-runner.md and performed BY HAND on every cloud run.
// MEASURED on the i35 run: the hand-performed version cost most of
// an hour before the first `se_pull` — a runtime below the pin, an install, a
// shallow clone with no `main`, a cage to place, and finally a hand-written
// JSON-RPC client because the agent had no other way to reach the lane. Every
// one of those is the same on every cloud box, and none of them is judgment.
// So they belong in a script, and the judgment stays with the agent.
//
// THIS DOES NOT REINVENT se-start.ts, and the two are not alternatives.
// se-start is ARRIVAL B: a host ran a command, and it ends by LAUNCHING an
// agent process. Here the agent already exists and is doing the asking, so
// there is nothing to launch — this ends by handing back a lane the caller can
// call. Both share the fetch, the install and the cage; neither drives the other,
// because a step that exits the process is the wrong shape for the one that
// has to report back.
//
//   node deliverable/engine/bin/se-arrive.ts [--root <dir>] [--autonomy tactical]
//
// It is IDEMPOTENT. Run it twice and the second run re-uses the lane that is
// already answering rather than starting a second one.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
if (process.argv.some((a) => a === "--help" || a === "-h" || a === "-?")) {
  process.stdout.write(`se-arrive — Arrival A in one command: fetch, install, cage, lane

  node engine/bin/se-arrive.ts [--root <dir>] [--autonomy <rung>] [--mirror-port <n>]

  --root         the project root — the folder holding deliverable/. Default: cwd.
  --autonomy     which rung the agent works at by itself, BY NAME:
                 blocked, mechanical, operational, tactical, strategic, ideation.
                 Default tactical, which ENTERS every state an iteration has:
                 a gate is the heaviest step in one, and a gate is tactical.
                 IT DOES NOT SIGN THEM. A bless wants a hand strictly ABOVE the
                 gate's weight, so at tactical an unattended walk fills the gate
                 and then stops for the person. A run that must sign its own
                 gates is launched at strategic, and that is the owner's call.
                 The rungs and what each means are machines/scale.md.
  --mirror-port  the lane's HTTP port. Default 7333.
  --help         this text (-h, -?)
`);
  process.exit(0);
}

const ROOT = resolve(argValue("--root") ?? process.cwd());
const PORT = Number(argValue("--mirror-port") ?? process.env.SE_MIRROR_PORT ?? 7333);
// THE RUNG TRAVELS AS A WORD, never as a number.
// The engine resolves it against machines/scale.md, so a caller never has to
// know what range the ladder runs over.
const AUTONOMY = argValue("--autonomy") ?? process.env.SE_AUTONOMY ?? "tactical";

/** Every step says its name and what happened, in se-start's own shape. */
function say(step: string, what: string): void {
  process.stdout.write(`${step}: ${what}\n`);
}
function die(step: string, why: string): never {
  process.stdout.write(`${step}: FAILED — ${why}\n`);
  process.exit(1);
}

// ── refs ────────────────────────────────────────────────────────────────────
// A CLOUD CLONE CARRIES ONE BRANCH, and often a shallow one. Every record that
// cites `ref: main` or `ref: v2` is dead on arrival until both exist as LOCAL
// names: `git show main:...` fails against `origin/main`, because a
// remote-tracking ref is not a revision named `main`.
function refs(): void {
  const fetched = spawnSync("git", ["fetch", "--all", "--prune"], { cwd: ROOT, encoding: "utf8" });
  if (fetched.status !== 0) {
    say(
      "refs",
      `git fetch did not succeed (${(fetched.stderr ?? "").trim().split("\n").pop() ?? "no reason given"}) — ref: searches may not work`,
    );
    return;
  }
  const made: string[] = [];
  for (const branch of ["main", "v2"]) {
    const have = spawnSync("git", ["rev-parse", "--verify", "--quiet", branch], { cwd: ROOT, encoding: "utf8" });
    if (have.status === 0) continue;
    const remote = spawnSync("git", ["rev-parse", "--verify", "--quiet", `origin/${branch}`], { cwd: ROOT, encoding: "utf8" });
    if (remote.status !== 0) continue;
    if (spawnSync("git", ["branch", branch, `origin/${branch}`], { cwd: ROOT, encoding: "utf8" }).status === 0) made.push(branch);
  }
  say("refs", made.length > 0 ? `fetched, and ${made.join(" and ")} now resolve locally` : "fetched; main and v2 already resolve");
}

// ── runtime ─────────────────────────────────────────────────────────────────
// THE PIN IS READ, NEVER COPIED. A runtime below it is reported with the fix
// rather than worked around — editing engines.node to go green turns a loud
// failure into a silent one.
/** A version as [major, minor]. Reads a bare range like ">=22.18.0" and a
 *  process version like "v22.22.2" alike. */
function version(s: string): [number, number] {
  const m = /(\d+)\.(\d+)/.exec(s);
  return m === null ? [Number(/(\d+)/.exec(s)?.[1] ?? "0"), 0] : [Number(m[1]), Number(m[2])];
}

function runtime(): void {
  const pkg = join(ROOT, "deliverable", "package.json");
  if (!existsSync(pkg)) die("runtime", `no package.json at ${pkg} — is --root the folder holding deliverable/?`);
  const declared = (JSON.parse(readFileSync(pkg, "utf8")) as { engines?: { node?: string } }).engines?.node;
  if (declared === undefined) die("runtime", "package.json declares no engines.node");
  // MAJOR AND MINOR BOTH, because the floor now sits INSIDE a major. Node 22
  // gained unflagged TypeScript execution at 22.18; 22.6 does not have it. A
  // major-only comparison would wave 22.6 straight through and the engine
  // would fail on the first spawned script with a syntax error.
  const want = version(declared);
  const have = version(process.version);
  if (have[0] < want[0] || (have[0] === want[0] && have[1] < want[1])) {
    die(
      "runtime",
      `this box runs ${process.version} and the engine declares ${declared}. Install a node that satisfies it and re-run — do NOT edit engines.node.`,
    );
  }
  say("runtime", `${process.version} satisfies ${declared}`);
}

// ── install ─────────────────────────────────────────────────────────────────
function install(): void {
  const deliverable = join(ROOT, "deliverable");
  if (existsSync(join(deliverable, "node_modules", "yaml"))) {
    say("install", "dependencies already present");
    return;
  }
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const r = spawnSync(npm, ["install", "--no-audit", "--no-fund"], { cwd: deliverable, encoding: "utf8" });
  if (r.status !== 0) die("install", (r.stderr ?? "").trim().split("\n").pop() ?? "npm install failed");
  say("install", "dependencies installed");
}

// ── cage ────────────────────────────────────────────────────────────────────
// WRITTEN ONLY WHEN IT WOULD CHANGE SOMETHING. Both files are committed now,
// so on a current checkout they already match the template and this writes
// nothing at all.
//
// WHY THAT MATTERS RATHER THAN BEING TIDINESS. Writing them every session left
// every cloud run starting on a dirty tree, which the host's own stop hook then
// complains about. Worse, a template that ever drifted from the committed file
// would silently revert it on every boot — and the committed .mcp.json is the
// one thing standing between a fresh clone and no lane at all.
//
// IT STILL PLACES A MISSING FILE, because a checkout older than the commit that
// tracked them has neither, and an agent without the cage is not caged.
function cage(): void {
  const from = join(ROOT, "deliverable", "cage");
  const placed: string[] = [];
  const kept: string[] = [];
  for (const [src, dest] of [
    ["mcp.json", join(ROOT, ".mcp.json")],
    ["claude-settings.json", join(ROOT, ".claude", "settings.json")],
  ] as [string, string][]) {
    const source = join(from, src);
    if (!existsSync(source)) die("cage", `no template at ${source}`);
    const want = readFileSync(source, "utf8");
    const name = dest.slice(ROOT.length + 1);
    if (existsSync(dest) && readFileSync(dest, "utf8") === want) {
      kept.push(name);
      continue;
    }
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, want);
    placed.push(name);
  }
  if (placed.length === 0) say("cage", `already in place: ${kept.join(" and ")}`);
  else say("cage", `placed ${placed.join(" and ")}${kept.length === 0 ? "" : `; kept ${kept.join(" and ")}`}`);
}

// ── lane ────────────────────────────────────────────────────────────────────
async function answering(): Promise<boolean> {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/`, { signal: AbortSignal.timeout(2000) });
    return r.ok;
  } catch {
    return false;
  }
}

// HEADLESS IS THE POINT. A stdio lane needs a host holding the pipe, and an
// agent that is already running is not that host — it cannot register an MCP
// server into a session that has already started. `--headless` serves the same
// dispatch over HTTP at /mcp, so the caller attaches to a lane instead of
// being launched by one.
async function lane(): Promise<void> {
  if (await answering()) {
    say("lane", `already answering on ${PORT} — reusing it`);
    return;
  }
  const child = spawn(
    process.execPath,
    [join(HERE, "se-mcp.ts"), "--root", ROOT, "--headless", "--mirror-port", String(PORT), "--autonomy", AUTONOMY],
    {
      cwd: ROOT,
      detached: true,
      stdio: ["ignore", "ignore", "ignore"],
    },
  );
  child.unref();
  const until = Date.now() + 60_000;
  while (Date.now() < until) {
    if (await answering()) {
      say("lane", `up on ${PORT}, autonomy ${AUTONOMY}`);
      return;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  die("lane", `the lane did not answer on ${PORT} within 60s`);
}

// ── client ──────────────────────────────────────────────────────────────────
// THE LAST HAND-BUILT THING, and the one with the least excuse. An arriving
// agent with no `se_` tools still has to make a JSON-RPC call to reach the
// lane, and on the i35 run that meant writing a client from scratch — twice,
// because the first one mangled its own quoting. It is fifteen lines and it is
// the same fifteen lines every time, so it is written here instead.
function client(): string {
  const dir = join(ROOT, ".se");
  mkdirSync(dir, { recursive: true });
  const path = join(dir, "se-call.mjs");
  writeFileSync(
    path,
    `// se-call — one lane call, for an agent attaching over HTTP.
//   node .se/se-call.mjs se_pull
//   node .se/se-call.mjs se_pull '{"form":{"submit":true}}'
// Written by se-arrive.ts. The arguments are ONE json object, quoted once.
const [, , tool, raw] = process.argv;
if (!tool) {
  console.error("usage: node .se/se-call.mjs <tool> ['<json args>']");
  process.exit(2);
}
const body = { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: tool, arguments: JSON.parse(raw ?? "{}") } };
const r = await fetch("http://127.0.0.1:${PORT}/mcp", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});
const j = await r.json();
if (j.error) {
  console.log(JSON.stringify(j.error, null, 1));
  process.exit(1);
}
console.log(j.result?.content?.[0]?.text ?? JSON.stringify(j.result, null, 1));
`,
  );
  say("client", `wrote ${path.slice(ROOT.length + 1)}`);
  return path;
}

// ── the arrival ─────────────────────────────────────────────────────────────
refs();
runtime();
install();
cage();
await lane();
const call = client();

process.stdout.write(`
arrive: the lane is yours. Your first act is the same as everywhere:

    node ${call.slice(ROOT.length + 1)} se_pull

THE CONTRACT BINDS FROM HERE. Everything goes through the lane, every call is
logged, and the machine says what to do next. The opening instruction an
unattended walk is given is deliverable/cage/kickoff.txt.

IF A STEP ANSWERS 'wait', it weighs more than this session's dial (${AUTONOMY}).
Nobody is beside the box to move it, so say which step waits and stop — or
re-run with --autonomy raised, which is the owner's call to make, not yours.
`);
