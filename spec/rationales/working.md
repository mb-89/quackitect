---
kind: [[rationale]]
explains: [[spec/guidance/working]]
---

# Why

The owner's word moves the session, and the work in flight yields to it. The two
faults below are one rule read from two ends.

| the fault | what it costs |
|---|---|
| the session finishes its command first | the answer lands late, against a stale command |
| the session stops to ask what comes next | the owner decides again what they settled already |

Read this note again on either sign:

- a session carries on where a person wanted it to wait, twice
- the stop table and this note disagree about what ends a turn

## 1. The prompt outranks the call

An owner interrupted a session four times in one afternoon. Each time the
session finished the command it stood inside first.

The answer arrived a minute late, and twice the command it finished had become
the wrong command. So the prompt lands before the next call.

## 2. Saying it back is cheap

A session reading the prompt wrongly spends the rest of the turn on the wrong
work. The owner sees that reading in one sentence and in no tool output.

So the answer opens with the reading and the plan. One sentence buys the owner
the chance to stop a wrong turn at its start.

## 3. The named step runs

A session naming its next step and then stopping hands the owner a plan and no
work. The owner reads the plan, says yes, and the session does what it already
said it would do.

That round costs a turn and buys nothing. So the step a session names as next is
the step it takes, in the same turn.

## 4. A piece opens the next

A session stopping after one piece hands the owner a decision they made when
they set the work. The group's ask is the queue, and it already says where the
work ends.

So the session carries on to that end. The three grounds below are the exits.

A wait is no exit either. A session stood still for most of an hour with two
helpers running. The commit verb staged the whole tree, so each landing ran one
round:

1. it asked every helper to hold
2. it waited for each reply
3. it set their files aside, committed, and let the helpers go

The queue held a ticket and the Problems panel held findings the whole time, and
the owner found the session idle.

The cost doubles, because a held helper waits too. The work standing free
needed no answer from anybody: a ticket, a todo, a finding. So the rule names
where the next item stands, and the waiting hand takes it.

## 5. Three grounds and no others

An open list of reasons to stop grows one reason at a time, and each one reads
sensible on its own day. So the list closes at three.

| the ground | who opens it |
|---|---|
| a discussion opens | the owner |
| a mistake here is dear to undo | the work |
| the work stands complete | the ask |

The stop table under [[spec/design_output/stop]] holds the same three
mechanically, so the hook and this note answer alike.

The middle ground read "going on needs what only a person gives" until a box
took it at its word. A person gives anything, so that ground admitted anything.
Two sessions handed out calls they owned, and [[spec/rationales/cloud]] carries
what that cost.

Version four wrote the test this ground wants, and `spec/guidance/behaviour.md`
on the `v4` branch holds it:

- Spend your thinking where a mistake is dear to undo. Where it is cheap, decide and move.
- Disagree and commit. Write the concern where a reader decides it, and continue.

The second names the move a stop stands in for. A concern is a note, and a note
survives the turn. An argument inside the turn reaches nobody.

Version three split the question into two dials, and `deliverable/machines` on
the `v3` branch holds both:

| the dial | what it answers |
|---|---|
| autonomy | what the agent decides alone |
| stop-at | how far the agent walks before it hands back |

That note names why one rule struggles here. A stop hook reads where the walk
stands and sees no reason, so a stop the contract wants reads like an
overcautious one. The cost of a wrong answer is the reading a hook can share.

## 6. The answer already owed

A session that answers the owner and then reports again writes the same thing
twice. The owner reads the second copy for news and finds none.

So what the session has done goes into the answer it already owes. One answer
carries the reading, the plan and the result.

## 10. Trivial goes in

A branch tripping over a fault either fixes it or carries it forward.

| the fault | what happens |
|---|---|
| trivial | costs a line, and a reader tells it from the ask at a glance, so the fix goes in |
| deeper | costs the ask, burying work nobody asked for under work nobody asked for, so it becomes a finding, and the code stands |

A warning marks a break of form, and the write lands over it. The warning
stands in the Problems panel, and the push waits until the panel stands clear.
For details, see [[spec/design_output/level0#the-panel-holds-a-warning]].

Sessions still wrote the same file again to clear its warning, since a warning
looked like a trivial fault tripped over. Each rewrite cost a round trip, and
the ask waited behind form. A refactoring hand once drained the warnings beside
the session. The owner took it out, because the panel holds the one list and
whoever pushes cleans it. So a warning stands, the work goes on, and the push
clears the panel once, before anything leaves the box.

## 11. The owner reads an ask

An ask leaving for the cloud becomes the whole job of a session nobody watches.
One wrong line in it spends a box.

So the owner reads the ask before it lands. That costs one reading, and it buys
back every session the ask would misdirect.

## 14. One place owns a thing

A tree writes one concept in three places, and the three drift. Each reader
meets one of them and works from it. Two of the three then teach something the
tree stopped meaning, and nobody reads the disagreement, because nobody reads
all three at once.

The measurement stands in this tree. `engine.autonomy` reached five wordings
across the schema, two design outputs and two tickets. It carried no value in
`spec/config/level0.json` and no reader in any module. Five places described a
thing that no code kept.

A second wording costs more than a second copy. A copy of a line breaks a search
for that line, and the search finds both. A rewording of an idea breaks nothing
a search sees, so it survives and drifts.

## 15. Assert nothing you leave alone

Ownership and duplication are one thing seen twice. A place describing what it
owns states a fact. A second place describing that same thing states a guess
about somebody else's work, and it ages the moment the owner moves.

The aside costs more than the copy, because nothing links it back. A hand
changing a folder reads the notes that folder owns. It reads no ticket that
described the folder in passing, to ground a choice about something else.

This tree measured it twice in one session:

| the sentence a draft wrote | what the review answered |
|---|---|
| `spec/config` holds a folder for each thing a projection reads | the stop door and Vale read two of them, and a projection writes a third |
| each folder under `spec/config` answers to one reader | one of them answers to three |

Neither sentence carried the ticket's own answer, which was the path an icon
stands at. Both stood to ground a choice, and a reader acted on neither.

So the rule reads as bounds, and it asks one question before a sentence lands:
does a reader act on this? A reader wanting the mechanism reads the note owning
it, and a rationale holds the argument. A hand writing what a reader acts on
writes less, and ages none of it.
