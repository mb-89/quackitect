// FRESH-EYES DEMO — the hand-walk floor: at autonomy 0 the agent's pull
// waits and nothing moves; the person's hand (the human channel) advances.
import { Session } from "../../deliverable/engine/session.ts";
import { checkDocs, freshRoot, gitInit, sessionAtIdle } from "../../deliverable/tests/helpers.ts";

const shrink = (v: unknown): unknown =>
  JSON.parse(JSON.stringify(v, (_k, x) => (typeof x === "string" && x.length > 600 ? `${x.slice(0, 250)} ...[${x.length} chars]` : x)) ?? "null");
const say = (k: string, v: unknown): void => console.log(`\n== ${k}\n${typeof v === "string" ? v : JSON.stringify(shrink(v), null, 1)}`);

const root = freshRoot();
gitInit(root);
const s = await sessionAtIdle(root);
say("position at start", s.active());
const p1 = s.packet() as Record<string, unknown>;
say("packet header at autonomy 1 (tier and autonomy fields)", { tier: p1.tier, autonomy: p1.autonomy, where: p1.where });

say("setAutonomy(0)", s.setAutonomy(0));
const p0 = s.packet() as Record<string, unknown>;
say("packet header at blocked", { tier: p0.tier, autonomy: p0.autonomy });

s.setTarget("front_desk");
say("target set (the person's aim): front_desk from idle", true);

const r1 = (await s.pull()) as Record<string, unknown>;
say("agent pull 1 at blocked", r1);
const pos1 = s.active();
const r2 = (await s.pull()) as Record<string, unknown>;
say("agent pull 2 at blocked", { pull: r2.pull, at: r2.at, why: r2.why });
say("position across the two agent pulls (must be unchanged)", { pos1, pos2: s.active() });

// THE PERSON'S HAND — the mirror's human channel (mirror.ts POSTs
// state.session.pull(body, "human"); no autonomy gate on that channel).
// Their proof-of-read is the CHECKBOX (humanCheck), not the tail quote.
checkDocs(s);
say("the person checked the owed reading (humanCheck per doc)", true);
const rh = (await s.pull({}, "human")) as Record<string, unknown>;
say("human-channel pull after the checkboxes", rh);
say("position after the person's act", s.active());
const rh2 = (await s.pull({}, "human")) as Record<string, unknown>;
say("human-channel pull 2", { pull: rh2.pull, where: rh2.where, at: rh2.at, why: rh2.why, do: rh2.do });
say("position after the person's second act", s.active());

// And the agent still waits for anything above the dial.
const r3 = (await s.pull()) as Record<string, unknown>;
say("agent pull after the person's acts", { pull: r3.pull, where: r3.where, at: r3.at, why: r3.why });
say("final position", s.active());
console.log("\nDONE handwalk");
