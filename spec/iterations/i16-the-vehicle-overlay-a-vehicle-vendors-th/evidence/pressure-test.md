---
form: pressure-test
by: agent
signed_off: 2026-08-18T10:02:17.973Z
reopened: 2026-08-18T10:01:06.622Z — Its FAQ answers "we do not know yet" to what happens when an update lands on a file the descendant changed. That question has an ordinary answer, quoted from git-subtree's own manual, and a hostile reader would not accept the old one.
authors: agent
files: null
---

# Evidence form / pressure-test

## current_situation

The walk stands at pressure-test, RECHECKED after the owner ruled that vendoring is ordinary.

THE FAQ'S SECOND ANSWER WAS THE PROBLEM. Asked what happens when an update lands on a file the descendant already changed, it said "we do not know yet" and called that the design question of the iteration. A hostile reader would not accept that, and they would be right: the answer is ordinary and it is documented.

WHAT THE CORRECTION DOES TO THIS STATE'S JOB. A PR-FAQ is cheap insurance, and insurance that names the wrong hazard is worse than none. The hard questions are now different questions.

THE SHARPEST ONE SURVIVED BOTH CORRECTIONS UNCHANGED, which is the strongest thing this state can report: what do I get that a fork does not give me on day one?

## prfaq

### Press release — the to-be world with the change in it

THE ENGINE NOW HAS CHILDREN.

Until today, taking this system meant taking our way of working with it. The engine and its method shipped as one tree, so anyone who wanted the machine either adopted our method or forked and lost everything we fixed afterwards.

From this release the engine can bring a DESCENDANT into being: a complete, independent copy under its own name, which its owner holds entirely. Everything in it is theirs. They change their guidance, their method, and the parts we wrote, in place, without asking which category a file belongs to.

It runs on one machine with nothing of ours beside it. A colleague clones the descendant and works. Nothing on that machine knows the parent exists, and nothing needs to.

What that colleague writes about how their company works stays in their building. It never has to travel anywhere for them to keep receiving.

And the descendant stays in touch, the ordinary way. It vendors what it came from, so improvements we make after it left can be merged in, and its own changes survive that merge. Where the two collide, a person decides. Nothing we send can overwrite what they chose.

Nothing it does can reach us on its own. That is not a promise about behaviour — it is a rule about the direction of writes, decided after a symlink and a routine cleanup command deleted a repository in this house on 2026-07-25. What travels back up travels as a proposal somebody reads.

WHAT IS NEW IS NOT THE COPYING, and we should say so plainly. Vendoring a system and still taking its updates is ordinary. What is new is the OVERLAY: a card the descendant writes wins over the card it replaces by IDENTITY, leaving ours untouched underneath. So an override is not an edit to somebody else's file, and an update does not have to fight it.

"My colleagues will not have Quack and SE installed on the same machine," the owner said. "They will only have SE installed."

### FAQ — hostile, and the hardest one is first

Q. IF I OWN EVERYTHING AND CAN CHANGE EVERYTHING, WHAT DO I ACTUALLY GET THAT A FORK DOES NOT GIVE ME ON DAY ONE?

A. ON DAY ONE, NOTHING. A fork is simpler, freer, and identical in every way you can observe in the first week. The entire difference is what happens at month three, when we fix something and you want it. IF WE DO NOT KEEP THE CHANNEL, THIS IS A FORK WITH A LONGER NAME. That is the whole bet of this iteration.

Q. YOUR UPDATE LANDS ON A FILE I ALREADY CHANGED. WHAT HAPPENS?

A. WHAT HAPPENS EVERYWHERE ELSE. Your change stays, ours merges in beside it, and where the two touch the same lines you resolve it — once, by hand, like any merge. git-subtree's manual says it in one line: "If your merge introduces a conflict, you can resolve it in the usual ways." AN EARLIER VERSION OF THIS FAQ ANSWERED "we do not know yet", which was wrong and made an ordinary arrangement sound like research.

Q. FINE, BUT HOW WOULD YOU EVEN KNOW WHAT I CHANGED?

A. THE VENDORING TOOL KNOWS, BECAUSE IT KEEPS THE RELATIONSHIP. That is the entire difference between vendoring and copying, and it is why the copy step is what this iteration has to change. Our export today makes a fresh repository with one commit — after that nobody can answer your question, including you.

Q. THEN WHAT ARE YOU ACTUALLY BUILDING, IF THE HARD PART IS OFF THE SHELF?

A. THE OVERLAY, AND THE REPORT WHEN IT DRIFTS. Merging text is solved. What no vendoring tool can do is resolve by IDENTITY: your card with a given id is served wherever that id resolves, and ours stays untouched underneath rather than being edited away. And when we rename a card your overlay still points at, a text merge succeeds while your override silently stops applying. Nothing off the shelf can tell you that, because nothing off the shelf knows what an identity is.

Q. WHAT STOPS YOU REACHING INTO MY COPY?

A. WE HAVE NO PATH TO IT. Your descendant is a separate repository on a machine we never see, with no link, mount or dependency pointing anywhere near us. The isolation runs both ways, and it runs by construction rather than by our good behaviour. It should be a requirement rather than a happy fact, and that is folded below.

Q. I RENAMED THE WHOLE THING TO SE. DOES YOUR UPDATE STILL MAKE SENSE, OR HAVE I JUST BROKEN EVERY REFERENCE?

A. THE RENAME IS ONE FILE, and this one has a good answer. RUNME.ps1 lines 28-33, read this session: "THE PRODUCT NAME IS ONE FACT (brand.json at the root). Nothing below spells it out, so an export renames the whole system by writing that one file." So renaming does not scatter your name through the tree, and an update from us never refers to a name that moved.

Q. WHY SHOULD I TRUST THIS SYSTEM NEAR MY REPOSITORY AT ALL?

A. BECAUSE WE DESTROYED ONE ONCE AND WROTE THE RULE. On 2026-07-25 an npm `file:` dependency was implemented as a symlink into a sibling checkout, and a routine `git worktree remove --force` followed it and deleted that repository's working tree and its .git. The rule that came out of it names the DIRECTION OF WRITES rather than the mechanism, deliberately, because a rule naming one forbidden mechanism only invites the next one.

Q. YOU HAVE NEVER RUN THIS ON ANYTHING BUT YOURSELVES. WHY BELIEVE IT WORKS?

A. YOU SHOULD NOT, YET. project/product.md declares this product self-hosting and no foreign project has ever been driven. The first descendant is the proof and nothing before it is.

Q. IS THIS JUST A PROJECT TEMPLATE WITH EXTRA CEREMONY?

A. IT WOULD BE, WITHOUT THE OVERLAY. A template gives you a complete independent copy you own. Vendoring gives you the channel. Both are available today without us. The overlay is the part that is ours, and it is the part that lets you say how YOUR company works without editing over what we shipped.

Q. WHAT DO I OWE YOU IN RETURN?

A. NOTHING, AND THAT IS DELIBERATE. Sending your improvements back up is out of scope for this iteration, on the owner's own ruling, and when it comes it will be a process that ANALYSES changes and offers them as notes rather than anything that writes into us. What travels is your choice, and it goes as a proposal somebody reads.

## findings_folded

THREE THINGS THE FAQ COULD NOT ANSWER CLEANLY, each folded rather than left looking answered. THE PREVIOUS VERSION FOLDED FOUR, and one of them dissolved.

### What dissolved, and it is the most important line here

THE PREVIOUS FAQ FOLDED THREE OF ITS OWN QUESTIONS into raid-risk-ownership-and-receiving-pull-against-each-other, calling them one question at three depths: what do I get, what happens on a collision, and how would you know.

TWO OF THOSE THREE NOW HAVE ORDINARY ANSWERS. A collision is resolved by a person, in the usual way. What changed is knowable because a vendoring tool keeps the relationship. Both are quoted from git-subtree's own manual rather than reasoned about.

SO THE FOLD WAS PARTLY WRONG, and the register entry it fed has been rewritten. It no longer says receiving is unsolved. It says the hazard is INVENTING a mechanism when standard ones exist, which is a risk we can actually manage.

WHAT SURVIVES OF THAT FOLD IS THE FIRST QUESTION ALONE: if the channel is not kept, this is a fork with a longer name. That still belongs on the record and it is still the honest failure mode of the whole iteration.

### One — the overlay is the only unbought part, and no register entry says so

THE FAQ'S FOURTH QUESTION IS NEW and it is the one a serious reader asks second: if the hard part is off the shelf, what are you building?

THE ANSWER HELD, and it is sharper than anything the previous version could say. Vendoring merges FILES. The overlay resolves IDENTITIES, so an override never edits the thing it overrides. And when upstream renames a card an overlay points at, a text merge succeeds while the override silently stops applying — which nothing off the shelf can detect, because nothing off the shelf knows what an identity is.

WHERE IT GOES: raid-dec-serve-the-overlay-and-report-the-drift already holds the drift half and was re-read at log-risks this session. What it did not have until now is the ARGUMENT for why the report cannot come from the vendoring tool. That belongs on the node, and it belongs in the requirements at M3.

### Two — isolation runs both ways and only one way is written down

raid-dec-an-import-is-read-only-and-a-vendored-copy-is-yours settles that nothing a DESCENDANT does may reach the parent automatically. The FAQ asked the mirror question — what stops the parent reaching into the descendant — and the honest answer is that we have no path, which is a happy fact rather than a guarantee.

WHERE IT GOES: write-requirements, as a clause. A builder asked to trust their repository to this will want it stated, and "we could not find you if we tried" is only true while nothing ever tries.

AND THE AUDIENCE ALREADY ASKED FOR IT. stk-vehicle-owner's concerns include "what the engine writes must never land inside their tree, and what they write must never land inside the engine's" — both directions, stated by the role a year before this FAQ rediscovered one of them.

### Three — the rename holds, and that is a finding rather than a relief

RUNME.ps1 lines 28-33 record a real design decision: the product name is ONE FACT in brand.json and nothing below spells it out. That is why a descendant can rename itself without scattering its identity through the tree, and why an update never refers to a name that moved.

AND IT MATTERS MORE UNDER VENDORING THAN IT DID BEFORE. A descendant that spelled its own name through a hundred files would meet a hundred conflicts on every merge. One fact at the root means a rename costs one line of conflict, once.

WHERE IT GOES: write-requirements, as a constraint to PRESERVE rather than to build. It is easy to break by accident — one hardcoded product name anywhere below the brand file undoes it — and nothing checks it today.

AND IT CONNECTS TO A STANDING RULING. v1 rejected substituting brand names at RENDER time, because rewriting text the ledger hashes hides content from the trust chain. One fact at the source, and no substitution at the surface, are the same decision seen twice.

### What the FAQ did NOT shake

THE GOAL ORDER HELD. Every hostile question that pushed on ownership was answered by goals 1 and 3 standing where they are, and none made that ordering look wrong.

THE ISOLATION RULE HELD ABSOLUTELY, and it was the only answer in the FAQ needing no hedge. It is the one thing here that is decided rather than designed, and it was decided by somebody who had already paid for getting it wrong.

AND THE FIRST QUESTION STILL HAS NO COMFORTABLE ANSWER, which is how it should be. On day one you get nothing a fork does not give you.

## follow_up

IMMEDIATELY: gate-motivation, where the vision stops being arguable. It follows every value-prop reference and reviews the artifact, so it reviews the AMENDED vp-vendoring — new outcome line, four rebuilt success criteria — rather than the one the first gate saw.

THE GATE INHERITS EIGHT REGISTER ENTRIES, five standing and three killed by the model correction. The three killed carry their reasons and should be read as part of the picture: they are what this iteration believed this morning.

AND ONE STANDING ENTRY WAS REWRITTEN RATHER THAN KILLED. raid-risk-ownership-and-receiving-pull-against-each-other now says close to the opposite of what it said: the hazard is inventing a mechanism, not the absence of one. A gate reading the register should read that node rather than its title.

THREE FOLDED FINDINGS CARRY FORWARD with named destinations.

- Why the drift report cannot come from the vendoring tool, onto raid-dec-serve-the-overlay-and-report-the-drift and into the requirements at M3.
- The parent's isolation from the descendant, as a clause at write-requirements, and the audience asked for it first.
- The one-fact product name, as a constraint to preserve at write-requirements, with nothing checking it today.

THEN draw-context, whose boundary is wrong in its central claim and needs rebuilding rather than rechecking. It put the engine inside and a host outside with writes crossing neither way. Under the corrected model a descendant CONTAINS everything, there is no host, and what sits outside is the PARENT.

AND TWO THINGS THIS STATE WANTS THE GATE TO PRESS ON. The FAQ's first answer is still "on day one, nothing" — a motivation gate that does not sit with that sentence has not read this form. And the fourth answer now carries the whole justification for the iteration's cost: the overlay is the only part nobody sells.

## anything_else

