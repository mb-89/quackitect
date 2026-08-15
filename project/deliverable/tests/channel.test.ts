// THE CROSSING AND ITS ONE CLAUSE (if-core-satellite).
//
// The channel carries a call down, an answer up, and the lease and the beat
// both ways. The clause it enforces is the naming one, and it is enforced AT
// THE CROSSING on purpose: an answer that came from another process is exactly
// the one a reader cannot check by eye.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { Channel, type Crossing, namesItsStore } from "../engine/channel.ts";
import { Core } from "../engine/core.ts";
import { WATCH } from "../engine/supervisor.ts";
import { anyGuidanceDoc } from "./helpers.ts";

const TRUNK = "/machine";
const SAT_TREE = "/machine/.worktrees/i27-x";
const OWNED = "project/spec/iterations/i27-x/evidence/a.md";

function wired(cross: Crossing): { core: Core; channel: Channel } {
  const core = new Core(TRUNK, 2);
  core.attach({ record: "i27-x", root: SAT_TREE });
  return { core, channel: new Channel(core, cross) };
}

/** A satellite that answers properly, naming the tree it resolved against.
 *  ASYNC, because no real boundary answers on the same tick. */
const honest: Crossing = async (down) => ({ store: SAT_TREE, body: `served ${down.rel}` });

describe("the crossing", { concurrency: true }, () => {
  test("a call the CORE owns never crosses — a crossing bought for nothing is still bought", async () => {
    let crossed = 0;
    const { channel } = wired(async (down) => {
      crossed++;
      return { store: SAT_TREE, body: down.rel };
    });

    const out = await channel.send(anyGuidanceDoc(), {});
    assert.equal(out.from, "core");
    assert.equal(out.store, TRUNK, "the core names its own trunk");
    assert.equal(crossed, 0, "shared method is the core's, so nothing is asked of a satellite");
  });

  test("a call the satellite owns crosses, and the answer names the store it came from", async () => {
    const { channel } = wired(honest);
    const out = await channel.send(OWNED, { some: "payload" });

    assert.equal(out.from, "satellite");
    assert.equal(out.store, SAT_TREE, "the answer says WHICH tree produced it");
    assert.equal(out.satellite?.record, "i27-x");
  });

  test("AN ANSWER THAT NAMES NO STORE IS REFUSED, because nobody could check it", async () => {
    const { channel } = wired(async () => ({ store: "", body: "trust me" }) as never);
    await assert.rejects(() => channel.send(OWNED, {}), /naming its store/, "the clause rides the crossing, not the caller's memory");
  });

  test("the clause reads the same wherever it is applied", () => {
    assert.equal(namesItsStore({ store: SAT_TREE, body: 1 }), true);
    assert.equal(namesItsStore({ store: "   ", body: 1 }), false, "whitespace is not a store");
    assert.equal(namesItsStore(undefined), false);
  });

  test("an unattached record falls back to the core rather than crossing to nowhere", async () => {
    let crossed = 0;
    const { channel } = wired(async (down) => {
      crossed++;
      return { store: SAT_TREE, body: down.rel };
    });

    const out = await channel.send("project/spec/iterations/i99-nobody/evidence/a.md", {});
    assert.equal(out.from, "core");
    assert.equal(crossed, 0);
  });
});

describe("the lease and the beat ride the channel", { concurrency: true }, () => {
  test("a slot is taken and handed back, and a double return invents nothing", () => {
    const { channel } = wired(honest);

    const lease = channel.requestSlot("i27-x");
    assert.equal(lease.granted, true);
    assert.equal(channel.returnSlot(lease.token as number), true);
    assert.equal(channel.returnSlot(lease.token as number), false, "the far side of a crossing cannot invent capacity");
  });

  test("the lease refuses past the count, naming the number so the caller can act", () => {
    const { channel } = wired(honest);
    channel.requestSlot("a");
    channel.requestSlot("b");
    const refused = channel.requestSlot("c");

    assert.equal(refused.granted, false);
    assert.match(String(refused.why), /2 heavy slots/);
  });

  test("the beat declares a wedge at the allowance, which is 600 ms at 200", () => {
    const { channel } = wired(honest);

    assert.equal(channel.beat(1_000, 1_150).state, "alive", "inside one interval nothing is missed");
    const wedged = channel.beat(1_000, 1_000 + WATCH.beatMs * WATCH.allowance);
    assert.equal(wedged.state, "wedged");
    assert.match(String(wedged.why), /allowance/);
  });
});
