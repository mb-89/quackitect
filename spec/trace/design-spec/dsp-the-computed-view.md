---
minted_in: i4-the-panel-round-the-archived-iteration-b
id: dsp-the-computed-view
type: "[[design-spec]]"
statement: one engine-side resolver computes the whole view a surface shows, and the surface repeats it without deriving anything about the walk
realizes:
  - el-view-resolver
  - if-account-to-view-resolver
  - if-engine-delta-to-view-resolver
  - if-front-desk-to-view-resolver
  - if-holding-pen-to-view-resolver
  - if-method-compiler-to-view-resolver
  - if-mirror-to-view-resolver
  - if-record-store-to-view-resolver
  - if-view-resolver-to-mirror
  - if-walk-engine-to-view-resolver
files:
  - deliverable/engine/viewmodel.ts
  - deliverable/engine/mirror.ts
  - deliverable/engine/renderclient-place.ts
---

## Responsibility

ANSWER ONE QUESTION: what does the surface show right now. Every fact about
the walk that reaches a person is computed here, once, and handed over whole.

WHAT IT DELIBERATELY DOES NOT DO. It does not render. It emits no markup, no
class names and no colour. The shape it hands over is data.

WHAT IT DOES NOT OWN EITHER. Focus, scroll position and an unsubmitted edit
are the browser's own state. They are named here because the build has to
decide them, and the decision is below.

## Interface

`view(intent, filter) -> ViewModel`

TWO THINGS GO IN. The intent says which view is wanted. The filter says which
slice of it. Both arrive from the surface, carried by
[[if-mirror-to-view-resolver]].

ONE THING COMES OUT, carried by [[if-view-resolver-to-mirror]]: the model, and
nothing else crosses.

THE SEVEN INBOUND CROSSINGS ARE ITS SOURCES. The account, the walk engine, the
record store, the holding pen, the front desk, the method compiler and the
engine delta each hand it what they know. It asks; they do not push.

## Behavior and constraints

IT ANSWERS INSIDE THE SECOND, and that is measured rather than hoped. A
profiled render on 2026-08-23 took 1190.2 ms, of which 1163.6 ms was one call
building the machine's sets. Across 47 profiled renders the median was 360 ms
and the 95th percentile 406 ms.

SO THE BUDGET IS REAL BUT ONE CALL DOMINATES IT. The set-building call is the
whole cost. Everything else together is under 27 ms — states 23.3, the diagram
0.66, the session 0.75, the packet 0.54, the data 0.79, the shared block 0.39,
the checked documents 0.004.

THAT MAKES THE OPTIMISATION SINGLE-TARGET. A resolver that leaves set-building
alone inherits the 1190 ms outlier. This is named so the build aims at the one
call rather than spreading effort across eight.

### The phase names survive the split, and their order does not

THE RESOLVER TAKES THE CALLER'S PHASE CALLBACK. It reports `session`,
`machine.sets`, `machine.states`, `packet` and `checked_docs` under their old
names, measuring the same work, so a profile taken after the split is
comparable to one taken before.

`machine.states` NOW COMES BEFORE `machine.svg`. The model is built before it
is drawn, which is the whole point of the split. A reader comparing two
profiles sees the same names in a different order, and that is said here rather
than left to be discovered.

### The redraw decision, which the build must make once

SIX PLACES PRESERVE STATE ACROSS A REDRAW TODAY:

- `deliverable/engine/basesclient.ts` line 130
- `deliverable/engine/editors/node-table.ts` lines 197 and 242
- `deliverable/engine/renderclient-detail.ts` lines 114 to 117
- `deliverable/engine/renderclient-log.ts` lines 37, 52 and 55
- `deliverable/engine/renderclient-live.ts` line 286
- `deliverable/engine/renderclient-walk.ts` line 218

TWO ROUTES, AND ONLY ONE IS PICKED. Either the model carries focus, scroll and
unsubmitted edits, or the surface keeps exactly those three and nothing more.

WHAT MUST NOT HAPPEN IS BOTH. Two places holding one truth with nothing
reconciling them is the failure this round found four times over. Splitting the
redraw between the model and the surface would be the fifth.

THE DECISION WAS MADE: the surface keeps all three, in one place.
`deliverable/engine/renderclient-place.ts` is that place, and it is the first
part of the client script so every later part can ask it.

WHY THE MODEL DOES NOT CARRY THEM. They change on every keystroke, so a model
carrying them would need a round trip per character typed.

WHAT WAS ACTUALLY WRONG was never where they lived. Six places each decided for
themselves what "the reader's place" meant, and no two agreed: one asked
whether an element WAS the focused one, another whether it CONTAINED it, a
third blurred first and asked afterwards.

## Rationale

THE SURFACE DERIVED ITS OWN ANSWERS, and they drifted from the engine's. The
decision [[raid-the-surface-repeats-a-computed-view-behind-a-guard]] rules that
one surface survives and derives nothing about the walk.

THE ALTERNATIVE WAS TO LET THE SURFACE KEEP DERIVING and to reconcile after the
fact. That is what stands today, and it is the thing being removed.

WHAT IT COSTS. Every fact the surface wants now crosses a seam, so a view that
needs one more field needs a resolver change. That is the price of the single
answer and it is paid knowingly.
