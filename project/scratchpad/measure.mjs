// Measure the served geometry against the real corpus.
import { loadTrace, layoutTrace } from "../deliverable/engine/trace.ts";
import { traceSubsegments } from "../deliverable/engine/traceschema.ts";

const repo = process.argv[2];
const nodes = loadTrace(repo);
const sub = traceSubsegments(repo);
const l = layoutTrace(nodes, undefined, undefined, sub);
const deg = (a) => Math.round((a * 180) / Math.PI);

console.log("rings", l.rings.map((r) => Math.round(r)).join(" "));
console.log("sectors", l.sectors.length, " spokes", l.spokes.length, " cards", l.nodes.length);

// DO THE SECTOR EDGES LAND ON THE DRAWN SEPARATORS?
const lines = l.spokes.map((s) => s.at);
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const onLine = (a) => lines.some((x) => Math.abs(wrap(a - x)) < 1e-6);
const orphanEdges = l.sectors.filter((s) => !onLine(s.from) && !onLine(s.to));
console.log("sector edges off every drawn line:", orphanEdges.length);

// DOES EVERY CARD SIT INSIDE A SECTOR OF ITS OWN SECTION?
const inside = (a, s) => {
  const d = wrap(a - s.from);
  return d >= -1e-9 && d <= s.to - s.from + 1e-9;
};
const strays = [];
for (const n of l.nodes) {
  const a = Math.atan2(n.y, n.x);
  const r = Math.hypot(n.x, n.y);
  const home = l.sectors.filter((s) => s.root === n.root && r >= s.r0 - 1e-6 && r <= s.r1 + 1e-6);
  if (!home.some((s) => inside(a, s))) strays.push(n.id);
}
console.log("cards outside every piece of their own section:", strays.length, strays.slice(0, 6).join(" "));

// HOW MUCH MARGIN does a card keep from its section's edge?
console.log("\nper section — the closest a card comes to its separator, in degrees");
for (const root of [...new Set(l.nodes.map((n) => n.root))]) {
  const own = l.sectors.filter((s) => s.root === root);
  const lo = Math.min(...own.map((s) => s.from));
  const hi = Math.max(...own.map((s) => s.to));
  let gap = Infinity;
  for (const n of l.nodes.filter((x) => x.root === root)) {
    const a = Math.atan2(n.y, n.x);
    gap = Math.min(gap, Math.abs(wrap(a - lo)), Math.abs(wrap(a - hi)));
  }
  console.log("  " + root.padEnd(26), "span " + deg(hi - lo) + "deg", " margin " + deg(gap) + "deg");
}

console.log("\nthe strays, in detail");
for (const id of strays.slice(0, 4)) {
  const n = l.nodes.find((x) => x.id === id);
  const a = Math.atan2(n.y, n.x);
  const r = Math.hypot(n.x, n.y);
  console.log(`  ${id}  root=${n.root} ring=${n.level} r=${Math.round(r)} angle=${deg(a)}`);
  for (const s of l.sectors.filter((x) => x.root === n.root)) {
    const rOk = r >= s.r0 - 1e-6 && r <= s.r1 + 1e-6;
    const aOk = inside(a, s);
    if (rOk || s.ring === n.level) console.log(`      ring ${s.ring} ${s.slice || "-"}  r ${Math.round(s.r0)}..${Math.round(s.r1)} ${rOk ? "in" : "OUT"}   ang ${deg(s.from)}..${deg(s.to)} ${aOk ? "in" : "OUT"}`);
  }
}
