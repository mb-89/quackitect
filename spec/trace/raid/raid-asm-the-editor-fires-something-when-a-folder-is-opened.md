---
minted_in: i9
type: "[[raid]]"
id: raid-asm-the-editor-fires-something-when-a-folder-is-opened
kind: assumption
statement: "The editor is assumed to run our code when a folder is opened, on its own, reliably, and early enough that the person never waits for a lane that has not been asked for yet."
owner: the driving agent
trigger: "before the entry-point row is designed, and again on any editor version that changes how extensions start"
status: probed
probe: "holds in part, and the failing half is the useful one. The extension manifest declares exactly one activation event, onStartupFinished, which is deferred by design and blind to which folder is open. So our code does wake with no act from the person, which is the half the entry-point goal rests on. But it wakes in every window on every folder, including folders that are not projects of this system, which the owner ruled on 2026-08-19 is FINE, provided a folder carrying no machine state is identified and then left completely alone. So the finding is smaller and sharper than first written. What is now unprobed is whether the extension performs that check today and writes nothing when it fails - the manifest settles what WAKES it and says nothing about what it does next. Still owed: opening a folder four ways and watching both when we wake and what we touch."
probed: 2026-08-19
impact: "The row that makes the launcher a one-time act rests entirely on this. If the editor will not start us without the person acting, then either the person runs something on every start, which is what this iteration exists to remove, or something outside the editor watches folders, which is a much larger design."
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - req-the-editor-is-the-only-entry-point
  - "the editor's own documented activation events, which include a form that fires when an opened folder contains a file matching a pattern"
  - "the same documentation on tasks that run on folder open, which is gated both by a setting and by workspace trust"
---

## What is being assumed

THAT THE EDITOR OFFERS THE HOOK AT ALL. Something must notice a folder being
opened and start our extension without the person choosing to start it.

THAT IT FIRES EARLY ENOUGH. A hook that runs after the person has already
looked at the screen and given up is not the same product as one that runs
before the window has painted.

THAT IT FIRES EVERY TIME. Once per install, or only on the first open of a
session, would leave the promise true on paper and false in use.

## Why it is an assumption and not a fact

THE MECHANISM IS DOCUMENTED AND OURS IS NOT WRITTEN. The prior-art reading at
the M2 gate found the editor documents at least four ways a folder-open can
surface or start something. Reading that a mechanism exists is not the same as
having run ours through it.

AND ONE OF THE FOUR IS GATED IN A WAY THAT MATTERS. Automatic tasks are
documented as never running in an untrusted workspace, whatever the setting
says. If our chosen mechanism carries a similar gate, this assumption and
[[raid-iss-the-consent-line-reads-a-clone-as-though-the-opener-had-consented]]
interact rather than sitting side by side.

## Why it is graded crippling

IT IS THE ONLY THING HOLDING UP THE ITERATION'S LARGEST GOAL. Opening the
editor being the only entry point after the first install is what makes the
entry document's promise true. Nothing else in this iteration substitutes for
it.

AND THE FALLBACK IS NOT A SMALL ONE. Watching folders from outside the editor
is a resident service, which is a different product shape with its own
consent, lifetime and platform problems.

## Probe

OPEN A FOLDER AND SEE WHETHER ANYTHING OF OURS RUNS. Instrument the extension
to record the moment it wakes, open a folder that has never been opened on
this machine, and read the record.

THEN DO IT THREE MORE TIMES. Once with the window already open on another
folder, once after an editor restart, and once on a folder that carries no
trust decision yet. The three answers are the ones that differ.

MEASURE THE DELAY WHILE THE PROBE IS RUNNING, because the same test answers it
and the owner has already reported that a control taking over a second is
unusable to them.

## Probe result, 2026-08-19 — HOLDS IN PART, and the failing part is the useful one

THE EXTENSION MANIFEST WAS READ RATHER THAN REASONED ABOUT.
`deliverable/vscode/package.json` declares exactly one activation
event: `onStartupFinished`. It targets editor `^1.90.0`.

WHAT HOLDS. Our code wakes without the person doing anything. That is the half
the entry-point goal rests on, and it is real today rather than hoped for.

WHAT DOES NOT. The event fires when the EDITOR finishes starting, not when a
folder is opened, and it is deferred by its own definition — it is the event
that means "after everything else". Two consequences follow, and neither was
visible from the prose.

- EARLY ENOUGH IS UNVERIFIED, and the mechanism in use is the one explicitly
  designed to be late. The delay wants measuring, and the owner has already
  reported a control taking over a second.
- ACTIVATION IS FOLDER-BLIND. It fires in every window on every folder,
  including folders that are not projects of this system.

## And that collides with a row this iteration wrote

`req-a-folder-is-driven-only-with-consent` demands that nothing happen to a
folder nobody agreed to drive. Today's activation runs inside that folder
before any such question is asked.

SO THE ROW IS NOT SATISFIED BY WHAT STANDS, which is exactly what a probe is
for. The design milestone inherits a concrete change rather than a worry: an
activation conditioned on the folder, instead of one conditioned on the editor.

THE PRIOR ART ALREADY NAMED THE CANDIDATE. The editor documents a form of
activation that fires only when an opened folder contains something matching a
pattern, which is folder-conditioned by construction.

## What is still owed

OPENING A FOLDER FOUR WAYS AND WATCHING WHEN WE WAKE: cold, into a window
already open, after a restart, and on a folder carrying no trust decision. The
manifest settles what is DECLARED. Only running it settles what HAPPENS.

## Corrected the same day by an owner ruling

THE PROBE RESULT ABOVE CALLED FOLDER-BLIND ACTIVATION A COLLISION. It is not
one.

THE OWNER'S RULE, 2026-08-19: if it finds the machine-state folder it can work
on it, and if it does not it does not work on it. Waking in every window is
allowed. What must not happen is anything being done TO a folder that is not a
project.

SO THE QUESTION MOVED ONE STEP LATER, and got better. It is no longer whether
the activation event is conditioned on the folder. It is whether the code that
runs after waking checks, stops, and writes nothing.

THAT IS CHEAPER TO ANSWER AND CHEAPER TO FIX than redesigning activation, which
is what the first reading would have sent the design milestone off to do.
