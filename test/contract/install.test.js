// The install script, read as it stands. A binary this tree builds goes stale
// where its own source moves ahead, so the script asks find for a newer file
// before it calls the binary ready.
// [[spec/design_output/index#the-compiler-it-needs]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { rebuilt } from "../../.claude/skills/level0/lib/tools.js";
import { disk } from "../../src/doors/disk.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

test("every binary this tree builds rebuilds when its source moves ahead", () => {
  const said = disk().read(join(root, "src", "scripts", "install.sh"));
  for (const one of ["lsp", "index"]) {
    assert.ok(rebuilt(said).includes(one), `${one} rebuilds off its own age alone`);
  }
});

// The script runs under set -eu before every verb, so a node step it calls carries a fallback line. [[spec/design_output/copilot#setup-and-discovery]]
test("a node step the install calls says a warning where it stops, and the install goes on", () => {
  const said = disk().read(join(root, "src", "scripts", "install.sh"));
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
  assert.ok(at < wants.indexOf("index") && at < wants.indexOf("se-lsp"), "the builds follow the modules");
  assert.match(said, /\[ "\$1" = "go-modules" \]/, "a missing module set stops no verb");
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
