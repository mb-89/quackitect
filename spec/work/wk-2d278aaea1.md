---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: reading is evidenced
# where the token stands. The process owns these values.
status: open
# the person's own name for a group. It does not move the work
bucket: level0
---

## detail

One criterion in the standard process asks for something and accepts a tick.

standard.process.yaml, activity do, first criterion: "the guidance this token names was read and applied". It carries no evidence: required, so it is answered by a checkbox and nothing else. The trivial process carries the same line with the same gap.

The guidance for work tokens says a checklist line ticked without being read throws away what earlier work learned and keeps the tick. This is that line, in the process that mints it.

The predecessor solved it mechanically: three fill-in-the-blank probes taken at about 30, 60 and 92 percent of the document, answered by containment rather than equality, punctuation and case stripped, wrong probes named individually and right ones banked, and the credit keyed to the document's content hash so an edit re-owes it.

## approach

The engine serves the probes when it serves the guidance, and the criterion is answered by the probe result rather than by a tick. Credit is keyed to the content hash, so a document that changes re-owes its proof.

Whether the probes are generated or authored is the open half. Generated costs nothing to keep current and can produce a blank nobody can answer. Authored is the reverse. This token does not decide it.

## done when

- the do criterion carries evidence: required in both processes: `git diff` on spec/processes shows the key on each
- a token cannot leave do with the criterion unanswered: the engine refuses, and the refusal names the guidance and the probe
- an edited guidance document re-owes its proof: a test that stamps a document, banks a credit, edits it, and asserts the credit is gone
- a wrong probe is named alone and the right ones stay banked: `./RUNME.sh test --on this token --propose TestAProbeIsBankedOnceAnswered`

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | what is gained by doing it, and not only what it does | the one criterion that is a promise becomes a measurement, in the process that mints every token | spec/processes/standard.process.yaml, activity do |
| [x] | what breaks if it is never done, and not only that it stays undone | every token keeps claiming its guidance was read on no evidence, and the guidance corpus stays unenforced whatever it says | [[work-token]] actionable 11 |
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | the approach names the shape and leaves the generated-or-authored half to the owner | the approach section |
| [x] | every done-when line is decidable, and names the command where one decides it | each line names a diff, a refusal or a test | the done when section |
| [x] | the change is small enough to review whole, or it is split first | two process files and one proof mechanism, reviewable whole | the approach section |
| [x] | the basics it stands on exist, or are minted first | guidance is engine-served today, so there is a place to serve a probe from | spec/guidance |

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

<!-- read every hunk, run every criterion, and say whether each part improves the product -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | [[reviewing]] was read and applied | — |  |
| [ ] | every hunk of git diff began..ended was read, and any not read is named |  |  |
| [ ] | every criterion's command was run again, and what it said is named |  |  |
| [ ] | every hunk improves the product, or a finding names the one that does not |  |  |
| [ ] | every finding is a trivial token naming this one, and their ids are here |  |  |
