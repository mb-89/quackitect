// THE VALUES THE EXPRESSION LANGUAGE KNOWS: what a thing IS, when two are
// equal, how they order, and how each reads back as text, a number or a date.
//
// Split out of expr.ts. The evaluator leans on all of it and none of it
// leans back.
//
// see dsp-live-register.md#the-expression-language-is-three-things
import { CLAUSES, Rejection } from "./errors.ts";

/** Where a refusal from this file says it came from. */
const SRC = "engine/expr-value.ts";

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
export function isFile(v: unknown): boolean {
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

export function linkTargetsFile(l: Link, f: Record<string, unknown>): boolean {
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
export function order(a: unknown, b: unknown, op: string): number {
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
      args: { path: "spec/bases-syntax.md" },
      note: "section 7 says ordering works on numbers and dates",
    },
    source: SRC,
  });
}

export function durationMs(d: Duration): number {
  return d.months * 2629800000 + d.ms;
}

export const UNITS: Record<string, [number, number]> = {
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
      remedy: { tool: "se_file_read", args: { path: "spec/bases-syntax.md" }, note: "the unit table is in section 7" },
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
        remedy: { tool: "se_file_read", args: { path: "spec/bases-syntax.md" }, note: "the unit table is in section 7" },
        source: SRC,
      });
    }
    months += Number(m[1]) * unit[0];
    ms += Number(m[1]) * unit[1];
  }
  return new Duration(months, ms);
}

export function shift(d: Date, by: Duration, sign: number): Date {
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

export function durationText(d: Duration): string {
  const bits: string[] = [];
  if (d.months !== 0) bits.push(`${d.months}M`);
  if (d.ms !== 0) bits.push(`${d.ms}ms`);
  return bits.length === 0 ? "0s" : bits.join(" ");
}

export function isoDate(d: Date): string {
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
        remedy: { tool: "se_file_read", args: { path: "spec/bases-syntax.md" }, note: "date() parses YYYY-MM-DD HH:mm:ss" },
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
