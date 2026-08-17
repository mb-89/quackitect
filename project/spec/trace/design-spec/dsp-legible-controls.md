---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: dsp-legible-controls
type: "[[design-spec]]"
statement: a control says what it did with an act, carried by a rung bank that names its unlocking notch, distinguishes an absent position from a deliberate one, and renders work still running beside itself
realizes:
  - "el-mirror"
files:
  - "project/deliverable/engine/params.ts"
  - "project/deliverable/engine/mirror.ts"
  - "project/deliverable/engine/run.ts"
  - "project/deliverable/vscode/src/extension.ts"
---

## Why this is its own spec

dsp-mirror-render covers the surface a person looks at, whole. This covers ONE
concern below that: what a control communicates about an act.

THE SPLIT EARNS ITSELF because the failure is not a rendering failure. Three
recorded sightings — the emergency rung, the shutdown row, the stop-at notch —
all had a correct renderer fed a value it could not interpret. The concern is
the CONTRACT between the values and the bank, and it lives in one function.

## Three designs, one per red case

### One: a locked rung names its unlocking notch

TODAY the title reads "unlock the rung below first". The rung below is known at
render time — `renderRungs` already passes it in as `below` — and the notch list
carries its name.

SO THE DESIGN IS TO SAY IT: the unreachable branch composes its help from the
name of the notch at `below` rather than from a fixed string.

WHAT IT MUST NOT BECOME: a second copy of the notch list. The name comes from
the levels already handed in, so an edit to machines/stopat.md moves it without
touching this code.

### Two: absent is not zero

TODAY `v.stop_at ?? 0` collapses two different facts into one. A bank handed
nothing and a bank at the lowest notch render identically, which is the shape
that disarmed the emergency rung.

SO THE DESIGN IS TO KEEP THEM APART. The bank's position becomes explicitly
absent-or-a-number rather than defaulted at the boundary, and an absent
position renders a bank that SAYS it does not know where it stands, rather than
a row of locked buttons that reads as a refusal.

THE RULE THIS ENFORCES, and it is wider than one bank: a surface may not
present missing data as a value. It is the same law
req-a-surface-shows-the-state-an-act-produced states, applied at the one place
that has broken it three times.

### Three: work still running rides beside the controls

TODAY nothing carries a running operation to the panel, so a slow call and a
hung one look the same.

SO THE DESIGN IS A VALUE, NOT A WIDGET. The panel values gain what is running
and how long it has been running, supplied where every other panel value is
supplied. The bar renders it beside the controls rather than over them.

WHAT IS DELIBERATELY NOT DECIDED HERE: what the signal SAYS. A faithful
completion percentage is the known way to fail
req-a-slowness-signal-never-shortens-the-wait, and choosing the wording is a
judgment the owner holds through
raid-risk-an-accurate-progress-signal-can-drive-abandonment. This spec settles
where it lives and that it does not take the surface over.

## Why four files and not two

THE FILE LIST GREW DURING THE BUILD, and it grew because the wire has four
legs rather than two. ux.md names them: the engine state that holds the fact,
the payload that carries it outward, each host's channel, and the DOM that
draws it. Fixing one leg and shipping is the failure this project repeats most.

- engine/run.ts holds the fact. `runningJob()` names the job somebody is
  waiting on, beside the older `anyJobRunning()` which counts rather than names
  and therefore cannot be shown.
- engine/mirror.ts carries it outward, in the /widget/controls values.
- engine/params.ts draws it, as a sibling of the control rows.
- vscode/src/extension.ts styles it, from the host's own theme.

A LINK IS A CONTRIBUTION, so each of the four is here because this design
actually lands in it. None is claimed to look covered.

## What this spec does not claim

THE POST AND THE STORED VALUE. The stop-at fault of 2026-08-17 was pushed past
the rendering by probe, and what remains of it is either the POST or
`session.stopAtValue`. Neither is this spec's file.

THE AGENT HALF of req-a-refused-act-says-why-and-what-next. An agent's reason
arrives on a typed refusal, which the lane already builds and which is not
params.ts.
