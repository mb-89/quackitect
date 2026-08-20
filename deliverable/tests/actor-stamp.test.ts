// THE ACTOR IS RECORDED, NEVER DERIVED — req-the-actor-is-recorded-where-the-call-is-served,
// and the writer's half it depends on, req-acts-carry-role-and-channel.
//
// WHAT THIS FILE IS FOR. The feed's actor column was reconstructed at render
// time from the tool's NAME. A new server-side tool read as a person until
// somebody edited a hand-kept list, and nothing on the surface said the column
// was a guess. i34's retro measured it wrong for 52 records in one window.
//
// THE FALLBACK IS NOT THE DEFECT. A record written before the stamp existed
// carries no role, and reading the prefix for exactly those is right. What is
// refused is deriving a role for a record that HAS one.
//
// NOTHING HERE IS CAST. The append objects are written as plain literals on
// purpose: excess-property checking is what makes the first case red before
// the record type declares `actor`, and an `as` assertion would suppress
// exactly that — the case would then pass against no design at all.
import { strict as assert } from "node:assert";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { CallLog } from "../engine/calllog.ts";
import { seDir } from "../engine/paths.ts";
import { feedRows } from "../engine/render.ts";
import { freshRoot } from "./helpers.ts";

function logIn(root: string): CallLog {
  return new CallLog(seDir(root));
}

const base = { args: {}, ok: true, outcome: "result" as const, duration_ms: 1 };

test("a record carries the acting role the handler stated", () => {
  const log = logIn(freshRoot());
  const rec = log.append({ ...base, tool: "se_pull", actor: "agent" });
  assert.equal(rec.actor, "agent", "the stamp survives the append, and the record type declares it");
});

test("the feed reads the role from the record, not from the tool name", () => {
  const log = logIn(freshRoot());
  // A LANE-NAMED TOOL SERVED FOR A PERSON. The prefix rule says agent; the
  // record says human, and the record is the one that was there.
  log.append({ ...base, tool: "se_pull", actor: "human" });
  const { rows } = feedRows(log, "1970-01-01T00:00:00.000Z");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].src, "human", "the stamp wins over the prefix");
});

test("a mirror-named tool stamped as the server's own is neither person nor agent", () => {
  const log = logIn(freshRoot());
  log.append({ ...base, tool: "mirror_reload", actor: "ui" });
  const { rows } = feedRows(log, "1970-01-01T00:00:00.000Z");
  assert.equal(rows[0].src, "ui", "a server-side act says so, without anyone editing a list of names");
});

test("a record with no stamp still reads, because history cannot be restamped", () => {
  const log = logIn(freshRoot());
  log.append({ ...base, tool: "mirror_autonomy" });
  log.append({ ...base, tool: "se_pull" });
  const { rows } = feedRows(log, "1970-01-01T00:00:00.000Z");
  assert.deepEqual(
    rows.map((r) => r.src),
    ["human", "agent"],
    "the prefix rule survives as the fallback for unstamped records only",
  );
});

// THE RATCHET. `actor` is OPTIONAL on the record, because history carries none
// — so the twelfth append site compiles without one and reads back through the
// guess, which is the exact defect this row was minted for, one tool later.
// Nothing in the type can catch that, so the count is held here.
const ENGINE = fileURLToPath(new URL("../engine/", import.meta.url));

function sourcesUnder(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return e.name === "editors" || e.name === "machines" ? sourcesUnder(p) : [];
    return e.name.endsWith(".ts") ? [p] : [];
  });
}

test("every call-record append in the engine states its actor", () => {
  const unstamped: string[] = [];
  for (const file of [...sourcesUnder(ENGINE), ...sourcesUnder(join(ENGINE, "bin"))]) {
    const src = readFileSync(file, "utf8");
    // Each append's own object literal, up to the call's closing brace. A
    // record is one object, so the first `})` after the opening ends it.
    for (const [i, tail] of src.split(".append({").entries()) {
      if (i === 0) continue;
      const body = tail.slice(0, tail.indexOf("})"));
      if (!body.includes("actor:")) unstamped.push(`${file.slice(ENGINE.length)}: ${body.split("\n")[0].trim()}`);
    }
  }
  assert.deepEqual(unstamped, [], `every append states who acted — these do not:\n${unstamped.join("\n")}`);
});
