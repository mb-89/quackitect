---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: raid-issue-the-corpus-wide-inspections-have-no-runner
type: "[[raid]]"
kind: issue
statement: Three test specs demand a sweep over the whole corpus and nothing runs one, so each verification judges them by hand or not at all.
owner: the driving agent
trigger: when the voice lint is armed at i25, or when a verification next has to answer them
status: open
impact: A spec nobody can execute is checked by whoever remembers to, which means it is checked differently every time and eventually not at all.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - note-70c755925b31
  - tsp-prose-inspection
  - tsp-record-inspection
  - tsp-derivation-analysis
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
implied. The lint ran over `project/guidance/**/*.md`: 18 files swept, 14
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
