---
form: draft-vision
amended: "2026-08-25T18:32:44.921Z by agent — an independent reviewer found the withdrawn positions-never-reused wording still standing here, and the read-evidence claim resting on a comment rather than on the code"
by: agent
signed_off: 2026-08-25T17:10:14.753Z
reopened: "2026-08-25T17:09:44.825Z — the goal list led with a quality instead of the goal — the owner ruled the goal is that every piece of work is modelled as a token that the engine, the agent and the person all understand"
authors: agent
files:
---

# Evidence form / draft-vision

## current_situation

The kickoff gate is signed and blessed at major. The walker count is zero, so the guide walks this record with the owner beside it.

THE OWNER STATED THE VISION IN THEIR OWN WORDS: implement the work token system. It touches a great many parts of this product. The two largest are the state machines and the token editor, and everywhere else work is done is touched as well. Proving nothing is missed is the architecture analysis's job later in this iteration.

THREE ARTIFACTS CARRY THE DETAIL and this packet rests on all three.

- research/design-input-from-the-owner.md is what the owner ruled, captured live while they walked the machine position by position. It is 1,105 lines and it has been read whole.
- design/worktokens.excalidraw.svg is the editor's specification. It is a drawing and it is deliberately not transcribed, by owner ruling.
- research/prior-art-by-sketch-element.md is twenty primary sources arranged by which part of the sketch each one judges.

WHERE THEY DISAGREE, THE OWNER'S FILE WINS. The prior art is evidence; the rulings are decisions.

## big_idea

Every piece of work here is one small file a person can open and edit, and each one says plainly whether it is still owed.

Nothing gets skipped by accident, because an unfinished piece sits where it was put and holds that place open until somebody settles it.

## to_be_world

THE MAINTAINER OPENS THE MACHINE and sees small counts on each position. Two on the left mean two things still to take in. Three on the right mean three things still to produce. A position with nothing along its top is finished, and that reads at a glance with nothing to interpret.

THEY CLICK A COUNT. A table opens beside the machine, one row per piece of work, columns holding whatever that piece carries. Rows sit in groups, and a group folds shut when its header is clicked.

THEY DRAG A ROW OUT OF THE TABLE and onto a position on the machine. The places that will accept it appear while the row is in the air, including ones that were hidden a second earlier because they held nothing. They let go, and that position's count goes up by one.

THE DRIVING AGENT PULLS, and what comes back is the work still open where it stands. It takes one, writes the result into that piece itself, and marks it settled. There is no second act of copying the result somewhere else. Inside a record the finished piece IS the evidence.

A PIECE NOBODY BUT A PERSON CAN SETTLE CARRIES A FLAG SAYING SO. The agent reaches it, cannot close it, and stops. The maintainer answers, and the walk moves on. Nobody consulted a list of acceptable reasons to stop, because the reason is a fact about the work rather than a judgment about the moment.

A STEP OF THE METHOD CANNOT BE WALKED PAST. Each marked heading in a method arrives as its own open piece, so skipping one leaves it sitting there, and the position will not close over it.

AT THE END OF THE ROUND THE MAINTAINER LOOKS AT WHAT THE RECORD CARRIED. Fifty pieces here, sixty there, twenty on the third. Nobody estimated those numbers; they were counted from the work tokens that actually stood. The maintainer reads them as an indication rather than as a measurement, because a count of work tokens also tracks how finely somebody cut their headings.

## goal_system

THE GOAL IS ONE THING, and everything below it is a consequence.

EVERY PIECE OF WORK IS MODELLED AS A TOKEN. Not an entry in a list nobody can reach. Not prose an agent may or may not act on. A token, and the engine understands it, the agent understands it, and the person understands it.

THE TOKENS ARE THEN DISTRIBUTED OVER THE SYSTEM. Each one sits where its work belongs, and it carries the work that either a person or an agent has to do.

THAT IS THE WHOLE AMBITION. The pitch above says the same thing in the shape a stranger reads first, and this section is that pitch unpacked.

WHAT FOLLOWS FROM IT, in the order the qualities matter. None of these is a goal on its own. Each is something the modelling buys.

ONE. Nothing is skipped in silence, INSIDE A RECORD. Prose can be walked past and nothing objects; an open token cannot, and a token closed any other way than done carries a stated reason on a durable file. The measured failure behind this: an overhaul agent missed some of its own method's steps and nothing caught it.

OUTSIDE A RECORD THE CLAIM IS NARROWER and it is stated here rather than left to be discovered. Tokens there are deleted when the state completes, so what survives is only that a state cannot be LEFT with work open. The trace does not survive.

TWO. One unit for every kind of work. A thing to read, a step to take, a result to produce, a parked idea — the same object with the same fields and the same verbs. A count is then a count, and nobody learns two vocabularies.

THREE. Three parties share one understanding. The engine can compute over a token, the agent can be handed one, and the person can open the file and read it. That is why the modelling has to be a file rather than a row in a store.

FOUR. Work is routed by how hard it is. A cheaper hand takes simpler work, and the system says so out loud rather than pretending every hand is equal.

FIVE. How much a state owes right now is counted rather than guessed. The number falls out of the work tokens that stand.

IT IS A GOOD INDICATION AND IT IS NOT A PRECISE MEASURE. The count says how much a state owes right now, and that is worth having, because nobody has ever had the number. Tokens can move, and most of them never will, so movement does not undermine it.

WHAT IT ALSO TRACKS is how finely a method card's author cut their headings. So it is read as an indication rather than as a figure to compare two records with. An earlier draft claimed it answered the sizing question outright, and that stronger claim does not stand.

THE CONFLICTS, named and ruled.

READABILITY AGAINST MECHANICAL MERGING. A file per token is easy to read and hard to merge. An append-only log with derived state is the opposite. RULED FOR READABILITY: the readers here are the same people who commit, and one engine walks one record, so the merge pressure that drove other systems the other way is weaker here. THE DISSENT IS RECORDED RATHER THAN RESOLVED: five independent systems converged on the log, two mature projects rejected or abandoned files in the tree and published why, and the closest agent-built analogue moved to a database. That argument has to be made out loud, not assumed.

COMPLETENESS AGAINST FLOW. Holding a position until every token in it is settled sets the transfer batch to the whole position, which is the rule flow-based methods spend their effort avoiding. RULED FOR COMPLETENESS, on two grounds. No second batch ever queues behind the first, so nothing is delayed by holding this one; a re-entry resumes the same batch rather than queueing another. And a token has several ways to reach a settled state, including being moved elsewhere, so a position can never freeze on one thing nobody can finish.

PRIVACY AGAINST ONE NUMBER. A note is private and machine-local; a token lands on trunk where it can never be taken back. Making them one object would give the retro a single count and stop a note being a different kind of thing. NOT RULED. It costs two stores whichever way it goes, because private and committed are incompatible. This one is the owner's and it stays open.

SIMPLICITY AGAINST COVERAGE, in the surface. One editor widened with special cases eventually becomes the thing nobody dares change. RULED FOR ONE EDITOR ANYWAY: nineteen editors already stand, so learnability is the scarce thing here, and the failure this system has actually measured is divergent copies rather than an overgrown widget.

## moore_pitch

FOR teams who let AI agents carry out real engineering work inside a defined process,

WHO need every step of that process actually performed, and need to see at a glance what is still owed and what is finished,

THE WORK TOKEN SYSTEM IS A single unit of work — one editable file per work token —

THAT makes each work token block its own position until somebody settles it, so a step cannot be skipped in silence and a record's size is counted rather than estimated.

UNLIKE an issue tracker, where the process lives in prose that nothing enforces and where reading your own work needs the tool that stores it,

OUR PRODUCT derives the work tokens from the method itself and from the reading a position demands, and keeps them as plain files a person opens and edits directly.

## follow_up

THE VISION IS DRAFTED AND THE OWNER HAS NOT YET SEEN IT. They asked to take the steps of this phase one at a time, so this packet waits for their reading before anything is built on it.

ONE THING IN THE VISION IS NOT YET SUPPORTED BY THE DESIGN. The scene describes a row dragged from the table onto the machine, with hidden places appearing while it is in the air. Nobody has established that a drag can cross two panels in this host. The owner's own instruction is to spike it, and the kickoff gate records that as the first thing to do.

ONE NUMBER IN THE VISION IS UNMEASURED. The scene says fifty pieces here and sixty there. Nobody has counted what a real record owes. One script over an archived record answers it, and the surface cannot be designed honestly without the figure.

ONE GOAL IS DELIBERATELY UNRULED. Whether a private note becomes the same object as a public piece of work is the owner's, and it is stated as an open conflict rather than resolved quietly.

NOTHING IS PARKED. Everything this state found is either in the goal list above or already standing at the kickoff gate.

## anything_else

THE PITCH BELONGS ABOVE THE GOAL LIST, and this form asks for them the other way round. Owner ruling: the pitch carries the big picture better than a list of qualities does, so the goal system reads as an unpacking of the pitch rather than as the place the ambition is first stated. Reordering the form's fields is a change to the template rather than to this record, and it is captured as a note.

WHY THE FIRST DRAFT OF THE GOAL LIST WAS WRONG, recorded because the correction is instructive. It led with "nothing is skipped in silence", which is a quality the modelling buys rather than the thing being built. A reader would have taken the ambition to be a stricter process, when the ambition is a different representation of work.

WHY THE CONFLICTS ARE STATED RATHER THAN SMOOTHED. Three of the four have a real argument on the other side, and two of those arguments come from systems that shipped and then changed their minds. A goal list that hid them would read as more confident and be worth less.

WHAT THIS PACKET DOES NOT DO. It does not describe the editor. The editor's specification is a drawing, at design/worktokens.excalidraw.svg, and the owner has ruled that nobody rewrites a drawing into prose. The scene above says what a person does with the editor; it does not say what the editor looks like, and it must not.

THE ONE SENTENCE TO KEEP if everything else is forgotten: every piece of work is a token, and inside a record a finished token IS the evidence.
