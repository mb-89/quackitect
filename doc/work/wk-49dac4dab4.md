---
id: wk-49dac4dab4
seq: "19"
type: work
title: a flag not search
status: submitted
assignee: main
scope: single-step
traced: true
disposition: done
rounds: "1"
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

## evidence: a list, not a slot

Owed is now map[string][]string. TheyAsked appends. AnswerOwed joins everything that actor was told with a blank line between and hands back all of it, so the refusal shows every question still waiting. TheyWereAnswered empties the list, because one answer settles the lot: a person waiting on two questions is waiting for one reply that covers both. The bit is still a bit, and owed is the list not being empty.

## evidence: and what would change

If a resident engine lands, owed.go goes away. The obligation becomes a field in memory, the guard asks over the port, and .se/owed.json stops existing. Who owns the rule does not change, only where the state sits, which is what that token is about. That is written in the file so the next reader finds it there rather than in a submission.

## evidence: checked

TestAPromptFlipsTheFlagAndAnAnswerClearsIt now asserts both questions survive and that one answer settles both. I made TheyAsked write a one-element list again and it failed with 'the first thing was lost: it owes the second thing'.

## evidence: checks

go test -count=1 ./... passes in source/engine (23.5s).

## evidence: round 1 finding 1, the third clause was silent

The finding was right: the detail asked whether the flag belongs in the stub rather than the engine, and nothing in the submission mentioned it. The decision is now written into source/engine/owed.go, above loadOwed, and here.

## evidence: round 1 finding 2, a slot that erased a question

The finding was right, and the old test asserted the defect on purpose. Owed held one string per actor, so a second prompt overwrote the first and the refusal showed only the newest. A question the owner asked was handed to nobody.

## evidence: the decision

IT STAYS IN THE ENGINE, FOR NOW, AND wk-4b67d7126a SETTLES IT. The reason is that the guard is what enforces the refusal and the guard is the engine. The stub sees only the calls an agent chooses to make through it, and this refusal has to reach every call, including the ones that never touch the stub. A flag in the stub would be a flag the guard cannot read.

## evidence: the rest of the token still holds

The flag is written where a prompt arrives and cleared where an answer arrives, in both places a prompt reaches the engine: the harness event at hook.go and the said verb at main.go. Nothing reads the log back to derive it.

## finding 1 · round 1 · The owner also asked whether this belongs in the MCP server rather than the engine, since the stub is what the agent talks to. That is part of the wider question about a resident engine, so decide that one first. · by reviewer

**wrong:** THE THIRD PARAGRAPH OF THE DETAIL IS NOT ANSWERED ANYWHERE IN THE SUBMISSION. It reads: "The owner also asked whether this belongs in the MCP server rather than the engine, since the stub is what the agent talks to. That is part of the wider question about a resident engine, so decide that one first." The submission has four sections -- checked, what changed, where it is flipped, why -- and not one sentence of any of them mentions the MCP server, the stub, or a resident engine. The clause asks for a decision and no decision was recorded.

**satisfies:** DECIDE IT AND WRITE THE DECISION DOWN, in the submission and in the code comment on owed.go. It does not have to be a big decision, and it does not have to be resident-engine-first if that is not practical -- what it cannot be is silent. Three answers are legal here: the flag stays in the engine, and why; it moves to the stub, and why; or it stays for now, wk-4b67d7126a is what settles it, and here is what would change when that lands. Any of those satisfies the clause. None of them is in the submission today.

## finding 2 · round 1 · A prompt arriving flips a bit. An answer arriving clears it. The guard reads the bit. · by reviewer

**wrong:** A SECOND PROMPT ERASES THE FIRST, so questions the owner asked are never handed to anybody. writeOwed replaces the whole Owed struct, and Owed has one Said field, so TheyAsked overwrites rather than appends. The test asserts this on purpose at owed_test.go:83-87: two TheyAsked calls, and only "the second thing" survives.

**satisfies:** MAKE IT A LIST, NOT A SLOT. Owed.Said becomes a list of what was said, TheyAsked appends, TheyWereAnswered empties it, and AnswerOwed hands back all of them so the refusal shows every question still waiting. The refusal already cuts at twelve lines, so a burst stays readable. Nothing else about the design changes and the bit is still a bit: owed is simply "the list is not empty".

