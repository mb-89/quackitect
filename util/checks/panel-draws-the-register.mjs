// THE TABLE DRAWS THE REGISTER IT WAS HANDED, AND DERIVES NOTHING.
//
// EXCEPT AN EMPTY HAND, WHICH DRAWS NO ROW. The owner's rule: an agent with
// nothing in hand can despawn, and one holding something is shown with what it
// holds. A row that says only that somebody once pulled is a row a person
// cannot act on, and four of them read as nonsense.
//
// THE DROP IS HERE AND NOT IN THE REGISTER. The staffing count reads the
// length of that list, so an agent taken out of it is an agent the guard
// cannot count, and a worker that has spawned and not pulled yet would go
// missing. It is hidden from the drawing, and the count still sees it.
//
// The panel is where a person looks to see who is here. A table that made up
// its own rows, or kept the last ones, would look right in a screenshot and
// lie every other minute. So it is rendered from TWO different answers and
// each page is held to the answer it was given: what is on one must not be
// on the other.
//
// AND THE DECLARATION IS WHAT CHOOSES THE COLUMNS. A widget with the columns
// written into it is a second place the panel is decided, and util/
// parameters.json would no longer say what the panel shows.
//
// The bundler lives beside the extension it builds, the way render-check does.
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(process.argv[2] ?? ".");
const here = join(root, "src", "extension");
const out = mkdtempSync(join(tmpdir(), "register-"));
const { build } = await import("file://" + join(here, "node_modules", "esbuild", "lib", "main.js"));
await build({
  entryPoints: [join(here, "panel.ts")],
  bundle: true, format: "esm", outdir: out, logLevel: "silent", outExtension: { ".js": ".mjs" },
});
const { panelHtml } = await import("file://" + join(out, "panel.mjs"));

let failed = 0;
const ok = (said) => console.log("ok    " + said);
const no = (said) => { console.log("FAIL  " + said); failed++; };
const holds = (page, what, why) => {
  if (page.includes(what)) ok(why);
  else no(why + ": the page does not carry " + JSON.stringify(what));
};
const holdsNot = (page, what, why) => {
  if (!page.includes(what)) ok(why);
  else no(why + ": the page carries " + JSON.stringify(what));
};

// THE TABLE THE PRODUCT DECLARES IS THE ONE UNDER TEST. A table written here
// would pass while the shipped panel had none.
const declared = JSON.parse(readFileSync(join(root, "util", "parameters.json"), "utf8"));
const control = (declared.children ?? []).find((c) => c.name === "control");
const table = (control?.children ?? []).find((c) => c.type === "table");
if (!table) {
  no("the control group declares a table");
  console.log("\n1 failed.");
  process.exit(1);
}
ok(`the control group declares a table over ${table.source}`);

const tree = { name: "quackitect", type: "group", children: [control] };
const shown = ["control"];

const first = {
  actors: [],
  hold: { on: false },
  present: [
    { actor: "main", kind: "session", state: "waiting", holding: "nothing in hand" },
    { actor: "reviewer-1", kind: "reviewer", state: "working", id: "wk-1111111111",
      title: "the first thing", holding: "wk-1111111111 the first thing" },
  ],
};
const second = {
  actors: [],
  hold: { on: false },
  present: [
    { actor: "walker-4", kind: "walker", state: "stopped", id: "wk-2222222222",
      title: "the second thing", holding: "wk-2222222222 the second thing" },
  ],
};

const one = panelHtml(tree, shown, {}, first);
const two = panelHtml(tree, shown, {}, second);

// EACH PAGE CARRIES ITS OWN REGISTER.
holds(one, "reviewer-1", "first: the helper it was handed");
holds(one, "wk-1111111111", "first: the token that helper holds");
holds(one, 'class="open" data-id="wk-1111111111"', "first: the title is a link that opens the token");
holdsNot(one, "nothing in hand", "first: an agent holding nothing draws no row");
holdsNot(one, 'data-actor="main"', "first: the empty-handed session is not drawn");
holds(two, "walker-4", "second: the agent it was handed");
holds(two, "wk-2222222222", "second: the token it was handed");

// AND NEITHER CARRIES THE OTHER'S, which a table keeping its last rows fails.
holdsNot(one, "walker-4", "first: nothing from the second answer");
holdsNot(two, "reviewer-1", "second: nothing from the first answer");
holdsNot(two, "wk-1111111111", "second: not the first answer's token");

// TWO SESSIONS ARE TWO ROWS, EACH UNDER ITS OWN NAME.
//
// An actor is a session and not a word. Two sessions over one tree were both
// the actor main, so the register answered one name where two agents were
// working and the table drew one of them. The name is the engine's to give;
// what is held to here is that the table draws every row it is handed and
// collapses none of them, which is the half a person looks at.
const sessions = {
  actors: [],
  hold: { on: false },
  present: [
    { actor: "main", kind: "session", state: "working", id: "wk-3333333333",
      title: "the first session's work", holding: "wk-3333333333 the first session's work" },
    { actor: "main-ssecond3", kind: "session", state: "working", id: "wk-4444444444",
      title: "the second session's work", holding: "wk-4444444444 the second session's work" },
  ],
};
const two_sessions = panelHtml(tree, shown, {}, sessions);
holds(two_sessions, 'data-actor="main"', "two sessions: the first keeps main");
holds(two_sessions, 'data-actor="main-ssecond3"', "two sessions: the second is drawn under its own name");
holds(two_sessions, "wk-3333333333", "two sessions: the token the first holds");
holds(two_sessions, "wk-4444444444", "two sessions: the token the second holds");
if ((two_sessions.match(/<tr /g) ?? []).length === 2) ok("two sessions: two rows, and neither collapsed into the other");
else no("two sessions: the table drew " + (two_sessions.match(/<tr /g) ?? []).length + " rows for two sessions");

// THE COLUMNS ARE THE DECLARED ONES, by their titles, in the declared order.
const titles = (table.columns ?? []).map((c) => c.title);
const at = titles.map((t) => one.indexOf(">" + t + "<"));
if (at.every((i) => i >= 0)) ok("every declared column is drawn: " + titles.join(", "));
else no("a declared column is not drawn: " + titles.filter((_, i) => at[i] < 0).join(", "));
if (at.every((i, n) => n === 0 || i > at[n - 1])) ok("the columns are drawn in the declared order");
else no("the columns are drawn out of the declared order");

// AN EMPTY REGISTER SAYS SO. A table with no rows and no word reads as a
// panel that failed to load, and nobody here is a fact rather than a fault.
const none = panelHtml(tree, shown, {}, { actors: [], hold: { on: false }, present: [] });
holds(none, "nobody is here", "an empty register says nobody is here");

// AND SO DOES A REGISTER OF EMPTY HANDS. Every row is dropped, so the table
// has none, and a table with no rows and no word reads as a panel that failed.
const idle = panelHtml(tree, shown, {}, {
  actors: [], hold: { on: false },
  present: [
    { actor: "worker-1", kind: "worker", state: "waiting", holding: "nothing in hand" },
    { actor: "worker-2", kind: "worker", state: "waiting", holding: "nothing in hand" },
  ],
});
holds(idle, "nobody is here", "a register of empty hands says nobody is here");
holdsNot(idle, "worker-1", "a register of empty hands draws no row");

// AND A SOURCE NOTHING ANSWERS IS A FAULT IN THE DECLARATION, said out loud
// rather than drawn as an empty table.
const wrong = { ...control, children: [{ name: "agents", type: "table", source: "nowhere", columns: table.columns }] };
const said = panelHtml({ name: "quackitect", type: "group", children: [wrong] }, shown, {}, first);
holds(said, "no list called nowhere", "a source nothing answers says so");

console.log(failed ? `\n${failed} failed.` : "\n0 failed.");
process.exit(failed ? 1 : 0);
