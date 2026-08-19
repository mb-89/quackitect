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
probe: "UNPROBED, and it is an inspection rather than a test: read every writer of the option kind and confirm each passes the mint's demands. There are none today, so there is nothing to read. WHAT CAN BE SAID is that the analogue holds - engine/inbox.ts is the only writer of the note store - and a reading of an analogue is not a probe of the claim."
probed: 2026-08-18
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
