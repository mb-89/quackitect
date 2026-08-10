// Boot packet shape is a mirror contract, isolated so it does not serialize
// behind the end-to-end boot walks.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { Session } from "../engine/session.ts";
import { freshRoot } from "./helpers.ts";

test("the mirror's packet: exit dictionary, pulled docs WITHOUT hashes, preread hints", async () => {
  const session = new Session(freshRoot());
  await session.advance();
  await session.advance();
  const state = (
    session.packet() as {
      states: {
        exit?: Record<string, { args: string[]; met?: boolean }>;
        pulled?: Record<string, unknown>[];
        lookahead_read?: string[];
        next?: { to: string; entry_read?: string[] }[];
      }[];
    }
  ).states[0];
  assert.deepEqual(Object.keys(state.exit ?? {}), [], "nothing is demanded on the way out any more");
  assert.ok(state.pulled !== undefined && state.pulled.length >= 1, "the pulled guidance rides the packet");
  assert.ok(
    state.pulled?.every((pulled) => !("hash" in pulled)),
    "packets never hand out the hashes",
  );
  assert.ok(
    state.pulled?.every((pulled) => Array.isArray(pulled.sources) && (pulled.sources as string[]).length > 0),
    "every pulled doc says which rule pulled it",
  );
  assert.ok(Array.isArray(state.lookahead_read), "packet carries preread hint field");
  assert.ok(
    (state.next ?? []).some((next) => next.to === "prepare_idle" && Array.isArray(next.entry_read)),
    "each next edge carries its own read requirement list",
  );
});
