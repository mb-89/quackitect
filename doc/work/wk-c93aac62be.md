---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[standard]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: criteria lessons into guidance
# where the token stands. The process owns these values.
status: done
# who did the work step, so the verdict is never theirs
author: worker-erin
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - edd983fa1bae0d1f12fede3c76664668ad854cc2
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - adb8b8457afd5b3fa76620f643a8c1dc89b752cb
---

## detail

Seventeen notes each ask for one more rule about writing a token's criteria and evidence: red per criterion, no borrowed reds, one command per sentence, pin every numbered item, a measurement written once with its command, a spike closing on its questions, an identifier written once into both halves of a guard, mirrored halves tabled, and the owner's say-it-once. They name files that no longer exist, specifying.md and reviewing.md, and reviewers that no longer sit. work-token.md holds fourteen rules of a ceiling of fifteen, so they cannot land one by one. Consumes the sixteen notes named in the approach; the seventeenth, wk-1a4402245d, is not among them, because its ratio lesson already stood in chapter 14.

## done when

- work-token.md and voice.md lint clean with the new rules and no file over fifteen: .bin/se.exe lint
- every consumed note's lesson is found under one rule's chapter, listed in the note's successor evidence: se find --words <a phrase from each note> --path doc/guidance/**
- no rule or chapter names a token id or a file that does not exist: node util/checks/tests-name-no-token.mjs . and se find --regex 'specifying\.md|reviewing\.md' --path doc/guidance/**

## evidence: step 1. ask

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | On the token before the work: group the sixteen by the mistake caught, four or five rules, incidents in the discussion, say-it-once to voice.md. The grouping is the claim. |  |
| [x] | every done-when line is decidable, and names the command where one decides it | The first two are, and both ran again before submitting. The third names two commands and only the regex over doc/guidance decides it; tests-name-no-token reads only src test files. Gap is wk-46ff3d11af. |  |
| [x] | the change is small enough to review whole, or it is split first | Two files, work-token.md and voice.md, read whole. | — |
| [x] | the basics it stands on exist, or are minted first | The sixteen notes are closed as became naming this token. Both files, the schema and the lint existed. | — |

## evidence: step 2. do

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Both files read whole before and after; work-token.md is itself the guidance. | — |
| [x] | the change follows the approach on the token, or the token says why it departed | It follows it. One departure: incidents are undated, a date being history that lives in the commit. |  |
| [x] | se test --on this token answered ok, and what it ran is named | Not ok. tests-name-no-token: 96 read, 1 failed, a token id in another lane's investigate_test.go: wk-c98ea8f020. |  |
| [x] | the note says what changed and why, for a reader who was not here | Seventeen notes against a ceiling of fifteen: two merges freed two slots, two chapters went, three lessons to voice.md. |  |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | Nothing new minted; both findings already had wk-46ff3d11af and wk-c98ea8f020. | — |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | reviewing was read and applied | reviewing.md read whole. The bar applied is improvement rather than perfection, and one round only. The approach was taken as settled, so the grouping of seventeen notes into five mistakes is reviewed against itself rather than argued with. | — |
| [x] | every hunk of git diff began..ended was read, and any not read is named | The range carries 18 files. Every hunk of doc/guidance/work-token.md and doc/guidance/voice.md was read, which is this token's whole change. Not read, because they are another lane's work landing inside this token's window: .gitignore, RUNME.ps1, RUNME.sh, overnight-report.md, src/engine/batteryshell_test.go, note_test.go, runme.go, runmestale_test.go, seed.go, tests.go, src/extension/panel.ts, the deletion of src/mcp/mcp.exe, note.process.yaml and the two util/checks scripts. That the delta carries foreign work is wk-33ffac1616. |  |
| [x] | every criterion's command was run again, and what it said is named | Criterion 1: .bin/se.exe lint returns four findings, all methods/retro.md, none for work-token.md or voice.md; retro.md already held 17 actionables at edd983fa, the began commit, so it was failing before this change. work-token holds 15 rules and voice.md 13. Criterion 2: se find over doc/guidance returns the lessons in the chapters the note names, and 16 of the 17 notes are closed as became naming this token, which is the finding wk-de2256d35c. Criterion 3: se find --regex 'specifying\.md|reviewing\.md|wk-[0-9a-f]{10}' over doc/guidance returns no hits, so no rule or chapter names a token id or either dead file. The other command it names, tests-name-no-token, reads only src test files and cannot decide it, which already has wk-46ff3d11af. |  |
| [x] | every hunk improves the product, or a finding names the one that does not | The merges are real merges: old rules 1 and 2 and old rules 3 and 6 fold without losing a practice, and the two slots bought carry lessons the file did not hold. voice.md rule 11 and its new chapter are the right home for say-it-once. One rule did not survive its chapter being dropped: wk-72ed0f21e3. | — |
| [x] | every finding is a trivial token naming this one, and their ids are here | wk-de2256d35c, one of the seventeen consumed notes is not closed as became naming this token and its lesson predates the change. wk-72ed0f21e3, rule 7 asks the reader to sort criteria into two kinds and now says what to do with only one of them. Also seen, already in the queue and not raised again: wk-46ff3d11af and wk-c98ea8f020. The step 1 and step 2 evidence tables were missing from this note, the known loss on wk-7887984486; they were restored verbatim from the ended commit under wk-ddb9edee8b rather than written afresh. Verdict: pass. The engine could not record it, because the stale resident binary answers that a token at status done is already closed. |  |

## evidence: criterion 1 lint

Run again just before submitting: .bin/se.exe lint reports no finding for work-token.md or voice.md. work-token Actionables holds fifteen items and voice.md thirteen, none over the 25-word cap, and both Discussions are under 1000 words. The only findings left are methods/retro.md, which was already failing before this change and which this change did not touch.

## evidence: criterion 2 lessons placed

All seventeen are found by se find over doc/guidance. work-token chapter 1 takes the detail that prescribes an assignment. Chapter 2 takes the criterion answering with a system verb. Chapter 3 takes the two criteria carrying identical commands, the criterion naming a check no file declared, and the draft obeying the class it commits. Chapter 4 takes the guard whose halves named different symbols and the rendered text whose handle is its producer. Chapter 5 takes the unpinned payload, the scope moved in prose only, and the spike closing sideways. Chapter 12 takes the blanket red claim and the red copied across. Chapter 13 takes the rule taught to one half of a mirrored pair. Chapter 14 keeps the ratio read from two instruments. voice.md chapter 11 takes say-it-once, the measurement written twice, and the constant written twice.

## evidence: criterion 3 no id no dead file

A regex search for a minted token id or for the two dead filenames over doc/guidance returns no hits, so no rule and no chapter names either. The other command the criterion names, tests-name-no-token, cannot decide this because it reads only test files under src; that gap already has a token, wk-46ff3d11af.

## evidence: rules merged and displaced

The file was at its ceiling of fifteen, so two slots were bought rather than added. Old rule 1 and old rule 2 merged into one rule about writing the problem reduced to the smallest case. Old rule 3 and old rule 6 merged into one rule about what a criterion is, keeping is not a plan and moving the problem restated into chapter 2. The freed slots became rule 5, covering every item the detail names, and rule 6, naming the constraint rather than the assignment. The count is still fifteen and no rule was lost. The discussion was over cap at 1254 words, so the chapters for rules 6 and 7 were dropped and those rules lost their asterisk: rule 7 states its practice completely and its chapter only restated it, and rule 6's two halves are justified in chapters 1 and 2.

## evidence: se test

Answered not ok. It ran util/checks/tests-name-no-token, named outright, and the single failure is a provenance comment in src/engine/investigate_test.go: 96 test files read, 1 failed. That file belongs to another lane and this change touched only the two guidance files, so the failure is not from this work. It already has a token, wk-c98ea8f020.

## approach

Group the sixteen by the mistake they catch, not by the note. Expect four or five rules at most, each under twenty-five words, in work-token.md's writing half, with the incidents in the discussion under the rule they belong to, dated by past tense and naming no token. Where the ceiling is met, merge or retire a weaker existing rule and say which. Say-it-once lands in voice.md if it is about prose at all. Every rule names what to do; a negative only where a reader would act on the opposite. The notes: wk-293180a4d5, wk-5ef1fa8f6b, wk-eb765d80c7, wk-5bbd696ee8, wk-888a1e0536, wk-ba1949743f, wk-b94b533abd, wk-d756c520d7, wk-788b64df90, wk-e5ef245cc5, wk-6fd3999144, wk-89f6c3d7a2, wk-87a359990a, wk-775a8ed90f, wk-254778f4a2, wk-740c481e42.

