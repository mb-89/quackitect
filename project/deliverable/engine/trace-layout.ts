// THE RADIAL DRAWING: where every trace node lands on the rings, and the SVG
// that renders it.
//
// Split out of trace.ts. Reading the corpus and placing it are different jobs
// — this one takes nodes already loaded and answers with geometry.
//
// see dsp-radial-layout.md#no-layout-library
import {
  descendantsOf,
  type Placed,
  rootsAllOf,
  type Subsegment,
  type Subsegments,
  spread,
  TRACE_LEVELS,
  TRACE_SUBSEGMENTS,
  type TraceBand,
  type TraceLayout,
  type TraceNode,
  type TraceSector,
  type TraceSpoke,
  traceRings,
} from "./trace.ts";

/** see dsp-radial-layout.md#cards-and-labels */
const CARD_W = 260;
const CARD_H = 60;
const MAX_CHARS = 14;

/** THE INNERMOST RING CLEARS THE VISION, derived rather than eyeballed. Two
 *  equal cards whose centres are r apart overlap unless |dx| >= CARD_W or
 *  |dy| >= CARD_H, and the worst angle is the diagonal, where both shrink by
 *  root two. So r must beat CARD_W times root two; the rest is margin. */
const FIRST_RING = CARD_W * 1.55;

/** see dsp-radial-layout.md#the-center-distance-floor */
const MIN_DIST = Math.round((FIRST_RING * 2) / 3);

/** How much of a section's angle its cards may use. The rest is left EMPTY,
 *  so two sections read apart without a line drawn between them. Half of the
 *  slack falls on each side. */
const SECTION_SLACK = 0.86;

/** The hidden separator between one slice and the next. It is the
 *  SAME width as the gap between two sections, because a reader who has
 *  learnt that gap should not have to learn a second one. Like the section
 *  boundaries, it is deliberately not drawn. */
const SPLIT_GAP = 0.14;

/** see dsp-radial-layout.md#every-section-takes-the-angle-it-needs */
function sections(shown: string[], perWedge: Map<string, string[][]>): Map<string, { centre: number; span: number }> {
  // A SECTION'S LOAD IS ITS WORST RING, counted in GAPS. Counting only the
  // outer ring starved the inner ones: a section whose stories outnumbered
  // its share of the turn had nowhere to put them once the small rings
  // stopped staggering.
  const load = (p: string): number => Math.max(1, ...(perWedge.get(p) ?? []).map((l) => Math.max(0, l.length - 1)));
  const total = shown.reduce((a, p) => a + load(p), 0);
  const out = new Map<string, { centre: number; span: number }>();
  // The FIRST section is centred straight down, so a single prop still hangs
  // below the vision however wide its section turns out to be.
  const first = total === 0 ? 0 : (Math.PI * 2 * load(shown[0] ?? "")) / total;
  let at = Math.PI / 2 - first / 2;
  for (const p of shown) {
    const span = total === 0 ? 0 : (Math.PI * 2 * load(p)) / total;
    out.set(p, { centre: at + span / 2, span });
    at += span;
  }
  return out;
}

/** THE STAGGER, ported from v1's report renderer (report_assets.go: a
 *  3-level modulo offset per row). A crowded ring splits into up to three
 *  SUB-ORBITS, and neighbours in angle alternate outward.
 *
 *  THE STEP IS THE FLOOR ITSELF, and a smaller one buys nothing — the first
 *  attempt stepped one card height (76) against a 269 floor, so 258 of the
 *  269 still had to come from the ARC. That is the arc the stagger exists to
 *  save, and the rings GREW instead of collapsing. Stepping a full MIN_DIST
 *  outward makes the radial separation carry the floor by itself: neighbours
 *  in angle are clear whatever their angle, and only SAME-ORBIT neighbours —
 *  three items apart — still owe the full distance in arc. */
const STAGGER = 3;
const STAGGER_STEP = MIN_DIST;
/** see dsp-radial-layout.md#the-band-straddles-its-ring */
function orbitOffset(i: number, orbits: number): number {
  return ((i % orbits) - (orbits - 1) / 2) * STAGGER_STEP;
}

/** How far a band of this many orbits reaches on EITHER side of its ring. */
function bandHalf(orbits: number): number {
  return ((orbits - 1) / 2) * STAGGER_STEP;
}

/** see dsp-radial-layout.md#the-ring-gap-is-the-visions-own-gap */
const RING_GAP = FIRST_RING;

/** How many sub-orbits a lane needs. see dsp-radial-layout.md#staggering-must-pay-for-itself */
function bestOrbits(lanes: { gaps: number; arc: number }[], floor: number): { r: number; orbits: number } {
  let best = { r: floor, orbits: 1 };
  let cost = Number.POSITIVE_INFINITY;
  for (let o = 1; o <= STAGGER; o++) {
    const half = bandHalf(o);
    let r = floor + half;
    for (const l of lanes) if (l.arc > 0) r = Math.max(r, (l.gaps * MIN_DIST) / (o * l.arc));
    // What this ring actually costs the drawing is its OUTER edge.
    if (r + half < cost) {
      cost = r + half;
      best = { r, orbits: o };
    }
  }
  return best;
}

export function shortLabel(id: string): string {
  const label = id.replace(/^vp-/, "");
  return label.length <= MAX_CHARS ? label : `${label.slice(0, MAX_CHARS - 1)}…`;
}

/** THE TEXT FILTER KEEPS A LINE OF DESCENT, never a bare match. A node stays
 *  when it matches, and so does every ancestor above it — otherwise a matching
 *  requirement would float with nothing joining it to the vision. A node whose
 *  CHILD matches is therefore kept too, by being that child's ancestor. */
function keepFor(all: TraceNode[], q: string): Set<string> {
  if (q.trim() === "") return new Set(all.map((n) => n.id));
  const needle = q.trim().toLowerCase();
  const byId = new Map(all.map((n) => [n.id, n]));
  const keep = new Set<string>();
  for (const n of all) {
    if (!`${n.id} ${n.statement} ${n.hay ?? ""}`.toLowerCase().includes(needle)) continue;
    let cur: TraceNode | undefined = n;
    while (cur !== undefined && !keep.has(cur.id)) {
      keep.add(cur.id);
      cur = byId.get(cur.refines[0] ?? "");
    }
  }
  return keep;
}

/** see dsp-radial-layout.md#ring-k-must-hold-the-worst-wedges-count-at */
function ringRadii(wedges: { lanes: string[][]; arcs: number[] }[], count: number): { r: number; orbits: number }[] {
  const rings: { r: number; orbits: number }[] = [];
  let floor = FIRST_RING;
  for (let k = 0; k < count; k++) {
    // see dsp-radial-layout.md#the-ring-answers-to-its-hungriest-section-and-n
    const lanes = wedges.map((w) => ({ gaps: Math.max(0, (w.lanes[k]?.length ?? 0) - 1), arc: w.arcs[k] ?? 0 })).filter((l) => l.gaps > 0);
    const pick = bestOrbits(lanes, floor);
    rings.push(pick);
    // The band straddles the ring, so the next floor clears its outer half.
    floor = pick.r + bandHalf(pick.orbits) + RING_GAP;
  }
  return rings;
}

/** see dsp-radial-layout.md#the-relax-pass */
function pushApart(a: Placed | undefined, b: Placed | undefined, ceiling: number[]): boolean {
  if (a === undefined || b === undefined) return false;
  const d = Math.hypot(a.x - b.x, a.y - b.y);
  if (d >= MIN_DIST) return false;
  const out = Math.hypot(a.x, a.y) >= Math.hypot(b.x, b.y) ? a : b;
  const was = Math.hypot(out.x, out.y);
  const r = Math.min(ceiling[out.level] ?? Number.POSITIVE_INFINITY, was + (MIN_DIST - d));
  if (r <= was) return false;
  const ang = Math.atan2(out.y, out.x);
  out.x = Math.cos(ang) * r;
  out.y = Math.sin(ang) * r;
  return true;
}

function relax(placed: Placed[], ceiling: number[]): void {
  for (let pass = 0; pass < 60; pass++) {
    let moved = false;
    for (let i = 0; i < placed.length; i++)
      for (let j = i + 1; j < placed.length; j++) if (pushApart(placed[i], placed[j], ceiling)) moved = true;
    if (!moved) break;
  }
}

/** Where each item in a lane WANTS to sit: the mean angle of its placed
 *  parents, or the wedge's centre when none of them is placed. */
function wants(
  lane: string[],
  parents: Map<string, string[]>,
  placedAt: (id: string) => number | undefined,
  fallback: number,
): Map<string, number> {
  const out = new Map<string, number>();
  for (const id of lane) {
    const ps = (parents.get(id) ?? []).map(placedAt).filter((a): a is number => a !== undefined);
    out.set(id, ps.length === 0 ? fallback : ps.reduce((a, b) => a + b, 0) / ps.length);
  }
  return out;
}

/** A ring's lane, split into its slices and keeping the incoming order. A
 *  spine ring has no slices and yields one group, keyed -1. */
function bySlice(ordered: string[], sliceOf: (id: string) => number): Map<number, string[]> {
  const out = new Map<number, string[]>();
  for (const id of ordered) {
    const s = sliceOf(id);
    out.set(s, [...(out.get(s) ?? []), id]);
  }
  return out;
}

/** WHERE THE DRAWING STARTS: the node set, the wedges and the ring order,
 *  taken from the origin. No origin means the vision, which is not a node —
 *  so the wedges are the value props and the rings are the whole type order.
 *
 *  AN UNKNOWN ORIGIN FALLS BACK TO THE VISION rather than drawing nothing. A
 *  typed name that does not exist should show the whole picture, not a blank. */
function originAt(
  all: TraceNode[],
  origin: string | undefined,
  sub: Subsegments,
): { nodes: TraceNode[]; props: string[]; rings: string[][] } {
  const rings = traceRings(sub);
  const seed = origin === undefined || origin === "" ? undefined : all.find((n) => n.id === origin);
  if (seed === undefined) {
    return { nodes: all, props: all.filter((n) => n.type === TRACE_LEVELS[0]).map((n) => n.id), rings };
  }
  const nodes = descendantsOf(all, seed.id);
  const at = rings.findIndex((r) => r.includes(seed.type));
  const past = at < 0 ? rings : rings.slice(at + 1);
  // The wedges are the origin's OWN children — whatever type they turn out to
  // be. A use case as origin gives one wedge per requirement.
  const props = nodes.filter((n) => n.refines.includes(seed.id)).map((n) => n.id);
  return { nodes, props, rings: past };
}

/** The radial arrangement. The ring radius is GLOBAL across every wedge, so
 *  the level separators stay true circles — which means the WORST wedge sets
 *  the ring for everyone. A narrower wedge pushes its ring outward, because
 *  the arc a wedge offers is its radius times its angle. */
export function layoutTrace(
  all: TraceNode[],
  selected?: string[],
  filter?: { types?: string[]; find?: string; origin?: string },
  subs?: Subsegments,
): TraceLayout {
  // A TYPE FILTER REMOVES RINGS, it does not grey them out. The wedges still
  // come from the value props, so hiding a middle level closes the gap rather
  // than leaving a hole where it stood.
  const wanted = filter?.types ?? [];
  const sub = subs ?? TRACE_SUBSEGMENTS;
  // THE ORIGIN DECIDES WHERE THE COUNTING STARTS. With none, the centre is
  // the vision and the first ring is the value props. With one, the centre is
  // that node and the first ring is its own children — the type order past it
  // is unchanged, because that order is what the trace MEANS.
  const from = originAt(all, filter?.origin, sub);
  const rung = wanted.length > 0 ? from.rings.map((r) => r.filter((t) => wanted.includes(t))) : from.rings;
  const asked = rung;
  const shown = selected === undefined || selected.length === 0 ? from.props : selected;
  const roots = rootsAllOf(from.nodes, (n) => from.props.includes(n.id));
  const all2 = from.nodes;
  const kept = keepFor(all2, filter?.find ?? "");
  const rootsShown = (id: string): string[] => (roots.get(id) ?? []).filter((r) => shown.includes(r));
  const onSome = (t: string): boolean => asked.some((r) => r.includes(t));
  const inScope = all2.filter((n) => rootsShown(n.id).length > 0 && kept.has(n.id) && onSome(n.type));
  // AN EMPTY RING IS NOISE (owner, 2026-08-06). A level nothing has reached
  // yet draws a circle around nothing and pushes everything else inward. It
  // comes back by itself the moment the level has a node.
  const levels = asked.filter((r) => r.some((t) => inScope.some((n) => n.type === t)));

  const parentsOf = new Map(inScope.map((n) => [n.id, n.refines]));
  const perWedge = new Map<string, string[][]>();
  for (const p of shown)
    perWedge.set(
      p,
      levels.map(() => []),
    );
  const ringOf = (t: string): number => levels.findIndex((r) => r.includes(t));
  for (const n of inScope) {
    const lv = ringOf(n.type);
    if (lv < 0) continue;
    for (const r of rootsShown(n.id)) perWedge.get(r)?.[lv].push(n.id);
  }

  // The sections are cut AFTER the lanes are known, because each one's share
  // of the turn is its own load.
  const cut = sections(shown, perWedge);
  // HOW MUCH ANGLE A RING MAY USE, and where its middle sits.
  //
  // A SPINE RING OWNS THE WHOLE SECTION. Past the spine the section divides
  // into one slice per subsegment, parted by a hidden separator the width of
  // the gap between two sections — a reader who has learnt that gap should not
  // have to learn a second one.
  //
  // THE SLICES ARE EQUAL, whatever they hold. An empty one keeps its arc, so
  // the test levels land later without moving anything already drawn.
  const slices = Math.max(1, sub.of.length);
  const wedgeArc = (prop: string): number => (cut.get(prop)?.span ?? 0) * SECTION_SLACK;
  const gaps = (prop: string): number => (cut.get(prop)?.span ?? 0) * SPLIT_GAP * (slices - 1);
  const sliceArc = (prop: string): number => Math.max(0, (wedgeArc(prop) - gaps(prop)) / slices);
  /** Which slice a type sits in, counted from the section's left edge. */
  const sliceOf = (t: string): number => sub.of.findIndex((s: Subsegment) => s.levels.includes(t));
  /** The middle of a slice, in absolute angle. */
  const sliceAt = (prop: string, i: number): number => {
    const centre = cut.get(prop)?.centre ?? Math.PI / 2;
    const step = sliceArc(prop) + (cut.get(prop)?.span ?? 0) * SPLIT_GAP;
    return centre - wedgeArc(prop) / 2 + sliceArc(prop) / 2 + i * step;
  };
  const arcAt = (prop: string, k: number): number => ((levels[k] ?? []).some((t) => sliceOf(t) >= 0) ? sliceArc(prop) : wedgeArc(prop));
  const ringPlan = ringRadii(
    shown.map((p) => ({ lanes: perWedge.get(p) ?? [], arcs: levels.map((_, k) => arcAt(p, k)) })),
    levels.length,
  );
  const rings = ringPlan.map((x) => x.r);

  const placed: Placed[] = [];
  const place = new Map<string, number>();
  const byId = new Map(inScope.map((n) => [n.id, n]));
  const at = (prop: string, id: string): string => `${prop}\0${id}`;
  shown.forEach((prop) => {
    const lanes = perWedge.get(prop) ?? [];
    // The first section starts pointing straight DOWN, so a single prop hangs
    // below the vision rather than sitting at an arbitrary angle.
    const centre = cut.get(prop)?.centre ?? Math.PI / 2;
    const half = wedgeArc(prop) / 2;
    // see dsp-radial-layout.md#the-subsegments
    const sliceHalf = sliceArc(prop) / 2;
    for (let k = 0; k < levels.length; k++) {
      const lane = lanes[k] ?? [];
      if (lane.length === 0) continue;
      // see dsp-radial-layout.md#outward-means-outward
      const target = wants(lane, parentsOf, (id) => place.get(at(prop, id)), centre);
      const ordered = [...lane].sort((a, b) => (target.get(a) ?? 0) - (target.get(b) ?? 0));
      // HOW MANY SUB-ORBITS THIS LANE NEEDS. A sparse lane stays on one
      // orbit — staggering it would be noise. A dense one splits across up
      // to three, and neighbours IN ANGLE alternate outward, so same-orbit
      // neighbours always sit the full LABEL_W apart.
      // The orbit count is the ring's own, chosen where the radius was.
      const orbits = ringPlan[k]?.orbits ?? 1;
      // EACH SLICE IS SPREAD ON ITS OWN, inside its own arc. A ring past the
      // spine holds design on one side and tests on the other, and neither
      // may drift into the other's angle.
      //
      // THE BAND CLAMPS, IT DOES NOT RE-CENTRE. A node still WANTS its
      // parent's own angle, and a lone value prop still wants to hang
      // straight down from the vision. What the band changes is where a
      // crowded lane may spill to: within its own slice, never past it.
      //
      // Re-centring instead moved a lone prop 88 units sideways and broke the
      // straight-down rule, which is a promise about the FIRST thing a reader
      // sees.
      //
      // A SPINE RING HAS ONE GROUP, keyed -1, and it takes the whole section.
      const groups = bySlice(ordered, (id) => sliceOf(byId.get(id)?.type ?? ""));
      for (const [s, group] of groups) {
        const [bandAt, bandHalfArc] = s < 0 ? [centre, half] : [sliceAt(prop, s), sliceHalf];
        const angles = spread(
          group.map((id) => target.get(id) ?? bandAt),
          MIN_DIST / orbits / (rings[k] ?? 1),
          bandAt,
          bandHalfArc,
        );
        group.forEach((id, i) => {
          const a = angles[i] ?? centre;
          place.set(at(prop, id), a);
          const n = byId.get(id);
          if (n === undefined) return;
          const r = (rings[k] ?? 0) + orbitOffset(i, orbits);
          placed.push({ ...n, key: at(prop, id), level: k, root: prop, x: Math.cos(a) * r, y: Math.sin(a) * r });
        });
      }
    }
  });

  // A card may leave its ring by one stagger step and no more — the band's
  // outer edge is the ceiling, computed where the ring was.
  relax(
    placed,
    ringPlan.map((p) => p.r + bandHalf(p.orbits)),
  );

  const keys = new Set(placed.map((p) => p.key));
  const edges: { from: string; to: string }[] = [];
  for (const n of placed) {
    // WITHIN THE WEDGE ONLY. A parent under a different value prop is not
    // linked from here: this node is drawn under that prop as well, and the
    // link is drawn there, short and local. That is what removes the lines
    // that used to cross the whole circle.
    for (const p of n.refines) if (keys.has(at(n.root, p))) edges.push({ from: at(n.root, p), to: n.key });
    if ((levels[0] ?? []).includes(n.type)) edges.push({ from: "vision", to: n.key });
  }
  // The relax pass may push past the outermost ring, so the size follows the
  // cards rather than the circles.
  const reach = placed.reduce((m, p) => Math.max(m, Math.hypot(p.x, p.y)), rings[rings.length - 1] ?? RING_GAP);
  // THE BANDS — what a reader sees when the cards are too small to read
  // (owner design 2026-08-07). One arc per section, and one per slice inside
  // it. They ride OUTSIDE the outermost ring so they never collide with a
  // card, and the client fades them against the cards as the zoom changes.
  const divided = levels.some((r) => r.some((t) => sliceOf(t) >= 0));
  const segR = reach + RING_GAP * 0.85;
  const bands = shown.flatMap((prop): TraceBand[] => {
    const c = cut.get(prop)?.centre ?? Math.PI / 2;
    const half = wedgeArc(prop) / 2;
    const w = sliceArc(prop) / 2;
    const seg: TraceBand = { label: propLabel(prop), root: prop, kind: "segment", r: segR, from: c - half, to: c + half };
    if (!divided) return [seg];
    const cuts = sub.of.map(
      (s, i): TraceBand => ({
        label: s.label,
        root: prop,
        kind: "slice",
        r: reach + RING_GAP * 0.35,
        from: sliceAt(prop, i) - w,
        to: sliceAt(prop, i) + w,
      }),
    );
    return [seg, ...cuts];
  });
  // The clickable pie. see dsp-radial-layout.md#arcs-and-sectors
  const edgesOf = (k: number): [number, number] => {
    const r = rings[k] ?? 0;
    const inner = k === 0 ? 0 : ((rings[k - 1] ?? 0) + r) / 2;
    const outer = k === rings.length - 1 ? reach + RING_GAP * 0.15 : (r + (rings[k + 1] ?? r)) / 2;
    return [inner, outer];
  };
  // see dsp-radial-layout.md#arcs-and-sectors
  const edgeAt = (prop: string, i: number, n: number): number => {
    const c = cut.get(prop)?.centre ?? Math.PI / 2;
    const span = cut.get(prop)?.span ?? 0;
    return c - span / 2 + (span * i) / n;
  };
  const sectors = shown.flatMap((prop): TraceSector[] =>
    levels.flatMap((types, k): TraceSector[] => {
      const [r0, r1] = edgesOf(k);
      // A DIVIDED RING GETS ONE SECTOR PER SLICE, an undivided one a single
      // sector across the whole section.
      const parts = types.some((t) => sliceOf(t) >= 0) ? sub.of.length : 1;
      return Array.from({ length: parts }, (_, i): TraceSector => {
        const mine = parts === 1 ? types : types.filter((t) => sliceOf(t) === i);
        return {
          label: mine.length > 0 ? mine.join(" ") : (sub.of[i]?.label ?? ""),
          root: prop,
          ring: k,
          slice: parts === 1 ? "" : (sub.of[i]?.id ?? ""),
          r0,
          r1,
          from: edgeAt(prop, i, parts),
          to: edgeAt(prop, i + 1, parts),
        };
      });
    }),
  );
  // THE SEPARATORS ARE THE SECTOR EDGES, exactly. One spoke between two
  // sections, running the whole way out. Inside a section, one cut per slice
  // boundary, starting where the division opens.
  const opensAt = levels.findIndex((types) => types.some((t) => sliceOf(t) >= 0));
  const cutFrom = opensAt <= 0 ? 0 : edgesOf(opensAt)[0];
  const spokes = shown.flatMap((prop): TraceSpoke[] => {
    const out = segR + RING_GAP * 0.25;
    const n = sub.of.length;
    const line: TraceSpoke[] = [{ kind: "section", at: edgeAt(prop, n, n), r0: 0, r1: out }];
    if (!divided || n < 2) return line;
    const between = Array.from(
      { length: n - 1 },
      (_, i): TraceSpoke => ({ kind: "slice", at: edgeAt(prop, i + 1, n), r0: cutFrom, r1: out }),
    );
    return [...line, ...between];
  });
  // THE LABELS MUST FIT. A section band's text is the outermost thing drawn,
  // and its glyphs rise off the arc by roughly the font size.
  return { nodes: placed, edges, rings, bands, sectors, spokes, size: segR + FIRST_RING * 0.34 * 1.6 };
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** see dsp-the-outside-boundaries-and-their-bounds.md#a-sections-name */
function propLabel(id: string): string {
  return id.replace(/^[a-z]+-/, "").replace(/-/g, " ");
}

/** ONE PIECE OF THE PIE, as a closed path: out along one edge, round the
 *  outer arc, back down the other edge, round the inner arc. */
function sectorPath(r0: number, r1: number, from: number, to: number): string {
  const sweep = Math.min(to - from, Math.PI * 2 - 0.02);
  const big = sweep > Math.PI ? 1 : 0;
  const p = (r: number, t: number): string => `${(Math.cos(t) * r).toFixed(1)} ${(Math.sin(t) * r).toFixed(1)}`;
  const a = from;
  const b = from + sweep;
  if (r0 <= 0) return `M 0 0 L ${p(r1, a)} A ${r1.toFixed(1)} ${r1.toFixed(1)} 0 ${big} 1 ${p(r1, b)} Z`;
  return (
    `M ${p(r0, a)} L ${p(r1, a)} A ${r1.toFixed(1)} ${r1.toFixed(1)} 0 ${big} 1 ${p(r1, b)}` +
    ` L ${p(r0, b)} A ${r0.toFixed(1)} ${r0.toFixed(1)} 0 ${big} 0 ${p(r0, a)} Z`
  );
}

/** see dsp-radial-layout.md#the-text-must-fit-the-arc-it-rides */
function fitted(label: string, r: number, sweep: number, want: number): number {
  const arc = Math.abs(r * sweep);
  const need = Math.max(1, label.length) * 0.58;
  return Math.min(want, arc / need);
}

/** ONE ARC, as a path. Drawn BACKWARDS when its middle falls in the lower
 *  half, because text on a path follows the path's direction and would
 *  otherwise hang upside down along the bottom of the circle.
 *
 *  A full turn cannot be one arc command — its start and end are the same
 *  point and nothing is drawn — so a lone section stops a hair short. */
function arcPath(r: number, from: number, to: number): string {
  const sweep = Math.min(to - from, Math.PI * 2 - 0.02);
  const mid = from + sweep / 2;
  const flip = Math.sin(mid) > 0;
  const [a, b, dir] = flip ? [from + sweep, from, 0] : [from, from + sweep, 1];
  const p = (t: number): string => `${(Math.cos(t) * r).toFixed(1)} ${(Math.sin(t) * r).toFixed(1)}`;
  return `M ${p(a)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 ${sweep > Math.PI ? 1 : 0} ${dir} ${p(b)}`;
}

/** THE PIE — one clickable piece per section per ring, each carrying the name
 *  of what it holds. The ground the drawing sits on: a click that misses every
 *  card still lands on one of these. */
function svgSectors(sectors: TraceSector[]): string {
  if (sectors.length === 0) return "";
  const out = ['<g class="trace-sectors">'];
  for (const [i, s] of sectors.entries()) {
    out.push(
      `<path class="trace-sector" d="${sectorPath(s.r0, s.r1, s.from, s.to)}"` +
        ` data-band="${esc(s.root)}" data-ring="${s.ring}" data-slice="${esc(s.slice)}"><title>${esc(`${propLabel(s.root)} · ${s.label}`)}</title></path>`,
    );
    const mid = (s.r0 + s.r1) / 2;
    const size = fitted(s.label, mid, s.to - s.from, FIRST_RING * 0.16);
    // Below this nobody could read it, and an unreadable label is noise on a
    // drawing whose whole point at that zoom is the shape.
    if (size < FIRST_RING * 0.05) continue;
    out.push(
      `<path id="ts-${i}" d="${arcPath(mid, s.from, s.to)}" fill="none"/>`,
      `<text class="trace-ringlabel" font-size="${size.toFixed(0)}"><textPath href="#ts-${i}" startOffset="50%" text-anchor="middle">${esc(s.label)}</textPath></text>`,
    );
  }
  out.push("</g>");
  return out.join("");
}

/** THE CUTS IN THE CAKE, so a reader far out can see where one section ends
 *  even when no label is legible. */
function svgSpokes(spokes: TraceSpoke[]): string {
  if (spokes.length === 0) return "";
  const line = (s: TraceSpoke): string => {
    const x1 = (Math.cos(s.at) * s.r0).toFixed(1);
    const y1 = (Math.sin(s.at) * s.r0).toFixed(1);
    const x2 = (Math.cos(s.at) * s.r1).toFixed(1);
    const y2 = (Math.sin(s.at) * s.r1).toFixed(1);
    return `<line class="trace-spoke ${s.kind}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  };
  return `<g class="trace-spokes">${spokes.map(line).join("")}</g>`;
}

/** THE NAMES ON THEIR ARCS — the section, and each slice inside it. */
function svgBands(bands: TraceBand[]): string {
  if (bands.length === 0) return "";
  const defs = bands.map((b, i) => `<path id="tb-${i}" d="${arcPath(b.r, b.from, b.to)}" fill="none"/>`).join("");
  const text = bands
    .map((b, i) => {
      const want = FIRST_RING * (b.kind === "segment" ? 0.34 : 0.2);
      return (
        `<text class="trace-band ${b.kind} clickable" data-band="${esc(b.root)}" font-size="${fitted(b.label, b.r, b.to - b.from, want).toFixed(0)}">` +
        `<textPath href="#tb-${i}" startOffset="50%" text-anchor="middle">${esc(b.label)}</textPath></text>`
      );
    })
    .join("");
  return `<defs>${defs}</defs><g class="trace-bands">${text}</g>`;
}

/** The SVG. The centre is (0,0) in a viewBox that grows with the outermost
 *  ring, so the drawing scales instead of clipping. */
export function traceSvg(l: TraceLayout): string {
  const s = l.size;
  const parts = [`<svg class="trace" viewBox="${-s} ${-s} ${s * 2} ${s * 2}" role="img" aria-label="trace graph">`];
  // THE BANDS GO FIRST, so a card always draws over a label rather than under
  // it. At the zoom where the labels matter there are no legible cards, and
  // at the zoom where the cards matter the labels have faded out.
  parts.push(svgSectors(l.sectors), svgSpokes(l.spokes), svgBands(l.bands));
  for (const r of l.rings) parts.push(`<circle cx="0" cy="0" r="${r.toFixed(0)}" class="trace-ring"/>`);
  // KEYED BY PLACEMENT, not by node: a node under two value props has two
  // cards, and `id` no longer picks one out.
  const at = new Map(l.nodes.map((n) => [n.key, n]));
  for (const e of l.edges) {
    const b = at.get(e.to);
    if (b === undefined) continue;
    // THE VISION'S EDGES ARE IMPLICIT. No node declares them — a value prop is
    // a child of the vision by BEING one — so they are drawn from the centre
    // and marked, rather than left out because the data does not carry them.
    const implicit = e.from === "vision";
    const a = implicit ? { x: 0, y: 0 } : at.get(e.from);
    if (a === undefined) continue;
    parts.push(
      `<line x1="${a.x.toFixed(0)}" y1="${a.y.toFixed(0)}" x2="${b.x.toFixed(0)}" y2="${b.y.toFixed(0)}" class="trace-edge${implicit ? " implicit" : ""}" data-a="${esc(implicit ? "vision" : (at.get(e.from)?.id ?? ""))}" data-b="${esc(b.id)}"/>`,
    );
  }
  // THE CARD IS THE MACHINE VIEW'S STATE NODE, class for class. Its colours
  // come from the host's palette through `state` and `label`, so this drawing
  // cannot drift from the one beside it and cannot invent a theme of its own.
  // `clickable` plus `data-detail` is how every other element on the page
  // reaches the details panel.
  const card = (x: number, y: number, label: string, id: string, rect: string, attrs: string, tip: string): string =>
    `<g class="clickable trace-node" data-detail="trace:${esc(id)}"${attrs}>` +
    `<rect x="${(x - CARD_W / 2).toFixed(0)}" y="${(y - CARD_H / 2).toFixed(0)}" width="${CARD_W}" height="${CARD_H}" rx="14" class="${rect}"/>` +
    // NEVER a rotate() on the card or its text — see CARD_W.
    `<text x="${x.toFixed(0)}" y="${(y + 6).toFixed(0)}" class="label">${esc(label)}</text>` +
    `<title>${esc(tip)}</title></g>`;
  // The vision is an ORDINARY node. `active` means the walk is standing there,
  // and nothing stands in a trace graph.
  parts.push(card(0, 0, "vision", "vision", "state", ' data-node="vision"', "the product vision"));
  for (const n of l.nodes) {
    // data-node is the NODE, shared by both cards of a duplicated node, so a
    // click lights every place it appears rather than only the one hit.
    parts.push(
      card(
        n.x,
        n.y,
        shortLabel(n.id),
        n.id,
        "state",
        ` data-type="${esc(n.type)}" data-root="${esc(n.root)}" data-node="${esc(n.id)}"`,
        n.statement,
      ),
    );
  }
  parts.push("</svg>");
  return parts.join("");
}
