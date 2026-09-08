---
kind: [[funnel]]
about: who reads a branch before it reaches trunk
---

# An agent reads a branch before a person merges it

A branch comes back at `done` and a person merges it. That person reads the
diff, or does not, and the second is what happens under time.

So a reader stands between: an agent given the branch, a rule set, and one
question. It reports, and the merge stays a person's.

## What the harness already offers

`$.agent.spawn` shapes a helper before it starts: its prompt, its type, its
model, its working folder. `$.agent.offer` decides whether a type is offered at
all. Level zero holds neither today.

So the shape is there. A door that notices a branch reaching `done` can start a
reader without a person typing anything.

## Two ways to place it, and they differ

| where | what it costs | what it buys |
|---|---|---|
| a hook, on the branch reaching `done` | a model call per branch, unasked | nobody remembers to run it |
| a verb, `./RUNME.sh work review <name>` | somebody types it | it runs when a person wants it |

The verb is the smaller first step, and the hook is the same reader called from
somewhere else.

## What the reader reads

Reviewing is too wide a word to write a rule set for. Narrow it to what this
tree can decide:

1. Does the branch do what its brief asked, and nothing else?
2. Does `./RUNME.sh check` pass on it?
3. Does its handback name a retro, with what surprised the writer?
4. Does every new rule carry a test?
5. Does the diff touch a file the brief never mentions?

Each of those is a question with an answer, which is what makes a rule set out
of a broad word.

## What to decide first

- Whether the reader refuses a merge or only reports. Refusing needs a verdict
  the merge verb reads; reporting needs nobody.
- Where the rule set lives. `spec/guidance/reviewing.md` matches every other
  rule in this tree.
- Whether the reader runs on a desk or on a cloud box. A cloud box costs
  nothing on the desk and reaches the branch already.
