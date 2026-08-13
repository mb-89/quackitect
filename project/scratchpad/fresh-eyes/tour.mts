// FRESH-EYES DEMO — the tour's live sources: the method card composes the
// tour from what stands THIS MINUTE. Each stop's source is observed live.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildServer } from "../../deliverable/engine/tools.ts";
import { call, freshRoot, gitInit, sessionAtIdle } from "../../deliverable/tests/helpers.ts";

const shrink = (v: unknown): unknown =>
  JSON.parse(JSON.stringify(v, (_k, x) => (typeof x === "string" && x.length > 500 ? `${x.slice(0, 200)} ...[${x.length} chars]` : x)) ?? "null");
const say = (k: string, v: unknown): void => console.log(`\n== ${k}\n${typeof v === "string" ? v : JSON.stringify(shrink(v), null, 1)}`);

const root = freshRoot();
gitInit(root);
const s = await sessionAtIdle(root);
const server = buildServer(root, s);
say("position", s.active());

// Stop 1 source — the drawing and the walk's position, live from the session.
const p = s.packet() as Record<string, unknown>;
say("packet header (position, tier — what the mirror draws)", { where: p.where, tier: p.tier, autonomy: p.autonomy });

// Stop 2 source — the machinery as it stands: the survey.
try {
  const sv = await import("../../deliverable/engine/survey.ts");
  say("survey module exports", Object.keys(sv));
  const fn = (sv as Record<string, unknown>).survey as ((r: string) => unknown) | undefined;
  if (fn !== undefined) say("survey(root) — containers and doors, live", fn(root));
} catch (e) {
  say("survey THREW", String(e));
}

// Stop 3 source — records standing (a fresh root: the honest empty shelf).
try {
  const its = await import("../../deliverable/engine/iterations.ts");
  say("iterations standing", (its as { itList: (r: string) => unknown }).itList(root));
} catch (e) {
  say("itList THREW", String(e));
}

// Stop 4 source — the rigor matrix, read live.
try {
  const rm = (await import("../../deliverable/engine/rigor-matrix.ts")) as Record<string, unknown>;
  const read = rm.readRigorMatrix as ((r: string) => unknown) | undefined;
  if (read !== undefined) {
    const m = read(root) as Record<string, unknown>;
    const rows = (m.rows ?? m.steps ?? m.lines ?? []) as unknown[];
    say("rigor matrix live read", { keys: Object.keys(m), row_count: Array.isArray(rows) ? rows.length : "(not an array)" });
  } else {
    say("rigor-matrix exports", Object.keys(rm));
  }
} catch (e) {
  say("readRigorMatrix THREW", String(e));
}

// The tour's finger — se_panel ping lights a surface in every open mirror.
const ping = await call(server, "se_panel", { ping: "front-desk" });
say("se_panel ping (the tour's finger)", ping.body);

// Stop 6 — the tour ends at the desk: the live offer.
const offer = await call(server, "se_pull");
say("the offer the tour ends on (no-goal pull)", offer.body);

// The method card itself, from the live copy this root serves.
const tourDoc = readFileSync(join(root, "project", "guidance", "method", "tour.md"), "utf8");
say("tour method says 'dial'", tourDoc.includes("dial"));
say("tour method still says 'slider'", tourDoc.toLowerCase().includes("slider"));
say("tour method demands generation from live state", tourDoc.includes("Never describe from memory"));
console.log("\nDONE tour");
