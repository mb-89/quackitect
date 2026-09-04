// THE TABLE DRAWS THE REGISTER IT WAS HANDED, AND DERIVES NOTHING.
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
holds(one, "main", "first: the session it was handed");
holds(one, "nothing in hand", "first: an agent holding nothing is still a row");
holds(two, "walker-4", "second: the agent it was handed");
holds(two, "wk-2222222222", "second: the token it was handed");

// AND NEITHER CARRIES THE OTHER'S, which a table keeping its last rows fails.
holdsNot(one, "walker-4", "first: nothing from the second answer");
holdsNot(two, "reviewer-1", "second: nothing from the first answer");
holdsNot(two, "wk-1111111111", "second: not the first answer's token");

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

// AND A SOURCE NOTHING ANSWERS IS A FAULT IN THE DECLARATION, said out loud
// rather than drawn as an empty table.
const wrong = { ...control, children: [{ name: "agents", type: "table", source: "nowhere", columns: table.columns }] };
const said = panelHtml({ name: "quackitect", type: "group", children: [wrong] }, shown, {}, first);
holds(said, "no list called nowhere", "a source nothing answers says so");

console.log(failed ? `\n${failed} failed.` : "\n0 failed.");
process.exit(failed ? 1 : 0);
