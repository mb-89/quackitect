// The install script, read as it stands. A binary this tree builds goes stale
// where its source moves, so the script asks after its source before it calls
// the binary ready.
// [[spec/design_output/index#the-compiler-it-needs]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";
import { FETCHING } from "./fetching.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const SETUP = join(root, "src", "quack", "setup_verb.go");
const INSTALL = join(root, "install.sh");

// The setup's wants, read off the Go verb, which names each under want. [[spec/tickets/box-verbs-port-to-go]]
const WANTS = [
  ...disk()
    .read(SETUP)
    .matchAll(/^\s*want:\s+"([\w-]+)",$/gm),
].map((one) => one[1]);

// The verbs run on Node, and the install runs none of it, so a box brings Node with the verbs. [[spec/tickets/install-drops-node]]
test("the install names no node", () => {
  const said = disk().read(INSTALL);
  assert.deepEqual(said.match(/node/gi) ?? [], []);
});

// The steps that run JavaScript stand behind the setup verb, which the install reaches through the index. [[spec/tickets/install-drops-node]]
test("the install hands its JavaScript steps to the setup verb, and goes on where it stops", () => {
  const rows = disk()
    .read(INSTALL)
    .split("\n");
  const at = rows.findIndex((row) =>
    /\$index" verb "\$root\/src\/scripts" setup/.test(row),
  );
  assert.ok(at >= 0, "the script runs the setup verb through the index binary");
  assert.match(
    `${rows[at]}\n${rows[at + 1] ?? ""}`,
    /\|\|\s*\n?\s*say /,
    "the setup carries a fallback line, so a refusal stops no verb",
  );
  assert.match(
    disk().read(SETUP),
    /registerBox\("setup", /,
    "the verb registers in the index",
  );
  assert.ok(WANTS.length > 0, "the verb names its wants");
});

// The modules land after Go and before the builds, so the first check fetches nothing, and a skip names the want. [[spec/tickets/the-install-fetches-go-modules]]
test("the install fetches the Go modules as a want, after go and before the builds", () => {
  const said = disk().read(INSTALL);
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
    .read(INSTALL)
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

// A vehicle case skips every want past the box, so the skip list names each one the install and the setup reach. [[spec/tickets/fetching-skip-list-stale]]
test("the skip list names every want of the install and the setup, and nothing else", () => {
  const said = disk().read(INSTALL);
  const list = /^for one in (.+?)\s*\\\n\s*(.+?); do/m.exec(said);
  const wants = [...`${list[1]} ${list[2]}`.split(/\s+/), ...WANTS];
  assert.deepEqual(FETCHING.split(" ").sort(), wants.sort());
});

// A box with no index hears the install that builds it, and the road runs no program of its own. [[spec/tickets/setup-road-without-index]] [[spec/tickets/scripts-folder-leaves]]
test("a box with no index names the install that builds it, and starts no program", () => {
  const text = disk().read(join(root, "RUNME.sh"));
  const row = text.split("\n").find((one) => /No quack binary stands/.test(one));
  assert.ok(row, "the road names the missing binary");
  assert.match(row, /sh install\.sh/, "the line names the install that builds the index");
  assert.doesNotMatch(text, /exec node|src\/scripts\/verbs/, "the road starts no node program");
});

// The index builds with Go alone. [[spec/design_output/index#the-compiler-it-needs]]
test("the install downloads no Zig", () => {
  const said = disk().read(INSTALL);
  assert.doesNotMatch(said, /zig/i);
  assert.doesNotMatch(said, /CGO_ENABLED=1|sqlite_fts5/);
});
