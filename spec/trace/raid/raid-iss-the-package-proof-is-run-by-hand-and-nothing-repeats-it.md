---
minted_in: i5-engine-hygiene-one-version-source-every-
id: raid-iss-the-package-proof-is-run-by-hand-and-nothing-repeats-it
type: "[[raid]]"
kind: issue
statement: The release package is proved by five commands typed at the package state, and no check re-runs them, so the proof is only as old as the last person who bothered.
owner: the maintainer
trigger: the next record that reaches the package state, and any change to what the archive excludes
status: open
looked: 2026-08-24
impact: A release gate reads a story about a check instead of a result. A packaging change that drops a needed file is caught only if the next agent happens to run the same five commands in the same order, and nothing tells them which five.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - i5-engine-hygiene-one-version-source-every-
  - sty-ask-the-package-what-it-is
  - tsp-the-package-answers-what-it-is
weighs_with: none
weighs_against: none
place: i66-the-overhaul-gets-its-mechanisms-a-check
---

## What was observed

RUN BY HAND AT i5's PACKAGE STATE, 2026-08-19. The archive was proved with
five commands: unzip into an empty directory, `--version` from the extracted
tree, `npm install` from its own manifest, `preflight.ts`, `smoketest.ts`.
All five passed and every number is in that state's evidence.

NOTHING RE-RUNS THEM. The battery does not build a package and the package
script does not check its own output. The procedure exists only as prose in
`tsp-the-package-answers-what-it-is` and in the evidence forms of the records
that happened to write it down.

## Why it is an issue and not a risk

It is present tense. i34 and i16 each ran a version of this by hand and each
wrote the steps out again, in their own words, because there was nothing to
call. Three records have now paid for the same procedure.

## What repair consists of

- One script that builds the archive, extracts it to a temp directory and
  runs the five checks, printing a verdict.
- The package state runs it and records the result instead of the recipe.
- The exclusion list is what it really guards: `engine/produce.ts` decides
  what travels, and today nothing proves the decision against a real extract.

WHAT IT MUST NOT DO is start the lane from the extracted copy. Running what
the package built would destroy the lane the check runs in, which is the same
trade the version flag's own story accepts on its last slide.

## Looked at 2026-08-24, when the trigger fired

THE TRIGGER FIRED and this is the re-look it asks for. i62 was the next record
to reach the package state, and it found the entry with no `looked:` field at
all while every entry that record minted carried one.

STILL OPEN, AND THE WARNING WAS ACCURATE. The proof behind the 8.1.0 release is
exactly the hand-typed proof this entry is about. Nothing re-runs it.

WHAT CHANGED, AND IT IS SMALL. The five commands are no longer the shape of the
proof. i62 checked the package by unpacking it, installing its dependencies,
and driving the packaged engine over its own protocol until it walked its own
boot states. That is a better proof and it is still typed by hand.

SO THE ENTRY'S OWN WORDS NEED ONE CORRECTION. `nothing tells them which five`
is now `nothing tells them which proof at all`, and the next agent will invent
a third shape.

WHAT WOULD CLOSE IT: a check that unpacks the produced archive and drives it,
run by the engine rather than by whoever is walking. The driver i62 wrote is a
scratchpad script and dies with its container, which is the failure this entry
describes happening again.