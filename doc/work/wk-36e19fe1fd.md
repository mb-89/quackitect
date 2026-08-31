---
id: wk-36e19fe1fd
seq: "39"
type: work
title: a child draws nested
status: closed
assignee: main
scope: single-step
traced: true
disposition: done
parent: wk-66a28ca311
rounds: "1"
minted_by: person
---

## detail

A sub-token draws under its parent, nested and collapsible, like a group.

WHAT THE OWNER SEES TODAY: a sub-token sits in the list beside every other
token, so the breakdown of a piece of work is invisible and the parent looks
like one more row.

WHY IT IS NOT A GROUPING. The editor draws groups from a property's value: every
row with bucket later goes under later. A parent is not a value, it is a link
from one row to another, and a parent is itself a row. So this is a tree rather
than a grouping, and grouping by parent would draw the parent twice, once as a
heading and once as a row somewhere else.

WHAT IS ALREADY THERE: the renderer draws nested groups with a depth and a
fold, and it remembers which are folded across a change in the data. That is
the half that is easy.

WHAT IS NOT: the engine answers a flat list of groups and rows. It has to
answer a row that carries its children, and the fold has to be remembered by
the token's id rather than by a group name, because two tokens can share a
title and never share an id.

A CHILD IS DRAWN ONCE. A sub-token that also matches a pinned group would
otherwise appear under the pin and under its parent, and the page stops being a
partition.

CHECKED BY DRIVING THE PAGE, not by reading the markup. A parent with two
children renders one row with two under it, folding the parent hides both, and
the fold survives new data arriving.

## evidence: a child draws under its parent

The engine answers a row that carries its children. A Line has under and depth, and nest runs over the whole table after the partition, so a child and its parent landing in different groups still meet. A child is drawn under its parent and nowhere else, which keeps the page a partition.

## evidence: a child whose parent is not on the page draws where it always did

A filter or a page can leave the parent out, and a row that vanishes because its parent did is a row nobody can find. TestAChildWithNoParentHereDrawsOnItsOwn holds that.

## evidence: and a child under a pin is still drawn once

TestAChildIsDrawnOnceEvenUnderAPin walks the pinned groups and the rest and counts. A sub-token that matches a pin would otherwise appear under the pin and under its parent both.

## evidence: and a row is away while any parent above it is folded

The run is walked once and everything deeper than a folded parent goes away with it, which is what makes one fold hide a whole subtree without a container to hide.

## evidence: and the render check followed

Its assertion that the title text is the door went red on the indent, which is a check doing its job. It allows the indent and the fold between the cell and the words now, and still holds that the door is the span rather than the cell.

## evidence: checks

sh .se/scratchpad/battery.sh, run immediately before this submission. go build ok, go test ok (quackitect/engine 39.3s), go test mcp ok, go test viewer ok, se lint ok, render-check 0 failed, drive-editor 13 messages sent 0 failed, engine-args 0 failed, one-look 0 failed, panel-icons 0 failed, no-loose-glyphs 0 failed, no-loose-spawns 7 files read 0 failed. All ok.

## evidence: driven in a DOM rather than read

drive-editor.mjs finds a row that carries children, requires a child drawn deeper, requires each child drawn once, presses the fold and requires more rows away and the parent still there, requires the mark to turn round, presses again and requires them back, and requires the fold not to tick the row it sits on.

## evidence: finding 1, a third way to hide a row, added outside the one pass

The finding is right and the file already said why it matters. Two things hid a row, a closed group and a page the row is not on, and they share one attribute, so both are computed in one pass. The fold was a third way and it was added as a class of its own, so the pager went on counting rows the fold had taken away.

## evidence: it is a tree rather than a grouping

The parent link is carried on the line rather than read from a cell, because a parent is not a value and a view that does not draw a parent column still nests, which is every view. Grouping by parent would have drawn the parent twice, once as a heading and once as a row.

## evidence: proved red twice

With nest taken out of the engine it reports that no row carries children. With the redraw taken out of the fold handler it reports that folding the parent takes nothing away and the mark does not turn round.

## evidence: the check for it

drive-editor.mjs reads the pager's own count before folding, requires it to change on the fold, and requires it back on the unfold. Proved red by taking the fold out of candidates again: it reports that the pager said one thing and still says it.

## evidence: the fold is remembered by the token's id

A group's fold is remembered by its name and a row's cannot be, because two tokens can share a title and never share an id. The row's key is the pane and the id, kept in the same set that already survives new data arriving.

## evidence: the page draws a flat run that knows its depth

A nested table would break every column width the person set, so the rows stay one run and each carries its depth. The indent is drawn in the first cell and the fold sits beside the words, only on a row that has something to fold.

## evidence: what the pass does now

candidates skips a row a folded parent has taken away as well as one a closed group is swallowing, and folding draws the page again rather than leaving a count that includes rows nobody can see. The comment says three rather than two and names the fold as the one that was added outside.

## finding 1 · round 1 · CHECKED BY DRIVING THE PAGE, not by reading the markup. A parent with two children renders one row with two under it, folding the parent hides both. / editor.ts: TWO THINGS HIDE A ROW and they share one attribute ... SO BOTH ARE COMPUTED IN ONE PASS. · by reviewer4

**wrong:** THE FOLD IS A THIRD WAY TO HIDE A ROW AND IT WAS ADDED OUTSIDE THE ONE PASS THE OTHER TWO SHARE, so the pager counts rows the fold has taken away. The file says why that matters, in its own words, at editor.ts:1107-1110: 'TWO THINGS HIDE A ROW and they share one attribute: a closed group, and a page it is not on. Two handlers writing the hidden flag would fight, and the loser would be whichever ran second. SO BOTH ARE COMPUTED IN ONE PASS.' This token adds the third, folded-away, and candidates() at editor.ts:1114-1122 still skips only a row inside a shut group: for (const g of wrap.querySelectorAll('.group')) { if shut continue; ... push every tr[data-id] }. A row hidden because a folded PARENT sits above it is pushed like any other, so it takes a place on the page and shows nothing. REPRODUCED, in a real DOM, against the page as it is built today, with an engine built from source minutes ago, in .se/scratchpad/reviewer4/drive-page-fold.mjs. Set the page size to 5 and count the rows a person can actually see -- not hidden, not folded-away, not inside a shut group. It is 5. Press the fold on one parent on that page and count again. It is 3. The two children the fold took away are still counted against the page of five. IT IS DORMANT TODAY AND NOT FOR LONG. se query --view work --pane left reports total 35 against a default page of 50, so bar.hidden at editor.ts:1136 keeps the pager off the screen and a person cannot change the size while it is hidden. doc/work holds 58 notes and 31 tokens the view can reach, and this queue minted seven today. The mechanism is wrong now; the screen shows it the day the table passes fifty, with nothing else changing. EXTENT, one pass on what hides a row. Three things do: hidden, written by showPage; shut on a group, read by candidates and by drawFolds's group loop; and folded-away, written by drawFolds at editor.ts:632-645. Two of the three meet in candidates. The third does not, and drawFolds and showPage are separate walks over the same rows with no ordering written down between them, which is the second half of what the comment warns about. AND ONE THING I WENT LOOKING FOR AND DID NOT FIND, so it is not a finding. The detail's last sentence says the fold survives new data arriving, and the eight driven assertions stop one step short of it: they fold, check, unfold, and never send a body message. I wrote that check -- .se/scratchpad/reviewer4/drive-fold.mjs folds a parent, posts a body message carrying the same rows, and requires the same rows still away and the mark still shut -- and it passes. restore() calls drawFolds and the row keys live in the same set as the group keys, so the behaviour is right. It is a clause with no guard rather than a clause that is false, and the check is ten lines if you want it while the file is open. THE REST IS DONE AND I CHECKED IT RATHER THAN TAKING IT. The driven checks all pass: some row carries children, a child is drawn deeper, the child is drawn once, the parent carries a fold, folding takes its children away, the parent itself stays, unfolding brings them back, and folding does not tick the row. A child is drawn once and the fold is kept by the id rather than by a name, which is right for the reason the detail gives.

**satisfies:** PUT THE FOLD IN THE PASS THE COMMENT ALREADY DESCRIBES. candidates() has to skip a row a folded parent has taken away exactly as it skips one inside a shut group: read folded-away, or better, ask the same set drawFolds asks, so the two cannot drift. Then write down the ordering the pass now depends on -- drawFolds runs before showPage, because showPage reads what drawFolds decided -- because that dependency is the thing the original comment was written to stop being implicit, and it is implicit again. THE CHECK, RED TODAY, AND I HAVE RUN IT. In drive-editor.mjs, set .bs-per small enough that the pager is live -- five is enough on this data -- count the rows a person can see, fold a parent that is on the page, and require the count to be unchanged. It is 5 then 3 today. Assert the count rather than a boundary, so the check still means something when the paging arithmetic changes shape. AND WHILE YOU ARE THERE, add the assertion the detail's own last sentence asks for: fold a parent, post a body message carrying the same rows, and require the same rows still away and the mark still shut. That one is green today, which is why it is not a finding, but the headings check next to it exists because exactly this regression happened once already on a body message.

## lesson 1 · round 1 · by reviewer4

**the class:** A new way to hide a thing, added beside two that had already been made to agree. The file carried a paragraph saying that two mechanisms hiding a row would fight and that both are therefore computed in one pass. Nesting introduced a third, and it was written where the feature was rather than where the rule was, so the pass still knows about two of three. The damage is quiet: nothing errors, nothing looks broken, a page simply shows fewer rows than it says. And the comment that would have caught it was read as history rather than as a rule that applies to whatever gets added next.

**instead:** When you add a way to hide, disable, skip, or exclude something, go and find every other way the same thing is hidden before you write it, and add yours to whatever already reconciles them. A comment saying 'both are computed in one pass' is a contract on future work, not a note about the past: when you make it three, the sentence has to change with the code. Search for the shared consequence -- what does the rest of the program count, page, sum or select from -- rather than for the shared mechanism, because the new hider will use a different attribute and grep will not find it. And when two passes now depend on running in a particular order, write the order down at both ends; an implicit ordering between two walks over the same rows is the same defect one step later.

**minted as:** wk-ccd563ec25

