---
kind: [[rationale]]
explains: [[spec/guidance/review/reviewing]]
---

# Why

A person merging a branch either reads the diff or runs out of afternoon. The
second case happened more often here, and a branch merged unread cost whatever
it carried.

So a reader goes first. One review costs one model call and the seconds a
checkout takes, and that price bought three answers a program could not give.

| the question | who answers |
|---|---|
| Does the branch do what the brief asks? | the reader |
| Is what it touches beyond the brief trivial? | the reader |
| Does `./RUNME.sh check` pass? | the verb |
| Does the handback carry a retro? | the verb |
| Does every added rule carry a test? | the reader |

Read this note again on any of three signs:

- a report grows past what a person reads whole
- the reader answers one of the five questions wrongly, twice
- a person merges against the report and turns out right, twice

## 1. The brief is the claim

A branch makes one claim: it does what its brief asks. A diff shows what
changed and says nothing about that claim.

So the first question weighs the two together, and it names what goes missing.
A program reading the diff alone answers neither half.

## 2. The trivial fix goes in

`spec/guidance/working.md` rule nine sends a trivial fix in and a deeper one to
a finding. A file outside the brief is therefore no fault by itself.

The reader asks whether the extra is trivial, and stops there. The next
question decides the rest.

## 5. A rule firing on nothing

A rule firing on nothing looks alive. This tree met that twice in two days.

- A Vale rule carrying a runtime error wrote `E201` to standard error and
  nothing to standard output. The linter read empty output and answered "The
  rules pass", with every rule off.
- A merge left `$` read bare in the hooks module, which the engine refuses.
  `check` showed nothing, because nothing ran `claude plugin validate`.

Both faults passed a test asserting a rule exists. So the reader asks for a
test on every rule a branch adds.

## 6. What the test feeds in

Neither fault above survived a test feeding the rule something bad. A test
asserting a rule exists passes on a rule that decides nothing.

So the question is what the test feeds in, and what it asserts comes back. A
refusal is the one piece of evidence that a rule holds.

## 7. A diversion costs the brief

The fault in a file outside the brief is a diversion, a redesign of something
the brief leaves alone. Telling that apart from a trivial fix takes a reading
of the diff.

A model answers it. A count of touched files answers something else.

## 9. The report is a list

A gate refusing a merge turns every judgement call into an argument with a
program. The person who wants the merge then finds the switch that turns the
gate off, and the switch stays off.

So the reader hands back a list of fixes, and the merge stays a person's call.
It spends a person's attention where it pays.
