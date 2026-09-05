// ARE FUNCTION HOOKS HERE, AND WOULD THEY LOAD?
//
// Claude Code has an unshipped hook type: a TypeScript module whose functions
// wrap the harness itself, rather than a shell command it starts. The runtime
// is in the build behind a flag, and the proposal says the response decides
// whether it ships. If it does, the cage stops being a table of events and
// becomes a plugin, and the tools this project offers could be registered in
// the harness's own process with no server to spawn and no cold window at all.
//
// THIS PROBES AND DEPENDS ON NOTHING. Nothing in this tree loads a function
// hook, and nothing here fails if the answer is no. It exists so the question
// is asked by running something rather than by remembering what was true when
// somebody last read a page: the flag, the version floor and the two commands
// that only appear when both are satisfied.
//
// WHAT AN ANSWER MEANS. Yes is permission to try, on a branch, with the cage as
// it is left alone. No is the answer that costs nothing.
//
//   node util/cage/funchooks-probe.mjs
import { spawnSync } from "node:child_process";

const flag = "CLAUDE_CODE_ENABLE_FUNCTION_HOOKS";
// THE FLOOR THE RUNTIME FIRST APPEARED IN. Below it the flag sets nothing,
// because the code it turns on is not in the build.
const floor = [2, 1, 260];

const ran = (args, env) => {
  // ONE STRING WHERE A SHELL IS NEEDED. claude is a .cmd on Windows, so it is
  // reached through a shell, and passing an argument list to a shell is what
  // node warns about. There is one argument here and it is a literal.
  const shell = process.platform === "win32";
  const r = spawnSync(shell ? ["claude", ...args].join(" ") : "claude", shell ? [] : args, {
    encoding: "utf8", timeout: 60000, windowsHide: true, shell,
    env: { ...process.env, ...env },
  });
  if (r.error) return { ok: false, text: r.error.code === "ENOENT" ? "claude is not on PATH" : r.error.message };
  return { ok: r.status === 0, text: ((r.stdout ?? "") + (r.stderr ?? "")).trim() };
};

const said = [];
const out = (s) => said.push(s);

const version = ran(["--version"]);
const number = /(\d+)\.(\d+)\.(\d+)/.exec(version.text);
out("harness: " + (version.ok ? version.text.split("\n")[0] : "could not be asked, " + version.text));

let newEnough = false;
if (number) {
  const here = number.slice(1, 4).map(Number);
  newEnough = here[0] > floor[0]
    || (here[0] === floor[0] && (here[1] > floor[1] || (here[1] === floor[1] && here[2] >= floor[2])));
  out("version floor: needs " + floor.join(".") + ", this is " + here.join(".")
    + (newEnough ? ", which carries the runtime" : ", which is below it, so the flag turns nothing on"));
} else {
  out("version floor: the version could not be read, so whether the runtime is here is unknown");
}

out("flag: " + flag + " is " + (process.env[flag] ? "set to " + process.env[flag] : "not set in this shell"));

// THE TWO COMMANDS THAT ONLY EXIST WHEN BOTH HOLD. Asking the build is the
// answer; reading a page is somebody's memory of it.
if (newEnough) {
  // WHAT THE FLAG TURNS ON IS NOT ON THE COMMAND LINE. The commands it adds are
  // typed inside a session, so --help says nothing about them either way, and a
  // probe reading it would answer no on a build that has them. The version and
  // the flag are what can be asked from out here, and this says only those.
  out("");
  out("VERDICT: the runtime is in this build. Turning the flag on is what tries it.");
  out("Nothing in this tree loads a function hook, so the answer changes nothing until somebody writes one.");
} else {
  out("");
  out("VERDICT: not available here. Upgrade the harness past " + floor.join(".") + " and set " + flag + "=1 to try.");
}

out("");
out("In a cloud environment both go in the environment variables, one per line:");
out("  " + flag + "=1");

console.log(said.join("\n"));
