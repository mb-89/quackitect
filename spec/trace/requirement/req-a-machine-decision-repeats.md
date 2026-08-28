---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: req-a-machine-decision-repeats
type: "[[requirement]]"
statement: While the inputs a decision reads are unchanged, the engine shall return the same decision on every machine and at every repetition, and shall record what it read.
kind: quality
fitness_candidate: true
characteristic: reliability
verify_method: test
breaks_if_removed: A walk stops being replayable. Two machines given the same record reach different answers with nothing to say why, and a finished record can no longer be audited — only re-run and hoped over.
breaks_how_badly: crippling
refines:
  - uc-quality-reliability
source_refs:
  - uc-let-the-machine-name-the-driver
  - req-one-model-list-is-read-live-from-the-repository
  - vp-the-engine
  - i38-the-machine-sizes-its-own-driver-every-s
priority: must
weighs_against:
  - req-no-agent-act-destroys-work <
  - req-a-wrong-act-never-passes-silently <
  - req-every-call-logged <
  - req-call-answers-in-one-second >
  - req-newcomer-one-command >
  - req-the-answer-never-exceeds-its-bound >
weighs_with: none
---

## Scenario

- source: anybody re-running a decision the engine already made — an auditor, a
  second machine, the same machine a week later
- stimulus: the decision is asked for again while every input it reads is
  unchanged
- artifact: the deciding path, and the record it writes
- environment: any supported host, any model, with the record committed and the
  inputs untouched between the two asks. No process from the first answer
  survives, so nothing in memory can carry the answer across
- response: the same decision comes back, and the record names what was read to
  reach it
- response measure: decisions differing across repetitions with unchanged
  inputs = 0, across repetitions and across machines; decisions recorded
  without their inputs = 0

## Why this axis did not exist and why it is needed now

FOURTEEN CRITERION AXES STOOD BEFORE THIS ONE and not one of them measures
whether a decision the machine makes REPEATS. They measure whether acts are
recorded, whether wrong acts are prevented, whether answers arrive in time,
whether work survives — all true and none of them this.

THE GAP HAS TEETH RATHER THAN BEING TIDY-MINDED. This iteration is choosing
between a fixed declared mapping and a runtime router, and the owner has
already ruled for the fixed one. AGAINST THE STANDING FOURTEEN, A ROUTER WINS:
it fits each item better, costs less, and breaks none of them. The criterion
set as it stood could not express why the chosen design is chosen, so any
honest comparison run on it would have scored the rejected option higher.

A COMPARISON THAT CANNOT SCORE THE REASON FOR THE DECISION IS NOT A COMPARISON.
Adding the axis is what makes the Pugh round mean anything at this milestone,
and it is what the state's own note sanctions: standing criteria are reused
where they still measure what matters, and the change adds one or two of its
own.

## What it measures, and what it does not

IT MEASURES REPEATABILITY OF AN ANSWER, not correctness of one. A design that
reliably returns the same wrong driver scores full marks here and is caught by a
different axis. That separation is deliberate — a criterion that smuggles
correctness into repeatability measures two things and is worth neither.

IT INCLUDES "AND SHALL RECORD WHAT IT READ" for a reason this iteration
learned the hard way. An answer that repeats but cannot say what it was derived
from is reproducible only by luck: nobody can tell whether it repeated because
the inputs held or because nothing looked.

IT IS NOT `req-audit-answers-from-log`, though they are neighbours. That one
asks that the retro's counts be derivable from the log. This one asks that a
DECISION be re-derivable from its inputs. A system could satisfy either without
the other.

## It was minted to be scored and it gates instead

FOUND AT gate-candidates, 2026-08-20, BY HOLDING IT AGAINST THE CANDIDATES.

THIS NODE'S OWN ARGUMENT FOR EXISTING is that the standing fourteen axes could
not express why the chosen design is chosen — "A COMPARISON THAT CANNOT SCORE
THE REASON FOR THE DECISION IS NOT A COMPARISON."

IT CARRIES `priority: must`, SO IT NEVER SCORED ANYTHING. `cut-criteria` said
so in as many words and treated it as correct: a must is a constraint, and only
a row a candidate can score badly on and still be a candidate discriminates.

SO THE COMPARISON STILL CANNOT SCORE THE REASON FOR THE DECISION. The axis was
minted for that job, made a gate, and excluded from the job. Neither state was
wrong on its own terms and the outcome is that nothing measures the thing this
iteration exists to argue about.

THE PRIORITY STAYS `must` AND THAT IS A JUDGMENT RATHER THAN AN OVERSIGHT. A
walk that answers differently on two machines is not a worse walk, it is an
unauditable one, and a design that fails this is not a candidate. What follows
is that every candidate owes an answer to it, which none of them had given until
this was found.

WHAT WOULD ACTUALLY CLOSE THE HOLE derive-criteria NAMED: a `should` row that
measures how much of a decision's derivation the record carries. That is a
different demand from this one and it is not minted here, because minting a
criterion at a gate that is about to score against it is the one edit that
cannot be honest.

## The judgments behind its weight

RANKED BELOW three axes and above three, with the rest left unjudged rather than
guessed:

- BELOW `req-no-agent-act-destroys-work`, `req-a-wrong-act-never-passes-silently`
  and `req-every-call-logged`. Losing work, letting a wrong act through, and
  failing to record at all are each worse than an answer that varies — and the
  last of the three is the substrate this one stands on.
- ABOVE `req-call-answers-in-one-second`, `req-newcomer-one-command` and
  `req-the-answer-never-exceeds-its-bound`. A slow, awkward or paged answer that
  repeats is worth more here than a fast one that cannot be reproduced.

THE REMAINING EIGHT ARE LEFT UNJUDGED ON PURPOSE. They measure things this
change does not press on, and a guessed comparison would move a weight that
arithmetic then presents as measured.
