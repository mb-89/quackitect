// THE FLOW STRUCTURE CLOSES — the check behind derive-functions' flows field.
//
// A flow is a node, and two functions naming the same flow are connected by
// construction. That connection is the only thing M4 partitions on, so a flow
// with one end is a hole in the function structure.
//
// Two holes, and neither is visible until the flows are written down.
//
//   - A flow nothing produces. Something consumes what nothing makes.
//   - A flow nothing consumes. Something is made that nothing wants.
//
// THE BOUNDARY IS MARKED ON THE FLOW, never inferred from the drawing. This
// is IDEF0's A-0 context arrow, written down: a flow that comes from the world
// says so, and demanding an internal producer for the person's intent would be
// demanding that the system invent its own input.
//
//   - crosses: in  — the world makes it. No producer owed.
//   - crosses: out — the world takes it. No consumer owed.
//   - absent      — internal. Both ends owed.
//
// IT USED TO READ THE ROOT FUNCTION'S OWN LISTS instead. That forced every
// external input onto the root, which would have grown a fifteen-item list
// describing the whole system rather than the one thing it does.
//
//   node engine/bin/flow-closure.ts --root <project root>
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

/** One frontmatter LIST, as its bare entries. Block lists only; that is what
 *  every function node uses. Wiki brackets are stripped, so a reference reads
 *  the same whether it was written [[flow-x]] or flow-x. */
function list(text: string, key: string): string[] {
  const lines = text.split(/\r?\n/);
  const at = lines.findIndex((l) => l.trimEnd() === `${key}:`);
  if (at < 0) return [];
  const out: string[] = [];
  for (let i = at + 1; i < lines.length; i++) {
    const m = /^\s+-\s+(.*)$/.exec(lines[i]);
    if (m === null) break;
    const v = m[1]
      .trim()
      .replace(/^\[\[|\]\]$/g, "")
      .replace(/^["']|["']$/g, "");
    if (v !== "") out.push(v);
  }
  return out;
}

function idOf(text: string, fallback: string): string {
  const m = /^id:[ \t]*(.*)$/m.exec(text);
  return m === null ? fallback : m[1].trim();
}

function crossesOf(text: string): string {
  const m = /^crosses:[ \t]*(.*)$/m.exec(text);
  return m === null ? "" : m[1].trim().replace(/^["']|["']$/g, "");
}

const root = argValue("--root") ?? process.cwd();
const fnDir = join(root, "spec", "trace", "function");
const flowDir = join(root, "spec", "trace", "flow");
const problems: string[] = [];

const flows: { id: string; crosses: string }[] = existsSync(flowDir)
  ? readdirSync(flowDir)
      .filter((n) => n.endsWith(".md"))
      .map((n) => {
        const text = readFileSync(join(flowDir, n), "utf8");
        return { id: idOf(text, n.replace(/\.md$/, "")), crosses: crossesOf(text) };
      })
  : [];

const produced = new Map<string, string[]>();
const consumed = new Map<string, string[]>();
const named = new Set<string>();

if (existsSync(fnDir)) {
  for (const f of readdirSync(fnDir).filter((n) => n.endsWith(".md"))) {
    const text = readFileSync(join(fnDir, f), "utf8");
    const id = idOf(text, f.replace(/\.md$/, ""));
    const ins = list(text, "inputs");
    const outs = list(text, "outputs");
    for (const v of [...ins, ...outs]) named.add(v);
    for (const v of outs) produced.set(v, [...(produced.get(v) ?? []), id]);
    for (const v of ins) consumed.set(v, [...(consumed.get(v) ?? []), id]);
  }
}

// EVERY NAME IS A FLOW NODE. A function naming prose instead of a flow is the
// original defect: two functions meaning one thing, spelled two ways, with no
// edge between them.
const known = new Set(flows.map((f) => f.id));
for (const v of [...named].sort()) {
  if (!known.has(v)) problems.push(`"${v}" is named by a function but is no flow node — a name that is not a node connects nothing`);
}

// BOTH ENDS, except where the flow's own boundary marker excuses one.
for (const { id, crosses } of flows) {
  if (crosses !== "" && crosses !== "in" && crosses !== "out") {
    problems.push(`${id}: crosses is "${crosses}" — it is in, out, or absent`);
    continue;
  }
  if (!produced.has(id) && crosses !== "in") {
    problems.push(`${id}: nothing produces it — either a function is missing, the flow is not needed, or it crosses in`);
  }
  if (!consumed.has(id) && crosses !== "out") {
    problems.push(`${id}: nothing consumes it — either something is made that nothing wants, or it crosses out`);
  }
}

if (problems.length === 0) {
  process.stdout.write(
    flows.length === 0
      ? "flow closure: no flows written yet\n"
      : `flow closure green: ${flows.length} flows, every one produced and consumed\n`,
  );
} else {
  process.stdout.write(`flow closure RED — ${problems.length} problem${problems.length === 1 ? "" : "s"}\n\n`);
  for (const p of problems) process.stdout.write(`- ${p}\n`);
  process.exitCode = 1;
}
