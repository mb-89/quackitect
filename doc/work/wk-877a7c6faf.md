---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: a knob nothing reads
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: surface
# true when this waits for a person rather than an agent
needs_human: true
---

## detail

The panel offers a setting that changes nothing. It reads work goes stale after N turns, and a person can move it.

limits.pulls_before_hold_is_stale is declared in util/parameters.json, carried in config.go and checked by lint.go. Since wk-754581f5e8 nothing reads it to decide anything.

What decides staleness now is the time since the holder's last call, measured against heartbeat_seconds times heartbeatsBeforeGone in src/engine/gone.go. No declaration offers that window, so the one dial a person can turn is the dead one and the live one is in the source.

THE DECISION IS A PERSON'S. Either the knob goes, and the panel loses a control that lied, or it is replaced by the silence window, which puts the live number where a person can turn it. An agent choosing between them is choosing what the panel offers, which is the owner's.

Whichever is chosen, the declaration, the Go floor and the lint move together, because those three are one datum in three places.

## proposed action

My best attempt: offer the silence window and drop the dead knob, so the panel keeps a control over staleness and it is the one the engine reads. Marked needs_human, because what the panel offers is the owner's to say.

## approach

The check comes first, because it is the same under either answer the owner gives.

It walks every parameter declared in util/parameters.json to a reader in the engine's source. A declared parameter nothing reads is the failure, and limits.pulls_before_hold_is_stale is its first red. That check outlives this token and holds the class.

The change itself is one datum in three places, so the three move in one commit: the declaration in util/parameters.json, the floor in config.go, and the rule in lint.go.

Under the owner's answer the datum is either removed or renamed to the silence window the engine actually reads. That window is heartbeat_seconds times heartbeatsBeforeGone in gone.go, so the second answer is a declaration of a number the source already has.

The token stays needs_human until the owner has said which, and it carries their words rather than a summary of them.

## done when

- the panel offers no setting that nothing reads, proved by a check that walks every declared parameter to a reader
- the declaration, config.go and lint.go say the same thing about whatever is kept
- the owner has said which of the two answers this is, and the token carries their words

## evidence: step 1. ask

<!-- write what is asked, the approach, and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | what is gained by doing it, and not only what it does |  |  |
| [ ] | what breaks if it is never done, and not only that it stays undone |  |  |
| [ ] | the approach is on the token before any work, as an interface or a shape a reader can disagree with |  |  |
| [ ] | every done-when line is decidable, and names the command where one decides it |  |  |
| [ ] | the change is small enough to review whole, or it is split first | — |  |
| [ ] | the basics it stands on exist, or are minted first | — |  |

## evidence: step 2. do

<!-- make the change with its tests, hand the engine the delta to test, and write the note -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the guidance this token names was read and applied | — |  |
| [ ] | the change follows the approach on the token, or the token says why it departed |  |  |
| [ ] | se test --on this token answered ok, and what it ran is named |  |  |
| [ ] | the note says what changed and why, for a reader who was not here |  |  |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | — |  |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product. How a reviewer works is [[reviewing]]. Your verdict blocks nothing. You give it once and the token closes on it. Every finding you have is a trivial token you mint naming this one. -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | [[reviewing]] was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |

