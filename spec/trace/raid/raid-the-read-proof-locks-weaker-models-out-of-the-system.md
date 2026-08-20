---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: raid-the-read-proof-locks-weaker-models-out-of-the-system
type: "[[raid]]"
kind: issue
statement: Weaker models cannot produce the boot reading proof at all, so the first step of the first thing every machine does makes the system unavailable to them entirely.
owner: the driving agent
trigger: the next boot on a machine running a model other than the one this was built against
status: open
impact: Boot is the first act of every session on every machine. A first step a model cannot pass is not a degraded experience, it is a closed door, and it closes before anything else can be attempted. It also defeats this iteration's own criterion, since a fresh machine that cannot boot cannot walk from its seed.
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - i28-the-cloud-runs-from-its-seed-alone-a-fre
  - note-8de9bfec67b6
  - note-4671c830fca7
---

## What happened, from the field

The owner ran the system on a second machine on 2026-08-14 and reported three
things about the reading proof.

- Weaker models could not produce it at all.
- Stronger models still struggled with it.
- What fixed it was teaching the agent very specifically what counts toward
  the word count.

The record calls this the finding with the widest blast radius, and that
grading is kept here.

## Why it is an issue rather than a risk

It has already happened, on a real machine, and the workaround was a person
explaining the rule. Present tense, so it is an issue.

## Where the defect actually sits

IN THE ENGINE'S FEEDBACK, not in the model. A refusal that says the proof was
wrong without saying exactly what is counted is a puzzle rather than a remedy,
and every other refusal in this lane carries an executable one.

## The question underneath it, which may delete the problem

note-4671c830fca7 asks whether a document delivered through a tool call needs
proving at all, since the agent was handed the text rather than sent to fetch
it. Answering no would remove this issue rather than repair it.

THREE THINGS MUST SURVIVE whatever replaces the proof, and they are why the
question is not already settled.

- Compaction still has to re-owe the reading, so something must notice the
  text has left the window.
- The credit is per-agent evidence, and the owner ruled on 2026-08-14 that
  sharing it between agents would be wrong.
- A host that eats the text leaves no other signal, because a hash the engine
  supplied would prove only that a message arrived.
