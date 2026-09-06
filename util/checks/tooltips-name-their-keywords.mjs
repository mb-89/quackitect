// A CONTROL REACHABLE FROM A CHAT SAYS SO WHERE A PERSON READS ABOUT IT.
//
// The cloud has no panel, so a person on a box they are not sitting at reaches
// a control by writing its word into the chat. A word nobody can find is a word
// nobody uses, and the tooltip is where a person reads what a control is.
//
// THE WORD IS COPIED, NEVER COMPOSED. The engine derives it from the control's
// own name and puts it on the node. The panel draws what it was handed. Writing
// it into each title by hand would put one fact in two places, and the tooltip
// would drift from the word that works.
//
// SO THIS SENDS BACK WHAT THE PANEL DREW. It pulls the word out of the rendered
// page, hands that exact text to the engine as a message a person typed, and
// reads the control afterwards. A drawn word that moves nothing is the defect
// this exists to catch.
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

// THE TREE COMES FROM THE ENGINE, because the word is the engine's answer and
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
const reachable = nodes.filter(([, n]) => n.keyword);
if (reachable.length === 0) {
  refuse("the engine names no control as reachable from a console, so this counted nothing");
}
ok(`the engine names ${reachable.length} control(s) reachable from a console`);

// NOBODY WRITES A WORD INTO THE DECLARATION. One fact, one place.
//
// A title reading the same as the word it derives is not a second copy: the
// word IS the name, so they agree by construction. What would be a second copy
// is a declared keyword field, or a title spelling out how to reach it.
const declared = readFileSync(join(root, "util", "parameters.json"), "utf8");
const copies = [];
if (/"keyword"\s*:/.test(declared)) copies.push("a declared keyword field");
if (/from a chat|on its own/i.test(declared)) copies.push("a title spelling out how to reach it");
if (copies.length === 0) ok("the declaration writes no word out by hand");
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

for (const [key, n] of reachable) {
  if (page.includes(n.keyword)) ok(key + " draws its word: " + n.keyword);
  else no(key + " is reachable and the panel draws no word for it"
    + ", so a person reading the tooltip cannot learn it");
}

// AND A CONTROL THAT CARRIES NO FLAG DRAWS NO LINE. Opening the work editor or
// a home does nothing for a person with only a chat, so those say nothing.
const quiet = nodes.filter(([, n]) => !n.keyword && (n.type === "action" || n.type === "bool"));
if (quiet.length === 0) {
  refuse("every control is reachable, so nothing here holds the other half");
}
const loud = quiet.filter(([, n]) => page.includes("reach it from a chat by writing " + n.name));
if (loud.length === 0) ok(`${quiet.length} control(s) carry no flag and draw no line`);
else no("these carry no flag and draw a line anyway: " + loud.map(([k]) => k).join(", "));

// THE LINE THE TOOLTIP DRAWS IS THE TEXT THE ENGINE MATCHES.
//
// The word is pulled back out of the rendered page rather than read off the
// tree, so a panel that drew something near enough to look right still fails.
// A CONTROL THE FLOOR HOLDS DOWN MOVES FOR NOBODY, so the round trip is run
// over one that can move both ways.
const movable = reachable.find(([, n]) => n.narrow !== "on");
if (movable === undefined) {
  refuse("every reachable control is held on by the method, so nothing here can move");
}
const [key, node] = movable;
const at = page.indexOf(node.keyword);
const drawn = page.slice(at, at + node.keyword.length);

const work = mkdtempSync(join(tmpdir(), "keyword-work-"));
mkdirSync(join(work, ".se"), { recursive: true });
const hook = (body) => execFileSync(se, ["hook", "--method", root, "--work", work],
  { input: JSON.stringify(body), encoding: "utf8" });

// THE VALUE IS READ OFF THE STORE THE ENGINE WROTE, because asking it takes a
// running engine over this folder and the guard needs none.
const stored = key.replace(tree.name + ".", "");
const value = () => {
  try {
    return JSON.parse(readFileSync(join(work, ".se", "parameters.json"), "utf8"))[stored];
  } catch {
    return undefined; // nothing stored is the declared default, which is what it starts at
  }
};

const was = value();
hook({ hook_event_name: "SessionStart", cwd: work, source: "startup" });
// IT ARRIVES AS A PERSON TYPING, which is the only route the matcher reads.
hook({ hook_event_name: "UserPromptSubmit", cwd: work, prompt: drawn });
const now = value();

if (now !== was && now !== undefined) ok(`the drawn word moved ${key} to ${now}`);
else no(`the drawn word ${JSON.stringify(drawn)} left ${key} where it was`
  + ", so the tooltip names something the engine does not match");

// AND THE SAME WORD INSIDE A SENTENCE MOVES NOTHING, so a person reading this
// line aloud does not fire it.
const before = value();
hook({ hook_event_name: "UserPromptSubmit", cwd: work, prompt: "please turn " + drawn + " back" });
if (value() === before) ok("the same word inside a sentence moves nothing");
else no("a mention inside a sentence moved " + key);

console.log(failed ? `\n${failed} failed.` : "\n0 failed.");
process.exit(failed ? 1 : 0);
