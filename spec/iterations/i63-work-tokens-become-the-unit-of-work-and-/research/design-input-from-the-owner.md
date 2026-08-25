---
id: i63-design-input
type: research
statement: The owner's design input for work tokens, captured as given, state by state.
---

# Design input from the owner

Captured as the owner gave it. This file grows as the walkthrough continues.

## Rulings on the sketch itself

### The unit stands

Every piece of work is a token, and a token is a markdown file.

THE OWNER DREW A LINE UNDER THE BEADS WARNING. What beads tells agents not to
do is keep a task LIST inside a markdown file. That is a different thing and it
would be insane. One markdown FILE PER WORK ITEM is not that, and it is the
point: the file carries frontmatter and prose together.

### Defaults are inert until somebody accepts them

A template holds the defaults. They are written into a new token AS COMMENTS.

Creating a work item, you still have to decide to keep them. Acceptance is an
act, not an absence of an act.

That is the prefill rule applied to tokens: a prefilled value stays inert until
the person confirms it.

### Evidence may be a reference

A token's evidence can point at another markdown file rather than containing it.

### Size is parked

Tokens will have different sizes. T-shirt sizes are acceptable if they earn
their place.

THE OWNER'S DOUBT, recorded because it is the stronger argument: if work needs
doing, it needs doing, and how big it is may change nothing. Parked rather than
adopted.

### Complexity stays, and its purpose is ROUTING

Complexity exists so weaker agents can be sent to lower-complexity work.

THIS IS NEW AND THE SURVEY DOES NOT COVER IT. Human teams never routed work by
difficulty to less capable people and said so out loud. Agents make that both
possible and sayable.

So complexity is a routing key, not an estimate. It needs as many values as
there are hands to route to, and no more.

### Priority stays, as a marker

The owner disagrees that priority is position in a bucket. It is a label, and
you sort by it.

At minimum a marker for high priority is wanted.

### Frontmatter: required keys from the template, open beyond it

The template holds the keys that are required. Anything else may be added
freely. Unknown keys are ignored.

### Settled has three exits, not two

A token stops blocking its position when it is DONE, CANCELLED, or MOVED TO
ANOTHER STATE.

The third is the owner's addition and it matters: an unfinishable token does not
have to be cancelled, it can be carried forward.

## BOOT — walked state by state

### `start` carries nothing of its own

No guidance written at `start`. It inherits.

Refusals is pulled in because every state needs it.

### Every session start mints ONE EPHEMERAL TOKEN

The token is: read `refusals.md`.

Closing it means producing the evidence the reading proof already asks for.

When every token in the state is closed, the state may be left.

### An ephemeral token is DELETED when its state is done

The state finishing is what deletes it.

WHAT IS NOT DELETED IS THE EVIDENCE. The proof that the reading happened
survives. Only the token goes.

### `read_contract` is removed

The contract reaches the agent through the system prompt. A state that asks for
it again is asking for something already delivered.

### Boot becomes ONE state

Not a submachine. One state, and it is called `boot`, not `prepare_desk`.

### Boot has no method card and no guidance

It is purely mechanical, so there is nothing for a person to read and nothing
for an agent to judge.

### MECHANICAL TOKENS

A mechanical token is one the engine can settle by itself.

Asked for its state, the engine computes whatever it computes and gives back
what came out.

**THE TIMING IS THE RULE. A mechanical token runs its script WHEN IT IS ASKED,
never when it is created.**

Once the mechanical tokens are green, boot is passed.

## Priority is settled: a FLAG

A priority flag is enough. Not a scale.

## THE TWO SLOTS — the core mechanic

Every state has TWO SLOTS.

- THE INCOMING SLOT holds what must be taken in before the state can be worked.
  Guidance and reading land here.
- THE OUTGOING SLOT holds what must be produced before the state can be left.
  Evidence lands here.

A state may have tokens in one slot and none in the other. The front desk has
incoming tokens only, and nothing in its outgoing slot.

## READ EVIDENCE IS GLOBAL, AND THE TOKEN IS NOT

Reading a document produces evidence, and that evidence is stored GLOBALLY.

ENTERING A STATE TWICE DOES NOT MEAN READING TWICE. Arriving at the front desk
a second time asks for nothing that was already proven.

SO THE ENGINE MINTS A READ TOKEN ONLY WHERE THE EVIDENCE IS ABSENT. On entering
a state it works out which reading that state requires, checks what is already
proven, and builds tokens for the remainder and nothing else.

THIS IS WHY DELETING AN EPHEMERAL TOKEN LOSES NOTHING. The token is per-entry
and disposable. The evidence is global and durable. The two have different
lifetimes on purpose.

## A CONSTRAINT ON WHAT A STATE CARRIES

State guidance is long, and much of it is provenance: owner rulings, dates, what
a rule used to say, why it changed. None of that is actionable by the reader
who arrives.

THE RULING ALREADY EXISTS AND IS NOT HELD. i61 cleaned this up and it grew back
within the session. i59 is the iteration that settles it: provenance,
argumentation and superseded text leave every describing surface for git
history, a decision entry, or a rationale node.

WHAT i63 OWES IT: a state should carry only what its reader must act on. If
tokens are what a state hands out, then the bloat has somewhere else to go, and
this is the round that can make that true rather than asking people to be
disciplined.

MEASURED, and it is the agent's own doing: this session wrote dated provenance
and owner rulings directly into the refusals page, the contract and two design
specs. The rule was known and the writing broke it anyway, which is the argument
for a mechanism over a sentence.

## THE PULL RETURNS TOKENS

Today the pull hands back an instruction, and a reading request is one of the
shapes it can take.

IN FUTURE THE PULL MINTS A TOKEN AND HANDS THAT BACK. Pulling returns the open
tokens. That is what pulling means.

The reading request stops being a special shape of answer and becomes an
ordinary incoming-slot token like any other.

## READ EVIDENCE IS ALREADY VERSION-KEYED

The engine already keys read evidence to the version of the file, and a changed
file brings the requirement back.

NOTHING NEW IS OWED HERE. This design does not have to solve it.

## A METHOD'S STEPS BECOME OUTGOING TOKENS

THE FAILURE THAT DRIVES THIS, and it is measured rather than imagined: an
overhaul agent was run and it missed some of the method's steps. Nothing caught
it, because the steps were prose in a document and prose does not refuse.

THE MECHANIC. Sections of a guidance document, marked in some agreed way,
CREATE WORK TOKENS when the state is entered.

SO A STATE'S TWO SLOTS FILL FROM TWO PLACES.

- THE INCOMING SLOT comes from the reading the state requires, minus whatever is
  already proven.
- THE OUTGOING SLOT IS DERIVED FROM THE METHOD. Every step in the method becomes
  a token, and each one owes its own evidence.

WHAT THAT BUYS. A step cannot be skipped, because a skipped step is an open
token and an open token holds the state. The method stops being advice and
becomes structure.

WORKED ON THE OVERHAUL. Its method card names seven steps: inventory, run the
machines, sweep against the rules that changed, mark every candidate, split the
findings, bring the rulings to the owner, execute what was ruled. Seven outgoing
tokens, seven pieces of evidence, and no way to reach the end with one missing.

THE MARKING FORMAT IS OPEN and the owner has not settled it.

THIS ALSO ANSWERS THE GUIDANCE BLOAT. Once the actionable half of a document
becomes tokens, whatever is left is visibly not actionable, and the split stops
depending on anybody's discipline.

## EPHEMERAL IS THE DEFAULT. A RECORD IS THE EXCEPTION

Everything is ephemeral unless the walk is inside a record.

So boot's tokens, the front desk's, the overhaul's and the retro's are all
ephemeral. They are minted on entry and gone when the state completes.

TOKENS INSIDE AN ITERATION OR AN EXPEDITION PERSIST. They belong to that
record, they live in its folder, and they are the record's account of what it
owed and what it produced.

THIS ANSWERS THE GROWTH QUESTION OUTRIGHT. Nothing outside a record accumulates,
because nothing outside a record survives its own state. And a record's states
are its own, so the next record starts empty.

A BUCKET TOKEN IS A THIRD THING and is not covered by this rule. The pool holds
candidates for scope rather than work owed by a position, and it persists until
something pulls it in.

## THE RETRO WORKS THE SAME WAY, AND IT IS THE HARDEST CASE

The engine reads the steps out of the retro's guidance, mints a token for each,
and the agent fills them.

THE RETRO CARD MUST BE REWORKED FOR THIS. It carries twelve numbered steps plus
two standing questions, and more provenance prose than any other card. Splitting
it so each step is a section a token can be built from is part of the work.

IT IS ALSO THE BEST TEST OF THE MARKING FORMAT. Anything that survives the retro
card survives the rest.

### A TOKEN THE AGENT CANNOT CLOSE

The retro's field-feedback question is the exemplar. Its evidence is the owner's
own report from outside the machine, and no amount of agent work substitutes for
it.

THE TOKEN SAYS THE WORK NEEDS A PERSON. That is a property of the work, not a
claim about where the token lives.

NOBODY HOLDS A TOKEN. Not an agent and not a person. A token belongs to a state
or to the backlog, and that is its only home.

THIS REPLACES THE SANCTIONED-STOP LIST WITH A FACT. Today the agent consults a
list of four or five legitimate reasons to end a turn and judges which applies.
With tokens it is mechanical: the turn ends because an open token is held by the
person and the agent cannot close it.

THE MEASURED FAILURE THIS FIXES: the field-feedback question was walked past in
several retros running, because prose does not refuse. As a person-held token it
refuses by itself.

## THE MARKING FORMAT IS SETTLED IN PRINCIPLE: A HEADING PER TOKEN

A heading names a token. The body under it is the guidance that token carries.

THE EVIDENCE SPEC LIVES IN THE SAME HEADING. A heading that declares itself a
task carries SUBHEADINGS beneath it describing the evidence it owes and anything
else it needs. Nothing about a token lives outside its own section.

TWO DETAILS ARE DEFERRED to the design proper.

- How a heading declares itself a task, since a document will hold headings that
  are not tokens.
- What the subheadings under a task heading are called and what each means.

## IDEATION NEEDS NOTHING NEW

The same shape covers it. Incoming tokens for the reading it requires, outgoing
tokens derived from its method, all ephemeral because it is not a record.

## WHEN AN EPHEMERAL TOKEN IS CLEARED

The rule must be stated outright rather than inferred.

- A RESTART DELETES THEM. Nothing ephemeral survives the engine starting again.
- AN ESCAPE AND A RE-ENTRY DO NOT. Leaving a state and coming back finds the
  same open tokens waiting.

So escaping is not a way to clear work, and restarting is not a way to keep it.

## EXPEDITIONS AND ITERATIONS ARE ONE CASE

Both have records, so both behave the same way. Everything below is about both.

## INSIDE A RECORD, A DONE TOKEN IS THE EVIDENCE

Tokens in a record are not ephemeral. When a token is done it BECOMES the
evidence. There is no second act of writing evidence somewhere else.

### EVERY EVIDENCE FIELD BECOMES ONE TOKEN

Every single evidence piece in today's evidence form becomes one work token.

The state's two slots then carry what they always carried, but as tokens.

- INPUTS go in the incoming slot, as before.
- EVIDENCE goes in the outgoing slot, one token per piece.

WORKED ON THIS RECORD'S OWN KICKOFF GATE: its fourteen fields become fourteen
tokens. Each is separately closeable and separately refusable, which is the
point. A form that refuses as a whole tells you less than fourteen tokens of
which two are open.

### A DRAWN FIELD BECOMES A MECHANICAL TOKEN

Some of today's fields are drawn by the engine rather than authored. The kickoff
gate's drained-inbox line and its bounds line are both of that kind.

Those become MECHANICAL TOKENS, and the boot rule already governs them: the
script runs when the token is asked, never when it is created.

### OPTIONAL TOKENS

Some tokens may be closed WITHOUT evidence.

THIS IS NOT PERMISSION TO IGNORE THEM. An optional token still has to be closed,
and closing it is a deliberate act. What is optional is the evidence, not the
closing.

## TWO FORM SECTIONS ARE DROPPED

The CURRENT SITUATION section and the FOLLOW-UP section go. Neither has earned
its place, and dropping them loses nothing.

ANYTHING ELSE STAYS.

## A DONE TOKEN, AND THE ARCHIVE

IN LIVE WORK a done token drops out of view. The reader is looking at what is
owed, not at what is finished.

BUT THE DONES SHOULD BE REACHABLE. A list of them, available to whoever wants
it. How that is shown is a surface question and is deferred.

IN THE ARCHIVE THERE ARE ONLY DONES. Nothing else is in there.

AN ARCHIVED RECORD CANNOT BE ENTERED, so nothing in it can be opened or worked.
It is there for a person to click into and read.

THE ARCHIVE SHOULD LIVE ONLY IN VERSION HISTORY, not in the working tree. That
is captured as a note and may already be seeded.

## A SUBMACHINE BECOMES A SET OF TOKENS

Wherever the machine spawns a submachine today, it spawns work tokens instead.
The steps that would have been states become tokens.

## DEPENDENCIES BETWEEN TOKENS

This follows unavoidably from the above. A token may only be openable once
another token is done.

SO A TOKEN NEEDS A `depends on` EDGE.

### AND THAT EDGE ANSWERS PART OF THE READINESS PROBLEM

The pool's 139 tokens each carry a prose re-entry condition, and 25 of them wait
on an event nothing observes. A dependency edge is the machine-checkable form of
the commonest case.

TWO SYSTEMS ALREADY DO EXACTLY THIS.

- Beads computes its ready list as the tokens with no open blockers, straight
  from the dependency graph. Nobody authors readiness.
- Argo's dependency field keys on a predecessor's OUTCOME rather than merely its
  completion, which is a distinction worth having: a token might depend on
  another being done, or on it being settled either way.

WHAT AN EDGE DOES NOT COVER. A condition that waits on a record starting, or on
a person acting, is not a dependency between two tokens. Those still need
another shape.

## A DEPENDENCY MAY POINT AT A STATE

The edge is not only token-to-token. A token may depend on a STATE being
finished.

That covers the case that looked like it needed another shape. "Ready when the
engine round opens" becomes a dependency on that record's kickoff state
finishing. It is the same edge with a different kind of target.

## WORK A PERSON MUST DO IS A FLAG

A token carries a flag saying the work needs a person. That is all it needs.

The field-feedback question is the exemplar, and the flag is what makes its stop
mechanical rather than a matter of judgment.

## THE MAPPING — WHAT BECOMES A TOKEN AND WHAT DOES NOT

Most of what the system already carries maps onto tokens.

- OPEN ITEMS become work tokens.
- THE BACKLOG becomes work tokens. It largely already is.
- METHOD STEPS become work tokens, from their headings.
- EVIDENCE PIECES become work tokens, one per piece.
- READING REQUIREMENTS become work tokens, minus what is already proven.

### NOTES DO NOT, AND THE REASON IS PRIVACY

A note is PRIVATE. A work token is NOT.

A note is machine-local, written mid-walk by whoever noticed something, and may
carry anything. A token lands on trunk, where it cannot be taken back.

THE BOUNDARY BETWEEN THEM STAYS EXACTLY WHERE IT IS. It is the reason the mint
refuses a statement that carries the note's own words, and that guard is the
only mechanical thing holding the line.

## THE KICKOFF IS THE DISTRIBUTOR

Design input for an iteration is PUSHED TO THAT ITERATION and hangs on it, at
the kickoff.

WHEN THE KICKOFF STARTS, IT PUSHES EACH TOKEN ON TO THE STATE IT BELONGS TO. The
kickoff is where scope is received and where it is routed.

### THIS GIVES AN ITERATION A MEASURED SIZE

Looking at the iterations, each one carries a count. Fifty tokens here, sixty
there, twenty on the third.

THAT IS A SIZE NOBODY ESTIMATED. It is counted from what the record actually
owes, and it answers the sizing question that was parked earlier without needing
a t-shirt at all.

IT ALSO MAKES THE POOL LEGIBLE. A token in the pool is unrouted scope. A token
on an iteration is scope with a home. The difference between those two numbers is
what is not yet planned.

## THE BACKLOG IS WHERE A HOMELESS TOKEN LIVES

One place holds every token that is nowhere else. That is the backlog, and the
options pool goes there too.

IT IS SHOWN AT THE FRONT DESK.

### THE PROBLEM THE OWNER SPOTTED, AND A WAY ROUND IT

If backlog tokens sit at the front desk, and a state cannot be left until its
tokens are settled, the desk could never be left. The owner's answer was to make
the backlog visual rather than mechanical there, and called it annoying.

A CLEANER READING IS ALREADY IN THE SKETCH. Tokens live in BUCKETS or on STATES.
Those are two different homes, and only a state's OUTGOING SLOT gates anything.

So the backlog is a bucket. A bucket holds work that has no home yet; it does not
demand that anybody finish it. Nothing about the desk needs an exception, because
the backlog was never in the desk's outgoing slot.

THE DESK SHOWS THE BUCKET. It does not own it.

THAT MATTERS BEYOND THE TIDINESS. An exception is a rule with a hole in it, and
the next reader has to be told about the hole. Two homes with different rules is
a model somebody can hold.

## PRIVATE TOKENS — OPEN, AND THE COST IS REAL

THE IDEA: notes become work tokens that go to the retro. Then the retro's own
count is visible, and a note stops being a different kind of object.

THE COST THE OWNER NAMED: tokens would be stored in two places, some private and
some not.

### THE COST CANNOT BE DESIGNED AWAY

Private and committed are incompatible. A note is machine-local today ON PURPOSE:
it may carry a path, a name, a customer, and it dies with the container it was
written in.

Put it in version control and it travels. "Private" then means nothing.

SO TWO HOMES IS NOT AN IMPLEMENTATION CHOICE. It is what privacy costs.

### WHAT CAN BE SAVED

Make it ONE KIND OF OBJECT with two homes, rather than two kinds of object.

- One schema, so the same fields mean the same things.
- One surface, so a count is a count.
- One set of verbs, so nobody learns two vocabularies.
- A PRIVACY FLAG rather than a separate type.

PUBLISHING IS THEN A TRANSITION, and it is where the existing guard fires. The
mint already refuses a statement carrying the raw note's own words, and that guard
lands exactly on this transition without being moved.

WHAT THE OWNER GAINS: the retro shows one number instead of two, and a note that
has been judged becomes visible work rather than disappearing into a different
system.

STILL OPEN. Whether the gain is worth carrying two stores.

## BUCKETS ARE NOT WORKED

Confirmed. Incoming and outgoing tokens are worked. Bucket tokens are not.

THE BACKLOG BUCKET IS STILL PUT ON THE FRONT DESK. It is shown there, and being
shown there asks nothing of anybody.

## THE STATE MACHINE SURFACE — BUBBLES ON A STATE

From the owner's sketch, which is a contract and gets rendered as drawn.

Every state carries NOTIFICATION BUBBLES, the kind every application already
teaches. Small — smaller than sketched.

FOUR KINDS, AND POSITION CARRIES MEANING.

- INCOMING sits FURTHEST LEFT.
- OUTGOING sits FURTHEST RIGHT.
- DONE and BUCKET sit between them.

AS DRAWN, reading left to right: incoming, bucket, done, outgoing. Bucket sits
beside incoming because neither has been worked; done sits beside outgoing
because both are produced.

EACH BUBBLE CARRIES A COUNT. On every state you see each bucket and how many
tokens are in it.

CLICKING A BUBBLE OPENS THE WORK TOKEN EDITOR on those tokens.

### COLOUR

The owner does not mind which colours. The standing rule then decides: colour
carries meaning and is taken from the host's own palette, never chosen for
decoration. The sketch's colours are positional markers, not a palette.

### THE ARCHIVE FOLLOWS FROM THIS

An archived state shows the done bubble and nothing else, because only dones are
in there.

## NEXT, AND NOT YET DISCUSSED

The work token editor.

## THE BUBBLES, SETTLED

A BUBBLE SHOWING ZERO DOES NOT SHOW AT ALL.

DONE MOVES TO THE BOTTOM, or the bottom right. So the top carries what is owed
and the bottom carries what is finished.

### WHICH ANSWERS THE OWED-OR-PRODUCED QUESTION BY ITSELF

With done on its own and zeroes hidden, the outgoing bubble counts what is still
OWED. When the last one closes the bubble disappears, and the done bubble carries
the number instead.

SO A STATE WITH NO TOP-ROW BUBBLES IS A FINISHED STATE, readable at a glance and
with nothing to interpret.

## NOBODY HOLDS A TOKEN — A CORRECTION

The agent proposed a holder on the token. That was wrong and the owner struck it.

A TOKEN HAS A PLACE AND A STATUS, and they are different things.

- ITS PLACE is a state, or the backlog. There is no third.
- ITS STATUS says whether it is open, in work, or finished.

MARKING A TOKEN IN WORK DOES NOT MOVE IT. Starting on something changes its
status and leaves it exactly where it was.

SO A PERSON MAY WORK A TOKEN THAT SITS IN THE BACKLOG, and that is allowed. The
agent would not: it would move the token onto a state first and work it there.

THE PERSON-NEEDED FLAG SURVIVES THIS. It says the work needs a person, which is a
fact about the work. It never said anybody owns the token.

## A TOKEN'S STATUS, AND THE KINDS OF FINISHED

A token needs a status: open, in work, done.

AND FINISHED HAS MORE THAN ONE FLAVOUR. Rejected. Skipped. Others yet to be
named.

THIS IS THE SETTLED IDEA MADE CONCRETE. A token can be finished without being
done, and the state can still be left. What matters to the state is whether every
token reached SOME terminal status, not which one.

THE VOCABULARY IS NOT YET FIXED. What is fixed is that terminal is a category
with several members, and only membership gates the state.

## HOMELESS TOKENS, RESTATED

A token that appears nowhere else appears in the backlog, and the backlog is
shown on the front desk.

The editor is where they are seen, filtered and worked.

## THE KICKOFF RECEIVES SCOPE AND MUST REDISTRIBUTE IT

Work items are dropped onto an iteration while it is seeded and not yet started.
They arrive at gate-kickoff.

THE KICKOFF MAY NOT CLOSE THEM. It must push each one on to the state it belongs
to.

AND IT MUST BE MECHANICAL. An agent should never be left wondering whether it is
supposed to close the scope it was handed.

### DISTRIBUTION IS THE MECHANISM, AND NOTHING NEW IS NEEDED

THE KICKOFF SEES THE WHOLE ITERATION. Every state of the record exists before the
record is done, so every destination is available while the kickoff stands.

Scope arrives as tokens in the kickoff's outgoing slot. The kickoff pushes each
one to the state it belongs to.

A TOKEN BLOCKS THE STATE IT IS IN. Once it sits somewhere else, it blocks that
place instead, and the kickoff's slot is that much emptier.

SO THE SLOT EMPTIES BY DISTRIBUTION, never by closing. When the last token has
found a home the kickoff has nothing owed and can finish.

THERE IS NO CYCLE. MOVED is already one of the three ways a token stops blocking
a state, alongside done and cancelled. The agent proposed a deadlock here and was
wrong: it had forgotten the third exit, which is recorded further up this same
file.

AND THE KICKOFF STILL CANNOT CLOSE THE SCOPE, which is what was wanted. It has
only ever needed to move things.

### WHY THE KICKOFF STRUCTURALLY CANNOT CLOSE THE SCOPE

This falls straight out of the place-and-status split.

- DISTRIBUTING IS A CHANGE OF PLACE. The token moves from the bucket to a state.
- CLOSING IS A CHANGE OF STATUS. The token reaches a terminal status.

THE KICKOFF MAY CHANGE PLACES. It may not change the status of scope it did not
do. Two different acts, and only one of them belongs to this gate.

AN ITEM THE GATE JUDGES OUT OF SCOPE IS STILL A PLACE CHANGE: it goes back to the
backlog, not to a terminal status.

### WHAT THE GATE'S GUIDANCE THEN SAYS

It says to distribute what arrived, and names where the destinations come from.
The gate's own outgoing tokens are the scope it was handed, and they leave by
being routed rather than by being judged.

## THE EDITOR IS DRAWN, AND THE DRAWING IS THE SPEC

IT LIVES AT design/worktokens.excalidraw.svg, beside this record.

NOTHING HERE TRANSCRIBES IT. Owner ruling: a drawing of a surface IS the
specification, nobody rewrites it into prose, and if the drawing changes then the
specification changed. A prose copy would be a second source ageing on its own.

WHAT IS RECORDED HERE INSTEAD is only what the owner said in conversation and did
not draw, plus the questions the drawing leaves open.

### SAID BUT NOT DRAWN

- Clicking a bubble opens the editor and HIGHLIGHTS the bucket that was clicked.
- Some buckets are made by the system. Drawing something onto a state gives that
  state a bucket.
- A user bucket can be deleted. A system bucket cannot always be.
- THE BACKLOG IS THE FALLBACK AND CAN NEVER BE DELETED. Deleting any other bucket
  drops its contents there.
- A state machine's bubble sums its children. It reads as x plus y, where x is
  the machine's own and y is everything beneath it, so the bubbles become pills
  rather than circles.
- Clicking that bubble opens the bucket the machine ITSELF owns. There is no
  combined bucket to open, because no such bucket exists.

### THREE QUESTIONS THE DRAWING LEAVES OPEN

DOES AN ASSIGNED BUCKET GATE ITS STATE? The drawing says a bucket can be assigned
to a state, and names an iteration as the example. But it was settled earlier that
a bucket is never worked and never gates, which is what lets the front desk show
the backlog and still be left. If a record's own bucket holds its work, it must
gate, or the record finishes with work outstanding. Either assignment turns a
bucket into slot content, or a bucket assigned to a record is a different thing
from a bucket shown on a state.

WHAT REACHES THE CHILDREN'S HALF OF THE COUNT? A machine showing three plus
forty-seven opens only the three. The forty-seven is then a number nobody can act
on from where they stand. Either there is a way down to it, or it is deliberately
informational and should look it.

WHAT HAPPENS WHEN AN ASSIGNED BUCKET IS DELETED? Its contents fall to the
backlog, which would quietly remove a record's scope. That may be why system
buckets are not always deletable, and it wants saying rather than implying.

### ONE VOCABULARY HAZARD

THE WORD DELETE NOW COVERS THREE DIFFERENT ACTS, and only one of them destroys
anything.

- Deleting a BUCKET keeps every token and moves them.
- Deleting a TOKEN sets it to a terminal status, and the drawing says so plainly.
  Nothing is destroyed.
- An EPHEMERAL token at the end of its state genuinely goes.

Only the third is a deletion. The first two want their own words before the
surface teaches the wrong one.

## THE VOCABULARY IS SETTLED, AND IT SUPERSEDES EVERYTHING ABOVE

WHERE THIS FILE SAYS SLOT ABOVE, READ BUCKET. The word slot is retired.

EVERYTHING WORK TOKENS GO IN IS A BUCKET. There is no second word for it.

FOUR KINDS SIT ON A STATE.

- THE INPUT BUCKET holds what must be taken in. It blocks.
- THE OUTPUT BUCKET holds what must be produced. It blocks.
- THE DONE BUCKET holds what is finished.
- THE PENDING BUCKET holds work the state is meant to do something with
  eventually, and it DOES NOT BLOCK.

PENDING IS REALLY FOR THE BACKLOG. The owner said outright that it makes little
sense anywhere else. It needs no exception, because a bucket holding nothing is
not displayed at all.

## WHAT THE EDITOR MAY AND MAY NOT DO

### DELETION OF WORK TOKENS IS DROPPED

A work token cannot be deleted in the editor. Nor can it be dragged into done.
Both of those are changes of STATUS, and status is edited on the token itself.

The owner's reason: it just creates trouble.

### ONLY A USER'S OWN BUCKET MAY BE DELETED

A state's input and output buckets cannot be deleted. Neither, in general, can a
record's.

A USER BUCKET IS FOR CONVENIENCE and it is a carrying container. The worked
example the owner gave: make a bucket, put five tokens in it, drop it on a state's
input bucket, the tokens move across, the bucket is empty, and now it can go.

### ONLY RELEVANT BUCKETS ARE LISTED

A bucket that is historical, or holds nothing, is not displayed.

## DRAG AND DROP

Hovering a state shows which of its buckets will accept a drop.

- INPUT accepts.
- OUTPUT accepts.
- PENDING accepts.
- DONE DOES NOT. Nothing is dragged into done, ever.

## THE SUMMED COUNT IS FOR ONE GLANCE, AND NAVIGATION IS THE ANSWER

The pill reads x plus y so the reader sees at a glance how much work lives where.

TO SEE HOW IT IS DISTRIBUTED, OPEN THE MACHINE. Double-clicking a state machine
opens it, and each submachine inside then shows its own count beside its
children's.

SO NOTHING REACHES THE CHILDREN'S HALF FROM THE PILL, and nothing should. The
number is a summary and the way in is the machine.

## A USER BUCKET IS BORN HOLDING SOMETHING

A PLUS SITS AT THE TOP OF THE LIST. Dropping tokens onto it creates a bucket
called unnamed, holding exactly what was dropped, and it can then be renamed.

EMPTYING IT DELETES IT.

SO A USER BUCKET IS NEVER EMPTY. It is born with contents and it dies when they
leave. There is no empty state to hide, no delete button to find, and no rule
about which buckets may be deleted.

THE EARLIER PROBLEM DISSOLVES. Hiding empty buckets would have hidden a bucket
the moment somebody made one. Creating it full removes that case entirely.

## DONE IS A FILTER, NOT A PLACE

The editor filters over every frontmatter field, and a token's status is one of
them. Done is that filter: status is terminal.

WHICH SETTLES THE COUNTS.

- A token has ONE place, and that place is a bucket.
- The input and output counts are the tokens in those buckets whose status is NOT
  terminal.
- The done count is the tokens whose status IS terminal.

A FINISHED TOKEN NEVER MOVES. It stays in the bucket it was worked in and drops
out of the owed count because it is filtered, not because it went anywhere.

### AND THE NO-DROPPING-INTO-DONE RULE STOPS BEING A RULE

Nothing can be dragged into a filter. What was a rule somebody had to enforce is
now impossible by construction, which is the better kind of answer.

### TWO WAYS A BUCKET'S OWED COUNT FALLS, AND THEY ARE DIFFERENT ACTS

- A STATUS CHANGE. Done, cancelled, rejected or skipped. The token stays exactly
  where it is and leaves the owed count by being filtered out.
- A PLACE CHANGE. Moved to another state. The token leaves the bucket.

Both empty the bucket's obligation. Only one of them moves anything, and the
engine has to hold that difference even though the surface shows the same number
falling by one.

## BUCKETS COLLAPSE, AND THE LIST SCROLLS

Clicking a bucket's header collapses it.

Where there are more buckets than fit, the list scrolls.

## THE EDITOR IS A DATABASE VIEW, AND MOST OF IT EXISTS

OWNER RULING: reuse the existing code and improve it where it needs improving.
Do not write a second one. The controls should be shared with the database views
already in the product.

### WHAT ALREADY EXISTS AND FITS ALMOST EXACTLY

deliverable/engine/editors/node-table.ts is a fillable table whose ROWS ARE NODES
and whose COLUMNS ARE THEIR FRONTMATTER. Its own opening comment states the
principle this design needs: there is no second copy, typing in a cell writes
that key on that node, and editing the note shows in the form.

WHAT IT ALREADY CARRIES.

- A real table, with the layout on the elements rather than in a stylesheet.
- Every colour taken from a theme variable.
- Column edges that drag to resize, with the widths reapplied on every redraw.
- A constrained column that offers its source as a chooser.
- A value no longer on offer KEPT rather than blanked, and marked as such.
- The row's own name as a link that opens the file.

That is the cell machinery, and it should be reused rather than rebuilt.

### WHAT GENUINELY DOES NOT EXIST

Four things in the drawing have no precedent anywhere in the tree.

- Grouping rows into buckets, and collapsing a bucket by its header.
- Two panes side by side.
- Dragging a row from one pane to the other.
- A plus that mints a token from a template.

SAYING OTHERWISE WOULD BE PROMISING REUSE THAT IS NOT THERE.

### FILTERING IS THE INTERESTING CASE

Filter, collapse and scroll code exists across seven surface files, most of it in
the place, the walk and the log.

WHETHER THAT IS ONE MECHANISM OR SEVERAL COPIES IS NOT YET KNOWN, and finding out
is itself worth doing. If it turns out to be several, this round should fold them
into one rather than add an eighth.

THAT IS THE SAME QUESTION THE SWEEP ALREADY ASKS: does each job have exactly one
piece of code doing it.

## ONE EDITOR TAUGHT IS EVERY EDITOR TAUGHT

OWNER RULING, and it decides how every gap above gets filled.

IF SOMEBODY UNDERSTANDS ONE EDITOR THEY SHOULD UNDERSTAND ALL OF THEM. Anything
reusable as a widget is reusable in all of them.

AND THE PREFERENCE IS EXPLICIT: add a special case to an existing widget rather
than write a second one.

### THIS SHARPENS A LAW THAT ALREADY STANDS

The surface rules already forbid a second surface for a job one surface does, and
a refusal already fires on a module that starts emitting widget markup without
being registered.

WHAT THE OWNER ADDS IS THE POSITIVE HALF. Not merely "do not build a second one",
but "widen the first one".

### THE COUNTER-COST, SAID ONCE

A widget that accumulates special cases eventually becomes the thing nobody dares
change. That is real, and it is the usual reason people argue the other way.

IT DOES NOT WIN HERE. Nineteen editors already exist, so learnability is the
scarce thing. And the failure this system has actually measured is divergent
copies, never an overgrown widget.

## WHAT THE TREE ACTUALLY CARRIES, MEASURED

NINETEEN EDITORS STAND. Three of them carry real pointer machinery.

- morph-box, with ten uses, and it is the largest editor by far.
- node-table, with five, which is its column-resize grip.
- rank-cut, with four.

THE DESIGN-STRUCTURE MATRIX CARRIES NONE, despite looking the most interactive.
Its hits were the words group and drop in prose, not events.

### SO DRAGGING BETWEEN CONTAINERS IS GENUINELY NEW

Nothing in the tree drags a thing from one container into another. What exists is
resizing and picking, inside one grid.

UNDER THE OWNER'S RULE THAT DOES NOT MEAN A NEW EDITOR. It means the behaviour is
added INSIDE node-table, which already holds the right data shape and already has
one drag to learn from.

### WHY node-table IS THE ONE TO WIDEN

It is already rows-are-nodes and columns-are-frontmatter, which is the token
editor's data model with no translation. It already writes straight through to
the file with no second copy. And it already carries a drag.

The other two may donate a primitive. Neither should become the container.

## THE DRAG CROSSES SURFACES

A token is dragged OUT of the editor and ONTO the state machine.

WHILE THE DRAG IS HAPPENING, the buckets that will accept it become visible on
the machine. Dropping on one puts the token in that bucket.

### THIS SOLVES A PROBLEM THE HIDING RULE CREATED

An empty bucket is not displayed. So without this, an empty input bucket could
never be filled by dragging, because there would be nothing on screen to aim at.

THE DRAG REVEALS WHAT IS OTHERWISE HIDDEN. That is not a decoration, it is what
makes the gesture possible at all.

DONE NEVER APPEARS AS A TARGET, because it is a filter and not a place.

### AND IT IS THE STRONGEST CASE FOR THE SHARED-WIDGET RULE

A gesture that begins on one surface and ends on another cannot have its
machinery living inside either one. It has to be shared, or the two ends will
drift and only their disagreement will be visible.

### THE CONFLICT THIS CREATES, AND IT NEEDS SETTLING

CLICKING A BUBBLE OPENS THE EDITOR. If the editor opens OVER the machine, the
machine is no longer on screen, and there is nothing to drag onto.

SO THE TWO MUST BE VISIBLE AT ONCE for this gesture to exist. Side by side, or
the editor as a panel beside the machine rather than in front of it.

THAT IS A LAYOUT RULING THE DRAWING DOES NOT MAKE, and it is forced by the drag
rather than chosen.

### ONE TECHNICAL QUESTION, ASKED RATHER THAN ASSUMED

Dragging between two regions of ONE document is ordinary. Dragging between two
separate windows or panels is a different problem with different limits.

WHICH ONE THIS IS depends on how the editor and the machine are hosted, and
nobody has said. It should be answered before the gesture is designed, because
the answer changes what is buildable.

### WHICH DRAGS EXIST, IN FULL

INSIDE THE EDITOR, BOTH WAYS. A row drags from one column to the other, and from
one bucket to another.

OUT OF THE EDITOR ONTO THE MACHINE. A row drags onto a bucket on a state.

OUT OF THE MACHINE INTO THE EDITOR: NOT NEEDED, and the owner is content without
it. Individual tokens are not visible on the machine at all, only counts, so
there is nothing there to pick up.

### THE RETURN PATH IS THE HIDING RULE, NOT A DRAG

Drag a token onto an iteration's input bucket and THAT BUCKET APPEARS IN THE
EDITOR. It was not listed before because it held nothing.

SO THE TWO SURFACES STAY IN STEP WITHOUT A SECOND GESTURE. A bucket materialises
wherever it holds something and vanishes when it does not, on both surfaces, by
one rule.

THAT IS WHY THE ONE-WAY DRAG IS ENOUGH. The editor is where everything is
visible, so work only ever needs pushing towards the machine. It comes back into
view by itself.

### SETTLED: THE DRAG CROSSES TWO PANELS

The owner wants it between two DIFFERENT PANELS, not two regions of one document.

NOBODY HAS ESTABLISHED WHETHER THAT IS BUILDABLE HERE, and it was deliberately
not researched, because writing this down mattered more.

IF IT TURNS OUT TO BE A LARGE RISK, THE ANSWER IS A SPIKE. That is the owner's
own instruction and it is the first thing to do rather than a fallback.

WHAT THE SPIKE WOULD ANSWER. Whether a drag begun in one panel can be received by
another in this host, what the payload may carry, and whether the receiving panel
can change what it shows while the drag is in flight. The last one is not
optional: the buckets must appear during the drag or there is nothing to aim at.

---

# FOR WHOEVER PICKS THIS UP NEXT

THIS FILE IS THE DESIGN INPUT. It was captured live while the owner walked the
machine position by position. Read it whole before designing anything.

THREE ARTIFACTS STAND BESIDE THIS RECORD.

- design/worktokens.excalidraw.svg is the EDITOR'S SPECIFICATION. It is a
  drawing and it is not transcribed anywhere, by owner ruling. Open it, and open
  it in Excalidraw if you need to change it. If it changes, the spec changed.
- research/prior-art-by-sketch-element.md is twenty primary sources arranged by
  which part of the sketch each one judges.
- This file is what the owner ruled.

WHERE THEY DISAGREE, THIS FILE WINS. The prior art is evidence; the owner's
rulings are decisions.

## THE SHORTEST TRUE STATEMENT OF THE DESIGN

A work token is one markdown file. It has a PLACE and a STATUS, and they are
separate things.

Its place is a bucket. Four kinds of bucket sit on a state: input and output,
which block; done, which is a filter over status rather than a place; and
pending, which holds work that does not block. A bucket may also be a user's own,
born holding what was dropped on it and gone when emptied.

Its status is open, in work, or one of several terminal kinds. Terminal includes
rejected and skipped, not only done.

A STATE MAY BE LEFT when every token in its input and output buckets has reached
a terminal status or moved elsewhere.

TOKENS COME FROM THREE PLACES. Reading requirements become input tokens, and only
where the evidence is not already proven. A method's marked headings become
output tokens. Today's evidence fields become output tokens, one per field.

OUTSIDE A RECORD EVERYTHING IS EPHEMERAL. Inside a record a done token IS the
evidence.

## THE FIVE THINGS MOST LIKELY TO BE GOT WRONG

Each of these was said once and is easy to miss.

- A MECHANICAL TOKEN RUNS ITS SCRIPT WHEN IT IS ASKED, never when it is created.
- DONE IS A FILTER, NOT A PLACE. A finished token does not move. Nothing is ever
  dragged into done.
- NOBODY HOLDS A TOKEN. A person-needed flag is a fact about the work, not a
  claim about where the token lives.
- A TOKEN IS NEVER DELETED. Deleting one sets a terminal status. Only an
  ephemeral token genuinely disappears, and only when its state completes.
- THE DRAG MUST REVEAL HIDDEN BUCKETS. Empty buckets do not display, so without
  the reveal an empty input bucket could never be filled.

## WHAT IS STILL OPEN, AND WHO OWNS IT

THE OWNER'S, AND NOT YET RULED.

- Whether private tokens exist, which decides whether a note becomes a token. It
  costs two stores either way, because private and committed are incompatible.
- Whether an assigned bucket gates its state.
- Whether a state's own bucket may be deleted when the record still needs it.

THE DESIGN'S, AND DEFERRED ON PURPOSE.

- How a heading declares itself a task, and what its subheadings are called.
- The terminal-status vocabulary. Rejected and skipped are named; the rest are
  not.
- Whether the seven surfaces that filter share one mechanism or seven copies.

## THE RISKS NOBODY HAS COSTED

- CROSS-PANEL DRAG. Unresearched by instruction. Spike it first.
- HOW MANY TOKENS A RECORD CARRIES. This gate alone became fourteen. A record has
  many positions with several fields each, and nobody has counted. The bubble
  surface is being designed against an unknown number. One script over an
  archived record answers it.
- THE STORAGE SHAPE. Five systems converged on a log with derived state and moved
  away from what this sketch does. The prior-art file carries the detail. The
  counter-argument is real but has to be argued rather than assumed.
