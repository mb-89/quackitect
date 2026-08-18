---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: dsp-legible-controls
type: "[[design-spec]]"
statement: a control says what it did with an act, carried by a rung bank that names its unlocking notch, distinguishes an absent position from a deliberate one, and renders work still running beside itself
realizes:
  - el-mirror
files:
  - project/deliverable/engine/params.ts
  - project/deliverable/engine/mirror.ts
  - project/deliverable/engine/run.ts
  - project/deliverable/vscode/src/extension.ts
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

## The autonomy dial

THE DIAL SAYS WHICH STATES THE AGENT MAY ENTER BY ITSELF: only those weighing
no more than it. `blocked` hands every step to the person; `ideation` is
fully autonomous.

CONTENT WORK INSIDE A STATE IS NEVER GATED. Only ENTERING is.

IT IS LIVE-ADJUSTABLE, and it starts at tactical — resolved BY NAME from the
scale rather than written as a value anywhere. The rung arrives as a word from
every launch path.

## Emergency lifts the tool gate

THE GATE EXISTS so a state holds the tools its work needs and no more. That is
right while the machine is sound, and exactly wrong in two cases:

- REPAIR. When the engine is broken, the gate stands between you and the fix.
  The guard becomes the fault.
- BUILDING THE LANE WHILE WALKING IT. The first product iteration writes the
  machinery it is walking through, in states whose tool lists were authored
  before that machinery existed.

IT ARMS ONLY FROM THE TOP RUNG and drops the moment the rung does. That is the
whole safety story: emergency cannot outlive the delegation it was granted
under, and lowering the autonomy is the same gesture as revoking it.

IT IS NOT ADVERTISED. It rides the packet only when it is ON, so nothing about
the resting state hints that it exists.

IT PERSISTS WITH ITS RUNG, reversing an earlier no-persist law. Engine reloads
are routine mid-session, and each one silently revoked the very delegation the
fixes were granted under. It restores only beside a persisted top-rung
autonomy, and lowering the dial still revokes it — in this life and the next.

## Set target answers in place

SET TARGET ANSWERS IN PLACE (owner report 2026-08-09: as a redirect
POST the button swallowed its own rejection — success and refusal
both 303ed and the clicking page read nothing). A refusal now comes
back as its own JSON and the client toasts it.

## A reference in prose is a link not dead

A [[REFERENCE]] IN PROSE IS A LINK, NOT DEAD TEXT (owner report
2026-08-09). Where the id resolves in the document's own record, it
becomes the same doclink every structured editor emits; where it
does not resolve it stays text — an unresolved link is a finding.

## The host reads the cards from here

THE HOST READS THE CARDS FROM HERE (owner design 2026-07-30). A host
that draws one button per card must not keep its own copy of the
list — project/deliverable/views/cards.md stays the single truth, and a card added
there appears in VS Code without touching the extension.

## The persons surfaces get the same clock as the

THE PERSON'S SURFACES GET THE SAME CLOCK AS THE LANE (owner, 2026-08-09:
"every time something takes long, I have to tell you"). Every request is
timed at this one door, and a breach lands in the SAME log the retro
already mines — tool mirror_slow, with the path and the wait. Fast
requests stay out: the alive poll runs constantly, and a log of
heartbeats would bury what this exists to surface. The line is the
one-second rule, shared with the lane (calllog.SLOW_MS).

## Kill the whole tree

KILL THE WHOLE TREE, never just the child (found 2026-07-30: a run the
client gave up on kept a test runner and four descendants alive for
minutes, competing with everything measured after it). The shell we spawn
is a parent; killing it leaves its children parented to init and running.
