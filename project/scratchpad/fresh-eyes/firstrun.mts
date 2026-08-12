// FRESH-EYES DEMO — first boot on a fresh root: the session stands agentless,
// then the boot walk is pulled exactly as an agent would, resting at the desk.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Session } from "../../deliverable/engine/session.ts";
import { buildServer } from "../../deliverable/engine/tools.ts";
import { call, freshRoot, gitInit, proofFor } from "../../deliverable/tests/helpers.ts";

const shrink = (v: unknown): unknown =>
  JSON.parse(JSON.stringify(v, (_k, x) => (typeof x === "string" && x.length > 600 ? `${x.slice(0, 250)} ...[${x.length} chars]` : x)) ?? "null");
const say = (k: string, v: unknown): void => console.log(`\n== ${k}\n${typeof v === "string" ? v : JSON.stringify(shrink(v), null, 1)}`);

const root = freshRoot();
gitInit(root);
say("scratch root", root);

// AGENTLESS: the session answers with no agent attached.
const session = new Session(root);
say("agentless packet before any pull", session.packet());

// THE BOOT WALK, pulled as an agent would; every served document recorded.
const server = buildServer(root, session);
const reads: string[] = [];
let rest: Record<string, unknown> | undefined;
for (let i = 0; i < 24; i++) {
  const r = await call(server, "se_pull");
  if (r.isError) {
    say(`pull ${i} REFUSED`, r.body);
    break;
  }
  if (r.body.pull === "read") {
    const doc = r.body.document as { path: string; content: string };
    reads.push(doc.path);
    const proof = await call(server, "se_pull", { form: { read: proofFor(doc.content) } });
    if (proof.isError) {
      say(`proof for ${doc.path} REFUSED`, proof.body);
      break;
    }
    rest = proof.body;
    continue;
  }
  rest = r.body;
  const where = (r.body.where as string[] | undefined) ?? [];
  if (where.includes("front_desk") || where.includes("idle")) break;
}
say("documents served on the boot walk, in order", reads);
say("resting answer", rest);
say("resting position", session.active());

// The desk method's fixed greeting line, from the live copy this root serves.
const fd = readFileSync(join(root, "project", "guidance", "method", "front-desk.md"), "utf8");
say("front-desk method carries the dial greeting line", fd.includes("The autonomy dial next to the drawing sets how much I do on my own."));
say("front-desk method still says 'slider' anywhere", fd.toLowerCase().includes("slider"));

// A no-goal pull at rest should report nothing to do and show the doors.
const idlePull = await call(server, "se_pull");
say("no-goal pull at rest", idlePull.body);
console.log("\nDONE firstrun");
