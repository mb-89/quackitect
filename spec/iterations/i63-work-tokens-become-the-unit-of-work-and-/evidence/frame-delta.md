---
form: frame-delta
amended: "2026-08-25T18:53:25.797Z by agent — the case deferred a saving to a later round, and the record's vision puts the removal in this one"
by: agent
signed_off: 2026-08-25T17:38:27.436Z
authors: agent
files:
---

# Evidence form / frame-delta

## current_situation

The vision, the register and the actual all stand. This state says what the gap is, why it can be closed now, and what the closing is worth.

THE OWNER STATED THE DELTA IN ONE BREATH: what we are adding is a uniform system for work that is better understandable for the owner, for the agent and for the engine. It creates visibility over everything, and it is probably better for adherence.

THAT SENTENCE IS THE GAP CLAIM and everything below unpacks it against the field the prior art scanned.

THIS FORM WAS HELD UNSTAMPED UNTIL THE OWNER HAD READ IT, and it is signed now. An amendment since carries two corrections an independent reviewer found.

## gap_claim

THE CLAIM. Today work is described three times and modelled nowhere: as evidence fields in a form, as steps in a method card, and as narration the agent types by hand. The delta is one representation that the owner, the agent and the engine all read.

WHAT THAT BUYS THAT NOTHING ELSE DOES. The work tokens of a state stop being authored and start being derived, from the reading it demands and from its method's own headings. A step cannot be skipped, because a skipped step is an open item and an open item holds the state.

### Positioned against the field that was scanned

Twenty primary sources were read. Each one below does something we do not, and sheds something we keep.

WHAT ANY OF THEM DO WELL IS A CANDIDATE, NOT A CONCESSION. Prior art is compared again at every gate below this one, so a strength named here is picked up at the requirements gate and at the design gate rather than settled now.

AN ISSUE TRACKER models work items well and models the process not at all. It sheds the guarantee. Nothing in it can refuse to close while a step is undone, because it does not know the steps.

GITLAB has shipped the central idea: one unit representing work at any level, with separate issue and epic lists replaced by one. WHAT THEY DO BETTER: it is in production and ours is not. WHAT THEY SHED: the process lives outside the unit, so nothing derives work tokens from a method.

BACKLOG.MD is the closest analogue and is dogfooded by agents. A markdown file per task, acceptance criteria, and defaults that arrive on every new task and can be declined. WHAT THEY DO BETTER: it exists and it is simple. WHAT THEY SHED: there is no machine holding a position open until its tasks settle, so completeness is a convention rather than a mechanism.

BEADS derives its ready list from a dependency graph, so nobody authors readiness. WE ARE TAKING THAT. This design carries a dependency edge, pointing at another item or at a state finishing, and readiness is derived from it rather than written in prose. NOT EVERY ITEM HAS ONE, and most will not, so an authored condition still has a job for the remainder. WHAT THEY SHED: direct readability. Beads moved to a version-controlled database with cell-level merging and tells agents not to keep work in markdown, so reading your own work then needs the tool.

CREWAI requires a description and an expected output on every task, and runs a guardrail that tests the output and sends failures back within a retry bound. WHAT THEY DO BETTER: the work token is checked, not merely declared. WHAT THEY SHED: durability. A task is per-run and leaves no record.

DAGSTER AND ARGO make readiness a composable condition, testable in isolation, and Argo keys on a predecessor's outcome rather than merely its completion. THAT DISTINCTION IS WORTH TAKING, because this design has several terminal statuses and an item may reasonably depend on another being settled either way rather than specifically done. WHAT THEY SHED: the person. Their conditions are written for a scheduler, not for somebody reading what is owed.

TEMPORAL AND AIRFLOW put a clock on anything that waits, so nothing pauses forever unnoticed. IT IS ONLY LOOSELY RELATED TO THIS ROUND. Items here are held by dependencies and by a person, not by timers, so a clock is not owed by the token design. It is noted because a standing finding already says this system bounds no open-ended wait anywhere, and the requirements gate is where that gets picked up or dropped on purpose.

### What ours sheds, said plainly

MECHANICAL MERGING. One editable file per item is the shape five surveyed systems converged away from. That is a tradeoff and not a win, and it is recorded in the register as standing dissent rather than settled.

A TOOL-MEDIATED VIEW. We give up the guarantees a database gives, in exchange for a person being able to open the work in any editor and read it. Whether that trade is right is the owner's call and it is not yet made.

## why_now

SEVEN THINGS MATURED, and together they are why this is closable now rather than a year ago.

THE UNIT ALREADY EXISTS AND IS ALREADY ON TRUNK. Every token in the options pool is a markdown file carrying a statement and a re-entry condition. MEASURED: 154 stand after this session's minting. What is missing is not the object, it is a home for it on a state.

READ EVIDENCE IS ALREADY VERSION-KEYED, so no new invalidation rule is owed. A changed file brings the requirement back by itself.

IT IS NOT GLOBAL, and an earlier wording here said it was. deliverable/engine/sessionreads.ts line 88 says a proof belongs to the HEAD that read and never to the record, and line 98 says the ledgers do not survive a restart. So an input token minted only where evidence is absent DOES need a store that outlives the session, and that is owed rather than free.

THE EDITOR MACHINERY ALREADY EXISTS. deliverable/engine/editors/node-table.ts is rows-are-nodes and columns-are-frontmatter, writes straight through with no second copy, and already carries one drag. That is the token editor's data model with no translation.

THE STATE MACHINE IS SETTLED AND ROUTES RELIABLY. Nothing in this change touches how the walk moves, only what a state hands out. A year ago the walk itself was still moving.

THE FAILURE IS MEASURED RATHER THAN SUSPECTED. An overhaul agent skipped several of its own method's steps and nothing objected. Narration runs at 199 of 1233 calls in this window, sixteen per cent, none of it work. Those two numbers are the before side of the comparison.

THE SURFACE HAS A SPECIFICATION. The owner has drawn the token editor, and by standing ruling a drawing of a surface is that surface's specification. Design work has something to build against rather than a conversation to remember.

THE CENTRAL BET HAS PRODUCTION EVIDENCE. GitLab converged on one unit representing work at any level and shipped it in 18.10, replacing separate lists with one. That does not make our version right, but it removes the risk that the idea itself is untried.

## value_props

- none

## business_case

NO ACQUIRER EXISTS, so this is written in the owner's own currency rather than in money.

WHAT THE EFFORT BUYS. Two of these are measurable, and both are collected by this round.

AGENT CALLS THAT ARE NOT WORK, AND THIS ROUND COLLECTS THE SAVING. Sixteen per cent of this window's calls were narration into a second structure the agent drives by hand beside the one it walks. Once the engine can see the steps, that structure has no reason to exist, and this round removes it.

THE RECORD'S OWN VISION SAYS SO at line 44: the narration system is gone, the token's own open and done entries produce the graph the update ops build by hand today, and five refusal clauses that exist only to police narration go with it.

AN EARLIER WORDING HERE DEFERRED THE COLLECTION TO A LATER ROUND. That read i55 as the owner of the work when it is listed as an INPUT to this one.

ROUND TRIPS LOST TO GUARDS THAT CANNOT SEE THE WORK. The stall guard fired 59 times consecutively on one walk, every time on the same two items, because it counts narration rather than work. A guard reading real items refuses for real reasons or not at all.

VISIBILITY FOR THE OWNER, which is the reason the owner gave first. What is outstanding today is spread across three stores and no surface holds them together. One count per state, in one place for public work.

IT IS NOT ONE STORE, and saying so would overclaim. A note is private and a token lands on trunk, so the owner's direction is private tokens kept separately: one vocabulary, two homes. What the count shows when private items exist is not yet stated.

ADHERENCE FROM WEAKER HANDS. A cheaper model filling a long form incorrectly is a measured cost. A cheaper model handed one item at a time, each with its own evidence, is a smaller ask. This is the owner's expectation and it is stated as an expectation rather than a finding.

WHAT A STATE OWES RIGHT NOW, COUNTED RATHER THAN GUESSED. Nobody has that number today, and it is what the surface shows.

IT IS NOT A SIZE. A count of work tokens tracks how finely a method card's author cut their headings, so it must not be used to compare two records or to set a budget. The pressure test withdrew the stronger claim and this line carries the corrected one.

WHAT IT COSTS. A migration touching every form, every method card and the surface. The register carries that as its own entry, graded expected, with the architecture analysis named as the mitigation.

## follow_up

THIS DELTA AUTHORS NO VALUE PROPOSITION, and the owner has ruled that none is needed. Their words: this is just how the engine organises work, and it is not a new proposition.

SO THE ANSWER IS `none`, RULED RATHER THAN DEFAULTED. Nothing was recommended and nothing is pending. The agent's own suggestion was put and declined, and it is not carried forward.

THE RULE THAT MADE IT A QUESTION AT ALL is a permission rule: an agent never mints a proposition unasked, and only the person's word mints one. The card records four minted on an author's own judgment and later folded away by hand.

WHERE THE DETAIL LANDS INSTEAD, following the card's own routing.

- The engine seeing the steps, and a state refusing to close over an open one, are criteria under vp-the-engine.
- The owner's visibility over what is outstanding, and the saving on calls that are not work, are criteria under vp-rigor-without-toil.
- A counted size per record, and a finished item being the evidence, are criteria under vp-the-ledger.

TWO MEASUREMENTS CARRY FORWARD as the before side of the comparison: narration at sixteen per cent of calls, and 59 stall-guard refusals on the worst measured walk.

ONE PIECE OF SCOPE ARRIVED DURING THIS STATE and is written in the box below: a debt-reduction step inside every build milestone, seeded from the pool. It is also captured as a note.

## anything_else

ONE THING THE TOKEN SYSTEM MAKES POSSIBLE, and the owner asked for it while this state was being filled.

EVERY BUILD MILESTONE GETS A DEBT-REDUCTION STEP. One of the build steps seeded for a milestone is technical debt reduction, carrying a small budget. It is not an extra record and not a separate round; it is a step inside the building that already happens.

WHAT GOES IN IT. Small fixes and low-hanging repairs that can simply be done while the hands are already in that part of the system. Nothing that needs discussion, and nothing large.

WHERE THE CONTENT COMES FROM. At the moment the build steps are seeded, small items are pulled in from the pool into that step.

WHY THIS BELONGS IN THIS DELTA RATHER THAN SOMEWHERE ELSE. It is only cheap once work is tokens. Today a small fix in the pool has no way to land on a step: it can be carried into a whole record's goal, or it can wait. With tokens it is a place change, which is the same act as any other distribution, and the seeding step already does that job for scope arriving at a kickoff.

WHAT IT NEEDS FROM THE DESIGN. Three things, none of them new machinery.

- A way to tell a small item from a large one, so the pull is not manual every time. The complexity key already exists for routing and may serve.
- A budget on the step, so the pull stops rather than emptying the pool into the build.
- The seeding step doing the pull, at the moment the build steps are made.

IT IS RECORDED HERE AND ALSO AS A NOTE. The goals at the kickoff gate do not carry it, because that gate is signed and adding a goal reopens it. Whether it should be a goal rather than a delta line is the owner's call.
