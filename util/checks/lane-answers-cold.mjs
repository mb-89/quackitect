// THE DOOR ANSWERS ON A COLD CLONE, BEFORE ANYTHING IS BUILT.
//
// A cloud session cloned this tree and had no tool lane for the whole session,
// twice. The first time the stub built the engine before it answered the
// harness's handshake, and the harness gave up on it. The second time the stub
// was the rewrite that answers the handshake at once, and the session still
// had no lane, and nothing on this side could say why: every machine that ran
// the battery had .bin built already, so no check had ever run the cold path.
//
// SO THIS RUNS IT. The tracked tree is copied to a folder with no .bin, the
// installer is replaced by one that fails at once, go is taken off PATH, and
// the stub is spoken to the way the harness speaks to it. What has to hold:
// the handshake is answered, the tool list is answered and is the snapshot, a
// call is answered rather than held, and once the build has failed a call is
// refused with a door in it. Nothing here waits on a clock: the bound is how
// long a failure is given to show, and a stub that answers at all answers in
// a small fraction of it.
//
//   node util/checks/lane-answers-cold.mjs <root>
import { execFileSync, spawn } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join, resolve } from "node:path";
import { createInterface } from "node:readline";

const root = resolve(process.argv[2] ?? ".");

let bad = 0;
const say = (what, ok, why) => {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok || !why ? "" : "\n         " + why));
};

// THE TREE AS GIT CARRIES IT, with what is written and not yet added, and
// nothing git ignores. That is what a clone gets, and .bin and .se stay behind.
const tree = mkdtempSync(join(tmpdir(), "lane-cold-"));
const listed = execFileSync("git", ["-C", root, "ls-files", "-z", "--cached", "--others", "--exclude-standard"],
  { encoding: "utf8" }).split("\0").filter(Boolean);
for (const rel of listed) {
  const from = join(root, rel);
  if (!existsSync(from)) continue;
  const to = join(tree, rel);
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
}
say("the tree was copied cold, " + listed.length + " paths", listed.length > 0 && !existsSync(join(tree, ".bin")),
  ".bin came along, so this is not the tree a clone gets");

// THE INSTALLER FAILS AT ONCE, so the build is a thing that has happened
// rather than one this waits for. AND go IS OFF PATH, the way a cloud box
// begins, so the stub's own build of the lane fails the same way.
writeFileSync(join(tree, "util", "setup", "install.sh"), "#!/bin/sh\nexit 1\n");
writeFileSync(join(tree, "util", "setup", "install.ps1"), "exit 1\n");
const path = (process.env.PATH ?? "").split(delimiter)
  .filter((d) => !existsSync(join(d, "go")) && !existsSync(join(d, "go.exe"))).join(delimiter);

const snapshot = JSON.parse(readFileSync(join(root, "util", "cage", "tools.json"), "utf8")).tools.map((t) => t.name);

const stub = spawn("node", ["util/cage/mcp-lane.mjs", "--method", ".", "--work", "."], {
  cwd: tree, env: { ...process.env, PATH: path, Path: path }, stdio: ["pipe", "pipe", "pipe"], windowsHide: true,
});
const waiters = new Map();
const said = [];
createInterface({ input: stub.stdout }).on("line", (line) => {
  let m;
  try {
    m = JSON.parse(line);
  } catch {
    return;
  }
  if (m.id !== undefined && waiters.has(m.id)) waiters.get(m.id)(m);
});
createInterface({ input: stub.stderr }).on("line", (line) => said.push(line));

const bound = 15000;
const within = (p, what) => Promise.race([p, new Promise((_, no) =>
  setTimeout(() => no(new Error(what + " was not answered within the bound")), bound))]);
const ask = (id, method, params) => within(new Promise((yes) => {
  waiters.set(id, yes);
  stub.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
}), method);
const until = (holds, what) => within(new Promise((yes) => {
  const t = setInterval(() => {
    if (holds()) {
      clearInterval(t);
      yes();
    }
  }, 50);
}), what);
const textOf = (m) => m.result?.content?.[0]?.text ?? "";

try {
  const init = await ask(1, "initialize", {
    protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "lane-answers-cold", version: "0" },
  });
  say("initialize is answered cold", !!init.result?.serverInfo, JSON.stringify(init).slice(0, 200));

  const list = await ask(2, "tools/list", {});
  const names = (list.result?.tools ?? []).map((t) => t.name);
  say("tools/list is answered cold, and it is the snapshot", JSON.stringify(names) === JSON.stringify(snapshot),
    "it answered " + JSON.stringify(names));

  const call = await ask(3, "tools/call", { name: "se_status", arguments: {} });
  say("a call before the lane is up is answered rather than held", textOf(call).length > 0,
    JSON.stringify(call).slice(0, 200));
  say("and the answer says the engine is being built", /BUILT/.test(textOf(call)), textOf(call).slice(0, 160));

  // AND se_start IS ANSWERED HERE, because it is the tool an agent reaches for
  // when nothing works, and answering it "still building" would be this door
  // refusing the one question it exists to answer.
  const start = await ask(5, "tools/call", { name: "se_start", arguments: {} });
  let startSaid = null;
  try {
    startSaid = JSON.parse(textOf(start));
  } catch { /* the case below says so */ }
  say("se_start is answered cold, in its own shape",
    startSaid !== null && startSaid.running === false, textOf(start).slice(0, 200));
  say("and it says a build is under way rather than refusing", startSaid?.building === true,
    "it says building=" + JSON.stringify(startSaid?.building));
  say("and it says the session is not being guarded meanwhile",
    /guarding/.test(startSaid?.says ?? ""), (startSaid?.says ?? "").slice(0, 160));

  await until(() => said.some((l) => /left no tool lane|would not start/.test(l)),
    "the stub's own word that the build left no lane");
  const after = await ask(4, "tools/call", { name: "se_status", arguments: {} });
  say("after a failed build a call is refused, with a door in it",
    /NO TOOL LANE/.test(textOf(after)) && /RUNME|diagnose/.test(textOf(after)), textOf(after).slice(0, 200));

  const log = join(tree, ".se", "lane.out");
  say("the stub kept its log at .se/lane.out",
    existsSync(log) && readFileSync(log, "utf8").includes("nothing is built here yet"),
    existsSync(log) ? "it does not say what a cold start says" : "no such file");
} catch (e) {
  say(e.message, false, "the stub said:\n         " + said.join("\n         "));
}

stub.kill();
try {
  rmSync(tree, { recursive: true, force: true });
} catch {
  // a folder Windows still holds is the temp folder's to sweep
}
console.log("\n" + bad + " failed.");
process.exit(bad ? 1 : 0);
