// THE PANEL'S TABLE DRAWS THE ACTOR, THE STATE AND THE TOKEN IT WAS HANDED,
// AND DERIVES NONE OF THEM.
//
// IT USED TO ASK THIS OF THE HEADER. The header drew a line per working actor
// beside the gear, so every agent was on the panel twice and the strip's first
// line ran into the view's own title. An actor is drawn in the table and
// nowhere else now, so that is where this asks.
//
// A page that ignored its input and printed a state of its own would pass any
// check that rendered it once and looked for words. So it is rendered from TWO
// different answers and each page is held to the answer it was given: what is
// on one must not be on the other.
//
// The bundler lives beside the extension it builds, the way render-check does.
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(process.argv[2] ?? ".");
const here = join(root, "src", "extension");
const out = mkdtempSync(join(tmpdir(), "panel-"));
const { build } = await import("file://" + join(here, "node_modules", "esbuild", "lib", "main.js"));
await build({
  entryPoints: [join(here, "panel.ts")],
  bundle: true, format: "esm", outdir: out, logLevel: "silent", outExtension: { ".js": ".mjs" },
});
const { panelHtml } = await import("file://" + join(out, "panel.mjs"));

// THE TABLE AS THE PRODUCT DECLARES IT, so this drives the shape that ships.
const tree = {
  name: "quackitect", type: "group",
  children: [{
    name: "control", title: "agent and engine control", type: "group",
    children: [{
      name: "agents", type: "table", source: "present",
      columns: [{ field: "actor", title: "agent" },
                { field: "title", title: "working on", link: "id", empty: "holding" }],
    }],
  }],
};

const first = {
  actors: [],
  present: [{ actor: "walker", state: "working", id: "wk-1111111111",
              title: "the first thing", holding: "wk-1111111111 the first thing" }],
  hold: { on: false },
};
const second = {
  actors: [],
  present: [{ actor: "second", state: "stopped", id: "wk-2222222222",
              title: "the second thing", holding: "wk-2222222222 the second thing" }],
  hold: { on: true, by: "the person" },
};

const one = panelHtml(tree, ["control"], {}, first);
const two = panelHtml(tree, ["control"], {}, second);

let failed = 0;
const ok = (said) => console.log("ok    " + said);
const no = (said) => { console.log("FAIL  " + said); failed++; };

const holds = (page, what, why) => {
  if (page.includes(what)) ok(why);
  else no(why + ": the page does not carry " + JSON.stringify(what));
};
const holdsNot = (page, what, why) => {
  if (!page.includes(what)) ok(why);
  else no(why + ": the page carries " + JSON.stringify(what) + " from the other answer");
};

// EACH PAGE CARRIES ITS OWN ANSWER.
holds(one, "walker", "first: the actor it was handed");
holds(one, "working", "first: the state it was handed");
holds(one, "wk-1111111111", "first: the token it was handed");
holds(one, "the first thing", "first: the title it was handed");

holds(two, "second", "second: the actor it was handed");
holds(two, "stopped", "second: the state it was handed");
holds(two, "wk-2222222222", "second: the token it was handed");

// AND NEITHER CARRIES THE OTHER'S, which is what a page printing a state of its
// own would fail: a fixed header carries the same words whatever it is given.
holdsNot(one, "wk-2222222222", "first: nothing from the second answer");
holdsNot(one, "stopped", "first: not the other answer's state");
holdsNot(two, "wk-1111111111", "second: nothing from the first answer");
holdsNot(two, "walker", "second: not the other answer's actor");

// THE HOLD IS DRAWN ONCE AND FOR THE TREE. It is on in the second answer and
// off in the first, so a page that draws it always fails here.
holds(two, "on hold", "second: the hold is drawn");
holdsNot(one, "on hold", "first: the hold is not drawn when it is off");

// AND NO ACTOR IS DRAWN ANYWHERE BUT THE TABLE. The head carries the hold,
// which is one fact about the whole panel, and it names nobody.
const head = one.slice(one.indexOf('<div class="head">'), one.indexOf("</div>", one.indexOf('<div class="head">')));
holdsNot(head, "walker", "the head names no actor");
holdsNot(head, "wk-1111111111", "the head names no token");

console.log(failed ? `\n${failed} failed.` : "\n0 failed.");
process.exit(failed ? 1 : 0);
