---
id: wk-1b7c1a2da1
seq: 1000013
type: work
title: the bar burns down
status: spec_in_work
assignee: main
scope: single-step
traced: true
holder: main
rounds: 1
minted_by: person
---

## detail

THE OWNER'S WORDS: in the work editor, in the header bar, the one bar that is not the generic editor, I want a burn down. The number of minted per day, the number of done per day, and the number of total open or backlogged, not per day but just in absolute terms. Call it b d colon, then three numbers separated with slashes. And if somebody hovers over it, then the details, so it does not fill up too much space. And one more number, the rate at which work tokens fail reviews, and that can be more than a hundred percent, if one token fails two rounds that is counted twice, and we want that number to go down over time. And, obviously, the engine should do these calculations. FOUR NUMBERS, AND THE LAST THREE WORDS DECIDE WHERE THEY COME FROM. The engine computes them and the panel draws what it is handed. A number the panel derives is a number nothing checks, and this project has already been bitten by a count that lived only where it was displayed. WHAT EACH ONE IS. Minted per day: tokens the record says were minted that day. Done per day: tokens that reached imp_done that day. Open plus backlogged: one absolute count of everything not ended, taken now rather than per day. The failure rate per day: rejections that day over tokens that reached a review that day, as a percentage, and it goes above a hundred when one token is rejected twice. MEASURED TODAY, SO THE FIRST DRAW HAS SOMETHING TO BE CHECKED AGAINST. Over the whole record rather than per day: 61 tokens have reached a review, 106 rejections stand across them, and the rate is 174 per cent. 42 tokens were rejected at least once and 19 went through clean. The worst two took six rounds each, wk-a51a799f40 and wk-c02dc4046b. WHERE THE DAY COMES FROM WANTS DECIDING. A token note carries no timestamp, because times were deliberately taken off a token and left to the record, so the per-day numbers have to be read out of the log rather than off the notes. Say in the spec which the counter reads and why, because a reader will assume the notes. THE HOVER CARRIES THE DETAIL: what each number is, over what window, and where it was read from.

WHERE EACH NUMBER COMES FROM, DECIDED. A token note carries no timestamp,
because times were deliberately taken off a token and left to the record, so the
two per-day numbers are read out of the log. The log holds what is needed: a
work event carries the mint with its time, and a review event carries the
verdict. The absolute count is taken over the notes, because that is a fact
about now rather than about a day.

AND THE WINDOW IS NAMED IN THE ANSWER, because it is smaller than it looks. se
retro drains the log, so the per-day numbers only reach back to the last retro,
and a bar that said otherwise would be lying quietly. How to keep a long run
without keeping every ephemeral is wk-88f4fcc517, which the owner has not ruled
on, so this token says what it can see and names that token as where the rest is
decided. Nothing yet, naming what still owes it, is an answer. Silence is not.

## evidence: what the record says today

Over the whole record rather than per day, which is the number to check the
first draw against: 61 tokens have reached a review, 106 rejections stand across
them, and the rate is 174 per cent. 42 tokens were rejected at least once and 19
went through clean. The worst two took six rounds each, wk-a51a799f40 and
wk-c02dc4046b.

## done when

- The engine answers the four numbers and the panel draws what it is handed. A number the panel derives is a number nothing checks, which this record has already been bitten by
  `rg -q func.TestTheEngineAnswersABurndown src/engine && go test -C src/engine -count=1 -run TestTheEngineAnswersABurndown$ .`
- Minted per day and done per day are read out of the log, driven over a fixture log holding events on two named days, so the check decides the counting rather than agreeing with whatever the tree happens to hold
  `rg -q func.TestTheBurndownCountsADay src/engine && go test -C src/engine -count=1 -run TestTheBurndownCountsADay$ .`
- Open plus backlogged is one absolute count over every token that has not ended, across both stores, and the check refuses when it finds none rather than passing by there being nothing to count
  `rg -q func.TestTheBurndownCountsWhatIsStillOpen src/engine && go test -C src/engine -count=1 -run TestTheBurndownCountsWhatIsStillOpen$ .`
- The failure rate counts a rejection per round, so a token rejected twice counts twice and the rate goes above a hundred. The check drives one token rejected twice in one day and requires two hundred per cent, which is the property the owner asked for by name
  `rg -q func.TestTheFailureRateCountsEveryRound src/engine && go test -C src/engine -count=1 -run TestTheFailureRateCountsEveryRound$ .`
- The answer says which window it covers and that a retro truncates it, naming wk-88f4fcc517 as where the long run is decided, so a reader can tell a small number from a short window
  `rg -q func.TestTheBurndownSaysItsWindow src/engine && go test -C src/engine -count=1 -run TestTheBurndownSaysItsWindow$ .`
- The bar draws BD: four numbers separated by slashes, small, with the detail on hover and not on the bar, and the check drives the page rather than reading the source. THE ARGUMENTS COME FROM src/extension/engineargs.ts, so the builder is one engine-args.mjs already walks and no flag is written at the call site
  `node util/checks/burndown.mjs .`
- The whole battery is green afterwards
- Every test named above was watched failing on its own assertion, with the change absent, before it was watched passing. THE EVIDENCE NAMES THE TEST AND WHAT IT SAID rather than a line number

## finding 1 · round 1 · done when, criterion 7: "The whole battery is green afterwards" · by reviewer10

**wrong:** The criterion has no command and one command decides it: bash util/checks/battery.sh, which exists, is what every other agent on this tree runs, and exits zero when it is green. doc/guidance/specifying.md says a criterion that can be a command is one, because a command fails and a sentence does not. Leaving it as prose is not free here, and I read the engine rather than guessing at the cost. UnmetCriteria in src/engine/spec.go answers a criterion with no command by requiring an evidence section named after the criterion's own sentence, so the worker has to write a section called The whole battery is green afterwards and assert it there in words, and a reviewer then judges a sentence where an exit code was available. That is the one place in this list where the check is weaker than the tool allows. The extent is one criterion and I checked the other seven before writing this: six carry commands and the eighth, the watched-red one, genuinely cannot be a command because it asks what a person saw.

**satisfies:** Give it the command: bash util/checks/battery.sh. Keep the sentence as it is, because the sentence is right, and say in it whether the criterion is about this change or a standing rule over the project, which doc/guidance/specifying.md asks a drafter to say. Then take its red the way the eighth criterion asks of the others: break one line the battery covers in a copy of the tree, run it, record what it said, and put it back.

## finding 2 · round 1 · detail: MEASURED TODAY, SO THE FIRST DRAW HAS SOMETHING TO BE CHECKED AGAINST, and the evidence section what the record says today · by reviewer10

**wrong:** The token offers five numbers as the thing the first draw is to be checked against, in the detail under MEASURED TODAY and again in the evidence section, and records no command for any of them. I tried to take the readings again, and three of the five come from two different instruments while one does not come back. From the log, counting review events across .se/log/*.jsonl, 71 verdicts say rejected and 35 say spec rejected, which is 106, and two of those 106 are rejections I recorded this session, so the number the draft wrote and the number I counted are not the same 106 and nothing on the token says when its reading was taken. From the notes, counting tokens across doc/work and .se/work that carry at least one finding, 42, which reproduces exactly, and the worst two are wk-a51a799f40 and wk-c02dc4046b at six rounds each, which also reproduces exactly, by the rounds their finding headings name. The 61 does not reproduce from either. The log carries review events for 43 distinct tokens. The notes carry findings for 42. The only way I could make 61 was by adding up note statuses, closed 40, imp_done 8, imp_submitted 6, spec_submitted 5 and spec_in_review 2, and two of those five statuses are tokens waiting for a reviewer rather than tokens that reached one. So the 174 per cent divides a numerator taken from the log by a denominator taken from the notes, and the 19 that went through clean is 61 minus 42, which inherits whichever instrument the 61 was. That matters beyond arithmetic, because this same detail decides that both per-day numbers are read out of the log and that the absolute count is taken over the notes. The engine will therefore compute the rate from the log on both sides of the division, over a window a retro truncates, and the baseline it is to be checked against is a different quantity over a different window. The evidence section calls these the number to check the first draw against, and a first draw agreeing with them would mean the counter was wrong.

**satisfies:** Write the command beside every number and paste what it answered, which is what doc/guidance/voice.md asks under Claims and what doc/guidance/specifying.md asks of a literal. Take both halves of the rate from the instrument the engine will read, so the baseline is the same quantity the counter computes: if the rate is rejections over tokens that reached a review and both come from the log, count the denominator from the log too and say so. Say what reached a review means as a rule a command can apply, because spec_submitted and imp_submitted are tokens waiting for a reviewer and the sentence reads as tokens that had one. Pin the reading to a commit or a timestamp rather than to the word today, because the log and the notes are a shared store several agents write while the round is running, and this token's own lesson queue already carries that class as wk-4c3586254a. And where a number is a whole-history figure and the bar draws a per-day one, say in the evidence which of the four it can check and which it cannot, rather than offering all five as the baseline.

## finding 3 · round 1 · detail: "obviously, the engine should do these calculations" and "A number the panel derives is a number nothing checks", against done when, criteria 1 and 6 · by reviewer10

**wrong:** The owner's clause is obviously, the engine should do these calculations, the detail turns it into a number the panel derives is a number nothing checks, and nothing on the list can fail when the panel derives one. I read all eight criteria against that sentence. Criterion 1 carries it, and its command is a Go test in src/engine, which cannot see src/extension at all, so it can only decide the first half of its own sentence, that the engine answers the four numbers. Criterion 6 is the only criterion that reaches the panel, and it says in as many words that the check drives the page rather than reading the source, so it sees four numbers rendered and cannot tell a number the engine handed over from a number the panel worked out. Criteria 2 to 5 are about the engine's counting. Criterion 7 is the battery and criterion 8 is the reds. So the load-bearing negative, that the panel derives nothing, is asserted in prose about TypeScript and checked in Go, which is the shape doc/guidance/behaviour.md names: the check goes where the defect is, and a rule enforced in one language and checked in another cannot see the thing it guards. The tree already has the instrument for this and the token names it for another purpose: criterion 6 says the arguments come from src/extension/engineargs.ts so the builder is one engine-args.mjs already walks, and util/checks/ carries engine-args.mjs, no-loose-spawns.mjs and no-loose-glyphs.mjs, three checks that read the extension's own source for exactly this kind of rule.

**satisfies:** Give the negative its own criterion with a command that reads the panel's source, in the language the rule is about. It can be short: a check over the file that draws the bar requiring the four values to be read off what the engine sent and no arithmetic between them, in the shape util/checks/no-loose-spawns.mjs already uses to refuse a call written at its call site. Say in the sentence what counts as deriving, so the check is not a word list: forming any of the four from another number rather than reading it out of the engine's answer. Then take its red on the case that decides it: compute one of the four in a copy of the panel, run the check, watch it name that number, take it out, watch it green, and record the check and what it said. If the panel deriving a number is judged acceptable instead, say so in the detail with the reason, because the owner asked for the opposite by name.

## lesson 1 · round 1 · by reviewer10

**the class:** A BASELINE OFFERED AS THE THING THE WORK WILL BE CHECKED AGAINST, WITH NO COMMAND BESIDE IT AND ITS PARTS TAKEN FROM DIFFERENT INSTRUMENTS. A token that is about counting writes down what the counts are today, which is the right instinct, and then records the answers without the questions. Nobody can take the reading again, so nobody notices that the numbers were not all read the same way. The failure is quiet because the figures are internally consistent: a ratio divides, the parts add up, and the arithmetic checks out whichever instrument each half came from. It bites when the work lands, because the thing being built reads ONE source and the baseline was assembled from two, so the first draw disagreeing with the baseline is the correct outcome and will be read as a bug. It is worse where the source is a shared store other agents write while the round runs, since the reading moves under the next reader with nothing saying when it was taken. Measured on wk-1b7c1a2da1: of five numbers offered as the baseline, one reproduced from the log, two from the notes, and the one both halves of the headline ratio rest on reproduced from neither, while the token's own detail says the counter will read the log.

**instead:** Two halves, and the first is what stops it being made. Write the command beside each number as you take it, in the token, and before writing a ratio ask what instrument each half came from and make both the instrument the code will read. Where a number cannot come from that instrument, say so beside it and say what it can and cannot check, rather than offering the whole set as one baseline. Pin the reading to a commit or a timestamp, never to the word today, because a shared log and a shared note store move while the round runs. The second half is the check that catches it: before submitting, run every command in the token again and paste what each answered beside what was written, and treat any number you cannot reproduce with a command as not measured. A figure nobody can re-derive is not a baseline, and putting it in the evidence gives it the authority of one.

**minted as:** wk-1a4402245d

