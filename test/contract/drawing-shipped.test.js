// The drawing ships in git, so a fresh clone opens the webview with no build,
// and its banner holds it to the sources it reads.
// [[spec/design_output/drawing#the-drawing-ships-prebuilt]]

import assert from "node:assert/strict";
import { basename, dirname, join, relative } from "node:path";
import { test } from "node:test";
import { disk } from "../../src/doors/disk.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { proc } from "../../src/doors/proc.js";
import * as bundled from "../../src/scripts/bundle.js";

const { OUT } = bundled;
const files = disk();
const root = join(import.meta.dirname, "..", "..");
const folder = relative(root, dirname(OUT)).split("\\").join("/");

test("git tracks the drawing the inset loads, off the extension's own folder", () => {
  const said = proc().run(["git", "ls-files", folder], { cwd: root });
  const tracked = said.stdout.split(/\r?\n/).filter(Boolean);
  const script = basename(OUT);
  const style = script.replace(/\.mjs$/, ".css");
  // The page's declaration stands beside the bundle it names. [[spec/design_output/doors#a-door-declares-what-it-owns]]
  const declared = `${folder}/owns.yaml`;
  assert.deepEqual(tracked.sort(), [`${folder}/${script}`, `${folder}/${style}`, declared].sort());
  assert.match(folder, /^src\/extension\//, "the drawing stands inside the extension");
  const inset = files.read(join(root, "src", "extension", "editor-inset.js"));
  assert.match(inset, new RegExp(`"${script.replace(".", "\\.")}"`), "the inset names the script");
  assert.match(inset, /context\.extensionUri,\s*DRAWING/, "the inset reads it off the extension");
});

test("the shipped drawing's banner names the hash of the sources it reads", () => {
  const first = files.read(OUT).split("\n")[0];
  assert.equal(first, `// sources ${bundled.stampOf?.(files)}`, "run node src/scripts/bundle.js");
});

// The stamp reads every source, so a moved source asks for the bundle again. [[spec/design_output/drawing#the-drawing-ships-prebuilt]]
test("the stamp moves when a source under the webview moves", () => {
  const entry = bundled.ENTRY;
  const lock = join(bundled.WEBVIEW, "package-lock.json");
  const tree = (text) => fakeDisk({ [entry]: text, [lock]: "{}" });
  assert.notEqual(bundled.stampOf(tree("one")), bundled.stampOf(tree("two")));
  assert.equal(bundled.stampOf(tree("one")), bundled.stampOf(tree("one")));
});
