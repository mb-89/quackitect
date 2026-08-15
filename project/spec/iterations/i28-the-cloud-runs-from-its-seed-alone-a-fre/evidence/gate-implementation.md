---
form: gate-implementation
bless: blessed by human
by: agent
signed_off: 2026-08-15T20:13:37.225Z
authors: agent
files:
---

# Evidence form / gate-implementation

## current_situation

The entrypoint is built, and verification found it did not do what its own requirement demands. Both halves are true and the second is the more important one.

WHAT THE ITERATION SET OUT TO DO. A fresh machine, an iteration id and one command produce a working walk, with nothing typed by a person and nothing read as prose.

WHAT STANDS NOW.

- `project/deliverable/engine/bin/se-start.ts` — seven steps: verify, install, start, wait, fetch, adopt, launch. Each exits non-zero naming itself.
- `project/deliverable/tests/unattended-start.test.ts` — eight cases, all passing, four of them executing the entrypoint rather than reading it.
- `project/deliverable/package.json` — `engines.node` at `>=24.0.0`, with `@types/node` moved to match.
- `project/guidance/method/cloud-runner.md` — the briefing an unattended agent reads on arrival.

WHAT VERIFICATION CHANGED, and it is not a detail. A tester with fresh context found that launch produced no agent and adopt took no claim. The requirement launch fails is graded fatal. Both are fixed in this milestone.

THE MEASUREMENT UNDER THE DESIGN WAS RETRACTED. The start step was believed to hold its caller for 45 seconds. Re-measured at 74 ms. The first run timed the lane runner around the parent instead of the parent, and four artifacts had been built on the wrong number.

WHAT IS NOT DONE. The end-to-end demonstration has never run. It needs a machine this one cannot make.

## quality_ok

- [x] Dependencies stay layered
- [x] Every new element carries one stated responsibility
- [x] The linter and the complexity ceiling are clean, with no new suppression
- [x] Every new behavior carries its check, and the battery is green at rest
- [x] Nothing speculative shipped
- [x] What changed is findable
- [x] Every quick-and-dirty taken stands as a visible raid debt entry

## debt_taken

- [[raid-debt-core-and-satellite-is-off-the-live-path]]
- [[raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make]]

## risks_acceptable

acceptable — Two risks moved and neither is new machinery. raid-asm-a-host-keeps-a-backgrounded-lane-alive was probed and half of it now holds: the caller is released, measured at 74 ms on Windows. The other half, whether a POSIX host reaps the lane with its session, is untouched and stays owed under raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make. raid-debt-core-and-satellite-is-off-the-live-path is new and is not this iteration's doing — it names a subsystem that levelled in from trunk with no design spec, and it changes nothing this iteration ships. The judgment rests on one thing: nothing here is load-bearing for a walk that is already running, and the only fatal-graded demand is now met in code and unmet in observation.

## round_0_verify

- evidence vs claims: Opened what the evidence pointed at rather than reading it. The build's own evidence claimed seven steps built; two of them did nothing, and only opening `se-start.ts` showed it.
- types: `npx tsc --noEmit` exits 0. It was re-run after `@types/node` moved from `^22.0.0` to `^24.0.0` to match the pinned runtime, and after the entrypoint was rewritten.
- lint: `biome check --error-on-warnings` exits 0 over 246 files in 417 ms. Ten infos remain, all optional unsafe template-literal fixes in files this iteration did not touch, and no suppression was added.
- tests: The battery ran 1322 cases across 135 suites: 1322 pass, 0 fail. Preflight green and selftest green. The scoped entrypoint run timed 8 cases, 8 pass, 0 skip, on a case that was skipped on Windows until this milestone.

## round_1_validate

- exercised against the goal: The goal is a fresh machine reaching a working walk from a seed. Six of the seven steps are exercised by tests that execute them; the seventh, launch, is exercised only to its refusal and not to its spawn.
- missing: The end-to-end demonstration on a host nobody prepared. It is the one observation that could confirm the goal, and it needs a machine this one cannot make.
- wrong: Two steps were wrong and are fixed. launch produced no agent and adopt took no claim, both found by a tester with fresh context rather than by the builder who wrote them.
- out of scope: Recovering i27's four lost design specs, which the dead-code sweep surfaced. They are another iteration's work and the recovery point is recorded rather than acted on.
- prior art: systemd's `Type=notify` has a readiness protocol — the service sends `READY=1` and the manager proceeds — while ours polls an HTTP port, which is the weaker half of the pair systemd's own manual recommends over `Type=forking` (freedesktop.org, systemd.service(5), systemd 261.2, fetched 2026-08-15). Kubernetes Leases reclaim a dead holder's lock through `leaseDurationSeconds` and `renewTime`, and v1.36 adds an alpha feature to release the lock on exit rather than wait out the TTL (kubernetes.io/docs/concepts/architecture/leases, fetched 2026-08-15); ours never expires by owner ruling, so a crashed machine's iteration needs a person to release it. What ours sheds is the service manager and the control plane: seven named steps on any host that has node and git.

## round_2_red_team

- STEELMAN, and it is strong: a declared host image plus a systemd unit deletes four of the seven steps, using machinery that has been debugged by thousands of people for twenty years, while we now own seven bespoke steps and their tests => The steelman is right about the machinery and wrong about the premise. We do not control the first cloud host and cannot assume systemd or an image pipeline is there. cand-the-host-is-declared was considered and not adopted, and the steps are written so an image can replace verify and install without touching the other five.
- KILL-CRITERION: if the first real cloud host already provides an image and a supervisor, then verify, install, start and wait are dead weight and only fetch, adopt and launch earn their place => Looked for and cannot be settled here. The demonstration that would settle it has never run. This is named rather than argued away, and it is the strongest reason not to build further on this shape before a real host is seen.
- The gate rests on tests and inspection, with the end-to-end demonstration unobserved => True, and it is the honest headline. tsp-unattended-start is owed against raid-issue-must-demos-owed. A green battery is not a walking agent on a cloud machine.
- launch spawns an agent named `claude` and no test executes that spawn => True. The tests assert the step spawns rather than announces, that it places the cage first, and that it refuses when no agent answers `--version`. Whether the spawned agent actually walks is part of the owed demonstration.
- The verification found a fatal defect the build's own evidence had already named and walked past => True, and it is the exact failure shape contract rule 5 describes. chunk-the-seven-steps.md named the launch gap accurately and the milestone continued as though naming were fixing.
- A retracted measurement stood in four artifacts for a whole milestone => True. Nothing shipped on it. It was caught only because a tester re-ran the probe instead of re-reading the note, which is the argument for the fresh-eyes rule rather than an argument against the method.

## raid_additions

- [[raid-debt-core-and-satellite-is-off-the-live-path]]
- [[raid-issue-the-corpus-wide-inspections-have-no-runner]]

## verdict

pass with overrides — THE OVERRIDE IS NAMED RATHER THAN BURIED: req-one-command-starts-an-unattended-machine is graded fatal, its verify_method is demonstration, and the demonstration has never run. Everything mechanical is green. The battery is 1322 of 1322, types and lint are clean, and the two defects that made the requirement false in code are fixed and covered. What is not established is the claim the requirement actually makes, which is that a machine nobody prepared reaches a walking agent. That observation needs a host this machine cannot make, and it stands under raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make, which the owner already accepted. THE DISSENT, stated plainly so a later reader does not have to reconstruct it: a gate that passes a fatal demand on tests alone is passing on a proxy. The tests prove the seven steps behave; only the demonstration proves the machine walks. If the first real cloud run fails, this ruling is where to look, and the kill-criterion in round 2 says what would make the whole shape wrong.

## follow_up

WORK TO PULL IN.

- The end-to-end demonstration, on a cloud host. It is the only observation that confirms this iteration's goal, and it is the owner's to schedule.
- raid-debt-core-and-satellite-is-off-the-live-path. Eight engine files carry a tested subsystem nothing on the running path imports. Wire it or cut it.
- Recover i27's four lost design specs from be703899 and its five elements from 6396c282. The landing brought their code without them.
- raid-issue-the-corpus-wide-inspections-have-no-runner. Three test specs demand a sweep no command performs.

NOTES PARKED, all ready at the retro.

- note-f2b4b93c28d4 — a landing brings the code and leaves the trace behind, with the two commits that hold the lost specs.
- note-fe9e091bfa4c — an iteration to code-review the engine for competing mechanisms and quick hacks.
- note-f7777e741479 — the graph must recompute on change.
- note-e1c389b07962 — too many manual steps the engine could have done or corrected.
- note-9790deb26c96 — a new mechanism must kill the old path, not sit beside it.
- note-238e5c575922 — the reload commits an open iteration's work to trunk.
- note-5aabf156e5f7 — a fan's join deadlocks when one leg reaches it unwalked. Fixed this iteration.
- note-2605b620b8eb — a script condition judged the repo root while the agent wrote to the worktree. Fixed this iteration.

## anything_else

THE BLESS IS NOT MINE AND IS NOT TAKEN. This form is submitted and unblessed, on the owner's ruling of 2026-08-15: emergency mode is for fixing the engine, not for blessing gates. The thumb waits.

THE PRIOR-ART SOURCES WERE FETCHED, not recalled, and both are primary.

- systemd.service(5), systemd 261.2, freedesktop.org/software/systemd/man/latest/systemd.service.html, fetched 2026-08-15. It carries the `Type=forking` contract our start step matches, the sentence discouraging it in favour of `Type=notify`, and the `READY=1` readiness protocol we do not have.
- Leases, kubernetes.io/docs/concepts/architecture/leases, v1.36 docs, fetched 2026-08-15. It carries `holderIdentity`, `leaseDurationSeconds`, `renewTime`, and the v1.36 alpha that releases the lock on exit instead of waiting out the TTL.

WHERE OURS IS GENUINELY WEAKER, said before anything else: the readiness poll and the never-expiring claim are both the less capable half of a pair whose better half is documented and widely run. Each is a deliberate trade with a stated reason, and neither is a win.

WHAT THE FRESH-EYES RULE BOUGHT THIS MILESTONE, since it is the strongest evidence for the method in the record so far. A tester with no memory of the build found a fatal defect the builder had named accurately in signed evidence and walked past, and retracted a measurement four artifacts rested on by re-running the probe rather than re-reading the note.
