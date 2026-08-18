---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: dsp-write-guard
type: "[[design-spec]]"
statement: one pass over the content a write carries, answering refuse or land-with-findings, with the rules read from the corpus rather than compiled into the engine
realizes:
  - el-walk-engine
  - if-satellite-to-walk-engine
files:
  - project/deliverable/engine/guard.ts
  - project/deliverable/engine/rules.ts
  - project/deliverable/engine/vocabulary.ts
  - project/deliverable/engine/sweep.ts
  - project/deliverable/engine/bin/sweep.ts
  - project/deliverable/engine/files.ts
  - project/deliverable/engine/tools.ts
---

## Responsibility

The check that stands between a write verb being called and anything
landing. One question asked of the incoming content, and the answer
picks one of three outcomes.

- REFUSE, typed, with the file, the line, the value and the fix.
- LAND, with what the corpus already carried reported on the result.
- LAND CLEAN.

## Behavior and constraints

- IT READS THE CONTENT BEING WRITTEN, never the file on disk. A check
  that runs after the write has prevented nothing.
- IT USES THE SAME YAML PARSE EVERY READER USES. Four import sites all
  take the same package today; the guard joins them rather than adding a
  fifth. A guard more lenient than a reader is a false assurance.
- THE SEAM IS WHO CAUSED IT, not severity. A break that arrived with
  this write refuses; one the corpus already carried reports.
- A RULE THAT DECLARES NO WAY FORWARD DOES NOT ARM. Three are accepted:
  report instead of refuse, accept a signed answer, carry.
- NO FLAG CLEARS IT. `force` is for a flake hunt in the test lane and
  has no meaning here.
- A CORPUS-WIDE SUBJECT NEVER REFUSES. It reports, through the sweep.

## The four files, and what each holds

- `guard.ts` — the one pass. Takes the path and the incoming content,
  returns refuse or land-with-findings. Everything else feeds it.
- `vocabulary.ts` — the enumerable keys and their allowed words, read
  from the same place the downstream checks read them. This is the file
  that would have refused `status: part-closed` at the write.
- `rules.ts` — rules declared on corpus nodes, loaded and bound. This is
  where `req-a-check-binds-without-engine-code` lives or fails: adding a
  rule must touch no file in this list.
- `sweep.ts` — the whole-repo runner. `se_lint` takes one file per call
  today while its own description promises a pass over everything.

## The crossing this spec realizes

`if-satellite-to-walk-engine` is the interface minted at
decompose-structure, and this is the design that serves it. It is
SYNCHRONOUS where the satellite's other crossings append and do not
wait, because the answer decides whether the write happens at all.

THE SPEC CHECK FOUND THE OMISSION. The first version of this node named
only the element, and the submit refused with the interface named. An
interface no design realizes is a crossing nobody built.

## What changes in the files that already exist

- `files.ts` calls the guard before it writes, and returns its findings
  on the result.
- `tools.ts` gains nothing per rule. If it does, the constraint failed.

## The measurement this design rests on

A WRITE COSTS 4 TO 12 ms TODAY against a 1000 ms budget, measured over
twelve consecutive `se_file_write` calls from the call log's own
`duration_ms` on 2026-08-16.

THE UNMEASURED HALF IS THE CORPUS READ. `guard.ts` and `vocabulary.ts`
need no corpus and are provably cheap. `rules.ts` reads nodes, and the
first chunk takes that number before anything commits to it.

IF IT DOES NOT FIT, `rules.ts` moves behind `sweep.ts` and the write
reports rather than refusing. That fallback is named in
`req-a-check-too-slow-for-the-write-moves-to-the-sweep` rather than
improvised.
