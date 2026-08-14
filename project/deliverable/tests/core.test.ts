// THE CORE'S THREE POSSESSIONS (dsp-core-and-satellite, el-core): the routing
// table, the ledgers, and the heavy-slot lease.
//
// Nothing here starts a process. The core's state is injected, so the two
// decisions it owns — who answers a path, and who may spawn a heavy child —
// are tested before either process exists. supervisor.ts set that pattern
// with GitLane and levelRecordTree.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { APPENDED_DIRECTLY, CORE_LEDGERS, Core } from "../engine/core.ts";
import { anyGuidanceDoc } from "./helpers.ts";

const TRUNK = "/machine";
const GUIDE = anyGuidanceDoc();

/** A core with room for two heavy children, and one satellite attached. */
function coreWithSatellite(): Core {
  const core = new Core(TRUNK, 2);
  core.attach({ record: "i27-x", root: "/machine/.worktrees/i27-x" });
  return core;
}

describe("the routing table", { concurrency: true }, () => {
  test("shared method and session state are the core's own", () => {
    const core = coreWithSatellite();
    for (const rel of [GUIDE, "project/deliverable/engine/session.ts", ".se/HANDOVER.md"]) {
      const r = core.route(rel);
      assert.equal(r.to, "core", `${rel} belongs to the machine`);
      assert.match(r.why, /core/, "a routing that cannot say why is one nobody can check");
    }
  });

  test("a record's own path routes to the satellite that owns it", () => {
    const core = coreWithSatellite();
    const r = core.route("project/spec/iterations/i27-x/evidence/a.md");
    assert.equal(r.to, "satellite");
    assert.equal(r.satellite?.record, "i27-x");
    assert.equal(r.satellite?.root, "/machine/.worktrees/i27-x");
  });

  test("an unattached record falls back to the core, and the answer says so", () => {
    const core = coreWithSatellite();
    const r = core.route("project/spec/iterations/i99-nobody/evidence/a.md");
    assert.equal(r.to, "core", "with nothing attached there is nowhere else to send it");
    assert.match(r.why, /i99-nobody/, "the fallback names the record it could not route");
  });

  test("attaching a record twice REPLACES, because a record has exactly one owner", () => {
    const core = coreWithSatellite();
    core.attach({ record: "i27-x", root: "/machine/second" });
    assert.equal(core.attached().length, 1, "a stale entry routing to a dead process is worse than none");
    assert.equal(core.route("project/spec/iterations/i27-x/evidence/a.md").satellite?.root, "/machine/second");
  });

  test("detach answers the satellite that went, and routing falls back after it", () => {
    const core = coreWithSatellite();
    assert.equal(core.detach("i27-x")?.root, "/machine/.worktrees/i27-x");
    assert.equal(core.detach("i27-x"), undefined, "detaching twice invents nothing");
    assert.equal(core.route("project/spec/iterations/i27-x/evidence/a.md").to, "core");
  });
});

describe("the ledgers", { concurrency: true }, () => {
  test("the core names the ledgers it owns, so who-owns-what is read rather than inferred", () => {
    const core = coreWithSatellite();
    for (const led of CORE_LEDGERS) assert.equal(core.ownsLedger(led), true, `${led} is machine-wide and single`);
    assert.equal(core.ownsLedger("project/spec/iterations/i27-x/evidence/a.md"), false);
  });

  test("the call log is the exception: appended directly, never routed", () => {
    // if-satellite-to-account. A log that depends on the core being reachable
    // loses exactly the entries written when something is wrong.
    assert.equal((CORE_LEDGERS as readonly string[]).includes(APPENDED_DIRECTLY), true, "it is still the core's ledger");
  });

  test("a backslash path is the same ledger, because Windows hands one over", () => {
    const core = coreWithSatellite();
    assert.equal(core.ownsLedger(".se\\calls.jsonl"), true);
  });
});

describe("the heavy-slot lease", { concurrency: true }, () => {
  test("the lease grants up to the count and then refuses, naming the number", () => {
    const core = coreWithSatellite();
    assert.equal(core.freeSlots(), 2);
    assert.equal(core.takeSlot("i27-x").granted, true);
    assert.equal(core.takeSlot("i28-y").granted, true);
    const refused = core.takeSlot("i29-z");
    assert.equal(refused.granted, false);
    assert.match(String(refused.why), /2 heavy slots/, "a refusal nobody can act on is a diagnosis");
    assert.equal(core.freeSlots(), 0);
  });

  test("a returned slot frees capacity, and a double return cannot invent any", () => {
    const core = coreWithSatellite();
    const lease = core.takeSlot("i27-x");
    assert.equal(core.freeSlots(), 1);
    assert.equal(core.giveSlot(lease.token as number), true);
    assert.equal(core.freeSlots(), 2);
    assert.equal(core.giveSlot(lease.token as number), false, "a token nobody holds buys nothing");
    assert.equal(core.freeSlots(), 2);
  });

  test("the holders are NAMED, which is the answer a stuck machine needs", () => {
    const core = coreWithSatellite();
    core.takeSlot("i28-y");
    core.takeSlot("i27-x");
    assert.deepEqual(core.slotHolders(), ["i27-x", "i28-y"], "a count says how stuck, never who by");
  });

  test("a core with no heavy slots refuses every lease rather than throwing", () => {
    const core = new Core(TRUNK, 0);
    assert.equal(core.takeSlot("i27-x").granted, false);
    assert.equal(core.freeSlots(), 0);
  });
});
