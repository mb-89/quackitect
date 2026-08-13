---
form: identify-assumptions
by: agent
signed_off: 2026-08-13T20:16:32.409Z
authors: agent
files:
---

# Evidence form / identify-assumptions

## current_situation

The functions are derived and the requirements stand. This state asks what those requirements LEAN ON that nobody has established.

TWO ASSUMPTIONS ARE OPENED HERE and one was carried in from the motivation gate. Both new ones are about the world outside this machine, which is where the whole sweep found things - the requirements themselves are well grounded, and what they rest on is not.

A THIRD WAS MINTED AND DELETED. It said what raid-lane-works-on-posix already says, and that one is not only resident but already PROBED - on Linux, today, with the full battery. Found by sweeping the register at the next state, which is one state too late.

## assumptions

- project/spec/trace/raid/raid-asm-engine-serves-from-the-bound-tree.md
- project/spec/trace/raid/raid-asm-a-peer-understands-the-ledger.md

## sweep

- environment: NOTHING NEW. The change assumes worktrees stay where they are and that git worktrees remain the mechanism, both of which are decided rather than assumed - the record store is built on them and a change there would be its own iteration.
- toolchain: NOTHING NEW, and one thing checked rather than assumed. The fan-out and the levelling both shell to git, and git's behaviour here is exercised by the claim suite against a real repository on every battery run.
- host: ONE FOUND AND ALREADY CARRIED. The answer bound assumes a host will accept a declared size, and hosts truncate differently - one moved a 281KB answer to disk today. It is carried by req-the-answer-never-exceeds-its-bound rather than opened separately, because the requirement states the demand and the bound is ours to declare.
- platform: ONE FOUND AND ALREADY RESIDENT. raid-lane-works-on-posix says the lane's path handling behaves the same on macOS and Linux as on Windows, and it was probed today on a headless Linux container. I minted a duplicate of it and deleted it. WHAT THIS ITERATION ADDS IS ITS SECOND TRIGGER, which is live: any new path-splitting code in the lane re-owes the probe, and path splitting is this iteration's whole subject.
- neighbours: ONE FOUND AND OPENED. raid-asm-a-peer-understands-the-ledger. Two machines already share the ledger and nothing coordinates their engine versions. The parser skips words it does not know, which is right for adding fields and wrong for adding meanings.
- people: NOTHING NEW. The gates need a person and that is a decision rather than an assumption. This iteration adds no new demand on the person's time, and the bless cadence is unchanged.

## follow_up

probe-assumptions is next and it checks every STANDING assumption, not only these three.

WHAT IT WILL FIND OWED, said now so it is not a surprise. Two of the three cannot be closed from this machine. The engine-serves-from-the-bound-tree probe needs a product that does not edit the engine. The path-rules probe needs a POSIX host. Both are honest opens rather than neglect, and both have their trigger named.

THE THIRD IS CHEAP AND SHOULD BE DONE. The ledger probe has a version that needs no second machine: run the current parser against a ledger file carrying a made-up key and assert what it concludes. That settles the direction of the failure, which is the part that matters.

ONE THING THE GATE OWES BEYOND THE ASSUMPTIONS: the cross-coupling analysis over the register, by hand, on the owner's ruling.

## anything_else

WHY THE SWEEP FOUND NOTHING IN THE FIRST TWO SOURCES, said rather than left as a blank.

Environment and toolchain turned up nothing NEW because both are already load-bearing and already exercised. Git worktrees are not assumed - the record store is built on them and the claim suite runs against a real repository on every battery.

THAT IS THE DIFFERENCE BETWEEN AN ASSUMPTION AND A DEPENDENCY. A dependency is something we rely on and check. An assumption is something we rely on and have not checked. Recording git as an assumption would fill the register with things the tests already cover, which is how a register becomes a list nobody reads.

WHERE THE SWEEP DID FIND THINGS: both are about a machine that is not this one. That is not a coincidence. Everything on this machine gets exercised by walking; everything on another machine gets exercised only when somebody runs there, and nobody has since the cloud shipped i8 this morning.
