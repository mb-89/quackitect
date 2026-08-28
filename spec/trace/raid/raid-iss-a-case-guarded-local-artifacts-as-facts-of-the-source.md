---
minted_in: i5-engine-hygiene-one-version-source-every-
id: raid-iss-a-case-guarded-local-artifacts-as-facts-of-the-source
type: "[[raid]]"
kind: issue
statement: A produce case demanded that four generated or local folders exist in the source before checking they do not travel, so it failed on any clone that had not built or opened an editor.
owner: the maintainer
trigger: any battery run on a machine that has not produced a release or opened the editor
status: open
impact: The battery is red for a reason that has nothing to do with the code under test, and the message names a missing folder rather than a wrong guard. On a cloud clone it fails every run.
breaks_how_badly: abrasive
how_likely: expected
source_refs:
  - i5-engine-hygiene-one-version-source-every-
weighs_with: none
weighs_against: none
place: backlog
ready_when: ready when a building milestone pulls hygiene work
---

## What was found

MEASURED ON THIS CLONE, 2026-08-19, at i5's fix-findings confirm run. One
battery failure of 1461, and it survived every fix this record made because it
was never i5's.

The case asserted, for each of four paths, that the SOURCE has it — as a guard
against checking a path the source never had. Three of the four cannot pass
that guard anywhere clean.

- `dist` is a release output, written by `engine/bin/package.ts`.
- `scratchpad` is the workbench and is never committed.
- `.vscode` is an editor's own folder.
- `.obsidian` IS tracked, and is the only one the guard fits.

## Why the guard was there and why it was wrong

IT WAS WRITTEN AFTER A REAL DEFECT. Two paths in that list once named
`.obsidian` and `.vscode` at the repository ROOT, where neither exists, so the
case passed against an engine with no exclusion list at all. The guard was the
fix for that, and it is a good idea.

WHAT IT GOT WRONG IS THE MEASUREMENT. Presence in a working tree is not
evidence that the source carries something. For a generated folder it is
evidence that somebody built, and for an editor folder that somebody opened an
editor.

## What was done

THE CLAIM IS NOW CHECKED TWO WAYS, and both hold wherever the battery runs.

- The exclusion list NAMES each of the four. That is the declaration.
- Nothing arrived in the produced tree. That is the observation.
- The source-side guard stands for `.obsidian`, which the repository
  actually tracks.

## What is still open

THE SAME SHAPE MAY SIT IN OTHER CASES. Nobody has swept the battery for
assertions that read a working tree as if it were the repository. That sweep is
not this record's, and it is why this entry stays open rather than closing with
the fix.
