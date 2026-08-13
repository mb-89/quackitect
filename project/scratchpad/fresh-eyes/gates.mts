// FRESH-EYES DEMO — desk to gate: seed an iteration from idle, AIM at it,
// walk until a gate form arrives, and capture that form WHOLE (the evidence
// form itself is what adjudication must see). Autonomy 1, so blessing is
// sanctioned. Every pull answer is recorded raw; a refusal is data.
import { Session } from "../../deliverable/engine/session.ts";
import { buildServer } from "../../deliverable/engine/tools.ts";
import { call, freshRoot, gitInit, proofFor, sessionAtIdle } from "../../deliverable/tests/helpers.ts";

const shrink = (v: unknown): unknown =>
  JSON.parse(JSON.stringify(v, (_k, x) => (typeof x === "string" && x.length > 700 ? `${x.slice(0, 300)} ...[${x.length} chars]` : x)) ?? "null");
const say = (k: string, v: unknown): void => console.log(`\n== ${k}\n${typeof v === "string" ? v : JSON.stringify(shrink(v), null, 1)}`);

const root = freshRoot();
gitInit(root);
const s = await sessionAtIdle(root);
const server = buildServer(root, s);
say("position", s.active());

const seed = await call(server, "se_seed_iteration", {
  goal: "walk one iteration to its first gate",
  vision: "reach a gate form in a scratch product and read it whole",
  update: { op: "update", brief: "fresh-eyes gate demonstration" },
});
say("se_seed_iteration", seed.body);
if (seed.isError) {
  console.log("\nDONE gates (seed refused)");
  process.exit(0);
}
const seededId = String((seed.body as Record<string, unknown>).seeded ?? "");

// THE AIM — the person's hand sets the target to the seeded iteration.
try {
  s.setTarget(seededId);
  say(`target set to ${seededId}`, true);
} catch (e) {
  say("setTarget on the iteration id REFUSED", String(e));
  s.setTarget("iterations");
  say("target set to the container instead", true);
}

let gateSeen = false;
for (let i = 0; i < 80 && !gateSeen; i++) {
  const r = await call(server, "se_pull");
  if (r.isError) {
    say(`pull ${i} REFUSED`, r.body);
    break;
  }
  const b = r.body as Record<string, unknown>;
  if (b.pull === "read") {
    const doc = b.document as { path: string; content: string };
    const proof = await call(server, "se_pull", { form: { read: proofFor(doc.content) } });
    if (proof.isError) {
      say(`proof for ${doc.path} REFUSED`, proof.body);
      break;
    }
    continue;
  }
  if (b.pull === "choose") {
    const options = (b.options ?? b.choices ?? []) as { to?: string; open?: boolean }[];
    say(`pull ${i}: choose — the offer`, options);
    const pick =
      options.find((o) => typeof o.to === "string" && (o.to.includes(seededId) || /iteration|kickoff|gate/i.test(o.to)) && o.open !== false) ??
      options.find((o) => o.open !== false);
    if (pick?.to === undefined) {
      say("no open door to take", b);
      break;
    }
    say(`taking the door: ${pick.to}`, true);
    const c = await call(server, "se_pull", { form: { choice: pick.to } });
    if (c.isError) say("choice REFUSED", c.body);
    continue;
  }
  if (b.pull === "fill") {
    const form = (b.form ?? b.template ?? {}) as Record<string, unknown>;
    const here = JSON.stringify(b.here ?? b.where ?? "");
    const isGate = "bless" in form || /gate/i.test(here) || /"bless"/.test(JSON.stringify(b).slice(0, 3000));
    if (isGate) {
      gateSeen = true;
      say(`pull ${i}: THE GATE FORM, whole (here=${here})`, b);
      break;
    }
    say(`pull ${i}: fill at ${here} — form keys`, Object.keys(form));
    const filled: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(form)) {
      if (v === null || v === "" || v === undefined) filled[k] = "scratch demonstration evidence — fresh-eyes gate walk";
    }
    filled.submit = true;
    const f = await call(server, "se_pull", { form: filled });
    if (f.isError) {
      say(`fill at ${here} REFUSED (recorded, stopping)`, f.body);
      break;
    }
    say(`fill at ${here} accepted`, { where: (f.body as Record<string, unknown>).where });
    continue;
  }
  if (b.pull === "do") {
    say(`pull ${i}: do — landed at`, { here: shrink(b.here), where: b.where });
    continue;
  }
  if (b.pull === "wait") {
    say(`pull ${i}: wait`, { where: b.where, at: b.at, why: b.why, waiting_for: b.waiting_for });
    break;
  }
  say(`pull ${i}: other`, b);
}
say("final position", s.active());
console.log("\nDONE gates");
process.exit(0);
