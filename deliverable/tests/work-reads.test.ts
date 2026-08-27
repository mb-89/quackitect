// see dsp-the-work-offer.md#why-the-count-is-not-on-the-write-path
//
// CROSS-CHECKS ARE THE METHOD HERE. Every one of these rows is a derived
// answer, and the failure mode is the derivation disagreeing with the thing it
// derives from. So each case asserts the derived value against the underlying
// work, never against a stored copy.
//
// THE NAME. Its test spec asked for `work-account.test.ts`, and that file
// already exists for the JOB account that rides every lane call. Two different
// things were about to share one name, which is the corpus inspection's own
// pass line. This file is the work's derived READS.
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { bucketOf, leavingHeldBy, openPointsAt, owed, reconcile, slotOf } from "../engine/workoffer.ts";
import { BACKLOG, type MintDemand, mint, place, readWorkReporting, settle } from "../engine/workstore.ts";

const NOW = "2026-08-26T10:00:00Z";
const LATER = "2026-08-27T10:00:00Z";
const HERE = "iterations/i63/decompose";

function home(): string {
  return mkdtempSync(join(tmpdir(), "reads-"));
}

function demand(name: string, extra: Partial<MintDemand> = {}): MintDemand {
  return { source: "step", source_ref: `meth.md#${name}`, step: name, statement: name, difficulty: "mechanical", ...extra };
}

function reading(name: string): MintDemand {
  return { source: "reading", source_ref: `docs/${name}.md`, step: "", statement: name, difficulty: "mechanical" };
}

// PENDING DOES NOT BLOCK. The owner ruled it: the pending bucket holds work the
// state is meant to do something with eventually, and it is really for the
// backlog. The backlog is shown at the front desk, so a pending item that held
// the walk would make the desk impossible to leave.
describe("which work holds a position", { concurrency: true }, () => {
  test("an open item in the input or output bucket holds it", () => {
    const h = home();
    const id = mint(h, HERE, [demand("a step")], NOW).minted[0].id;
    place(h, id, HERE, "out");
    assert.equal(openPointsAt(h, HERE).length, 1);
    assert.equal(leavingHeldBy(h, HERE, false).held, true);
  });

  test("an open item in the pending bucket does not", () => {
    const h = home();
    const id = mint(h, HERE, [demand("parked")], NOW).minted[0].id;
    place(h, id, HERE, "pending");
    assert.deepEqual(openPointsAt(h, HERE), [], "pending cannot reach the decision, so it cannot block");
    assert.equal(leavingHeldBy(h, HERE, false).held, false);
  });
});

// THE GATE EXISTS AND HAD NO CALLER. Every read in this module was built, unit
// tested and wired to nothing, so a state could be signed with its work wide
// open — and signing was what CLOSED that work, which is the rule inverted.
//
// A SOURCE ASSERTION IS THE RIGHT SHAPE HERE. The behaviour needs a bound record
// and a standing position; what this pins is that the crossing is THERE, which
// is precisely the property that was missing.
describe("the submit consults the work rather than closing it", () => {
  const src = (): string => readFileSync(fileURLToPath(new URL("../engine/session.ts", import.meta.url)), "utf8");

  test("signing asks whether work holds the position", () => {
    assert.match(src(), /leavingHeldBy\(/, "the gate has a caller on the walk");
  });

  test("signing no longer settles a state's work wholesale", () => {
    assert.doesNotMatch(src(), /the state's claim was signed/, "a signature is not a reason work is done");
  });

  test("a completed state removes its ephemeral work", () => {
    assert.match(src(), /removeEphemeralWorkAt\(/, "the removal has a caller too");
  });

  test("the gate asks both homes, because work lives in two", () => {
    const body = /private leavingHeld\([\s\S]*?\n {2}\}/.exec(src())?.[0] ?? "";
    assert.notEqual(body, "", "one rule answers what holds a position shut");
    assert.match(body, /workHomes\(/, "one home is half the work, and the half it misses is the ephemeral one");
    assert.match(
      /private holdOrSign\([\s\S]*?\n {2}\}/.exec(src())?.[0] ?? "",
      /this\.leavingHeld\(/,
      "the signature asks the same rule the transition asks",
    );
  });

  // A STATE IS NOT LEFT WHILE IT HOLDS OPEN WORK, and neither is a submachine
  // while anything beneath it does. The hold used to sit on the form submit
  // alone, so a state with no form was left without the store ever being asked.
  test("the transition itself holds, before the state completes", () => {
    const body = src();
    assert.match(
      body,
      /this\.leavingHeld\([\s\S]{0,900}completeState\(m, inst/,
      "the hold has to run BEFORE the completion, or it never runs at all",
    );
    assert.match(body, /leaving-guard/, "the refusal names itself, so a reader can find the rule that fired");
  });

  test("the hold counts what lies beneath a submachine", () => {
    const body = /private leavingHeld\([\s\S]*?\n {2}\}/.exec(src())?.[0] ?? "";
    assert.match(body, /startsWith\(`\$\{scope\}\/`\)/, "a submachine holds no work of its own — its insides do");
  });

  // A SUBMACHINE IS LEFT THROUGH ITS `end`, and that position covers none of
  // its siblings. Holding on the end alone let a whole submachine be left with
  // an UNWALKED branch's token standing open, which is what a reader sees as a
  // state carrying a count that the walk went straight past.
  test("leaving a submachine's end holds on the machine, not on the end", () => {
    const body = /private leavingHeld\([\s\S]*?\n {2}\}/.exec(src())?.[0] ?? "";
    assert.match(body, /endsWith\("\/end"\)/, "the end is the door out of a submachine, and it has to widen the scope");
    assert.match(body, /slice\(0, -"\/end"\.length\)/, "the scope is the container, so an unwalked sibling is still in it");
  });

  // A CLAIM AND A WORK STORE CAN DISAGREE. A state signed before a token
  // existed reads green by its claim and owes one by its store. The join read
  // the CLAIM, so an unwalked branch counted as delivered and the submachine's
  // `end` activated straight over it — which is a state wearing a count the
  // walk had already gone past.
  test("the join reads a green that owed work has been taken off", () => {
    const body = src();
    assert.match(
      body,
      /completeState\([^)]*\(\) => this\.greenNow\(m\)\)/,
      "the join must not read the raw claim, or an owed branch counts as delivered",
    );
    const green = /private greenNow\([\s\S]*?\n {2}\}/.exec(body)?.[0] ?? "";
    assert.notEqual(green, "", "one function decides the green the walk reads");
    assert.match(green, /this\.owedPlaces\(\)/, "the green subtracts what is owed");
    assert.match(green, /p\.startsWith\(`\$\{at\}\/`\)/, "work beneath a container takes the container's green too");
  });

  // ASKING PER STATE WOULD READ THE WHOLE STORE PER STATE, on every hop. Only
  // the places actually holding work can owe anything.
  test("the owed places are computed once, not once per state", () => {
    const body = /private owedPlaces\([\s\S]*?\n {2}\}/.exec(src())?.[0] ?? "";
    assert.notEqual(body, "", "the owed set stands on the session");
    assert.equal((body.match(/readAllWork\(/g) ?? []).length, 1, "one read of the store answers for every state");
  });

  // LEAVING SETTLES NOTHING. Marking every open item `done` with "the state was
  // left" is the rule inverted: a step nobody did became a step finished by
  // walking past it.
  test("leaving no longer settles what nobody did", () => {
    const body = /private clearWorkAt\([\s\S]*?\n {2}\}/.exec(src())?.[0] ?? "";
    assert.notEqual(body, "", "the clearing stands on the session");
    assert.doesNotMatch(body, /settle\(/, "a state being left is not a reason a step is done");
  });
});

// LEAVING A STATE CLEARS IT. A state mints what it owes on entry and is clear
// when it is left, so nothing it owed shows any more.
//
// BOOT IS THE CASE THAT NAMES IT. An item standing at a boot state is spam: the
// walk is long past it and no hand will ever close it.
describe("leaving a state clears what it owed", () => {
  const src = (): string => readFileSync(fileURLToPath(new URL("../engine/session.ts", import.meta.url)), "utf8");

  test("the walk's own completion clears the work", () => {
    assert.match(src(), /completeState\(m, inst[\s\S]{0,2000}this\.clearWorkAt\(/, "the clearing rides the completion, not a form submit");
  });

  // THE CLEARING NO LONGER SETTLES. A state is not left while it holds an open
  // token, so by the time this runs everything at the position is finished. The
  // settle that used to sit here made leaving the reason a step was done, which
  // is the rule inverted — and it is what let a state be left with work open.
  test("the clearing reads both homes and removes without settling", () => {
    const body = /private clearWorkAt\([\s\S]*?\n {2}\}/.exec(src())?.[0] ?? "";
    assert.notEqual(body, "", "the clearing stands on the session");
    assert.match(body, /readAllWork\(/, "it reads every home rather than the record's alone");
    assert.doesNotMatch(body, /settle\(/, "a state being left is not a reason a step is done");
    assert.match(body, /removeEphemeralWorkAt\(/, "and the ephemeral ones leave no file");
  });
});

describe("the account, the gate and the open point", { concurrency: true }, () => {
  test("the count is two numbers per position, one per slot", () => {
    const h = home();
    mint(h, HERE, [reading("read it"), demand("build it"), demand("write it")], NOW);
    const count = owed(h, HERE);
    assert.equal(count.take_in.value, 1);
    assert.equal(count.produce.value, 2);
  });

  test("a settled item is no longer owed", () => {
    const h = home();
    const id = mint(h, HERE, [demand("a")], NOW).minted[0].id;
    assert.equal(owed(h, HERE).produce.value, 1);
    settle(h, id, "done", { reason: "it landed", now: NOW });
    assert.equal(owed(h, HERE).produce.value, 0);
  });

  test("every drawn value says whether it is a snapshot or a live reading", () => {
    const h = home();
    mint(h, HERE, [demand("a")], NOW);
    const count = owed(h, HERE);
    for (const drawn of [count.take_in, count.produce]) {
      assert.ok(drawn.basis === "live" || drawn.basis === "snapshot", "a value carrying neither is not a value this can build");
    }
  });

  // A COUNT THAT CANNOT BE PRODUCED IS ABSENT, NEVER ZERO. A zero and an
  // unknown look identical on a surface and mean opposite things.
  test("a count that cannot be produced is absent and says why, rather than reading zero", () => {
    const h = home();
    mint(h, HERE, [demand("a")], NOW);
    mkdirSync(join(h, "work"), { recursive: true });
    writeFileSync(join(h, "work", "wk-broken.md"), "---\nid: wk-broken\nid: wk-broken\n---\n", "utf8");

    const count = owed(h, HERE);
    assert.equal(count.take_in.value, null, "absent, not zero");
    assert.equal(count.produce.value, null);
    assert.match(count.produce.why, /cannot be read/, "the silence leaves a record a reader can act on");
    assert.match(count.produce.why, /wk-broken/, "and names the piece it could not read");
  });

  test("a stale stored count loses to the derived one, and the disagreement is reported", () => {
    const h = home();
    mint(h, HERE, [demand("a"), demand("b")], NOW);
    const out = reconcile(h, HERE, { take_in: 0, produce: 7 });
    assert.equal(out.live.produce.value, 2, "the derived value wins");
    assert.equal(out.disagreements.length, 1);
    assert.match(out.disagreements[0], /says 7 and the work says 2/, "reported, never silently corrected");
  });

  test("a stored count that agrees reports nothing", () => {
    const h = home();
    mint(h, HERE, [demand("a")], NOW);
    assert.deepEqual(reconcile(h, HERE, { take_in: 0, produce: 1 }).disagreements, []);
  });

  test("an open point reaches the next checkpoint rather than being carried by nobody looking", () => {
    const h = home();
    const ids = mint(h, HERE, [demand("closed"), demand("still open")], NOW).minted.map((i) => i.id);
    settle(h, ids[0], "done", { reason: "it landed", now: NOW });
    assert.deepEqual(
      openPointsAt(h, HERE).map((i) => i.statement),
      ["still open"],
    );
  });

  test("open work holds the walk at its position, and names what is open", () => {
    const h = home();
    mint(h, HERE, [demand("still open")], NOW);
    const held = leavingHeldBy(h, HERE, false);
    assert.equal(held.held, true);
    assert.match(held.why, /neither settled nor moved on/);
    assert.match(held.why, /still open/, "it names the piece rather than only counting it");
  });

  test("a position with nothing open is not held", () => {
    const h = home();
    const id = mint(h, HERE, [demand("a")], NOW).minted[0].id;
    settle(h, id, "done", { reason: "it landed", now: NOW });
    assert.equal(leavingHeldBy(h, HERE, false).held, false);
  });

  // see dsp-the-work-offer.md#emergency-lifts-the-work-gate
  test("emergency lifts the work gate entirely", () => {
    const h = home();
    mint(h, HERE, [demand("a"), demand("b")], NOW);
    assert.equal(leavingHeldBy(h, HERE, false).held, true, "held while emergency is off");

    const armed = leavingHeldBy(h, HERE, true);
    assert.equal(armed.held, false, "and not held while it is armed");
    assert.match(armed.why, /emergency is armed/);
  });

  test("emergency lifts the gate and still reports what is open", () => {
    const h = home();
    mint(h, HERE, [demand("a"), demand("b")], NOW);
    assert.equal(leavingHeldBy(h, HERE, true).open.length, 2, "lifting a gate is not hiding what was behind it");
  });

  test("the slot is derived from where the work came from, never stored beside it", () => {
    const h = home();
    const minted = mint(h, HERE, [reading("read it"), demand("do it")], NOW).minted;
    assert.equal(slotOf(minted.find((i) => i.source === "reading") as (typeof minted)[0]), "take_in");
    assert.equal(slotOf(minted.find((i) => i.source === "step") as (typeof minted)[0]), "produce");
  });
});

// see dsp-the-work-store.md#a-reading-token-settles-from-the-reading
//
// THE POINT OF THESE FOUR: nobody ever submits anything to a reading token.
// The only thing that closes one is the read credit, and the credit is one
// ledger for the whole walk.
describe("a reading token settles from the reading", { concurrency: true }, () => {
  const credit =
    (...paths: string[]) =>
    (p: string): boolean =>
      paths.includes(p);

  test("an unread document leaves its token owed", () => {
    const h = home();
    mint(h, HERE, [reading("design-input")], NOW);
    assert.equal(openPointsAt(h, HERE, credit()).length, 1, "nothing is read, so the token stands");
    assert.equal(leavingHeldBy(h, HERE, false, credit()).held, true);
  });

  test("the credit closes it, and no evidence was ever filed", () => {
    const h = home();
    mint(h, HERE, [reading("design-input")], NOW);
    assert.deepEqual(openPointsAt(h, HERE, credit("docs/design-input.md")), [], "the document is read, so nothing is owed");
    assert.equal(leavingHeldBy(h, HERE, false, credit("docs/design-input.md")).held, false);
  });

  test("one read closes the same document at every position", () => {
    const h = home();
    const other = "iterations/i63/write-requirements";
    mint(h, HERE, [reading("design-input")], NOW);
    mint(h, other, [reading("design-input")], NOW);
    const held = credit("docs/design-input.md");
    assert.deepEqual(openPointsAt(h, HERE, held), []);
    assert.deepEqual(openPointsAt(h, other, held), [], "two build steps sharing one input cost one read");
  });

  test("the settle is lazy, so the file on disk never moved", () => {
    const h = home();
    mint(h, HERE, [reading("design-input")], NOW);
    assert.deepEqual(openPointsAt(h, HERE, credit("docs/design-input.md")), []);
    assert.equal(openPointsAt(h, HERE, credit()).length, 1, "asked without the credit, it is open again");
  });

  test("a token from any other source is untouched by the credit", () => {
    const h = home();
    mint(h, HERE, [demand("write the thing")], NOW);
    // The step's own ref names a card, and a card can be read. Reading it must
    // not close the work the card asked for.
    assert.equal(openPointsAt(h, HERE, credit("meth.md#write the thing", "meth.md")).length, 1);
  });
});

// see dsp-the-bucket-editor.md#the-four-buckets
//
// ONE DECIDER, so the drawing and the editor cannot disagree. These cases are
// about that decider and nothing else.
describe("the four buckets", { concurrency: true }, () => {
  test("reading goes in, everything else goes out", () => {
    const h = home();
    const items = mint(h, HERE, [reading("design-input"), demand("write it")], NOW).minted;
    assert.equal(bucketOf(items[0]), "in");
    assert.equal(bucketOf(items[1]), "out");
  });

  test("the backlog is what pending means", () => {
    const h = home();
    const [item] = mint(h, BACKLOG, [demand("someday")], NOW).minted;
    assert.equal(bucketOf(item), "pending", "work nobody placed does not block a position");
  });

  test("finishing moves a piece from a top bucket to the bottom one", () => {
    const h = home();
    const [item] = mint(h, HERE, [demand("write it")], NOW).minted;
    assert.equal(bucketOf(item), "out");
    settle(h, item.id, "done", { reason: "it is written", now: LATER });
    const after = openPointsAt(h, HERE);
    assert.deepEqual(after, [], "it left the owed side");
  });

  test("done beats every other reading of where a piece of work is", () => {
    const h = home();
    const [item] = mint(h, BACKLOG, [reading("design-input")], NOW).minted;
    settle(h, item.id, "done", { reason: "read", now: LATER });
    // It is a reading item AND it sits in the backlog. Settled still wins:
    // done is the filter, and it is asked first.
    assert.equal(bucketOf({ ...item, status: "done" }), "done");
  });
});

// see dsp-mirror-render.md#the-signature-is-the-settle
//
// A SIGNED FORM AND AN OPEN TOKEN DESCRIBED ONE STATE, and they disagreed:
// trace-design read green while wearing an owed output bucket. These pin the
// rule the signature now applies, and the one exception to it.
describe("the signature settles what the state owed", { concurrency: true }, () => {
  const signed = (h: string, place: string): void => {
    const now = "2026-08-26T19:00:00Z";
    for (const i of readWorkReporting(h).items) {
      if (i.source === "reading" || i.place.split("/").pop() !== place.split("/").pop()) continue;
      settle(h, i.id, "done", { reason: "the state's claim was signed", now });
    }
  };

  test("every blocking token at the state closes, and each carries the reason", () => {
    const h = home();
    mint(h, HERE, [demand("a step"), { ...demand("an output"), source: "evidence" }], NOW);
    signed(h, HERE);
    assert.deepEqual(openPointsAt(h, HERE), [], "nothing blocking is left owed");
    for (const i of readWorkReporting(h).items) {
      assert.equal(i.reason, "the state's claim was signed", "a close without a reason is the thing the store refuses");
    }
  });

  test("a reading token is untouched, because a signature is not a reading", () => {
    const h = home();
    mint(h, HERE, [reading("design-input"), { ...demand("an output"), source: "evidence" }], NOW);
    signed(h, HERE);
    const left = openPointsAt(h, HERE);
    assert.equal(left.length, 1, "the reading token stands");
    assert.equal(left[0].source, "reading", "and it is the reading one");
  });

  test("a token at another position is not touched by this state's signature", () => {
    const h = home();
    const other = "iterations/i63/write-requirements";
    mint(h, HERE, [demand("here")], NOW);
    mint(h, other, [demand("elsewhere")], NOW);
    signed(h, HERE);
    assert.equal(openPointsAt(h, other).length, 1, "signing one state says nothing about another");
  });
});
