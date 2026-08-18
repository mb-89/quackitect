// THE EXPRESSION LANGUAGE, LEXED AND PARSED: source text in, a syntax tree
// out. Nothing here evaluates anything.
//
// Split out of expr.ts.
//
// see dsp-live-register.md#the-expression-language-is-three-things
import { CLAUSES, Rejection } from "./errors.ts";

/** Where a refusal from this file says it came from. */
const SRC = "engine/expr-parse.ts";

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

function lexNumber(src: string, i: number): { tok: Tok; next: number } | undefined {
  const c = src[i];
  if (!(/[0-9]/.test(c) || (c === "." && /[0-9]/.test(src[i + 1] ?? "")))) return undefined;
  const m = src.slice(i).match(/^\d*\.?\d+(?:[eE][+-]?\d+)?/);
  if (m === null) return undefined;
  return { tok: { k: "num", v: Number(m[0]) }, next: i + m[0].length };
}

function lexString(src: string, i: number): { tok: Tok; next: number } {
  const quote = src[i];
  let j = i + 1;
  let text = "";
  while (j < src.length && src[j] !== quote) {
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
      expected: `a closing ${quote}`,
      got: src,
      remedy: { tool: "se_file_read", args: { path: "project/spec/bases-syntax.md" }, note: "strings take single or double quotes" },
      source: SRC,
    });
  }
  return { tok: { k: "str", v: text }, next: j + 1 };
}

function lexRegex(src: string, i: number): { tok: Tok; next: number } | undefined {
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
  if (j >= src.length) return undefined;
  const flags = (src.slice(j + 1).match(/^[gimsuy]*/) ?? [""])[0];
  return { tok: { k: "regex", v: new RegExp(body, flags) }, next: j + 1 + flags.length };
}

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
    const num = lexNumber(src, i);
    if (num !== undefined) {
      out.push(num.tok);
      i = num.next;
      continue;
    }
    if (c === '"' || c === "'") {
      const s = lexString(src, i);
      out.push(s.tok);
      i = s.next;
      continue;
    }
    if (c === "/" && prevAllowsRegex()) {
      const r = lexRegex(src, i);
      if (r !== undefined) {
        out.push(r.tok);
        i = r.next;
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

  private listLiteral(): Node {
    const items: Node[] = [];
    if (this.eat("]")) return { k: "list", items };
    for (;;) {
      items.push(this.or());
      if (this.eat(",")) continue;
      this.expect("]");
      return { k: "list", items };
    }
  }

  private objectLiteral(): Node {
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
    if (this.eat("[")) return this.listLiteral();
    if (this.eat("{")) return this.objectLiteral();
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
