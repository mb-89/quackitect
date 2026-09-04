---
kind: [[guidance]]
scope: ["every agent or person doing engineering work in this tree"]
out_of_scope: ["how prose is written, which is [[voice]]", "the engine, its tokens and its tools, which are [[driving-the-engine]] and [[work-token]]", "how a test is built, which is [[testing]]"]
depends_on: ["[[voice]]"]
---

# Motivation

This is how an engineer conducts work and solves problems, whatever the tool in front of them.
A reader of this file needs to know nothing about the engine.
Without it a turn is spent arguing with a step, a fix is a guess, and a machine is built against a fear.

# Actionables

1. Follow the process you are in. Take the step in hand rather than arguing with it. *
2. Disagree and commit. Write the concern down where it is triaged, and continue. *
3. Spend your thinking where a mistake is dear to undo. Where it is cheap, decide and move. *
4. Compared two things thrice and still cannot pick? Either will do, or the answer is a third thing. *
5. Invert the question. Ask what would make this fail, what would have to be true, and who has this problem already. *
6. Reproduce the defect before you fix it. A fix without a reproduction is a guess with a commit. *
7. Bisect. Halve what could be wrong, test one half, keep the half that fails. *
8. Name every assumption and the cheapest experiment that decides it. Run the experiment before the argument. *
9. Do not kill yourself because you are afraid of dying. Build against a failure seen, not one feared. *
10. Mark an estimate as an estimate. Say "I do not know" when you do not know.
11. Read a file before you change it. Change one thing at a time, and leave every other file as it was.
12. Stage the paths you edited, by name. Never stage everything. *
13. Private data: names, datetimes and unfiltered notes. They do not go into git.

# Discussion

## 1. Ruminating reads like working

An engineer handed a step and a contract argues with the contract instead of
taking the step, and the argument reads like work.
It costs a turn, it costs what the turn carries, and the step is still there
afterwards.

## 2. A concern is a note, not a halt

Disagreeing is worth something and stopping is not.
A note costs a minute, survives you, and reaches whoever decides.
An argument inside a turn reaches nobody and is gone when the turn ends.
So the concern is written where it is triaged and the work goes on, which is
how a finding becomes somebody's decision rather than your delay.

## 3. Weigh the cost of being wrong, not the cost of deciding

Deleting one test file was escalated to the person. A system-wide install on
their machine was decided in a single line, and so was a rule that deleted
twenty-two test files, two of which were wanted.

The deliberation went where the rules said to be careful and was skipped where
nothing had said anything. So the question is not how big the change looks. It
is what it costs to put back: a commit is cheap, a file the tree has never held
is cheap, and anything that touches the machine, the record, or somebody else's
work is not.

## 4. Two comparisons is enough

Laying out A against B and then taking neither happened a dozen times in one
day. Where it went four rounds, the options were not far apart.

If two answers have survived two honest comparisons, the difference is not what
is blocking you. Pick one and say why, or stop comparing and ask what neither of
them is.

## 5. Invert

Jacobi's advice to mathematicians was to invert, always invert, and Munger
made it a habit: a problem that will not yield forwards often yields backwards.
Three inversions pay here.
What would make this fail, asked before it is built, is a pre-mortem, and it
finds the failure while it is cheap.
What would have to be true for this to be right turns a debate into a list of
things to check.
Who has this problem already turns a design into a search, and the answer is
usually a library, a paper or a file in this tree.

## 6. Reproduce first

A fix applied to a defect nobody has reproduced fixes the story of the defect.
The reproduction is the smallest input that shows it, held in a test, so the
fix is watched working and the defect cannot come back unnoticed.
Where it cannot be reproduced, that is the finding, and it is written down
before anything is changed.

## 7. Bisect

A search over a space of causes goes fastest by halving.
Which commit, which file, which half of the input, which of two processes:
test one half, keep the failing half, halve again.
`git bisect` does it over history, and the same walk by hand does it over
anything else, in the logarithm of the space rather than the space.

## 8. The experiment before the argument

Two engineers arguing about what a program does are two engineers who have
not run it.
Each assumption is written as a sentence, and beside it the cheapest thing
that would decide it: a one-line script, a print, a query, a run with one
flag.
The experiment takes a minute and settles what the argument would not.

## 9. Fear is not a design input

Machinery written against a failure nobody has seen costs more than the failure
would.
A retry loop, a swallowed error and a second copy of a value each hide the
thing they were added to survive.
A failure that is allowed to happen leaves a trail somebody can read, and the
machinery is then built against that trail.

## 12. Commit by name

A commit that staged everything took a refusal that a background sweep had
cut out to watch a check go red.
The tree went red and the message named a different subject.
It happened twice, once with no other agent in the tree.
Anything that edits and restores is another writer, including your own
background job.
A worktree is cheap and the collision is not.
