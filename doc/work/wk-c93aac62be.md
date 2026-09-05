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
status: closed
# who did the work step, so the verdict is never theirs
author: worker-erin
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - edd983fa1bae0d1f12fede3c76664668ad854cc2
  - 7d95d12d6f990286c54e1b366e3d0c2c2e455ac0
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - adb8b8457afd5b3fa76620f643a8c1dc89b752cb
  - 096da3022f5e37bbc342bd94c228fc78233de13a
# how it ended. Only an ended token carries one.
disposition: done
# why it was dropped
reason: "Verdict: pass. The change holds its three criteria and leaves the tree better: sixteen notes' lessons land under one chapter each, the file stays at its ceiling of fifteen rules by two real merges rather than by dropping a practice, and both files lint clean. Two findings, wk-72ed0f21e3 and wk-de2256d35c, both minted against this token and both since closed."
---

## detail

Seventeen notes each ask for one more rule about writing a token's criteria and evidence. They ask for red per criterion, no borrowed reds, and one command per sentence. They ask to pin every numbered item, to write a measurement once with its command, and to close a spike on its questions. They ask for an identifier written once into both halves of a guard, for mirrored halves tabled, and for the owner's say-it-once. They name files that no longer exist, specifying.md and reviewing.md, and reviewers that no longer sit. work-token.md holds fourteen rules of a ceiling of fifteen, so they cannot land one by one. Consumes the sixteen notes named in the approach. The seventeenth, wk-1a4402245d, is not among them, because its ratio lesson already stood in chapter 14.

## done when

- work-token.md and voice.md lint clean with the new rules and no file over fifteen: .bin/se.exe lint
- every consumed note's lesson is under one rule's chapter and in its successor evidence: se find --words <a phrase from each note> --path doc/guidance/**
- no rule or chapter names a token id or a file that does not exist: node util/checks/tests-name-no-token.mjs . and se find --regex 'specifying\.md|reviewing\.md' --path doc/guidance/**

## evidence: also seen

Each already carries a token, so none was minted twice. wk-33ffac1616, the delta carrying another lane's work. wk-dd7e2ca1a6, three incidents this token landed and a later compression removed. wk-ddb9edee8b, the step 1 and step 2 evidence tables lost from this note and restored from the ended commit. wk-46ff3d11af, the check named by criterion 3 that reads no guidance file. wk-c98ea8f020, a token id in another lane's test file.

A remark, not a finding: criterion 3 calls reviewing.md a file that no longer exists, and doc/guidance/methods/reviewing.md exists today. The criterion answers the same either way, because no rule or chapter names it by filename, and the criterion was settled when the token was written.

## evidence: candidates cut

Written first, then cut, so what did not survive is on the record.

Chapter 2 dropped three of the five shapes of a criterion that cannot fail. Cut: the scope drawn around what was touched stands in testing.md chapter 2, unchanged at the began and the ended commit, so dropping the second copy is what voice.md rule 11 asks for on this same token. The floorless boundary behind rule 4's length as a number went with the merge, and a later lane put it back in chapter 4.

The approach section moved below the verdict evidence, so a reader meets it after the verdict. Cut as formatting the schema does not hold and the lint cannot see.

Rule 8 joins two practices with a semicolon and carries no chapter. Cut: chapter 3 argues the second half.

The two token ids the author leans on were checked rather than taken. .se/evidence.json carries .se/work/wk-46ff3d11af.md and .se/work/wk-c98ea8f020.md, so both were real local tokens, since closed.

## evidence: criteria rerun

Criterion 1. .bin/se.exe lint answers clean true, findings null; reading each file whole counts fifteen rules in work-token.md and thirteen in voice.md.

Criterion 2. The sixteen notes were read from git show a221daa3:doc/work/<id>.md and each lesson matched against the change. At the ended commit each sits under exactly one chapter: 1 takes wk-5ef1fa8f6b; 2 takes wk-b94b533abd; 3 takes wk-788b64df90, wk-eb765d80c7, wk-5bbd696ee8; 4 takes wk-775a8ed90f, wk-89f6c3d7a2; 5 takes wk-6fd3999144, wk-e5ef245cc5, wk-87a359990a; 12 takes wk-293180a4d5, wk-ba1949743f; 13 takes wk-254778f4a2; voice.md 11 takes wk-888a1e0536, wk-d756c520d7, wk-740c481e42. At HEAD three fewer, removed after this token ended: wk-dd7e2ca1a6, open. The successor half is not decided by the command, the notes being closed and gone from doc/work.

Criterion 3. tests-name-no-token answers ok through se_test. se find --regex 'specifying\.md|reviewing\.md|wk-[0-9a-f]{10}' --path doc/guidance/** answers 0 hits. The check reads only src test files and cannot decide it; the regex does. That gap had wk-46ff3d11af, since closed.

## evidence: criterion 1 lint

Run again just before submitting: .bin/se.exe lint reports no finding for work-token.md or voice.md. work-token Actionables holds fifteen items and voice.md thirteen, none over the 25-word cap, and both Discussions are under 1000 words. The only findings left are methods/retro.md, which was already failing before this change and which this change did not touch.

## evidence: criterion 2 lessons placed

All seventeen are found by se find over doc/guidance. work-token chapter 1 takes the detail that prescribes an assignment. Chapter 2 takes the criterion answering with a system verb. Chapter 3 takes the two criteria carrying identical commands, the criterion naming a check no file declared, and the draft obeying the class it commits. Chapter 4 takes the guard whose halves named different symbols and the rendered text whose handle is its producer. Chapter 5 takes the unpinned payload, the scope moved in prose only, and the spike closing sideways. Chapter 12 takes the blanket red claim and the red copied across. Chapter 13 takes the rule taught to one half of a mirrored pair. Chapter 14 keeps the ratio read from two instruments. voice.md chapter 11 takes say-it-once, the measurement written twice, and the constant written twice.

## evidence: criterion 3 no id no dead file

A regex search over doc/guidance for a minted token id or the two dead filenames returns no hits. No rule and no chapter names either. The other command the criterion names, tests-name-no-token, cannot decide this because it reads only test files under src. That gap already has a token, wk-46ff3d11af.

## evidence: findings kept

wk-72ed0f21e3. Rule 7 says ask whether a criterion is about this change or the project, pin a one-time one. Chapter 7, deleted here to reach the word cap, carried the other half: a standing one belongs in a check, not on a token that closes. The rule sorts criteria into two kinds and then says what to do with only one, so a reader holding a standing criterion is left with no instruction. The note's claim that chapter 7 only restated its rule is the one place it does not hold. The check that catches the class: a starred rule has a chapter, an unstarred one states its practice whole. Since closed, and rule 7 at HEAD reads a standing one belongs in a check.

wk-de2256d35c. The detail says it consumes the seventeen notes in the approach. wk-1a4402245d is not consumed: its ratio lesson stood in chapter 14 before the token began, which git show edd983fa of the file shows. The count overstates the work by one. The check: a count in a detail is the length of the list beside it. Since closed, and the detail at HEAD says sixteen.

## evidence: findings raised

The merges are real merges: old rules 1 and 2 and old rules 3 and 6 fold without losing a practice. The two slots bought carry lessons the file did not hold. voice.md rule 11 and its new chapter are the right home for say-it-once. wk-de2256d35c: one of the seventeen consumed notes is not closed as became naming this token, and its lesson predates the change. wk-72ed0f21e3: rule 7 asks the reader to sort criteria into two kinds, and now says what to do with only one of them. The step 1 and step 2 evidence tables were missing from this note, the known loss on wk-7887984486. They were restored verbatim from the ended commit under wk-ddb9edee8b rather than written afresh. The engine could not record the verdict, because the stale resident binary answers that a token at status done is already closed.

## evidence: hunks read and not read

git diff --stat edd983fa1bae0d1f12fede3c76664668ad854cc2..adb8b8457afd5b3fa76620f643a8c1dc89b752cb answers 18 files. Read whole: doc/guidance/work-token.md, doc/guidance/voice.md and doc/work/wk-c93aac62be.md, which is this token's entire change.

Not read, being another lane's work landing inside this token's window: .gitignore, RUNME.ps1, RUNME.sh, overnight-report.md, src/extension/panel.ts, src/processes/note.process.yaml, util/checks/panel-is-handed-the-state.mjs, util/checks/render-check.mjs, src/engine/batteryshell_test.go, note_test.go, runme.go, runmestale_test.go, seed.go, tests.go, and the deletion of src/mcp/mcp.exe. That the delta carries foreign work is wk-33ffac1616, open.

## evidence: not the author

The author is worker-erin and this verdict is reviewer-juniper. The engine handed the token over rather than refusing it, and nothing in the change is this actor's work.

## evidence: rules merged and displaced

The file was at its ceiling of fifteen, so two slots were bought rather than added. Old rule 1 and old rule 2 merged into one rule about writing the problem reduced to the smallest case. Old rule 3 and old rule 6 merged into one rule about what a criterion is. It keeps is not a plan, and moves the problem restated into chapter 2. The freed slots became rule 5, covering every item the detail names, and rule 6, naming the constraint rather than the assignment. The count is still fifteen and no rule was lost. The discussion was over cap at 1254 words, so the chapters for rules 6 and 7 were dropped. Those rules lost their asterisk. Rule 7 states its practice completely, and its chapter only restated it. Rule 6's two halves are justified in chapters 1 and 2.

## evidence: se test

Answered not ok. It ran util/checks/tests-name-no-token, named outright, and the single failure is a provenance comment in src/engine/investigate_test.go: 96 test files read, 1 failed. That file belongs to another lane and this change touched only the two guidance files, so the failure is not from this work. It already has a token, wk-c98ea8f020.

## evidence: step 1. ask

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the approach is on the token before any work, as an interface or a shape a reader can disagree with | On the token before the work: group the sixteen by the mistake caught, four or five rules, incidents in the discussion, say-it-once to voice.md. The grouping is the claim. |  |
| [x] | every done-when line is decidable, and names the command where one decides it | The first two are, and both ran again before submitting. The third names two commands and only the regex over doc/guidance decides it. tests-name-no-token reads only src test files. Gap is wk-46ff3d11af. |  |
| [x] | the change is small enough to review whole, or it is split first | Two files, work-token.md and voice.md, read whole. | — |
| [x] | the basics it stands on exist, or are minted first | The sixteen notes are closed as became naming this token. Both files, the schema and the lint existed. | — |

## evidence: step 2. do

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | Both files read whole before and after. work-token.md is itself the guidance. | — |
| [x] | the change follows the approach on the token, or the token says why it departed | It follows it. One departure: incidents are undated, a date being history that lives in the commit. |  |
| [x] | se test --on this token answered ok, and what it ran is named | Not ok. tests-name-no-token: 96 read, 1 failed, a token id in another lane's investigate_test.go: wk-c98ea8f020. |  |
| [x] | the note says what changed and why, for a reader who was not here | Seventeen notes against a ceiling of fifteen: two merges freed two slots, two chapters went, three lessons to voice.md. |  |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | Nothing new minted. Both findings already had wk-46ff3d11af and wk-c98ea8f020. | — |

## evidence: step 3. verdict

<!-- read every hunk, run every criterion, and say whether each part improves the product -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | [[reviewing]] was read and applied | Read whole: improvement not perfection, one round, the approach settled, candidates written first and cut second. | — |
| [x] | every hunk of git diff began..ended was read, and any not read is named | git diff --stat edd983fa..adb8b845 answers 18 files. See hunks read and not read. |  |
| [x] | every criterion's command was run again, and what it said is named | All three ran again at HEAD. See criteria rerun. |  |
| [x] | every hunk improves the product, or a finding names the one that does not | Yes, except rule 7, left without the disposition its deleted chapter carried: wk-72ed0f21e3. See candidates cut. | — |
| [x] | every finding is a trivial token naming this one, and their ids are here | wk-72ed0f21e3 and wk-de2256d35c, minted here and since closed, each answering git tag -l archive/. Also seen: wk-33ffac1616, wk-dd7e2ca1a6, wk-ddb9edee8b, wk-46ff3d11af, wk-c98ea8f020. Verdict: pass. |  |

## evidence: the merges hold

Two slots were bought rather than added. Old rules 1 and 2 fold into new rule 1 with no practice lost: the smallest case survives in the rule and again in chapter 1. Old rules 3 and 6 fold into new rule 2, which keeps decidable, the input, the answer, what survives, and is not a plan; the problem restated moves into chapter 2. The freed slots are new rule 5, covering every item the detail names, and new rule 6, naming the constraint rather than the assignment. Fifteen rules before and fifteen after.

The asterisk convention survives. At the ended commit the starred rules are 1, 2, 3, 4, 5, 9, 11, 12, 13, 14, 15 and the chapters are the same set, so a reader can still tell from a rule whether a chapter argues it. Rules 6, 7, 8 and 10 lost their asterisk with chapters 6 and 7, which is honest for 6, 8 and 10 and wrong for 7.

## evidence: verification runs

Every command ran again at HEAD under wk-16761b9ac8. The resident engine refuses a run named on a token that has ended, so that token carries these runs.
The range is git diff edd983fa1bae0d1f12fede3c76664668ad854cc2..adb8b8457afd5b3fa76620f643a8c1dc89b752cb, and it carries 18 files, the count this verdict read.
Criterion 1: .bin/se.exe lint answers clean true, findings null. The four methods/retro.md findings named above are gone, fixed by another lane after this token ended.
se find for a numbered line over each file counts fifteen rules in work-token.md and thirteen in voice.md, as this verdict said.
Criterion 3: se find for the regex over doc/guidance still returns no hits. No rule and no chapter names a token id or either dead file.
se test proposing tests-name-no-token now answers ok, so what wk-c98ea8f020 reported no longer reproduces.
Criterion 2: three of the seventeen lessons are gone from work-token.md. Chapter 3 lost the check no file declared, chapter 5 the unpinned payload, chapter 12 the blanket red claim.
git diff from the ended commit to HEAD shows each removed after this token ended, so the criterion held when this verdict was written.
Every rule still states its practice, so what was lost is the incident. Raised as wk-dd7e2ca1a6.

## approach

Group the sixteen by the mistake they catch, not by the note. Expect four or five rules at most, each under twenty-five words, in work-token.md's writing half, with the incidents in the discussion under the rule they belong to, dated by past tense and naming no token. Where the ceiling is met, merge or retire a weaker existing rule and say which. Say-it-once lands in voice.md if it is about prose at all. Every rule names what to do. A negative appears only where a reader would act on the opposite. The notes: wk-293180a4d5, wk-5ef1fa8f6b, wk-eb765d80c7, wk-5bbd696ee8, wk-888a1e0536, wk-ba1949743f, wk-b94b533abd, wk-d756c520d7, wk-788b64df90, wk-e5ef245cc5, wk-6fd3999144, wk-89f6c3d7a2, wk-87a359990a, wk-775a8ed90f, wk-254778f4a2, wk-740c481e42.

