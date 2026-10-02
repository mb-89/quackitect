// The install script, read as it stands. A binary this tree builds goes stale
// where its source moves, so the script asks after its source before it calls
// the binary ready.
// [[spec/design_output/index#the-compiler-it-needs]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  VALE_LS_RELEASES,
  VALE_LS_VERSION,
  valeLsAsset,
} from "../../.claude/skills/level0/lib/servers.js";
import { rebuilt } from "../../.claude/skills/level0/lib/tools.js";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";

const goHere = () => {
  try {
    return proc().run(["go", "version"]).exitCode === 0;
  } catch {
    return false;
  }
};

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

test("every binary this tree builds rebuilds when its source moves ahead", () => {
  const said = disk().read(join(root, "src", "scripts", "install.sh"));
  for (const one of ["front", "index"]) {
    assert.ok(
      rebuilt(said).includes(one),
      `${one} never rebuilds when its source moves`,
    );
  }
});

// The verbs run on Node, and the install runs none of it, so a box brings Node with the verbs. [[spec/tickets/install-drops-node]]
test("the install names no node", () => {
  const said = disk().read(join(root, "src", "scripts", "install.sh"));
  assert.deepEqual(said.match(/node/gi) ?? [], []);
});

// The steps that run JavaScript stand behind the setup verb, which the install reaches through the index. [[spec/tickets/install-drops-node]]
test("the install hands its JavaScript steps to the setup verb, and goes on where it stops", () => {
  const rows = disk().read(join(root, "src", "scripts", "install.sh")).split("\n");
  const at = rows.findIndex((row) => /\$index" verb "\$root\/src\/scripts" setup/.test(row));
  assert.ok(at >= 0, "the script runs the setup verb through the index binary");
  assert.match(
    `${rows[at]}\n${rows[at + 1] ?? ""}`,
    /\|\|\s*\n?\s*say /,
    "the setup carries a fallback line, so a refusal stops no verb",
  );
  assert.ok(disk().exists(join(root, "src", "scripts", "verbs", "setup.js")), "the verb stands");
});

// The shell spells the asset table servers.js owns, because a shell script imports nothing. [[spec/design_output/editor#the-asset-matrix]]
test("the vale-ls assets the install spells match the ones servers.js names", () => {
  const said = disk().read(join(root, "src", "scripts", "install.sh"));
  assert.match(said, new RegExp(`^vale_ls_version=${VALE_LS_VERSION.replaceAll(".", "\\.")}$`, "m"));
  assert.ok(said.includes(VALE_LS_RELEASES), "the script downloads from the releases servers.js names");
  const rows = [...said.matchAll(/^\s*(\w+)-([\w-]+)\)\s+target=(\S+) ;;$/gm)];
  assert.equal(rows.length, 6, "the script names every platform servers.js names");
  for (const [, os, arch, target] of rows) {
    assert.equal(`vale-ls-${target}.zip`, valeLsAsset(os, arch), `${os} ${arch}`);
  }
});

// The stamp keys on every file the build reads, so a move in a package the binary imports rebuilds it. [[spec/design_output/lsp#the-build-beside-the-index]]
test("the source stamp reads fresh after a stamp, and stale once a source the build reads changes", { skip: !goHere() && "no go here" }, () => {
  const files = disk();
  const tree = files.tempDir("go-stamp-");
  try {
    const script = join(tree, "src", "scripts", "go-stamp.sh");
    for (const one of ["scripts", "quack", "q"]) files.makeDir(join(tree, "src", one));
    files.write(script, files.read(join(root, "src", "scripts", "go-stamp.sh")));
    files.write(join(tree, "go.mod"), "module stamped\n\ngo 1.24\n");
    files.write(join(tree, "src", "quack", "main.go"), 'package main\n\nimport "stamped/src/q"\n\nfunc main() { q.Do() }\n');
    files.write(join(tree, "src", "q", "q.go"), "package q\n\nfunc Do() {}\n");
    const stamp = (verb) => proc().run(["sh", script, verb, "se-index"], { cwd: tree }).exitCode;
    assert.equal(stamp("fresh"), 1, "no stamp reads stale");
    assert.equal(stamp("stamp"), 0, "the stamp lands");
    assert.equal(stamp("fresh"), 0, "the stamp reads fresh");
    files.write(join(tree, "src", "q", "q.go"), "package q\n\nfunc Do() { _ = 1 }\n");
    assert.equal(stamp("fresh"), 1, "a change in an imported package reads stale");
  } finally {
    files.remove(tree);
  }
});

// The setup runs under set -eu before every verb, so a node step it calls carries a fallback line. [[spec/design_output/copilot#setup-and-discovery]]
test("a node step the setup calls says a warning where it stops, and the setup goes on", () => {
  const said = disk().read(join(root, "src", "scripts", "setup.sh"));
  const rows = said.split("\n");
  for (const one of ["copilot.js", "brand.js"]) {
    const at = rows.findIndex((row) => /^node /.test(row) && row.includes(one));
    assert.ok(at >= 0, `the script calls ${one}`);
    assert.match(
      `${rows[at]}\n${rows[at + 1] ?? ""}`,
      /\|\|\s*\n?\s*say /,
      `${one} carries a fallback line, so a refusal stops no verb`,
    );
  }
});

// The modules land after Go and before the builds, so the first check fetches nothing, and a skip names the want. [[spec/tickets/the-install-fetches-go-modules]]
test("the install fetches the Go modules as a want, after go and before the builds", () => {
  const said = disk().read(join(root, "src", "scripts", "install.sh"));
  const list = /^for one in (.+?)\s*\\\n\s*(.+?); do/m.exec(said);
  assert.ok(list, "the script loops over its wants");
  const wants = `${list[1]} ${list[2]}`.split(/\s+/);
  const at = wants.indexOf("go-modules");
  assert.ok(at > wants.indexOf("go"), "the modules follow Go");
  assert.ok(
    at < wants.indexOf("index") && at < wants.indexOf("se-front"),
    "the builds follow the modules",
  );
  assert.match(
    said,
    /\[ "\$1" = "go-modules" \]/,
    "a missing module set stops no verb",
  );
  assert.match(said, /go mod download/, "the want fetches each module");
});

// A verb runs the script first, so a line it says on a warm tree lands before every answer. [[spec/design_output/log#one-verb-reads-the-log]]
test("both announcement lines wait on a missing want, so a warm tree runs silent", () => {
  const rows = disk()
    .read(join(root, "src", "scripts", "install.sh"))
    .split("\n")
    .map((row) => row.trim());

  const opens = rows.findIndex((row) => /^say "Installing/.test(row));
  const ready = rows.findIndex((row) => /say "Ready\./.test(row));
  assert.ok(opens > 0 && ready > 0, "the script says both lines");

  assert.match(
    rows[opens - 1],
    /^if \[ -n "\$missing" \]/,
    "the opening line stands inside the block a missing want opens",
  );
  assert.match(
    rows[ready],
    /^\[ -n "\$missing" \] && say "Ready\./,
    "the closing line carries the same test on its own row",
  );
});

// The browser is a want, so a box with no browser still runs every verb, and the drawing ships in git, so the install bundles none. [[spec/design_output/drawing#the-drawing-ships-prebuilt]]
test("the setup resolves a browser as a want, and bundles no drawing", () => {
  const said = disk().read(join(root, "src", "scripts", "setup.sh"));
  const list = /^for one in (.+?); do/m.exec(said);
  const wants = list[1].split(/\s+/);
  assert.ok(wants.includes("browser"), "the loop names browser");
  assert.ok(!wants.includes("drawing"), "the loop names no drawing");
  assert.match(said, /\[ "\$1" = "browser" \]/, "a missing browser stops no verb");
  assert.doesNotMatch(said, /bundle\.js/, "no step bundles the drawing");
  assert.match(said, /node src\/scripts\/browser\.js/, "the want asks the resolver");
});

// The index builds with Go alone. [[spec/design_output/index#the-compiler-it-needs]]
test("the install downloads no Zig", () => {
  const said = disk().read(join(root, "src", "scripts", "install.sh"));
  assert.doesNotMatch(said, /zig/i);
  assert.doesNotMatch(said, /CGO_ENABLED=1|sqlite_fts5/);
});
