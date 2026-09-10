---
kind: [[rationale]]
explains: [[spec/guidance/reviewing]]
---

# Why a reader goes first

## decided

A branch comes back at `done`, and a reader answers five questions about it
before a person opens the diff. The report holds no merge back.

## why

A person merging a branch either reads the diff or runs out of afternoon. The
second case happens more often, and a branch merged unread costs whatever it
carries.

A gate answers that badly. A gate refusing a merge turns every judgement call
into an argument with a program. The person who wants the merge then finds the
switch that turns the gate off, and the switch stays off.

So the reader spends a person's attention where it pays. It names what to fix,
in a list short enough to read whole, and the merge stays a person's call.

## costs

One review costs one model call and the seconds a checkout takes. That price
buys three answers a program cannot give.

| the question | who answers |
|---|---|
| Does the branch do what the brief asks? | the reader |
| Is what it touches beyond the brief trivial? | the reader |
| Does `./RUNME.sh check` pass? | the verb |
| Does the handback carry a retro? | the verb |
| Does every added rule carry a test? | the reader |

## Why a test that fires

A rule firing on nothing looks alive. This tree met that twice in two days.

- A Vale rule carrying a runtime error wrote `E201` to standard error and
  nothing to standard output. The linter read empty output and answered "The
  rules pass", with every rule off.
- A merge left `$` read bare in the hooks module, which the engine refuses.
  `check` showed nothing, because nothing ran `claude plugin validate`.

Both faults passed a test asserting a rule exists. Neither survived a test
feeding the rule something bad. So the question is what the test feeds in.

## Why triviality takes two questions

A branch fixes what it trips over. `spec/guidance/working.md` rule nine says
so: trivial goes in, deeper gets written down and left alone.

A file outside the brief is therefore no fault by itself. The fault is a
diversion, a redesign of something the brief leaves alone. Telling the two
apart takes a reading of the diff, and that is why a model answers it.

## revisit when

- a report grows past what a person reads whole
- the reader answers one of the five questions wrongly, twice
- a person merges against the report and turns out right, twice
