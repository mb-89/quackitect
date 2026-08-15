---
form: gate-kickoff
bless: blessed by agent
by: agent
signed_off: 2026-08-15T14:52:15.026Z
authors: agent
files:
---

# Evidence form / gate-kickoff

## current_situation

i28 is bound and its onboarding retro is signed. The walk stands at the M0 gate.

WHAT STANDS: 27 open iterations, 0 open expeditions, 0 pending notes, 37 parked backlog items.

THE ENABLERS: i27 and i12 shipped. i28 is enabler 2 of 4 and i11 is enabler 3. The owner's run order of 2026-08-13 puts this record next.

HOW THIS RECORD WAS ENTERED matters to its scope. Its door was not on the container's offer, because a shipped iteration with a leftover folder on disk reads as open forever. Clearing that took a dozen calls and five shell commands under an exemption. The owner's response is now scope: starting an iteration is entering it, not repairing it.

## retro_drained

- pending notes: none, the inbox stood at zero across the whole window
- the previous retro: it ran three hours before this one and drained everything, so this window opened empty
- parked backlog: 37 items untouched, and no ready-when condition fired in three hours
- notes written this window: none, because every finding went straight into this record's scope

## goal

The cloud runs from its seed alone: a fresh machine, a record id and one command produce a working walk, with nothing typed by a person and nothing read as prose — and entering an iteration never requires repair, on any machine.

## pulled_in

- the six original failure points, from the seed: the server dying when backgrounded, the missing entrypoint, itAdopt not being a lane verb, the manual fetch refspec, the absent lane lifecycle, and the last gate parking an unattended run
- the four pool findings of 2026-08-13: the unclaimed i8, the packager starving its own engine, the shim proxy with no timeout, and the designed health answer
- the four field findings of 2026-08-14: the second machine seeing no iterations, dependencies inferred wrong from git, the read proof being the hardest part of booting, and whether a tool-delivered document needs proving at all
- the environment check at every boot, from i12's retro: three of i27's first four plan items were harness repair on an already-configured machine
- the open test is two different tests, found entering this record: iterations.ts line 71 reads open from the folder existing, survey.ts line 51 reads it from the record's status
- the close retires the folder, owner ruling 2026-08-15: nothing in the engine removes a worktree today
- entering a git-only seed materialises it, so a folder on disk means somebody is working that iteration right now
- the disk gets swept once the three above land, owner ruling 2026-08-15
- a worktree verb in the lane: five of seven se_run calls this window were one shape, allowlisted git against a tree that is not the root
- entry never requires repair, owner ruling 2026-08-15: silent absence from an offer stops being a possible outcome

## left_out

- the worktree binding, the ride-along and the walk-back cost: they are i27, which shipped on 2026-08-14
- the milestone one-pager: M0 kickoff was this record's row until 2026-08-15, when the whole programme moved to i19 emit.report
- the cloud validation itself: minted as raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make, owned by the owner, with its Repayment section written
- the record rename: half done, its order fixed in note-f40b2052e59b, and it must not be restarted from scratch here
- the pull's own latency: 8 pulls broke the one-second rule this window, and that is i33's subject

## change_size

major — it moves a lifecycle contract every other iteration depends on, and a wrong move silently hides 26 iterations or loses uncommitted work at a close.

WHY NOT MINOR. The open test, the entry and the close all change. A change that can make every seeded iteration vanish from the container is not a small one.

WHY NOT PRODUCT. Nothing new is stood up. No second product, no new vehicle, no new module. Every piece lands inside the engine and the lane that already exist.

WHAT IT TOUCHES, so the size is checkable: the record store and its open test, the entry path, the close path, the git lane's verb set, the server's lifecycle and backgrounding, a bootstrap entrypoint that does not exist yet, and trace work for the cloud as a neighbour.

NO STRIKES PROPOSED. At major the matrix asks its full set and this record's risk profile is why it should. The one demand I would have argued to trim is validation, and it is not trimmed — it is a named debt with an owner and a Repayment section, which is stricter than a strike.

## round_0_verify

- evidence vs claims: pass — every claim in this form cites a file and line, a timestamp, or a measurement made this session, and the two that cannot be checked from here are recorded as register entries rather than asserted
- types: pass by vacuity — this milestone changed no code, and the seven files written are markdown
- lint: NOT RUN, and not claimed — se_lint is refused at this gate under SE-C-110, so the four new register entries are unlinted and the first state that allows it owes the sweep
- tests: NOT RUN, and not needed — the last battery stands green at 1314 of 1314 from i12's close this morning, and no code has changed since, so a run would answer no question

## round_1_validate

- exercised against the goal: pass — the goal is that a machine with a seed id and one command produces a walking agent, and every item pulled in is a step on that path; the two items added this window were found by the walk failing at exactly the point the goal describes
- missing: the probe of the kill-criterion is not yet run, and it is scheduled inside this walk rather than waved through; nothing else named in the seed is dropped
- wrong: nothing found wrong in the seed, and one of its assumptions was corrected by measurement — the owner expected old archived iterations lying around, and the disk holds none, so the sweep is about seeded folders instead
- out of scope: five things are named as out with where each went, and the largest is the cloud validation itself, which became a debt rather than a silence
- prior art: Codespaces and Gitpod create a workspace on demand from a repository reference and destroy it after, which is exactly the create-on-entry and remove-on-close being baked in here, and they are better than us at it today because absence of a workspace is never mistaken for absence of the work; git worktree itself is better than us at one thing we got wrong, since its own list is the authority and its remove refuses a dirty tree, and we reimplemented that question with existsSync and lost the refusal; devcontainers give a declared environment a fresh machine reproduces, which is the half of our bootstrap that is prose today; what ours sheds is the hosted control plane, the container per workspace and the daemon somebody keeps alive, so a seed is a git branch and an adopting machine needs git and node and nothing else; the comparison is documented behaviour of theirs against measured behaviour of ours, since neither was run against this workload, which is enough to say what shape to copy and not enough to claim we beat them

## round_2_red_team

- STEELMAN, and it is strong: a folder per iteration is browsable without git, greppable by any tool, and survives an engine that will not start, so removing folders makes the engine the only door to the work => partly answered and the cost is accepted rather than denied — the branch is the record and `git show it/<id>:path` reads any of it with no engine at all, so the property survives at the price of one more command, and it does get harder for a person
- the close can eat uncommitted work, and the folder that provoked this rule held 34 uncommitted paths whose safety was established by measurement rather than by design => the close commits or refuses, never removes blind, and this is now raid-a-close-that-removes-the-folder-destroys-uncommitted-work at grade fatal and likelihood expected
- the disk sweep is the same risk multiplied by 27 folders => the sweep carries the same commit-or-refuse rule per folder and reports every folder it skipped rather than skipping quietly
- a half-landed change is worse than either half, because sweeping before the open test moves hides 26 iterations and moving the open test without materialising on entry makes every seed unenterable => the four steps have a written order with the reason attached, and it is now raid-sweeping-the-folders-early-hides-every-seeded-iteration
- KILL-CRITERION: this is the wrong call if an iteration's status cannot be read from git cheaply and reliably without a worktree, because then the folder was a cache that was earning its keep => recorded as raid-asm-git-answers-open-without-a-worktree with a probe that times both paths over the real 27 iterations, and the probe runs in this walk before the change lands
- the gate is judging a design nobody has built yet, so round 0 has little to verify => stated rather than dressed up — two of the four round 0 checks pass by vacuity and one is explicitly not run, and that is what M0 evidence honestly looks like

## raid_additions

- [[raid-asm-git-answers-open-without-a-worktree]]
- [[raid-a-close-that-removes-the-folder-destroys-uncommitted-work]]
- [[raid-sweeping-the-folders-early-hides-every-seeded-iteration]]
- [[raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make]]

## verdict

pass — the goal is confirmed and widened with the widening recorded, the dependency is verified shipped, scope is bounded in both directions, and the blast radius is measured rather than estimated.

THE SIZE IS PROPOSED, NOT DECIDED. major is this gate's recommendation and the ruling belongs to the owner.

WHAT IS NOT BEING WAVED THROUGH. Round 2 names a kill-criterion that is untested — that git can answer the open question cheaply. It is recorded as an assumption with a written probe and the probe runs inside this walk before the change lands.

NO OVERRIDES. Nothing passes here with a dissent attached.

## follow_up

- probe the kill-criterion first, timing status-from-git against existsSync over the real 27 iterations
- move the open test to the record's status read from git
- make entering a git-only seed materialise its folder at that moment, landing with the step above
- make the close remove the folder, committing or refusing first, never removing blind
- sweep the disk of folders for iterations nobody is working, and only after the three above land
- add a worktree verb to the lane, so retiring one is not five shell commands under an exemption
- make the entry path check itself and refuse with a named remedy where it cannot repair
- re-check i23, the second iteration blocked by the same leftover
- sweep the four new register entries with se_lint at the first state that allows it

## anything_else

ONE THING IS UNEXPLAINED AND IS NOT CLAIMED AS A GUARANTEE. i12 shipped this morning and left no folder behind; i27 shipped yesterday and left one. Why they differ is not established, and nobody should read that difference as the close already doing its job.
