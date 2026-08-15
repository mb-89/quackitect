---
form: identify-assumptions
by: agent
signed_off: 2026-08-15T15:44:50.179Z
authors: agent
files:
---

# Evidence form / identify-assumptions

## current_situation

M3's third state. The sweep ran over the seven new requirement rows, one source at a time, and it turned up two new assumptions and one standing assumption this iteration falsifies.

THE FALSIFIED ONE IS THE FINDING. [[raid-asm-peer-runs-supported-platform]] says the peer runs Windows, where the installer and packager live. A Linux cloud host already ran this product on 2026-08-13, so it was false before this iteration opened and nobody noticed.

## assumptions

- [[raid-asm-the-installed-runtime-is-one-the-engine-runs-on]]
- [[raid-asm-a-host-keeps-a-backgrounded-lane-alive]]
- [[raid-asm-git-answers-open-without-a-worktree]]
- [[raid-a-crashed-walk-leaves-a-folder-that-means-nothing]]

## sweep

- environment: ONE, already standing. The scale is 27 open iterations and the container must answer inside a second at that count, which is [[raid-asm-git-answers-open-without-a-worktree]] and is this change's kill-criterion; nothing else about the surrounding world is newly leaned on, because the seven rows add no data volume and no new load.
- toolchain: ONE NEW, [[raid-asm-the-installed-runtime-is-one-the-engine-runs-on]]. The entrypoint requirement says it verifies the runtime it needs and never says which version, which is the method card's capability-named-without-a-version smell, and a bare host installs whatever its package source offers today.
- host: ONE NEW, [[raid-asm-a-host-keeps-a-backgrounded-lane-alive]]. The console requirement fixes our half, which is the engine treating a closed standard input as shutdown, and it cannot fix the host reaping its session's children; the first cloud run held standard input open and so proved nothing about which half was failing.
- platform: NONE NEW, AND ONE STANDING ASSUMPTION IS FALSIFIED. [[raid-asm-peer-runs-supported-platform]] states the peer runs a supported platform and names Windows; a Linux cloud host ran this product on 2026-08-13, so the claim is already false and it should become an issue rather than stay an assumption, which is carried in follow-up because this state opens assumptions rather than re-kinding standing ones.
- neighbours: NONE, and the reason is that the two neighbours these rows lean on are read rather than trusted. Git's ref behaviour is exercised by the engine on every call rather than taken from a datasheet, and the remote's push ordering is already [[raid-asm-remote-serializes-claims]], unchanged by this iteration.
- people: NONE NEW, and one existing entry covers it. The unattended run needs the owner to authorise gates ahead of time, and whether that is a distinct stakeholder role is already recorded at map-stakeholders with a mechanical test at M3 rather than as a belief; the crashed-walk entry covers the other people-shaped case, which is nobody being there to notice a stopped host.

## follow_up

- RE-KIND [[raid-asm-peer-runs-supported-platform]] FROM ASSUMPTION TO ISSUE, keeping its id and saying so in the body, because it has already happened and the method says a falsified assumption is an issue rather than a risk
- probe-assumptions is next and it probes ALL standing assumptions, which is now fourteen rather than the four opened here
- three of the four assumptions this iteration carries have written probes and none has run, and the git-cost one gates the first requirement in the set
- nothing is parked from this state

## anything_else

### Why the sweep found so little that is new

FOUR ASSUMPTIONS FOR SEVEN REQUIREMENTS is a thin yield, and it is worth saying why rather than presenting it as thoroughness.

THE ROWS ARE MOSTLY ABOUT OUR OWN BEHAVIOUR. Which source answers what exists, when a folder lives, what a refusal says — each of those is a decision we own, and a decision is not an assumption.

WHERE THE ASSUMPTIONS APPEAR is exactly where the rows touch something we do not own: a host's runtime, a host's process supervision, and git's cost. All three sit on the boundary this iteration moves, which is the method card's own prediction that a requirement about a boundary almost always rests on something.

### The falsified one is the most valuable thing this sweep produced

It was not found by looking at the new rows. It was found by reading the standing assumptions before writing new ones, to avoid duplicating them.

THAT IS WORTH KEEPING AS A HABIT: the cheapest check in this step is reading what is already assumed, and it is the only one that finds an assumption that has quietly gone false.
