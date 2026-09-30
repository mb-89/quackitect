// The bridge against the shared hold case table, which the Go door answers
// alike. The table holds the bridge's own answers, so a drift reads here first.
// [[spec/tickets/cage-call-holds-port]]

import assert from "node:assert/strict";
import { test } from "node:test";
import TABLE from "../replay/cage/call-holds-cases.json" with { type: "json" };
import { answerOf } from "./call-holds-box.js";

for (const one of TABLE.cases) {
  test(`the bridge answers the shared hold case: ${one.name}`, async () => {
    const said = await answerOf(one);
    assert.equal(said.decision, one.decision);
    assert.equal(said.text, one.text ?? "");
  });
}
