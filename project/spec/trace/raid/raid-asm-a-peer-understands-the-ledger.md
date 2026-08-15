---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: raid-asm-a-peer-understands-the-ledger
type: "[[raid]]"
kind: assumption
statement: A peer machine reading the claim ledger runs an engine that understands every word written in it.
owner: the driving agent
trigger: at the first entry attempt by a machine whose engine predates a ledger word
status: open
probe: "HOLDS for the property that matters, probed 2026-08-13 against the real parser. A ledger entry carrying an unknown word (handed_back, meaning the claim was given up) was written to a bare origin and read by a clone. The parser skipped the word and reported the claim as standing; a different machine entering was REFUSED, naming the holder. So an unknown word fails toward refusing rather than granting, and no double-claim is possible through this door. WHAT THE PROBE ALSO SHOWED: that direction is wrong in the other sense - a record genuinely handed back reads as held, so real work reads as unavailable. Safe against collision, lossy against availability."
probed: 2026-08-13
impact: A peer silently ignores a word it does not know. The terminal done state reads as absent, and the peer claims a record that shipped - which is the exact failure the done state was added to prevent.
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - req-a-shipped-record-is-never-reclaimed
  - "the ledger gained the done word on 2026-08-13"
  - "the cloud machine claimed i8 at 09:40 on 2026-08-13, running its own engine build"
---

THE LEDGER IS THE ONE FILE EVERY MACHINE READS BEFORE IT ENTERS
ANYTHING, and that is exactly why a word it cannot read is dangerous.

THE PARSER IS FORGIVING BY DESIGN. It reads the keys it knows and skips
the rest, which is right for adding fields and wrong for adding
MEANINGS. An older engine meeting `done:` does not error - it sees a
claim with a machine and a timestamp and no release, concludes the claim
stands, and refuses entry.

THAT PARTICULAR FAILURE IS SAFE. Refusing entry to a shipped record is
the outcome we wanted, reached by accident.

THE UNSAFE DIRECTION IS THE ONE TO WATCH. A future word meaning "this
claim no longer holds" would be skipped by an old engine, which would
then treat a freed record as held, or a held one as free. The done word
is safe by luck rather than by design, and the next word will not be.

## Why it is live rather than theoretical

Two machines already share this ledger. The cloud machine claimed i8 on
2026-08-13 running its own build, from its own clone, at whatever engine
version it had fetched. Nothing coordinates those versions and nothing
reports the difference.

## Probe

Write a ledger entry carrying an unknown word, and read it with an
engine that predates it. Record what the older engine concludes about
the claim's state.

The cheap version needs no second machine: run the current parser
against a ledger file carrying a made-up key, and assert what it decides.

## What closes it

Either the ledger declares its own version and an engine refuses a
ledger it is too old to read, or every word is chosen so that skipping
it fails SAFE - toward refusing entry rather than granting it.

The second is cheaper and is what the done word accidentally did. Making
it a rule rather than an accident is the work.
