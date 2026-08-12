// FRESH-EYES DEMO — derivation: the tier views recompute from the files
// alone. Edit scale.md in a scratch root; the levels, the tier and the
// mirror's /api/levels change with no restart and no stored copy.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CallLog } from "../../deliverable/engine/calllog.ts";
import { startMirror } from "../../deliverable/engine/mirror.ts";
import { seDir } from "../../deliverable/engine/paths.ts";
import { loadLevels, scalePath, tierOf, valueFor } from "../../deliverable/engine/scale.ts";
import { Session } from "../../deliverable/engine/session.ts";
import { freshRoot, gitInit } from "../../deliverable/tests/helpers.ts";

const say = (k: string, v: unknown): void => console.log(`\n== ${k}\n${typeof v === "string" ? v : JSON.stringify(v, null, 1)}`);

const root = freshRoot();
gitInit(root);

// The scale as authored.
const before = loadLevels(root);
say("levels as authored (word | anchor)", before.map((l) => `${l.value} ${l.name.split(" — ")[0]}`));
say("tierOf(levels, 0.55)", tierOf(before, 0.55));
say("valueFor(levels, 'tactical')", valueFor(before, "tactical"));

// State notes carry priority as words; the scale is what resolves them.
const statesDir = join(root, "project", "deliverable", "machines", "states");
const prios = readdirSync(statesDir)
  .filter((f) => f.endsWith(".md"))
  .map((f) => {
    const m = readFileSync(join(statesDir, f), "utf8").match(/^priority:\s*(.+)$/m);
    return `${f}: ${m?.[1]?.trim() ?? "(none)"}`;
  });
say("state note priorities (tier words expected)", prios);

// THE RECOMPUTE: edit the file, ask again, no restart.
const p = scalePath(root);
const text = readFileSync(p, "utf8");
writeFileSync(p, text.replace("| tactical —", "| renamed-rung —"));
const after = loadLevels(root);
say("levels after editing scale.md in place", after.map((l) => l.name.split(" — ")[0]));
say("tierOf recomputed for 0.55", tierOf(after, 0.55));
say("valueFor(after, 'renamed-rung')", valueFor(after, "renamed-rung"));

// The same recompute through the mirror endpoint, live.
const session = new Session(root);
const server = startMirror({ session, root, port: 0, log: new CallLog(seDir(root)), mode: "agent" });
await new Promise((r) => server.on("listening", r));
const port = (server.address() as { port: number }).port;
const levels = (await (await fetch(`http://127.0.0.1:${port}/api/levels`)).json()) as { autonomy: { name: string }[] };
say("mirror /api/levels names after the edit (no restart)", levels.autonomy.map((l) => l.name.split(" — ")[0]));
server.close();
console.log("\nDONE derivation");
