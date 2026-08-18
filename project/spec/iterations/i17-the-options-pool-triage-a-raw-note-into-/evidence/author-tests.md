---
form: author-tests
by: agent
signed_off: 2026-08-18T09:48:57.083Z
authors: agent
files:
---

# Evidence form / author-tests

## current_situation

Design input is blessed and this is where delivery starts. Eight requirements, three test-specs, two new test files, and both files are RED — which is correct at this state and is what observe-red exists to witness.

THE SPLIT IS BY WHAT THE ROW ASKS FOR, not by convenience. Seven rows verify by test and one by inspection, so the inspection row gets its own spec — the law is that a spec's method equals the verify_method of every requirement it names.

TWO TEST FILES RATHER THAN ONE, and the reason is the house rule that files are the only unit reaching a second core. The mint's cases and the offer's cases share no fixture and no state, so keeping them apart costs nothing and buys parallelism.

THE FIXTURES CARRY THE ARGUMENT. The offer file's fixture is a root with options on disk and NOTHING drained in the local store, because that is the only state where reading the wrong source is visible — a root with both populated would pass over a survey that read either one.

## checks

- tsp-the-mint-crosses-the-boundary — method test, over the four mint rows, realized by tests/pool-mint.test.ts. Eleven cases in three groups: what the mint writes, what it refuses, and what it must still ACCEPT
- tsp-the-pool-is-what-is-offered — method test, over the three reading rows, realized by tests/pool-offer.test.ts. Seven cases in three groups: read from the repository, say when windowed, and agree between readers
- tsp-one-door-into-the-pool — method inspection, over req-the-crossing-is-the-same-act-for-a-person-and-an-agent. A checklist, no file, because only reading proves a second door does not exist
- THE TWO ACCEPTANCE CASES ARE THE ONES WORTH DEFENDING. A check that only ever refuses passes its own tests while being useless, so the mint file asserts that a statement merely SHARING words is accepted, and that saying "this cannot be stated cleanly yet" is itself a valid statement. Without those two, a mint that refused everything would look green
- THE ORACLE IS THE FILE ON DISK, never the return value. Four cases read the minted file back and one asserts that neither the path nor the name from the raw note appears anywhere in it
- ONE CASE PROVES A REFUSAL WRITES NOTHING, which is the failure a refusal-message assertion misses entirely

## follow_up

- both files are red now and specify-build says what makes them green: a pool module, a statement argument on the drain, and the survey reading options from the corpus instead of the note store
- the inspection spec has no file and cannot go red; it is answered at verification by reading every writer, and its checklist is written so somebody other than me can run it
- the option node's frontmatter shape is decided by these tests rather than by a document: statement, ready_when and source are what the cases read back
- the windowing case pins that the COUNT stays whole while the list is cut, which is what makes a window honest rather than a silent truncation

## anything_else

