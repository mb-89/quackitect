// A WINDOW SAYS IT IS HERE, AND STOPS SAYING IT WHEN IT CLOSES.
//
// Closing the editor left the engine running. The fix has to know whether this
// window is the last one on the tree, and nothing in the editor is shared
// between windows. So each window writes a file under .se named by its pid,
// the way the engine writes its own pid to .se/engine.json.
//
// THIS DRIVES THE READER AND THE WRITER TOGETHER. A writer nothing reads back
// is the half that goes missing, and a reader with nothing written under it
// answers none and looks correct.
//
//   node .se/scratchpad/windows-say-they-are-here.mjs <root>
import { mkdtempSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.argv[2] ?? ".";
const here = join(root, "src", "extension");
const out = mkdtempSync(join(tmpdir(), "windows-"));
const { build } = await import(
  pathToFileURL(join(here, "node_modules", "esbuild", "lib", "main.js")).href
);
await build({
  entryPoints: [join(here, "windows.ts")],
  bundle: true, format: "esm", platform: "node", outdir: out, logLevel: "silent",
  outExtension: { ".js": ".mjs" },
});
const W = await import(pathToFileURL(join(out, "windows.mjs")).href);

let bad = 0;
const say = (what, ok, why) => {
  if (!ok) bad++;
  console.log((ok ? "ok   " : "FAIL ") + " windows: " + what + (ok || !why ? "" : "\n      " + why));
};

for (const name of ["sayWindowIsHere", "forgetWindow", "windowsThere", "windowAnswers", "sweepWindowsGone"]) {
  say(name + " is exported", typeof W[name] === "function",
    "it is " + typeof W[name] + ", so nothing below drives it");
}
if (bad) {
  console.log("\n" + bad + " failed. Nothing below ran.");
  process.exit(1);
}

const work = mkdtempSync(join(tmpdir(), "tree-"));
const dir = join(work, ".se", "windows");
// A PID WINDOWS CANNOT ISSUE. Its pids are multiples of four, so nothing on
// this box is running under this one and it stands for a window that crashed.
const gone = 424242;

// A tree nobody has opened has no windows, and asking must not throw.
say("a tree with no windows folder answers none", W.windowsThere(work, 1).length === 0);

W.sayWindowIsHere(work, process.pid);
say("a window that said it is here left a file",
  existsSync(join(dir, process.pid + ".json")));
// THIS WINDOW IS NEVER ONE OF THE OTHERS. Counting itself would mean no window
// is ever the last one out, which is the whole failure this file exists to stop.
say("and it is not one of the others",
  W.windowsThere(work, process.pid).length === 0,
  "it counted itself, so no window is ever the last one out");

W.sayWindowIsHere(work, gone);
say("another window is seen",
  W.windowsThere(work, process.pid).some((w) => w.pid === gone));

// A NAME THAT IS NOT A PID IS NOT A WINDOW.
writeFileSync(join(dir, "notes.json"), "{}", "utf8");
writeFileSync(join(dir, "5.txt"), "{}", "utf8");
say("a file that is not a pid is not a window",
  W.windowsThere(work, process.pid).every((w) => Number.isInteger(w.pid) && w.pid > 0),
  JSON.stringify(W.windowsThere(work, process.pid)));

W.forgetWindow(work, process.pid);
say("a window that closed left no file",
  !existsSync(join(dir, process.pid + ".json")),
  "then it is still counted, and the next window out is never the last");
// Forgetting one that was never there says nothing and throws nothing.
W.forgetWindow(work, 999999);

say("this process answers", W.windowAnswers(process.pid) === true);
say("a pid nothing is running under does not", W.windowAnswers(gone) === false,
  "then a window that crashed would keep the engine alive for ever");

const swept = W.sweepWindowsGone(work, process.pid);
say("the sweep took the window that is gone",
  swept >= 1 && !W.windowsThere(work, process.pid).some((w) => w.pid === gone),
  "it swept " + swept + ", and what a crashed window left is a window for ever");

console.log("\n" + bad + " failed.");
process.exit(bad ? 1 : 0);
