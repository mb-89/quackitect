---
id: method-overhaul-prior-art
statement: The evidence behind the overhaul method — the maintenance-engineering adaptation, and the field scan its own step zero ran.
---

# overhaul — the evidence behind the method

`guidance/method/overhaul.md` carries the RULINGS. This page carries what
they rest on.

WHY THEY ARE APART. The method card is SERVED to an agent every time the
overhaul runs, and a served document is paid for on every read. The reasoning
is wanted once, by whoever doubts a rule.

## The maintenance-engineering half, adapted

THE METHOD PAGE SAID THIS WAS OWED for as long as it existed. It was
delivered on 2026-08-25.

Maintenance engineering does not ask whether to overhaul a thing. It asks,
PER FAILURE MODE, which of a closed set of policies applies. The founding
study is [[ref-rcm-nowlan-heap]]; the conformance standard is
[[ref-sae-ja1011]].

### The four task forms, and the order they are tried in

- Scheduled inspection at intervals, to find a POTENTIAL failure.
- Scheduled rework at or before an age limit. This is overhaul.
- Scheduled discard at or before a life limit.
- Scheduled inspection of a HIDDEN-function item, to find a failure that has
  already happened.

THE ORDER INSIDE EVERY CONSEQUENCE CLASS IS FIXED. Inspect first. Overhaul
second. Replace third. Redesign last, and compulsory only where safety is at
stake.

### Why a calendar-driven sweep has no support here

A rework task is applicable only where three things hold.

- There is an identifiable AGE at which failure probability climbs sharply.
- A large proportion of units survive to that age.
- Reworking can restore the original resistance to failure.

MEASURED IN THE FOUNDING STUDY: 89% of items had no wearout zone at all, 5%
had none well defined, and only 6% showed pronounced wearout. Scheduled
overhaul was the task type it found justified LEAST often.

A DOCUMENT CORPUS HAS NO SUCH AGE. It fails when the world moves. So the
trigger is a moved standard, and this method's retro-driven cadence is the
one the literature supports.

### The ledger the founding study makes unavoidable

Its worked example, on a turbine engine. A 2,000-hour rework limit cut the
failure rate to 0.416 and cut average realised age from 1,811 hours to 1,393.

THE RESULT: about 135 fewer failures, and about 166 more engines needing
rework. Fewer failures, more total work.

### The seven questions, and the two SORTED skips

- What is this thing FOR?
- In what ways does it FAIL that?
- What CAUSED each failure?
- What HAPPENS when it fails?
- In what way does it MATTER?
- What task predicts or prevents it?
- What if no task fits?

SORTED STARTS AT THE THIRD. The standard exists because processes that
skipped its steps were being sold under its name.

### The three selection rules

- A task must be technically feasible AND worth doing.
- Where several qualify, the most cost-effective wins.
- ASSESS AS IF NO TASK IS CURRENTLY BEING DONE.

THE LAST IS THE ANTI-INERTIA RULE. A page is not justified by somebody's
habit of keeping it. Its cousin is the sunk-cost exclusion in
[[ref-repair-or-replace-thresholds]].

### The two policies SORTED has no letter for

- FAILURE-FINDING, for a failure nobody would notice.
- RUN-TO-FAILURE, which is a recorded decision rather than an absence of one.

### What the word itself promises

"Overhauled" has a legal definition ([[ref-14cfr43-2-overhaul]]):
disassembled, cleaned, inspected, repaired as necessary, reassembled, and
TESTED against the approved standard.

THE LAST STEP IS THE ONE A SWEEP SKIPS.

## The field scan of 2026-08-25

Run by step zero, on the method itself.

### Where the field is ahead of us

- THE RATCHET. A new check lands frozen and reports only new violations
  ([[ref-archunit]], [[ref-betterer]]).
- THE FALSE-POSITIVE BUDGET. A published rate, watched, with the analyser
  switched off above it ([[ref-swe-at-google]]).
- SHARDING. One executed sweep splits by ownership into independently
  revertible changes ([[ref-swe-at-google]]).
- CONFORMANCE MODELS. An intended structure checked against the real one,
  catching drift no changed rule could ([[ref-reflexion-models]]).
- EXECUTABLE DOCUMENTATION ([[ref-executable-documentation]]).

### Where this method was already right

- SCOPING BY A DELTA is what the field does ([[ref-clean-as-you-code]]).
- THE MACHINE-VERSUS-JUDGMENT SPLIT is the axis Google's own analysis
  programme is built on.
- EXECUTING THE FIX rather than filing it is the published lesson. Filing
  bugs from tool output failed there, with 84% never fixed.

### What is contested

- PERIODIC VERSUS CONTINUOUS is unresolved. Interleaved refactoring dominates
  practice, and a dedicated campaign at Microsoft measurably cut defects and
  dependencies ([[ref-refactoring-at-microsoft]]).
- WHETHER DEBT CAN BE MEASURED AT ALL is open. Google tested 117 candidate
  metrics and none predicted what engineers reported.
- WHETHER AN AGENT HELPS ON A MATURE CODEBASE is open. The only randomised
  trial found experienced maintainers 19% SLOWER with the tools
  ([[ref-metr-ai-productivity]]).

THE PREDICTOR ACROSS EVERY STUDY is whether an automatic validator exists.

### The one classic rule this scan invalidated

"NEVER SWEEP THE WHOLE CORPUS, IT WILL NOT FINISH" is false for any rule a
machine can check and fix. That is software.md's labour-rationing rule,
confirmed by measurement rather than asserted.

IT STILL HOLDS FOR THE JUDGMENT HALF, which the same evidence says may have
got MORE expensive rather than less.

### What an agent-run sweep may not claim

COVERAGE. Measured recall for a model tracing documentation against code runs
from 47% to 75%, at high precision ([[ref-agentic-refactoring]]).

AND AN AGENT PREFERS SMALL EDITS TO STRUCTURAL ONES, measured over 15,451
refactorings in real projects.

### Where ROT stands

ROT IS FOLK METHOD, and the method page cited it as prior art. A scan for a
primary source found none: no peer-reviewed origin, no published evaluation,
every citation an agency or vendor page.

MUSTIE is the one with a profession behind it.

## Where SORTED comes from, and what is not evidence

Weeding practice in libraries has run on MUSTIE since 1976. It is the source
SORTED is modelled on: a fixed named list, so two passes reach the same
verdict rather than two tastes.

ROT IS FOLK METHOD. No primary source exists for it. It stays an influence and
never evidence, and the overhaul card cites MUSTIE instead.

## Why the backstory leaves a loaded page

Two separate reasons, and the rule holds on either one alone.

- THE AGENT PAYS FOR EVERY LINE, every turn, on the pages the prompt layer
  assembles. Backstory is the largest thing on those pages that no walk ever
  acts on.
- THE READER CANNOT TELL RULE FROM STORY when the two are interleaved. A card
  opening three sections with what it once said reads as a changelog wearing a
  rule's clothes.

WHAT THE FIRST SWEEP MEASURED: 659 provenance lines across 119 of the 247
pages the engine loads. The worst four were the refusal register at 44 lines,
the engineering card at 33, the retro card at 33 and the software card at 26.

THE DETECTOR HAS A FALSE-POSITIVE RATE AND IT IS NOT SMALL. Run against the
overhaul card itself, 5 of its 16 hits were the card's own rule text naming the
shapes to look for. About a third. So the script ranks pages for a person to
cut, and it may never cut by itself.
