// Naming the layer that ended a call (tsp-interrupted-call-names-the-stopping-layer).
//
// SMALL FILES ON PURPOSE. See guidance/craft/software.md.
import { strict as assert } from "node:assert";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { recordLifecycle } from "../engine/lifecycle.ts";
import { stoppingLayer } from "../engine/stopping-layer.ts";

const BEFORE = "2000-01-01T00:00:00.000Z";

function root(): string {
  return mkdtempSync(join(tmpdir(), "se-stoplayer-"));
}

describe("an interrupted call names the layer that ended it", () => {
  test("a recorded exit says the server, and cites the line", () => {
    const r = root();
    recordLifecycle(r, "exit", "1");
    const d = stoppingLayer(r, BEFORE);
    assert.equal(d.layer, "server");
    assert.match(d.evidence, /exit 1/);
    assert.notEqual(d.why, "");
  });

  test("a client reset with no exit says the transport, because the process outlived the socket", () => {
    const r = root();
    recordLifecycle(r, "listening", "port=7333");
    recordLifecycle(r, "client-reset", "ECONNRESET");
    const d = stoppingLayer(r, BEFORE);
    assert.equal(d.layer, "transport");
    assert.match(d.evidence, /client-reset/);
  });

  test("a recorded veto says the stop hook", () => {
    const r = root();
    recordLifecycle(r, "stop-block", "do at iterations/i36/build-steps");
    assert.equal(stoppingLayer(r, BEFORE).layer, "stop-hook");
  });

  test("an exit outranks a reset — the conclusive evidence wins, not the likely story", () => {
    const r = root();
    recordLifecycle(r, "client-reset", "ECONNRESET");
    recordLifecycle(r, "exit", "0");
    assert.equal(stoppingLayer(r, BEFORE).layer, "server");
  });

  test("nothing recorded says unknown, and names no layer at all", () => {
    const d = stoppingLayer(root(), BEFORE);
    assert.equal(d.layer, "unknown");
    assert.equal(d.evidence, "", "an unknown verdict must not cite something");
    assert.match(d.why, /nothing observed/);
  });

  test("events from before the call are not evidence about it", () => {
    const r = root();
    recordLifecycle(r, "exit", "0");
    // The call began after everything on record.
    const d = stoppingLayer(r, "2999-01-01T00:00:00.000Z");
    assert.equal(d.layer, "unknown", "an older exit cannot have ended a later call");
  });

  test("a missing log is unknown rather than an error", () => {
    assert.equal(stoppingLayer(join(tmpdir(), "se-no-such-root-at-all"), BEFORE).layer, "unknown");
  });
});
