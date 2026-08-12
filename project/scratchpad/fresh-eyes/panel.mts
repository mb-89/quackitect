// FRESH-EYES DEMO — the panel's served surfaces on a scratch root: the page,
// the rungs (live from scale.md), the packet header, the tour's finger
// against a listening mirror, and the agentless resume.
import { CallLog } from "../../deliverable/engine/calllog.ts";
import { startMirror } from "../../deliverable/engine/mirror.ts";
import { seDir } from "../../deliverable/engine/paths.ts";
import { Session } from "../../deliverable/engine/session.ts";
import { buildServer } from "../../deliverable/engine/tools.ts";
import { call, freshRoot, gitInit } from "../../deliverable/tests/helpers.ts";

const shrink = (v: unknown): unknown =>
  JSON.parse(JSON.stringify(v, (_k, x) => (typeof x === "string" && x.length > 600 ? `${x.slice(0, 250)} ...[${x.length} chars]` : x)) ?? "null");
const say = (k: string, v: unknown): void => console.log(`\n== ${k}\n${typeof v === "string" ? v : JSON.stringify(shrink(v), null, 1)}`);

const root = freshRoot();
gitInit(root);
const session = new Session(root);
const PORT = 7461;
const server = startMirror({ session, root, port: PORT, log: new CallLog(seDir(root)), mode: "agent" });
await new Promise((r) => server.on("listening", r));
const port = (server.address() as { port: number }).port;
say("mirror listening on", port);
const get = (p: string) => fetch(`http://127.0.0.1:${port}${p}`);

const page = await (await get("/")).text();
say("panel HTML served, bytes", page.length);
say("rung words present in the page markup", ["blocked", "mechanical", "operational", "tactical", "strategic", "ideation"].filter((w) => page.includes(w)));
say("range-input (slider) elements in the page markup", (page.match(/type="range"/g) ?? []).length);
say("the word 'slider' in the page markup", (page.match(/slider/gi) ?? []).length);

say("api/levels (the rungs, read live from machines/scale.md)", await (await get("/api/levels")).json());
const packet = (await (await get("/api/packet")).json()) as Record<string, unknown>;
say("api/packet keys", Object.keys(packet));
say("api/packet position, tier, autonomy", { active: packet.active, where: packet.where, tier: packet.tier, autonomy: packet.autonomy });
try {
  say("api/survey", await (await get("/api/survey")).json());
} catch (e) {
  say("api/survey THREW", String(e));
}
try {
  const cards = (await (await get("/api/cards")).json()) as { cards?: unknown[] };
  say("api/cards count", cards.cards?.length ?? "(no cards key)");
} catch (e) {
  say("api/cards THREW", String(e));
}

// THE TOUR'S FINGER against a listening mirror.
const tools = buildServer(root, session);
const ping = await call(tools, "se_panel", { ping: "front-desk" });
say("se_panel ping with the mirror listening", ping.body);

server.close();

// RESUME WITHOUT A PERSON: a second session on the same root, no agent, no repair.
const s2 = new Session(root);
say("second session (resume) position", s2.active());
const p2 = s2.packet() as Record<string, unknown>;
say("second session packet position", { active: p2.active, autonomy: p2.autonomy });
console.log("\nDONE panel");
