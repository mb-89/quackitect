---
kind: [[funnel]]
about: who reads a branch before it reaches trunk
---

# A reader stands before trunk

A branch comes back at `done` and a person merges it. That person reads the
diff, or does not, and the second is what happens under time.

So a reader stands between: an agent given the branch, a rule set, and one
question. It reports, and the merge stays a person's.

## What the harness already offers

`$.agent.spawn` shapes a helper before it starts: its prompt, its type, its
model, its working folder. `$.agent.offer` decides which types the session offers
at all. Level zero holds neither today.

So the shape is there. A door that notices a branch reaching `done` can start a
reader without a person typing anything.

## Two places, and they differ

| where | the cost | the gain |
|---|---|---|
| a hook, on the branch reaching `done` | a model call per branch, with nobody asking | it runs on every branch |
| a verb, `./RUNME.sh work review <name>` | somebody types it | it runs when a person wants it |


The verb is the smaller first step, and the hook is the same reader called from
somewhere else.

## What the reader reads

Reviewing is too wide a word to write a rule set for. Narrow it to what this
tree can decide:

1. Does the branch do what its brief asks, and only that?
2. Does `./RUNME.sh check` pass on it?
3. Does its handback name a retro, with the surprises in it?
4. Does every new rule carry a test?
5. Does the diff touch a file outside what the brief names?

Each of those is a question with an answer, which is what makes a rule set out
of a broad word.

## What to decide first

- Whether the reader refuses a merge or only reports. Refusing needs a verdict
  the merge verb reads; reporting needs nobody.
- Where the rule set lives. `spec/guidance/reviewing.md` matches every other
  rule in this tree.
- Whether the reader runs on a desk or on a cloud box. A cloud box costs
  nothing on the desk and reaches the branch already.
