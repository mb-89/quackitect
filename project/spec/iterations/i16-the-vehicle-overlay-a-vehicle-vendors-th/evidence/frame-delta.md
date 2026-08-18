---
form: frame-delta
by: agent
signed_off: 2026-08-18T09:59:41.887Z
reopened: "2026-08-18T09:58:13.199Z — Its gap claim argues the gap is knowledge — that nobody has solved owning a copy and still receiving from it. git-subtree's manual disproves that. The gap is the RELATIONSHIP: our copy step throws it away at the moment of copying."
authors: agent
files:
---

# Evidence form / frame-delta

## current_situation

The walk stands at frame-delta, RECHECKED a second time after the owner ruled that vendoring is ordinary.

WHAT THAT CHANGED HERE IS THE GAP CLAIM ITSELF, which is this state's central output. It said every alternative gives ownership OR a channel and none gives both. git-subtree gives both, in its own documentation. The claim was false and it has been replaced.

WHAT REPLACES IT NARROWS THE ITERATION rather than widening it. The channel is off the shelf. What is missing from every alternative is the OVERLAY — a card that wins by identity over the card it replaces, without editing it — and the report when the base moves under one.

ONE ARTIFACT WAS AMENDED AT THIS STATE, which is where a value prop is authored. vp-vendoring's outcome line ended "and never writes under the engine" — a mechanism inside a value proposition, and one that said the opposite of what the owner ruled. It now says what v2's law says, and its success criteria were rebuilt to measure the SOURCE rather than a folder inside the copy.

SO THE FRAME IS INHERITED BUT NO LONGER UNCHANGED. This delta authors no new proposition and it did move one, which is why vp-vendoring is referenced below rather than answered with `none`: gate-motivation follows every reference and reviews the artifact, and this one now needs reviewing.

## gap_claim

CITATION STATUS, STATED RATHER THAN IMPLIED. One alternative below is read at its primary source. The rest are named from familiarity with their primaries unopened, and say so per item. THE PROPER SCAN IS OWED at enumerate-space/find_prior_art, which the major column grants. Nothing here should be read as that scan having happened.

### What this claim used to say, and why it was wrong

IT CLAIMED THE GAP WAS OWNERSHIP-VERSUS-CHANNEL: that every way of taking somebody else's system gives you either ownership of what you took or a route back to where it came from, never both.

THAT IS FALSE, and the disproof is primary. git-subtree's manual, in git's own tree at `contrib/subtree/git-subtree.adoc`, fetched this session:

- "A subtree is just a subdirectory that can be committed to, branched, and merged along with your project in any way you want." — ownership.
- `merge` "doesn't remove your own local changes; it just merges those changes into the latest <local-commit>". — the channel, surviving local edits.
- "If your merge introduces a conflict, you can resolve it in the usual ways." — collisions, answered by a person.
- "changes made in your local repository remain intact and can be later split and send upstream" — the way back, explicit and never automatic.

SO THE OWNER'S RULING IS THE CORRECT READING, 2026-08-18: "We are just doing what everybody already does."

### The alternatives, and what each sheds

FORKING. Witness: ours, read this session. `RUNME.ps1 --export` at lines 57-155 copies the tree, renames the brand, and makes a fresh repository with one commit and no history. GIVES total ownership immediately. SHEDS the channel permanently, and no record of what came from where.

SCAFFOLDING FROM A TEMPLATE. GIVES the same ownership with a friendlier first five minutes. SHEDS the same channel. A scaffold is a fork with better manners. Reported from familiarity, primary not seen.

DEPENDING ON A PACKAGE — a package manager, a submodule, a pinned module. GIVES the channel, with versions and exact provenance. SHEDS ownership: you cannot change what you depend on, and an edit made anyway is destroyed by the next update without being asked. Reported from familiarity, and its failure mode is not hypothetical here.

VENDORING WITH HISTORY — git-subtree, and the same shape in other tools. Witness: PRIMARY, quoted above. GIVES ownership AND the channel AND a reviewed path back. SHEDS three things this product needs, and they are the gap.

- IT MERGES FILES, NOT IDENTITIES. Our override is not "edit their file"; it is "my card with this id is served wherever that id resolves, and theirs is untouched underneath". A file merge cannot express that, and every override becomes a permanent local edit to somebody else's file.
- IT VENDORS A PART INTO A WHOLE. A subtree is a subdirectory of your project. A descendant here IS the whole project, renamed, with the parent as its ancestor rather than its library. That is a different shape, not a smaller one.
- IT CANNOT REPORT DRIFT, because it has no idea what an identity is. When upstream renames a card an override still points at, a text merge succeeds and the override silently stops applying.

BASE-PLUS-OVERLAY CONFIGURATION, of which Kustomize is the widely used example. GIVES a channel AND a layer of your own — closest of anything here to what we want. SHEDS ownership of the base, and layers DATA rather than documents. No notion of a card whose identity decides which upstream card it replaces, and no report when the base renames something a layer still points at. Reported from familiarity, primary not seen.

THEME OVERRIDE BY PATH, as static site generators do. GIVES a layer expressed almost exactly as we want — place a file at the same relative path and yours wins. SHEDS protection in either direction: nothing stops you editing the theme in place, so the next upgrade is a merge, and nothing stops a careless mechanism reaching back the other way. Reported from familiarity, primary not seen.

### And one thing every alternative can do that none of them names

A CARELESS COPY MECHANISM CAN DESTROY THE THING IT COPIED FROM. Witness, opened: `product/spec/ledger/se/law-imports-are-read-only.md` at ref v2. On 2026-07-25 an npm `file:` dependency was implemented as a symlink into a sibling checkout, and a routine `git worktree remove --force` followed it and deleted that repository's working tree and its .git.

THE LAW'S VERDICT IS THE PART WORTH KEEPING: "The symlink was only the mechanism of the day — what actually failed was that a write reached the imported source at all."

### The gap as a claim

THE CHANNEL IS SOLVED AND WE SHOULD TAKE IT OFF THE SHELF. Owning a copy and still receiving from upstream is ordinary, documented, and shipped inside git. Building our own is the hazard, and it is now the register's headline risk rather than its headline unknown.

WHAT NOTHING ON THAT LIST OFFERS IS THE OVERLAY: a layer whose cards win by IDENTITY over the cards they replace, leaving those cards unedited underneath, so that an update can still land cleanly and a rename can still be REPORTED rather than silently swallowed.

THE THIRD SIDE NOBODY ADVERTISES IS ISOLATION AS A GUARANTEE. The alternatives that give a channel mostly give isolation by accident, because they forbid you changing anything. Give somebody ownership and isolation stops being free.

SO THE CLAIM, IN ONE SENTENCE: what is missing is not a way to copy and keep receiving — that exists — but an identity-based override layer over such a copy, which reports what moved underneath it, on a system that cannot reach back to its source.

AND THE COMMERCIAL FACT THAT MAKES THE GAP BINDING, recorded on vp-vendoring rather than argued here: this goes open source while company-specific guidance stays inside the company. A fork makes those two facts cost each other. A dependency makes the private guidance impossible to express at all.

## why_now

FOUR THINGS, and only one of them is a maturation in our own code.

THE OWNER NEEDS IT NEXT, which is the immediate cause and is stated plainly. Their words on 2026-08-18: get to a state where we can work, and start with the vehicle and the foreign project tomorrow. Before today this was a MUST value prop nobody had scheduled.

HALF OF IT IS ALREADY BUILT AND NOBODY HAD NOTICED. Witness: the export path. A descendant that runs alone, on a machine with nothing of the parent installed, is what `RUNME.ps1 --export` already produces — a real independent copy with its own repository. Goal 1 of the vision is close to met today. What is missing is everything that happens AFTER the copy.

THE CHANNEL DOES NOT HAVE TO BE INVENTED, and that is what makes the deadline reachable. Vendoring with history is a solved, documented, widely used arrangement. The work this iteration actually owes is the overlay and the drift report on top of it, which is a much smaller thing than the first version of this form implied.

AND THE RULE THIS WORK MOST NEEDS WAS ALREADY DECIDED, correctly, and was found rather than invented. `law-imports-are-read-only` at ref v2 is an owner ruling of 2026-07-25 that states the whole isolation constraint and generalises it deliberately — the direction of writes rather than a list of forbidden mechanisms. It is now minted into v3 as raid-dec-an-import-is-read-only-and-a-vendored-copy-is-yours.

WHY THAT COUNTS AS A WHY-NOW rather than housekeeping. The hardest part of this design is the interaction between ownership and isolation, and a year-old ruling settles it before the design starts. Without it M4 would argue from scratch about something already decided by the person who has to live with the answer.

WHAT HAS NOT MATURED, said so it is not claimed. Nothing about the product's own shape got easier. Method still resolves from two literal lists, no boundary carries flow-overlay, and no test in the suite touches an overlay because there is nothing to touch.

## value_props

- vp-vendoring

## business_case

WHAT THE EFFORT BUYS, in the currency that applies. There is no acquirer, so this is in the owner's terms rather than in money.

IT BUYS THE ONLY ROUTE TO OPEN SOURCE THAT KEEPS COMPANY GUIDANCE PRIVATE. vp-vendoring records that as its reason for being a MUST, and it is a constraint rather than a preference: the two facts cannot both hold without this.

IT BUYS EVERY LATER DESCENDANT AT A LOWER PRICE. Today a second product is a fork, and a fork's cost is not the copy — it is every improvement it stops receiving, paid forever. After this, a descendant costs a copy and keeps its channel.

IT BUYS THE FIRST EVIDENCE THAT THE CLAIM GENERALISES. The product asserts it drives software engineering; it has only ever driven itself. Until a foreign project exists, every measurement is of a system working on its own source.

AND IT BUYS SOMETHING THE FIRST VERSION OF THIS FORM DID NOT SEE: a guarantee somebody can rely on when they let this system near their repository. A tool that can destroy what it copied from has done so once already, in this house, and the person who lost a repository that day is the person asking for this now.

WHAT IT COSTS, so the case is not one-sided. Major is more states than minor and it will not finish today, against a constraint of starting tomorrow. The trade was argued at the kickoff and still holds: the overlay's location and its drift behaviour are real choices, and a wrong one found after the build costs more than M4 and M5 cost now.

AND THE COST FELL SINCE THAT ARGUMENT WAS MADE. Taking the channel off the shelf removes the largest thing this iteration thought it had to design. That does not change the column, which rests on a certain interface tell and on three candidate overlay locations. It does change how much has to be finished before somebody can use the result.

ONE COST IS NOT OURS TO PAY. A descendant's owner takes on maintaining what they change across updates. That is the price of owning everything, it is theirs rather than ours, and it is worth stating before somebody discovers it.

## follow_up

IMMEDIATELY: scope-non-goals and pressure-test are both open doors and both are stale, written under the sealed model.

- scope-non-goals excluded "patching the vendored engine in place", which the owner has now explicitly ALLOWED. That line goes rather than being softened.
- pressure-test's FAQ answers "we do not know yet" to the collision question. That answer is now wrong. What replaces it is what everyone else does, with our variant named.

AND SCOPE HAS A NEW QUESTION IT DID NOT HAVE THIS MORNING, which belongs at scope-non-goals rather than here: whether taking a standard vendoring mechanism is IN this iteration or whether the first descendant ships with no channel yet and an honest note saying so. Both are defensible against a deadline of tomorrow. Pretending to receive is not.

THE VALUE PROP AMENDED HERE NEEDS THE GATE'S EYES. gate-motivation follows every reference in the field above and reviews the artifact itself, so vp-vendoring's new outcome line and its four rebuilt criteria are what that gate is actually adjudicating.

THE OUTSIDE SCAN IS OWED at enumerate-space/find_prior_art and this form says so rather than pretending. One family is now read at its primary; four are named from familiarity with primaries unopened. If that state is reached and the scan is skipped, the rest of the gap claim was never earned.

AND THE SCAN HAS A SHARPER QUESTION NOW than it had this morning. It is no longer "has anybody solved vendoring" — they have. It is whether any vendoring tool resolves by IDENTITY rather than by path, and whether any of them reports that the base renamed something an overlay still points at. That is a much narrower search and a much more useful one.

THE REMOVAL OF req-engine-folder-is-sealed IS STILL CARRIED to write-requirements at M3, with the sweep of what points at it owed before the node goes.

## anything_else

WHY THIS FORM WAS REWRITTEN TWICE RATHER THAN RE-SIGNED, since a recheck normally asks only whether the ground moved.

THE FIRST REWRITE was the model correction. The old gap claim's whole argument was that alternatives lack a SEAL, and the seal is gone. Its business case sold a folder replacement. Its value_props field said `none` about a proposition this state has since amended.

THE SECOND REWRITE was the owner's correction that vendoring is ordinary, and it hit the one sentence this state exists to produce. "Every existing alternative gives you either ownership or a channel, never both" is the kind of sentence that sounds like analysis and is actually an assumption wearing its clothes. One primary document disproved it.

WHAT THE CORRECTION DID TO THE ITERATION, and it is the opposite of what a disproved claim usually does. It made the work SMALLER and better aimed. The channel comes off the shelf. What has to be built is the overlay and the drift report, which is what this product is actually about.

THE PATTERN IS NOW FIVE FOR FIVE TODAY: every retraction was something checkable that got reasoned about instead of checked. This one had a specific tell worth remembering — the phrase "every existing X" with no citation after it. A claim quantified over everything, sourced to nothing.

WHAT SURVIVED ALL OF IT, and it is the part that was never about the mechanism: forking is the alternative we actually ship, it costs every upstream improvement from the day it is taken, and vp-vendoring's commercial reason holds either way.
