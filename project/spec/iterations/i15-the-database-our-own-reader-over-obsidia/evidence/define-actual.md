---
form: define-actual
amended: "2026-08-16T16:31:14.130Z by agent — ref \"main\" resolves — verified 2026-08-16; only the prior-art-scan question remains open"
by: agent
signed_off: 2026-08-16T16:18:42.505Z
authors: agent
files:
---

# Evidence form / define-actual

## current_situation

draft-vision signed at M0's second state, inheriting vp-the-ledger and vp-rigor-without-toil unbent. The walk carried forward to define-actual, M0's third state, which asks for the as-is baseline the delta will sharpen against.

## as_is

THE GOOD, said first. Substantial prior art already works. engine/tables.ts, bases.ts, baseui.ts and basesclient.ts parse the Bases format and read the whole project vault as rows — frontmatter plus file.* fields — with filter, sort, groupBy and pivot already live in the mirror's HTML widget. WITNESS: gate-kickoff's grep-verified prior-art claim, this session, 2026-08-16.

THE PAINS, each with its own witness.

NO QUERY IS CALLABLE FROM THE LANE. Every read of the corpus goes through se_file_search or se_file_glob — text search, not structured query — because no se_query/se_table/se_base verb exists. WITNESS: this session's own tool search, 2026-08-16, confirming no such verb registered.

A HAND SEARCH IS THE ONLY WAY TO FIND A RESIDENT DOCUMENT. Locating one file — the resident vision, vp-the-engine.md — among roughly 300 trace files took a full-tree glob plus a targeted regex search across two calls, this session, immediately before this state. WITNESS: this walk's own draft-vision work, 2026-08-16, same session.

A DOWNSTREAM GATE IS ALREADY WAITING ON THIS ITERATION. i6's requirements gate carries a cross-coupling check that demands one disposition per candidate, and one of its two candidate sources is "the retrieval candidates i15's BM25 sibling proposes for couplings no edge records." That check cannot mechanize until this sibling exists. WITNESS: owner ruling 2026-08-13, recorded at project/spec/iterations/i6-conformance-goes-mechanical-checks-bind-/record.md lines 67–75.

AN UNNAMED COUPLING HAS NO WAY TO SURFACE ITSELF. The trace graph answers structural coupling exactly through its edges, but a change that touches something no edge names is invisible until a person or an agent happens to grep the right words. WITNESS: record.md's own framing of the BM25 sibling, owner ruling 2026-08-13 — "the graph answers structural coupling exactly and this answers the rest."

THE $-ITEM RESOLVERS DEFAULT WIDE. They resolve against the whole corpus rather than the bound record's own delta, with no scoped default and no opt-in boundary. WITNESS: raid-debt-delta-default-views.md, rescheduled into i15 at i12's retro, 2026-08-15.

ONE OPEN QUESTION STANDS FROM THIS ITERATION'S OWN KICKOFF. Whether a live prior-art scan against Obsidian's own Bases, Dataview, or another markdown-query tool ever ran. WITNESS: raid-risk-i15-ships-without-a-live-prior-art-scan, minted at gate-kickoff, 2026-08-16. The sibling question — whether the v1 ref holding the .base query files is reachable — closed 2026-08-16: ref "main" resolves and holds 25 files, not 26, plus adr-query-in-engine.md. WITNESS: raid-asm-v1-ref-for-spec-queries-is-reachable, closed.

## follow_up

THE BASELINE IS SET. No solutions are stated here, per the state's own rule — the pains are named and witnessed, and frame-delta owes the sharpening.

WHAT frame-delta INHERITS. Seven pains, each with a witness that is a date, a call, or a recorded ruling rather than an impression. Two are structural (no query verb, no BM25 sibling), one is a resolver default, two are this iteration's own still-open risk and assumption, and two were produced by this very walk finding its own resident documents by hand.

ONE THING THE DELTA SHOULD NOT RE-ARGUE. The good half is real and load-bearing — the existing reader already parses and filters the corpus in the mirror widget. i15 exposes and extends that reader; it does not replace working code.

## anything_else

