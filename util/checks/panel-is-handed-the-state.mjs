// THE ANSWER REACHES THE PANEL, which is the seam every other check is blind to.
//
// The Go checks cannot see src/extension, and the panel check renders from an
// answer it builds itself, so the header could be right in both and still be
// empty in the shipped extension: nothing would be asking the engine, and
// nothing would be handing the answer over.
//
// SO THIS READS THE ONE CALL SITE IN THE SHIPPED EXTENSION. render in
// src/extension/extension.ts is where panelHtml is called, and what it is handed
// there is what the person sees.
//
// A CHECK THAT FINDS NOTHING TO CHECK REFUSES. A rename that moves the call site
// must fail this rather than pass it with nothing looked at.
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.argv[2] ?? ".");
const source = readFileSync(join(root, "src", "extension", "extension.ts"), "utf8");
const args = readFileSync(join(root, "src", "extension", "engineargs.ts"), "utf8");
const panel = readFileSync(join(root, "src", "extension", "panel.ts"), "utf8");
const editor = readFileSync(join(root, "src", "extension", "editor.ts"), "utf8");

let failed = 0;
const ok = (said) => console.log("ok    " + said);
const no = (said) => { console.log("FAIL  " + said); failed++; };

// ONE CALL SITE, AND IT HAS TO BE THERE. Two would mean the header depends on
// which one ran, and none means this check is reading a file that has moved.
const calls = [...source.matchAll(/panelHtml\(([^;]*?)\)\s*;/gs)];
if (calls.length === 0) {
  console.error("no panelHtml call in src/extension/extension.ts, so this check guards nothing");
  process.exit(1);
}
if (calls.length === 1) ok("extension: one panelHtml call site");
else no(`extension: ${calls.length} panelHtml call sites, so what the header is handed depends on which ran`);

// WHAT IT IS HANDED. The engine's answer has to be among the arguments, by the
// name the reader that fills it uses, so a call that hands over the tree, the
// groups and the icons and nothing else fails.
const handed = calls[0][1];
if (/\blastDoing\b/.test(handed)) ok("extension: panelHtml is handed the engine's answer");
else no("extension: panelHtml is handed " + handed.replace(/\s+/g, " ").trim() +
        ", and none of that is what the engine answered");

// AND SOMETHING ASKS THE ENGINE FOR IT. A field nothing fills is handed over
// empty, and an empty header looks exactly like one that was never built.
if (/doingArgs\s*\(/.test(source)) ok("extension: the engine is asked for it");
else no("extension: nothing spawns the engine with the doing arguments, so what is handed over is never filled");

if (/export function doingArgs\s*\(/.test(args)) ok("engineargs: the argument list is declared where every other one is");
else no("engineargs: doingArgs is not declared, so the call bypasses the one place these lists live");

// AND IT IS REFRESHED RATHER THAN READ ONCE. A header wired at activation says
// working over an agent that stopped ten minutes ago, and every other assertion
// here is green over it: they read the call site and not the caller.
if (/readDoing\([^)]*\)\s*\.then\(\s*\(\)\s*=>\s*render\(/.test(source)) {
  ok("extension: the answer is read again and the header redrawn on the beat");
} else {
  no("extension: nothing reads the answer again and redraws, so the header is whatever was " +
     "last read and can say working over an agent that has stopped");
}

// AND THE BEAT IS A CLOCK, NOT SOMEBODY'S FINGER.
//
// THE ONE THE OWNER MET. The assertion above is satisfied by a read inside
// postValues, and postValues runs when a parameter file changes, when a control
// is used, and when a fresh view says ready. None of those happen because a
// token changed hands. So the strip and the table under it held whatever was
// true at the moment the sidebar was built, and the only way to see a new value
// was to shut the sidebar and open it again: that tears the view down, and
// building it reads once more. Their words were that everything in the UI
// always needs to be live.
//
// SO THIS ASKS FOR THE TICK ITSELF, and for both panels to be on it.
if (/setInterval\([^;]*refreshLive\(/.test(source)) {
  ok("extension: the state is read again on a repeating tick");
} else {
  no("extension: nothing reads the engine's answer on a tick, so a panel holds whatever was " +
     "true when it was built until it is torn down and built again");
}

const tick = /async function refreshLive\([\s\S]*?\r?\n\}/.exec(source);
if (!tick) {
  no("extension: there is no refreshLive, so nothing below can read what the tick does");
} else {
  if (/readDoing\(/.test(tick[0])) ok("extension: the tick asks the engine what is happening");
  else no("extension: the tick never reads the engine's answer, so it redraws what it already had");

  if (/postDoing\(/.test(tick[0])) ok("extension: and hands it to the page that is already open");
  else no("extension: the tick does not hand the answer to the open page");

  if (/drawWork\(/.test(tick[0])) ok("extension: and the work editor is drawn again on the same tick");
  else no("extension: the work editor is not on the tick, so it holds what it had when it opened");
}

// THE PAGE TAKES THE ANSWER WITHOUT BEING REBUILT. Replacing the html every
// second would empty the line a person is typing in and shut the picker under
// their hand, so the live parts arrive as a message the page drops into place,
// which is how the values already travel.
if (/m\.type === 'doing'/.test(panel)) ok("panel: the open page takes a fresh answer as a message");
else no("panel: the page has no way to take a fresh answer, so the only way to change it is to " +
        "replace the whole page, which empties whatever a person was typing");

if (/m\.type === 'burndown'/.test(editor)) ok("editor: the counter takes a fresh number as a message");
else no("editor: the counter can only change when the whole page is rebuilt");

// AND THE COUNTER IS READ EVERY DRAW, NOT ONLY ON A REBUILD. It was asked for
// inside the branch that replaces the page, so on every ordinary draw the bar
// kept the number it was built with.
const asked = source.indexOf("burndownArgs()");
const rebuilds = source.indexOf("if (rebuild || workBuilt !== workView)");
if (asked >= 0 && rebuilds >= 0 && asked < rebuilds) {
  ok("extension: the counter is read on every draw");
} else {
  no("extension: the counter is read only where the page is rebuilt, so it says whatever it " +
     "said when the editor was opened");
}

console.log(failed ? `\n${failed} failed.` : "\n0 failed.");
process.exit(failed ? 1 : 0);
