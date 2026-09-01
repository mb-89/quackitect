---
id: wk-1b7c1a2da1
seq: 1000013
type: work
title: the bar burns down
status: spec_open
assignee: main
scope: single-step
traced: true
rounds: 2
minted_by: person
---

## detail

THE OWNER'S WORDS: in the work editor, in the header bar, the one bar that is not the generic editor, I want a burn down. The number of minted per day, the number of done per day, and the number of total open or backlogged, not per day but just in absolute terms. Call it b d colon, then three numbers separated with slashes. And if somebody hovers over it, then the details, so it does not fill up too much space. And one more number, the rate at which work tokens fail reviews, and that can be more than a hundred percent, if one token fails two rounds that is counted twice, and we want that number to go down over time. And, obviously, the engine should do these calculations. FOUR NUMBERS, AND THE LAST THREE WORDS DECIDE WHERE THEY COME FROM. The engine computes them and the panel draws what it is handed. A number the panel derives is a number nothing checks, and this project has already been bitten by a count that lived only where it was displayed. WHAT EACH ONE IS. Minted per day: tokens the record says were minted that day. Done per day: tokens that reached imp_done that day. Open plus backlogged: one absolute count of everything not ended, taken now rather than per day. The failure rate per day: rejections that day over tokens that reached a review that day, as a percentage, and it goes above a hundred when one token is rejected twice. MEASURED TODAY, SO THE FIRST DRAW HAS SOMETHING TO BE CHECKED AGAINST. Over the whole record rather than per day: 49 distinct tokens carry a review event, 122 rejections and 39 acceptances stand across them, and the rate is 249 per cent. 47 were rejected at least once and 2 went through clean. The worst took seven rounds, wk-1412093cd8 and wk-24be1c06ae, and one took six, wk-a51a799f40. AN EARLIER DRAFT SAID 174 PER CENT OVER 61 TOKENS AND IT WAS WRONG IN THE DENOMINATOR: it counted every token whose status looked as though it had been through a review, which swept in tokens that closed before this queue had reviews at all. WHERE THE DAY COMES FROM WANTS DECIDING. A token note carries no timestamp, because times were deliberately taken off a token and left to the record, so the per-day numbers have to be read out of the log rather than off the notes. Say in the spec which the counter reads and why, because a reader will assume the notes. THE HOVER CARRIES THE DETAIL: what each number is, over what window, and where it was read from.

WHERE EACH NUMBER COMES FROM, DECIDED. A token note carries no timestamp,
because times were deliberately taken off a token and left to the record, so the
two per-day numbers are read out of the log. The log holds what is needed: a
work event carries the mint with its time, and a review event carries the
verdict. The absolute count is taken over the notes, because that is a fact
about now rather than about a day.

THE PANEL DERIVING NOTHING IS ITS OWN CRITERION, IN THE LANGUAGE THE RULE IS
ABOUT. The owner asked for it by name, obviously the engine should do these
calculations, and a criterion carrying that sentence with a Go command cannot
decide it: a test in src/engine cannot see src/extension at all, and the check
that drives the page sees four numbers rendered and cannot tell one the engine
handed over from one the panel worked out. util/checks already reads the
extension's own source for rules of this shape, so this one does too.

AND THE WINDOW IS NAMED IN THE ANSWER, because it is smaller than it looks. se
retro drains the log, so the per-day numbers only reach back to the last retro,
and a bar that said otherwise would be lying quietly. How to keep a long run
without keeping every ephemeral is wk-88f4fcc517, which the owner has not ruled
on, so this token says what it can see and names that token as where the rest is
decided. Nothing yet, naming what still owes it, is an answer. Silence is not.

## evidence: what the record says today

Over the whole record rather than per day, which is the number to check the
first draw against: 49 distinct tokens carry a review event, 122 rejections stand across
them, and the rate is 249 per cent. 42 tokens were rejected at least once and 19
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
- The panel derives none of the four, and the check reads the panel's own source, because a rule about TypeScript enforced in Go cannot see the thing it guards. DERIVING MEANS FORMING ANY OF THE FOUR FROM ANOTHER NUMBER rather than reading it out of the engine's answer, so the check refuses arithmetic between the values on the way to the bar and names the number it found being made
  `node util/checks/burndown-derives-nothing.mjs .`
- The whole battery is green afterwards. THIS IS A STANDING RULE OVER THE PROJECT rather than an assertion about this change: it is true before the work and has to be true after
  `sh util/checks/battery.sh`
  **red without** the package made not to build, in a copy of the tree
  **red said** battery.sh: go build FAIL, and 10 failed at the end of the run
- Every test named above was watched failing on its own assertion, with the change absent, before it was watched passing. THE EVIDENCE NAMES THE TEST AND WHAT IT SAID rather than a line number

## finding 1 · round 1 · done when, criterion 7: "The whole battery is green afterwards" · by reviewer10

**wrong:** The criterion has no command and one command decides it: bash util/checks/battery.sh, which exists, is what every other agent on this tree runs, and exits zero when it is green. doc/guidance/specifying.md says a criterion that can be a command is one, because a command fails and a sentence does not. Leaving it as prose is not free here, and I read the engine rather than guessing at the cost. UnmetCriteria in src/engine/spec.go answers a criterion with no command by requiring an evidence section named after the criterion's own sentence, so the worker has to write a section called The whole battery is green afterwards and assert it there in words, and a reviewer then judges a sentence where an exit code was available. That is the one place in this list where the check is weaker than the tool allows. The extent is one criterion and I checked the other seven before writing this: six carry commands and the eighth, the watched-red one, genuinely cannot be a command because it asks what a person saw.

**satisfies:** Give it the command: bash util/checks/battery.sh. Keep the sentence as it is, because the sentence is right, and say in it whether the criterion is about this change or a standing rule over the project, which doc/guidance/specifying.md asks a drafter to say. Then take its red the way the eighth criterion asks of the others: break one line the battery covers in a copy of the tree, run it, record what it said, and put it back.

## finding 2 · round 1 · detail: MEASURED TODAY, SO THE FIRST DRAW HAS SOMETHING TO BE CHECKED AGAINST, and the evidence section what the record says today · by reviewer10

**wrong:** The token offers five numbers as the thing the first draw is to be checked against, in the detail under MEASURED TODAY and again in the evidence section, and records no command for any of them. I tried to take the readings again, and three of the five come from two different instruments while one does not come back. From the log, counting review events across .se/log/*.jsonl, 71 verdicts say rejected and 35 say spec rejected, which is 106, and two of those 106 are rejections I recorded this session, so the number the draft wrote and the number I counted are not the same 106 and nothing on the token says when its reading was taken. From the notes, counting tokens across doc/work and .se/work that carry at least one finding, 42, which reproduces exactly, and the worst two are wk-a51a799f40 and wk-c02dc4046b at six rounds each, which also reproduces exactly, by the rounds their finding headings name. The 61 does not reproduce from either. The log carries review events for 43 distinct tokens. The notes carry findings for 42. The only way I could make 61 was by adding up note statuses, closed 40, imp_done 8, imp_submitted 6, spec_submitted 5 and spec_in_review 2, and two of those five statuses are tokens waiting for a reviewer rather than tokens that reached one. So the 249 per cent divides a numerator taken from the log by a denominator taken from the notes, and the 19 that went through clean is 61 minus 42, which inherits whichever instrument the 61 was. That matters beyond arithmetic, because this same detail decides that both per-day numbers are read out of the log and that the absolute count is taken over the notes. The engine will therefore compute the rate from the log on both sides of the division, over a window a retro truncates, and the baseline it is to be checked against is a different quantity over a different window. The evidence section calls these the number to check the first draw against, and a first draw agreeing with them would mean the counter was wrong.

**satisfies:** Write the command beside every number and paste what it answered, which is what doc/guidance/voice.md asks under Claims and what doc/guidance/specifying.md asks of a literal. Take both halves of the rate from the instrument the engine will read, so the baseline is the same quantity the counter computes: if the rate is rejections over tokens that reached a review and both come from the log, count the denominator from the log too and say so. Say what reached a review means as a rule a command can apply, because spec_submitted and imp_submitted are tokens waiting for a reviewer and the sentence reads as tokens that had one. Pin the reading to a commit or a timestamp rather than to the word today, because the log and the notes are a shared store several agents write while the round is running, and this token's own lesson queue already carries that class as wk-4c3586254a. And where a number is a whole-history figure and the bar draws a per-day one, say in the evidence which of the four it can check and which it cannot, rather than offering all five as the baseline.

## finding 3 · round 1 · detail: "obviously, the engine should do these calculations" and "A number the panel derives is a number nothing checks", against done when, criteria 1 and 6 · by reviewer10

**wrong:** The owner's clause is obviously, the engine should do these calculations, the detail turns it into a number the panel derives is a number nothing checks, and nothing on the list can fail when the panel derives one. I read all eight criteria against that sentence. Criterion 1 carries it, and its command is a Go test in src/engine, which cannot see src/extension at all, so it can only decide the first half of its own sentence, that the engine answers the four numbers. Criterion 6 is the only criterion that reaches the panel, and it says in as many words that the check drives the page rather than reading the source, so it sees four numbers rendered and cannot tell a number the engine handed over from a number the panel worked out. Criteria 2 to 5 are about the engine's counting. Criterion 7 is the battery and criterion 8 is the reds. So the load-bearing negative, that the panel derives nothing, is asserted in prose about TypeScript and checked in Go, which is the shape doc/guidance/behaviour.md names: the check goes where the defect is, and a rule enforced in one language and checked in another cannot see the thing it guards. The tree already has the instrument for this and the token names it for another purpose: criterion 6 says the arguments come from src/extension/engineargs.ts so the builder is one engine-args.mjs already walks, and util/checks/ carries engine-args.mjs, no-loose-spawns.mjs and no-loose-glyphs.mjs, three checks that read the extension's own source for exactly this kind of rule.

**satisfies:** Give the negative its own criterion with a command that reads the panel's source, in the language the rule is about. It can be short: a check over the file that draws the bar requiring the four values to be read off what the engine sent and no arithmetic between them, in the shape util/checks/no-loose-spawns.mjs already uses to refuse a call written at its call site. Say in the sentence what counts as deriving, so the check is not a word list: forming any of the four from another number rather than reading it out of the engine's answer. Then take its red on the case that decides it: compute one of the four in a copy of the panel, run the check, watch it name that number, take it out, watch it green, and record the check and what it said. If the panel deriving a number is judged acceptable instead, say so in the detail with the reason, because the owner asked for the opposite by name.

## finding 4 · round 2 · done when, criterion 3: "Open plus backlogged is one absolute count over every token that has not ended, across both stores, and the check refuses when it finds none rather than passing by there being nothing to count" · by reviewer11

**wrong:** THE ONE COUNTING CRITERION THAT NAMES NO DATA AND NO ANSWER, WITH AN ANTI-VACUITY GUARD IN THEIR PLACE. Criterion 3 reads: Open plus backlogged is one absolute count over every token that has not ended, across both stores, and the check refuses when it finds none rather than passing by there being nothing to count. That sentence says what the NUMBER is and the only thing it says about the CHECK is that it refuses on an empty answer. I read the three counting criteria side by side rather than one at a time, which is where this is visible. Criterion 2 says driven over a fixture log holding events on two named days, so the check decides the counting rather than agreeing with whatever the tree happens to hold. Criterion 4 says the check drives one token rejected twice in one day and requires two hundred per cent. Criterion 3, between them, names neither the data nor the value. SO THE WRONG IMPLEMENTATION IS ONE LINE AND IT SATISFIES THE SENTENCE: count every token in doc/work and .se/work whose status is not imp_done and not aborted, and assert the answer is more than zero. That check is green when the counter includes ended tokens, green when it reads one store and not the other, green when it counts a token twice, and green when it counts backlogged and forgets open. Every one of those is the defect the criterion exists to refuse, and none of them can make it red. AND THE GUARD IT DOES NAME IS THE ONE THIS PROJECT HAS ALREADY RULED OUT, in the words of a lesson on this queue: an anti-vacuity guard catches the list being emptied and says nothing about it being short. It is the same sentence again with a count in place of a list. THE EXTENT IS ONE OF NINE AND I CHECKED THE OTHER EIGHT BEFORE WRITING THIS. Criteria 1, 5, 6, 7 and 8 name a command that reaches the thing they are about, criterion 2 and criterion 4 name a fixture and an expected value, and criterion 9 is the observation clause. Criterion 3 is the only line on the list whose command could be written so that nothing it is about can make it fail.

**satisfies:** NAME THE DATA AND THE ANSWER, THE WAY THE TWO CRITERIA EITHER SIDE OF IT ALREADY DO. Write criterion 3 as: open plus backlogged is one absolute count of every token that has not ended, and the check drives a fixture holding one token in each of the eleven states across both stores and requires the count the fixture owes, so a counter that includes an ended token, reads one store, or counts a token twice makes it red by name. Keep the refusal on an empty answer if it is wanted, and say beside it that it guards the fixture having gone rather than the count being wrong, so the next reader does not take it for the check. THE CHECK, RED TODAY: write that fixture and run it before agreeing the draft, then break the counter in the three ways the sentence forbids, once by counting imp_done, once by reading only doc/work, and once by counting a token in both stores twice, and require the check to name the number it got and the number the fixture owes each time. Record each by the test name and what it said. AND WHILE THE LIST IS OPEN, PIN THE MEASURED PARAGRAPH TO SOMETHING, which is the half of round 1's second finding still outstanding: the paragraph says MEASURED TODAY and the record moved while this round ran. I re-derived it from the log just now and it answers 127 rejections, 43 acceptances and 259 per cent over the same 49 tokens, against the 122, 39 and 249 the note carries, and the 49, the 47 rejected at least once and the 2 clean all reproduce exactly. Say which commit or which timestamp the reading was taken at, so the next reader can tell a wrong number from a later one. WHAT IS CLOSED AND SHOULD NOT BE REDONE, because I checked it: the battery criterion has its command and says it is a standing rule, the panel-derives-nothing negative has a criterion of its own in the language the rule is about, and both halves of the rate now come from the log, which is what round 1 asked for and the reason its 49, 47 and 2 reproduce.

## lesson 1 · round 1 · by reviewer10

**the class:** A BASELINE OFFERED AS THE THING THE WORK WILL BE CHECKED AGAINST, WITH NO COMMAND BESIDE IT AND ITS PARTS TAKEN FROM DIFFERENT INSTRUMENTS. A token that is about counting writes down what the counts are today, which is the right instinct, and then records the answers without the questions. Nobody can take the reading again, so nobody notices that the numbers were not all read the same way. The failure is quiet because the figures are internally consistent: a ratio divides, the parts add up, and the arithmetic checks out whichever instrument each half came from. It bites when the work lands, because the thing being built reads ONE source and the baseline was assembled from two, so the first draw disagreeing with the baseline is the correct outcome and will be read as a bug. It is worse where the source is a shared store other agents write while the round runs, since the reading moves under the next reader with nothing saying when it was taken. Measured on wk-1b7c1a2da1: of five numbers offered as the baseline, one reproduced from the log, two from the notes, and the one both halves of the headline ratio rest on reproduced from neither, while the token's own detail says the counter will read the log.

**instead:** Two halves, and the first is what stops it being made. Write the command beside each number as you take it, in the token, and before writing a ratio ask what instrument each half came from and make both the instrument the code will read. Where a number cannot come from that instrument, say so beside it and say what it can and cannot check, rather than offering the whole set as one baseline. Pin the reading to a commit or a timestamp, never to the word today, because a shared log and a shared note store move while the round runs. The second half is the check that catches it: before submitting, run every command in the token again and paste what each answered beside what was written, and treat any number you cannot reproduce with a command as not measured. A figure nobody can re-derive is not a baseline, and putting it in the evidence gives it the authority of one.

**minted as:** wk-1a4402245d

## lesson 2 · round 2 · by reviewer11

**the class:** ONE CRITERION IN A LIST OF SIBLINGS LEFT WITHOUT THE THING ALL THE OTHERS HAVE, AND AN ANTI-VACUITY GUARD STANDING IN ITS PLACE. A list of criteria is written top to bottom, in prose, and each line is read on its own by whoever writes it and by whoever reviews it. Three of them are about counting the same kind of thing. Two name the data the check runs on and the value it must answer. The third names neither and says instead that the check refuses when it finds nothing, which reads like rigour and is the guard this project has already ruled out: it catches the data going away and never catches the count being wrong. WHY THE LIST HIDES IT: nothing compares the lines with each other, a reviewer asks of each line whether its sentence is true and whether its command runs, and both answers are yes. The defect is visible only side by side, where one line is shorter than its neighbours in exactly the place that decides it. MEASURED ON wk-1b7c1a2da1: the per-day criterion names a fixture log on two named days, the rate criterion drives one token rejected twice and requires two hundred per cent, and the criterion between them names no fixture and no value, so a check counting the live tree and asserting more than zero satisfies it.

**instead:** WHAT WOULD HAVE STOPPED IT BEING MADE: after drafting, read the criteria as a column rather than as sentences, and write three things beside each in a few words, the instrument, the data it runs on, and the value it requires. Any line with a blank is not finished, and the blank is where the attention ran out rather than where the check is easy. Where the sibling criteria already answer one of the three, the odd one out is the line to write again. WHAT WOULD HAVE CAUGHT IT: for every criterion, write the wrong implementation that satisfies its sentence, in one line, before agreeing it. For a counting criterion that is a check over the live tree asserting only that the number is more than zero. If the wrong implementation is easy to write, the criterion has decided nothing, and an anti-vacuity guard on the line is a sign that the wrong implementation was the one in mind.

**minted as:** wk-936df2f551

AND A FILTER BOX IN THE SAME LINE, WHICH THE OWNER ASKED FOR HERE BECAUSE THIS
BAR IS THAT LINE. THEIR WORDS: what you can add, and you can add that to the
general editor, is a small line edit in the heading line where I can filter for
names or attributes the same way as in the log. So I enter something in there
with the same syntax as the log, and then I only see the elements that fit that
filter. That would have helped me to search for the test quicker.

THE SYNTAX IS THE LOG'S AND NOT A SECOND ONE. A person who has learned one has
learned the other, and a second syntax for one job reads as a second job. The
log's reader is the authority for what it accepts, so the box hands the text to
it rather than parsing it here.

IT NARROWS WHAT IS DRAWN AND CHANGES NOTHING ON DISK. A filter typed in the bar
is a person looking, not a person editing, so it writes no view file: the .base
filter is the view's and this is the reader's.

## done when

- The heading line carries a filter box, and what a person types in it narrows what the panes draw and writes nothing to the view file, because a filter typed in the bar is somebody looking rather than somebody editing
  `node util/checks/burndown.mjs .`
- The syntax is the log's, and the box hands the text to the log's own reader rather than parsing it a second time, so a person who has learned one has learned the other and neither can drift from the other
  `rg -q func.TestTheBarFilterReadsWhatTheLogReads src/engine && go test -C src/engine -count=1 -run TestTheBarFilterReadsWhatTheLogReads$ .`

