// THE EDITOR ENDS THE ENGINE, AND IT ENDS IT BY THE PID ON DISK.
//
// deactivate called stopEngine() with no argument. Without a context stopEngine
// can only kill a child handle, a window that reattached holds none, and a swap
// successor is a process no window ever held. So closing the editor ended
// nothing, and the engine's own loop exits only on a signal, a stop over the
// socket, or a swap.
//
// IT IS READ OFF THE TWO BODIES, NOT OFF THE FILE. A rule matched against the
// whole file passes on any mention of the name anywhere, and that is a check
// that cannot go red.
//
// AND THE CALL SITES ARE WALKED ONE BY ONE. The two bodies say nothing about
// the other places the engine is stopped from, so each call is named and
// judged on its own line, and a site added later arrives judged.
//
//   node .se/scratchpad/engine-stops-by-pid.mjs <root>
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";
const file = join(root, "src", "extension", "extension.ts");
const text = readFileSync(file, "utf8");

let bad = 0;
const say = (what, ok, why) => {
  if (!ok) bad++;
  console.log((ok ? "ok   " : "FAIL ") + " stops: " + what + (ok || !why ? "" : "\n      " + why));
};

// The body of a top level function: from its declaration to the first brace
// that closes a line of its own, which is the one that ends it.
function bodyOf(what) {
  const at = text.indexOf(what);
  if (at === -1) return "";
  const end = text.indexOf("\n}", at);
  return end === -1 ? text.slice(at) : text.slice(at, end + 2);
}

const leaving = bodyOf("export function deactivate()");
const stopping = bodyOf("function stopEngine(");
say("deactivate and stopEngine are both in extension.ts",
  leaving !== "" && stopping !== "");
if (!leaving || !stopping) {
  console.log("\n" + bad + " failed. Nothing below ran.");
  process.exit(1);
}

// THE ONE THE OWNER MET. stopEngine() with no argument cannot look the engine
// up, so a window that only reattached killed nothing on the way out.
say("deactivate hands stopEngine something to look the engine up with",
  /stopEngine\s*\(\s*[A-Za-z_$][\w$]*\s*\)/.test(leaving),
  "stopEngine() with no argument can only kill a child handle, and a window that reattached holds none");

// AND IT IS NOT ALWAYS THIS WINDOW'S TO END. Another window on the same tree
// is watching the same engine.
say("deactivate asks whether this window is the last one out",
  /endsTheEngine\s*\(/.test(leaving),
  "a second window closing would take the engine from the first, which is still watching it");
say("deactivate stops saying this window is here",
  /forgetThisWindow\s*\(/.test(leaving),
  "a window that closed and is still counted means the next one out is never the last");

// THE PID ON DISK IS THE ENGINE. A swap makes the handle a lie: the process it
// names has gone, and the successor is one no window ever held.
const reads = stopping.indexOf("whatIsRunning");
const handle = stopping.search(/engine\.kill\s*\(/);
say("stopEngine reads the engine's own file", reads !== -1,
  "then it can only end a process this window spawned itself");
say("stopEngine reaches for the child handle only after that",
  reads !== -1 && (handle === -1 || reads < handle),
  "killing the handle first reaches a process a swap already ended, and leaves the engine running");

// AND EVERY CALL SITE, NOT ONLY THE ONE THE OWNER MET. Read off the deactivate
// body alone, this check cannot see the other places the engine is stopped
// from, so a second site written stopEngine() is a defect it is blind to.
// startEngine was exactly that: it stopped a running engine before starting a
// new one, and after a swap the handle it reached for named a process gone.
//
// A line of prose is not a call, so comment lines are passed over, and so is
// the declaration, which is a signature rather than a call.
const lines = text.split("\n");
const sites = [];
lines.forEach((line, i) => {
  const t = line.trim();
  if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) return;
  if (!/stopEngine\s*\(/.test(line)) return;
  if (/function\s+stopEngine\s*\(/.test(line)) return;
  sites.push({ at: i + 1, line, before: (lines[i - 1] ?? "").trim() });
});

// A walk that finds nothing passes everything, so what it found is asserted
// before what it found is judged.
say("the walk finds the call sites at all", sites.length > 1,
  "found " + sites.length + ", so the rule below is deciding nothing");

// The argument is what stopEngine looks the engine up with. A site that hands
// it none says why in a comment, on the line or the line above, or it is wrong.
const hands = /stopEngine\s*\(\s*[A-Za-z_$][\w$]*\s*\)/;
const excused = (s) => /\/\/./.test(s.line) || s.before.startsWith("//");
for (const s of sites) {
  say("extension.ts:" + s.at + " hands stopEngine something to look the engine up with",
    hands.test(s.line) || excused(s),
    s.line.trim() + "\n      stopEngine() with no argument kills a child handle, and after a swap that handle names a process that has gone");
}

console.log("\n" + bad + " failed.");
process.exit(bad ? 1 : 0);
