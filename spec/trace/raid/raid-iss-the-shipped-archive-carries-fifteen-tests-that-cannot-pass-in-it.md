---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: raid-iss-the-shipped-archive-carries-fifteen-tests-that-cannot-pass-in-it
type: "[[raid]]"
kind: issue
statement: the package ships the test suite and excludes spec, so fifteen cases that read this repository's own corpus fail on every fresh install.
owner: the owner
trigger: already live - found at i17's package state, 2026-08-18, by running the shipped battery from an unpacked archive outside the repository
status: open
impact: "A stranger who runs the shipped battery sees 1460 pass and 15 fail and concludes the product is broken. It is not: every one of the fifteen is an ENOENT on spec/trace, which the package excludes on purpose because that folder is where the reader's OWN records go. The suite says nothing about the reader's install and reads as if it did."
breaks_how_badly: abrasive
how_likely: expected
probe: "RUN. The 4.6.0 archive was unpacked to a bare directory outside the repository, its dependencies installed, and its own selftest run: 1475 tests, 1460 pass, 15 fail. Every failure is a missing corpus path - spec/trace/value-prop, /story, /use-case, /requirement, /experiment - or a corpus-derived assertion that reports the corpus did not load."
probed: 2026-08-18
source_refs:
  - i17-the-options-pool-triage-a-raw-note-into-
weighs_with: none
weighs_against: none
place: backlog
ready_when: ready when a building milestone pulls hygiene work
---

## What is actually wrong

THE TESTS ARE RIGHT AND THE PACKAGING IS RIGHT. Neither half is a mistake on
its own.

- The fifteen cases are CORPUS LAWS. They exist to hold this repository's own
  trace honest, and they must read the real corpus to do it.
- The package excludes `spec` deliberately. That folder is the
  reader's own records, and shipping ours would put our work in their tree.

WHAT IS WRONG IS THAT THE TWO MEET. The suite ships, the corpus does not, and
nothing tells the reader that fifteen of these were never going to pass here.

## Two fixes, and the cheaper one is better

- SKIP RATHER THAN FAIL. Each of the fifteen already knows it needs the
  corpus; one of them says so in its own message. A guard that skips when
  `spec/trace` is absent turns fifteen reds into fifteen honest skips.
- OR DO NOT SHIP THE SUITE. Cheaper still, and it loses something: a reader
  who changes the engine has nothing to check themselves with.

THE FIRST IS RECOMMENDED. The suite is worth shipping; a red that means
nothing is not.

## Why nobody found it before

THE PACKAGE CHECK HAS ALWAYS BEEN A DRIVE, NEVER A BATTERY. i33 and i35 both
recorded unpacking the archive and running it from outside the repository, and
both were right that it works. Neither ran the shipped suite, because a reader
would not - which is exactly why fifteen standing reds sat there unseen.
