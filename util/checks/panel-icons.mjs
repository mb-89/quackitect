// THE PANEL DRAWS MARKS, NOT NAMES. A control names an icon, and the panel has
// to resolve it before it draws. It reads util/parameters.json itself rather
// than asking the engine, so it needs the table itself too, and this is the
// check that it does.
//
//   node .se/scratchpad/panel-icons.mjs <root>
import { execFileSync } from "node:child_process";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.argv[2] ?? ".";
// The bundler lives beside the extension it builds, so it is loaded from there.
const dir = mkdtempSync(join(tmpdir(), "panel-"));
const here = join(root, "src", "extension");
const { build } = await import(pathToFileURL(join(here, "node_modules", "esbuild", "lib", "main.js")).href);
await build({
  entryPoints: [join(here, "panel.ts")],
  bundle: true, format: "esm", outdir: dir, logLevel: "silent", outExtension: { ".js": ".mjs" },
});
const { panelHtml } = await import(pathToFileURL(join(dir, "panel.mjs")).href);

const raw = readFileSync(join(root, "util/parameters.json"), "utf8");
const icons = JSON.parse(readFileSync(join(root, "util/icons.json"), "utf8"));

// The tree the panel is handed, resolved the way the extension resolves it.
const tree = JSON.parse(raw);
const drawn = (name) => icons[name]?.glyph ?? name;
const draw = (n) => {
  if (n.label) n.label = drawn(n.label);
  for (const k of Object.keys(n.labels ?? {})) n.labels[k] = drawn(n.labels[k]);
  for (const c of n.children ?? []) draw(c);
};
draw(tree);
// WHICH GROUPS THE PANEL SHOWS IS THE ENGINE'S, and it is asked rather than
// worked out here. A second copy of that list drifts the first time one moves.
const exe = join(root, ".bin", process.platform === "win32" ? "se.exe" : "se");
const shown = JSON.parse(execFileSync(exe, ["--config", "--work", root], { encoding: "utf8" }))
  .value["panel.shown"];

const html = panelHtml(tree, shown, icons);

// Every name the declaration uses, so a control added later is checked too.
const names = new Set();
const collect = (n) => {
  if (n.label) names.add(n.label);
  for (const v of Object.values(n.labels ?? {})) names.add(v);
  for (const c of n.children ?? []) collect(c);
};
collect(JSON.parse(raw));

let bad = 0;
const say = (what, ok) => {
  if (!ok) bad++;
  console.log((ok ? "ok   " : "FAIL ") + " panel: " + what);
};
// A CHECK THAT FINDS NOTHING TO CHECK REFUSES. This loops over the names the
// declaration uses, so an empty set ran no assertion at all and printed zero
// failed. It is the only stand-in for the sidebar on the owner's screen, and a
// stand-in that cannot fail is not a stand-in.
say("the declaration names an icon to check", names.size > 0);
say("the table declares an icon to check it against",
  Object.keys(icons).filter((k) => !k.startsWith("$")).length > 0);

for (const name of [...names].sort()) {
  if (!icons[name]) {
    say(name + " is declared in util/icons.json", false);
    continue;
  }
  say(name + " draws as a mark and not as a word",
    !new RegExp(">\\s*" + name + "\\s*<").test(html));
  say(name + " draws " + icons[name].glyph, html.includes(icons[name].glyph));
}
console.log("\n" + bad + " failed.");
process.exit(bad ? 1 : 0);
