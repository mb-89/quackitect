// THE ADAPTER DECIDES NO COLUMN.
//
// Everything about a column comes from the declaration or from the engine: which
// columns, their headings, their widths, which one opens the note. Two decisions
// were left in src/extension: which cell may be edited, ruled by a list of
// property names in editor.ts that copied the engine's refusals, and one column
// width written into panel.ts's stylesheet by the column's name. A property the
// engine renames leaves the copy offering an edit the engine refuses, and the
// width is decided in a place util/parameters.json does not say.
//
// THE SETS ARE ASKED FOR, NOT LISTED. The property names come off the engine's
// own answer, and the declared columns off util/parameters.json, so a name
// added tomorrow is asked the same question. The two renderers are then handed
// two answers each and held to the answer they were given, the shape
// panel-draws-the-register.mjs already uses: what one answer locks or widens
// must not be on the page drawn from the other.
//
//   node util/checks/adapter-decides-no-column.mjs <root> [work]
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(process.argv[2] ?? ".");
const work = resolve(process.argv[3] ?? process.argv[2] ?? ".");
const here = join(root, "src", "extension");
const se = join(root, ".bin", process.env.SE_EXE || (process.platform === "win32" ? "se.exe" : "se"));
const ask = (...a) => JSON.parse(execFileSync(se, [...a, "--work", work], { encoding: "utf8" }));

let failed = 0;
const ok = (said) => console.log("ok    " + said);
const no = (said) => { console.log("FAIL  " + said); failed++; };
// A CHECK THAT FINDS NOTHING TO CHECK REFUSES. Every set below is read out of
// something else, and an empty set passes by having no member to fail.
const refuse = (why) => { console.error(why); process.exit(1); };
const holds = (page, what, why) => {
  if (page.includes(what)) ok(why);
  else no(why + ": the page does not carry " + JSON.stringify(what));
};
const holdsNot = (page, what, why) => {
  if (!page.includes(what)) ok(why);
  else no(why + ": the page carries " + JSON.stringify(what));
};
const literal = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ONE: NO TOKEN PROPERTY NAME IS WRITTEN IN THE ADAPTER'S SOURCE.
//
// A name in a comment is prose about the code and not a decision, so comments
// are taken out before the source is read. What is looked for is the name as a
// string, whole, or as the head of a dotted one such as "file.", which is how
// a rule about a family of columns is written.
const props = (ask("query", "--view", "work", "--pane", "left").props ?? []).map((p) => p.name);
if (props.length === 0) refuse("the engine answered no properties, so this check guards nothing");
const uncommented = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "")
  .split("\n").map((l) => l.replace(/\/\/.*$/, "")).join("\n")
  // A MESSAGE KIND IS THE ADAPTER'S OWN WORD. The messages between the two
  // halves of the extension carry a type, and one of them is called file,
  // which is also a property. The discriminator names a message and not a
  // column, so it is taken out before the names are looked for.
  //
  // AND IN WHICHEVER QUOTE IT WAS WRITTEN. This source uses all three, so a
  // rule that reads one of them guards a third of the file.
  .replace(/\btype\s*(?:===?|:)\s*(['"`])[^'"`]*\1/g, "");
for (const file of ["editor.ts", "extension.ts"]) {
  const code = uncommented(readFileSync(join(here, file), "utf8"));
  // EVERY QUOTE THIS SOURCE USES, and it uses all three. The pattern read a
  // double-quoted string alone, so 'status' and `status` walked past a check
  // whose first line says no property name is written here. src/extension
  // carries hundreds of single quotes, so that was most of the file.
  const named = props.filter((p) => new RegExp("['\"`]" + literal(p) + "[.'\"`]").test(code));
  if (named.length === 0) ok(file + " writes no token property name");
  else no(file + " writes a token property name the engine owns: " + named.join(", "));
}

// TWO: NO DECLARED COLUMN HAS A RULE OF ITS OWN IN THE PANEL'S STYLESHEET.
const declared = JSON.parse(readFileSync(join(root, "util", "parameters.json"), "utf8"));
const tables = [];
const walk = (n) => { if (n.type === "table") tables.push(n); (n.children ?? []).forEach(walk); };
walk(declared);
const fields = tables.flatMap((t) => (t.columns ?? []).map((c) => c.field));
if (fields.length === 0) refuse("util/parameters.json declares no table column, so this check guards nothing");
const panelSource = readFileSync(join(here, "panel.ts"), "utf8");
const ruled = fields.filter((f) => new RegExp("\\b(?:th|td)\\." + literal(f) + "(?![\\w-])").test(panelSource));
if (ruled.length === 0) ok("panel.ts carries no rule for a declared column");
else no("panel.ts carries a rule for a declared column by its name: " + ruled.join(", "));

// The bundler lives beside the extension it builds, the way render-check does.
const out = mkdtempSync(join(tmpdir(), "no-column-"));
const { build } = await import(pathToFileURL(join(here, "node_modules", "esbuild", "lib", "main.js")).href);
await build({
  entryPoints: [join(here, "editor.ts"), join(here, "panel.ts")],
  bundle: true, format: "esm", outdir: out, logLevel: "silent", outExtension: { ".js": ".mjs" },
});
const { editorHtml } = await import(pathToFileURL(join(out, "editor.mjs")).href);
const { panelHtml } = await import(pathToFileURL(join(out, "panel.mjs")).href);

// THREE: A CELL IS LOCKED WHERE THE PANE ANSWER SAYS SO, AND NOWHERE ELSE.
//
// The columns are named so that no list in the editor could know them, and
// the two answers lock different ones. A renderer deciding for itself locks
// the same cells on both pages, or none.
const pane = (locked) => ({
  side: "left",
  table: {
    view: "work", columns: ["first", "second", "third"], heads: {}, total: 1, locked,
    groups: [{ name: "all", depth: 0, count: 1, lines: [
      { id: "wk-1111111111", depth: 0, cells: { first: { value: "1" }, second: { value: "2" }, third: { value: "3" } } },
    ] }],
  },
});
const views = ["work"];
const one = editorHtml([pane({ first: "the first is the engine's" })], views, "work");
const two = editorHtml([pane({ second: "the second is moved by a pull" })], views, "work");
const lockedIn = (page) => [...page.matchAll(/<td class="locked" data-col="([^"]+)"/g)].map((m) => m[1]);
holds(one, '<td class="locked" data-col="first"', "first answer: the column it locked is drawn locked");
holds(one, 'title="the first is the engine\'s"', "first answer: the cell says the engine's reason");
holds(two, '<td class="locked" data-col="second"', "second answer: the column it locked is drawn locked");
const both = lockedIn(one).filter((c) => lockedIn(two).includes(c));
if (both.length === 0 && lockedIn(one).length === 1 && lockedIn(two).length === 1) ok("no column is locked on both pages");
else no("the editor locked for itself: first page " + JSON.stringify(lockedIn(one)) + ", second page " + JSON.stringify(lockedIn(two)));

// FOUR: A COLUMN IS AS WIDE AS THE DECLARATION SAYS, AND NO WIDER THAN NOTHING.
const sidebar = (width) => ({
  name: "quackitect", type: "group", children: [{
    name: "control", type: "group", children: [{
      name: "agents", type: "table", source: "present",
      columns: [{ field: "actor", title: "agent", ...(width ? { width } : {}) }, { field: "title", title: "working on" }],
    }],
  }],
});
const present = { actors: [], hold: { on: false }, present: [{ actor: "main", state: "waiting", holding: "nothing in hand" }] };
const wide = panelHtml(sidebar("34%"), ["control"], {}, present);
const wider = panelHtml(sidebar("50%"), ["control"], {}, present);
const unsaid = panelHtml(sidebar(""), ["control"], {}, present);
const widthOf = (page) => page.match(/<th class="actor"[^>]*style="width:([^"]*)"/)?.[1] ?? "";
if (widthOf(wide) === "34%") ok("a declared width of 34% is drawn on the column");
else no("a declared width of 34% is drawn as " + JSON.stringify(widthOf(wide)));
if (widthOf(wider) === "50%") ok("a declared width of 50% is drawn on the column");
else no("a declared width of 50% is drawn as " + JSON.stringify(widthOf(wider)));
if (widthOf(unsaid) === "") ok("a column with no declared width is drawn with none");
else no("a column with no declared width is drawn " + JSON.stringify(widthOf(unsaid)) + " wide");
// THE COLUMN TAG IS WHAT IS READ, and not the whole page: the stylesheet
// rounds a lamp with a 50% radius, which is not a width and not a column.
holdsNot(wide, 'style="width:50%"', "the first declaration's page carries nothing of the second's");
holdsNot(wider, 'style="width:34%"', "the second declaration's page carries nothing of the first's");

console.log(failed ? `\n${failed} failed.` : "\n0 failed.");
process.exit(failed ? 1 : 0);
