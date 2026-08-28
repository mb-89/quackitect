---
form: define-actual
amended: 2026-08-25T18:41:19.171Z by agent — the earlier fix left a trailing clause contradicting the delta, and the overview qualification never landed here at all
by: agent
signed_off: 2026-08-25T17:28:14.077Z
authors: agent
files: null
---

# Evidence form / define-actual

## current_situation

The vision and the register stand. This state says where the system actually is today, so the delta after it has two ends to measure between.

THE OWNER GAVE THIS ACTUAL DIRECTLY, and it is written from their account plus what this session measured. Where a claim is theirs it says so, and where it is measured it names the measurement.

THE OWNER ALSO SAID THEY MIXED THE ACTUAL WITH THE GOALS while giving it. The goals are already in the vision packet and are not repeated here. Some of what they said is delta rather than actual, and it is held for frame-delta rather than written into this field.

## as_is

THE ONE SENTENCE: there is no uniform system for how work is modelled.

WHAT DOES THE MODELLING TODAY. Work is carried by states that demand evidence. A state names its fields, the walker fills them, and the form refuses until they are answered.

THAT PART WORKS WELL ENOUGH, and the owner said so plainly. The evidence forms do hold the walk to its work tokens, and a signed form is a real account of what a state produced. Nothing here argues for throwing that away.

### What is wrong with it, as the owner reports it

THE ENGINE DOES NOT KNOW THE SINGLE STEPS. It knows a state and it knows a form. What it cannot see is the individual pieces of work inside them, so it cannot say which one is open, which is blocked, or which was skipped.

THE UPDATE SYSTEM IS THE VISIBLE SYMPTOM AND IT IRRITATES. Because the engine cannot see the steps, the agent narrates them by hand into a second structure that runs beside the one it is walking. MEASURED over this session's window: 199 of 1233 calls were narration, sixteen per cent of everything, and none of it is work. MEASURED on an earlier walk: 59 consecutive refusals, every one the stall guard, every one carrying the same two checklist items that could not close from where the walk stood.

IT IS NOT CLEAR TO THE PERSON WHAT THE SYSTEM IS DOING. The surface shows where the walk stands and what is legal there. It does not show what is owed as a list of things.

THE PERSON CANNOT EASILY MAKE AN ITEM AND PUT IT SOMEWHERE. There is no gesture for it. The only things a person can create today are a note and a seeded record, and neither lands on a state.

WEAKER MODELS DO NOT FILL THE FORMS IN CORRECTLY. A measured witness of the same shape: an overhaul agent was run and it missed several of its own method's steps. Nothing caught it, because the steps were prose in a document and prose does not refuse.

A NOTE HAS NOWHERE GOOD TO GO. It is machine-local and dies with the container. Draining it has four dispositions, and only one produces anything durable, which mints a token into the pool. When the right home is a specific piece of work rather than a whole new record, there is no target, and seeding an iteration is not always what the owner wants.

THERE IS NO OVERVIEW OF WHAT IS PENDING. What stands open is spread across the notes inbox, the options pool, and whatever forms happen to be unfilled. One call lists them and no surface holds them together for a person.

THE ANSWER TO THIS WILL SPAN TWO STORES RATHER THAN ONE. A note is private and a token lands on trunk, so the owner's direction is private tokens kept separately: one vocabulary, two homes. What the overview renders when private items exist is not yet stated, and this problem is not fully answered until it is.

### Seven more absences the report did not name

These follow from the same root and are written here because a delta cannot answer what an actual never said.

WORK HAS NO IDENTITY. A field inside a form cannot be pointed at, linked to, or referred to from anywhere else. The register learned exactly this lesson already, and its method says so in as many words: a table row inside one iteration's evidence carries no id, so nothing can point at it and a later iteration cannot pick it up. Work never learned it.

WORK HAS NO STATUS BEYOND FILLED OR NOT FILLED. There is no way to record that something was attempted and rejected, or deliberately skipped, or handed on. The only place to say it is prose inside the field, where nothing reads it.

WORK CANNOT MOVE. Something noticed in the wrong state has two options: do it here, or write a note and hope. Nothing carries a piece of work from where it was found to where it belongs.

WORK HAS NO DEPENDENCIES AT ITS OWN GRAIN. Ordering exists only as edges between states. Two things inside one state that must happen in order have nowhere to say so.

NOTHING COUNTS, SO NO RECORD HAS EVER HAD A SIZE. There is no number for how much a record owes, which is why every size question so far has been answered by estimate or by feel.

A STATE'S WORK TOKENS ARE AUTHORED TWICE AND NOTHING RECONCILES THEM. Once as the evidence fields in its form, and once as the steps in its method card. The overhaul failure above is what that costs: the card said seven steps, the form asked for something else, and the gap was invisible.

THE TWO THINGS THAT ALREADY LOOK LIKE WORK ITEMS ARE SEPARATE SYSTEMS. The notes inbox and the options pool have different stores, different verbs, different lifetimes and different surfaces, and a note becomes a pool token by a one-way act with no way back.

### What is already close to the target

It matters, because it shortens the work.

THE BACKLOG IS ALREADY WORK ITEMS. Each token in the pool is a file on trunk carrying a statement and a re-entry condition. MEASURED: 139 stood before this session's drain and fifteen more were minted during it. They are work items that happen to sit in a backlog rather than on a state.

READ EVIDENCE IS VERSION-KEYED AND IT IS NOT GLOBAL. Half of an earlier claim here was wrong, and an independent reviewer found it by reading the code rather than the comment above it. GLOBAL IS THE OPPOSITE OF TRUE: deliverable/engine/sessionreads.ts line 88 says a reading proof belongs to the HEAD that read, never to the record, line 98 says the ledgers do not survive a restart except the default reader's, and line 81 keeps the person's own checks in an in-memory map. That is deliberate, so a freshly spawned hand re-owes what it has not read. VERSION-KEYED REMAINS TRUE. Checked at deliverable/engine/mirror.ts line 174: one checkbox per document version, the check pins the document's current hash, and an edited document asks again. SO THE DESIGN DOES OWE SOMETHING. An input token minted only where the evidence is absent needs a proof store that outlives the session, or the token is durable while its proof is not. An earlier wording here said nothing new was owed, and that clause survived the first correction of the sentence it sat beside.

THE EDITOR MACHINERY MOSTLY EXISTS. deliverable/engine/editors/node-table.ts is already rows-are-nodes and columns-are-frontmatter, writes straight through with no second copy, resizes columns by dragging their edge, and offers a constrained column's source as a chooser.

THE STATE MACHINE ALREADY DRAWS AND ROUTES. Nothing about this change touches how the walk moves, only what a state hands out.

## follow_up

THE DELTA IS THE NEXT STATE'S WORK, not this one's. Several things the owner said while giving this actual are about the gap rather than about today, and they are deliberately held for frame-delta rather than written above.

TWO MEASUREMENTS IN THIS FIELD ARE THE BEFORE SIDE OF A COMPARISON, and both are worth re-taking when the work lands.

- Narration as a share of all calls, at sixteen per cent in this window.
- Stall-guard refusals per walk, at 59 on the worst measured walk.

IF THE DESIGN WORKS, BOTH FALL. The engine seeing the steps is what removes the reason to narrate them by hand. If neither figure moves, the design did not do what this actual says it should.

ONE THING NAMED ABOVE IS A SEPARATE DEFECT AND NOT THIS ROUND'S. A signed retro that reopens because notes were captured afterwards is wrong in the retro's own mechanics: once it has closed inside an iteration it should stay closed. Owner ruling. It is captured as a note and it is not evidence for anything here.

NOTHING ELSE IS PARKED. Everything this state found is either above, already in the register, or already a note.

## anything_else

