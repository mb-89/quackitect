---
form: gate-motivation
bless: blessed by agent
by: agent
signed_off: 2026-08-24T15:56:04.278Z
authors: agent
files: null
---

# Evidence form / gate-motivation

## current_situation

The motivation phase is written. The vision is inherited, the register is open with seven entries, the delta extends vp-autonomy-range, and scope and non-goals are signed.

This gate is the one place the frame's worth is argued. Past it the vision is axiom and nothing downstream re-litigates it.

The record runs at a walker ceiling of zero, so the same hand authored the frame and reviews it here. That is named in the verdict rather than left for a reader to notice.

## vision_scope_stated

THE RESIDENT VISION IS AXIOM AND STAYS OUT OF SCOPE. It is spec/trace/value-prop/vp-the-engine.md, minted at i2: an engineer draws their own process as a state machine and the engine gives it teeth.

NOTHING HERE BENDS IT. This record does not touch what a drawing means, who blesses, or what evidence is owed.

WHAT IT TOUCHES IS THE EXECUTION MODEL UNDER THE AXIOM: when a hop is allowed to finish, and what the engine knows about work it started.

AT MINOR, THREE OF THE FOUR VISION QUESTIONS ARE DROPPED MECHANICALLY. Only the goal system was asked, and it named four conflicts and ruled each one.

## problem_agreed

THE PROBLEM IS MEASURED, NOT ARGUED.

2026-08-24: a test run reached 179 of 179 files with 1,803 cases done, then reported itself as running for nineteen minutes with no process alive on the machine.

IT HELD THE WALK. A leaving judgment reads as still deciding while such an entry stands, so the step that owned it could not be left.

THREE OF THEM STOOD FOR FIFTEEN HOURS on one occasion, all reporting complete.

THE CAUSE IS NOT A HUNG PROCESS. The shell child records its exit correctly. The operation that owns the entry never hears, so the entry is a stored guess about something that has gone quiet.

WHY IT MATTERS MOST ON AN UNATTENDED BOX. A person at a screen restarts the engine. Nobody is at the screen, and the run is spent.

## prior_art_positioned

TWO SYSTEMS PEOPLE ACTUALLY USE SOLVE THIS PROBLEM, and both were read at the primary rather than cited from memory.

SYSTEMD'S WATCHDOG. sd_notify(3) at freedesktop.org documents WATCHDOG=1 as "the keep-alive ping that services need to issue in regular intervals if WatchdogSec= is enabled for it". The SERVICE sends it. The manager only counts silence.

KUBERNETES LIVENESS PROBES. The kubelet runs exec, httpGet, tcpSocket or grpc against the container on periodSeconds. The documented exec example runs `cat /tmp/healthy`; a non-zero result and "the kubelet kills the container and restarts it".

WHAT EACH DOES BETTER THAN OURS, said first.

- SYSTEMD TELLS A HUNG SERVICE FROM A DEAD ONE. A live-but-stuck process stops sending its ping, and the manager catches it. Ours cannot: existence is a weaker signal and a hung process still exists.
- KUBERNETES PROTECTS A SLOW START. A startup probe gives a container that is legitimately slow a different budget from one that has failed. Ours has one interval and no equivalent grace.
- BOTH RESTART WHAT THEY KILL. Ours ends the process and closes the entry, and the work is simply lost.

WHAT OURS SHEDS, and it is one thing that matters here.

BOTH REQUIRE THE SUPERVISED THING TO COOPERATE. systemd needs the service compiled against sd_notify. Kubernetes needs a command or an endpoint inside the container that answers.

THIS ENGINE LAUNCHES ARBITRARY CHILDREN: a bash shell, a PowerShell command, a node test runner, a state's exit script. Not one of them was written to answer a supervisor, and rewriting them all to is not a smaller change than this one.

SO THE COMPARISON RESOLVES TO A DELIBERATE TRADE. We take a weaker question, existence, and get it answered about processes that were never designed to be asked. Both alternatives ask a stronger question and can only ask it of workloads built for them.

WHAT WE DO NOT CLAIM. Neither system is beaten on supervision quality. systemd and Kubernetes are better supervisors of things they supervise, and this record does not make ours a general process supervisor.

ONE MECHANISM IS BORROWED OUTRIGHT. The same systemd page documents MAINPIDFD and MAINPIDFDID, used "to identify the process in a race-free fashion". That is the shape the assumption's probe should test on the POSIX side.

## success_measurable

THE PASS LINES ARE ON THE ARTIFACT, not in this form. They were added to spec/trace/value-prop/vp-autonomy-range.md.

- No walk is held by a record of work that has already finished. Metric: entries still marked running with no process behind them. Target: zero.
- Every wait an unattended walk enters carries a duration, and expiry acts. Metric: waits with no duration and no expiry behaviour. Target: zero.

BOTH ARE COUNTABLE FROM THE JOB TABLE ITSELF, which is what makes them criteria rather than intentions. The first is a query over entries and live process handles. The second is a static count over the wait sites in the engine.

THE PROPOSITION'S STANDING CRITERION ALSO APPLIES: unattended stops that are not gates, target zero. The measured fault was one of those, so the existing metric already moves.

WHAT IS NOT MEASURABLE YET. How long a completed task's file is worth keeping. That is a ruling this record makes, and until it is made there is nothing to count against.

## risks_logged

SEVEN ENTRIES OPENED AT log-risks, each a node under spec/trace/raid/ rather than a row in a form.

- raid-iss-a-finished-run-keeps-reporting-itself-as-running. The measured fault, crippling and expected.
- raid-asm-a-launched-process-can-be-asked-whether-it-still-exists. The load-bearing assumption, fatal if false, with its probe written.
- raid-risk-the-heartbeat-ends-a-process-that-is-alive-but-quiet.
- raid-risk-two-closers-reach-one-entry-and-disagree.
- raid-risk-two-engines-run-one-folder-and-neither-says-so.
- raid-risk-the-one-engine-guard-locks-out-a-restart-after-a-crash.
- raid-risk-widening-a-verb-s-legality-weakens-the-state-gate.

EACH CARRIES AN OWNER AND A TRIGGER, so it is watched rather than filed.

TWO OF THEM WEIGH AGAINST EACH OTHER ON PURPOSE: the guard that stops a second engine and the same guard locking out a restart. Recording the pair is what stops the second being discovered as a surprise.

## round_0_verify

- evidence vs claims: every figure here is traced. The 179 files, 1,803 cases and nineteen minutes come from the record's own vision. The systemd and Kubernetes behaviour comes from pages fetched during this state, not from memory.
- types: not run. No source file has changed in this record.
- lint: not run, for the same reason.
- tests: not run. Nothing has changed for the engine to scope a run against.

## round_1_validate

- exercised against the goal: the frame is checked against the record's vision line by line, and against vp-autonomy-range's metric. The measured fault is an instance of that metric going the wrong way.
- missing: a restart policy. Both compared systems restart what they kill and ours does not. It is not in scope and it is not claimed.
- wrong: nothing found. No statement in the motivation contradicts the vision, the register or the scope.
- out of scope: the helper-budget timing fault, which is a standing work token rather than signed scope.
- prior art: COMPARED, at the primary, and the comparison is in prior_art_positioned. Both alternatives are better supervisors and both need the supervised thing to cooperate. That is the trade, stated in both directions.

## goals_served

- The engine holds the live end of every process it launched and asks it, on a fixed interval, whether it is still there.: served, and it is the goal the whole delta rests on. Its assumption is open with a probe.
- Silence past that interval ends the process and closes its entry.: served, with the deliberate weakening that the ping asks existence rather than responsiveness.
- A test run closes its own entry when the process behind it exits, so the heartbeat is a backstop and not the only guard.: served, and it is the cheapest half. It closes the measured fault on its own for every run that exits normally.
- No wait is silent. A wait carries a duration, and expiry does something rather than nothing.: served, and it is the second pass line added to vp-autonomy-range.
- How long a completed task's file is kept is decided first, and only then is the clearing built.: served as a RULING only. The sweep that acts on the number is a named non-goal, so the pile keeps growing until it is built.
- One engine holds a given folder and its network port, and a second one that cannot bind says so instead of running on half-alive.: served, with its counter-risk recorded. The port bind is the only truth, so no lock file can go stale.
- Registering a spawned hand works from wherever the walk stands.: served narrowly. Only the registration argument becomes legal everywhere, and the risk of widening more than that is logged.

## bound_breaches

- if-agent-harness-to-entrypoint: one crossing since this gate's phase opened, and the interface held. A hand was spawned through the harness and the engine refused to count it against a zero budget, naming the ceiling and both remedies. The disposition is done: the hand was closed and the record walks alone.

## round_2_red_team

- STEELMAN: the honest opposing case is that this is a bug fix wearing an iteration's clothes, and one line closing the entry on child exit would have done it => REJECTED, and the reason is the second closer. A run that crashes or is killed never reaches its own close, and those are the runs that produced the fifteen-hour entries. One closer is what the system has today.
- KILL-CRITERION: this is the wrong call if a launched process cannot be asked whether it exists, cheaply, on both platforms. Then the heartbeat degrades to a timeout, which is a guess about something quiet and is exactly what is being replaced => LOOKED FOR IT, and it is recorded as raid-asm-a-launched-process-can-be-asked-whether-it-still-exists with a probe per platform. Not answered yet, and the record says so rather than assuming.
- The heartbeat can end a process that is alive and merely quiet => the ping asks existence, never responsiveness. That is a deliberate weakening, and the cost is that a hang is caught by the ceiling instead.
- Two closers can race one entry => the close is idempotent, and the second closer finds it settled.
- The single-engine guard can lock out a restart after a crash => the port bind is the only truth, because a live listener is a fact and a lock file is a stale guess.
- Widening the registration verb makes its other powers ambient => only the registration argument widens, and if legality cannot be expressed per argument the honest answer is a separate verb.
- THE WEAKEST PART OF THIS GATE IS NOT A FINDING ABOUT THE WORK => it is that the hand which wrote the frame is the hand blessing it. The record runs at a zero walker ceiling by the owner's word, so the separation a reviewer buys was not bought.

## raid_additions

- none

## verdict

pass — the delta is real, measured, and worth building.

WHAT THE VERDICT RESTS ON: a fault observed more than once, a metric on a standing proposition that it moves the wrong way, and a comparison at the primary showing why the two obvious alternatives do not apply to arbitrary children.

WHAT IT DOES NOT REST ON: any built artifact, any test run, or any answer to the load-bearing assumption. The assumption is open with its probe written, and M3 is where it is answered.

THE DISSENT WORTH RECORDING, because a clean pass would hide it: the frame and this review were authored by one hand. The record's walker ceiling is zero by the owner's ruling, and a reviewer would have cost tokens the owner declined to spend. A reader should weigh this gate accordingly rather than as an independent judgment.

WHAT WOULD REOPEN IT: the assumption failing its probe. If a launched process cannot be asked whether it exists, the design behind this pass is not available and the motivation has to be re-argued against a timeout instead.

## follow_up

Past this gate the vision is axiom. The next milestone draws the context and the system-level exclusion list.

One thing is owed downstream by name: raid-asm-a-launched-process-can-be-asked-whether-it-still-exists is probed at M3, and its POSIX half is the part to watch. deliverable/engine/run.ts line 59 detaches on POSIX and not on Windows, and every machine that has run this engine was Windows.

## anything_else

