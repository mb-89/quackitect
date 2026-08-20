// THE EXPRESSION LANGUAGE, AGAINST THE REFERENCE'S OWN EXAMPLES.
//
// Nearly every case here is a worked example copied out of
// spec/bases-syntax.md. That is deliberate: the reference is the only
// specification we get, Obsidian's engine is closed, and a test we invented
// ourselves would prove our own opinion rather than the format.
//
// The cases are pure computation with no shared state, so the file is the
// unit of parallelism and nothing inside it needs isolating.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { Rejection } from "../engine/errors.ts";
import { type Ctx, evalExpr, passes, registerGlobal } from "../engine/expr.ts";
import { type Duration, Link, parseDuration, toText, typeOf } from "../engine/expr-value.ts";

const row = (over: Record<string, unknown> = {}): Ctx["row"] => ({
  status: "open",
  price: 10,
  age: 4,
  tags: ["book", "read"],
  file: { name: "Textbook", path: "lib/Textbook.md", folder: "lib", ext: "md", tags: ["book"], links: [new Link("Author")] },
  ...over,
});

const ctx = (over: Partial<Ctx> = {}): Ctx => ({ row: row(), ...over });

const ev = (src: string, c: Ctx = ctx()): unknown => evalExpr(src, c);

/** assert.throws cannot hand the error back, and these refusals say things worth reading. */
function refusal(fn: () => unknown): Rejection {
  try {
    fn();
  } catch (e) {
    if (e instanceof Rejection) return e;
    throw e;
  }
  throw new Error("expected a refusal, got a value");
}

describe("call-by-name — the constraint that shapes the evaluator", () => {
  test("filter binds `value` per element", () => {
    assert.deepEqual(ev("[1, 2, 3, 4].filter(value > 2)"), [3, 4]);
  });
  test("map binds `value` per element", () => {
    assert.deepEqual(ev("[1, 2, 3, 4].map(value + 1)"), [2, 3, 4, 5]);
  });
  test("reduce binds `acc` and `value`", () => {
    assert.equal(ev("[1, 2, 3].reduce(acc + value, 0)"), 6);
  });
  test("the body is re-evaluated per element rather than once", () => {
    assert.deepEqual(ev("[1, 2, 3].map(value * value)"), [1, 4, 9]);
  });
});

describe("strings", () => {
  test("contains", () => assert.equal(ev('"hello".contains("ell")'), true));
  test("containsAll", () => assert.equal(ev('"hello".containsAll("h", "e")'), true));
  test("containsAny", () => assert.equal(ev('"hello".containsAny("x", "y", "e")'), true));
  test("endsWith", () => assert.equal(ev('"hello".endsWith("lo")'), true));
  test("startsWith", () => assert.equal(ev('"hello".startsWith("he")'), true));
  test("isEmpty is false for text", () => assert.equal(ev('"Hello world".isEmpty()'), false));
  test("isEmpty is true for nothing", () => assert.equal(ev('"".isEmpty()'), true));
  test("repeat", () => assert.equal(ev('"123".repeat(2)'), "123123"));
  test("reverse", () => assert.equal(ev('"hello".reverse()'), "olleh"));
  test("slice", () => assert.equal(ev('"hello".slice(1, 4)'), "ell"));
  test("title", () => assert.equal(ev('"hello world".title()'), "Hello World"));
  test("trim", () => assert.equal(ev('" hi ".trim()'), "hi"));
  test("lower", () => assert.equal(ev('"HELLO".lower()'), "hello"));
  test("length is a field, not a call", () => assert.equal(ev('"hello".length'), 5));
  test("split takes a count", () => assert.deepEqual(ev('"a,b,c,d".split(",", 3)'), ["a", "b", "c"]));
  test("split takes a regular expression", () => assert.deepEqual(ev('"a,b,c,d".split(/,/, 3)'), ["a", "b", "c"]));
});

describe("replace — where the regular expression flags decide the answer", () => {
  test("an unflagged pattern replaces once", () => {
    assert.equal(ev('"a:b:c:d".replace(/:/, "-")'), "a-b:c:d");
  });
  test("the g flag replaces all", () => {
    assert.equal(ev('"a:b:c:d".replace(/:/g, "-")'), "a-b-c-d");
  });
  test("a plain string replaces every occurrence", () => {
    assert.equal(ev('"a:b:c:d".replace(":", "-")'), "a-b-c-d");
  });
  test("capture groups reach the replacement", () => {
    assert.equal(ev('"John Smith".replace(/(\\w+) (\\w+)/, "$2, $1")'), "Smith, John");
  });
});

describe("numbers", () => {
  test("abs", () => assert.equal(ev("(-5).abs()"), 5));
  test("ceil", () => assert.equal(ev("(2.1).ceil()"), 3));
  test("floor", () => assert.equal(ev("(2.9).floor()"), 2));
  test("round", () => assert.equal(ev("(2.5).round()"), 3));
  test("round to digits", () => assert.equal(ev("(2.3333).round(2)"), 2.33));
  test("toFixed", () => assert.equal(ev("(3.14159).toFixed(2)"), "3.14"));
  test("number parses a string", () => assert.equal(ev('number("3.4")'), 3.4));
  test("number turns a boolean into one or zero", () => assert.equal(ev("number(true)"), 1));
});

describe("the bare-literal method call the reference asserts and a rival rejects", () => {
  // bases-port.md marked this UNKNOWN: the function reference asserts
  // 5.isEmpty() and 123.toString() work, an independent implementation
  // rejects both, and nobody had a running Obsidian to settle it. We accept
  // the form, because the reference is the specification we were handed.
  test("a bare number takes a method", () => assert.equal(ev("5.isEmpty()"), false));
  test("toString on a bare number", () => assert.equal(ev("123.toString()"), "123"));
  test("the parenthesised form means the same thing", () => assert.equal(ev("(5).isEmpty()"), false));
});

describe("any-typed functions", () => {
  test("isTruthy", () => assert.equal(ev("1.isTruthy()"), true));
  test("isTruthy on zero", () => assert.equal(ev("0.isTruthy()"), false));
  test("isType on a string", () => assert.equal(ev('"example".isType("string")'), true));
  test("isType on a boolean", () => assert.equal(ev('true.isType("boolean")'), true));
  test("an absent property is empty", () => assert.equal(ev("nothing.isEmpty()"), true));
});

describe("operators", () => {
  test("arithmetic runs in precedence order", () => assert.equal(ev("1 + 2 * 3"), 7));
  test("parentheses override it", () => assert.equal(ev("(1 + 2) * 3"), 9));
  test("modulo", () => assert.equal(ev("7 % 3"), 1));
  test("equality is loose across types", () => assert.equal(ev('4 == "4"'), true));
  test("ordering on numbers", () => assert.equal(ev("2 < 10"), true));
  test("ordering on strings is lexicographic", () => assert.equal(ev('"a" < "b"'), true));
  test("and", () => assert.equal(ev("true && false"), false));
  test("or", () => assert.equal(ev("false || true"), true));
  test("not", () => assert.equal(ev("!false"), true));
  test("and short-circuits, so the right side never runs", () => {
    assert.equal(ev("false && missing.explode()"), false);
  });
});

describe("dates and durations", () => {
  test("date parses the documented shape", () => {
    assert.equal(ev('date("2025-05-27").format("YYYY-MM-DD")'), "2025-05-27");
  });
  test("a date field reads off the value", () => {
    assert.equal(ev('date("2025-05-27").year'), 2025);
    assert.equal(ev('date("2025-05-27").month'), 5);
    assert.equal(ev('date("2025-05-27").day'), 27);
  });
  test("date() strips the time", () => {
    assert.equal(ev('date("2025-05-27 13:45:10").date().format("YYYY-MM-DD HH:mm:ss")'), "2025-05-27 00:00:00");
  });
  test("time returns the time portion", () => {
    assert.equal(ev('date("2025-05-27 13:45:10").time()'), "13:45:10");
  });
  test("adding a duration string shifts the date", () => {
    assert.equal(ev('(date("2025-05-27") + "1d").format("YYYY-MM-DD")'), "2025-05-28");
  });
  test("a month is a calendar step, not thirty days", () => {
    assert.equal(ev('(date("2025-01-31") + "1M").format("YYYY-MM-DD")'), "2025-02-28");
  });
  test("subtracting a duration string", () => {
    assert.equal(ev('(date("2025-05-27 12:00:00") - "2h").format("HH:mm")'), "10:00");
  });
  test("a date minus a date is milliseconds", () => {
    assert.equal(ev('date("2025-05-28") - date("2025-05-27")'), 86400000);
  });
  test("a duration scales with the duration on the left", () => {
    const d = ev("duration('5h') * 2") as Duration;
    assert.equal(typeOf(d), "duration");
    assert.equal(d.ms, 36000000);
  });
  test("a duration on the right of multiply refuses, naming the rule", () => {
    const r = refusal(() => ev("2 * duration('5h')"));
    assert.match(r.expected, /duration on the left/);
  });
  test("every documented unit parses", () => {
    for (const u of ["1y", "1M", "1w", "1d", "1h", "1m", "1s", "2 months", "3 days"]) {
      assert.equal(typeOf(parseDuration(u)), "duration");
    }
  });
  test("an unknown unit refuses by name", () => {
    const r = refusal(() => parseDuration("1z"));
    assert.equal(r.got, "z");
  });
});

describe("lists, links and files", () => {
  test("a list literal indexes zero-based", () => assert.equal(ev("[10, 20, 30][1]"), 20));
  test("list() wraps a scalar", () => assert.deepEqual(ev('list("value")'), ["value"]));
  test("list() leaves a list alone", () => assert.deepEqual(ev("list([1, 2])"), [1, 2]));
  test("contains compares by value", () => assert.equal(ev('tags.contains("book")'), true));
  test("join", () => assert.equal(ev('tags.join(" / ")'), "book / read"));
  test("length is a field on a list too", () => assert.equal(ev("tags.length"), 2));
  test("file.hasTag reads the file's own tags", () => assert.equal(ev('file.hasTag("book")'), true));
  test("file.hasTag ignores a leading hash", () => assert.equal(ev('file.hasTag("#book")'), true));
  test("file.hasLink finds a wikilink", () => assert.equal(ev('file.hasLink("Author")'), true));
  test("file.hasProperty", () => assert.equal(ev('file.hasProperty("folder")'), true));
  test("a link equals the file it resolves to", () => {
    assert.equal(ev('link("Textbook") == file'), true);
  });
  test("a link that resolves nowhere is not equal", () => {
    assert.equal(ev('link("Elsewhere") == file'), false);
  });
});

describe("property namespaces", () => {
  test("a bare name reads the note's frontmatter", () => assert.equal(ev("status"), "open"));
  test("note. is the same thing spelled out", () => assert.equal(ev("note.status"), "open"));
  test("file. reaches the synthesised fields", () => assert.equal(ev("file.name"), "Textbook"));
  test("this. falls back to the row", () => assert.equal(ev("this.status"), "open"));
  test("this. reads the embedding note when there is one", () => {
    assert.equal(ev("this.status", ctx({ self: { status: "closed" } })), "closed");
  });
  test("an absent property is null rather than a throw", () => assert.equal(ev("nope"), null));
  test("a nested reach on an absent property is null", () => assert.equal(ev("nope.deeper"), null));
});

describe("formulas", () => {
  test("the reference's own formula", () => {
    assert.equal(ev("formula.ppu", ctx({ formulas: { ppu: "(price / age).toFixed(2)" } })), "2.50");
  });
  test("a formula may use another formula", () => {
    const c = ctx({ formulas: { half: "price / 2", quarter: "formula.half / 2" } });
    assert.equal(ev("formula.quarter", c), 2.5);
  });
  test("a formula that references itself refuses rather than hanging", () => {
    const r = refusal(() => ev("formula.loop", ctx({ formulas: { loop: "formula.loop + 1" } })));
    assert.match(r.got, /defined in terms of itself/);
  });
  test("an unknown formula refuses and lists the ones declared", () => {
    const r = refusal(() => ev("formula.nope", ctx({ formulas: { ppu: "1" } })));
    assert.match(r.expected, /ppu/);
  });
});

describe("if, and the reference's own example", () => {
  test("if returns the true branch", () => {
    assert.equal(ev('if(isModified, "Modified", "Unmodified")', ctx({ row: row({ isModified: true }) })), "Modified");
  });
  test("if returns the false branch", () => {
    assert.equal(ev('if(isModified, "Modified", "Unmodified")', ctx({ row: row({ isModified: false }) })), "Unmodified");
  });
  test("a missing false branch is null", () => {
    assert.equal(ev('if(false, "yes")'), null);
  });
});

describe("filters over rows — what a view actually runs", () => {
  test("the shape every shipped base opens with", () => {
    assert.equal(passes('kind == "matrix-row"', ctx({ row: row({ kind: "matrix-row" }) })), true);
    assert.equal(passes('kind == "matrix-row"', ctx({ row: row({ kind: "other" }) })), false);
  });
  test("a bare property means it carries something", () => {
    assert.equal(passes("status", ctx()), true);
    assert.equal(passes("missing", ctx()), false);
  });
  test("the canonical example's filter tree, as one expression", () => {
    const c = ctx();
    assert.equal(passes('file.hasTag("book") && file.hasLink("Author")', c), true);
    assert.equal(passes('file.hasTag("nope") || file.hasLink("Author")', c), true);
    assert.equal(passes('file.hasTag("nope") || file.hasLink("Nobody")', c), false);
  });
  test("a filter over a computed comparison", () => {
    assert.equal(passes("price / age > 2", ctx()), true);
  });
});

describe("refusing by name — the rule that keeps a wrong table from looking right", () => {
  test("an unknown global function names itself and lists the known ones", () => {
    const r = refusal(() => ev("nosuchfunction(1)"));
    assert.equal(r.got, "nosuchfunction()");
    assert.match(r.expected, /a global function/);
  });
  test("an unknown method names the type it was called on", () => {
    const r = refusal(() => ev('"text".nosuchmethod()'));
    assert.equal(r.got, "string.nosuchmethod()");
  });
  test("a character outside the language refuses with its position", () => {
    const r = refusal(() => ev("a @ b"));
    assert.match(r.got, /"@"/);
  });
  test("an unclosed string refuses", () => {
    refusal(() => ev('"unterminated'));
  });
  test("a dangling operator refuses", () => {
    refusal(() => ev("1 +"));
  });
  test("leftover input refuses rather than being ignored", () => {
    const r = refusal(() => ev("1 2"));
    assert.match(r.expected, /end of the expression/);
  });
  test("ordering two things that cannot be ordered refuses", () => {
    const r = refusal(() => ev("[1] < [2]"));
    assert.match(r.got, /list < list/);
  });
});

describe("determinism — v1's law, carried", () => {
  test("now() is refused where a render must regenerate byte-identically", () => {
    const r = refusal(() => ev("now()", ctx({ deterministic: true })));
    assert.match(r.got, /now\(\)/);
  });
  test("today() is refused the same way", () => {
    refusal(() => ev("today()", ctx({ deterministic: true })));
  });
  test("both run when determinism is not demanded", () => {
    assert.equal(typeOf(ev("now()")), "date");
    assert.equal(typeOf(ev("today()")), "date");
  });
  test("today has no time on it", () => {
    assert.equal(ev("today().time()"), "00:00:00");
  });
});

describe("the registry is a seam, not a switch", () => {
  test("our own global joins the language", () => {
    registerGlobal("rigor", { call: (_r, a) => `M${toText(a[0])}` });
    assert.equal(ev("rigor(3)"), "M3");
  });
});
