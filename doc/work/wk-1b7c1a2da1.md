---
id: wk-1b7c1a2da1
seq: 1000013
type: work
title: the bar burns down
status: spec_open
assignee: main
scope: single-step
traced: true
minted_by: person
---

## detail

THE OWNER'S WORDS: in the work editor, in the header bar, the one bar that is not the generic editor, I want a burn down. The number of minted per day, the number of done per day, and the number of total open or backlogged, not per day but just in absolute terms. Call it b d colon, then three numbers separated with slashes. And if somebody hovers over it, then the details, so it does not fill up too much space. And one more number, the rate at which work tokens fail reviews, and that can be more than a hundred percent, if one token fails two rounds that is counted twice, and we want that number to go down over time. And, obviously, the engine should do these calculations. FOUR NUMBERS, AND THE LAST THREE WORDS DECIDE WHERE THEY COME FROM. The engine computes them and the panel draws what it is handed. A number the panel derives is a number nothing checks, and this project has already been bitten by a count that lived only where it was displayed. WHAT EACH ONE IS. Minted per day: tokens the record says were minted that day. Done per day: tokens that reached imp_done that day. Open plus backlogged: one absolute count of everything not ended, taken now rather than per day. The failure rate per day: rejections that day over tokens that reached a review that day, as a percentage, and it goes above a hundred when one token is rejected twice. MEASURED TODAY, SO THE FIRST DRAW HAS SOMETHING TO BE CHECKED AGAINST. Over the whole record rather than per day: 61 tokens have reached a review, 106 rejections stand across them, and the rate is 174 per cent. 42 tokens were rejected at least once and 19 went through clean. The worst two took six rounds each, wk-a51a799f40 and wk-c02dc4046b. WHERE THE DAY COMES FROM WANTS DECIDING. A token note carries no timestamp, because times were deliberately taken off a token and left to the record, so the per-day numbers have to be read out of the log rather than off the notes. Say in the spec which the counter reads and why, because a reader will assume the notes. THE HOVER CARRIES THE DETAIL: what each number is, over what window, and where it was read from.

