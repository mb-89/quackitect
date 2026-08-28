---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: opt-package-from-an-include-list-so-an-unlisted-file-cannot-ship
type: "[[option]]"
statement: Build the packaged artefact from an explicit list of what belongs in it, so a file nobody named cannot ship, instead of listing what must stay out and checking that the list is right.
cluster: the-bootstrap
question: how a produced copy withholds the machine state
found_by: heuristic
source: Make the illegal unrepresentable, not merely checked.
---

## Mechanism

TODAY IT IS A DENY LIST. The machine-state folder must not ship, and that holds
only for as long as the pattern is right. A file that matches no pattern ships.

INVERTED, THE DEFAULT FLIPS. Only named files go in. A new file appearing in the
machine-state folder ships nothing, because nobody named it and nobody has to
remember to exclude it.

## Why this delta raises it

THE FOLDER MOVED INSIDE THE PACKAGED ROOT. Before the collapse, excluding it
rode on a boundary that already existed. Now it is a rule somebody has to write
and keep right.

ONE BLESSED GOAL MULTIPLIES THE PATTERNS. Splitting the exclusion by file rather
than by directory means more patterns, each of which is another chance to be
wrong.

## The asymmetry is the whole argument

BOTH LISTS CAN BE WRONG, and they fail in opposite directions.

- A deny list that is wrong SHIPS SOMETHING PRIVATE. Nothing breaks. Nobody
  notices. The failure is silent and it is the one that matters.
- An include list that is wrong LEAVES SOMETHING OUT. The product fails on
  install, immediately, for the first person who tries it.

A LOUD FAILURE IS CHEAPER THAN A SILENT ONE, and that is the reason to prefer
this shape rather than a general preference for allow lists.

## What it costs

EVERY NEW SOURCE FILE NEEDS NAMING. That is real friction on ordinary work, paid
by whoever adds a file, forever.

IT ALSO CANNOT BE ADOPTED HALFWAY. A packaging tool that only supports exclusion
patterns forces the include list to be materialised some other way, which is a
build step rather than a configuration line.

## It does not replace the test the gate demanded

THE M2 GATE ASKED FOR A TEST that packages a tree and asserts the machine-state
folder is absent. That test is still owed under this option.

WHAT CHANGES IS WHAT THE TEST IS LIKELY TO CATCH. Against a deny list it guards
a pattern. Against an include list it guards the build step, which is one thing
rather than a growing list.
