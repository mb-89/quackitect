---
form: identify-assumptions
by: agent
signed_off: 2026-08-18T11:10:42.953Z
reopened: "2026-08-18T11:10:12.345Z — The function work exposed an assumption the requirement pass leaned on: that the pointer a driven project follows back survives being moved, cloned or committed. It is graded expected, which no other entry here carries."
authors: agent
files: null
---

# Evidence form / identify-assumptions

## current_situation

The walk stands at identify-assumptions, reopened because two requirements arrived with the affordance and one of them leans on something nobody has established.

FIVE ASSUMPTIONS AND ONE ISSUE NOW STAND from this iteration. The fifth is new here.

THE NEW ONE CAME FROM THE FUNCTION WORK RATHER THAN FROM THIS SWEEP, which is worth saying plainly. Writing `bring-forth-a-project` forced the question of where the pointer lives, and asking where it lives immediately asked whether it stays there.

AND ITS LIKELIHOOD IS `expected` RATHER THAN `plausible`, which no other entry in this register carries. v1 puts the pointer in a machine-local data home, and a driven project is somebody's real product — committed, cloned, shared. The failure is not a corner; it is the second time anybody opens the project somewhere else.

## assumptions

- raid-asm-the-pointer-survives-what-the-builder-does-to-the-tree
- raid-asm-a-vendoring-mechanism-carries-a-whole-product
- raid-asm-the-isolation-rule-means-the-same-on-every-platform
- raid-asm-a-copy-owner-resolves-a-collision-rather-than-abandoning-the-channel
- raid-asm-the-overlay-layer-has-a-home-that-survives-an-update
- raid-iss-the-path-jail-has-one-write-target

## sweep

- environment: ONE, AND IT IS NEW — raid-asm-the-pointer-survives-what-the-builder-does-to-the-tree. This is the source that was `none` an hour ago, and the affordance changed that. WHAT THE WORLD AROUND THE COPY NOW DOES TO IT: a driven project is somebody's real product, so it gets committed, moved, cloned and shared, and v1 puts the pointer in a MACHINE-LOCAL data home that survives none of those. THE OTHER ENVIRONMENTAL CANDIDATE STILL IS NOT ONE: that a copy is a git repository is a DEMAND we make in req-one-command-produces-a-complete-copy rather than a condition we hope for.
- toolchain: ONE, unchanged — raid-asm-a-vendoring-mechanism-carries-a-whole-product. PROBED AND HOLDS since this morning: `git clone` then a pull, zero files silently lost, and a vehicle re-homed to an internal version control with no link back still takes an update later by address. The affordance did not touch it.
- host: NONE, and the answer changed shape without changing verdict. The affordance runs in an editor, so the candidate was that the editor will open a window where the system asks. IT IS NOT AN ASSUMPTION: opening a folder is the single most ordinary thing an editor does, and the extension already registers commands and shows a panel. What would make it one is a claim about the editor doing something unusual, and nothing here does.
- platform: ONE, unchanged, AND IT IS NOW AN ISSUE RATHER THAN AN ASSUMPTION — raid-asm-the-isolation-rule-means-the-same-on-every-platform. Probed 2026-08-18 and FALSE: on Windows a junction destroys a neighbour through `git worktree remove --force` at exit code 0, while a directory symlink cannot be created without elevation. A symlink-shaped check passes a tree that gets destroyed. The affordance makes it worse rather than different, because the act is now one press away from somebody who read nothing.
- neighbours: NONE SEPARATELY, unchanged. The neighbour whose guarantees this delta takes from a datasheet is git, and that is the toolchain entry's probe. AND THE EDITOR IS NOW A NEIGHBOUR THIS DELTA TOUCHES, through nbr-vscode — but what it is asked to do is open a folder, which is not a guarantee anybody needs to check.
- people: ONE, unchanged — raid-asm-a-copy-owner-resolves-a-collision-rather-than-abandoning-the-channel. Still the only entry in this register no code can settle. WHAT THE AFFORDANCE ADDS TO IT, without making it a second entry: the people meeting this system are now people who pressed something rather than people who ran a script, and a script-runner's patience is not evidence about a button-presser's. That widens the population the assumption is about and does not change its claim.

## follow_up

IMMEDIATELY: probe-assumptions, which probes ALL standing assumptions rather than only these.

THE NEW ONE HAS A CHEAP PROBE AND IT IS THREE RUNS. Produce a project and confirm the system comes up; move it and try again; clone it as a colleague would and try again, then rename the copy that created it.

AND ITS PROBE HAS A DESIGN CONSEQUENCE rather than only a verdict. If a machine-local pointer fails two of three, the candidate space at M4 narrows to pointers living inside the produced tree — which is one of the four `bring-forth-a-project` already names, and the one this product's path jail is friendliest to.

THE OTHER FOUR ARE UNCHANGED. Two hold with runs from this morning, one is an issue with a reproduction, and one stays unprobed because it needs a person rather than a run.

THEN gate-requirements re-signs over eleven rows, and derive-criteria needs its cheap check: both new requirements are `must`, so the criterion pool should not have grown.

WHAT M4 INHERITS FROM THIS STATE. Five assumptions and two issues, and the two issues are the ones that constrain candidates rather than describing beliefs — the path jail having one write target, and the isolation check being platform-shaped.

## anything_else

WHERE THE NEW ASSUMPTION CAME FROM, because it was not this sweep.

THE FUNCTION WORK FOUND IT. Writing `bring-forth-a-project` forced one question — where does the pointer live — and naming four candidate answers immediately raised a second: does whichever one gets chosen survive somebody moving, cloning or committing the tree?

THAT IS meth-twin-peaks WORKING RATHER THAN A PROCESS FAILURE. Deriving functions exposes what the requirement pass leaned on, and the method says to expect it and go back.

WHAT THE SWEEP ITSELF ADDED THIS PASS: nothing new, and two of its six sources changed their reasoning without changing their verdict. Host is still none, but now for a reason about editors rather than about test harnesses. Neighbours is still none, but the editor joined the list of neighbours this delta touches.

### One thing worth recording about the shape of this register

SIX ENTRIES FROM THIS ITERATION, AND THEIR LIKELIHOODS SPREAD PROPERLY. One `expected`, three `plausible`, one `certain` on an issue that has already fired, and one probed to false. THAT IS A REGISTER SOMEBODY CAN SORT rather than a list where everything is equally alarming.

AND THE HIGHEST-GRADED ONE IS STILL THE PLATFORM ISSUE, which was an assumption this morning and is a reproduction now. A register whose worst entry has a reproduction attached is in better shape than one whose worst entry has an argument.
