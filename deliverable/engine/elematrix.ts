// see dsp-the-outside-boundaries-and-their-bounds.md#the-element-matrix

export interface MatrixElement {
  id: string;
  group: string;
  implements: string[];
}

export interface MatrixFunction {
  id: string;
  inputs: string[];
  outputs: string[];
}

export interface MatrixInterface {
  id: string;
  source: string;
  destination: string;
  carries: string[];
}

export interface ElementCell {
  source: string;
  destination: string;
  /** The crossing flows this pair owes an interface for. */
  owed: string[];
  /** The interface nodes declared for this pair. */
  interfaces: string[];
  /** Owed flows no declared interface carries — the cell's open debt. */
  missing: string[];
}

export interface ElementMatrixView {
  elements: MatrixElement[];
  /** Every pair with something on it — owed flows, an interface, or both. */
  cells: ElementCell[];
  /** Functions no element implements — the allocation's holes. */
  unimplemented: string[];
  /** Elements implementing nothing — gold-plating candidates. */
  idle: string[];
  /** Interfaces standing on a pair that owes nothing — the question in the
   *  other direction. */
  undemanded: { id: string; source: string; destination: string }[];
  problems: string[];
}

const pairKey = (a: string, b: string): string => `${a} -> ${b}`;

/** fn id → the element ids implementing it. */
function implementerMap(elements: MatrixElement[]): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const el of elements) {
    for (const fn of el.implements) out.set(fn, [...(out.get(fn) ?? []), el.id]);
  }
  return out;
}

/** pair key → the flows crossing that boundary, from producers to consumers. */
function owedMap(functions: MatrixFunction[], implementers: Map<string, string[]>): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  const put = (a: string, b: string, flow: string): void => {
    if (a === b) return;
    const key = pairKey(a, b);
    out.set(key, (out.get(key) ?? new Set()).add(flow));
  };
  for (const flow of new Set(functions.flatMap((f) => [...f.inputs, ...f.outputs]))) {
    const from = functions.filter((f) => f.outputs.includes(flow)).flatMap((f) => implementers.get(f.id) ?? []);
    const to = functions.filter((f) => f.inputs.includes(flow)).flatMap((f) => implementers.get(f.id) ?? []);
    for (const a of from) for (const b of to) put(a, b, flow);
  }
  return out;
}

/** The whole matrix from the three node sets. Pure, so a test needs no
 *  filesystem and the assembly stays one thin reader. */
export function elementMatrixView(
  elements: MatrixElement[],
  functions: MatrixFunction[],
  interfaces: MatrixInterface[],
): ElementMatrixView {
  const problems: string[] = [];
  const implementers = implementerMap(elements);
  const unimplemented = functions.filter((f) => (implementers.get(f.id) ?? []).length === 0).map((f) => f.id);
  const idle = elements.filter((el) => el.implements.length === 0).map((el) => el.id);
  const owedAt = owedMap(functions, implementers);
  const known = new Set(elements.map((e) => e.id));
  const declaredAt = new Map<string, MatrixInterface[]>();
  const undemanded: { id: string; source: string; destination: string }[] = [];
  for (const i of interfaces) {
    // see dsp-the-outside-boundaries-and-their-bounds.md#an-outside-boundary-is-not-a-matrix-cell
    const ends = [i.source, i.destination];
    const outside = ends.filter((e) => e.startsWith("nbr-"));
    if (outside.length === 1 && ends.some((e) => known.has(e))) continue;
    if (!known.has(i.source) || !known.has(i.destination)) {
      problems.push(`${i.id} names an end no element carries: ${known.has(i.source) ? i.destination : i.source}`);
      continue;
    }
    const key = pairKey(i.source, i.destination);
    declaredAt.set(key, [...(declaredAt.get(key) ?? []), i]);
    if (!owedAt.has(key)) undemanded.push({ id: i.id, source: i.source, destination: i.destination });
  }
  const cells: ElementCell[] = [...new Set([...owedAt.keys(), ...declaredAt.keys()])].map((key) => {
    const [source, destination] = key.split(" -> ");
    const owed = [...(owedAt.get(key) ?? [])].sort();
    const declared = declaredAt.get(key) ?? [];
    const carried = new Set(declared.flatMap((i) => i.carries));
    return { source, destination, owed, interfaces: declared.map((i) => i.id), missing: owed.filter((f) => !carried.has(f)) };
  });
  cells.sort((x, y) => x.source.localeCompare(y.source) || x.destination.localeCompare(y.destination));
  return { elements, cells, unimplemented, idle, undemanded, problems };
}
