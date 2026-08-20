---
form: frame-delta
amended: 2026-08-16T16:31:02.257Z by agent — ref "main" resolves — verified 2026-08-16; correcting the stale "does not yet resolve" claim and its downstream follow_up
by: agent
signed_off: 2026-08-16T16:24:00.812Z
authors: agent
files: null
---

# Evidence form / frame-delta

## current_situation

draft-vision, log-risks and define-actual all stand signed. define-actual set the baseline: substantial prior art already works in the mirror widget, and seven witnessed pains sit downstream of it — no callable query verb, a hand search as the only way to find a resident document, i6's requirements gate already waiting on the BM25 sibling, an unnamed coupling with no way to surface itself, the $-item resolvers defaulting wide, and the two still-open raid entries from gate-kickoff.

THIS STATE SHARPENS THOSE PAINS INTO A CLAIM and says why the gap is closable now. The vision packet is inherited and authors no new value prop, so that field is a considered none rather than an omission.

## gap_claim

THE GAP, AS A CLAIM: nothing in this system turns "I searched the corpus" into a checkable, structured answer that names exactly what it found and refuses what it does not have.

THE ALTERNATIVES, AND WHAT EACH SHEDS.

SE_FILE_SEARCH AND SE_FILE_GLOB — what stands today, and what this very milestone used four calls to work around just to find its own resident vision. They find TEXT, not STRUCTURE: a hit is a matching string, not a typed row with named fields, and nothing refuses an unknown field because there is no field concept at all. Two measured failures, both cited in record.md's own framing of this iteration: an agent missed a DECIDED decision that one search would have found, caught only by a red team; the same agent listed 35 requirements and left 170 unexamined, passing every mechanical check anyway.

THE EXISTING MIRROR WIDGET (engine/tables.ts, bases.ts, baseui.ts, basesclient.ts) — real prior art, not a green field. It already parses the Bases format, reads the whole vault as rows, and supports filter/sort/groupBy/pivot with a pinned subset that refuses an unmatched filter shape by name. It sheds REACHABILITY: it is an HTML widget rendered for a person looking at the mirror, and no MCP tool calls into it, so an agent cannot query it at all.

SHELLING OUT TO THE OBSIDIAN CLI OR A PLUGIN LIKE DATAVIEW — already argued and rejected once, in adr-query-in-engine: it loses on the trust chain and the one-binary law. A call to an external evaluator cannot be audited the way an in-engine read can, and this product ships as one binary.

EMBEDDINGS-BASED SEMANTIC SEARCH — not an alternative that exists here, so comparing against it would be fabrication. record.md defers it explicitly, to be added only after BM25's own misses are measured.

OURS SHEDS SOMETHING TOO. A pinned subset refuses whatever query shape it was not built for, by design — the ADR's own reverse-sensitivity clause: "a needed query beyond the subset re-opens this decision." A reader that refuses more than it answers is the safety property here, not a gap, but it is a real limit next to a query language with no such ceiling.

## why_now

THE READER WAS ALREADY BUILT ONCE, and the ADR made the hard calls. adr-query-in-engine already chose the in-engine pinned subset over the Obsidian CLI, already committed to conformance fixtures against subset drift, and already ruled that a needed query beyond the subset re-opens the decision rather than being smuggled in. This iteration inherits that design instead of arguing it from scratch.

D1 JUST SETTLED THE POLICY THAT MAKES IT LEGAL. The owner ruled on 2026-08-12 that Quackitect writes its own databases over Bases-compatible files and may extend the format one-way. Before that ruling, extending past what Obsidian reads was an open question; now it is not.

V1 LEFT 26 WORKING QUERY FILES TO HARVEST rather than invent. requirements.base alone states the whole shape — filters, views, order, sort, groupBy — in twelve lines. Building from a working reference costs less than designing one blind.

THE COST OF NOT HAVING IT IS NOW MEASURED, NOT SUSPECTED. The same two proofs named in gap_claim — a missed DECIDED decision caught only by a red team, and 170 of a requirement set's rows left unexamined while every mechanical check passed — are dated to 2026-08-13, one iteration before this one opened. The corpus they were run against has grown to roughly 300 trace files by this walk's own count.

WHAT DID NOT MATURE, said so the case is not overstated: no live scan compared this design against Obsidian's own Bases plugin or Dataview (raid-risk-i15-ships-without-a-live-prior-art-scan, still open). The v1 ref resolves at "main" (raid-asm-v1-ref-for-spec-queries-is-reachable, closed 2026-08-16; the ref holds 25 .base files, not 26). The case rests on the measured cost of searching today and a design already proven once, not on every open question being closed.

## value_props

- none

## business_case

THE CURRENCY IS AGENT TIME AND VERIFIED COVERAGE, and there is no acquirer to price it for.

WHAT IT BUYS, from the same two measured failures named in gap_claim and why_now: a DECIDED decision missed by a hand search and caught only by luck in a red-team round, and 170 requirement rows left unexamined while every mechanical check passed anyway. A structured query with a named refusal converts a silent miss into either a returned row or a stated absence — there is no third, silent case.

WHAT IT COSTS. Two new lane verbs, a subset extension test-first where a harvested query needs it, and a corpus-wide resolver-default rewrite (the rescheduled delta-default-views debt). gate-kickoff already priced this as major on exactly that build weight.

WHY NO FURTHER CASE IS MADE. The product is not sold and has no acquirer, so a case in money would be invented. Skipped with this recorded reason, the same rule i27's frame-delta used.

## follow_up

M1'S REMAINING BRANCHES are scope-non-goals and pressure-test; the gate joins on both plus log-risks, already signed.

WHAT SCOPE-NON-GOALS INHERITS: gate-kickoff already wrote and blessed a left_out list — the dashboard, embeddings, the book table-interactivity port, and any UI change to the existing mirror widget beyond what the verb and the subset extension require. This state should test that list against the delta drafted here rather than re-derive it.

WHAT PRESSURE-TEST INHERITS, and it is the sharper job: one claim this frame rests on is still an open raid entry rather than settled fact — that no live prior-art scan means no maintained plugin already does this better. It is named in why_now's own "what did not mature" paragraph; pressure-test is where it gets pushed on, not argued away here. The v1-ref-reachability assumption closed 2026-08-16 and needs no further pressure.

ONE THING VALUE_PROPS LEAVES SETTLED: this delta authors no new value prop. The vision facets it serves (vp-the-ledger, vp-rigor-without-toil) were argued at draft-vision and are not re-argued here.

## anything_else


