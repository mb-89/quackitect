---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: raid-issue-the-corpus-wide-inspections-have-no-runner
type: "[[raid]]"
kind: issue
statement: Three test specs demand a sweep over the whole corpus and nothing runs one, so each verification judges them by hand or not at all.
owner: the driving agent
trigger: when the voice lint is armed at i25, or at the FIRST verification after 2026-09-01 - whichever comes first
status: open
impact: A spec nobody can execute is checked by whoever remembers to, which means it is checked differently every time and eventually not at all.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - note-70c755925b31
  - tsp-prose-inspection
  - tsp-record-inspection
  - tsp-derivation-analysis
place: i25-judgment-the-voice-and-its-linter-integr
---

Three of the nine specs a verification must answer want the whole corpus
looked at, and no command does that.

- tsp-prose-inspection wants entry documents, tour text and research nodes
  swept for voice.
- tsp-record-inspection wants every stored node inspected, not only the
  upward links the trace tests already cover.
- tsp-derivation-analysis wants a dated recorded argument over every served
  view and every reachable capability.

WHAT EXISTS TODAY. `se_lint` sweeps a glob and answers in milliseconds, and
the trace tests cover the link direction they were written for. Both are real
and neither is the spec.

WHAT THE VERIFICATION ACTUALLY DID at i28, so the gap is visible rather than
implied. The lint ran over `guidance/**/*.md`: 18 files swept, 14
clean, 4 findings. None of the four is a file i28 wrote. The trace tests ran
green at 56 cases. Neither run answers the spec it was reached for.

WHY IT IS AN ISSUE AND NOT A DEBT. It is not a shortcut taken knowingly. The
specs were written as inspections on the assumption a reader performs them,
and a reader on an unattended machine is exactly what this iteration removes.

THE FOUR STANDING VOICE FINDINGS belong to note-70c755925b31, which records
29 of them and says nothing sweeps them. That note is i25's opening debt and
must not be drained here.

REPAYMENT is a command per spec that answers it, or a spec rewritten to demand
what a command can answer. Either one ends the hand-judging.

## What it cost, measured at i33 (2026-08-17)

THE IMPACT LINE ABOVE STOPPED BEING A PREDICTION. i33's verification spawned
a tester with fresh eyes, and it found FOUR FACTUAL ERRORS sitting in the
entry document a stranger reads first:

- README.md named a pull instruction, `choose`, that the engine has never
  emitted. The contract itself says so in as many words.
- It counted the lane at 11 tools. There are 34.
- It described the project as living in a git worktree, deleted an iteration
  earlier.
- It carried SEVEN bare method terms with no definition one click away,
  against the owner's own entry-document law. Four were found in the first
  round and three more survived the first fix, because jargon was moved rather
  than removed - `legal_tools` was made plain in one place and left standing
  in two others.

EVERY ONE OF THOSE IS WHAT tsp-prose-inspection ITEM 1 ASKS FOR, and that spec
was marked owed at verification after verification while they stood.

THE TRIGGER WAS THE SECOND HALF OF THE PROBLEM, and i33's tester named it:
"a debt whose trigger fires every time is a debt that becomes furniture". The
old wording fired at EVERY verification, which singles out none. It now names
a date. The precedent is raid-debt-human-observed-demonstrations, swept
2026-08-15, re-accepted, and heavier afterwards - four specs became eight.

## Partly repaid, same day

THE RUNNER EXISTS FOR THREE OF THE EIGHT ITEMS. engine/bin/prose-inspect.ts
answers item 1 (bare method terms in entry documents), item 3 (usernames and
hostnames in stored records) and item 8 (the desk offers a tour). It runs at
the boot's exit beside the sweep, so it fires every session rather than
waiting to be remembered.

ITEMS 2, 4, 5, 6 AND 7 STAY HAND-JUDGED, and the command prints that on every
run. They are judgments about whether a source supports a claim and whether a
comparison carries both sides. No command answers those, and one pretending to
would be worse than none.

SO THE PROSE HALF DROPS TO FIVE ITEMS RATHER THAN EIGHT.

THE RECORD HALF GAINED A RUNNER TOO, later the same day.
engine/bin/record-inspect.ts answers item 11 (every stored node reachable from
something) and item 12 (a test verdict records the question it answered). It
reads .se/calls.jsonl RAW rather than through se_log_query, deliberately: the
query drops matching records without saying so, which is itself an open entry,
and an inspection built on a lying instrument inspects nothing.

ITEM 12 FOUND A REAL DEFECT ON ITS FIRST RUN. The test verdict never recorded
the question it was answering, so a reader could see that a battery ran and
not what it was asked. Fixed, and the fix is visible in the live log: eleven
runs, nine of which predate it.

SO THIS ENTRY STAYS OPEN, and it is smaller than it was.
tsp-derivation-analysis still has no runner at all. tsp-prose-inspection has
one for three of eight items and tsp-record-inspection for two of twelve, and
both commands print what they cannot see on every run.

WHAT THE BUILD ITSELF TAUGHT. The first run reported 97 findings and every one
was false: the git user is the same word as the product, so every mention of
the product read as a leaked username. Had that gone into a report unread it
would have been the exact failure this register entry is about - a check
answering confidently on garbage. The command now skips a colliding needle and
prints the blind spot every run.

A CHECK THAT CANNOT SEE SOMETHING MUST SAY SO. That is the rule this repayment
adds, and it is worth more than the three items.
