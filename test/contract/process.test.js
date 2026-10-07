// Every route this tree ships mints a ticket the voice passes, through the real
// Vale and Go's vetoes. The route shapes the verbs read stand in Go, under
// src/pull/routes_test.go.
// [[spec/design_output/pull#the-voice-reads-the-evidence]]

import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { processHash, readYaml, schemasFrom } from "../../.claude/skills/level0/lib/schema.js";
import { mintedNote } from "../../.claude/skills/level0/lib/schema-mint.js";
import { disk } from "../../src/doors/disk.js";
import { fakeFront } from "../../src/doors/fake/front.js";
import { firstLeaf } from "../../src/engine/group.js";
import { proc } from "../../src/doors/proc.js";
import { at, keptOf, PAST, REFUSES, rulesIn } from "./ruled.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const ruled = rulesIn(root);
const CLEAN = "A line the voice passes.";
const folder = (...parts) => join(root, "spec", ...parts);

// Every schema the tree ships, by the kind each governs. [[spec/design_output/schema]]
const schemas = schemasFrom(
  files
    .list(folder("schemas"))
    .filter((one) => one.kind === "file" && one.name.endsWith(".yaml"))
    .map((one) => ({ text: files.read(folder("schemas", one.name)) })),
);

// The ask rows a mint writes, one comment a field, as AskRows in src/pull/process.go writes them. [[spec/design_input/the-agent-pulls-tickets#evidence-has-a-form]]
const askRows = (ask) =>
  [ask ?? []]
    .flat()
    .filter((one) => one?.name)
    .map((one) => `<!-- ${one.name}, as ${one.form ?? "text"}: ${one.says ?? ""} -->`)
    .join("\n");

// Every route's minted ticket, declared up front, so one Vale run reads them all. [[spec/design_output/doors#one-contract-test-per-door]]
const routes = files
  .list(folder("processes"))
  .filter((one) => one.name.endsWith(".yaml"))
  .map((one) => one.name.replace(/\.yaml$/, ""));
const minted = new Map(
  routes.map((name) => {
    const held = readYaml(files.read(folder("processes", `${name}.yaml`)));
    const route = [held.steps ?? []].flat();
    const made = mintedNote(
      schemas,
      {
        kind: "ticket",
        path: `spec/tickets/${name}-rendered.md`,
        fields: {
          state: "open",
          process: `spec/processes/${name}`,
          process_hash: processHash(held),
          steps: route,
          step: firstLeaf(route),
          Ask: [askRows(held.ask), "", CLEAN].join("\n").trim(),
        },
      },
      fakeFront(),
    );
    return [name, made];
  }),
);

// Every route renders a ticket at its mint, and real Vale reads it the way the verbs read an Ask: the rows past the tense reader, at a severity that refuses. A line the route writes carries no finding, so no verb meets the door on its first write. [[spec/design_output/pull#the-voice-reads-the-evidence]]
ruled.ifVale(
  "a ticket minted off every route draws no finding from the voice rules, in one Vale run",
  ruled.proves(
    Object.fromEntries(
      routes.map((name) => [
        name,
        at(minted.get(name).text ?? "", `spec/tickets/${name}-rendered.md`),
      ]),
    ),
    ({ found, text }) => {
      assert.ok(routes.length > 1, "the tree ships its routes");
      const faults = [];
      for (const name of routes) {
        const made = minted.get(name);
        assert.equal(made.why, undefined, `${name} mints: ${made.why}`);
        const rows = text(name).split("\n");
        const past = keptOf({ disk: files, proc: proc(), root }, text(name), found(name), PAST);
        for (const one of past) {
          if (!REFUSES.has(one.severity)) continue;
          faults.push(`${name}:${one.line} ${one.rule} | ${rows[one.line - 1]}`);
        }
      }
      assert.deepEqual(faults, [], "a route writes no line the voice refuses");
      assert.equal(ruled.spawned(), 1, "one Vale run reads every route");
    },
  ),
);
