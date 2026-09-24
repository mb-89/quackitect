// The routes this tree ships, read off disk. A fixture says what a route does,
// and this case says the shipped file still carries it.
// [[spec/design_output/work#a-successor-stands-on-question]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { skip, test } from "node:test";
import { mintedNote } from "../../.claude/skills/level0/lib/schema-mint.js";
import { readYaml } from "../../.claude/skills/level0/lib/schema.js";
import { voiceOver } from "../../src/bridge/findings.js";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";
import { firstLeaf } from "../../src/engine/group.js";
import { readTools, whereIs } from "../../src/engine/tools.js";
import { askRows, processAt } from "../../src/scripts/process.js";
import { leafOf, stepPathOf } from "../../src/scripts/pull.js";
import { schemasHere } from "../../src/scripts/ticket.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const routeOf = (name) =>
  readYaml(files.read(join(root, "spec", "processes", `${name}.yaml`)));

// A desk mints a successor off this route, and `branch unblock` refuses one opening where an agent works. [[spec/design_output/work#a-successor-stands-on-question]]
test("the question route opens at a step waiting for a person", () => {
  const front = routeOf("question");
  const path = stepPathOf(front);

  assert.equal(path, "answer", "the route opens at its answer step");
  assert.equal(leafOf(front, path)?.by, "person", "and that step waits for a person");
});

const vale = whereIs(files, root, "vale", readTools(files, root));
const ifVale = files.exists(vale) ? test : skip;
const CLEAN = "A line the voice passes.";

// Every route renders a ticket at its mint, and real Vale reads it the way the verbs read an Ask. A line the route writes carries no finding, so no verb meets the door on its first write. [[spec/design_output/pull#the-voice-reads-the-evidence]]
ifVale(
  "a ticket minted off every route under spec/processes draws no finding from the voice rules",
  () => {
    const it = { disk: files, proc: proc(), root, join, vale };
    const names = files
      .list(join(root, "spec", "processes"))
      .filter((one) => one.name.endsWith(".yaml"))
      .map((one) => one.name.replace(/\.yaml$/, ""));
    assert.ok(names.length > 1, "the tree ships its routes");
    const found = [];
    for (const name of names) {
      const held = processAt(files, root, join, name);
      const path = `spec/tickets/${name}-rendered.md`;
      const made = mintedNote(schemasHere(it), {
        kind: "ticket",
        path,
        fields: {
          state: "open",
          process: held.link,
          process_hash: held.hash,
          steps: held.route,
          step: firstLeaf(held.route),
          Ask: [askRows(held.ask), "", CLEAN].join("\n").trim(),
        },
      });
      assert.equal(made.why, undefined, `${name} mints: ${made.why}`);
      const rows = made.text.split("\n");
      for (const one of voiceOver(it, path, made.text)) {
        found.push(`${name}:${one.line} ${one.rule} | ${rows[one.line - 1]}`);
      }
    }
    assert.deepEqual(found, [], "a route writes no line the voice refuses");
  },
);
