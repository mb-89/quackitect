// A DIAGNOSIS OF THIS BOX, MEASURED.
//
// An agent on a lane-less cloud box read the lane's source and explained a
// failure the source no longer had, and a fix was built on that reading. A
// reading is not a measurement: the file an agent reads may not be the program
// that ran, and on a cold clone it usually is not. So this asks the box what
// is there and writes it down, and the answer travels in the agent's reply.
//
// WHAT IT ASKS. Where the box is, off util/cage/hosts.json. The commit against
// origin, asked of origin now. The built programs against their source. The
// engine's own answer to a ping. The lane's log under .se/lane.out, whose last
// line is where the stub got to. The cage files, and whether a placeholder was
// left in one. The network, for the hosts a build needs.
//
// IT CHANGES NOTHING BUT THE FILE IT WRITES, under .se/scratchpad, which the
// write gate leaves open. ./RUNME.sh --diagnose is the same call through the
// engine, for a shell the gate stands in front of.
//
//   node util/cage/diagnose.mjs [--method <root>] [--work <root>]
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { homedir, release } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { theHost } from "./host.mjs";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const method = resolve(flag("--method", join(dirname(fileURLToPath(import.meta.url)), "..", "..")));
const work = resolve(flag("--work", method));
const windows = process.platform === "win32";
const exe = (name) => name + (windows ? ".exe" : "");

const lines = [];
const out = (s = "") => lines.push(s);
const head = (s) => {
  out();
  out("## " + s);
  out();
};
const first = (s) => (s ?? "").split(/\r?\n/)[0];
const tail = (path, n) => {
  try {
    return readFileSync(path, "utf8").trimEnd().split(/\r?\n/).slice(-n).join("\n");
  } catch {
    return "";
  }
};

// ran runs one program with a bound, and answers what it said or why it did not.
function ran(cmd, argv, opts = {}) {
  const r = spawnSync(cmd, argv, {
    encoding: "utf8", timeout: opts.timeout ?? 8000, cwd: opts.cwd ?? work, windowsHide: true,
  });
  if (r.error) {
    return { ok: false, text: r.error.code === "ENOENT" ? "not on PATH" : r.error.message };
  }
  return { ok: r.status === 0, status: r.status, text: ((r.stdout ?? "") + (r.stderr ?? "")).trim() };
}

// reached asks one host whether it answers at all, with a bound.
async function reached(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "manual", signal: AbortSignal.timeout(6000) });
    return "HTTP " + res.status;
  } catch (e) {
    return e.cause?.code ?? e.name;
  }
}

const stamp = new Date().toISOString();
out("# Diagnosis of this box");
out();
out("Written " + stamp + " by util/cage/diagnose.mjs.");

head("Where this is");
const host = theHost();
out("- host: " + host.says + " (" + host.because + ")");
out("- platform: " + process.platform + " " + release() + ", node " + process.version);
out("- method root: " + method);
out("- work root: " + work);
for (const v of ["CLAUDE_PROJECT_DIR", "CLAUDE_CODE_REMOTE", "GITHUB_ACTIONS", "SE_CLOUD", "MCP_TIMEOUT", "GOTOOLCHAIN"]) {
  out("- " + v + ": " + (process.env[v] ?? "unset"));
}

head("Tools on PATH");
for (const [name, argv] of [
  ["git", ["--version"]], ["go", ["version"]], ["zig", ["version"]], ["cc", ["--version"]],
  ["gcc", ["--version"]], ["sh", ["-c", "echo sh answers"]], ["tar", ["--version"]],
]) {
  out("- " + name + ": " + first(ran(name, argv).text));
}

head("Git");
const branch = first(ran("git", ["rev-parse", "--abbrev-ref", "HEAD"]).text);
const headSha = first(ran("git", ["rev-parse", "HEAD"]).text);
out("- branch: " + branch);
out("- HEAD: " + first(ran("git", ["log", "-1", "--format=%h %ci %s"]).text));
const dirty = ran("git", ["status", "--porcelain"]).text.split(/\r?\n/).filter(Boolean);
out("- working tree: " + (dirty.length ? dirty.length + " changed path(s)" : "clean"));
// ORIGIN IS ASKED NOW, AND NOTHING IS FETCHED. ls-remote reads and moves no
// ref, so the diagnosis is about the box as it is.
let standing = "unknown against origin";
const remote = ran("git", ["ls-remote", "origin", "refs/heads/" + branch], { timeout: 20000 });
if (remote.ok && remote.text) {
  const sha = remote.text.split(/\s/)[0];
  out("- origin/" + branch + ", asked now: " + sha.slice(0, 7));
  if (sha === headSha) {
    standing = "at the tip of origin/" + branch;
  } else if (!ran("git", ["cat-file", "-e", sha]).ok) {
    standing = "behind origin/" + branch + ": its tip " + sha.slice(0, 7) + " is not in this clone";
  } else if (ran("git", ["merge-base", "--is-ancestor", sha, "HEAD"]).ok) {
    standing = "ahead of origin/" + branch;
  } else {
    standing = "behind or diverged from origin/" + branch + ", and this clone carries its tip";
  }
} else {
  out("- origin could not be asked: " + first(remote.text));
}
out("- so this clone is " + standing);

head("Built programs under .bin");
const bin = join(method, ".bin");
let newest = 0;
let newestName = "";
const walk = (dir) => {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const e of entries) {
    const p = join(dir, e);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (e !== "node_modules") walk(p);
    } else if (st.mtimeMs > newest) {
      newest = st.mtimeMs;
      newestName = relative(method, p);
    }
  }
};
for (const dir of ["src/engine", "src/mcp", "util/setup"]) walk(join(method, dir));
let built = false;
let stale = false;
for (const name of ["se", "se-mcp", "se-mcp.lane", "logview"]) {
  const p = join(bin, exe(name));
  if (!existsSync(p)) {
    out("- " + exe(name) + ": missing");
    continue;
  }
  const st = statSync(p);
  const older = st.mtimeMs < newest;
  if (name === "se") {
    built = true;
    stale = older;
  }
  out("- " + exe(name) + ": " + st.size + " bytes, built " + st.mtime.toISOString() +
    (older ? ", OLDER than " + newestName : ""));
}
out("- .se/runme.json: " + (existsSync(join(work, ".se", "runme.json"))
  ? "present, so RUNME can run" : "missing, so RUNME refuses until the installer seeds it"));

head("The engine");
const engineJSON = join(work, ".se", "engine.json");
out("- .se/engine.json: " + (existsSync(engineJSON)
  ? readFileSync(engineJSON, "utf8").replace(/\s+/g, " ").slice(0, 220) : "missing"));
let engineUp = false;
const se = join(bin, exe("se"));
if (existsSync(se)) {
  const r = ran(se, ["--ping", "--work", work, "--method", method]);
  engineUp = r.ok;
  out("- se --ping: " + (r.ok ? first(r.text) : "no answer: " + first(r.text)));
} else {
  out("- se --ping: no engine to ask");
}
const door = join(work, ".claude", "settings.local.json");
if (existsSync(door)) {
  const m = /"url":\s*"([^"]+)"/.exec(readFileSync(door, "utf8"));
  out("- hook door in .claude/settings.local.json: " + (m ? m[1] : "no url in it"));
  if (m) {
    try {
      const res = await fetch(m[1], { method: "POST", body: "{}", signal: AbortSignal.timeout(3000) });
      out("- the door answers: HTTP " + res.status);
    } catch (e) {
      out("- the door does not answer: " + (e.cause?.code ?? e.name));
    }
  }
} else {
  out("- .claude/settings.local.json: missing, so no per-call event reaches an engine");
}
out("- .se/engine.out, last lines:");
out("```");
out(tail(join(work, ".se", "engine.out"), 25) || "(empty or missing)");
out("```");

head("The tool lane");
const mcp = join(work, ".mcp.json");
const mcpText = existsSync(mcp) ? readFileSync(mcp, "utf8") : "";
out("- .mcp.json: " + (mcpText === "" ? "missing" : mcpText.includes("{{")
  ? "PRESENT BUT HOLDS AN UNEXPANDED {{placeholder}}, so the harness spawns a program that does not exist"
  : "present"));
out("- .se/lane.out, last lines, which is what the stub said while the harness listened:");
out("```");
out(tail(join(work, ".se", "lane.out"), 40) || "(never written: the stub did not run here, or ran before it kept a log)");
out("```");

head("The cage");
for (const f of [".claude/settings.json", ".claude/hooks/session-start.sh", ".claude/output-styles/quackitect.md",
  ".github/copilot-instructions.md", ".copilot/mcp-config.json"]) {
  const p = join(work, f);
  if (!existsSync(p)) {
    out("- " + f + ": missing");
    continue;
  }
  const t = readFileSync(p, "utf8");
  out("- " + f + ": " + t.length + " bytes" + (t.includes("{{") ? ", HOLDS AN UNEXPANDED {{placeholder}}" : "") +
    (/Source:\s*(-->|$)/m.test(t) ? ", PROJECTED FROM NO SOURCE" : ""));
}

head("The register");
const registry = join((process.env.SE_REGISTRY ?? "").split(/[;:]/)[0] || join(homedir(), ".se"), "registry.json");
try {
  const entries = JSON.parse(readFileSync(registry, "utf8"));
  out("- " + registry + ": " + entries.length + " entries, this copy " +
    (entries.some((e) => resolve(e.method_root ?? "") === method) ? "among them" : "not among them"));
} catch {
  out("- " + registry + ": missing");
}

head("Network");
// THE HOSTS A BUILD HERE ACTUALLY REACHES FOR, and ziglang.org is the one that
// decides whether a cloud box can build at all. A cloud environment allows
// package registries and GitHub by default, and the manifest pins its C
// compiler to an archive on neither list. The installer falls back to this
// machine's own cc when the fetch fails, so this row says which of the two
// happened rather than leaving a build to explain itself.
for (const url of ["https://proxy.golang.org/", "https://go.dev/dl/", "https://ziglang.org/",
  "https://github.com/", "https://registry.npmjs.org/"]) {
  out("- " + url + ": " + await reached(url));
}
{
  const probe = ran("cc", ["--version"]);
  out("- this machine's own cc: " + (probe.ok ? first(probe.text)
    : "not usable (" + first(probe.text) + "), so a blocked ziglang.org means no engine"));
}

head("What this says");
out("- " + (host.cloud ? "a cloud box" : "a desk") + ", " + standing);
out("- built programs: " + (!built ? "none, so nothing here has been built"
  : stale ? "present, and the engine is older than its source, so what runs is not what the tree says"
    : "present and newer than their source"));
out("- engine: " + (engineUp ? "running and answering" : "not answering"));
out("- lane log: " + (existsSync(join(work, ".se", "lane.out")) ? "above, and its last line is where the stub got to" : "none"));
if (mcpText.includes("{{")) out("- DEFECT: .mcp.json carries a placeholder, and no lane can start from it");

const text = lines.join("\n") + "\n";
const dir = join(work, ".se", "scratchpad");
mkdirSync(dir, { recursive: true });
const file = join(dir, "diagnosis-" + stamp.replace(/[:.]/g, "-").slice(0, 19) + ".md");
writeFileSync(file, text);
process.stdout.write(text);
process.stderr.write("quackitect: the diagnosis is at " + relative(work, file) + "\n");
