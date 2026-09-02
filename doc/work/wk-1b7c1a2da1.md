---
id: wk-1b7c1a2da1
seq: 1000013
type: work
title: the bar burns down
status: imp_in_work
assignee: main
scope: single-step
traced: true
disposition: done
holder: main
rounds: 7
rung: 1
minted_by: person
submitted_by: main
reviewed_by: rev-33
---

## detail

The owner's words: in the work editor header bar, a burn down. Minted per day, done per day, and total open or backlogged in absolute terms, drawn as BD: and three numbers with slashes, details on hover. A fourth number, the rate at which tokens fail reviews per day, counting a token twice when it fails two rounds. The engine computes them and the panel draws what it is handed. The per-day numbers are read out of the log and the absolute count over the notes. The answer names its window, since se retro drains the log. Baseline: python util/checks/count-reviews.py . prints its own moment, and the filter box left this token for wk-aae03d4767.

## done when

- The engine answers the four numbers and src/extension/editor.ts draws what it is handed, and the answer names its window and wk-88f4fcc517
  `rg -q func.TestTheEngineAnswersABurndown src/engine && go test -C src/engine -count=1 -run TestTheEngineAnswersABurndown$ .`
  **red without** the window, so a small number cannot be told from a short one
  **red said** TestTheEngineAnswersABurndown: the answer says nothing about which window it covers, and the window does not name where the long run is decided
- Minted and done per day are read out of the log by UTC day, and the two-day fixture answers one and two for 2026-08-31 and three and one for 2026-08-30
  `rg -q func.TestTheBurndownCountsADay src/engine && go test -C src/engine -count=1 -run TestTheBurndownCountsADay$ .`
  **red without** the day filter, so the counter sums both days
  **red said** TestTheBurndownCountsADay: 2026-08-31 answers 4 minted and 3 done where one and two is owed, and 2026-08-30 answers the same four and three
- Open plus backlogged is one count over every token not ended in both stores, and the fixture answers exactly four
  `rg -q func.TestTheBurndownCountsWhatIsStillOpen src/engine && go test -C src/engine -count=1 -run TestTheBurndownCountsWhatIsStillOpen$ .`
  **red without** the question about whether a token has ended, so it counts every note in both stores
  **red said** TestTheBurndownCountsWhatIsStillOpen: the fixture holds four tokens that have not ended and the answer is 8
- The failure rate counts a rejection per round, so one token rejected twice in a day answers two hundred per cent
  `rg -q func.TestTheFailureRateCountsEveryRound src/engine && go test -C src/engine -count=1 -run TestTheFailureRateCountsEveryRound$ .`
  **red without** the count per round, with tokens counted once rather than rejections counted each
  **red said** TestTheFailureRateCountsEveryRound: one token rejected twice answers 100%, and two hundred is owed
- The bar draws BD: and four numbers with slashes, detail on hover, arguments built in src/extension/engineargs.ts, driven on the page
  `node util/checks/burndown.mjs .`
  **red without** the input, with the bar printing four numbers of its own whatever it is handed
  **red said** burndown: the hover reads a detail rather than the detail it was handed, the bar says the same over two different answers, and the second bar reads BD: 1/2/3/4%
- The work editor derives none of the four, checked by reading src/extension/editor.ts and refusing arithmetic between the values
  `node util/checks/burndown-derives-nothing.mjs .`
  **red without** nothing taken away: one of the four formed from another in the function that draws them, which is what deriving is
  **red said** burndown-derives-nothing: done is formed rather than read, minus b.done, and open is formed rather than read, b.open minus
- The whole battery is green afterwards
  `sh util/checks/battery.sh`
  **red without** src/engine made not to build, with a syntax error appended to expr.go in a faithful copy of the tree
  **red said** battery.sh printed go build FAIL # quackitect/engine and expr.go: syntax error: unexpected name is at end of statement, then go test FAIL for the same reason. The count is left out, because a total is a property of the copy and the printed line is a property of the check
- Every test above was watched failing on its own assertion first, and the evidence names the test and what it said
