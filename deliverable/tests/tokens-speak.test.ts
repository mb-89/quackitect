// A TOKEN SPEAKS WHEN IT IS PUT IN WORK AND WHEN IT COMES OUT (owner).
//
// WHAT THE READER WANTS IN THE LOG is the STATEMENT and the COMMENT the hand
// chose. The feed had no formatter for a work act at all, so it printed the
// bare word `se_work` — a token moved, and nothing about which one or why.
//
// NEITHER HALF IS IN THE ARGUMENTS. A take or a settle sends only an id, and
// the statement lives on the item, so the answer carries it back and the feed
// reads the whole record rather than the arguments alone.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { CallLog } from "../engine/calllog.ts";
import { seDir } from "../engine/paths.ts";
import { feedRows } from "../engine/render.ts";
import { STYLE } from "../engine/renderstyle.ts";
import { freshRoot } from "./helpers.ts";

const SINCE = "1970-01-01T00:00:00.000Z";

function feedOf(entries: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  const log = new CallLog(seDir(freshRoot()));
  for (const e of entries) {
    log.append({
      part: "walker",
      state: "a-state",
      answered_by: "a-model",
      ok: true,
      outcome: "result",
      duration_ms: 0,
      ...e,
    } as Parameters<CallLog["append"]>[0]);
  }
  return feedRows(log, SINCE).rows;
}

describe("a work act writes its own log line", { concurrency: true }, () => {
  test("opening says the name and the detail", () => {
    const [row] = feedOf([
      {
        tool: "se_work",
        args: { act: "open", id: "", comment: "Work coloured in log / the log's work lines take the note colour" },
        response: { opened: "wk-1", statement: "Work coloured in log" },
      },
    ]);
    assert.equal(row.type, "work", "a work act is its own kind, never an ordinary call");
    assert.equal(row.brief, "opened “Work coloured in log” — the log's work lines take the note colour");
  });

  test("starting says the statement and the comment, neither of which the caller sent", () => {
    const [row] = feedOf([
      {
        tool: "se_work",
        args: { act: "take", id: "wk-1", comment: "making token acts write real log lines" },
        response: { took: "wk-1", statement: "Tokens speak in log" },
      },
    ]);
    assert.equal(row.brief, "started “Tokens speak in log” — making token acts write real log lines");
  });

  test("finishing says what happened", () => {
    const [row] = feedOf([
      {
        tool: "se_work",
        args: { act: "settle", id: "wk-1", comment: "the feed had no formatter, so it printed the tool name" },
        response: { settled: "wk-1", statement: "Tokens speak in log", status: "done" },
      },
    ]);
    assert.match(String(row.brief), /^finished “Tokens speak in log” — the feed had no formatter/);
  });

  // A CLOSE THAT IS NOT `done` SAYS SO. Dropped and superseded are different
  // ends, and a reader scanning the log should not have to open the record.
  test("a close that is not done wears its own word", () => {
    const [row] = feedOf([
      {
        tool: "se_work",
        args: { act: "settle", id: "wk-1", comment: "the owner struck it" },
        response: { settled: "wk-1", statement: "Buckets split input output", status: "dropped" },
      },
    ]);
    assert.match(String(row.brief), /^dropped “Buckets split input output”/);
  });

  // THE PERSON'S PRESS IS THE SAME EVENT AS THE AGENT'S CALL. The feed drew one
  // of them as an ordinary call, so half the acts were invisible as work.
  test("the surface's own act reads exactly like the lane's", () => {
    const [row] = feedOf([
      {
        tool: "mirror_work_act",
        args: { work: "wk-1", act: "take", status: "done", comment: "picking this up" },
        response: { ok: true, took: "wk-1", statement: "Header click sorts column" },
      },
    ]);
    assert.equal(row.type, "work");
    assert.equal(row.brief, "started “Header click sorts column” — picking this up");
  });

  test("adding work from the surface says what was added", () => {
    const [row] = feedOf([{ tool: "mirror_work_mint", args: { place: "backlog", slot: "pending", statement: "Stop refused over work" } }]);
    assert.equal(row.type, "work");
    assert.equal(row.brief, "opened “Stop refused over work”");
  });

  // COLOUR CARRIES MEANING. Work wears the note's hue because a work token has
  // replaced the note as the everyday capture, and takes the weight rather than
  // the lean so it reads as an act instead of an aside.
  test("a work line is painted, and from the palette rather than from here", () => {
    assert.match(STYLE, /\.logrow \.lkind\.k-work \{[^}]*var\(--se-feed-kind-work\)/, "the colour is configuration");
    assert.match(STYLE, /\.logrow \.lkind\.k-work \{[^}]*font-weight: 700/, "and it pops");
    assert.ok(!/\.k-work \{[^}]*#[0-9a-f]{3,6}/i.test(STYLE), "no colour is written where it is used");
  });
});
