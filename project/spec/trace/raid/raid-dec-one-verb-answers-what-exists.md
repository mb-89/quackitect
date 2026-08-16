---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: raid-dec-one-verb-answers-what-exists
type: "[[raid]]"
kind: decision
statement: One lane verb answers what iterations exist, and nothing else reads git for that answer.
owner: the owner
trigger: superseded only, or the first caller found reading branches directly for the list
status: decided
breaks_how_badly: crippling
how_likely: conceivable
source_refs:
  - req-the-iteration-list-comes-from-git
  - req-call-answers-in-one-second
  - raid-dec-git-is-the-list-of-iterations
  - el-record-store
---

## What was decided

NOBODY ASKS GIT DIRECTLY FOR THE LIST. Not the agent, not a person, not the
panel.

ONE VERB ANSWERS IT. That verb reads every branch in a single call and hands
back the whole set.

## Why, in the owner's own framing

THE OWNER RULED IT ON 2026-08-15. Their words, in order.

- "You ask the engine for iterations or for steps."
- "You don't ask it directly."
- "The agent doesn't ask it directly. The human will not ask it directly."
- "There will be a verb, a lane, however you want to call it. And you ask that, and then that can batch."

## What it replaces

A RULE WRITTEN IN PROSE. [[raid-dec-git-is-the-list-of-iterations]] said the
reader must batch and that the reader must take each record from trunk rather
than from branch tips.

BOTH SENTENCES SAT IN A DECISION NODE, and nothing read them at runtime. A
caller could write the slow version and nothing would refuse.

THE SLOW VERSION IS THE ONE ANYBODY WRITES FIRST. Asking git per iteration
measured 1004 ms over 33 branches, against 58.7 ms for one batched call.

## Rejected options

- A WRITTEN CONDITION AND A CODE REVIEW. Rejected because it is what stands
  today, and it is what this decision exists to replace. A rule nothing
  enforces is a rule that holds until somebody is in a hurry.
- A CHECK THAT COUNTS GIT CALLS PER LIST READ. Rejected as the primary answer.
  It catches the mistake after it is written, and it needs a threshold nobody
  can defend. It stays available as a test.
- A CACHE IN FRONT OF THE PER-ITERATION READ. Rejected because it makes the
  first look slow and every later look stale, which is two problems where
  there was one.
- LETTING EACH CALLER BATCH FOR ITSELF. Rejected because it is the same rule
  written once per caller, and the fifth caller is where it breaks.

## Consequences

- THE VERB IS THE ONLY PATH. A caller that wants the list has exactly one way
  to get it, and that way is fast by construction.
- BOTH CONDITIONS MOVE FROM PROSE INTO ONE PLACE. Batching and reading from
  trunk are properties of the verb, not instructions to whoever writes the
  next caller.
- THE VERB OWNS THE SHAPE OF THE ANSWER. Callers take the whole set, so no
  caller can ask for one iteration in a loop.
- A NEW SURFACE THAT NEEDS THE LIST ADDS NO NEW RISK. It calls the verb.
- THE PANEL AND THE AGENT SHARE ONE ANSWER, so they cannot disagree about
  what exists.

## What is NOT decided here

WHETHER THE VERB PREFETCHES OR READS ON DEMAND. The owner raised streaming the
detail in the background after a first cheap look, and that is an
implementation choice inside the verb rather than a change to this rule.
