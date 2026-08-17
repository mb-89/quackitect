---
id: i33-every-interface-a-person-or-an-agent-tou
status: shipped
closed: 2026-08-17T19:59:53.081Z
carried_count: 14
carried:
  - tsp-a-slow-signal-keeps-the-wait — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine (verification.md)
  - tsp-autonomy-tiers — raid-iss-the-autonomy-number-still-rides-every-answer (verification.md)
  - tsp-bound-surface — raid-iss-whole-product-claims-reverified-by-every-record (verification.md)
  - tsp-coupling-disposition — raid-iss-whole-product-claims-reverified-by-every-record (verification.md)
  - tsp-derivation-analysis — raid-issue-the-corpus-wide-inspections-have-no-runner (verification.md)
  - tsp-desk-and-gates — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine (verification.md)
  - tsp-first-run — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine (verification.md)
  - tsp-panel-walkthrough — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine (verification.md)
  - tsp-prose-inspection — raid-issue-the-corpus-wide-inspections-have-no-runner (verification.md)
  - tsp-read-back-inspection — raid-issue-the-corpus-wide-inspections-have-no-runner (verification.md)
  - tsp-record-inspection — raid-issue-the-corpus-wide-inspections-have-no-runner (verification.md)
  - tsp-tour-run — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine (verification.md)
  - tsp-two-machines — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine (verification.md)
  - tsp-unattended-start — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine (verification.md)
started: 2026-08-17T11:01:32.755Z
opened: 2026-08-15T13:26:51.317Z
goal: "Every interface a person or an agent touches answers inside a second, or says plainly that it will not — and the boundaries themselves get modelled first, because today none of them exist as nodes."
vision: "OWNER FRAMING, 2026-08-15: \"get the performance under one second for everything that is user facing, and everything that is over one second needs to be non-intrusive. Every interface that goes to a human or to an agent needs to be that fast. Either that fast, or very transparent about how slow it is.\"\n\nMODELLING COMES FIRST, AND THAT IS A FINDING RATHER THAN A CHOICE. The trace holds 40 interface nodes and every one is element-to-element. A search of every interface and element file for `nbr-` returns ZERO. The neighbours exist as nodes — nbr-engineer, nbr-agent-harness, nbr-vscode, nbr-obsidian — and nothing connects an element to one.\n\nSo the boundary this iteration is about has no node. There is nowhere to hang the demand and nothing for a check to enumerate. That is also why the one-second rule has never had a list to be checked against: req-call-answers-in-one-second and req-surface-answers-in-one-second are written against ELEMENTS rather than against a boundary.\n\nNothing else plans this. version-planning.md returns zero hits for `interface`, and its two `boundary` hits are the trace graph's fan collapse and the options pool's privacy line.\n\nFOUR MILESTONES, in this order.\n\nONE — MODEL THE OUTSIDE BOUNDARIES. One interface node per element-to-neighbour pair that actually carries traffic. Small: the elements exist, the neighbours exist, what is missing is the edges. This draws boundaries that already exist in fact.\n\nTWO — BIND THE DEMAND TO THEM. Every such interface answers inside a second, or is transparent about not doing so. The transparency half is a real requirement and not a consolation: non-intrusive, honest about what it is doing, and a person never left guessing whether it is working.\n\nTHREE — INSTRUMENT PER INTERFACE, so the check is mechanical rather than a person watching. The capability already exists and this is its lesson: mirror_profile recorded a phase breakdown 324 times over a second, for days, and NO STATE READ IT. An instrument nobody reads is not instrumentation. The reading has to be somebody's job in the machine.\n\nFOUR — FIX WHAT THE NUMBERS NAME.\n\nWHAT THE NUMBERS ALREADY NAME, measured at i12's close and not to be re-derived.\n\n- 2311 calls over a second in the log; 422 over ten.\n- The slow surface is ONE derivation repeated: \"is this state green\", once per state, per render, when at most one state moved since the last render. render.ts:3699-3724, in drawingSets and stateDetails.\n- IT IS NOT the compile (the session phase measures 3.4 ms), NOT the SVG (machineSvg consumes an existing canvas and reads no disk), NOT the corpus (4.3 ms warm, and the data phase is 0.2 ms), NOT the cubic comparison walk (about 2 ms a question, and i12 struck that clause from its own goal for exactly this reason).\n- THE DAG IS THE INSTRUMENT for the repetition. downstreamCone already exists in engine/machine.ts and is already imported into session.ts — the engine knows what a change reaches, and uses it to invalidate rather than to avoid work. The missing half is the memo on the other side of the same edge.\n- THE WORST BREACH IS NOT A SURFACE. /mcp POST answered in 33,461 ms and 12,337 ms. That is the lane's own door, and the owner's scope wording puts it in.\n- se_pull: 351 calls over a second, 156 over ten, worst 117,559 ms. Two causes at two dates. i27's pulls REPLAYED, every walked array restarting at idle. Today's do not, and a pull walking ZERO hops still cost 5989 ms.\n- Answers of 300,000 characters are routine; one submit cost 33,456 ms. The form packet ships every template's meta and about 25 null-valued keys per field, on every call.\n\nTHE FIRST MOVE IS FOUR LINES, and it decides the shape of everything after it: split the `machine` phase into its four parts. The mechanism is already in the function. Prediction on the record, so it can be wrong in public: drawingSets and stateDetails hold over 90%, and the SVG is under 50 ms. Spread evenly across states means the DAG is the answer. Concentrated in one call means a targeted fix is, and the DAG is the wrong instrument.\n\nWHAT DONE LOOKS LIKE. Every modelled human-facing and agent-facing interface either answers inside a second, or is measured, named and visibly honest about not doing so. The check is mechanical and a state reads it. Nobody has to ask an agent to go and look."
inputs:
  - "note-5e2d3cae20e0"
  - "note-f9d6dd98f126"
  - "i12"
  - "note-afb66f5e0dee"
  - "note-5cebd22ef8f1"
  - "note-ff8f4378deab"
  - "note-801f54496c1f"
  - "note-c8e5a398b943"
  - "note-7941a76b7f0f"
  - "note-e31d7d3a0e08"
depends_on:
---

# i33-every-interface-a-person-or-an-agent-tou

## Goal

Every interface a person or an agent touches answers inside a second, or says plainly that it will not — and the boundaries themselves get modelled first, because today none of them exist as nodes.

## Rough vision

OWNER FRAMING, 2026-08-15: "get the performance under one second for everything that is user facing, and everything that is over one second needs to be non-intrusive. Every interface that goes to a human or to an agent needs to be that fast. Either that fast, or very transparent about how slow it is."

MODELLING COMES FIRST, AND THAT IS A FINDING RATHER THAN A CHOICE. The trace holds 40 interface nodes and every one is element-to-element. A search of every interface and element file for `nbr-` returns ZERO. The neighbours exist as nodes — nbr-engineer, nbr-agent-harness, nbr-vscode, nbr-obsidian — and nothing connects an element to one.

So the boundary this iteration is about has no node. There is nowhere to hang the demand and nothing for a check to enumerate. That is also why the one-second rule has never had a list to be checked against: req-call-answers-in-one-second and req-surface-answers-in-one-second are written against ELEMENTS rather than against a boundary.

Nothing else plans this. version-planning.md returns zero hits for `interface`, and its two `boundary` hits are the trace graph's fan collapse and the options pool's privacy line.

FOUR MILESTONES, in this order.

ONE — MODEL THE OUTSIDE BOUNDARIES. One interface node per element-to-neighbour pair that actually carries traffic. Small: the elements exist, the neighbours exist, what is missing is the edges. This draws boundaries that already exist in fact.

TWO — BIND THE DEMAND TO THEM. Every such interface answers inside a second, or is transparent about not doing so. The transparency half is a real requirement and not a consolation: non-intrusive, honest about what it is doing, and a person never left guessing whether it is working.

THREE — INSTRUMENT PER INTERFACE, so the check is mechanical rather than a person watching. The capability already exists and this is its lesson: mirror_profile recorded a phase breakdown 324 times over a second, for days, and NO STATE READ IT. An instrument nobody reads is not instrumentation. The reading has to be somebody's job in the machine.

FOUR — FIX WHAT THE NUMBERS NAME.

WHAT THE NUMBERS ALREADY NAME, measured at i12's close and not to be re-derived.

- 2311 calls over a second in the log; 422 over ten.
- The slow surface is ONE derivation repeated: "is this state green", once per state, per render, when at most one state moved since the last render. render.ts:3699-3724, in drawingSets and stateDetails.
- IT IS NOT the compile (the session phase measures 3.4 ms), NOT the SVG (machineSvg consumes an existing canvas and reads no disk), NOT the corpus (4.3 ms warm, and the data phase is 0.2 ms), NOT the cubic comparison walk (about 2 ms a question, and i12 struck that clause from its own goal for exactly this reason).
- THE DAG IS THE INSTRUMENT for the repetition. downstreamCone already exists in engine/machine.ts and is already imported into session.ts — the engine knows what a change reaches, and uses it to invalidate rather than to avoid work. The missing half is the memo on the other side of the same edge.
- THE WORST BREACH IS NOT A SURFACE. /mcp POST answered in 33,461 ms and 12,337 ms. That is the lane's own door, and the owner's scope wording puts it in.
- se_pull: 351 calls over a second, 156 over ten, worst 117,559 ms. Two causes at two dates. i27's pulls REPLAYED, every walked array restarting at idle. Today's do not, and a pull walking ZERO hops still cost 5989 ms.
- Answers of 300,000 characters are routine; one submit cost 33,456 ms. The form packet ships every template's meta and about 25 null-valued keys per field, on every call.

THE FIRST MOVE IS FOUR LINES, and it decides the shape of everything after it: split the `machine` phase into its four parts. The mechanism is already in the function. Prediction on the record, so it can be wrong in public: drawingSets and stateDetails hold over 90%, and the SVG is under 50 ms. Spread evenly across states means the DAG is the answer. Concentrated in one call means a targeted fix is, and the DAG is the wrong instrument.

WHAT DONE LOOKS LIKE. Every modelled human-facing and agent-facing interface either answers inside a second, or is measured, named and visibly honest about not doing so. The check is mechanical and a state reads it. Nobody has to ask an agent to go and look.

## Inputs

- note-5e2d3cae20e0
- note-f9d6dd98f126
- i12

## Measured baseline, 2026-08-17

Taken at this iteration's onboarding retro, from the call log. 8424 calls, and
every one of them is AFTER i12 shipped on 2026-08-15.

- 1834 calls miss the one-second rule.
- se_pull: 730 calls, 318 over a second (44 percent), 184 over five seconds
  (25 percent), 15 over thirty.
- se_aim: 81 calls, 67 over a second (83 percent), 44 over five (54 percent).
- The engine's own slow alarm fired 937 times, and mirror_profile 178 times.
- Refusals are the smaller cost: 333 typed rejections in 8424 calls, 4 percent.

THE PULL IS THE ONLY VERB THE WALK HAS, so every state of every iteration pays
that latency several times over.

i12 SHIPPED THE ONE-SECOND RULE TWO DAYS BEFORE THESE NUMBERS. Its goal was to
hold the rule on the surfaces that break it. So this iteration is not repeating
i12. It is answering why fixing instances did not hold the rule, which is what
the modelling-first finding above already says.

## Carried in at the retro's backlog walk, 2026-08-17

Seven parked notes were pulled into this round rather than left parked. Each
names a specific interface that misses the rule or misleads about it.

- note-afb66f5e0dee — the pull REPLAYS a record instead of resuming it, and
  re-evaluates green states that cannot have moved. A named cause of the pull
  latency measured above.
- note-5cebd22ef8f1 — the bless takes over a second on a path that does no
  work, and carries a slow record at 13,156 ms on a single POST.
- note-ff8f4378deab — the same fault from the other side, stated against
  req-call-answers-in-one-second.
- note-801f54496c1f — the prompt-layer placement takes about five seconds.
- note-c8e5a398b943 — stream the walk the way a game streams a level: peek what
  is needed now and collect the rest in the background. Its own text says it
  belongs beside this iteration's boundary work.
- note-7941a76b7f0f — the aim answer's reads list misleads and may not be
  needed at all. Its own text says it belongs beside this iteration's
  packet-size work.
- note-e31d7d3a0e08 — se_log_query cannot serve a large response back, because
  the log stores it CUT.

THE LAST ONE IS THIS ITERATION'S SUBJECT TWICE OVER, and it was confirmed live
on 2026-08-17. A survey result the host moved to disk was re-fetched by ref, as
the lane's own rule instructs, and came back with 56,238 characters cut. So it
is an interface that neither answers well nor says plainly that it will not —
it reports a value it did not serve, and the guidance promises otherwise.

## Reported live by the owner, 2026-08-17 — the stop-at control

THEIR WORDS: "I also try to set the stop condition to blockers only, but it
doesn't work. The button doesn't activate." And, correcting a first wrong
reading within the minute: "I know I cannot jump to blockers only. That's fine.
I already set it to bless. So when I set it to bless, blockers only should
enable it. It doesn't."

THE OWNER RULED IT IS FIXED DURING IMPLEMENTATION, not at the gate.

## What was checked rather than assumed

THE RUNG LOGIC IS CORRECT. `renderRung` in engine/params.ts computes
`reachable = on || bank.at >= below`. For the fourth notch `below` is 3, so at
a bank position of 3 that is `3 >= 3` and the button should be live, titled
"click: blockers only".

SO THE FAULT IS IN WHAT `bank.at` HOLDS, not in the rule applied to it.
`stop_at` is typed `number`, and the bank takes `v.stop_at ?? 0`. An ABSENT
value becomes 0, and at 0 only the first notch is reachable while the other
three draw locked — a dead row that looks exactly like a control refusing the
click.

## The engine already names this failure class

engine/mirror.ts, lines 756 to 762: "EVERY STATE THE PANEL CAN DRAW HAS TO BE
HANDED IN. What is missing here does not fail loudly — renderPanel reads it as
absent and draws the OFF state, so the control looks like it never took the
click." It records two earlier victims: the emergency rung, and the shutdown
row which could never show a pressed button at all.

AND THE LINE ABOVE NAMES THE LIKELY SURFACE: "a host that drew its own drifted
the moment the spec changed, and that is precisely what happened to the VS Code
bar."

## The check that settles it, and it is one read

The mirror's own `/widget/controls` endpoint DOES hand in
`stop_at: state.session.stopAtValue`, so the HTTP surface should be sound.

THE OWNER IS ON VS CODE. So the question is whether
project/deliverable/vscode/src/extension.ts draws the bar from its own values,
and whether it hands in `stop_at`. If it does not, the row draws dead from any
notch and the symptom is fully explained.

A SECOND CANDIDATE IF THAT ONE FAILS: the panel does not repaint after a
control post, so the bank keeps a stale position while the session already
holds the new one. That is i4's subject in its own goal, "a bless repaints
without a reload", and note-f7777e741479's from the other side.

## Why it belongs here and not on a bug list

A CONTROL THAT DECLINES AND REPORTS NOTHING is the exact half of this
iteration's goal that says an interface must SAY PLAINLY that it will not do
something. Whatever the cause turns out to be, the fix includes the button
explaining itself.
