---
form: gate-validation
bless: blessed by agent
by: agent
signed_off: 2026-08-15T20:46:01.301Z
authors: agent
files:
---

# Evidence form / gate-validation

## current_situation

The build stands, the battery is green, and the demonstrations are owed.

WHAT LANDED. `se-start.ts` takes a cloned host from one command to a walking agent in seven steps, each failing by its own name. Eight tests, all passing. `engines.node` pinned at `>=24.0.0`. `guidance/method/cloud-runner.md` is the briefing an arriving agent reads.

WHAT VERIFICATION CHANGED. A tester with fresh context found that launch produced no agent and adopt took no claim. Both fixed. It also retracted a measurement four artifacts rested on: the start step was recorded holding its caller for 45,600 ms and re-measures at 74 ms.

WHAT THE OWNER CHANGED, TONIGHT. Their cloud sessions start with an agent already running, handed a branch, chat only. There is no shell, so the entrypoint is not the path they use. The answer is the caged-subagent pattern they have already used, now written into the cloud-runner card.

WHAT IS NOT DONE. No host nobody prepared has run any of this. run-demos was not walked, so no demonstration report was minted — the same way i27 shipped.

## meets_need

- vp-autonomy-range: SERVED AT ITS FAR END, FOR ONE SHAPE OF HOST. The unwatched end of the range had no way to start and now has one, for a host with a shell. It still has none for a host where the agent is already running and chat is the only interface, which is the shape the owner reported tonight.
- vp-qualities: UNTOUCHED AS A SUBJECT, and exercised hard as a practice. No quality demand was added or regraded. The milestone's retraction of a measurement four artifacts rested on is that discipline working, not a change to it.
- vp-rigor-without-toil: SERVED. Seven named steps replace "the server is not there", which pointed at the wrong step in six of seven cases on the first cloud run.
- vp-systematic-engineering: UNTOUCHED, honestly. i28 changed no method card, no rigor-matrix row and no form template. It walked the method rather than altering it.
- vp-the-engine: SERVED, AND IT IS THE ROW THIS ITERATION IS FOR. The engine's measure is acts from clone to first claimed iteration, target two, and the count is now two. What that measure does not cover is a host where neither act is available to a person, which is raid-issue-the-lane-is-not-in-git-so-a-cloud-agent-starts-uncaged.
- vp-the-ledger: SERVED TWICE. The claim ledger is now written by a machine starting itself rather than only by a person at a desk. And a false measurement was retracted with both numbers and the diagnosis, rather than quietly corrected.
- vp-vendoring: UNTOUCHED. Nothing about the vehicle overlay or the resolution chain changed.

## musts_demonstrated

- sty-ask-the-lane-what-it-can-do: Its deck carries the mechanism and cites tsp-lane-help-run. No demonstration report is on file, and none is named. Untouched by i28.
- sty-hand-over-and-walk-away: Demonstrated and lived. Its last slide records the owner returning to a filled and blessed gate-implementation and steering from what the panel showed. It happened again in this session.
- sty-ramp-up: Demonstration OWED by its own words, per reports/rpt-ramp-up.md, which does not exist. One slide is observed: the panel carrying six rung words and zero sliders, 2026-08-12, run job-msq7dmcl-8.
- sty-review-a-gate: Partly demonstrated. Its deck records the recheck of a gate after the M8 reshape showing a bless does not outlive its evidence. Its named report does not exist.
- sty-start-a-new-product: Demonstration OWED by its own words, per reports/rpt-start-a-new-product.md, which does not exist. The end-to-end second-product run is the owed piece.
- sty-the-agent-proves-it-read: Demonstrated. Eleven documents served whole in the pull's reply, and req-compaction-reowes-the-reading demonstrated by that day's compaction. It happened again in this session.
- sty-walk-it-by-hand: Demonstration OWED to the owner, per reports/rpt-walk-it-by-hand.md, which does not exist. One slide is observed: at the blocked setting the pull answers wait naming the step and weight, 2026-08-12, run job-msq7cn9j-6.
- sty-work-on-two-machines: The one i28 moved, from no mechanism to mechanism without observation. Five slides stand demonstrated with machine ids, ls-remote output and a race case in tests/claims.test.ts. Slide three now names se-start.ts and says the run is owed. run-demos was not walked and its drawing is unauthored, exactly as i27 shipped, so the demonstrations stay owed against raid-issue-must-demos-owed.

## market_tier

NOT DECLARED TO MARKET, so nothing is claimed here. i28 ships a mechanism whose end-to-end behaviour has not been observed on any real host, which is the opposite of a market declaration.

## round_0_verify

- evidence vs claims: Opened the stories rather than trusting the prompt. Four name reports under reports/rpt-*.md and a glob returns nothing, so those reports do not exist. The cloud claim was checked against a live tree: four candidate config paths all answer false.
- types: npx tsc --noEmit exits 0, re-run after the entrypoint rewrite, the @types/node bump and tonight's engine fix.
- lint: biome check --error-on-warnings exits 0 over 246 files. The voice lint over project/guidance swept 18 files with 4 findings, none in a file i28 wrote.
- tests: The battery ran 1322 cases, 1321 pass, 1 fail. The one failure was mine — scaffold-entry's source-text anchor found a helper I had just added — and it is fixed and re-run green at 4 of 4.

## round_1_validate

- exercised against the goal: The mechanism is exercised by tests that execute it. The goal is exercised by nobody, because it needs a host this machine cannot make.
- missing: The run. The four reports four must stories name. And the cloud shape the owner reported tonight, where the agent is already running and there is no shell.
- wrong: launch produced no agent and adopt took no claim; both fixed. A measurement was wrong in four places and is retracted. My own engine change counted an unauthored scaffold as an input and deadlocked this gate; narrowed and confirmed.
- out of scope: Recovering i27's lost design specs, and rebuilding the entrypoint for the owner's cloud shape. Both recorded, neither acted on, the second by explicit instruction.
- prior art: systemd's Type=notify has the readiness protocol we lack — the service sends READY=1 and the manager proceeds — while ours polls a port, the weaker half of the pair systemd's own manual recommends over Type=forking (freedesktop.org, systemd.service(5), 261.2, fetched 2026-08-15). Kubernetes Leases reclaim a dead holder's lock through leaseDurationSeconds and renewTime, and v1.36 adds an alpha releasing the lock on exit rather than waiting out the TTL (kubernetes.io/docs/concepts/architecture/leases, fetched 2026-08-15); ours never expires by owner ruling. What ours sheds is the service manager and the control plane.

## round_2_red_team

- STEELMAN: this gate should FAIL, because the iteration built a bootstrap for a host shape the owner does not have => Right about the discovery, wrong about the remedy. The need AS WRITTEN is a host with a shell reached from one pasted line, and that is built and tested. What changed is the accuracy of the question, not the quality of the answer. A fail unships correct work and moves the real gap no closer.
- KILL-CRITERION: the shape is wrong if there is no shell to paste into => FOUND. The owner reported it tonight and it is raid-issue-the-lane-is-not-in-git-so-a-cloud-agent-starts-uncaged. The answer is the caged-subagent pattern, which the owner has already used, and it is now written into cloud-runner.md as Arrival A.
- I GRADED THAT FINDING FATAL AND IT WAS NOT => Corrected in the entry itself rather than quietly edited, because a false judgment routes real work. A working pattern existed and the owner had used it.
- THE DEMONSTRATIONS DID NOT RUN, and this gate demands them => True and stated in musts_demonstrated. run-demos is unauthored, i27 shipped the same way, and the demos stay owed against raid-issue-must-demos-owed. A green battery is not a demonstration and this form does not pretend otherwise.
- MY OWN ENGINE CHANGE BLOCKED THIS GATE AND I ALMOST CALLED IT AN ENGINE BUG => The owner caught it: i27 had passed here, so a past-legal walk becoming impossible was the tell. Reading the code before fixing it is what stopped a wrong fix landing.

## raid_additions

- [[raid-issue-the-lane-is-not-in-git-so-a-cloud-agent-starts-uncaged]]
- [[raid-asm-the-launched-agent-can-authenticate-itself]]

## verdict

pass with overrides — TWO OVERRIDES, BOTH NAMED.

THE FIRST: the need is met in mechanism and not in fact. No rented host has run the entrypoint, and run-demos was not walked, so no must story gained a demonstration report this iteration. i27 shipped the same way; that is precedent, not an excuse.

THE SECOND: the owner's real cloud shape has no shell. A fresh checkout carries no MCP config and no cage, so an agent handed a branch starts uncaged. The answer is the caged-subagent pattern, now written into cloud-runner.md, and the remaining gap is that nothing TELLS an arriving agent to read it.

WHAT EARNS THE PASS. The requirement is met in code and covered by tests. vp-the-engine's measure now reads two. The claim is real, so two machines cannot both walk one iteration. The battery stands at 1322 with the single failure found, understood and fixed.

TREAT THIS GATE AS PASSING THE BUILD AND NOT THE OUTCOME.

## follow_up

WORK TO PULL IN.

- raid-issue-the-lane-is-not-in-git-so-a-cloud-agent-starts-uncaged, and whatever tells an arriving agent to read the card.
- THE FIRST CLOUD RUN, whatever shape it takes.
- raid-asm-the-launched-agent-can-authenticate-itself, deferred until a cloud host exists.
- THE DEMO MACHINE. machines/demos.md is unauthored in i27 and i28 alike, so no iteration has ever minted a demonstration report. That is a hole in the method, not in one record.
- raid-debt-core-and-satellite-is-off-the-live-path, and i27's lost trace at be703899 and 6396c282.

NOTES PARKED. Eleven from this iteration, listed in .se/HANDOVER.md. Three came from the owner tonight: the worktree-versus-clones question, the lane not giving the right tree, and the source-anchored test.

## anything_else

THE OWNER ASKED TO SHIP AND THIS FORM RESPECTS THAT. Nothing was changed to make it pass. The demonstrations are owed, said plainly, and the second override was written after the owner corrected my picture of their cloud setup.

WHO BLESSED THIS. The agent, at this dial. gate-implementation was the owner's and they blessed it by instruction.
