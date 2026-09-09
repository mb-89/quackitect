---
kind: [[handover]]
status: todo
urgency: soon
---

# A reader goes before trunk

A branch comes back at `done` and somebody merges it. That somebody reads the
diff, or runs out of afternoon and does not.

This branch builds the reader. It reports, and the merge happens anyway. Its
whole job is to spare a person the read, and to hand back a short list of what
to fix next.

# What it is

| it is | it is not |
|---|---|
| a second pair of eyes | a gate |
| a list of fixes | a verdict |
| a thing you run when you want it | a thing that fires on its own |

Nothing it says stops a merge. Build no refusal, no verdict field, and no
switch holding a branch back.

# The verb collects

`./RUNME.sh work review <name>` gathers what a reader needs and prints it. No
model runs in this half, and every answer here is mechanical.

## What it gathers

| the thing | where it comes from |
|---|---|
| the brief | `HANDOVER.md` at the branch's first commit |
| the handback | `HANDOVER.md` as the branch carries it now |
| the shape of the diff | `git diff --stat main..work/<name>` |
| the whole diff | `git diff main..work/<name>` |
| the check | `./RUNME.sh check` on that branch |

The brief and the handback are one file at two commits. `work new` writes the
brief in the branch's first commit, so read that commit for the brief and the
tip for the handback.

## What it answers alone

1. Does `./RUNME.sh check` pass on that branch? Run it, and print the exit.
2. Does the handback carry a retro? Look for the chapter, and say yes or no.

Both are presence, not judgement. A model reading either of them wastes a call.

This half earns its place alone. A person runs the verb and reads the diff, with
the mechanical answers standing in front of them.

# The reader runs elsewhere

The point of the reader is that the session asking for it spends no context on
the diff. So it runs as an agent of its own.

## How the harness offers this

`$.agent.spawn` shapes a helper before it starts: its prompt, its type, its
model, its working folder. Level zero holds neither it nor `$.agent.offer`
today, so this is new ground.

Prove it small before you build on it. Spawn an agent that answers one word,
and say in your handback what the call takes and what it answers.

## The shape to build

1. Level zero registers a tool at `session.start`, `review_branch`, taking a
   branch name.
2. The hook serves it: it runs the collection from part one through
   `$.process.run`, then spawns a reader with that material and the rule set.
3. The reader answers the five questions below, and the tool answers its report.

A session then asks for a review in one tool call, and reads a short list.
Where `$.agent.spawn` refuses to carry this, say so and leave part one standing.

# The five questions

They live in `spec/guidance/reviewing.md`, written as actionables the way every
other guidance note is.

| # | the question | who answers |
|---|---|---|
| 1 | Does the branch do what the brief asks? | the reader |
| 2 | Is everything the diff touches beyond the brief a trivial fix? | the reader |
| 3 | Does `./RUNME.sh check` pass? | the verb |
| 4 | Does the handback carry a retro naming its surprises? | the verb |
| 5 | Does every rule the branch adds carry a test proving it fires? | the reader |

## Why five carries weight

A rule firing on nothing looks alive. This tree meets that twice in two days:

- A Vale rule carrying a runtime error puts `E201` on standard error and
  nothing on standard output. The linter reads empty output and answers "The
  rules pass", with every rule off.
- A merge leaves `$` read bare in the hooks module, which the engine refuses.
  `check` shows nothing, because nothing runs `claude plugin validate`.

So the question is not whether a test exists. It is whether a test feeds the
rule something bad and asserts the rule refuses it.

## Why two asks about triviality

A branch fixes what it trips over. `spec/guidance/working.md` rule nine says so:
trivial goes in, deeper gets written down and left alone.

So a file outside the brief is no fault by itself. The fault is a diversion, a
redesign of something the brief leaves alone. Question two asks the reader to
tell those apart, and that judgement is why a model answers it.

# What the report looks like

Short, and every line something to do:

    work/the-config-holds-numbers

    check      passes
    retro      present
    brief      done, and nothing beyond it
    tests      2 rules added, 1 carries no test:
               VoiceShape.StopRule fires on nothing under test
    beyond     src/doors/git.js, a one-line fix, trivial

    2 things to fix, and neither holds the merge.

A report with nothing to say fits on one line.

# What to prove first

1. `./RUNME.sh check` passes, and it runs `claude plugin validate` for you.
2. The verb collects a brief, a handback and a diff from a fake git, under test.
3. The verb answers the two mechanical questions, under test.
4. The verb refuses a branch that does not stand, and says which.
5. Where part two lands, one review runs end to end and the report reads well.

# What your handback says

- What the spawn call takes and answers, and where it refuses.
- What one review costs, in seconds and in model calls.
- Which of the five questions the reader answers badly, and why.
- Whether the report is short enough to read whole.

## How this branch runs

Level zero deletes this file when it reads it, so the copy in your context
is the only one left. These steps write it back.

1. Run `./RUNME.sh work sync` FIRST. It takes main into this branch, so
   an old branch works against what the tree holds now. Resolve any conflict
   before you start, because a conflict found later costs the work already
   done.
2. Commit and push each time you finish a thing. A cloud box dies and takes
   its working tree with it.
3. Write your result and your retro into `HANDOVER.md`, at the root, replacing
   this brief. Say what surprises you and every dead end you walk into.
4. Run `./RUNME.sh work done`, which sets the status and pushes.
5. Run `./RUNME.sh work release` instead where you stop early, so the branch
   goes back to `todo` for somebody else.
6. Leave the merge into main to a person. A cloud box opens no pull
   request, and trunk only ever comes towards you.
