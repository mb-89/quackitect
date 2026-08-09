// WHERE DO THE SECONDS GO WHEN THE WALK ENTERS A RECORD? Measured against
// the REAL root, stage by stage, because two theories have already been wrong:
// it is not the corpus (stamped, 4 ms) and it is not git (40 ms a spawn, and
// the list calls are under a millisecond).
//
// Modelled on engine/bin/bench-boot.ts, which exists for the same reason: the
// answer kept being inherited rather than measured.
import { Session } from "../deliverable/engine/session.ts";

const root = process.argv[2] ?? ".";
const ms = () => Number(process.hrtime.bigint() / 1000000n);
const rows = [];
const time = (label, fn) => {
  const a = ms();
  const out = fn();
  rows.push([label, ms() - a]);
  return out;
};

const session = time("new Session(root)", () => new Session(root));
session.setAutonomy(1);

// THE ROUTE. A pull asks what the whole way to the target demands, and
// answering that expands the graph.
time("route to i1/write-requirements (1st)", () => session.route("iterations/i1/write-requirements"));
time("route (2nd, memo should be free)", () => session.route("iterations/i1/write-requirements"));

// GREEN, PER MACHINE. The question every hop asks.
const main = session.machine;
time("recordDone(main)", () => session.recordDone(main));

const i1 = session.viewFor("i1")?.decl;
if (i1 !== undefined) {
  time("viewFor('i1')", () => session.viewFor("i1"));
  time("recordDone(i1)  1st", () => session.recordDone(i1));
  time("recordDone(i1)  2nd", () => session.recordDone(i1));
  time("recordDone(i1)  3rd", () => session.recordDone(i1));
}

const es = session.viewFor("enumerate-space")?.decl;
if (es !== undefined) {
  time("viewFor('enumerate-space')", () => session.viewFor("enumerate-space"));
  time("recordDone(enumerate-space)", () => session.recordDone(es));
}

const width = Math.max(...rows.map((r) => r[0].length));
for (const [label, t] of rows) console.log(`${label.padEnd(width)}  ${String(t).padStart(8)} ms`);
