// THE CROSSINGS, and the rule that stops the fastest one cheating.
//
// Inline is allowed to be FASTER than a process or a thread. It is not allowed
// to be LAXER. A crossing that handed back a live reference would work inline
// and fail the moment somebody switched transport, and the failure would land
// on whoever flipped the setting rather than on whoever wrote the shortcut.
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, test } from "node:test";
import { Channel } from "../engine/channel.ts";
import { Core } from "../engine/core.ts";
import { gitLaneFor, Satellite } from "../engine/satellite.ts";
import { inlineCrossing, marshal } from "../engine/transports.ts";

const RECORD = "project/spec/iterations/i27-x";
const OWNED = "project/spec/iterations/i27-x/evidence/a.md";

/** A satellite standing on a tree that holds one override. */
function servingSatellite(): Satellite {
  const tree = mkdtempSync(join(tmpdir(), "se-xport-"));
  const abs = join(tree, RECORD, "delta", "project/deliverable/engine/session.ts");
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, "the record's own engine", "utf8");

  const sat = new Satellite("i27-x", tree, RECORD);
  sat.start(gitLaneFor(tree, "v3", () => ({ ok: true, stdout: "", stderr: "" })));
  return sat;
}

function wired(): { core: Core; channel: Channel; sat: Satellite } {
  const sat = servingSatellite();
  const core = new Core("/machine", 2);
  core.attach({ record: sat.record, root: sat.tree });
  const channel = new Channel(core, inlineCrossing(new Map([[sat.record, sat]])));
  return { core, channel, sat };
}

describe("marshalling", { concurrency: true }, () => {
  test("a marshalled value is a COPY, never the thing that was handed in", () => {
    const live = { store: "/tree", body: { deep: { n: 1 } } };
    const crossed = marshal(live);
    assert.deepEqual(crossed, live, "the value survives");
    assert.notEqual(crossed, live, "and it is not the same object");
    assert.notEqual(crossed.body.deep, live.body.deep, "nor is anything inside it");
  });

  test("what a boundary could not carry does not survive, which is the point", () => {
    // A process boundary drops these whether you meant it to or not. Inline
    // has to drop them too, or it passes what the others would refuse.
    const withFn = marshal({ store: "/tree", body: { keep: 1, fn: () => 1 } } as unknown as { body: Record<string, unknown> });
    assert.equal(withFn.body.keep, 1);
    assert.equal(withFn.body.fn, undefined, "a function cannot cross, and inline must not pretend it can");
  });
});

describe("the inline crossing", { concurrency: true }, () => {
  test("a record's own path crosses and comes back naming the store", async () => {
    const { channel, sat } = wired();
    const out = await channel.send(OWNED, {});

    assert.equal(out.from, "satellite");
    assert.equal(out.store, sat.tree, "the answer says WHICH tree produced it");
  });

  test("the record's own copy wins, and trunk answers for what it did not change", async () => {
    const { channel } = wired();

    const own = await channel.send("project/spec/iterations/i27-x/delta.md", {});
    assert.equal(own.from, "satellite", "a record path routes to its satellite");

    // A method path is the core's, so it never crosses at all.
    const shared = await channel.send("project/deliverable/engine/paths.ts", {});
    assert.equal(shared.from, "core");
  });

  test("the answer is a COPY, so nothing inline hands out a live reference", async () => {
    const { channel } = wired();
    const a = await channel.send(OWNED, {});
    const b = await channel.send(OWNED, {});

    assert.deepEqual(a.body, b.body, "the same call answers the same");
    assert.notEqual(a.body, b.body, "and never with the same object twice");
  });

  test("a call for a record nothing serves is refused, not answered emptily", async () => {
    const sat = servingSatellite();
    const core = new Core("/machine", 2);
    // The core knows of a record the crossing has no satellite for — the exact
    // disagreement a split can produce, and it must be loud.
    core.attach({ record: "i99-ghost", root: "/nowhere" });
    const channel = new Channel(core, inlineCrossing(new Map([[sat.record, sat]])));

    await assert.rejects(() => channel.send("project/spec/iterations/i99-ghost/evidence/a.md", {}), /no satellite is attached/);
  });

  test("a stopped satellite refuses rather than serving a half-levelled tree", async () => {
    const tree = mkdtempSync(join(tmpdir(), "se-xport-"));
    const abs = join(tree, RECORD, "delta", "project/deliverable/engine/session.ts");
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, "an override that will not reconcile", "utf8");

    const sat = new Satellite("i27-x", tree, RECORD);
    sat.start(
      gitLaneFor(tree, "v3", (args) => ({
        ok: args[0] !== "merge",
        stdout: "CONFLICT (content): Merge conflict in session.ts",
        stderr: "",
      })),
    );
    assert.equal(sat.serving(), false, "a partial levelling never serves");

    const core = new Core("/machine", 2);
    core.attach({ record: sat.record, root: sat.tree });
    const channel = new Channel(core, inlineCrossing(new Map([[sat.record, sat]])));

    await assert.rejects(() => channel.send(OWNED, {}), /not serving/);
  });
});
