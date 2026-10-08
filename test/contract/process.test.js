// Every route this tree ships mints a ticket the voice passes, through the real
// Vale and Go's vetoes. The route shapes the verbs read stand in Go, under
// src/pull/routes_test.go.
// [[spec/design_output/pull#the-voice-reads-the-evidence]]

import assert from "node:assert/strict";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { disk } from "../../src/doors/disk.js";
import { proc } from "../../src/doors/proc.js";
import MINTED_GOLDEN from "../../src/quack/testdata/minted.golden.json" with { type: "json" };
import { at, keptOf, PAST, REFUSES, rulesIn } from "./ruled.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = disk();
const ruled = rulesIn(root);

// Every route's minted ticket, as the Go mint writes it into the golden TestEveryShippedRouteMintsItsGolden holds, so one Vale run reads them all. [[spec/tickets/schema-libs-leave]]
const routes = MINTED_GOLDEN.map((one) => one.route);
const minted = new Map(MINTED_GOLDEN.map((one) => [one.route, one.text]));

// Every route renders a ticket at its mint, and real Vale reads it the way the verbs read an Ask: the rows past the tense reader, at a severity that refuses. A line the route writes carries no finding, so no verb meets the door on its first write. [[spec/design_output/pull#the-voice-reads-the-evidence]]
ruled.ifVale(
  "a ticket minted off every route draws no finding from the voice rules, in one Vale run",
  ruled.proves(
    Object.fromEntries(
      routes.map((name) => [
        name,
        at(minted.get(name), `spec/tickets/${name}-rendered.md`),
      ]),
    ),
    ({ found, text }) => {
      assert.ok(routes.length > 1, "the tree ships its routes");
      const faults = [];
      for (const name of routes) {
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
