---
id: wk-1b7c1a2da1
seq: 1000013
type: work
title: the bar burns down
status: spec_submitted
assignee: main
scope: single-step
traced: true
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

