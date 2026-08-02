// THE PULL — the law it exists to keep.
//
// BLOCKING IS AN INSTRUCTION RETURNED, NOT AN ERROR (v2 §6). A threshold or
// an unmet condition is the machine knowing what should happen next, and it
// is said rather than thrown.
//
// So these cases are about what does NOT throw. A pull that refuses where
// it should instruct is the whole bug class coming back, and it would come
// back silently, because a rejection looks like working code.
//
// SMALL FILE ON PURPOSE (owner ruling 2026-07-30). Every case here builds a
// session at idle and that costs a full boot walk, so the pull cases are
// split across three files by theme — one file carrying all of them was the
// slowest thing in the suite. See guidance/software.md.
import { strict as assert } from "node:assert";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { Session } from "../engine/session.ts";
import { freshRoot, readEverything, sessionAtIdle } from "./helpers.ts";

const root = (): string => freshRoot(mkdtempSync(join(tmpdir(), "se-pull-")));

describe("the pull instructs where a refusal would have thrown", { concurrency: true }, () => {
  test("unread guidance comes back as `read`, not as a rejection", async () => {
    const s = new Session(root());
    const r = (await s.pull()) as Record<string, unknown>;
    assert.equal(r.pull, "read");
    assert.ok((r.remaining as number) > 0, "boot owes documents, and the pull must say how many stand behind this one");
    assert.ok(r.document !== undefined, "the document rides the answer");
    assert.match(String(r.do), /form/, "and the instruction says how to prove it");
  });

  test("a step above the slider comes back as `wait`, naming the step and the person", async () => {
    const s = await sessionAtIdle(root());
    s.setAutonomy(0.4);
    s.setTarget("overhaul"); // weighs 1 — the heaviest door idle has
    const r = (await s.pull()) as Record<string, unknown>;
    assert.equal(r.pull, "wait", "THE LAW: a threshold is an instruction, never a throw");
    assert.equal(r.waiting_for, "the person");
    assert.equal(r.at, "overhaul", "the agent must be able to say WHICH step waits");
    assert.match(String(r.why), /above the session autonomy 0\.4/);
    assert.match(String(r.do), /slider alone cannot wake you/, "and that a message is what resumes it");
  });

  test("the slider is weighed BEFORE the reading, so a forbidden step owes nothing", async () => {
    // Order matters, and it was wrong once: reading first sent the agent
    // through several documents to prepare for a step it was never allowed
    // to take, and only then told it to stop.
    const s = await sessionAtIdle(root());
    s.setAutonomy(0.4);
    s.setTarget("overhaul"); // its entry demands method/overhaul.md
    const r = (await s.pull()) as Record<string, unknown>;
    assert.equal(r.pull, "wait", "the wall comes first — nothing is owed for a step that is not the agent's");
    assert.equal("documents" in r, false);
  });

  test("the same step at a slider that allows it simply walks", async () => {
    const s = new Session(root());
    s.setAutonomy(1);
    s.setTarget("front_desk");
    // The answer that STOPS the reading is the one that walks. Pulling again
    // to look at it throws the walk away.
    const r = await readEverything(s);
    assert.equal(r.pull, "do");
    assert.deepEqual(s.active(), ["front_desk"]);
  });
});
