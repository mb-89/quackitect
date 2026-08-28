---
form: pressure-test
reopened: 2026-08-19T17:18:36.708Z — same claims-registration gap, cascading fix
amended: 2026-08-16T16:31:08.736Z by agent — ref "main" resolves — verified 2026-08-16; the hostile question's premise no longer holds
by: agent
signed_off: 2026-08-19T17:18:37.115Z
authors: agent
files: null
---

# Evidence form / pressure-test

## current_situation

scope-non-goals is signed. Seven scope items, five non-goals, each naming the record that owns what it sheds or saying plainly why none does.

THIS STATE ATTACKS THE PACKET rather than summarising it, and it found one real overstatement in frame-delta's business_case.

## prfaq

### The press release

QUACKITECT QUERIES ITS OWN SPEC. From today, an agent asks the corpus a structured question instead of grepping roughly 300 files by hand. A query names the fields it wants and gets exactly those back, or a named refusal listing what does exist. A second verb proposes candidate couplings no edge records, so a change nobody thought to search for still gets looked at.

The engineer driving agents stops trusting "I searched" on faith. Every claim that a decision was checked, or that a coupling was considered, now has a row behind it or a stated absence — never a silent maybe.

### The hostile FAQ

Q: TWO NEW LANE VERBS AND A CORPUS-WIDE RESOLVER REWRITE, PRICED MAJOR, TO FIX WHAT se_file_search ALREADY HALF-SOLVES. Why not extend search instead?
A: Because the two measured failures this iteration cites were never a missing STRING match — a DECIDED decision existed in plain text and a search would have found it if anyone had known to run it; the failure was that nobody knew to look. What fixes that is a typed, refusing surface an agent can question systematically, plus the BM25 sibling forcing a disposition on candidates nobody thought to search for. Grep never forces anything.

Q: THE BM25 SIBLING'S WHOLE JUSTIFICATION RESTS ON AN UNPROBED ASSUMPTION — that lexical overlap approximates semantic overlap here. What if it's wrong?
A: raid-asm-i15-corpus-suits-lexical-matching is open, honestly unprobed, with a trigger set to fire after ship, measured against real misses. If the assumption is false, the register catches it — after the fact, which is exactly the failure mode the sibling exists to prevent for coupling, now displaced onto the sibling's own behaviour. That is registered, not solved, and this FAQ does not pretend otherwise.

Q: i6's REQUIREMENTS GATE IS ALREADY WAITING ON THIS SIBLING FOR ITS CROSS-COUPLING CHECK. If the sibling ships with an unprobed assumption, doesn't that gate inherit an unverified check?
A: Yes, and this is worth naming plainly rather than smoothing over. i6's mechanized check gets a candidate list either way — the question is whether that list is TRUSTWORTHY on day one. It is not, yet. This is a genuine dependency risk this packet had not stated in those terms; folded below.

Q: THE HARVEST HALF OF THE GOAL HAS NO CONFIRMED SOURCE — the v1 ref still does not resolve in this checkout. What ships if it never does?
A: RESOLVED 2026-08-16: the premise no longer holds. Ref "main" resolves and holds spec/queries/ (25 .base files, not 26) plus adr-query-in-engine.md, confirmed by se_file_glob/se_file_read at ref:main. raid-asm-v1-ref-for-spec-queries-is-reachable is closed. The harvest has a confirmed source.

Q: THE BUSINESS CASE CLAIMS "NO THIRD, SILENT CASE" — A QUERY EITHER RETURNS A ROW OR REFUSES BY NAME. Does that hold for both new verbs, or only one?
A: Only one, and this is the finding this state exists to catch. Folded below.

## findings_folded

ONE FINDING, AND IT NARROWS A CLAIM FRAME-DELTA'S BUSINESS_CASE MADE TOO BROADLY.

WHAT I CLAIMED THERE: "A structured query with a named refusal converts a silent miss into either a returned row or a stated absence — there is no third, silent case."

WHAT THE HOSTILE QUESTION EXPOSED: that guarantee is true of the QUERY VERB alone. An unknown field refuses by name; there is no way to ask it something it silently fails to answer. It is NOT true of the BM25 SIBLING. The sibling ranks and proposes candidates; it has no refusal mechanism, and a real coupling it fails to rank highly enough is a SILENT miss by construction — nothing tells the agent the sibling missed something, because the sibling doesn't know that either. That is exactly the failure mode raid-asm-i15-corpus-suits-lexical-matching is open to track, and its trigger fires only after the fact.

WHAT THIS SHARPENS, beyond the wording: i6's requirements gate already depends on this sibling for its cross-coupling check (WITNESS: define-actual's own pain, sourced to i6's record.md lines 67–75). A gate that trusts an unprobed ranking's candidate list as if it were a refusing query inherits the same silent-miss risk one level up, and nothing in this packet said so until this state.

WHAT THIS DOES NOT CHANGE. The query verb's half of the business case stands as written — that half genuinely has no third case. Splitting the claim in two is the correction, not a reason to weaken either verb's scope.

SO THE UPSTREAM CORRECTION IS ONE SENTENCE: the "no silent case" guarantee belongs to the query verb only; the BM25 sibling's miss mode is silent by design until its own assumption is probed, and i6's gate inherits that until then.

## follow_up

THE JOIN IS NOW FED. scope-non-goals, log-risks and this state all stand, so gate-motivation activates.

WHAT THE GATE INHERITS, AND THE ONE THING IT SHOULD WEIGH HARDEST: the corrected business case — the no-silent-case guarantee holds for the query verb, not for the BM25 sibling, and i6's requirements gate depends on the sibling before that assumption is probed.

OWED AT write-requirements: a requirement or a pass line that makes the query-verb / BM25-sibling distinction explicit, so a reader of the shipped packet does not inherit the business_case's original, broader claim.

OWED AT i6's OWN GATE: whether the cross-coupling check should itself carry a caveat, or wait, until raid-asm-i15-corpus-suits-lexical-matching probes at least once.

## anything_else


