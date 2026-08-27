---
kind: method
statement: Finding the assumptions a requirement leans on — by sweeping named sources, so a nil answer is defended once per source rather than once in total.
---

## Situation

Guidance for M3 identify-assumptions. This is the one card the step draws
from. What an assumption IS and how the node is shaped are [[raid]] and
[[meth-raid]]; probing is [[meth-assumption-probing]].

## THE RULE #work

If an item is only true under some condition you have not established and do
not control, that condition is an ASSUMPTION and it gets written down.

Two halves matter equally.

- NOT ESTABLISHED means you have not checked it. Believing it firmly is not
  checking it.
- NOT CONTROLLED separates three things.
  - If you own it, it is a decision.
  - If somebody else owns it and you need it, it is a dependency.
  - If nobody owns it and it might change under you, it is an assumption.

## THE SWEEP — WHERE TO LOOK #work

A nil answer is cheap when it is given once. It is expensive when it must be
given per source, with a reason. So the form asks the sources one at a time,
and every one gets an answer even when the answer is none.

| source | the question it answers |
| --- | --- |
| environment | What about the world around the system are we taking as given? Scale, load, the shape of the data, who else is on the machine. |
| toolchain | What must be installed, at what version, and what happens when it is not? |
| host | What does the harness or runtime do that we rely on and did not verify? |
| platform | What holds on one operating system that we have assumed holds on the others? |
| neighbours | What do the systems we touch guarantee, that we have taken from a datasheet rather than a run? |
| people | What are we assuming about who uses this — their skill, their patience, their setup? |

WALK THE REQUIREMENTS, NOT YOUR MEMORY. The register is the input. A
requirement with a number in it usually rests on something; a requirement
about a boundary almost always does.

## WRITE THE CLAIM, NOT THE SUBJECT #work

This step COLLECTS ASSUMPTIONS. So each entry it opens says the thing being
relied on, phrased so it could turn out false.

The test is one question: could somebody disagree with the title?

- "the flag keeps behaving as it does today" — arguable, so it is an
  assumption.
- "experimental type stripping" — a subject. Nobody can disagree with a
  subject, and nobody can probe one either.
- "POSIX untested" — a test status. It describes our ignorance rather than
  the thing we are leaning on. The claim underneath is "it works the same on
  POSIX", and THAT is the entry.

An assumption whose title is a subject leaves the probe with nothing to aim
at, which is how a register fills up with entries nobody can close.

AND CHECK THE KIND BEFORE THE TITLE. If the thing has already happened, it is
an ISSUE, not an assumption — present tense, hurting now. Recording an
observed failure as an assumption hides that it already bit. This was got
wrong with the reload's tool list, which had been seen to fail
before it was written down as something merely believed.

## THREE SMELLS THAT MEAN AN ASSUMPTION IS HIDING #work

- A NUMBER WITH NO SOURCE. A tolerance nobody measured is a guess wearing a
  measurement's clothes, and the thing that would make it true is the
  assumption.
- A "JUST" OR AN "OBVIOUSLY". Both mean the writer skipped a step they thought
  too small to state. That step is usually the assumption.
- A CAPABILITY NAMED WITHOUT A VERSION. "git", "Node", "the harness" — each
  one is a promise somebody else made and can withdraw.

## WHAT IS NOT AN ASSUMPTION #work

- A decision you made. That is a decision; record it as one.
- Something you already checked. That is a fact; cite it.
- A worry you cannot state a check for. That is a risk, and the worry goes in
  its body. An assumption whose Probe section cannot be written is not yet an
  assumption.

## Sources

- Assumption-based planning (RAND, Dewar): load-bearing assumptions, the
  signposts that show one failing, and the shaping actions that follow.
- Architecture rationale practice, where assumptions are recorded against the
  decisions that rest on them rather than in a separate pile.
