// A CONTROL REACHABLE FROM A CHAT SAYS SO WHERE A PERSON READS ABOUT IT.
//
// The cloud has no panel, so a person on a box they are not sitting at reaches
// a control by writing its message into the chat. A message nobody can find is
// a message nobody sends, and the tooltip is where a person reads what a
// control is.
//
// THE LINE IS COPIED, NEVER COMPOSED. The engine derives it from the control's
// own name and puts it on the node. The panel draws what it was handed. Writing
// it into each title by hand would put one fact in two places, and the tooltip
// would drift from the message that works.
//
// SO THIS SENDS BACK WHAT THE PANEL DREW. It pulls the line out of the rendered
// page, hands that exact text to the engine as a message a person typed, and
// reads the control afterwards. A drawn line that moves nothing is the defect
// this exists to catch.
//
// BOTH HALVES OF THE MECHANISM ARE DRIVEN. A value lands in the parameter store
// and a move lands on the rung the button presses, and those are two different
// writes. A check that drove only the value would pass over the whole reason
// this was widened past the guards.
//
//   node util/checks/tooltips-name-their-keywords.mjs <root> [work]
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(process.argv[2] ?? ".");
const here = join(root, "src", "extension");
const se = join(root, ".bin", process.env.SE_EXE || (process.platform === "win32" ? "se.exe" : "se"));

let failed = 0;
const ok = (said) => console.log("ok    " + said);
const no = (said) => { console.log("FAIL  " + said); failed++; };
// A CHECK THAT FINDS NOTHING TO CHECK REFUSES, rather than passing by having
// no member to fail.
const refuse = (why) => { console.error(why); process.exit(1); };

// THE TREE COMES FROM THE ENGINE, because the line is the engine's answer and
// not a thing this file works out for itself.
let tree;
try {
  tree = JSON.parse(execFileSync(se, ["--tree", "--method", root], { encoding: "utf8" }));
} catch (err) {
  refuse("the engine could not be asked for the tree: " + (err.stderr ?? err.message));
}

const nodes = [];
(function walk(n, path) {
  const key = path ? path + "." + n.name : n.name;
  nodes.push([key, n]);
  for (const c of n.children ?? []) walk(c, key);
})(tree, "");
const reachable = nodes.filter(([, n]) => n.keywords?.length);
if (reachable.length === 0) {
  refuse("the engine names no control as reachable from a console, so this counted nothing");
}
ok(`the engine names ${reachable.length} control(s) reachable from a console`);

// EVERY LINE IS THE ONE SHAPE. A line that is not KEYWORD:NAME or
// KEYWORD:NAME=VALUE is a second syntax nobody was told about.
const shape = /^KEYWORD:[A-Z0-9_]+(=.+)?$/;
const odd = reachable.flatMap(([k, n]) => n.keywords.filter((l) => !shape.test(l)).map((l) => k + ": " + l));
if (odd.length === 0) ok("every line the engine answers is KEYWORD:NAME or KEYWORD:NAME=VALUE");
else no("these lines are not the declared shape: " + odd.join(", "));

// AND NO TWO CONTROLS ANSWER TO ONE NAME. The name is derived from the node's
// own, so two nodes named alike in different groups would both claim it. The
// engine keeps whichever it walked last, in silence, and a person would move a
// control they were not naming.
const claimed = new Map();
const clash = [];
for (const [key, n] of reachable) {
  for (const name of new Set(n.keywords.map((l) => l.slice("KEYWORD:".length).split("=")[0]))) {
    if (claimed.has(name)) clash.push(name + ": " + claimed.get(name) + " and " + key);
    else claimed.set(name, key);
  }
}
if (clash.length === 0) ok(`the ${claimed.size} name(s) are one control each`);
else no("these names are claimed twice, and the later one wins in silence: " + clash.join(", "));

// NOBODY WRITES A LINE INTO THE DECLARATION. One fact, one place.
const declared = readFileSync(join(root, "util", "parameters.json"), "utf8");
const copies = [];
if (/"keywords?"\s*:/.test(declared)) copies.push("a declared keyword field");
if (/KEYWORD:/.test(declared)) copies.push("a title spelling out a message");
if (copies.length === 0) ok("the declaration writes no line out by hand");
else no("the declaration carries " + copies.join(" and ")
  + ", so the tooltip and the matcher are two places one fact is kept");

// THE PANEL DRAWS WHAT IT WAS HANDED.
const out = mkdtempSync(join(tmpdir(), "keywords-"));
const { build } = await import("file://" + join(here, "node_modules", "esbuild", "lib", "main.js"));
await build({
  entryPoints: [join(here, "panel.ts")],
  bundle: true, format: "esm", outdir: out, logLevel: "silent", outExtension: { ".js": ".mjs" },
});
const { panelHtml } = await import("file://" + join(out, "panel.mjs"));

const shown = (tree.children ?? []).map((c) => c.name);
const nothing = { actors: [], hold: { on: false }, present: [] };
const page = panelHtml(tree, shown, {}, nothing);

// THE PAGE IS READ AS A PERSON SEES IT, not as the markup spells it. A line
// carrying angle brackets is escaped into the title attribute and the browser
// puts it back, so a check comparing against the raw markup would call a line
// missing that a person reads perfectly well. The placeholder in a number's
// line is exactly that case.
const seen = (html) => html.replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
const read = seen(page);

for (const [key, n] of reachable) {
  const missing = n.keywords.filter((l) => !read.includes(l));
  if (missing.length === 0) ok(key + " draws its " + n.keywords.length + " line(s)");
  else no(key + " is reachable and the panel draws nothing for " + missing.join(", ")
    + ", so a person reading the tooltip cannot learn it");
}

// A TOGGLE DRAWS ITS LINES IN EVERY STATE, and not only the resting one. The
// webview swaps the title as the state moves, so lines on the resting state
// alone vanish the moment somebody presses it.
const toggles = reachable.filter(([, n]) => n.type === "toggle" && n.titles);
if (toggles.length === 0) {
  refuse("no reachable toggle, so nothing here holds the per-state half");
}
for (const [key, n] of toggles) {
  const states = Object.keys(n.titles);
  // The states ride in data-titles, which is the JSON the webview reads back.
  const blob = read.slice(read.indexOf(`id="${n.name}"`));
  const thin = states.filter((s) => {
    const at = blob.indexOf(n.titles[s].slice(0, 24));
    return at < 0 || !n.keywords.every((l) => blob.slice(at, at + 4000).includes(l));
  });
  if (thin.length === 0) ok(key + " draws its lines in all " + states.length + " state(s)");
  else no(key + " draws no lines in these states: " + thin.join(", "));
}

// AND A CONTROL THAT CARRIES NO FLAG DRAWS NO LINE. Opening the work editor or
// a home does nothing for a person with only a chat, so those say nothing.
const quiet = nodes.filter(([, n]) => !n.keywords?.length && n.type === "action");
if (quiet.length === 0) {
  refuse("every control is reachable, so nothing here holds the other half");
}
const loud = quiet.filter(([, n]) => read.includes("KEYWORD:" + n.name.toUpperCase()));
if (loud.length === 0) ok(`${quiet.length} control(s) carry no flag and draw no line`);
else no("these carry no flag and draw a line anyway: " + loud.map(([k]) => k).join(", "));

// THE LINE THE TOOLTIP DRAWS IS THE TEXT THE ENGINE MATCHES.
//
// The line is pulled back out of the rendered page rather than read off the
// tree, so a panel that drew something near enough to look right still fails.
const work = mkdtempSync(join(tmpdir(), "keyword-work-"));
mkdirSync(join(work, ".se"), { recursive: true });
const hook = (body) => execFileSync(se, ["hook", "--method", root, "--work", work],
  { input: JSON.stringify(body), encoding: "utf8" });

// AND WHAT THIS STARTS, THIS STOPS. A hook over a folder with no engine starts
// one, and it outlives the run. Five were left behind before this line existed,
// each holding the shared index, and every test run on the box answered
// "database is locked" for a quarter of an hour.
process.on("exit", () => {
  try {
    execFileSync(se, ["--work", work, "--stop"], { encoding: "utf8", timeout: 10000 });
  } catch {
    // A folder that never had one is nothing to stop, and this is the last word.
  }
});
hook({ hook_event_name: "SessionStart", cwd: work, source: "startup" });

// IT ARRIVES AS A PERSON TYPING, which is the only route the matcher reads.
const drawnLine = (line) => {
  const at = read.indexOf(line);
  if (at < 0) refuse("the panel drew no line for " + line + ", which an earlier member should have caught");
  return read.slice(at, at + line.length);
};
const stored = (file) => {
  try {
    return JSON.parse(readFileSync(join(work, ".se", file), "utf8"));
  } catch {
    return undefined; // nothing written is the declared default, which is where it starts
  }
};

// THE VALUE HALF lands in the parameter store. A CONTROL THE FLOOR HOLDS DOWN
// MOVES FOR NOBODY, so this runs over one that can move both ways.
const value = reachable.find(([, n]) => n.type === "bool" && n.narrow !== "on");
if (value === undefined) {
  refuse("every reachable bool is held on by the method, so nothing here can move");
}
const [valueKey, valueNode] = value;
const param = valueKey.replace(tree.name + ".", "");
const off = drawnLine(valueNode.keywords.find((l) => l.endsWith("=OFF")));
const was = stored("parameters.json")?.[param];
hook({ hook_event_name: "UserPromptSubmit", cwd: work, prompt: off });
const now = stored("parameters.json")?.[param];
if (now === false && now !== was) ok(`the drawn line ${off} moved ${valueKey} to ${now}`);
else no(`the drawn line ${JSON.stringify(off)} left ${valueKey} at ${JSON.stringify(now)}`
  + ", so the tooltip names something the engine does not match");

// THE MOVE HALF lands on the rung the button presses, which is a different
// write. A value that worked says nothing about a move.
const move = reachable.find(([, n]) => n.type === "toggle" && n.command === "quackitect.unbind");
if (move === undefined) {
  refuse("no reachable toggle presses the binding, so nothing here holds the move half");
}
const [moveKey, moveNode] = move;
const on = drawnLine(moveNode.keywords.find((l) => l.endsWith("=ON")));
hook({ hook_event_name: "UserPromptSubmit", cwd: work, prompt: on });
const at = stored("binding.json")?.at;
if (at === "unbound") ok(`the drawn line ${on} moved ${moveKey} to ${at}`);
else no(`the drawn line ${JSON.stringify(on)} left the binding at ${JSON.stringify(at)}`
  + ", so a button's tooltip names a message that presses nothing");

// AND THE SAME LINE INSIDE A SENTENCE MOVES NOTHING, so a person reading this
// check aloud does not fire it.
hook({ hook_event_name: "UserPromptSubmit", cwd: work, prompt: "please send " + off + " for me" });
if (stored("parameters.json")?.[param] === false) ok("the same line inside a sentence moves nothing");
else no("a mention inside a sentence moved " + valueKey);

console.log(failed ? `\n${failed} failed.` : "\n0 failed.");
process.exit(failed ? 1 : 0);
