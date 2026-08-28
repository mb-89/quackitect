---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: raid-asm-the-drain-is-the-only-door-into-the-pool
type: "[[raid]]"
kind: assumption
statement: Every option in the pool arrives through a drain, so guarding the drain guards the pool.
owner: the driving agent
trigger: the first convenience proposed for filing an option without a note, or any new writer of the option kind
status: deferred
defer_until: a second writer of the option kind is proposed, or the first convenience for filing an option without a note is proposed
impact: "Five of the eight new requirements are demands on the mint. All five are satisfied by guarding one act, and every one of them is bypassed by a second writer - including the FATAL privacy row. The failure is silent: a bypassed option looks exactly like a minted one."
breaks_how_badly: fatal
how_likely: plausible
probe: HOLDS, AND BY CONSTRUCTION RATHER THAN BY CONVENTION. The inspection was run at i9's prototype gate. The pool prefix is named in exactly one module. It has one minter, reached only from the drain. It has one reader. And every other write is refused by a guard that sits on the lane's write path at the last point before anything lands, naming the drain as its remedy. WHAT THE GUARD CANNOT SEE is a write that never enters the lane, which is a different assumption with a different owner.
probed: 2026-08-19
source_refs:
  - req-the-crossing-is-the-same-act-for-a-person-and-an-agent
  - req-draining-to-the-pool-mints-an-option-on-trunk
weighs_with: none
weighs_against: none
---

## Probe

OWED, AND IT IS AN INSPECTION RATHER THAN A TEST, which is why the requirement
it serves names inspection as its verify method.

THE PROBE: read every writer of the option kind and confirm each one passes
through the mint's demands. `(nothing) -> minted: never` is the line in
req-draining-to-the-pool-mints-an-option-on-trunk's lifecycle that says this,
and the probe is checking that the code agrees with it.

WHY plausible. The pressure is real and it comes from a good place: an
unattended agent filing mid-walk wants one call, and a note-then-drain is two.
The first person to notice that will propose the shortcut, and it will look
like an efficiency rather than like a hole.

WHAT WOULD FALSIFY IT: any path that writes an option node without an
originating note. The corpus makes this findable - an option whose source
reference resolves to nothing came in some other way.

## What the inspection found, 2026-08-19

THE CLAIM IS NOW BUILT, NOT ASSUMED. When this entry was written the pool held
nothing and there was nothing to read. There is now, and it reads better than
the entry hoped.

THREE MODULES TOUCH THE POOL AND EACH DOES ONE THING.

- ONE MINTS. `engine/inbox.ts` imports the mint, and the drain is what calls it.
- ONE READS. `engine/survey.ts` imports the standing-tokens reader and writes
  nothing.
- ONE GUARDS. `engine/files.ts` imports the second-door guard and calls it in
  the generic write path, at the last point before anything lands.

THE GUARD IS A REFUSAL RATHER THAN A CHECK. Any root-relative path under the
pool prefix throws, whatever wrote it, and the rejection names the drain and its
backlog disposition as the remedy. So the shortcut this entry predicted — an
agent filing an option directly because a note-then-drain is two calls — is not
available to propose. It is already refused.

## What it still cannot see, said plainly

THE GUARD STANDS IN THE LANE. A write that never enters the lane never meets it:
a person editing in their editor, or an agent whose cage did not bind.

THAT IS NOT THIS ENTRY'S HOLE. It belongs to
`raid-asm-a-break-made-outside-the-lane-is-caught-by-the-sweep`, which has its
own owner and its own probe, and to the boot window that
`raid-iss-boot-grants-no-tools-while-promising-repair` describes.

SO THE TRIGGER STANDS UNCHANGED. Any new writer of the pool kind re-opens this,
and the guard is what makes a new writer loud rather than silent.
