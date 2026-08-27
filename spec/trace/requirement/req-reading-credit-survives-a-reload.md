---
minted_in: i3
id: req-reading-credit-survives-a-reload
type: "[[requirement]]"
statement: When the engine reloads, the engine shall keep the reading credit for every document whose content is unchanged.
kind: functional
verify_method: test
breaks_if_removed: Every reload re-owes the whole reading. The agent re-reads documents it still holds, and the same toll is paid twice in one session.
breaks_how_badly: corrosive
refines:
  - uc-be-handed-the-method
source_refs:
  - note-61b267004f20, which the 2026-08-11 retro called the day's whole toll
  - note-6fc953ffcdc8, carrying the mechanism at session.ts readBuffer
  - raid-dep-reading-credit-outlives-se-move
priority: must
---

## Detail

- The credit keys to the document's CONTENT, never to its path. A store that
  moves must not invalidate a credit.
- A document whose content changed is NOT credited. The reader holds the old
  words, so the credit is honestly gone.
- The credit is per session. A different session has read nothing.

## Behaviour

The lifecycle of one credit. The first line is the one that pays.

    (nothing)  -> owed:      a state demands the document
    owed       -> held:      the reader proves it, or reads .se/reading.md
    held       -> held:      the engine reloads and the content is unchanged
    held       -> owed:      the document's content changes
    held       -> (nothing): the session ends

The transition that does not exist today is `held -> held` across a reload.
Today a reload takes every credit to `owed`, which is the defect.

THE PARTICIPANT TEST. Three participants appear: the reader, the document and
the store that holds the credit. The store is brought into being by the first
credit written, and it survives the engine process. Nothing else appears from
nowhere.

## Addition — work tokens

THE CREDIT IS SHARED ACROSS HANDS ON THE MACHINE, not only across a reload.
A reading work token is minted only where the credit is absent, so a credit
held by one hand and invisible to the next re-owes reading that was already
done.

TODAY IT IS NEITHER. deliverable/engine/sessionreads.ts line 88 says a proof
belongs to the head that read, never to the record, and line 98 says the
ledgers do not survive a restart except the default reader's.

VERSION-KEYING ALREADY HOLDS. deliverable/engine/mirror.ts line 174 pins the
check to the document's current hash, so an edited document asks again.

THE KICKOFF GOAL ASSUMED BOTH HALVES. This addition is what makes the
assumption true rather than a defect report.
