// THE LIGHT FOLLOWS THE ENGINE, IN BOTH DIRECTIONS.
//
// The poll began with a line that returned unless the state was already good,
// so the light could go from good to bad and never back. An engine started
// from a terminal left the button red for the rest of the window's life, with
// a fresh heartbeat on disk one directory away.
//
//   node .se/scratchpad/liveness.mjs <root>
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.argv[2] ?? ".";
const here = join(root, "src", "extension");
const out = mkdtempSync(join(tmpdir(), "liveness-"));
const { build } = await import(
  pathToFileURL(join(here, "node_modules", "esbuild", "lib", "main.js")).href
);
await build({
  entryPoints: [join(here, "liveness.ts")],
  bundle: true, format: "esm", outdir: out, logLevel: "silent",
  outExtension: { ".js": ".mjs" },
});
const L = await import(pathToFileURL(join(out, "liveness.mjs")).href);

let bad = 0;
const say = (what, ok, why) => {
  if (!ok) bad++;
  console.log((ok ? "ok   " : "FAIL ") + what + (ok || !why ? "" : "\n      " + why));
};

const now = Date.parse("2026-09-01T04:32:18Z");
const beating = { pid: 1, log: "l", session: "s", beat: "2026-09-01T04:32:16Z" };
const silent = { pid: 1, log: "l", session: "s", beat: "2026-09-01T04:31:00Z" };

say("nextEngineState is exported", typeof L.nextEngineState === "function",
  "it is " + typeof L.nextEngineState + ", so nothing below drives it");
if (typeof L.nextEngineState !== "function") {
  console.log("\n" + bad + " failed. Nothing below ran.");
  process.exit(1);
}

// THE ONE THE OWNER MET. Nothing was running, the light went out, and then an
// engine came up from a terminal.
for (const was of ["idle", "bad"]) {
  say(`an engine that came back turns a ${was} light good`,
    L.nextEngineState(was, beating, now) === "good",
    "it answered " + L.nextEngineState(was, beating, now)
      + ", so a running engine with a fresh heartbeat leaves the button red");
}

say("an engine that is up and beating is good",
  L.nextEngineState("good", beating, now) === "good");
say("an engine that stopped answering is bad",
  L.nextEngineState("good", silent, now) === "bad",
  "it answered " + L.nextEngineState("good", silent, now));
// NOTHING ANSWERING IS THE FAILURE A WATCHDOG EXISTS TO FIND, and no engine at
// all is that case in its strongest form. A first version called it idle and
// the owner overruled it.
say("nothing running is bad rather than idle",
  L.nextEngineState("good", undefined, now) === "bad",
  "it answered " + L.nextEngineState("good", undefined, now));
say("and it stays bad on the next look",
  L.nextEngineState("bad", undefined, now) === "bad");

// A START IN FLIGHT HAS ITS OWN BUDGET AND ITS OWN WATCHDOG. A poll that
// overwrote busy would call a starting engine dead before it could answer.
for (const found of [undefined, beating, silent]) {
  say("a start in flight is left alone", L.nextEngineState("busy", found, now) === "busy",
    "it answered " + L.nextEngineState("busy", found, now));
}

// THE DETAIL SAYS WHICH FAILURE IT IS, because nothing running and one that
// stopped answering want different things done about them.
say("the detail tells the two failures apart",
  L.whyNot("bad", undefined) === "nothing is running"
    && L.whyNot("bad", silent) === "the engine stopped answering",
  "it said " + JSON.stringify([L.whyNot("bad", undefined), L.whyNot("bad", silent)]));
say("and a light that is fine says nothing", L.whyNot("good", beating) === "");

// WHO ENDS THE ENGINE, AND WHEN.
//
// deactivate called stopEngine with no argument, and without a context that
// can only kill a child handle. A window that reattached holds none, and a
// swap successor is a process no window ever held. So the editor closed and
// the engine stayed, and nothing on the engine's own side ends it.
//
// THE RULE IS THE LAST WINDOW OUT, because two windows can be open on one
// tree and the second one must not take the engine from the first.
say("endsTheEngine is exported", typeof L.endsTheEngine === "function",
  "it is " + typeof L.endsTheEngine + ", so nothing below drives it");
if (typeof L.endsTheEngine === "function") {
  // 7 is a window that crashed. Its file is still there and it answers nothing.
  const answers = (pid) => pid !== 7;
  say("the last window out ends the engine",
    L.endsTheEngine([], answers) === true,
    "then no window ever ends it, which is what the owner met");
  say("a window with another one still open ends nothing",
    L.endsTheEngine([{ pid: 2 }], answers) === false,
    "it would take the engine from a window that is still watching it");
  // A FILE IS NOT A WINDOW. One a crashed window left would mean nobody is
  // ever the last one out, and the engine would outlive every editor for ever.
  say("a window that does not answer is not a window",
    L.endsTheEngine([{ pid: 7 }], answers) === true,
    "a file left by a window that crashed would keep the engine alive");
  say("and one that answers still counts among ones that do not",
    L.endsTheEngine([{ pid: 7 }, { pid: 2 }], answers) === false);
}

console.log("\n" + bad + " failed.");
process.exit(bad ? 1 : 0);
