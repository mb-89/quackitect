// The rules over the extension's files: the grid, the declaration, the
// buttons, and the packages it reaches.
// [[spec/design_output/extension]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  flatten,
  SCHEMA,
  TRACKED,
  underBuiltIns,
} from "../../.claude/skills/level0/lib/config.js";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";
import { faultsIn as gridFaults } from "../../src/extension/lib/grid.js";
import { commandsOf } from "../../src/extension/lib/panel.js";
import { drawnIn, entriesIn } from "../../src/extension/lib/widgets.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const read = (where) => JSON.parse(files.read(join(root, where)));

// [[spec/design_output/extension#the-grid-check]]
test("the schema this tree ships places every widget in a cell of its own", () => {
  assert.deepEqual(gridFaults(read(SCHEMA)), []);
});

// [[spec/design_output/extension#one-declaration-draws-it]]
test("every control the schema declares draws, the work buttons among them", () => {
  const schema = read(SCHEMA);
  assert.deepEqual(
    drawnIn(schema).map((one) => one.key),
    [
      "stop.hold",
      "ask.wanted",
      "bridge.hook",
      "log.open",
      "work.editor",
      "work.pull",
      "work.new",
      "engine.vehicle",
      "engine.stub",
      "engine.binding",
    ],
  );

  const waiting = entriesIn(schema).filter((one) => one.widget && !one.group);
  assert.deepEqual(waiting, []);
});

// [[spec/design_output/extension#a-click-writes-the-file]]
test("every widget writing a key names one the declaration carries", () => {
  const said = flatten(underBuiltIns(read(SCHEMA), read(TRACKED)));
  for (const one of drawnIn(read(SCHEMA))) {
    if (one.widget === "action" || one.widget === "process") continue;
    assert.ok(said.has(one.key), `${one.key} stands in ${TRACKED}`);
    assert.ok(one.options.includes(said.get(one.key)), `${one.key} rests on an option`);
  }
});

// [[spec/design_output/extension#a-button-names-its-commands]]
test("every slash command a button's hover names stands in .claude/commands", () => {
  const standing = new Set(
    files.list(join(root, ".claude", "commands")).map((one) => one.name),
  );
  const named = drawnIn(read(SCHEMA)).flatMap((one) => commandsOf(one));
  assert.ok(
    named.includes("/se-agent-control-hold-stop"),
    "the hold button names its far end",
  );
  for (const one of named) {
    assert.ok(standing.has(`${one.slice(1)}.md`), `${one} stands as a command`);
  }
  assert.equal(commandsOf({ key: "log.open", widget: "action" }).length, 0);
});

// [[spec/design_output/extension#the-sidebar-draws-the-tree]]
test("npm reaches the extension alone, and the root names no dependency", () => {
  const said = proc().run(["git", "ls-files", "*package.json"], { cwd: root });
  const paths = said.stdout.split(/\r?\n/).filter(Boolean);

  assert.ok(paths.includes("package.json"), "the root names one");
  // A trial's manifest names no dependency, so npm reaches nothing through it. [[spec/design_output/work#an-experiment-decides]]
  for (const path of paths) {
    if (path === "package.json" || /^src\/extension\//.test(path)) continue;
    assert.match(
      path,
      /^\.claude\/skills\/[^/]+\/package\.json$/,
      `${path} stands under the extension or a trial`,
    );
    assert.deepEqual(read(path).dependencies ?? {}, {}, `${path} names no dependency`);
  }

  const bare = read("package.json");
  assert.deepEqual(Object.keys(bare.dependencies ?? {}), []);
  assert.equal(bare.devDependencies, undefined);
});

// [[spec/design_output/extension#the-editor-is-a-door]]
test("the extension imports the editor, its own folder, and what it declares", () => {
  const listed = (...flags) =>
    proc()
      .run(["git", "ls-files", ...flags, "src/extension/**.js"], { cwd: root })
      .stdout.split(/\r?\n/)
      .filter(Boolean);
  // A file the working tree deletes stands in the index until the commit, and imports nothing. [[spec/tickets/the-sidebar-writes-through-actions]]
  const gone = new Set(listed("--deleted"));
  const paths = listed().filter((path) => !gone.has(path));
  assert.ok(paths.length > 5, "the extension carries its modules");

  // The webview bundles its own modules, so its files read its own manifest. [[spec/design_input/the-editor-draws-the-ticket#the-owner-rules]]
  const manifest = (path) =>
    path.startsWith("src/extension/webview/")
      ? "src/extension/webview/package.json"
      : "src/extension/package.json";
  const named = (path, said) =>
    Object.keys(read(manifest(path)).dependencies ?? {}).some(
      (one) => said === one || said.startsWith(`${one}/`),
    );

  for (const path of paths) {
    const text = files.read(join(root, path));
    for (const hit of text.matchAll(/(?:from|require\()\s*["']([^"']+)["']/g)) {
      const said = hit[1];
      if (said === "vscode" || said.startsWith("node:") || named(path, said)) continue;
      assert.match(said, /^\.\.?\//, `${path} imports ${said} as a path of its own`);
      assert.ok(!said.includes("../../"), `${path} stays inside src/extension`);
    }
  }
});

// [[spec/design_output/lsp#one-checker-every-front-asks]]
test("every package the extension declares carries an exact version", () => {
  const webview = read("src/extension/webview/package.json");
  const declared = {
    ...read("src/extension/package.json").dependencies,
    ...webview.dependencies,
    ...webview.devDependencies,
  };
  for (const [name, said] of Object.entries(declared)) {
    assert.match(said, /^\d+\.\d+\.\d+$/, `${name} names one version and no range`);
  }
});

// The brand folder and the stub's template carry no version, so no second copy drifts from package.json. [[spec/design_output/vehicle#one-file-holds-the-version]]
test("no manifest source git holds names a version of its own", () => {
  for (const one of [
    "spec/config/brand/plugin.json",
    "spec/config/brand/marketplace.json",
    "src/stub/.claude/skills/level0/.claude-plugin/plugin.json",
  ]) {
    assert.equal(read(one).version, undefined, one);
  }
});

// Each line under a path of the tree that matches the pattern. [[spec/tickets/branch-scripts-leave]]
function naming(pattern, ...paths) {
  const out = [];
  const walk = (path) => {
    if (path.endsWith(".js")) {
      for (const line of files.read(join(root, path)).split("\n"))
        if (pattern.test(line)) out.push(`${path}: ${line.trim()}`);
      return;
    }
    for (const one of files.list(join(root, path)))
      if (one.kind === "dir" || one.name.endsWith(".js")) walk(join(path, one.name));
  };
  for (const path of paths) walk(path);
  return out;
}

// [[spec/tickets/the-lens-reads-v1]]
test("src/extension/lib names no door.read, door.list, door.imports or door.watch", () => {
  assert.deepEqual(
    naming(/door\.(read|list|imports|watch)/, "src/extension/lib"),
    [],
    "the hosts under src/extension/lib read off the index alone",
  );
});

// [[spec/tickets/the-sidebar-writes-through-actions]]
test("sidebar.js and lib name no door.write or door.append", () => {
  assert.deepEqual(
    naming(/door\.(write|append)/, "src/extension/sidebar.js", "src/extension/lib"),
    [],
    "the sidebar and its hosts write through the index alone",
  );
});
