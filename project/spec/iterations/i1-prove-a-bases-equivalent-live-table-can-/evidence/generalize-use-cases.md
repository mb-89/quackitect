---
form: generalize-use-cases
by: agent
signed_off: 2026-08-07T19:43:56.228Z
authors: agent
files: null
---

# Evidence form / generalize-use-cases

## current_situation

THE STORIES CAME FIRST AND THE SET GREW BY TWO. Twelve journeys stood at write-stories. Reverse-engineering the use cases turned up two goals no story told, so the stories were written before the use cases over them — the example is what makes the general form checkable.

sty-capture-a-stray. Recording a finding that is not today's job, without losing the thread. It was the first slide of the retro story and nothing else, which is not the same as being told.

sty-the-agent-proves-it-read. A fresh agent handed the method one document at a time, unable to reach the work until it proves the reading arrived whole. This is the product's spine and no story covered it.

THE SHAPE CAME FROM v1, AND SO DID A WARNING. v1's item template at ref main declared actors, trigger, success scenario and alternatives. Its actual use cases are one statement line with no scenario at all — checked live at ref main. A shape declared in a template and never checked mechanically does not get filled.

SO THREE THINGS WERE BUILT BEFORE ANY USE CASE WAS WRITTEN. The use-case item template, the guidance card expanded from a summary into real guidance, and the row's field turned from free form into typed references with a coverage rule.

THE QUALITY USE CASES ARE THE NINE CHARACTERISTICS NOW (owner ruling 2026-08-07). Five stood here before — auditable, learnable, maintainable, portable, recoverable — each an ad-hoc category somebody chose. They are struck, and the nine characteristics of ISO/IEC 25010:2023 stand in their place.

WHY THE STANDARD RATHER THAN OUR OWN LIST. A local list cannot tell you what is missing. The nine were meant to be exhaustive over product quality, so a characteristic with nothing under it is a question somebody owes an answer to rather than a gap nobody sees.

EACH ONE CARRIES ITS SUB-CHARACTERISTICS IN ITS OWN PROSE, so a person writing a quality never has to open the standard to place it.

THEY ARE `kind: quality-area`, not interactions. A characteristic is not something somebody does, and the use-case template already carried that second kind for exactly this.

ASKING ALL NINE FOUND A REAL DEFECT. Security had no quality because nobody thought this product had one. It does: the mirror served the whole record on every interface with no authentication, while a comment asserted it never left localhost. That is now req-mirror-stays-on-the-machine, and the bind is fixed.

Thirty-one use cases over twenty-two stories.

## use_cases

- uc-quality-functional-suitability
- uc-quality-performance-efficiency
- uc-quality-compatibility
- uc-quality-interaction-capability
- uc-quality-reliability
- uc-quality-security
- uc-quality-maintainability
- uc-quality-flexibility
- uc-quality-safety
- uc-install-quackitect
- uc-learn-the-machinery
- uc-get-work-routed
- uc-begin-a-product
- uc-open-an-iteration
- uc-set-the-autonomy
- uc-take-a-step
- uc-be-handed-the-method
- uc-adjudicate-a-gate
- uc-capture-a-stray
- uc-drain-the-inbox
- uc-land-work-on-trunk
- uc-resume-after-an-absence
- uc-trace-a-decision-to-its-origin
- uc-vendor-and-overlay
- uc-answer-a-question-with-tests
- uc-change-the-method-mid-walk
- uc-browse-the-archive
- uc-close-a-record
- uc-diverge-before-deciding
- uc-let-the-system-catch-up
- uc-research-and-record-an-answer

## follow_up

- THE ROW CHANGE IS NOT LIVE YET. Rigor matrix rows compile from the trunk, and every write from inside a bound record lands in its worktree. The reshaped field and the entry read are written but cannot take effect until they reach the trunk.
- THE SAME HOLDS FOR THE ITEM TEMPLATE AND THE METHOD CARD. Both exist in this worktree, where the reference check and the entry read read them. Both are owed on the trunk to survive this record.
- THE FOUR GOALS THAT HAD NO USE CASE NOW HAVE ONE. gate-inputs found them by hand, its first version listed them and recommended pass anyway, and the owner ruled that a fail: naming a gap does not close it. Each got its story first, then the use case over it — uc-answer-a-question-with-tests, uc-change-the-method-mid-walk, uc-browse-the-archive, uc-close-a-record.
- AND THREE MORE FROM THE GATE'S SECOND RUN. Walking the live tool list and the live doors by hand found three capabilities a person can reach this minute with nothing describing them: the ideation door, the overhaul door, and researching a question the repo cannot settle. uc-diverge-before-deciding, uc-let-the-system-catch-up, uc-research-and-record-an-answer.
- THE LAST ONE CARRIES THE EVIDENCE RULE as extensions off its final step: a vendor page is evidence a feature is CLAIMED and nothing more; a comparative claim needs evidence on both sides; where our side does not exist the comparison is impossible rather than weak. That is a fabrication I committed at this gate, turned into steps a requirement can derive from.
- THE SUSPECT MECHANISM CAUGHT THE GAP WITHOUT BEING ASKED. The moment write-stories signed with eighteen, this form's sign-off came off by itself and a `suspect:` line named the four stories nothing refined. Nobody noticed it; the engine did, downstream, across two states.
- M3 DERIVES THE REQUIREMENTS from the steps and extensions here. A step no requirement covers is a hole, and the coverage matrix shows it rather than a reviewer.
- EVERY EXTENSION IS A CANDIDATE EXAMPLE. M6 may script them, and the ones that describe refusals are the cheapest tests in the set.

## anything_else

WHAT THE COVERAGE RULE DOES HERE. The field declares `covers: story`, the same rule the stories field uses one level up. Both directions are checked: no use case refines nothing, and no story is refined by nothing. That second half is what surfaced the two missing stories, and it did so mechanically rather than by anyone noticing.

THE COUNTS. Fifteen use cases over fourteen stories. Four use cases refine two stories each, because the same goal appears in more than one journey — routing work shows up both when a person plans a day and when they hand over four ideas at the end of one.

NO USE CASE NAMES A CONTROL. They say what the actor achieves, so a rewrite of every screen leaves them standing. The one place a surface is mentioned at all is the extension about a truncating host, and that names a property of hosts rather than a button.

THE EXTENSIONS CARRY THE REFUSALS. Where the system refuses — a tool outside the legal set, a note drained in the wrong place, an inbox that blocks a kickoff, a land that conflicts — the refusal is an extension off a numbered step. That is where M3's requirements for the refusals will come from, and it is why the extensions were written rather than left implied.
