---
id: wk-6cfb0f1acf
seq: "22"
type: work
title: a person orders work
status: closed
assignee: main
scope: single-step
traced: true
disposition: done
rounds: "1"
minted_by: person
---

## detail

The queue hands out the oldest open token, and oldest means the lowest seq.
Nothing can change that order, so a person who wants a different thing done
next has no way to say it.

Two facts make this bite. The engine refuses a status write by hand, saying
status is moved by a pull and not by a keystroke, which is right. And a token
already picked up comes back on the next pull, which is also right. Together
they mean an agent holding the wrong token cannot put it down and a person
cannot pull it forward.

WHAT A PERSON OWNS IS THE ORDER, and seq is where the order lives. So the verb
writes seq and nothing else:

    se work --first <id> --by person

It puts one token at the front of the queue. It is the person's, the way
opening a backlogged token is the person's, and the editor calls it when they
drag a row up.

WHAT IT DOES NOT DO is move a token between states. That stays with the pull.

## evidence: checked, and proved red

src/engine/token_test.go: TestPuttingATokenFirstIsRecorded builds the engine, mints two tokens, runs se work --first <id> --by person, and asserts the log carries the id, the phrase 'put first at seq', and actor person. I removed the inSession line and it failed with 'the record does not carry put first at seq', printing the log it read.

## evidence: checks

go test -count=1 ./... passes in src/engine (25.8s).

## evidence: round 1 finding 1, a flag accepted and thrown away

The finding was right. The --first branch was four lines and read neither --by nor the log. It now records, the way every other verb in that lane does: inSession with or2(*by, 'main') as the actor, and a message naming the token, the seq it took, and its title, with id and seq in the data.

## evidence: round 1 finding 2, what is owed

The finding was right and the answer is one sentence. THE ENGINE VERB IS BUILT AND THE EDITOR DOES NOT CALL IT. Nothing in src/extension calls --first, because dragging a row up needs a reorder gesture the editor does not have. The one drag handler there drops a row into a group and writes a field on the token, which is a different gesture with a different effect and predates this token.

## evidence: so the clause is not finished

The detail says the editor calls it when a person drags a row up. That half is not built. It belongs with the editor port, and it needs the row selection and drag work that wk-bb34ab1208 covers, so it is not a thing to bolt on here.

## evidence: what is built

se work --first <id> --by person writes seq and nothing else. PutFirst at src/engine/token.go refuses a closed token, does nothing when the token is already first, and otherwise takes one below the lowest live seq. TestAPersonPutsATokenFirst covers both, and pull_test.go pulls after PutFirst and gets the token that moved.

## evidence: why it has to be recorded

THE ORDER IS A DECISION AND EVERY DECISION IS IN THE RECORD. The queue hands out by seq, so a log that does not say who moved one cannot explain why the next pull answered what it did. That is written on the branch.

## finding 1 · round 1 · WHAT A PERSON OWNS IS THE ORDER, and seq is where the order lives. So the verb writes seq and nothing else: se work --first <id> --by person · by reviewer

**wrong:** THE --by IN THE TOKEN OWN COMMAND IS ACCEPTED AND THROWN AWAY, AND NOTHING IS RECORDED. The detail writes the verb as `se work --first <id> --by person`. The branch that implements it, lane.go:142-150, is four lines: PutFirst(roots, *first), answerJSON(t), return. It never reads *by, and it never writes to the log.

**satisfies:** RECORD IT, the way every other verb in that lane does. Add an inSession line to the --first branch naming who asked and what moved -- the token id, and ideally the seq it took, so the log explains the order the queue later hands out. Use or2(*by, "main") for the actor exactly as lines 90, 114 and 134 do, and then --by is doing the job the detail gives it.

## finding 2 · round 1 · It is the person's, the way opening a backlogged token is the person's, and the editor calls it when they drag a row up. · by reviewer

**wrong:** THE EDITOR CLAUSE IS NOT BUILT AND NOT MENTIONED. The detail says "and the editor calls it when they drag a row up." Nothing in src/extension calls it: grepping the TypeScript for --first, 'first' and "first" returns no call site, only unrelated words like showWarningMessage("Open a folder first"). There is no drag-to-reorder at all. The one drag handler in editor.ts sends `{ type: 'file', id: dragging, sets: g.dataset.sets, into: g.dataset.into }`, which drops a row INTO A GROUP and writes a field on the token. That is a different gesture with a different effect, and it existed before this token.

**satisfies:** SAY WHAT IS OWED, IN THE SUBMISSION. One sentence is enough: the engine verb is built and the editor does not call it yet, because dragging a row up needs a reorder gesture the editor does not have. That is a passing answer -- work done, plus what still owes it -- and it is the difference between a token that is finished and one that only looks finished.

