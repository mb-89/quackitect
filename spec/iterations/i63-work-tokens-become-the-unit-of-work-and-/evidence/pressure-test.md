---
form: pressure-test
amended: 2026-08-25T18:41:46.354Z by agent — Q11 was defeated with a false premise, so its answer is gone and the attack is open again
by: agent
signed_off: 2026-08-25T17:59:41.977Z
authors: agent
files: null
---

# Evidence form / pressure-test

## current_situation

The vision, the register, the actual, the delta and the boundary all stand. This state attacks them before the gate.

THE HOSTILE FAQ WAS WRITTEN BY A SEPARATE HAND, on the owner's instruction. An adversarial reviewer was spawned, given the whole framing and none of the reasoning behind it, and told to attack the load-bearing parts rather than the edges. It returned seventeen questions, a kill criterion and an honest list of what its attack did not dent. The answers below are the walker's.

THE METHOD DOES NOT ASK FOR THAT SEPARATION, and it should. Checked: the PR-FAQ card names no hand, and the matrix row records the state as filled by the agent with no reviewer. The argument for separation is written one state earlier, in the spawn state's own motivation, and nothing acts on it. Captured as a note.

THIS FORM WAS HELD UNSTAMPED UNTIL THE OWNER HAD READ THE ANSWERS AND ADDED THEIR OWN, and it is signed now.

## prfaq

### The press release, written from ship day

QUACKITECT NOW MODELS EVERY PIECE OF WORK AS A TOKEN.

Every work token this system carries is now one small file. A document to read, a step to take, a result to produce, an idea parked for later: all the same object, in one place, with the same fields and the same verbs.

WHAT THAT CHANGES FOR THE PERSON. Open a state machine and every state carries small counts. Two on the left means two things still to take in. Three on the right means three still to produce. A state with nothing along its top is finished, and that reads at a glance with nothing to interpret. Click a count and a table opens beside the machine, one row per work token. Drag a row onto a state and it lands there.

WHAT THAT CHANGES FOR THE AGENT. Pulling returns the work still open where it stands. It takes one, writes the result into that item, and settles it. Inside a record the finished item IS the evidence, so nothing is copied anywhere afterwards. An item only a person can settle says so on its own face, and the agent stops there without consulting a list of acceptable reasons.

WHAT THAT CHANGES FOR THE ENGINE. A method's steps arrive as work tokens rather than as prose. A step left undone is an open item, and an open item holds its state.

A MAINTAINER SAID: "I could not see what the system owed me. It was spread across three places and no screen put them together. Now there is one number per state and I can drag work onto it."

### The hostile FAQ

Seventeen attacks from a separate adversarial hand. Each carries the attack, the answer, and where the answer came from. The owner ruled on twelve of them directly.

### Q1. What runs when a token's status goes terminal?

ATTACK. A submit runs checks and signs. A status field runs nothing, so the agent that owes the work writes the field saying it is finished.

ANSWER, OWNER RULING: the attack rests on a wrong picture of submit. Submit has no intelligence of its own today and will have none then. It checks that the parts are done, and nothing more. THE INTELLIGENCE SITS IN THE PART. A token carries an evidence part which is either something a hand must judge or a reference to a script, exactly the split that evidence fields have now. A token whose evidence is a script runs that script to settle. Nothing is lost relative to submit, and mechanical tokens were in the design from the start.

### Q2. `skipped` is terminal, so how does nothing-skipped-in-silence follow?

ATTACK. Any terminal status satisfies the exit rule, so a state exits with every work token skipped, legally, in one pass.

ANSWER. The claim is about silence and not about refusal, and the owner's ruling on Q13 sharpens it: CLOSING A TOKEN ALWAYS CARRIES A SHORT WHY. Closing successfully makes that trivial to write. Closing any other way does not. So a skip is a durable file carrying a status, an author, a moment and a stated reason, which is the whole distance from prose that records nothing.

### Q3. Do heading-minted and field-minted tokens double every work token?

ATTACK. Minting from both sources promotes the authored-twice problem into countable objects with independent identity.

ANSWER, OWNER RULING: a token can be closed AS A DUPLICATE, referencing the one it duplicates. The duplicate is detected and closed rather than prevented.

THE OWNER ACCEPTS THAT TRADE EXPLICITLY. No mechanical prevention exists short of judgment by a hand or a person, and duplicates will happen. If something mechanical can help a judge notice one, it is welcome and it is not the mechanism.

WHAT IS STILL OWED, and it is small: where the noticing happens. The count is inflated until somebody judges, and the count is what the surface shows.

### Q4. What happens to a claim sent back for rework?

ATTACK. The claim is terminal, terminal satisfies the exit rule, so a re-entered state exits without looking.

ANSWER, OWNER RULING: REOPENING A STATE REOPENS ITS TOKENS. Re-entering a state that was never reopened does not invalidate anything, and the two acts are different on purpose. The rules differ again between ephemeral and persistent tokens.

The design input already carries this. What it owes is a clearer statement further down in the design, not a new mechanism.

### Q5. The completeness ruling rests on states never being reused. Is that true?

ATTACK. Escaping and returning finds the same tokens waiting, so states are re-entered and the premise is contradicted inside the design.

ANSWER. The batching objection is that holding this batch delays the NEXT batch queueing behind it. A re-entry resumes the same batch and queues no other. So no second batch is delayed and the ruling stands.

THE WORDING IS CORRECTED. The register entry should say no second batch ever queues behind the first, which is the claim actually being made.

### Q6. Can scope be laundered into PENDING?

ATTACK. The kickoff may change place but not status. Pending does not block. So empty the state into pending, exit, work token gone.

STATUS: OPEN, AND IT IS THE ONE THING STILL TO DISCUSS. The owner has not yet taken this point and asked to talk it through. Nothing is assumed here in either direction.

THE NARROW QUESTION, so the discussion starts from the right place: pending is defined as not blocking, and it was specified for the backlog rather than for a state. If an work token a state owed can be moved into pending, the state exits without it. If it cannot, that restriction has to be written somewhere, because nothing today says it.

### Q7. A method card is edited between two entries. What happens to its tokens?

ATTACK. Reading evidence is keyed to the file version. Headings and fields carry no such key, so a rename orphans or duplicates.

ANSWER, OWNER RULING: A TOKEN GETS AN ID WHEN IT IS MINTED. A token somebody writes by hand without one takes the next id the first time the engine touches it. Identity therefore never depends on the heading text.

### Q8. Does the pull run every mechanical script?

ATTACK. If it does, the hottest verb becomes side-effecting. If it does not, `open` is a stale label.

ANSWER. A mechanical token is asked while it is open, settles when it answers, and is not asked again. The pull therefore runs only the scripts of tokens still open in the state being pulled, which bounds the cost to that state.

THE SNAPSHOT PROPERTY IS THE POINT rather than a concession. A settled question that re-opens whenever its source moves is the failure this design was argued from.

### Q9. May the working agent flag its own token as needing a person?

ATTACK. Fixed at mint, it misses mid-work discoveries. Settable by the worker, stopping is self-service.

ANSWER, OWNER RULING: YES, the working agent may set it. The safety is bought back by the act being recorded. Today an unsanctioned stop happens in chat, where the engine cannot see it and nothing counts it. A flag raised on a token is a durable file with an author and a moment.

### Q10. Who knows a token's complexity, and what happens when they are wrong?

ATTACK. Complexity is set by somebody who has not seen the instance, so a weak hand gets a hard token or every author marks everything high.

ANSWER, OWNER RULING: complexity can be raised when the work turns out harder, and the owner does not weigh this as important. It is a refinement rather than a hole, and it is not treated as blocking the design.

### Q11. Reading tokens shadow a separate store, so is the one-unit claim false there?

ATTACK. Either the agent settles the reading token directly and the guarantee dies, or the token mirrors a foreign store.

THE ANSWER GIVEN HERE IS WITHDRAWN, and the attack is open again. It said the token is the work token while a GLOBAL store holds the proof. There is no global store. deliverable/engine/sessionreads.ts line 88 says a proof belongs to the reading hand and never to the record, and line 98 says the ledgers do not survive a restart.

SO THE ATTACK STANDS AS PUT. A durable input token would mirror a proof that dies with the session, which is the second horn the attacker named. What survives of the answer is only that the probes settle the token and the agent cannot assert past them.

WHAT IS OWED: a proof store that outlives the session, or an explicit ruling that a reading token is re-owed on every restart. Neither is written.

### Q12. Where does the order of numbered steps go?

ATTACK. Numbering carries a dependency graph for free, and minting headings as tokens turns an ordered procedure into an unordered bag.

ANSWER, OWNER RULING: THE ATTACK ASSUMES NUMBERING IS A TECHNICAL DEPENDENCY AND IT IS NOT. The dependency system already exists and is planned. Where one step genuinely needs another finished first, that edge is written. Where it does not, the steps may run in parallel, and deriving an edge from document order would serialise work that has no reason to be serial.

SO THE DEFAULT IS DELIBERATE. Order that matters is stated; order that is merely how somebody typed it is not preserved.

### Q13. What are the cancelled and rejected tokens sitting in the record folder?

ATTACK. They are files containing claims somebody made and withdrew, and a verdict must cite the sentence it rests on.

ANSWER, OWNER RULING: CLOSING A TOKEN CARRIES A SHORT WHY, always. For a successful close that is trivial. For any other close it is not, and writing it is the act that makes the closure legible to a later reader.

WHAT REMAINS is enforcing the status filter where evidence is resolved rather than in the reader's head, which the why makes cheap rather than replacing.

### Q14. What does the count actually measure?

ATTACK. It measures how finely an author cut their headings, and nothing carries magnitude.

ANSWER: ACCEPTED, AND A CLAIM IS WITHDRAWN. The design input says the count answers the sizing question without needing a size scale. That is too strong. The count is a count of work tokens, and work tokens are an authoring decision.

WHAT IT IS STILL GOOD FOR: how much a state owes right now, and watching one record's number fall as it is worked. Not for comparing two records.

### Q15. In what unit is the debt-reduction budget denominated?

ATTACK. The model has no effort scale, so a small budget of small items cannot be expressed in its own vocabulary.

ANSWER, OWNER RULING: THE UNIT IS A STEP. It is not money and not a count of tokens. One of the build steps is always debt reduction, and that is the whole budget. The attack looked for a scale where the answer is a slot.

### Q16. Outside a record, deletion is silence. Where did the claim go?

ATTACK. Ephemeral tokens are deleted at state completion and by a restart, and most states are outside records.

ANSWER: ACCEPTED. Inside a record nothing is skipped in silence, because a skip is a durable file carrying its reason. Outside a record the guarantee is that a state cannot be LEFT with work open, and the trace does not survive. The goal should say which half it means.

### Q17. Is the overview benefit claimed and disclaimed in the same document?

ATTACK. The actual says work is spread across three stores with no overview, and the non-goals leave the private-note question undecided.

ANSWER, OWNER DIRECTION: there will be a separation, and the shape is named. If notes become tokens they become PRIVATE work tokens, kept somewhere other than the public ones. The owner sees no reason against it.

SO THE OVERVIEW CLAIM IS QUALIFIED RATHER THAN DROPPED: one model with one vocabulary, across two stores. That is what the earlier reasoning already said privacy costs, and the contradiction closes as soon as the claim says so.

## findings_folded

A LIST, ONE FINDING PER LINE, on the owner's ruling that findings are not free prose. Each carries its disposition.

WHO PICKS THEM UP: gate-requirements. Every finding here is answered by a requirement of this iteration, and that gate checks it. This is the same mechanism the owner ruled for register entries, so the two collapse into one check rather than two.

### Answered by an owner ruling, no change owed

- A token's evidence is either judged or a script, so settling runs the check. Submit never had intelligence of its own.
- A duplicate token closes as a duplicate and references the one it duplicates.
- Reopening a state reopens its tokens. Re-entering a state does not.
- A token gets an id when minted, and a hand-written one takes the next id when the engine first touches it.
- The working agent may flag its own token as needing a person.
- Complexity is raised when work turns out harder, and this is a refinement rather than a hole.
- Numbering is not a technical dependency. Order that matters is written as an edge; order that is merely typed is not preserved.
- Closing a token always carries a short why, trivial on success and not trivial otherwise.
- The debt-reduction budget is denominated in steps: one build step is always debt reduction.
- Notes become private work tokens in a separate store, so one vocabulary spans two stores.

### Answered by the walker, no change owed

- A mechanical token is a snapshot: asked while open, settled when it answers, never re-asked.
- WITHDRAWN, AND MOVED BACK TO OPEN. The reading-token answer rested on a global proof store that does not exist. The probes still settle the token, and where the proof lives across sessions is unanswered.
- The completeness ruling survives, because a re-entry resumes the same batch rather than queueing a second.

### Corrections owed to text already written

THREE OF THESE FOUR DID NOT LAND WHEN THEY WERE FIRST RECORDED, and an independent reviewer reading the tree found them still standing days later. All four have landed now. The lesson is recorded rather than tidied away: a correction written into a findings list is not a correction until somebody opens the file that carries the sentence.

- The register entry on completeness says positions are never reused, and should say no second batch queues behind the first.
- The design input claims the count answers the sizing question. Withdrawn: the count measures work tokens, which is an authoring decision.
- The vision's goal claims nothing is skipped in silence. It holds inside a record and not outside, and should say which.
- The overview claim is qualified to one model across two stores, rather than one store.

### Rules the design still owes

- Where a duplicate is noticed, since the count is inflated until somebody judges.
- Enforcement of the status filter where evidence is resolved, not in the reader's head.
- A clearer statement of reopen against re-entry further down in the design, and how it differs for ephemeral and persistent tokens.

### Open, and the only one still to discuss

- Whether an work token a state owed can be moved into PENDING and therefore leave the state without being settled. Pending does not block and was specified for the backlog. Nothing today forbids the move, and the owner has asked to talk it through.

### What the attack did not dent

- Place and status as separate axes, which the adversary called the real invention.
- Reading evidence keyed to the file version, which it said should be the template for the other sources.
- Ephemeral outside a record and persistent inside.
- One file per token against the industry evidence, because merge pressure tracks concurrent writers and this repository has about one.
- The user bucket that dies when emptied.
- Dependency on a state finishing, as distinct from token to token.
- The case for removing the narration machinery, which stands on its own evidence and does not need this design to be right.

## follow_up

ONE THING IS STILL OPEN AND IT IS A CONVERSATION, not a blocker: whether an work token a state owed can be moved into pending and leave the state unsettled. The owner asked to talk it through and nothing is assumed either way.

FOUR CORRECTIONS ARE OWED TO SIGNED TEXT and each is a reopen rather than an amend, because each changes what a state below must answer.

- The completeness wording, in a register entry named by log-risks.
- The sizing claim, in the design input the kickoff gate pulled in.
- The silence claim, in the vision packet's goal system.
- The overview claim, in the actual.

THEY ARE NOT FOLDED HERE. Folding them is scope, and scope waits for the owner's go.

GATE-REQUIREMENTS CARRIES THE PICK-UP for everything above. Every finding is answered by a requirement of this iteration and that gate checks it, on the owner's ruling. The same check covers the register entries, so one mechanism serves both.

THE PRESSURE TEST WAS RUN BY A SEPARATE HAND and the method does not ask for that. Captured as a note, with the evidence that the argument for it is already written one state earlier and nothing acts on it.

## anything_else

