---
form: expedition-leave
status: done
by: agent
files:
---

# e9 — retro-1 amendments

## What was the goal

Apply the owner's post-retro rulings: M back to 0.01, draining retro-scoped, the autonomy scale as an editable markdown truth, and the dismiss-all report ruling executed.

## What was done

- M floor restored: 0.01 across state notes, boot canvas, the generator, anchors, compiler messages and tests. Autonomy 0 blocks everything again.
- THE RETRO MACHINE: retro.canvas (start → drain → end), hanging off idle both ways (enter freely, return via the alternative edge). The drain state's entry demands the METHOD read (entry_read on guidance/method/retro.md) and is the ONE place se_note_drain is legal.
- RESTRICTED TOOLS rule in the gate: "all" no longer grants restricted tools — a state must name them. se_note_drain is the first member. Tested: refused at idle under the open lane, legal inside retro/drain, drains a real note, unknown ref refuses with SE-C-073.
- The autonomy scale moved to machines/scale.md — Obsidian-editable, field-line grammar, read fresh by the mirror per render; the notches and level help follow an owner edit on reload. Code no longer defines the scale.
- The retro's owner ruling executed: e5, e6, e7, e8 reports flipped to dismissed. e4 and e5 records BACKFILLED (they predate record-minting; timestamps approximate, marked as such) so the archive lists all of e4–e8 correctly.

## What settled it

62/62 selftests green, including the new retro-scope test. The declaration-order bug in the live scale load was caught by the existing mirror test.

## What was not done

- Retro fronting start_iteration (owner direction): recorded for the iteration build — needs either nested sub-machine support or flattening the retro states into start_iteration; decision falls when that lane is built.
- The dedicated retro trigger from finished iterations (retro-required notes) — same round.

## Files

Verification is the selftest suite in-tree; no separate evidence files.
