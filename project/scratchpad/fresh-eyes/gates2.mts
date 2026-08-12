// FRESH-EYES DEMO, variant — aim at the seeded iteration's FIRST GATE
// (i1/gate-kickoff) and capture its form whole; then one submit+bless
// attempt so the gate's checks answer on the record.
import { buildServer } from "../../deliverable/engine/tools.ts";
import { call, freshRoot, gitInit, proofFor, sessionAtIdle } from "../../deliverable/tests/helpers.ts";

const shrink = (v: unknown): unknown =>
  JSON.parse(JSON.stringify(v, (_k, x) => (typeof x === "string" && x.length > 900 ? `${x.slice(0, 400)} ...[${x.length} chars]` : x)) ?? "null");
const say = (k: string, v: unknown): void => console.log(`\n== ${k}\n${typeof v === "string" ? v : JSON.stringify(shrink(v), null, 1)}`);

const root = freshRoot();
gitInit(root);
const s = await sessionAtIdle(root);
const server = buildServer(root, s);
const seed = await call(server, "se_seed_iteration", {
  goal: "walk one iteration to its first gate",
  vision: "reach a gate form in a scratch product and read it whole",
  update: { op: "update", brief: "fresh-eyes gate walk, third attempt" },
});
say("seeded", seed.body.seeded ?? seed.body);

s.setTarget("iterations");
for (let i = 0; i < 30; i++) {
  const r = await call(server, "se_pull", i % 8 === 7 ? { update: { op: "update", brief: "fresh-eyes gate walk continues" } } : {});
  if (r.isError) {
    say(`container pull ${i} REFUSED`, r.body);
    break;
  }
  const b = r.body as Record<string, unknown>;
  if (b.pull === "read") {
    const doc = b.document as { content: string };
    await call(server, "se_pull", { form: { read: proofFor(doc.content) } });
    continue;
  }
  if ((b.where as string[] | undefined)?.[0]?.includes("i1/")) break;
  if (b.pull === "wait") {
    say(`container pull ${i}: wait`, { at: b.at, why: b.why });
    break;
  }
}
say("standing at", s.active());

for (const target of ["i1/gate-kickoff", "i1/onboard-retro"]) {
  try {
    s.setTarget(target);
    say(`target accepted: ${target}`, true);
    break;
  } catch (e) {
    say(`target ${target} refused`, String(e).split("\n")[0]);
  }
}

let doRepeats = 0;
for (let i = 0; i < 50; i++) {
  const r = await call(server, "se_pull", i % 8 === 7 ? { update: { op: "update", brief: "fresh-eyes gate walk continues" } } : {});
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
  if (b.pull === "fill") {
    say(`pull ${i}: THE FORM, WHOLE (where=${JSON.stringify(b.where)})`, b);
    // One submit+bless attempt so the checks answer on the record.
    const form = (b.form ?? b.template ?? {}) as Record<string, unknown>;
    const filled: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(form)) {
      if (v === null || v === "" || v === undefined) filled[k] = "scratch demonstration evidence — fresh-eyes gate walk";
    }
    filled.submit = true;
    filled.bless = true;
    const sub = await call(server, "se_pull", { form: filled });
    say("submit+bless attempt answered", sub.body);
    break;
  }
  if (b.pull === "choose") {
    say(`pull ${i}: choose`, b.options ?? b.choices);
    const options = (b.options ?? b.choices ?? []) as { to?: string; open?: boolean }[];
    const pick = options.find((o) => o.open !== false);
    if (pick?.to === undefined) break;
    await call(server, "se_pull", { form: { choice: pick.to } });
    continue;
  }
  if (b.pull === "do") {
    const here = (b.here as { id?: string }[] | undefined)?.map((h) => h.id);
    say(`pull ${i}: do at`, { here, where: b.where });
    if (++doRepeats > 10) break;
    continue;
  }
  if (b.pull === "wait") {
    say(`pull ${i}: wait`, { at: b.at, why: b.why, waiting_for: b.waiting_for });
    break;
  }
  say(`pull ${i}: other`, b);
}
say("final position", s.active());
console.log("\nDONE gates2");
process.exit(0);
