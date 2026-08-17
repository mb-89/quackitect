---
form: write-stories
by: agent
signed_off: 2026-08-17T11:41:04.304Z
authors: agent
files:
---

# Evidence form / write-stories

## current_situation

The delta touches one story that did not exist and one that did.

The corpus carries 33 stories. None of them covered the arrival: every one assumes an agent that is already on a lane. sty-hand-over-and-walk-away comes closest and starts where this one ends.

## stories

- sty-send-an-agent-to-a-cloud-box
- sty-hand-over-and-walk-away

## follow_up

- The last slide of sty-send-an-agent-to-a-cloud-box is deliberately open. Close it when the owner sets the cloud default for the dial, and the story's claim becomes true end to end.
- Measure the first slide's minute on the next cloud run. This box can no longer produce that number.

## anything_else

ONE SLIDE IS WRITTEN AS UNMET, ON PURPOSE.

The deck's last claim — the engineer comes back to a walk that stopped where their hand was needed — is false today at the default dial, and the slide says so with the measurement beside it.

WRITING IT AS MET WOULD HAVE BEEN EASIER AND WRONG. A story deck is a claim with its proof beside it, and the proof here is a walk that stopped at gate-kickoff for a reason that has nothing to do with the engineer's hand being needed.

WHY sty-hand-over-and-walk-away IS LISTED TOO, though this iteration wrote no code for it: its own claim was tested by this run and did not hold. It says the walk stops exactly where the person's hand is needed. On this box it stopped where the DIAL was set, which is a different thing, and the difference is the whole of finding 2 in the field report.

## vision_scope_stated

COMPLETE, and each part names where it stands.

- The big idea and the world it makes: draft-vision, with four goals in a ruled priority order and three conflicts named rather than dissolved.
- The gap as a claim: frame-delta, measured — most of an hour of hand-work per cloud run before any work begins.
- What it buys and in whose currency: frame-delta's business case, in agent-minutes on an unwatched box.
- What it takes on and what it leaves: scope-non-goals, where the non-goals are deliberately longer than the scope.
- The register: log-risks, three entries, all open, all with owners and triggers.

ONE PART IS HONESTLY INCOMPLETE AND SAYS SO. The value prop's first criterion has a before and no after, because this box is no longer fresh enough to measure the arrival again.

## problem_agreed

THE DELTA IS REAL AND IT IS MEASURED, NOT ARGUED.

THE EVIDENCE, from this run: a fresh cloud clone took most of an hour to reach its first se_pull. The steps were a runtime below the pin, an install, a shallow clone with neither main nor v2, a cage to place, and a hand-written JSON-RPC client. Every one of those recurs on every cloud box, because none of it was written anywhere executable.

THE SECOND HALF IS WORSE. The i15 run rediscovered ten things this repository already knew, and the only reason anybody found out is that a field report was written by hand, twice. A finding that does not travel is paid for once per run, forever.

IS THE GOAL WORTH HAVING? Yes, and the test is what happens without it. Without the arrival, every future cloud run spends its first hour on setup and its operator's patience before that. The i15 report predicted this iteration would close ten items; four were code, and the largest item was one the report did not name at all.

WHAT WOULD MAKE IT NOT WORTH HAVING: if cloud runs were rare. They are not — this is the second in two days, and the seed exists because of the first.

## prior_art_positioned

COMPARED, NOT CITED. Named systems, what each does better, what ours sheds.

DEVCONTAINERS AND GITHUB CODESPACES. THEY DO ONE THING BETTER AND IT IS THE important one: setup runs BEFORE the agent process exists, so there is never a window in which an uncaged agent holds native tools. Ours has exactly that window, and cloud-runner.md admits it — an uncaged agent editing the repository is the one thing the contract forbids, and nothing stops it. We cannot adopt their answer, because the cage is per-session and a cloud chat session starts already running. WHAT OURS SHEDS: the image. se-arrive needs a checkout and a runtime, and it repairs a shallow clone in place, which a prepared image does not attempt because it assumes the clone it was built around.

NIX AND MISE. They provision the runtime deterministically and we deliberately do not — we read the declared pin and report a mismatch. Theirs is better where the host can be controlled. Ours is better where it cannot, which is the cloud case, and it fails loudly rather than silently drifting.

WHAT FAILED, AND IT IS OURS. The caged-subagent hand-over in cloud-runner.md, recorded as having worked on 2026-08-15. It did not work on this harness: an Agent subagent inherits the session's MCP registry, so a cage placed mid-session binds nothing. That is a prior art failure in our own guidance and it is why the HTTP attach exists.

THE COMPARISON NOT MADE, and it is named rather than left blank: whether any agent harness lets a live session attach its own MCP server. If one does, half of se-arrive is a workaround for a solved problem. Filed as raid-asm-a-running-agent-session-cannot-attach-its-own-mcp-server.

## success_measurable

EVERY NEED CARRIES ITS PASS LINES, in vp-the-unattended-arrival.

- Agent-minutes from session start to first pull. Target under one. BEFORE: most of an hour, measured this run. AFTER: not yet measured, and said so.
- Acts required on a second run. Target none. MET: se-arrive is idempotent and reuses a lane already answering.
- Records citing ref: main that fail on a fresh cloud clone. Target none. MET and measured both ways — a fetch alone still failed, and the local branch fixed it.
- Sessions ended by the arrival step. Target none. MET by construction: every ending in the hook is a printed line and exit 0.

vp-autonomy-range carries the walk half, and its criterion that an unattended walk stops only at the gates that matter is NOT met — the default dial stops at the first gate of every iteration. That is a real fail against a standing value prop, and it is the owner's to close.

## risks_logged

THE REGISTER IS OPEN WITH THREE ENTRIES, each with an owner and a trigger.

- raid-asm-a-running-agent-session-cannot-attach-its-own-mcp-server. Owner the owner; trigger the first harness offering a live attach. The whole arrival design rests on it and this box can only observe itself.
- raid-iss-two-entrypoints-place-the-cage-and-nothing-compares-them. Owner the owner; trigger already live. Crippling and likely, and the only one this iteration CREATED.
- raid-asm-the-declared-node-floor-matches-what-the-engine-needs. Owner the owner; trigger already fired — measured false at the edge.

## round_0_verify

- evidence vs claims: green. Every claim in this packet carries its measurement. The arrival cost, the root sandbox refusal, the two-stage ref repair, the 5-to-2 red count and the two-runtime battery comparison were each taken on this box with numbers on both sides.
- types: green. Every changed file runs unflagged in the suite; no type error in 1397 cases.
- lint: green. biome over 272 files, clean, and the lane ran its safe fixes on every patch.
- tests: 1397 total, 1395 green, 2 red — both pre-existing, both root-caused, neither i35's work.

## round_1_validate

- exercised against the goal: partly, and the split is clean. The ARRIVAL half is met and mechanical. The WALK half is not: this run needed an owner instruction to pass M0.
- missing: an after-measurement of the arrival on a genuinely fresh box. This one can no longer produce it.
- wrong: the seed's diagnosis of finding 1. Both candidate causes were in the compiler and neither was true. An agent trusting the seed would have spent its afternoon in the wrong file.
- out of scope: three owner rulings, the rename routed to i10, the node floor, the shared-module debt, and two pre-existing reds — each captured with its options rather than dropped.
- prior art: compared above against devcontainers, Codespaces, Nix and mise, plus our own failed caged-subagent pattern. The unmade comparison is named and filed as an assumption.

## round_2_red_team

- THE STEELMAN: this iteration should have done what the seed asked and nothing else => Argued at its strongest, this is serious. The seed listed six findings. i35 landed four and then spent its largest effort on something the seed never mentioned, which is scope an agent granted itself. Contract rule 2 says do not improve what the state did not name. WHAT DEFEATS IT: the owner instructed it explicitly mid-run — build what is holding you up into the system — and the arrival was measured as the single largest cost on the box. But the instruction is what makes it legal, not the measurement, and without it this would have been the agent choosing its own work.
- KILL-CRITERION for the whole arrival: a harness that can attach an MCP server to a live session => Looked for; not established. If it exists, half of se-arrive is dead weight. Filed as an assumption rather than asserted as a fact.
- KILL-CRITERION for the value prop: cloud runs being rare => Falsified in the other direction. This is the second in two days.
- THE UNCAGED WINDOW IS REAL AND THIS ITERATION DID NOT CLOSE IT => Conceded. Between session start and the arrival completing, an agent holds native tools with nothing stopping it, and se-arrive shortens that window without removing it. Codespaces removes it. We cannot, while the cage is per-session.
- THE GATE IS BLESSED BY THE AGENT THAT DID THE WORK => Conceded, not waived. Carried into the verdict as a dissent.

## raid_additions

- raid-asm-a-running-agent-session-cannot-attach-its-own-mcp-server
- raid-iss-two-entrypoints-place-the-cage-and-nothing-compares-them
- raid-asm-the-declared-node-floor-matches-what-the-engine-needs

## verdict

pass — the delta is measured, the goal is worth having, and the packet is complete. Two dissents are recorded rather than waived.

DISSENT ONE: fresh eyes cannot be honoured on a box with nobody else on it, so every round-0 verdict here is self-observed. That is a property of unattended running, not of this change.

DISSENT TWO: vp-autonomy-range's own criterion — an unattended walk stops only at the gates that matter — is NOT met at the default dial, and this gate passes anyway. It passes because the failure is a configuration the owner sets, not a defect this iteration can fix, and because it is named here rather than buried.

WHAT MAKES IT PASS: every claim carries a number taken on this box, the prior art is compared on both sides including a failure of our own, and the suite carries new cases that go red if any of it stops being true.
