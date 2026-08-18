// EVERY HOOK THE ENGINE SHIPS IS WIRED IN THE CAGE IT SHIPS WITH.
//
// WHY THIS FILE EXISTS. On 2026-08-14 the Stop hook was written into the
// REPOSITORY ROOT's `.claude/settings.json`. Claude Code reads settings from
// the WORKSPACE it opens, which is `project/`, so it was never loaded. The
// hook's own logic was correct and had 14 green tests. It silently passed
// every mid-work stop for a whole session, and it was reported as fixed.
//
// A GREEN SUITE CANNOT TELL YOU WHICH FILE THE HOST OPENED. This one can:
// it reads the shipped cage and asks whether each hook the engine carries is
// named in it.
//
// RUNME PLACES THIS TEMPLATE ON EVERY LAUNCH, with -Force, into
// `project/.claude/settings.json`. So the TEMPLATE is the only durable place
// a hook can be wired — a hand-edit to the placed copy is overwritten by the
// next run.
import { strict as assert } from "node:assert";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = fileURLToPath(new URL("../../..", import.meta.url));
const CAGE = join(REPO_ROOT, "project", "deliverable", "cage", "claude-settings.json");
// THE SECOND PLACE A HOOK CAN BE WIRED, and it is not the cage (i35).
//
// The cage template is placed BY the arrival, so it cannot carry the hook that
// PERFORMS the arrival — a cloud session reads its settings before the cage
// exists. The repository root's own .claude/settings.json is committed, which
// makes it the only file a fresh clone reads at session start.
//
// THE RULE IS UNCHANGED: a hook the host never loads is not a hook. What
// widened is where "loaded" can honestly mean.
const ROOT_SETTINGS = join(REPO_ROOT, ".claude", "settings.json");
const BIN = join(REPO_ROOT, "project", "deliverable", "engine", "bin");

/** The hook scripts the engine ships, derived from the folder rather than
 *  listed here. A new hook joins this answer by existing. */
function shippedHooks(): string[] {
  return readdirSync(BIN)
    .filter((e) => e.startsWith("se-hook-") && e.endsWith(".ts"))
    .sort();
}

describe("the shipped cage", { concurrency: true }, () => {
  test("every hook script the engine ships is wired somewhere a host actually loads", () => {
    const wired = readFileSync(CAGE, "utf8") + readFileSync(ROOT_SETTINGS, "utf8");
    const missing = shippedHooks().filter((h) => !wired.includes(h));
    assert.deepEqual(
      missing,
      [],
      "a hook the host never loads is not a hook — wire it in project/deliverable/cage/claude-settings.json (placed by RUNME every run) or, for a hook that must fire BEFORE the cage exists, in the committed root .claude/settings.json",
    );
  });

  // THE ARRIVAL HOOK IS NAMED EXPLICITLY, for the same reason the Stop hook is:
  // its absence is silent. Without it a cloud session starts uncaged with no
  // lane, which looks exactly like a normal session until the agent reaches for
  // a tool it does not have.
  test("the arrival hook is wired in the ROOT settings, which is the file a fresh clone reads", () => {
    const root = JSON.parse(readFileSync(ROOT_SETTINGS, "utf8")) as { hooks?: { SessionStart?: unknown[] } };
    assert.equal(Array.isArray(root.hooks?.SessionStart), true, "the root settings must wire a SessionStart hook");
    assert.match(JSON.stringify(root.hooks?.SessionStart), /se-hook-arrive\.ts/);
  });

  test("the cage template is the file RUNME places, and it parses", () => {
    const cage = JSON.parse(readFileSync(CAGE, "utf8")) as { hooks?: Record<string, unknown> };
    assert.notEqual(cage.hooks, undefined, "the cage carries the hooks; without them the placed copy has none");

    const runme = readFileSync(join(REPO_ROOT, "RUNME.ps1"), "utf8");
    assert.match(
      runme,
      /cage\\+claude-settings\.json/,
      "RUNME must still place this template — if that line moves, this test is checking a file nobody installs",
    );
  });

  test("the Stop hook is wired, by name, because losing it is silent", () => {
    // NAMED EXPLICITLY as well as covered by the sweep above. The sweep would
    // go quiet if the script were ever renamed AND unwired in the same change,
    // and the Stop hook is the one whose absence nothing else reveals: the
    // agent simply stops mid-work and everything looks normal.
    const cage = JSON.parse(readFileSync(CAGE, "utf8")) as { hooks?: { Stop?: unknown[] } };
    assert.equal(Array.isArray(cage.hooks?.Stop), true, "the cage must wire a Stop hook");
    assert.match(JSON.stringify(cage.hooks?.Stop), /se-hook-stop\.ts/);
  });
});
