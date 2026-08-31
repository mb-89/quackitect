---
id: wk-49dac4dab4
seq: "19"
type: work
title: a flag not search
status: closed
assignee: main
scope: single-step
traced: true
disposition: done
rounds: "3"
minted_by: person
---

## detail

The engine works out that an answer is owed by reading its own log back and
looking for a prompt with nothing after it. It was told the prompt arrived. A
program that derives a fact it was handed will disagree with itself the first
time the record and the events part company.

A prompt arriving flips a bit. An answer arriving clears it. The guard reads
the bit.

The owner also asked whether this belongs in the MCP server rather than the
engine, since the stub is what the agent talks to. That is part of the wider
question about a resident engine, so decide that one first.

## evidence: and the behaviour, with what it does not decide

TestADeadLockIsStolenAndTheWriteHappensUnderIt leaves a lock just past stale, calls TheyAsked, and requires the write to have happened, the lock to be gone, and the wait to be shorter than the staleness. It is written in terms of the staleness, so it says the steal works and says nothing about whether the number is right. The test above is what decides that, and its comment says so, because a check that adapts to the constant it is about cannot judge the constant.

## evidence: checks

sh .se/scratchpad/battery.sh, run immediately before this submission. go build ok, go test ok, go test mcp ok, go test viewer ok, se lint ok, render-check 0 failed, drive-editor 8 messages sent 0 failed, engine-args 0 failed, one-look 0 failed, panel-icons 0 failed, no-loose-glyphs 24 glyphs declared 12 files read 0 failed, no-loose-spawns 7 files read 0 failed. All ok.

## evidence: finding 6, the two valves defeated each other

The finding is right. A waiter gave up after one second and a lock went stale after five, so no waiter ever lived long enough to steal one. Every one of them went ahead without the lock instead, which is the unsynchronised write the lock exists to stop, and it did that for the whole five seconds after a process died holding it.

## evidence: findings 1 and 2

Closed in round 1.

## evidence: findings 3, 4 and 5

Closed in the last round and unchanged. The verb does not clear what it cannot attribute, the clear runs before this event's messages are copied, and the read and the write are one operation.

## evidence: the append-only idea, considered and not taken

An obligation is an append, and one O_APPEND write of a line is atomic at these sizes, which would remove the lost-write class rather than narrowing it. It is not taken here because the clear is not an append: TheyWereAnswered removes a key, so the file would still need compaction and a reader would still need the whole of it. It belongs with wk-4b67d7126a, where a resident engine makes this file go away entirely, and that token names it.

## evidence: the check that holds the order, proved red

TestTheWaiterOutlastsTheStaleness asserts the wait budget is longer than the staleness. Against the numbers the finding found it reports that a waiter gives up after 1s and a lock goes stale after 5s, so no waiter ever steals one.

## evidence: which of the three I chose, and why

The staleness came down rather than the budget going up. A second is long enough that a live holder is never robbed, because the write it guards is a few hundred bytes of JSON, and it means a dead lock is resolved in a second rather than in five. The budget is three times the staleness, 1500 tries at 2 milliseconds, so a waiter always sees the steal first and going ahead is the last resort the paragraph says it is.

## finding 1 · round 1 · The owner also asked whether this belongs in the MCP server rather than the engine, since the stub is what the agent talks to. That is part of the wider question about a resident engine, so decide that one first. · by reviewer

**wrong:** THE THIRD PARAGRAPH OF THE DETAIL IS NOT ANSWERED ANYWHERE IN THE SUBMISSION. It reads: "The owner also asked whether this belongs in the MCP server rather than the engine, since the stub is what the agent talks to. That is part of the wider question about a resident engine, so decide that one first." The submission has four sections -- checked, what changed, where it is flipped, why -- and not one sentence of any of them mentions the MCP server, the stub, or a resident engine. The clause asks for a decision and no decision was recorded.

**satisfies:** DECIDE IT AND WRITE THE DECISION DOWN, in the submission and in the code comment on owed.go. It does not have to be a big decision, and it does not have to be resident-engine-first if that is not practical -- what it cannot be is silent. Three answers are legal here: the flag stays in the engine, and why; it moves to the stub, and why; or it stays for now, wk-4b67d7126a is what settles it, and here is what would change when that lands. Any of those satisfies the clause. None of them is in the submission today.

## finding 2 · round 1 · A prompt arriving flips a bit. An answer arriving clears it. The guard reads the bit. · by reviewer

**wrong:** A SECOND PROMPT ERASES THE FIRST, so questions the owner asked are never handed to anybody. writeOwed replaces the whole Owed struct, and Owed has one Said field, so TheyAsked overwrites rather than appends. The test asserts this on purpose at owed_test.go:83-87: two TheyAsked calls, and only "the second thing" survives.

**satisfies:** MAKE IT A LIST, NOT A SLOT. Owed.Said becomes a list of what was said, TheyAsked appends, TheyWereAnswered empties it, and AnswerOwed hands back all of them so the refusal shows every question still waiting. The refusal already cuts at twelve lines, so a burst stays readable. Nothing else about the design changes and the bit is still a bit: owed is simply "the list is not empty".

## finding 3 · round 2 · An answer arriving clears it. · by reviewer2

**wrong:** ONE AGENT'S ANSWER CLEARS ANOTHER AGENT'S BIT, AND THE STUB DOES IT ON EVERY CALL. main.go:205 clears whoever --actor defaults to, and the default is 'main' (main.go:93). src/mcp/roots.go:111 calls the verb as ask(r, '--answer', msg) with no --actor at all, so every se_answer from every agent in this project discharges main's obligation. Constructed and reproduced against the built engine: TheyAsked(r,'main','the thing the owner asked main'), then run the engine as the stub runs it - exe --answer 'here is my answer' --work ... --method ... - and AnswerOwed(r,'main') answers false. The question is in the log and owed to nobody, which is the exact loss the previous round found in another shape. The comment at hook.go:311-315 already names this bug ('The answer verb runs as a program with no idea which agent called it, so it cleared the default actor') and the remedy taken was to ALSO clear in the guard; the wrong clear was left in the verb, where it now damages a different agent instead of the caller. Extent, one pass: TheyWereAnswered has two callers - hook.go:319 with the real agent id, main.go:205 with a flag default - and one of them cannot know who is speaking.

**satisfies:** The verb does not clear an obligation it cannot attribute. Either it refuses to clear without an explicit --actor, or it stops clearing entirely and leaves it to the guard, which is the one place that knows the agent id and which the comment already says is the reason it clears there. Red check, failing today, catching the class rather than this call: a question is owed to main, another agent runs the answer verb the way the stub runs it, and main still owes. I ran it - it fails with 'another agent's answer discharged main's question'.

## finding 4 · round 2 · A prompt arriving flips a bit. An answer arriving clears it. · by reviewer2

**wrong:** THE CLEAR IS COARSER THAN THE ANSWER, so a question that arrives while the agent is answering is erased unanswered. TheyWereAnswered deletes the whole key, and on a PostToolUse event the guard copies mid-turn messages FIRST - hook.go:246-249 runs CopyWhatWasHeard, which calls TheyAsked at heard.go:142 - and only then reaches case PostToolUse at hook.go:307 and clears. So the ordering inside one event is: record the new question, then delete it. The answer that discharged it was composed before that question existed. Reproduced: TheyAsked('the first thing'), TheyAsked('and one more thing'), TheyWereAnswered, and AnswerOwed answers false with an empty string. The submission's reasoning - 'one answer settles the lot, because a person waiting on two questions is waiting for one reply that covers both' - is true for questions asked before the answer and false for one asked after it, and nothing in the code distinguishes them.

**satisfies:** An answer settles what was outstanding when it was written, not whatever the file holds when the write lands. Clear the entries that were read at the moment of answering - by count, or by taking the list and putting back anything appended since - so a question that arrived during the answering call survives it. Red check, failing today: two questions arrive, an answer settles the first, and the second is still owed.

## finding 5 · round 2 · IT IS KEYED BY ACTOR, because several agents run here at once - the token's own reason for the shape, in owed.go:20-23, alongside 'IT IS A FILE ... the guard is a fresh process per event'. · by reviewer2

**wrong:** THE FILE IS READ-MODIFY-WRITE WITH NO LOCK, so one agent's write erases another agent's question. loadOwed reads the whole map, the caller mutates its own key, writeOwed marshals the whole map back over the file. Two guard processes overlapping means one of the two obligations is simply not there. Measured: forty agents asked something at the same moment leaves 38 of them owing nothing; two agents - the number this project actually runs - overlapping on a fresh file loses one of them in 200 of 200 rounds. The window is the gap between the read and the write, and the guard fires on every tool call of every agent, so the writes are not rare events. This is the sibling of the defect found in the last round: there, a second prompt to the same agent erased the first; here, a prompt to a second agent erases the first, and the loss is identical - a question in the record that nobody is refused for. Extent: every writer of owed.json goes through this pair - TheyAsked from heard.go:142, hook.go:284 and main.go:185, TheyWereAnswered from hook.go:319 and main.go:205 - and there is no locking helper anywhere in src/engine, so the same hazard sits under heard.json too; owed.json is the one this token owns and the one whose lost write is a question handed to nobody.

**satisfies:** The read and the write are one operation that cannot interleave: a lock file taken around load-mutate-write, or an append-only record per actor that a concurrent writer cannot overwrite, so that a write for one agent can never drop another agent's entry. Red check, failing today, catching the class: two agents call TheyAsked at the same moment and both still owe. I ran it - it fails, and it fails on every one of two hundred attempts.

## finding 6 · round 3 · evidence: and a lock nobody can release is worse than a lost write - A process that died holding it would block every agent for good, so a lock older than five seconds is taken from whoever left it, and a writer that cannot get it after five hundred tries goes ahead rather than refusing. / owed.go: THE READ AND THE WRITE ARE ONE OPERATION. · by reviewer3

**wrong:** The two valves are described as complementary and they defeat each other, because the give-up is set below the staleness. lockWait is 2ms and lockTries is 500, so a waiter stops waiting after 1.002 seconds, while lockIsStale is 5 seconds. A waiter therefore never lives long enough to watch a lock go stale: for any lock that was fresh when it arrived, the give-up always fires first and it proceeds without the lock, which is the unsynchronised read-modify-write that finding 5 closed. Reproduced in a copy of src/engine at .se/scratchpad/reviewer3/eng, built from today's source: I wrote an empty owed.json.lock, the way a process that died holding it would leave one, then called TheyAsked. It returned after 1.278 seconds with the write done, the lock file still on disk, and no steal; a second writer arriving behind it paid another 1.271 seconds and did the same, and the store ended up holding both entries only because nothing happened to collide in that particular pair of milliseconds. So the case the paragraph is about, a process that died holding it, is handled by racing rather than by the steal for the whole five seconds until the lock is old enough, and during those five seconds every tool call of every agent pays over a second and writes unlocked. The guard is a fresh process on every tool call of every agent, which the file's own comment says, so that window is not a rare event, it is the one the paragraph was written for.

**satisfies:** Make the waiter outlast the staleness, so the steal is what resolves a dead lock and going ahead is the last resort the paragraph says it is: lockTries times lockWait must be greater than lockIsStale, which with 2ms means more than 2500 tries, or keep 500 tries and raise lockWait, or drop lockIsStale below the wait budget. Say which of the three you chose and why the number is what it is, since the paragraph already takes responsibility for these three numbers. The check is red today and is arithmetic rather than a race: assert lockTries multiplied by lockWait is longer than lockIsStale, and drive it as behaviour too, leave a lock file in place, call TheyAsked, and require the lock to be gone and the write to have happened under it rather than beside it. Both of those fail against the constants as they stand. While you are there, consider whether the read-modify-write is needed at all: an obligation is an append, and a single O_APPEND write of one line is atomic for a few hundred bytes, which removes the lost-write class rather than narrowing its window.

## lesson 1 · round 2 · by reviewer2

**the class:** Fixing the loss you were shown and leaving the same loss on every other path into the same state. The last round found one question erasing another inside one actor; the shape that erased it - a whole-value read, mutate and write, and a clear that takes everything - is untouched, so the same erasure still happens between two agents, between an answer and a question that arrives during it, and between the stub's answer verb and whoever 'main' is. Each was found by asking who else writes this file and what else this delete takes with it, not by reading the diff.

**instead:** When state moves from derived to stored, write down who writes it, from how many processes, and what each write assumes was true when it read. Then attack each of those: two writers at once, a write that lands after the read it was based on, and a clear that runs after something new arrived. A check per writer, each seen red with its own defect in place. And when a comment in the code already names a bug as past, verify the wrong code was removed and not merely joined by a second, better copy.

## lesson 2 · round 3 · by reviewer3

**the class:** Two limits written for the same failure, in different units, that were never compared. One says how long a lock may live before it is presumed dead; the other says how long a waiter tries before giving up. Each is defensible alone and the pair has an order: the waiter must outlast the presumption, or the presumption never gets used. Both numbers were chosen deliberately, both are documented, and neither was multiplied out, so the paragraph describes a rescue that the arithmetic prevents from ever running.

**instead:** When a piece of code carries two limits about the same event, convert them to the same unit and write the comparison down beside them as a sentence: this budget is longer than that timeout, and here is why that order is the safe one. Then assert the comparison in a test, because a constant is edited by somebody who can see only one of the two. And be suspicious of a give-up branch: it is the path taken when everything else failed, so it is the least exercised and the most likely to be the path actually taken if a threshold is wrong - measure how long the code really waits before reaching it rather than reading the count.

