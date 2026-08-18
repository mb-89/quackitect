---
form: draft-vision
by: agent
signed_off: 2026-08-18T09:52:56.170Z
reopened: "2026-08-18T09:51:47.457Z — The kickoff re-signed with six goals rather than five, and the new one — nothing a descendant does can reach its parent — appears nowhere in this packet's goal system. Removing the seal deleted a constraint pointing the wrong way and left the real one unwritten."
authors: agent
files:
---

# Evidence form / draft-vision

## current_situation

The walk stands at draft-vision, owed again after the KICKOFF was reopened and re-signed on the owner's model.

WHAT MOVED ABOVE IT. Two of the kickoff's five goals named a seal nobody asked for. They are gone, and the rebuilt list has six — one of them the isolation law, which this packet did not carry as a goal at all. That is the substantive change here.

WHY THIS PACKET FELL THE FIRST TIME, kept because it is the reason the goal list reads the way it does. It carried a SOLUTION as its first goal: "the engine writes zero files into its own folder" is a mechanism, ranked above every need. The owner's words: "sealing sounds like a solution". And the vehicle model underneath it was not theirs — a host repository holding a read-only engine folder, replaced whole at each update.

WHERE THE WRONG MODEL CAME FROM, because the source matters. req-engine-folder-is-sealed is a standing requirement minted at i1 and graded crippling, and v1's resolver comment calls the engine layer read-only. Both were read and carried in as given, without asking whether the need behind them was the owner's. They have since ruled that requirement out: "It's a standing requirement, but it's old... remove it."

SEVEN SIGNED STATES FELL WITH THIS ONE, including a blessed gate. That is correct rather than unfortunate: past gate-motivation the vision is axiomatic, so a wrong axiom poisons every state beneath it.

WHAT IS DIFFERENT ON THIS PASS. vp-vendoring has been AMENDED. Its outcome line no longer ends "and never writes under the engine", and its four success criteria were rebuilt with it. So the contradiction this packet flagged and deferred is closed rather than carried.

## goal_system

THE VISION IS INHERITED, NOT REDRAWN. The resident value prop for this delta is vp-vendoring, graded MUST. Its audience is stk-vehicle-owner, whose four concerns are stated needs from a real audience rather than inferences.

AND IT HAS BEEN AMENDED THIS SESSION, on the owner's instruction: "If that means changing the value proposition so it's clearer, then do that." Its outcome line previously ended with a MECHANISM — "and never writes under the engine" — sitting inside a value proposition. It now reads: a vehicle is a complete independent copy of the engine that its owner may change entirely, lays its own guidance over what it carries, and can still take improvements from where it came from — while nothing it does can reach that source. Its four success criteria were rebuilt with it. gate-motivation adjudicates that amendment; this state records it.

### The goals, most important first, with no mechanism in them

1. A DESCENDANT RUNS ALONE. Everything it needs is inside it. A person who installs only the descendant, on a machine that has never held the parent, can do the whole job. The owner's words: "my colleagues will not have Quack and SE installed on the same machine. They will only have SE installed."
2. NOTHING IT DOES CAN REACH WHAT IT CAME FROM. Whatever a descendant's owner changes, deletes or rebuilds inside their own copy, no consequence of it lands in the parent. Not by writing, not by a link, not by a cleanup command that follows one.
3. A DESCENDANT OWNS EVERYTHING IN IT. Anything it carries, it can change — its own guidance, its own method, and the parts the parent wrote. There is no region it must not touch.
4. WHAT IS PRIVATE STAYS PRIVATE. What a descendant's owner writes about how their organisation works never has to leave their building for them to keep receiving improvements.
5. IMPROVEMENTS TRAVEL BOTH WAYS. A descendant can take what the parent learned after it left, and the parent can take what the descendant learned. Neither direction is a re-clone and neither is automatic.
6. A DESCENDANT CAN WORK ON ITSELF. While driving somebody else's project it can notice a fault in its own machinery, record it, and repair it in its own next iteration — without becoming a different tool to do so.

WHY GOAL 2 IS SECOND, AND WHY IT WAS MISSING. The first version of this list did not carry it at all, because the sealed model it was written under had the protection pointing the WRONG WAY — it guarded the copy from its owner instead of guarding the source from the copy. Correcting the model deleted the false constraint and left the real one unwritten.

IT RANKS SECOND BECAUSE ITS FAILURE IS THE ONLY UNRECOVERABLE ONE HERE. Every other goal fails by disappointing somebody. This one fails by destroying something that was never part of the bargain, and it has already happened once in this house: on 2026-07-25 an npm `file:` dependency was implemented as a symlink into a sibling checkout, and a routine `git worktree remove --force` followed it and deleted that repository's working tree and its .git.

AND IT IS A NEED RATHER THAN A MECHANISM, which is what earns it a place after the correction that removed the last one. It says nothing about how copies are made. It says what must never happen to a neighbour.

WHY THE REST ARE ORDERED AS THEY ARE. Goal 1 is first because it is the only one whose failure makes the others pointless: a descendant that needs the parent installed is not a descendant. Goal 3 is next because it is what separates this from every arrangement where somebody hosts our code. Goal 4 follows because it is the constraint that makes the whole thing commercially necessary rather than merely nice. Goals 5 and 6 are what make the descendant a peer rather than a snapshot, and they are last because a system that got 1 to 4 right and 5 wrong would still be useful.

### The conflicts, named openly and ruled

THE CENTRAL ONE, AND IT IS THE DESIGN PROBLEM THIS ITERATION EXISTS TO SOLVE: OWNERSHIP FIGHTS RECEIVING.

The more a descendant changes what it carries, the harder it is for it to take what the parent later changes in the same place. Perfect ownership means never receiving. Perfect receiving means never changing anything.

RULED: OWNERSHIP WINS, AND THE RULING COSTS SOMETHING REAL. A descendant that cannot change part of itself is not self-sufficient, and goal 1 is first. So goal 3 stands unqualified.

WHAT THE RULING BUYS IS A PROBLEM RATHER THAN A SOLUTION. Buying goal 5 back, on top of an unrestricted goal 3, is the hard question of this iteration and it is exactly what M4 and M5 are for. Any earlier packet that made this conflict disappear did so by quietly taking goal 3 away.

SECOND, AND IT IS THE ONE GOAL 2 CREATES: ISOLATION FIGHTS SENDING BACK. Goal 5 says improvements travel upward. Goal 2 says nothing a descendant does reaches the parent. Read carelessly they cancel.

RULED: BOTH STAND, BECAUSE THEY ARE ABOUT DIFFERENT THINGS — and the owner drew the line themselves. "If I have a process that analyzes the changes and pushes them back as notes as design input to the vendor, that's okay." What is forbidden is a descendant's operations REACHING the source: a write, a link, a mount, a delete that follows one. What is allowed is information ARRIVING at the source through a door the source opened, to be read and decided on there. The rule names the DIRECTION OF WRITES rather than any mechanism, deliberately, because naming one forbidden mechanism only invites the next one.

THIRD: PRIVACY FIGHTS SENDING BACK. Goal 5 says improvements travel upward. Goal 4 says what a descendant's owner writes never has to leave their building. Some of what they change WILL be ours, and some will be theirs, and the two live in the same tree.

RULED: PRIVACY WINS, AND THE CHOICE IS THE DESCENDANT'S OWNER'S RATHER THAN OURS. Nothing travels upward that they did not choose to send. A mechanism that made sending automatic would be a mechanism nobody in their position could adopt.

FOURTH: WORKING ON ITSELF FIGHTS WORKING ON SOMETHING ELSE. Goal 6 has a descendant noticing its own faults while driving another product. Those are two different pieces of work with two different records.

RULED: THE FINDING IS RECORDED IMMEDIATELY AND THE REPAIR WAITS. That is what the owner described — write itself a note now, fix it in its own next iteration — and it is the same discipline the contract already applies to a stray: capture it, keep walking. No new rule is needed, only the recognition that the note's subject can be the machinery rather than the work.

FIFTH: A WORKING DESCENDANT FIGHTS A COMPLETE ONE. The owner's constraint is that the vehicle and a foreign project start tomorrow.

RULED: WORKING WINS, AND WHAT IS CUT IS NAMED. Everything dropped is listed at scope-non-goals with where it went, so the cut is visible rather than quiet. This is the one conflict whose ruling comes from outside the corpus, recorded here so a later reader sees a deadline shaped it.

AND THE CONFLICT THE COLUMN CORRECTION EXPOSED, kept because it still holds under the new model. Getting this right pulls against getting it soon, and the kickoff ruled in favour of right — a wrong answer found after the build costs more than the M4 and M5 rows cost now. Under the owner's model that ruling is stronger, because ownership-versus-receiving is a harder question than the one the first packet asked.

## follow_up

IMMEDIATELY: define-actual, log-risks, frame-delta, scope-non-goals and pressure-test were all rebuilt on this model before the kickoff reopened and dropped their signatures. They are re-signs rather than rewrites. Each still gets read against the SIXTH goal, which is new to this packet.

WHAT THE NEW GOAL CHANGES DOWNSTREAM, named so the re-walk does not have to rediscover it.

- log-risks already holds the isolation law as raid-dec-an-import-is-read-only-and-a-vendored-copy-is-yours. It is now backed by a goal rather than standing alone as a decision.
- write-requirements owes a SPAWNING-MECHANISM constraint: no symlink, junction, hardlink, mount, or install step that writes to the source. Goal 2 is the need; that clause is how it becomes checkable.
- draw-context owes the mirror clause, which the pressure-test FAQ found and the audience had already asked for: what stops the PARENT reaching into a descendant. Today the honest answer is that we have no path, which is a happy fact rather than a guarantee.

THE STATE THAT NEEDS REBUILDING RATHER THAN RE-SIGNING IS draw-context. Its boundary put the engine inside and a host outside, with writes crossing neither way. Under this packet a descendant CONTAINS everything, there is no host, and what sits outside is the PARENT. nbr-host-repository was minted for the old shape and needs replacing rather than editing.

ONE CORPUS CONTRADICTION IS RESOLVED AND ONE IS NOT. vp-vendoring's outcome line no longer carries a mechanism — amended this session. req-engine-folder-is-sealed still stands and still says an engine version replaces the vendored folder WHOLE with zero merge operations, which cannot hold if a descendant modifies what it carries. The owner has ruled it removed. It comes out at write-requirements after sweeping what points at it, because i34 deleted ten requirements without that sweep and had to restore two.

THE RAID DECISIONS OPENED AT log-risks HAVE BEEN RE-READ AGAINST THIS PACKET, and their dispositions stand: raid-dec-the-seal-outranks-the-overlay and raid-dec-probe-the-engine-folder-rather-than-move-it are superseded, and raid-risk-a-sealed-engine-cannot-be-patched-by-the-builder-who-hits-the-bug is discharged. All three are marked rather than deleted, so a later reader sees what this iteration believed this morning.

AND ONE THING IS STILL OWED FROM OUTSIDE: the prior-art scan against tools people actually use. gate-motivation passed on that condition and enumerate-space is where it runs.

## anything_else

WHAT THIS RETRACTION COST AND WHY IT WAS STILL CHEAP.

SEVEN SIGNED STATES FELL, one of them a blessed gate, and roughly an hour of writing goes with them. That is the expensive-sounding half.

THE CHEAP HALF IS THAT IT HAPPENED AT M2. The states below — requirements, functions, criteria, candidates, architecture, spikes, tests, build — had not been written yet. Every one of them would have inherited a vision that said a descendant may not change what it carries, and the error would have surfaced when somebody tried to use the thing.

AND THE SECOND PASS FOUND SOMETHING THE FIRST CORRECTION MISSED, which is the argument for re-reading rather than re-signing. Removing the seal deleted a constraint pointing the wrong way and left the real one — nothing may reach the source — written nowhere in the goal system. It survived only as a RAID decision. A decision with no goal behind it is a rule somebody can trade away, and this is the one rule that must never be traded.

THIS IS THE FOURTH RETRACTION IN THIS SESSION AND THEY SHARE ONE CAUSE. Something checkable was reasoned about instead of checked, or something authored was read as given instead of questioned. The retro's two rested on an absent file and an absent string. The column rested on "there is one design". This one rested on a standing requirement and a comment in v1's source, both read carefully and neither interrogated.

THE PATTERN IS SPECIFIC ENOUGH TO NAME: a document that STATES A CONSTRAINT is not the same as a person who WANTS one. req-engine-folder-is-sealed says the engine folder is sealed. It does not say the owner wants it sealed, and nobody had asked.

WHAT WOULD HAVE CAUGHT IT EARLIER, and it is not more caution. The first version of this packet had a goal reading "the engine writes zero files into its own folder", which is a sentence about FILES rather than about anybody's need. A goal that can be tested by counting writes is a mechanism. Reading the goal list back and asking what each one is FOR would have found it before the gate did.

## big_idea

INHERITED, NOT REWRITTEN. The resident vision stands at project/spec/trace/value-prop/vp-the-engine.md, and this iteration serves it rather than bending it.

ITS BIG IDEA, unchanged: draw YOUR process as a state machine and the engine gives it teeth. The engine attaches CONSEQUENCES to the drawing — a state refuses tools, a gate refuses passage, a claim refuses collision.

THE DELTA THIS ITERATION ADDS, in one breath: THE ENGINE REPRODUCES. It can bring into being a new, complete, independent copy of itself that somebody else owns entirely — and that copy stays in touch with where it came from.

WHAT THAT MEANS FOR A PERSON, with no method words in it. Somebody installs one thing, on one machine, and has a whole working system. Everything in it is theirs to change, including the parts we wrote. They can still take what we learn afterwards, and we can still take what they learn.

WHY THAT IS THE SAME IDEA RATHER THAN A NEW ONE. "Draw YOUR process" is the vision's own first word, and it has never been true for anyone but us. This is the first time the word YOUR has a second person to mean.

WHAT IT IS NOT, said because the first draft of this packet got it wrong. It is not installing our thing inside their thing. There is no arrangement where somebody needs both. A person running the descendant has never heard of the parent and does not need to.

## to_be_world

POINTER PLUS DELTA. The to-be world of vp-the-engine is alive already, and this changes who is allowed to live in it and on what terms.

A COLLEAGUE'S MACHINE, on a Tuesday. They have one thing installed and it is not ours — it is the descendant, with its own name. They open its folder, the desk greets them, and they start work. Nothing on that machine knows the parent exists. They never installed it, never cloned it, and would not know where to look for it.

THE SAME PERSON, THREE WEEKS IN. Their organisation works a particular way and the descendant now says so. Some of what it says was written here; some was written by them, over the top; some of what we wrote they simply changed, in place, because it is theirs. Nobody had to ask which category a file was in before editing it.

WHAT THEY ARE CAREFUL ABOUT, and it is the one thing: what they wrote is theirs alone. It describes how their company works and it never leaves the building. That is not a preference. stk-vehicle-owner's node records it as a stated need from a real audience, corrected by the owner on 2026-08-06 after an agent assumed the role was hypothetical.

A MONTH LATER, AND THIS IS THE PART A FORK CANNOT DO. We fix something in the parent. They take that fix. They did not re-clone, did not merge a fork by hand, and did not give up the changes they made in the meantime.

AND IT RUNS THE OTHER WAY TOO. They fixed something that was ours. It comes back to us, and it arrives as a change somebody can look at and place, rather than as a mystery diff. What travels back is their choice, not ours.

THE SCENE NOBODY WATCHES, WHICH IS THE POINT OF GOAL 2. That colleague deletes half of what the descendant shipped with, renames its folders, and runs whatever cleanup their tooling offers. Somewhere else entirely, on a machine they have never seen, the parent is untouched — not because anybody was careful, but because there was never a path. THE WORLD WHERE THIS GOES WRONG IS NOT HYPOTHETICAL: on 2026-07-25 in this house, a dependency link and a routine cleanup command between them deleted a repository's working tree and its history.

THE DESCENDANT WORKING ON ITSELF, which is the scene that makes it a peer rather than a copy. It is driving somebody's project and, in the middle of that, it hits a fault in its own machinery. It writes itself a note. Next time it runs an iteration on ITSELF, that note is waiting. The same system that builds their product also maintains itself, and nobody switched tools to do the second thing.

WHAT IT COSTS TO LIVE THERE, said plainly rather than skipped. Owning everything means owning the consequences of changing it. A descendant that rewrites something we also change will meet that collision when it takes the next update, and somebody has to decide what wins. That is real, and this packet does not pretend a mechanism dissolves it.

AND ONE HOUSE STAYS ODD. This repository is the parent. It is not a descendant of anything and it has nowhere to pull from, so parts of the world above simply do not apply to it.

## moore_pitch

FOR a builder who wants this machine for their own product and their own way of working,

WHO today must choose between taking our method with it and forking away from everything we fix afterwards,

THE vehicle

IS a complete, independent descendant of the engine, which they own outright,

THAT runs on its own with nothing of ours installed beside it, lets them change anything in it, and still lets improvements pass in both directions.

UNLIKE A FORK — which is not a hypothetical alternative but the one this product ships today, at RUNME.ps1 lines 57-155, copying the whole tree and committing once into a fresh repository — a fork gives you exactly the first two of those and takes the third away permanently.

OURS KEEPS THE CHANNEL OPEN AFTER THE COPY. That is the whole difference, and it is the only part that is hard.

AND THE COMMERCIAL FACT UNDERNEATH, recorded on vp-vendoring rather than argued here: this goes open source while company-specific guidance stays inside the company. A fork makes those two facts cost each other.
