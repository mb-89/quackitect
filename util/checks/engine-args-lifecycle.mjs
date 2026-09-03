// THE LIFECYCLE CALLS, DRIVEN AGAINST THE REAL ENGINE.
//
// Seven of the eight ways this extension starts the engine were written as
// literals at the call site, so nothing ever read their flags against the flags
// the engine has. --form against --title is the same kind of mistake as
// --attach or --copies drifting, and the only reason none of these is wrong
// today is that nobody has renamed one yet.
//
// engine-spawns.mjs asserts that every spawn takes its flags from engineargs.
// This asserts that the flags engineargs builds are flags the engine answers.
// Neither one covers the other.
//
//   node .se/scratchpad/engine-args-lifecycle.mjs <root>
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.argv[2] ?? ".";
const here = join(root, "src", "extension");
const out = mkdtempSync(join(tmpdir(), "lifecycle-"));
const { build } = await import(
  pathToFileURL(join(here, "node_modules", "esbuild", "lib", "main.js")).href
);
await build({
  entryPoints: [join(here, "engineargs.ts")],
  bundle: true, format: "esm", outdir: out, logLevel: "silent",
  outExtension: { ".js": ".mjs" },
});
const A = await import(pathToFileURL(join(out, "engineargs.mjs")).href);

const work = mkdtempSync(join(tmpdir(), "lifecycle-work-"));
mkdirSync(join(work, "util", "views"), { recursive: true });
// THE REGISTER IS REDIRECTED, so a check leaves nothing on the machine. The
// init call below registers the folder it makes, and without this it did so
// in the real register: eighty temporary folders were listed there, and the
// tool lane took the first of them as its engine.
const registry = mkdtempSync(join(tmpdir(), "lifecycle-registry-"));
const env = { ...process.env, SE_REGISTRY: registry };
const exe = join(root, ".bin", process.platform === "win32" ? "se.exe" : "se");
if (!existsSync(exe)) {
  console.log("FAIL the engine is not built at " + exe);
  process.exit(1);
}

let bad = 0;
const say = (what, ok, why) => {
  if (!ok) bad++;
  console.log((ok ? "ok   " : "FAIL ") + what + (ok || !why ? "" : "\n      " + why));
};

// The two shapes the engine answers with when the argument list is wrong rather
// than the request.
const malformed = [/flag provided but not defined/, /^se \w+ - /m, /reads nothing but its flags/];

function ask(name, args) {
  const loose = args.findIndex((a) => typeof a !== "string");
  if (loose >= 0) {
    say(name + " sends only strings", false, "argument " + loose + " is " + String(args[loose]));
    return;
  }
  let said = "";
  try {
    said = execFileSync(exe, [...args, "--work", work], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], env });
  } catch (e) {
    said = String(e.stdout ?? "") + String(e.stderr ?? "");
  }
  const wrong = malformed.find((r) => r.test(said));
  say(name + ": se " + args.join(" "), !wrong, said.split("\n").slice(0, 3).join("\n      "));
}

// A CHECK THAT FINDS NOTHING TO CHECK REFUSES. If the builders go, this says so
// rather than passing on an empty list.
const wanted = ["rotateArgs", "projectArgs", "copiesArgs", "attachArgs", "configArgs",
                "initArgs", "startArgs", "setArgs"];
for (const name of wanted) {
  say("engineargs exports " + name, typeof A[name] === "function",
    "it is " + typeof A[name] + ", so nothing below drives it");
}

// A MISSING BUILDER IS REPORTED, NOT THROWN. A stack trace is not a check
// answering, and a reader cannot tell one from a broken check.
if (bad) {
  console.log("\n" + bad + " failed. Nothing below ran, because it has nothing to drive.");
  process.exit(1);
}

ask("rotate", A.rotateArgs());
ask("project", A.projectArgs());
ask("copies", A.copiesArgs(root));
ask("attach", A.attachArgs(root));
ask("config", A.configArgs(root));
// WHAT EACH ACTOR IS DOING, which the panel header draws. It takes no argument
// of its own, so the only thing to drive is that the engine reads the flag.
ask("doing", A.doingArgs());
// The burn down for the work editor bar. today is the engine's own word for it.
ask("burndown", A.burndownArgs());
// --init takes a kind the engine named, so the kind here is one of the engine's.
ask("init", A.initArgs("vehicle"));
// A cell a person edited, or a field the panel set. The token id is one the
// engine will not find, and that is a real answer to a well-formed call.
ask("set", A.setArgs("bucket", "later", root));

// STARTING THE ENGINE SENDS NO FLAG, and a builder that has grown one has
// changed what starting means.
say("start sends no flag of its own", A.startArgs().length === 0,
  "startArgs() answers " + JSON.stringify(A.startArgs()));

console.log("\n" + bad + " failed.");
process.exit(bad ? 1 : 0);
