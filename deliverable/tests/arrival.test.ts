// THE ARRIVAL'S OWN GUARDS — el-arrival, minted by i35.
//
// WHAT THIS FILE IS FOR. An arrival that fails must never look like one that
// succeeded, because the dangerous state is an agent holding native tools while
// believing it is caged. That is req-the-arrival-never-costs-the-session, and
// its failure is SILENT by nature: nothing throws, nothing is red, the agent
// simply has a tool it should not have.
//
// SMALL FILES ON PURPOSE (owner ruling, 2026-07-30): this theme gets its own
// file. See guidance/craft/software.md.
//
// NOTHING HERE STARTS A LANE. Raising a lane is a spawn, a port and a wait, and
// a suite that does that per case pays it every run for a branch two other
// files already cover. What is checked here is everything the arrival decides
// BEFORE it spawns, plus the shape of what it hands back.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));
const ARRIVE = join(REPO_ROOT, "deliverable", "engine", "bin", "se-arrive.ts");
const HOOK = join(REPO_ROOT, "deliverable", "engine", "bin", "se-hook-arrive.ts");

/** A root that looks like a product but holds no lane and no git remote. */
function rootWithNoLane(): string {
  const root = mkdtempSync(join(tmpdir(), "se-arrival-"));
  const cage = join(root, "deliverable", "cage");
  mkdirSync(cage, { recursive: true });
  // The templates the cage step places. Contents do not matter here — that they
  // are COPIED VERBATIM does, and the next case proves it.
  writeFileSync(join(cage, "mcp.json"), '{"mcpServers":{"se":{"command":"node"}}}\n');
  writeFileSync(join(cage, "claude-settings.json"), '{"permissions":{"deny":["Bash","Read","Write"]}}\n');
  // A floor no runtime satisfies, so the run stops at the runtime step and
  // never reaches the install or the spawn.
  writeFileSync(join(root, "deliverable", "package.json"), JSON.stringify({ engines: { node: ">=999.0.0" } }));
  return root;
}

/** Run se-arrive against a throwaway root and hand back everything it said. */
function arrive(root: string, extra: string[] = []): { out: string; status: number | null } {
  // Port 0 disables nothing here, so an unused high port keeps a stray probe
  // from finding some other process and calling it our lane.
  const r = spawnSync(process.execPath, [ARRIVE, "--root", root, "--mirror-port", "7999", ...extra], { encoding: "utf8", cwd: root });
  assert.equal(r.error, undefined, `se-arrive could not be started: ${String(r.error)}`);
  return { out: `${r.stdout ?? ""}${r.stderr ?? ""}`, status: r.status };
}

describe("the arrival", { concurrency: true }, () => {
  // req-the-declared-runtime-floor-is-read-never-edited.
  //
  // THE FLOOR IS READ, AND THE FILE THAT DECLARES IT IS NOT TOUCHED. Editing
  // engines.node to go green turns a loud failure into a silent one, and the
  // next box then runs an engine the project never claimed to support.
  test("a runtime below the declared floor stops the arrival, and the declaration is left alone", () => {
    const root = rootWithNoLane();
    const before = readFileSync(join(root, "deliverable", "package.json"), "utf8");

    const { out, status } = arrive(root);

    assert.match(out, /^runtime: FAILED/m, "the runtime step fails by name");
    assert.match(out, />=999\.0\.0/, "the refusal names the floor it read");
    assert.match(out, new RegExp(process.version.replace(/\./g, "\\.")), "and the version it is running");
    assert.notEqual(status, 0, "the arrival itself exits non-zero — it is the HOOK that must not");

    const after = readFileSync(join(root, "deliverable", "package.json"), "utf8");
    assert.equal(after, before, "the declaration is not edited to make the step pass");
  });

  // A stopped arrival must not leave a half-placed cage. The cage step runs
  // after the runtime step for exactly this reason: a cage placed beside a
  // lane that never came up is the shape of a silent failure.
  test("an arrival that stops at the runtime places no cage", () => {
    const root = rootWithNoLane();
    arrive(root);
    assert.equal(existsSync(join(root, ".mcp.json")), false, "no lane config is left behind");
    assert.equal(existsSync(join(root, ".claude", "settings.json")), false, "no deny list is left behind");
  });

  // req-the-arrival-never-costs-the-session. THIS IS THE ONE WHOSE FAILURE IS
  // SILENT, so it is pinned hardest: the hook must exit 0 even when the arrival
  // under it exits non-zero, and it must SAY that the arrival did not complete.
  //
  // A hook that ends a session start is worse than the hand-work it replaces.
  test("the hook survives an arrival that fails, and says so", () => {
    const root = rootWithNoLane();
    // SE_ARRIVE_ROOT, NOT cwd. The hook derives its root from its own location
    // on purpose, so cwd does not move it — and the first version of this case
    // therefore ran the arrival against the REAL repository, placed a cage
    // there and started a second lane beside the one the walk was using. It
    // went green anyway, because a real product passes the runtime step.
    //
    // A CASE THAT PASSES BY TESTING THE WRONG TREE IS WORSE THAN NO CASE. The
    // override exists for this, and it is the only thing that uses it.
    const r = spawnSync(process.execPath, [HOOK], {
      encoding: "utf8",
      cwd: root,
      env: { ...process.env, SE_ARRIVE_ROOT: root, SE_MIRROR_PORT: "7999" },
    });
    const said = `${r.stdout ?? ""}${r.stderr ?? ""}`;
    assert.equal(r.status, 0, `the hook must exit 0 whatever happened; it said: ${said}`);
    assert.match(said, /\[se\]/, "the hook speaks under its own mark");
    assert.match(said, /ARRIVAL DID NOT COMPLETE/, "and it says the arrival failed rather than falling silent");
    assert.match(said, /cloud-runner\.md/, "pointing at the card an uncaged agent then needs");
  });

  // The opt-out exists so a developer's own machine, where the editor owns the
  // lane, does not get a second one started under it. It must be LOUD: a silent
  // skip reads exactly like a successful arrival.
  test("SE_NO_ARRIVE skips the hook, and says that it skipped", () => {
    const r = spawnSync(process.execPath, [HOOK], { encoding: "utf8", cwd: REPO_ROOT, env: { ...process.env, SE_NO_ARRIVE: "1" } });
    const said = `${r.stdout ?? ""}${r.stderr ?? ""}`;
    assert.equal(r.status, 0);
    assert.match(said, /skipped/, "the skip is announced, never silent");
    assert.match(said, /SE_NO_ARRIVE/, "and it names the switch that caused it, so nobody hunts for it");
  });

  // Every step prints `<step>: <what happened>`, which is se-start's own shape.
  // The account IS the whole record on a box nobody is watching, so a step that
  // says nothing is a step that did not happen as far as anybody can tell.
  test("every step accounts for itself in the same shape", () => {
    const root = rootWithNoLane();
    const { out } = arrive(root);
    const steps = out
      .split("\n")
      .map((l) => /^([a-z]+): /.exec(l)?.[1])
      .filter((s): s is string => s !== undefined);
    assert.ok(steps.includes("refs"), `the refs step reports even with no remote; got ${JSON.stringify(steps)}`);
    assert.ok(steps.includes("runtime"), "the runtime step reports");
  });

  // req-every-ref-the-corpus-cites-resolves-on-arrival, the half that can be
  // checked without a remote: a fetch that cannot succeed must DEGRADE rather
  // than stop. A silent degradation is what let i15 cite a branch that was
  // never there, so the report is the requirement.
  test("an unreachable remote degrades the refs step and stops nothing", () => {
    const root = rootWithNoLane();
    const { out } = arrive(root);
    const refs = out.split("\n").find((l) => l.startsWith("refs:"));
    assert.ok(refs !== undefined, "the refs step reports even when it could do nothing");
    assert.doesNotMatch(refs, /^refs: FAILED/, "a fetch that does not succeed is not fatal");
    // The walk carried on to the next step, which is the whole claim.
    assert.match(out, /^runtime: /m, "and the arrival continued past it");
  });
});
