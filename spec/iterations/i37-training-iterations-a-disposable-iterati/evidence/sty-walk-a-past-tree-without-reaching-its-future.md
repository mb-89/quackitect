---
form: sty-walk-a-past-tree-without-reaching-its-future
by: agent
signed_off: 2026-08-20T13:12:13.957Z
authors: agent
files:
---

# Evidence form / sty-walk-a-past-tree-without-reaching-its-future

## current_situation

Every door to the future was tried from inside a bound run, and every one closed.

PERFORMED AGAINST THE REAL REPOSITORY, bound to i33, with a previous run's report planted so the concealment had a subject to hide.

THE STORY IS THE ONE THIS ITERATION EXISTS FOR: a walk must measure the machine rather than the agent's ability to find the answer.

## built

`project/scratchpad/demo-doors.mjs`, run on 2026-08-20.

THE GIT DOOR.

    HEAD (after the rewind)            83f8b5a36202
    does HEAD resolve in the tree?     false
    does the rewind point resolve?     true
    control: neighbour files there     true

The future does not resolve, the rewind point does, and the control proves the tree is not merely empty. Those three together are what make the ceiling STRUCTURAL rather than a check that could fail open.

THE LANE DOORS, all four.

    read of a report            REFUSED — SE-C-102
    search hits in benchmarks   0
    glob over benchmarks        0
    list names benchmarks       false
    call sites covered          4

THE READ REFUSES AND THE OTHERS OMIT, which is a design decision rather than an inconsistency. A read asks for one named path, so an empty answer is indistinguishable from an empty file; omission IS the answer a listing gives.

AND EVERY DOOR REOPENED WHEN THE RUN CLOSED.

    isBound                     false
    read of a report            LANDS
    glob over benchmarks        1
    resembling path concealed?  false

A mask that is always on satisfies half the requirement and breaks the system, so the both-ways case is the one that matters. `project/spec/benchmarksomething/` stays visible: the rule is a rule, not a substring.

## follow_up

- WHAT IS DEMONSTRATED IS THE MECHANISM, not an agent's experience of it. No agent has walked a bound run; the doors were tried by a script. A real walk is the thing that would show whether an agent NOTICES the doors are shut, which is a different question and a better one.
- THE REPORT FIXTURE WAS REMOVED after the run. It was planted so the concealment had a subject, and leaving it would have seeded the reports folder with a run nobody made.
- THE POOL PROBLEM FOUND IN THE FIRST DEMO STANDS. Ten of sixteen shipped iterations have no start commit, so a default `se_benchmark` refuses. This demo named i33 for that reason.
- gate-validation SHOULD RECORD that gate-implementation's first override no longer stands. The concealment is built, its cases are green, and every door it names was watched closing.

## anything_else

THIS DEMONSTRATION EXISTS BECAUSE THE OWNER ASKED A QUESTION, and that is worth recording plainly.

gate-implementation passed with `req-the-benchmark-history-is-unreadable-while-a-run-is-bound` UNMET, as a named override. I had carried the block through three states: deferred at gate-prototype on the count of exclusion lists, re-tested at build-steps, and confirmed for what I thought was a better reason.

THE OWNER ASKED WHETHER ANYTHING WAS NEEDED FROM THEM. Going to look at the actual choke points took one grep, and the answer was that `search.ts:112` is a single point where every match arrives before it is returned. One line.

SO A `must` REQUIREMENT SAT UNMET THROUGH A GATE for want of a question nobody asked. The gate did its job — it recorded the override with its dissent rather than passing clean — but the dissent was written about a block that was not there.

WHAT I WOULD DO DIFFERENTLY, and it is not `re-test the block`, because I did that. Re-testing a block as STATED confirms the statement. The useful question is what the WORK needs, and that has to be asked as its own question rather than inferred from why the block was recorded.
