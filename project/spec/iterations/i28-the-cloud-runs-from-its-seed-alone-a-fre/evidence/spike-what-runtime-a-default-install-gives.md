---
form: spike-what-runtime-a-default-install-gives
by: agent
signed_off: 2026-08-15T19:07:25.049Z
authors: agent
files:
---

# Evidence form / spike-what-runtime-a-default-install-gives

## current_situation

The declared runtime floor and the way the engine starts its scripts disagree.

`package.json` LINE 8 SAYS `>=22.6`. The engine spawns every script as `node <file>.ts` with no flag at all.

A HOST INSTALLING TODAY'S LTS CAN LAND ON 22.x, satisfy that floor exactly, and fail deep inside a spawned script.

## built

- [[exp-what-runtime-the-engine-actually-needs]]

## follow_up

- THE ENTRYPOINT PINS AN EXACT VERSION rather than checking a floor. That was the fallback agreed before the run, and it is now the path.
- THE VERIFY STEP COMPARES AGAINST THE PIN, so a wrong runtime fails at step one by name instead of as a syntax error at step three.
- THE DECLARATION ITSELF IS WRONG and should be corrected wherever it stands, because it will mislead the next reader exactly as it misled this design.
- ONE HALF STAYS OWED: what a default install gives on the target host families. Pinning removes the question rather than answering it.
- nothing is parked from this state

## anything_else

### Why a calculation was the right form

THE CHEAPEST FORM THAT YIELDS THE EVIDENCE. Three facts settled it: a declaration, a version, and an invocation. No host was needed to see that two of them contradict.

RUNNING IT ON A HOST WOULD HAVE COST A MACHINE and produced the same finding later.

### What was faked, said plainly

THE HOST. No machine with a default install was available, so what a package manager gives a bare host is read from the declaration rather than observed.

THAT LIMITS THE CLAIM and does not weaken it. The contradiction is between two things in this repository, and neither needs a host to be read.

### The shape this shares with the first spike

BOTH ASSUMPTIONS TANGLED A LOCAL QUESTION WITH A HOST QUESTION, and in both cases the local half was answerable here and came back false.

THE HOST HALF WAS NEVER THE BLOCKER. It was the reason nobody looked.
