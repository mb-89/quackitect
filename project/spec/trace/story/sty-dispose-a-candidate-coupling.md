---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: sty-dispose-a-candidate-coupling
type: "[[story]]"
statement: When an agent is about to couple a change to another part of the system that the trace graph's edges do not name, I want a ranked list of candidate coupled nodes, so I can dispose of each one before the change ships rather than finding the miss in a red-team round.
actor: stk-agent
refines:
  - vp-rigor-without-toil
priority: must
---

## Deck

An agent is about to make a change that couples to another part of the system. The trace graph answers structural coupling exactly through its edges, but a coupling no edge names is invisible until someone happens to grep the right words.
|||
STILL TRUE, AND i33 IS THE PROOF. The whole evening's fault was a coupling no edge named: six places in the engine asked "does this state declare fields?" as a stand-in for four different questions, and nothing in the graph connected them. It surfaced when the owner read a green state sitting under a grey one, which is the late discovery this slide describes.

MEASURED THIS RUN, and it is the sharpest example the corpus has. i35 built `se-arrive.ts` and only the ELEMENT DECOMPOSITION revealed that four of its functions were already implemented in `se-start.ts`. No edge named that coupling; two files simply looked similar until the matrix put their implementers side by side.
---

gate-kickoff's own framing of the BM25 sibling stands: the graph answers structural coupling exactly, and this is built to answer the rest — the coupling nobody drew an edge for yet.
|||
THE FRAMING STANDS AND THE SIBLING IS BUILT. `engine/disposition.ts:70` exports `rankCandidateCouplings`, scoring the whole corpus by BM25 against a plain-words change description, with `tests/coupling-rank.test.ts` over it. Checked 2026-08-17.

THE FRAMING HOLDS. The graph answered i35's structural coupling exactly — `el-arrival` implements seven functions, and every flow crossing was computable. What it could not answer is the one that mattered: that another element already did four of them.
---

The agent describes the change in plain words and asks the BM25 sibling for candidate coupled nodes.
|||
CANNOT BE ASKED. The function exists and no lane verb reaches it, so the actor this story names has no way to make this call mid-change. The gap is one hop, the same hop the query evaluator waits on.

NOT YET AVAILABLE. The BM25 sibling belongs to i15, which stands `status: open`, so there is no verb to ask. i35 found its coupling by drawing the element and reading the matrix — which works, and only after the code is written.

DEMONSTRATED 2026-08-19, i15 run-demos. `se_couplings` is wired and reachable. Asked with a real, plain-words change description; the call returned a scored candidate list. Report: rpt-dispose-a-candidate-coupling.md in i15 own reports folder.
---

The sibling ranks the corpus by relevance to that description and returns a scored list of candidates, not a single guess.
|||
BUILT AND TEST-VERIFIED. The ranker returns scored candidates and filters anything at or below its threshold, so a weak overlap is not proposed at all — `engine/disposition.ts:14` and the cases in `tests/coupling-rank.test.ts`. This half of the story is done.

UNMEASURED. No ranked candidate list has been produced by this system yet, because the sibling does not exist.

MEASURED 2026-08-19, i15 run-demos. 706 candidates scored above threshold for a real change description; a separate deliberately unrelated description returned 314, not zero, on genuine term overlap with the corpus own common vocabulary rather than a false pass. Report: rpt-dispose-a-candidate-coupling.md.
---

The agent goes through every candidate and disposes of it — real coupling, or not — rather than picking the top hit and moving on.
|||
NOT DELIVERED, and this is the slide with the deeper gap. `recordCouplingDisposition` at `engine/disposition.ts:86` stamps every candidate handed to it as one `pending` row, with no threshold band and no auto-classification, per raid-dec-i15-disposition-prepopulates-pending-rows. NOTHING CALLS IT — not a verb, not the engine, not a test. It is a function waiting for the walk that uses it, so no disposition rows exist for a reader to check.

THE FORCED DISPOSITION IS PROVEN, THOUGH NOT BY BM25. i35 met the same mechanism twice this run: `probe-assumptions` handed back 42 rows and refused until each was answered, and `observe-red` handed back 15 and refused until each was checked or owed. The pattern that makes this story valuable is live; only the candidate SOURCE is missing.

PARTIALLY DEMONSTRATED 2026-08-19, i15 run-demos. All 706 candidates got exactly one pending row, nothing silently dropped. The top 15 by score were read and disposed for real, one at a time (3 accepted as real couplings, 12 rejected), with reasoning on file. The remaining 691 were not individually read this run — the pass line of EVERY candidate disposed is not met at full scale, named plainly rather than absorbed. Report: rpt-dispose-a-candidate-coupling.md.
---

A candidate turns out to be a real, previously unnamed coupling. The agent handles it before the change ships, instead of a red team or an incident finding it later.
|||
NOT DEMONSTRATED, and i33 shows what the absence costs. Its unnamed coupling was found by the owner reading a panel, after a record had already been merged to trunk and reported as archived. That is the late discovery, and it is the case this slide is written against.

THIS IS EXACTLY WHAT HAPPENED, by a slower route. The unnamed coupling between the two entrypoints was found before the change shipped, not by a red team afterwards, and it is filed as `raid-iss-two-entrypoints-place-the-cage-and-nothing-compares-them` with a written repayment.
---

The missed edge that gap_claim describes — invisible until someone happens to grep the right words — surfaces during the change itself, because disposing of every candidate is forced, not optional.
|||
NOT DELIVERED, and the word that matters is FORCED. Nothing forces anything here yet, because no walk asks for candidates and no state reads the dispositions. The demonstration is tsp-candidate-couplings-are-disposed-one-by-one; it cannot run until a verb serves step 2 and a caller writes the rows step 3 would read.

THE COST OF NOT HAVING IT IS NOW ON RECORD. The coupling surfaced during the change — but only because a human-authored decomposition step happened to sit between the build and the gate. Nothing forced it, and an iteration that skipped the element matrix would have shipped the duplication unnamed.
