// WHERE A SATELLITE RUNS, as a setting the person flips.
//
// ONE ARCHITECTURE, THREE TRANSPORTS. The core, the satellite and the channel
// are always there; only the crossing changes. That is what makes three modes
// a setting rather than three products (owner ruling 2026-08-14).
import { strict as assert } from "node:assert";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { DEFAULT_MODE, MODE_HELP, modeForRun, modeWasChosen, RUN_MODES, readMode, writeMode } from "../engine/mode.ts";
import { seDir } from "../engine/paths.ts";
import { Session } from "../engine/session.ts";
import { freshRoot } from "./helpers.ts";

const root = (): string => mkdtempSync(join(tmpdir(), "se-mode-"));

describe("the run mode", { concurrency: true }, () => {
  test("PROCESS is the default, and nothing has to be written for it", () => {
    const r = root();
    assert.equal(DEFAULT_MODE, "process");
    assert.equal(readMode(r), "process");
    assert.equal(modeWasChosen(r), false, "the surface must be able to say 'default' rather than 'chosen'");
  });

  test("all three transports are offered, most isolated first", () => {
    // The order is the offer order: cost and safety move together down it.
    assert.deepEqual(RUN_MODES, ["process", "thread", "inline"]);
  });

  test("every mode carries one line of help, so a surface needs no source", () => {
    for (const m of RUN_MODES) {
      assert.equal(typeof MODE_HELP[m], "string");
      assert.notEqual(MODE_HELP[m], "", `${m} must say what it costs`);
    }
  });

  test("a choice is remembered, and reads back as chosen", () => {
    const r = root();
    writeMode(r, "thread");
    assert.equal(readMode(r), "thread");
    assert.equal(modeWasChosen(r), true);
    writeMode(r, "inline");
    assert.equal(readMode(r), "inline");
  });

  test("a nonsense value is REFUSED at the write, not stored and puzzled over later", () => {
    const r = root();
    assert.throws(() => writeMode(r, "fused" as never), /unknown run mode/);
    assert.equal(modeWasChosen(r), false, "a refused write leaves nothing behind");
  });

  test("an unreadable file answers the DEFAULT rather than throwing", () => {
    // A setting that can stop the engine starting is worse than one that is
    // occasionally ignored.
    const r = root();
    writeMode(r, "thread");
    writeFileSync(join(seDir(r), "mode.json"), "{ this is not json", "utf8");
    assert.equal(readMode(r), "process");
  });

  test("a file holding a value nobody recognises also answers the default", () => {
    const r = root();
    writeMode(r, "thread");
    writeFileSync(join(seDir(r), "mode.json"), JSON.stringify({ mode: "quantum" }), "utf8");
    assert.equal(readMode(r), "process");
  });

  test("a launch argument WINS for one run and does not overwrite the choice", () => {
    // A one-off measurement run must not silently change what the person set.
    const r = root();
    writeMode(r, "thread");
    assert.equal(modeForRun(r, "inline"), "inline", "the argument decides this run");
    assert.equal(readMode(r), "thread", "and the stored choice is untouched");
  });

  test("no argument falls back to the stored choice", () => {
    const r = root();
    writeMode(r, "inline");
    assert.equal(modeForRun(r), "inline");
    assert.equal(modeForRun(r, ""), "inline", "an empty argument is no argument");
  });

  test("an unknown launch argument is refused loudly", () => {
    assert.throws(() => modeForRun(root(), "turbo"), /unknown run mode/);
  });
});

// THE WALK HAS TWO ANSWERS ABOUT THE MODE, and a surface that carried one
// could not be right about both. `--mode` decides THIS run and deliberately
// leaves the stored choice alone, so the two differ whenever a flag was typed.
//
// The packet says `mode` for what is running and `stored` for what the next
// launch takes. Before this split it reported the stored value as though it
// were the live boundary, which is a lie exactly when the flag was used.
describe("the mode a walk reports", { concurrency: true }, () => {
  test("the packet says what is RUNNING, and separately what is stored", () => {
    const r = freshRoot();
    writeMode(r, "thread");
    const s = new Session(r);
    s.noteRunningMode("inline");
    const p = s.packet() as { run: { mode: string; stored: string } };
    assert.equal(p.run.mode, "inline", "the boundary this walk actually crosses");
    assert.equal(p.run.stored, "thread", "and the choice the next launch takes");
  });

  test("with no launch flag, what runs IS the stored choice", () => {
    const r = freshRoot();
    writeMode(r, "thread");
    assert.equal(new Session(r).runningMode(), "thread");
  });

  // THE CONTROL SOME HOSTS ONLY HAVE. The VS Code extension launches from a
  // fixed .mcp.json with no command line, so --mode never reaches it.
  test("the mirror's control stores the choice and says a restart applies it", () => {
    const r = freshRoot();
    const s = new Session(r);
    s.noteRunningMode("process");
    const out = s.setRunMode("thread");
    assert.equal(out.mode, "thread");
    assert.equal(out.was, "process");
    assert.equal(out.applies, "on the next launch", "a boundary cannot move under a walk in flight");
    assert.equal(readMode(r), "thread", "and the next launch reads it");
  });

  test("choosing the mode already running promises no restart", () => {
    const r = freshRoot();
    const s = new Session(r);
    s.noteRunningMode("thread");
    assert.equal(s.setRunMode("thread").applies, "already running");
  });

  test("an unknown mode is refused, and the refusal names the three that exist", () => {
    const s = new Session(freshRoot());
    assert.throws(() => s.setRunMode("fused"), /process, thread, inline/);
  });
});
