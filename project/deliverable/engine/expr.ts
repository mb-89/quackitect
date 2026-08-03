// THE EXPRESSION LANGUAGE — what filters and formulas both stand on.
//
// Bases has ONE language and spends it twice. A filter is an expression that
// has to come out true; a formula is an expression whose value becomes a
// column. The filter builder, the formula column and the `</>` raw escape in
// the interface are all this evaluator wearing a form.
//
// TWO THINGS SHAPE THE IMPLEMENTATION.
//
// CALL-BY-NAME. `[1,2,3].filter(value > 2)` passes an EXPRESSION, not a
// value, and binds `value` per element. An evaluator that reduces arguments
// before dispatch cannot express it, so a `lazy` entry is handed the syntax
// tree and evaluates it itself, once per element.
//
// VALUES CARRY THEIR TYPE. The v1 Go evaluator carried everything as a
// string, which holds until `>` has to order two dates or `+` has to add a
// duration to one. Here the type decides what an operator means.
//
// AN UNKNOWN CONSTRUCT REFUSES BY NAME. A query language that ignores a
// clause it does not understand returns a table that looks complete and is
// wrong, and nobody can see why rows are missing.
import { CLAUSES, Rejection } from "./errors.ts";

const SRC = "engine/expr.ts";

// ---------------------------------------------------------------------------
// VALUES
// ---------------------------------------------------------------------------

/**
 * Months and milliseconds are kept apart because a month is not a fixed
 * span. Adding one to January 31st is a calendar question, not arithmetic.
 */
export class Duration {
  readonly months: number;
  readonly ms: number;
  constructor(months: number, ms: number) {
    this.months = months;
    this.ms = ms;
  }
  scale(n: number): Duration {
    return new Duration(this.months * n, this.ms * n);
  }
  negate(): Duration {
    return new Duration(-this.months, -this.ms);
  }
}

/** A wikilink. Equal to a file when it resolves to it, so `author == this` works. */
export class Link {
  readonly target: string;
  readonly display: string | null;
  constructor(target: string, display: string | null = null) {
    this.target = target;
    this.display = display;
  }
}

export type Value = unknown;

export type TypeName = "null" | "boolean" | "number" | "string" | "date" | "duration" | "list" | "link" | "file" | "regexp" | "object";

/** A row's `file` member is the one object we treat as its own type. */
function isFile(v: unknown): boolean {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  return typeof o.path === "string" && typeof o.name === "string";
}

export function typeOf(v: unknown): TypeName {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean") return "boolean";
  if (typeof v === "number") return "number";
  if (typeof v === "string") return "string";
  if (v instanceof Date) return "date";
  if (v instanceof Duration) return "duration";
  if (v instanceof Link) return "link";
  if (v instanceof RegExp) return "regexp";
  if (Array.isArray(v)) return "list";
  if (isFile(v)) return "file";
  return "object";
}

/** Bases follows JavaScript here, so an empty list is truthy and 0 is not. */
export function isTruthy(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0 && !Number.isNaN(v);
  if (typeof v === "string") return v !== "";
  return true;
}

/** Absent, empty string, or empty list. A number is never empty unless absent. */
export function isEmpty(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

function linkTargetsFile(l: Link, f: Record<string, unknown>): boolean {
  const t = l.target
    .replace(/^\[\[|\]\]$/g, "")
    .split("|")[0]
    .trim();
  const path = String(f.path ?? "");
  const name = String(f.name ?? "");
  return t === path || t === name || t === path.replace(/\.md$/, "");
}

export function equals(a: unknown, b: unknown): boolean {
  const ta = typeOf(a);
  const tb = typeOf(b);
  if (ta === "null" || tb === "null") return ta === tb;
  if (ta === "date" && tb === "string" && DATEISH.test(b as string)) return (a as Date).getTime() === toDate(b).getTime();
  if (tb === "date" && ta === "string" && DATEISH.test(a as string)) return (b as Date).getTime() === toDate(a).getTime();
  if (ta === "date" && tb === "date") return (a as Date).getTime() === (b as Date).getTime();
  if (ta === "link" && tb === "link") return (a as Link).target === (b as Link).target;
  if (ta === "link" && tb === "file") return linkTargetsFile(a as Link, b as Record<string, unknown>);
  if (ta === "file" && tb === "link") return linkTargetsFile(b as Link, a as Record<string, unknown>);
  if (ta === "link" && tb === "string") return (a as Link).target === b;
  if (ta === "string" && tb === "link") return (b as Link).target === a;
  if (ta === "list" && tb === "list") {
    const x = a as unknown[];
    const y = b as unknown[];
    return x.length === y.length && x.every((e, i) => equals(e, y[i]));
  }
  if (ta !== tb) return String(a) === String(b);
  return a === b;
}

/**
 * A property Obsidian carries as a date reaches us as text, because YAML 1.2
 * has no timestamp in its core schema. Comparing one against a real date is
 * the commonest thing a filter does, so the text is promoted rather than
 * refused.
 */
export const DATEISH = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2})?)?$/;

/** Ordering is defined for numbers, dates and strings. Anything else refuses. */
function order(a: unknown, b: unknown, op: string): number {
  let ta = typeOf(a);
  let tb = typeOf(b);
  if (ta === "date" && tb === "string" && DATEISH.test(b as string)) {
    b = toDate(b);
    tb = "date";
  } else if (tb === "date" && ta === "string" && DATEISH.test(a as string)) {
    a = toDate(a);
    ta = "date";
  }
  if (ta === "number" && tb === "number") return (a as number) - (b as number);
  if (ta === "date" && tb === "date") return (a as Date).getTime() - (b as Date).getTime();
  if (ta === "string" && tb === "string") return (a as string).localeCompare(b as string);
  if (ta === "duration" && tb === "duration") return durationMs(a as Duration) - durationMs(b as Duration);
  throw new Rejection({
    clause: CLAUSES.REQUIRED_ARGS,
    expected: `${op} over two numbers, two dates or two strings`,
    got: `${ta} ${op} ${tb}`,
    remedy: {
      tool: "se_file_read",
      args: { path: "project/spec/bases-syntax.md" },
      note: "section 7 says ordering works on numbers and dates",
    },
    source: SRC,
  });
}

function durationMs(d: Duration): number {
  return d.months * 2629800000 + d.ms;
}

const UNITS: Record<string, [number, number]> = {
  y: [12, 0],
  year: [12, 0],
  years: [12, 0],
  M: [1, 0],
  month: [1, 0],
  months: [1, 0],
  w: [0, 604800000],
  week: [0, 604800000],
  weeks: [0, 604800000],
  d: [0, 86400000],
  day: [0, 86400000],
  days: [0, 86400000],
  h: [0, 3600000],
  hour: [0, 3600000],
  hours: [0, 3600000],
  m: [0, 60000],
  minute: [0, 60000],
  minutes: [0, 60000],
  s: [0, 1000],
  second: [0, 1000],
  seconds: [0, 1000],
};

export function parseDuration(text: string): Duration {
  const parts = String(text)
    .trim()
    .match(/-?\d+(?:\.\d+)?\s*[A-Za-z]+/g);
  if (parts === null) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "a duration such as 1d, 2h or 3 months",
      got: JSON.stringify(text),
      remedy: { tool: "se_file_read", args: { path: "project/spec/bases-syntax.md" }, note: "the unit table is in section 7" },
      source: SRC,
    });
  }
  let months = 0;
  let ms = 0;
  for (const p of parts) {
    const m = p.match(/^(-?\d+(?:\.\d+)?)\s*([A-Za-z]+)$/);
    if (m === null) continue;
    const unit = UNITS[m[2]];
    if (unit === undefined) {
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected: `a duration unit: ${Object.keys(UNITS).join(", ")}`,
        got: m[2],
        remedy: { tool: "se_file_read", args: { path: "project/spec/bases-syntax.md" }, note: "the unit table is in section 7" },
        source: SRC,
      });
    }
    months += Number(m[1]) * unit[0];
    ms += Number(m[1]) * unit[1];
  }
  return new Duration(months, ms);
}

function shift(d: Date, by: Duration, sign: number): Date {
  const out = new Date(d.getTime());
  if (by.months !== 0) {
    const day = out.getDate();
    out.setDate(1);
    out.setMonth(out.getMonth() + sign * by.months);
    // Clamp, so the last of January plus one month is the last of February.
    const last = new Date(out.getFullYear(), out.getMonth() + 1, 0).getDate();
    out.setDate(Math.min(day, last));
  }
  return new Date(out.getTime() + sign * by.ms);
}

export function toNumber(v: unknown): number {
  const t = typeOf(v);
  if (t === "number") return v as number;
  if (t === "boolean") return v === true ? 1 : 0;
  if (t === "date") return (v as Date).getTime();
  if (t === "null") return Number.NaN;
  const n = Number(String(v).trim());
  return n;
}

export function toText(v: unknown): string {
  const t = typeOf(v);
  if (t === "null") return "";
  if (t === "date") return isoDate(v as Date);
  if (t === "link") return (v as Link).display ?? (v as Link).target;
  if (t === "list") return (v as unknown[]).map(toText).join(", ");
  if (t === "file") return String((v as Record<string, unknown>).name ?? "");
  if (t === "duration") return durationText(v as Duration);
  if (t === "object") return JSON.stringify(v);
  return String(v);
}

function durationText(d: Duration): string {
  const bits: string[] = [];
  if (d.months !== 0) bits.push(`${d.months}M`);
  if (d.ms !== 0) bits.push(`${d.ms}ms`);
  return bits.length === 0 ? "0s" : bits.join(" ");
}

function isoDate(d: Date): string {
  const p = (n: number, w = 2): string => String(n).padStart(w, "0");
  const time = d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0;
  const day = `${p(d.getFullYear(), 4)}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  return time ? day : `${day} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export function toDate(v: unknown): Date {
  if (v instanceof Date) return v;
  const text = String(v).trim();
  const m = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (m === null) {
    const loose = new Date(text);
    if (Number.isNaN(loose.getTime())) {
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected: "a date such as 2026-08-01 or 2026-08-01 13:45:00",
        got: JSON.stringify(text),
        remedy: { tool: "se_file_read", args: { path: "project/spec/bases-syntax.md" }, note: "date() parses YYYY-MM-DD HH:mm:ss" },
        source: SRC,
      });
    }
    return loose;
  }
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4] ?? 0), Number(m[5] ?? 0), Number(m[6] ?? 0));
}

// ---------------------------------------------------------------------------
// LEXER
// ---------------------------------------------------------------------------

type Tok =
  | { k: "num"; v: number }
  | { k: "str"; v: string }
  | { k: "regex"; v: RegExp }
  | { k: "id"; v: string }
  | { k: "op"; v: string }
  | { k: "end" };

const OPS = [
  "===",
  "!==",
  "==",
  "!=",
  ">=",
  "<=",
  "&&",
  "||",
  ">",
  "<",
  "+",
  "-",
  "*",
  "/",
  "%",
  "!",
  "(",
  ")",
  "[",
  "]",
  "{",
  "}",
  ",",
  ".",
  ":",
];

function lex(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  const prevAllowsRegex = (): boolean => {
    const last = out[out.length - 1];
    if (last === undefined) return true;
    if (last.k === "op") return last.v !== ")" && last.v !== "]";
    return false;
  };
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(src[i + 1] ?? ""))) {
      const m = src.slice(i).match(/^\d*\.?\d+(?:[eE][+-]?\d+)?/);
      if (m !== null) {
        out.push({ k: "num", v: Number(m[0]) });
        i += m[0].length;
        continue;
      }
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      let text = "";
      while (j < src.length && src[j] !== c) {
        if (src[j] === "\\") {
          const esc = src[j + 1];
          text += esc === "n" ? "\n" : esc === "t" ? "\t" : esc;
          j += 2;
          continue;
        }
        text += src[j];
        j++;
      }
      if (j >= src.length) {
        throw new Rejection({
          clause: CLAUSES.REQUIRED_ARGS,
          expected: `a closing ${c}`,
          got: src,
          remedy: { tool: "se_file_read", args: { path: "project/spec/bases-syntax.md" }, note: "strings take single or double quotes" },
          source: SRC,
        });
      }
      out.push({ k: "str", v: text });
      i = j + 1;
      continue;
    }
    if (c === "/" && prevAllowsRegex()) {
      let j = i + 1;
      let body = "";
      let cls = false;
      while (j < src.length && (cls || src[j] !== "/")) {
        if (src[j] === "\\") {
          body += src[j] + (src[j + 1] ?? "");
          j += 2;
          continue;
        }
        if (src[j] === "[") cls = true;
        if (src[j] === "]") cls = false;
        body += src[j];
        j++;
      }
      if (j < src.length) {
        const flags = (src.slice(j + 1).match(/^[gimsuy]*/) ?? [""])[0];
        out.push({ k: "regex", v: new RegExp(body, flags) });
        i = j + 1 + flags.length;
        continue;
      }
    }
    if (/[A-Za-z_$]/.test(c)) {
      const m = src.slice(i).match(/^[A-Za-z_$][A-Za-z0-9_$-]*/)!;
      out.push({ k: "id", v: m[0] });
      i += m[0].length;
      continue;
    }
    const op = OPS.find((o) => src.startsWith(o, i));
    if (op !== undefined) {
      out.push({ k: "op", v: op });
      i += op.length;
      continue;
    }
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "a character the expression language knows",
      got: `${JSON.stringify(c)} at position ${i} of ${JSON.stringify(src)}`,
      remedy: { tool: "se_file_read", args: { path: "project/spec/bases-syntax.md" }, note: "section 7 lists every operator" },
      source: SRC,
    });
  }
  out.push({ k: "end" });
  return out;
}

// ---------------------------------------------------------------------------
// PARSER
// ---------------------------------------------------------------------------

export type Node =
  | { k: "lit"; v: unknown }
  | { k: "list"; items: Node[] }
  | { k: "object"; entries: [string, Node][] }
  | { k: "id"; name: string }
  | { k: "prop"; x: Node; name: string }
  | { k: "index"; x: Node; i: Node }
  | { k: "call"; recv: Node | null; name: string; args: Node[] }
  | { k: "unary"; op: string; x: Node }
  | { k: "binary"; op: string; a: Node; b: Node };

class Parser {
  private pos = 0;
  private readonly toks: Tok[];
  private readonly src: string;
  constructor(toks: Tok[], src: string) {
    this.toks = toks;
    this.src = src;
  }

  private peek(): Tok {
    return this.toks[this.pos];
  }
  private isOp(v: string): boolean {
    const t = this.peek();
    return t.k === "op" && t.v === v;
  }
  private eat(v: string): boolean {
    if (this.isOp(v)) {
      this.pos++;
      return true;
    }
    return false;
  }
  private expect(v: string): void {
    if (!this.eat(v)) {
      const t = this.peek();
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected: `${v} in ${JSON.stringify(this.src)}`,
        got: t.k === "end" ? "the end of the expression" : JSON.stringify(String((t as { v: unknown }).v)),
        remedy: { tool: "se_file_read", args: { path: "project/spec/bases-syntax.md" }, note: "section 7 lists every operator" },
        source: SRC,
      });
    }
  }

  parse(): Node {
    const n = this.or();
    if (this.peek().k !== "end") {
      const t = this.peek();
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected: "the end of the expression",
        got: `${JSON.stringify(String((t as { v: unknown }).v))} left over in ${JSON.stringify(this.src)}`,
        remedy: { tool: "se_file_read", args: { path: "project/spec/bases-syntax.md" }, note: "section 7 lists every operator" },
        source: SRC,
      });
    }
    return n;
  }

  private or(): Node {
    let a = this.and();
    while (this.isOp("||")) {
      this.pos++;
      a = { k: "binary", op: "||", a, b: this.and() };
    }
    return a;
  }
  private and(): Node {
    let a = this.equality();
    while (this.isOp("&&")) {
      this.pos++;
      a = { k: "binary", op: "&&", a, b: this.equality() };
    }
    return a;
  }
  private equality(): Node {
    let a = this.comparison();
    for (;;) {
      const t = this.peek();
      if (t.k === "op" && (t.v === "==" || t.v === "!=" || t.v === "===" || t.v === "!==")) {
        this.pos++;
        a = { k: "binary", op: t.v.slice(0, 2), a, b: this.comparison() };
        continue;
      }
      return a;
    }
  }
  private comparison(): Node {
    let a = this.additive();
    for (;;) {
      const t = this.peek();
      if (t.k === "op" && (t.v === ">" || t.v === "<" || t.v === ">=" || t.v === "<=")) {
        this.pos++;
        a = { k: "binary", op: t.v, a, b: this.additive() };
        continue;
      }
      return a;
    }
  }
  private additive(): Node {
    let a = this.multiplicative();
    for (;;) {
      const t = this.peek();
      if (t.k === "op" && (t.v === "+" || t.v === "-")) {
        this.pos++;
        a = { k: "binary", op: t.v, a, b: this.multiplicative() };
        continue;
      }
      return a;
    }
  }
  private multiplicative(): Node {
    let a = this.unary();
    for (;;) {
      const t = this.peek();
      if (t.k === "op" && (t.v === "*" || t.v === "/" || t.v === "%")) {
        this.pos++;
        a = { k: "binary", op: t.v, a, b: this.unary() };
        continue;
      }
      return a;
    }
  }
  private unary(): Node {
    if (this.isOp("!")) {
      this.pos++;
      return { k: "unary", op: "!", x: this.unary() };
    }
    if (this.isOp("-")) {
      this.pos++;
      return { k: "unary", op: "-", x: this.unary() };
    }
    return this.postfix();
  }

  private postfix(): Node {
    let x = this.primary();
    for (;;) {
      if (this.eat(".")) {
        const t = this.peek();
        if (t.k !== "id") {
          throw new Rejection({
            clause: CLAUSES.REQUIRED_ARGS,
            expected: "a property or function name after the dot",
            got: JSON.stringify(this.src),
            remedy: { tool: "se_file_read", args: { path: "project/spec/bases-syntax.md" }, note: "section 4 covers property references" },
            source: SRC,
          });
        }
        this.pos++;
        if (this.isOp("(")) {
          x = { k: "call", recv: x, name: t.v, args: this.args() };
          continue;
        }
        x = { k: "prop", x, name: t.v };
        continue;
      }
      if (this.eat("[")) {
        const i = this.or();
        this.expect("]");
        x = { k: "index", x, i };
        continue;
      }
      return x;
    }
  }

  private args(): Node[] {
    this.expect("(");
    const out: Node[] = [];
    if (this.eat(")")) return out;
    for (;;) {
      out.push(this.or());
      if (this.eat(",")) continue;
      this.expect(")");
      return out;
    }
  }

  private primary(): Node {
    const t = this.peek();
    if (t.k === "num") {
      this.pos++;
      return { k: "lit", v: t.v };
    }
    if (t.k === "str") {
      this.pos++;
      return { k: "lit", v: t.v };
    }
    if (t.k === "regex") {
      this.pos++;
      return { k: "lit", v: t.v };
    }
    if (t.k === "id") {
      this.pos++;
      if (t.v === "true") return { k: "lit", v: true };
      if (t.v === "false") return { k: "lit", v: false };
      if (t.v === "null") return { k: "lit", v: null };
      if (this.isOp("(")) return { k: "call", recv: null, name: t.v, args: this.args() };
      return { k: "id", name: t.v };
    }
    if (this.eat("(")) {
      const n = this.or();
      this.expect(")");
      return n;
    }
    if (this.eat("[")) {
      const items: Node[] = [];
      if (this.eat("]")) return { k: "list", items };
      for (;;) {
        items.push(this.or());
        if (this.eat(",")) continue;
        this.expect("]");
        return { k: "list", items };
      }
    }
    if (this.eat("{")) {
      const entries: [string, Node][] = [];
      if (this.eat("}")) return { k: "object", entries };
      for (;;) {
        const key = this.peek();
        if (key.k !== "str" && key.k !== "id") {
          throw new Rejection({
            clause: CLAUSES.REQUIRED_ARGS,
            expected: "an object key",
            got: JSON.stringify(this.src),
            remedy: { tool: "se_file_read", args: { path: "project/spec/bases-syntax.md" }, note: "section 8 covers objects" },
            source: SRC,
          });
        }
        this.pos++;
        this.expect(":");
        entries.push([String(key.v), this.or()]);
        if (this.eat(",")) continue;
        this.expect("}");
        return { k: "object", entries };
      }
    }
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "a value, a property or a function call",
      got: t.k === "end" ? `nothing, in ${JSON.stringify(this.src)}` : JSON.stringify(String((t as { v: unknown }).v)),
      remedy: { tool: "se_file_read", args: { path: "project/spec/bases-syntax.md" }, note: "section 8 lists every type literal" },
      source: SRC,
    });
  }
}

const PARSED = new Map<string, Node>();

/** Parsing is memoised: a filter is re-run per row and the tree never changes. */
export function parseExpr(src: string): Node {
  const hit = PARSED.get(src);
  if (hit !== undefined) return hit;
  const node = new Parser(lex(src), src).parse();
  PARSED.set(src, node);
  return node;
}

// ---------------------------------------------------------------------------
// THE FUNCTION REGISTRY
// ---------------------------------------------------------------------------

export interface Ctx {
  /** The row: its frontmatter, plus `file`. */
  row: Record<string, unknown>;
  /** The note a view is embedded in, for `this`. */
  self?: Record<string, unknown>;
  /** Named formulas as source, evaluated on demand. */
  formulas?: Record<string, string>;
  /** Bindings a call-by-name function makes: value, index, acc. */
  locals?: Record<string, unknown>;
  /** Refuse now() and today() so a render regenerates byte-identically. */
  deterministic?: boolean;
  /** Guards a formula that references itself. */
  active?: Set<string>;
}

export interface Fn {
  /** A lazy entry receives the syntax tree and binds its own locals. */
  lazy?: boolean;
  /** A volatile entry refuses under `deterministic`. */
  volatile?: boolean;
  call(recv: unknown, args: unknown[], ctx: Ctx, raw: Node[]): unknown;
}

/** Global functions, then one table per type. Both are open for extension. */
export const GLOBALS = new Map<string, Fn>();
export const METHODS = new Map<TypeName, Map<string, Fn>>();

function global(name: string, call: Fn["call"], extra: Partial<Fn> = {}): void {
  GLOBALS.set(name, { call, ...extra });
}

function method(types: TypeName[], name: string, call: Fn["call"], extra: Partial<Fn> = {}): void {
  for (const t of types) {
    let table = METHODS.get(t);
    if (table === undefined) {
      table = new Map();
      METHODS.set(t, table);
    }
    table.set(name, { call, ...extra });
  }
}

/** The seam the owner asked for: our own functions register the same way. */
export function registerGlobal(name: string, fn: Fn): void {
  GLOBALS.set(name, fn);
}

export function registerMethod(type: TypeName, name: string, fn: Fn): void {
  let table = METHODS.get(type);
  if (table === undefined) {
    table = new Map();
    METHODS.set(type, table);
  }
  table.set(name, fn);
}

const ALL: TypeName[] = ["null", "boolean", "number", "string", "date", "duration", "list", "link", "file", "regexp", "object"];

// --- global ---------------------------------------------------------------

global("if", (_r, a) => (isTruthy(a[0]) ? a[1] : (a[2] ?? null)));
global("date", (_r, a) => toDate(a[0]));
global("duration", (_r, a) => (a[0] instanceof Duration ? a[0] : parseDuration(toText(a[0]))));
global("number", (_r, a) => toNumber(a[0]));
global("list", (_r, a) => (Array.isArray(a[0]) ? a[0] : [a[0]]));
global("link", (_r, a) => new Link(a[0] instanceof Link ? (a[0] as Link).target : toText(a[0]), a.length > 1 ? toText(a[1]) : null));
global("max", (_r, a) => Math.max(...a.map(toNumber)));
global("min", (_r, a) => Math.min(...a.map(toNumber)));
global("now", () => new Date(), { volatile: true });
global(
  "today",
  () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  },
  { volatile: true },
);
global("random", () => Math.random(), { volatile: true });
global("escapeHTML", (_r, a) => toText(a[0]).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"));
global("html", (_r, a) => ({ html: toText(a[0]) }));
global("icon", (_r, a) => ({ icon: toText(a[0]) }));
global("image", (_r, a) => ({ image: toText(a[0]) }));
global("file", (_r, a, ctx) =>
  isFile(a[0])
    ? a[0]
    : { name: toText(a[0]).split("/").pop() ?? "", path: toText(a[0]), folder: "", ext: "md", ...((ctx.row.file as object) ?? {}) },
);

// --- any ------------------------------------------------------------------

method(ALL, "isTruthy", (r) => isTruthy(r));
method(ALL, "isType", (r, a) => typeOf(r) === toText(a[0]));
method(ALL, "toString", (r) => toText(r));
method(ALL, "isEmpty", (r) => isEmpty(r));

// --- string ---------------------------------------------------------------

method(["string"], "contains", (r, a) => String(r).includes(toText(a[0])));
method(["string"], "containsAll", (r, a) => a.every((x) => String(r).includes(toText(x))));
method(["string"], "containsAny", (r, a) => a.some((x) => String(r).includes(toText(x))));
method(["string"], "startsWith", (r, a) => String(r).startsWith(toText(a[0])));
method(["string"], "endsWith", (r, a) => String(r).endsWith(toText(a[0])));
method(["string"], "lower", (r) => String(r).toLowerCase());
method(["string"], "upper", (r) => String(r).toUpperCase());
method(["string"], "trim", (r) => String(r).trim());
method(["string"], "reverse", (r) => [...String(r)].reverse().join(""));
method(["string"], "repeat", (r, a) => String(r).repeat(Math.max(0, Math.trunc(toNumber(a[0])))));
method(["string"], "slice", (r, a) => (a.length > 1 ? String(r).slice(toNumber(a[0]), toNumber(a[1])) : String(r).slice(toNumber(a[0]))));
method(["string"], "title", (r) => String(r).replace(/\b\w/g, (c) => c.toUpperCase()));
method(["string"], "replace", (r, a) => {
  const pattern = a[0];
  const to = toText(a[1]);
  if (pattern instanceof RegExp) return String(r).replace(pattern, to);
  return String(r).split(toText(pattern)).join(to);
});
method(["string"], "split", (r, a) => {
  const parts = a[0] instanceof RegExp ? String(r).split(a[0] as RegExp) : String(r).split(toText(a[0]));
  return a.length > 1 ? parts.slice(0, Math.trunc(toNumber(a[1]))) : parts;
});

// --- number ---------------------------------------------------------------

method(["number"], "abs", (r) => Math.abs(r as number));
method(["number"], "ceil", (r) => Math.ceil(r as number));
method(["number"], "floor", (r) => Math.floor(r as number));
method(["number"], "round", (r, a) => {
  const digits = a.length > 0 ? Math.trunc(toNumber(a[0])) : 0;
  const f = 10 ** digits;
  return Math.round((r as number) * f) / f;
});
method(["number"], "toFixed", (r, a) => (r as number).toFixed(Math.trunc(toNumber(a[0]))));

// --- date -----------------------------------------------------------------

const MOMENT = /YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd|HH|H|hh|h|mm|m|ss|s|SSS|A|a/g;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function formatDate(d: Date, fmt: string): string {
  const p = (n: number, w = 2): string => String(n).padStart(w, "0");
  return fmt.replace(MOMENT, (t) => {
    switch (t) {
      case "YYYY":
        return p(d.getFullYear(), 4);
      case "YY":
        return p(d.getFullYear() % 100);
      case "MMMM":
        return MONTHS[d.getMonth()];
      case "MMM":
        return MONTHS[d.getMonth()].slice(0, 3);
      case "MM":
        return p(d.getMonth() + 1);
      case "M":
        return String(d.getMonth() + 1);
      case "DD":
        return p(d.getDate());
      case "D":
        return String(d.getDate());
      case "dddd":
        return DAYS[d.getDay()];
      case "ddd":
        return DAYS[d.getDay()].slice(0, 3);
      case "HH":
        return p(d.getHours());
      case "H":
        return String(d.getHours());
      case "hh":
        return p(d.getHours() % 12 === 0 ? 12 : d.getHours() % 12);
      case "h":
        return String(d.getHours() % 12 === 0 ? 12 : d.getHours() % 12);
      case "mm":
        return p(d.getMinutes());
      case "m":
        return String(d.getMinutes());
      case "ss":
        return p(d.getSeconds());
      case "s":
        return String(d.getSeconds());
      case "SSS":
        return p(d.getMilliseconds(), 3);
      case "A":
        return d.getHours() < 12 ? "AM" : "PM";
      case "a":
        return d.getHours() < 12 ? "am" : "pm";
      default:
        return t;
    }
  });
}

method(["date"], "format", (r, a) => formatDate(r as Date, toText(a[0])));
method(["date"], "date", (r) => {
  const d = r as Date;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
});
method(["date"], "time", (r) => formatDate(r as Date, "HH:mm:ss"));
method(["date"], "isEmpty", () => false);
method(["date"], "relative", (r) => {
  const ms = Date.now() - (r as Date).getTime();
  const past = ms >= 0;
  const abs = Math.abs(ms);
  const steps: [number, string][] = [
    [86400000 * 365, "year"],
    [86400000 * 30, "month"],
    [86400000, "day"],
    [3600000, "hour"],
    [60000, "minute"],
    [1000, "second"],
  ];
  for (const [span, name] of steps) {
    const n = Math.floor(abs / span);
    if (n >= 1) return past ? `${n} ${name}${n === 1 ? "" : "s"} ago` : `in ${n} ${name}${n === 1 ? "" : "s"}`;
  }
  return "just now";
});

// --- list -----------------------------------------------------------------

const asList = (r: unknown): unknown[] => (Array.isArray(r) ? r : [r]);

method(["list"], "contains", (r, a) => asList(r).some((e) => equals(e, a[0])));
method(["list"], "containsAll", (r, a) => a.every((x) => asList(r).some((e) => equals(e, x))));
method(["list"], "containsAny", (r, a) => a.some((x) => asList(r).some((e) => equals(e, x))));
method(["list"], "join", (r, a) =>
  asList(r)
    .map(toText)
    .join(a.length > 0 ? toText(a[0]) : ", "),
);
method(["list"], "reverse", (r) => [...asList(r)].reverse());
method(["list"], "unique", (r) => {
  const out: unknown[] = [];
  for (const e of asList(r)) if (!out.some((x) => equals(x, e))) out.push(e);
  return out;
});
method(["list"], "flat", (r) => asList(r).flat());
method(["list"], "slice", (r, a) => (a.length > 1 ? asList(r).slice(toNumber(a[0]), toNumber(a[1])) : asList(r).slice(toNumber(a[0]))));
method(["list"], "sort", (r) => [...asList(r)].sort((x, y) => order(x, y, "<")));
method(["list"], "sum", (r) => asList(r).reduce<number>((n, e) => n + toNumber(e), 0));

// The three call-by-name entries. They take the TREE, not the value.
method(
  ["list"],
  "filter",
  (r, _a, ctx, raw) => {
    const body = raw[0];
    return asList(r).filter((e, i) => isTruthy(evaluate(body, bind(ctx, { value: e, index: i }))));
  },
  { lazy: true },
);

method(
  ["list"],
  "map",
  (r, _a, ctx, raw) => {
    const body = raw[0];
    return asList(r).map((e, i) => evaluate(body, bind(ctx, { value: e, index: i })));
  },
  { lazy: true },
);

method(
  ["list"],
  "reduce",
  (r, _a, ctx, raw) => {
    const body = raw[0];
    let acc: unknown = raw.length > 1 ? evaluate(raw[1], ctx) : null;
    asList(r).forEach((e, i) => {
      acc = evaluate(body, bind(ctx, { value: e, index: i, acc }));
    });
    return acc;
  },
  { lazy: true },
);

// --- link and file --------------------------------------------------------

method(["link"], "asFile", (r, _a, ctx) =>
  linkTargetsFile(r as Link, (ctx.row.file as Record<string, unknown>) ?? {}) ? ctx.row.file : null,
);
method(["link"], "linksTo", (r, a) => equals(r, a[0]));

method(["file"], "hasTag", (r, a) => {
  const tags = asList((r as Record<string, unknown>).tags ?? []).map(toText);
  return a.some((x) => tags.includes(toText(x).replace(/^#/, "")));
});
method(["file"], "hasLink", (r, a) => {
  const links = asList((r as Record<string, unknown>).links ?? []);
  return a.some((x) => links.some((l) => equals(l, x)));
});
method(["file"], "hasProperty", (r, a) => {
  const v = (r as Record<string, unknown>)[toText(a[0])];
  return v !== undefined && v !== null;
});
method(
  ["file"],
  "asLink",
  (r) => new Link(String((r as Record<string, unknown>).path ?? ""), String((r as Record<string, unknown>).name ?? "")),
);

// --- object and regexp ----------------------------------------------------

method(["object"], "keys", (r) => Object.keys(r as object));
method(["object"], "values", (r) => Object.values(r as object));
method(["regexp"], "matches", (r, a) => (r as RegExp).test(toText(a[0])));

// ---------------------------------------------------------------------------
// EVALUATOR
// ---------------------------------------------------------------------------

function bind(ctx: Ctx, locals: Record<string, unknown>): Ctx {
  return { ...ctx, locals: { ...ctx.locals, ...locals } };
}

/** Fields that are read off a value rather than called. */
function builtinField(recv: unknown, name: string): { hit: boolean; v?: unknown } {
  const t = typeOf(recv);
  if (t === "string" && name === "length") return { hit: true, v: (recv as string).length };
  if (t === "list" && name === "length") return { hit: true, v: (recv as unknown[]).length };
  if (t === "link") {
    if (name === "display") return { hit: true, v: (recv as Link).display };
    if (name === "path" || name === "target") return { hit: true, v: (recv as Link).target };
  }
  if (t === "date") {
    const d = recv as Date;
    switch (name) {
      case "year":
        return { hit: true, v: d.getFullYear() };
      case "month":
        return { hit: true, v: d.getMonth() + 1 };
      case "day":
        return { hit: true, v: d.getDate() };
      case "hour":
        return { hit: true, v: d.getHours() };
      case "minute":
        return { hit: true, v: d.getMinutes() };
      case "second":
        return { hit: true, v: d.getSeconds() };
      case "millisecond":
        return { hit: true, v: d.getMilliseconds() };
      default:
        break;
    }
  }
  return { hit: false };
}

function resolveRoot(name: string, ctx: Ctx): unknown {
  if (ctx.locals !== undefined && name in ctx.locals) return ctx.locals[name];
  if (name === "note") return ctx.row;
  if (name === "file") return ctx.row.file ?? null;
  if (name === "this") return ctx.self ?? ctx.row;
  if (name === "formula") return { formula: true };
  // A bare name is `note.` — the reference says so, and every shipped file relies on it.
  return ctx.row[name] ?? null;
}

function formulaValue(name: string, ctx: Ctx): unknown {
  const src = ctx.formulas?.[name];
  if (src === undefined) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: `a formula named in this base: ${Object.keys(ctx.formulas ?? {}).join(", ") || "none declared"}`,
      got: `formula.${name}`,
      remedy: { tool: "se_file_read", args: { path: "project/spec/bases-syntax.md" }, note: "section 3 covers formulas" },
      source: SRC,
    });
  }
  const active = ctx.active ?? new Set<string>();
  if (active.has(name)) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "a formula that does not reference itself",
      got: `formula.${name} is defined in terms of itself`,
      remedy: { tool: "se_file_read", args: { path: "project/spec/bases-syntax.md" }, note: "section 3 covers formulas" },
      source: SRC,
    });
  }
  active.add(name);
  try {
    return evaluate(parseExpr(src), { ...ctx, active });
  } finally {
    active.delete(name);
  }
}

export function evaluate(node: Node, ctx: Ctx): unknown {
  switch (node.k) {
    case "lit":
      return node.v;
    case "list":
      return node.items.map((i) => evaluate(i, ctx));
    case "object": {
      const out: Record<string, unknown> = {};
      for (const [k, v] of node.entries) out[k] = evaluate(v, ctx);
      return out;
    }
    case "id":
      return resolveRoot(node.name, ctx);
    case "prop": {
      if (node.x.k === "id" && node.x.name === "formula") return formulaValue(node.name, ctx);
      const recv = evaluate(node.x, ctx);
      const field = builtinField(recv, node.name);
      if (field.hit) return field.v;
      if (recv === null || recv === undefined) return null;
      if (typeof recv !== "object") return null;
      return (recv as Record<string, unknown>)[node.name] ?? null;
    }
    case "index": {
      const recv = evaluate(node.x, ctx);
      const i = evaluate(node.i, ctx);
      if (Array.isArray(recv)) return recv[Math.trunc(toNumber(i))] ?? null;
      if (recv !== null && typeof recv === "object") return (recv as Record<string, unknown>)[toText(i)] ?? null;
      return null;
    }
    case "unary": {
      if (node.op === "!") return !isTruthy(evaluate(node.x, ctx));
      const v = evaluate(node.x, ctx);
      if (v instanceof Duration) return v.negate();
      return -toNumber(v);
    }
    case "binary":
      return binary(node, ctx);
    case "call":
      return call(node, ctx);
  }
}

function binary(node: Node & { k: "binary" }, ctx: Ctx): unknown {
  // Short-circuit, so `x && x.foo()` is safe the way it is in JavaScript.
  if (node.op === "&&") {
    const a = evaluate(node.a, ctx);
    return isTruthy(a) ? isTruthy(evaluate(node.b, ctx)) : false;
  }
  if (node.op === "||") {
    const a = evaluate(node.a, ctx);
    return isTruthy(a) ? true : isTruthy(evaluate(node.b, ctx));
  }
  const a = evaluate(node.a, ctx);
  const b = evaluate(node.b, ctx);
  switch (node.op) {
    case "==":
      return equals(a, b);
    case "!=":
      return !equals(a, b);
    case ">":
      return order(a, b, ">") > 0;
    case "<":
      return order(a, b, "<") < 0;
    case ">=":
      return order(a, b, ">=") >= 0;
    case "<=":
      return order(a, b, "<=") <= 0;
    case "+":
      return add(a, b);
    case "-":
      return subtract(a, b);
    case "*":
      return multiply(a, b);
    case "/":
      return toNumber(a) / toNumber(b);
    case "%":
      return toNumber(a) % toNumber(b);
    default:
      return null;
  }
}

function add(a: unknown, b: unknown): unknown {
  const ta = typeOf(a);
  const tb = typeOf(b);
  if (ta === "date") return shift(a as Date, tb === "duration" ? (b as Duration) : parseDuration(toText(b)), 1);
  if (ta === "duration" && tb === "duration")
    return new Duration((a as Duration).months + (b as Duration).months, (a as Duration).ms + (b as Duration).ms);
  if (ta === "list" && tb === "list") return [...(a as unknown[]), ...(b as unknown[])];
  if (ta === "string" || tb === "string") return toText(a) + toText(b);
  return toNumber(a) + toNumber(b);
}

function subtract(a: unknown, b: unknown): unknown {
  const ta = typeOf(a);
  const tb = typeOf(b);
  // The reference is explicit: a date minus a date is milliseconds.
  if (ta === "date" && tb === "date") return (a as Date).getTime() - (b as Date).getTime();
  if (ta === "date") return shift(a as Date, tb === "duration" ? (b as Duration) : parseDuration(toText(b)), -1);
  if (ta === "duration" && tb === "duration")
    return new Duration((a as Duration).months - (b as Duration).months, (a as Duration).ms - (b as Duration).ms);
  return toNumber(a) - toNumber(b);
}

function multiply(a: unknown, b: unknown): unknown {
  // The duration goes on the left; the reference says so and Obsidian enforces it.
  if (a instanceof Duration) return a.scale(toNumber(b));
  if (b instanceof Duration) {
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: "the duration on the left, as in duration('5h') * 2",
      got: "a duration on the right of *",
      remedy: { tool: "se_file_read", args: { path: "project/spec/bases-syntax.md" }, note: "section 7 states the ordering rule" },
      source: SRC,
    });
  }
  return toNumber(a) * toNumber(b);
}

function call(node: Node & { k: "call" }, ctx: Ctx): unknown {
  if (node.recv === null) {
    const fn = GLOBALS.get(node.name);
    if (fn === undefined) {
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected: `a global function: ${[...GLOBALS.keys()].sort().join(", ")}`,
        got: `${node.name}()`,
        remedy: {
          tool: "se_file_read",
          args: { path: "project/spec/bases-syntax.md" },
          note: "section 9 lists every function; register our own with registerGlobal",
        },
        source: SRC,
      });
    }
    guardVolatile(fn, node.name, ctx);
    const args = fn.lazy === true ? [] : node.args.map((a) => evaluate(a, ctx));
    return fn.call(null, args, ctx, node.args);
  }

  const recv = evaluate(node.recv, ctx);
  const t = typeOf(recv);
  const fn = METHODS.get(t)?.get(node.name) ?? METHODS.get("null")?.get(node.name);
  if (fn === undefined) {
    const known = [...(METHODS.get(t)?.keys() ?? [])].sort();
    throw new Rejection({
      clause: CLAUSES.REQUIRED_ARGS,
      expected: known.length > 0 ? `a ${t} function: ${known.join(", ")}` : `a function on a ${t}`,
      got: `${t}.${node.name}()`,
      remedy: {
        tool: "se_file_read",
        args: { path: "project/spec/bases-syntax.md" },
        note: "section 9 lists every function; register our own with registerMethod",
      },
      source: SRC,
    });
  }
  guardVolatile(fn, node.name, ctx);
  const args = fn.lazy === true ? [] : node.args.map((a) => evaluate(a, ctx));
  return fn.call(recv, args, ctx, node.args);
}

function guardVolatile(fn: Fn, name: string, ctx: Ctx): void {
  if (fn.volatile !== true || ctx.deterministic !== true) return;
  throw new Rejection({
    clause: CLAUSES.REQUIRED_ARGS,
    expected: "an expression whose value does not move between renders",
    got: `${name}() in a render that must regenerate byte-identically`,
    remedy: {
      tool: "se_file_read",
      args: { path: "project/spec/bases-syntax.md" },
      note: "pass deterministic: false where a moving value is wanted",
    },
    source: SRC,
  });
}

/**
 * A TOTAL order, for sorting a column.
 *
 * `<` refuses two things it cannot rank, which is right for a filter and
 * useless for a sort: a column with one empty cell would take the whole table
 * down. Here absence sorts last, like values compare by their own type, and
 * anything left falls back to text.
 */
export function compare(a: unknown, b: unknown): number {
  const ta = typeOf(a);
  const tb = typeOf(b);
  if (ta === "null" && tb === "null") return 0;
  if (ta === "null") return 1;
  if (tb === "null") return -1;
  if (ta === "number" && tb === "number") return (a as number) - (b as number);
  if (ta === "date" && tb === "date") return (a as Date).getTime() - (b as Date).getTime();
  if (ta === "duration" && tb === "duration") return durationMs(a as Duration) - durationMs(b as Duration);
  if (ta === "boolean" && tb === "boolean") return a === b ? 0 : a === true ? 1 : -1;
  return toText(a).localeCompare(toText(b), undefined, { numeric: true });
}

/** Run one expression against one row. The entry point a filter uses. */
export function evalExpr(src: string, ctx: Ctx): unknown {
  return evaluate(parseExpr(src), ctx);
}

/** A filter passes when its expression is truthy. */
export function passes(src: string, ctx: Ctx): boolean {
  return isTruthy(evalExpr(src, ctx));
}
