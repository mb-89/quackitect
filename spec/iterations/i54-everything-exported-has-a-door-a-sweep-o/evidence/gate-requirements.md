---
form: gate-requirements
bless: blessed by agent
by: agent
signed_off: 2026-08-26T11:54:07.121Z
authors: agent
files: null
---

# Evidence form / gate-requirements

## current_situation

M3 is walked. Six requirements, six functions, seven flows and six assumptions stand, and every one of the eight owed probe cells is answered.

The register is binding from here. What passes this gate is the demand, not the design.

One probe came back FALSE and it is the most useful result in the milestone. The seven neighbours do not map one-to-one onto doors, and the walk that showed it also produced the door set.

## round_0_verify

- evidence vs claims: Every cited file was opened rather than remembered. The exemption precedent is deliverable/engine/trace.ts line 333, the matching pattern is deliverable/engine/widgets.ts line 136, and the exemption list itself holds one bullet at line 51. TWO CLAIMS WERE CORRECTED BEFORE THEY BOUND. An earlier count treated the importers of files.ts and web.ts as adherence figures, which they are not — both face the agent, not the engine — and it was retracted on the record. A probe body claimed a bound of 26 modules; the measured figure is one, and the node was patched before the form carried it.
- types: Nothing to run. This milestone changed no source file, only spec and guidance, so the lane's post-edit typecheck had nothing to answer.
- lint: The voice lint is not legal at a gate and the refusal was followed rather than routed around. The corpus sweep ran instead, which has no lane verb of its own. 3053 nodes under spec in 974 ms, markers green, widget guard green, exit 0.
- tests: Nothing to run, and se_test is not legal at this gate either. No source changed, so the engine's own answer to this tree is its last verdict.

## round_1_validate

- exercised against the goal: Seven kickoff goals, answered one at a time in goals_served below. Four are served by standing evidence. Three are honestly owed to a later milestone and each names which one.
- missing: The 52 outward network sites are still unjudged — gate-inputs made that a condition on this gate and it has not been discharged. The ten-file sampling probe over the remaining engine-core writes is unrun, and its own node names M4 as the state that runs it. Both are carried into follow-up rather than waved through.
- wrong: One assumption was falsified by its own probe. raid-asm-each-neighbour-holds-one-conversation-with-this-system is now an issue. Nothing fell with it — the two nodes that named it are strengthened, because both say the unit is a conversation and the walk is what showed a conversation is not a neighbour.
- out of scope: Caching, batching and a warm model stay non-goals with their reason recorded at draw-context. Renaming existing doors is out of scope for a different reason worth stating — no engine-facing door exists yet, so there is nothing to rename. The agent-facing lane is a different customer and is untouched.
- prior art: SIX SYSTEMS WERE COMPARED, in prior-art-one-door.md, plus Cockburn's own 2005 paper read at the primary. WHAT THEY DO BETTER. Rust and ESLint both retire an exception that has stopped being needed; we have nothing. ArchUnit freezes a violation count and ratchets a large codebase onto a rule in stages; we move 79 modules or none. Bazel names one exception for a whole group of callers; a flat per-site list repeats itself. WHAT OURS SHEDS. dependency-cruiser generates its baseline and documents its comment field as not used in any rule logic, so the author is shed on the way in. ArchUnit has no reason field at all. Go has no hatch. Bazel names who, never why. Only ESLint can force a reason, and only through an opt-in third-party plugin. THE COMPARISON THAT COULD NOT BE MADE. Ours does not exist yet, so no claim is made that it is better in practice. All three of their advantages are registered as risks rather than answered.

## goals_served

- Replace the hand-written entry-point list with a sweep over every exported entry point, so the guard stops depending on somebody maintaining a list: SERVED as a demand. req-the-reachability-guard-enumerates-exports-from-the-source binds the enumeration to the source that defines the exports, and fn-govern-a-conversation-under-a-stated-rule.enumerate-what-a-rule-governs is what the system does about it. The assumption underneath was probed and holds — zero computed exports across the engine tree, so a static read can see all of them.
- Name everything exported that no surface can reach, and answer each one with either a door or a deletion: SERVED as a demand, not as a list. sty-find-working-code-that-no-surface-can-reach and uc-answer-every-export-with-a-door-or-a-deletion carry the story and the case; fn-govern-a-conversation-under-a-stated-rule.judge-each-governed-thing produces one verdict per governed thing. Producing the actual list is M6.
- Give the two already-found pieces their door, so a capability the tests prove is a capability somebody can use: NOTHING YET — M6 owns it. No design-input state can build a door, and none could have served this goal earlier.
- Establish whether one door per capability actually pays here, by judging the measured sites rather than by counting them again: SERVED, and it is the one goal answered by measurement rather than by authoring. All 64 write sites in the seven heaviest modules were read individually. 42 sit in the pile a door improves, 22 in the pile it only lengthens, and a majority in the second pile was the stated falsifier. THE WIN IS NARROWER THAN THE HEADLINE. Thirty of the 64 are one shape — a read, change and write back of a claim or a form — so the object that pays is a claim writer rather than a facade over disk. run.ts is the clean counter-example at 0 of 10. The sampling bias is registered as its own assumption.
- Build the disk door and its declared exception list, generalising the shape that already governs widget markup: NOTHING BUILT YET — M6 owns the build. What this milestone did produce is the binding shape it must take: one rule expressed once, two callers reading it, a departure that carries its reason, a not-exempt default, and no blanket off switch. The precedent it generalises was read at the source — deliverable/engine/trace.ts line 333 already refuses a reasonless EARS exemption, at node level rather than module level.
- Give reaching outward a central door that earns its keep, with guidance for a search and a place results are kept: PARTLY SERVED, and the gap is named rather than hidden. The outward conversation is now one of the four doors, established by the neighbours walk, so the door itself is identified. What it DOES once it holds a call is not specified here, and the 52 network sites are still unjudged. That judgment pass was made a condition at gate-inputs and it is carried forward as owed.
- Record a reason for every door proposed and dismissed, so a dismissal is evidence rather than silence: SERVED, and this is where the milestone did its most concrete work. The neighbours walk proposed seven doors and dismissed three, each with its reason on the record. The toolchain and the driven project were merged because both are addressed with a path and answer with bytes, and a root is an argument rather than a conversation. Obsidian was dismissed because it changes the tree without speaking, which is why the sweep exists. The cloud host was dismissed because it is a condition rather than a party. The syscall door the owner proposed was also dismissed with its reason — nothing here holds a conversation with the kernel that is not already the byte conversation.

## bound_breaches

- if-agent-harness-to-entrypoint: NOT MEASURED IN THIS MILESTONE, and that is the honest answer rather than a green one. No state in M3 calls that interface, so nothing exercised it and nothing could have breached. The measurement belongs to a milestone that runs the entrypoint, and reporting it as unbreached here would be reporting an absence of calls as a passing result.

## round_2_red_team

- STEELMAN FIRST. The strongest case against this design is that it buys enforcement everybody already has and pays for it with a field nobody reads. dependency-cruiser, ArchUnit and Go all stop a forbidden reach without asking anybody to justify one. Our whole differentiator is the reason column, and a required field makes a value non-empty rather than considered. If the reasons turn out to be boilerplate, we have bought the same enforcement at a higher price and shipped a decorative column with it. => THE KILL CRITERION IS EXACTLY THAT, and it was looked for rather than argued away. The one standing reason in the exemption list names the diagram check, what a maintainer does with it, and why the panel never reaches it — specific on all three counts. The sample is ONE LINE, written by people who knew it was an experiment, so it is weak evidence in the right direction and not a verdict. It is registered as raid-asm-a-demanded-reason-is-a-considered-reason, and that node lists two stronger designs than a longer field.
- Four doors is a satisfying number and satisfying numbers are where confirmation bias lives. Cockburn favours two, three or four ports, and a walk that knew this could have found its way to four. => The method was fixed before the count. Each neighbour got one sentence naming what we say and what it says back, and the merges are checkable by anyone who reads the two sentences side by side. The toolchain and the driven project are both a path in and bytes out; the root is the only difference. Git was the close call and was kept separate on a stated ground — its vocabulary is commits and refs, and it fails with a conflict, which has no counterpart on the byte side.
- Every comparable system with an escape hatch also carries expiry, a ratchet, or grouping. We carry none of the three, so our hatch silts up in exactly the way theirs do not. => All three are registered as risks and all three are named in excluded_use as non-goals with their reason. This is a tradeoff taken deliberately, not a gap nobody noticed. What we pay is a list that grows and never shrinks; what we gain is a design small enough to build in one milestone.
- A refusal at write time cannot see a write that carries no path, and a shell heredoc carries none. So the guard the requirement demands has a hole in it from the first day. => Registered, and it is why the requirement demands TWO callers of one rule rather than one. The sweep reaches what the refusal cannot. The hole itself already stands in this repository as an issue about the shell writing with no path to judge.
- The whole one-rule two-caller shape is generalised from a single precedent, and one precedent is an anecdote. => Registered as raid-asm-the-widget-guards-shape-generalises-to-a-second-rule. What raises it above an anecdote slightly is that the SAME shape appears twice in the tree independently — the widget guard at module level, and the EARS exemption at trace.ts line 333 at node level. Two is still not many.
- The 42-to-22 figure that justifies the door's reach came from the seven modules chosen for carrying the most writes, and a module carries many writes partly because it repeats one shape. The sample is biased toward the answer it gave. => Registered as its own assumption, graded corrosive, and its probe is scheduled on M4 rather than claimed here. 42 of 64 is an upper bound on how well a door does, not an estimate of it, and the gate passes on that reading rather than on the headline.

## raid_additions

- spec/trace/raid/raid-asm-every-export-in-this-tree-is-declared-statically.md
- spec/trace/raid/raid-asm-the-toolchain-here-enumerates-exports-with-no-new-dependency.md
- spec/trace/raid/raid-asm-every-write-that-adds-a-departure-passes-through-the-lane.md
- spec/trace/raid/raid-asm-an-exemption-key-reads-the-same-on-every-platform.md
- spec/trace/raid/raid-asm-each-neighbour-holds-one-conversation-with-this-system.md
- spec/trace/raid/raid-asm-an-author-refused-at-write-time-states-a-usable-reason.md

## verdict

pass — the register is complete, consistent and traced both ways, every mechanical check is green, and the one assumption that failed its probe strengthened the requirements rather than breaking them; two known gaps are carried forward named and owned rather than hidden, and neither of them is a demand nobody wrote.

## follow_up

THREE THINGS ARE OWED AND EACH HAS AN OWNER.

The outward door's 52 network sites are still unjudged. That was a condition set at gate-inputs and this gate does not discharge it. It belongs to the state that sets the door's scope.

The ten-file reading pass over the remaining engine-core writes is scheduled on its own node's instruction, and it runs before the door's scope is set rather than after.

The containment predicate fix needs no door at all and is first in the build order. The same predicate is written five times outside paths.ts, and the two copies guarding recursive deletes disagree about whether an absolute path is checked.

TWO PROBES NEED A MACHINE THIS IS NOT. The platform one needs Windows. The lane-write one needs a call log older than this container.

WHAT M4 STARTS WITH is the door table in the falsified neighbour entry. One primary door and three secondary ones, with the left and right of the hexagon already drawn.

## anything_else

ONE THING THIS GATE SHOULD SAY PLAINLY ABOUT ITSELF.

This iteration was chosen because it looked mechanical enough for an unattended box to walk alone. It is not that any more. It became a design record when the one-door principle was added to it, and the neighbours walk is a judgment call rather than a count.

That is not a complaint and it changes nothing about the work. It matters because the original selection criterion is now false, and a later reader comparing this record against the reason it was picked would otherwise be comparing against something nobody withdrew.

THE PRECEDENT READING CHANGED ONE REQUIREMENT'S MEANING. deliverable/engine/trace.ts line 333 refuses a reasonless EARS exemption by REPORTING a finding, not by refusing the write. deliverable/engine/widgets.ts line 136 goes further and silently IGNORES a bullet with no reason. So the requirement that a reasonless exemption be refused at write time is a change from both precedents rather than a generalisation of them, and it is written that way.
