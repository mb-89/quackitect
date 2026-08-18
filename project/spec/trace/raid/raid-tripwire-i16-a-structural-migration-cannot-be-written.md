---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-tripwire-i16-a-structural-migration-cannot-be-written
type: "[[raid]]"
kind: risk
statement: The winner leads by one cell on one axis, and that lead rests on a claim tested only for migrations expressible as a single text substitution.
owner: the driving agent
trigger: the first migration that must understand a document's structure rather than match its text — write one that reorders sections, and see whether it can be written at all
status: open
breaks_how_badly: crippling
how_likely: plausible
impact: "The seat changes hands. cand-the-program-route leads cand-everything-declared by exactly one point, entirely on req-overlay-survives-update, 4 against 3. Drop that cell to 3 and the deficit closes, the convergence inverts, and the design M5 is building is the wrong one."
source_refs:
  - cand-the-program-route
  - cand-everything-declared
  - req-overlay-survives-update
  - opt-the-update-arrives-as-a-program
  - "iterations/i16 evidence reverse-sensitivity"
---

## The flip, in one line

ONE CELL. The winner and the runner-up are level on nine criteria out of ten.
On the tenth the winner scores 4 and the runner-up 3, and the convergence
deficit is exactly 1.

SO THIS IS NOT A SENSITIVITY IN THE USUAL SENSE. There is no combination of
swings to hunt. There is one cell, and it decides.

## Why it is credible rather than theoretical

THE WINNER'S OWN NODE SAYS SO, and it said so before this state ran. "THE WORST
CASE THAT DECIDES VIABILITY is a migration that cannot be written as a text
substitution — one needing to understand structure rather than match text. The
probe here faked exactly that, so this candidate's central claim is established
only for the easy half of the space."

AND THE PROBE'S PROGRAM ARM COULD NOT FAIL. It was a text substitution checked
for its own effect, with no repository, no merge and no failure mode available.
It demonstrates that a WHAT-not-WHERE change is indifferent to restructuring. It
does not measure it.

SO THE 4 ON THAT AXIS RESTS ON DESIGN PAR WITH SHIPPED MIGRATION RUNNERS rather
than on anything this project ran. That is a legitimate 4 and it is not
evidence about the hard half.

## The probe that settles it

WRITE ONE MIGRATION THAT MUST REORDER A DOCUMENT'S SECTIONS rather than rename a
token, and see whether it can be written at all.

IT IS CHEAP AND IT IS ALREADY NAMED. find_by_probing's own follow-up carried it:
"ONE PROBE IS OWED LATER AND NOT HERE. Whether a migration that cannot be
written as a text substitution still survives a restructured file."

AND IT SHOULD RUN BEFORE THE BUILD RATHER THAN DURING IT. The whole point of a
tripwire is that the condition is checked while changing course is still cheap.

## The fallback

IF THE PROBE FAILS, THE SEAT GOES TO cand-everything-declared. It is eligible,
it is one point behind, and it was the datum the first convergence run used. M5
inherits it as a live alternative rather than as an eliminated one, which is
why this iteration's gate recorded the runner-up by name.

AND THE FALLBACK IS CHEAPER THAN IT LOOKS. The two designs already share four of
nine picks: how a copy is produced, the recorded pointer, how an override is
matched, and what bounds a producing act. What changes is how the copy's
changes are represented and how upstream's work arrives.

THE RUNNER-UP CARRIES ONE THING THE WINNER CANNOT. A declared patch series
attaches a REASON to every difference. A derived inventory says a difference
exists and cannot say the copy's owner meant it, or why. Nothing in the field
does both, and if the fallback fires, that stops being a cost and becomes a
gain.

## What is NOT ruled credible, and why the page says so

cand-nothing-but-a-channel SITS AT DEFICIT 2 and both its swing cells are
structural rather than contingent. It loses on a wrong act passing silently and
on what setup serves, and both follow from its pick that production happens
outside the lane. Its own option node states it: "THE JAIL IS NOT WIDENED
BECAUSE THE ACT IS NOT INSIDE IT." Nothing a probe could find moves either
cell without changing that pick, which would make it a different candidate.

cand-what-ships-today SITS AT DEFICIT 7 and ties on only three axes, all of
which tie across every candidate. There is no world in this table where it wins.

BOTH ARE LEFT VISIBLY UNRULED RATHER THAN DISMISSED, which is what the state
asks for. Nothing disappears.

## Probed 2026-08-18 at run-spikes — IT DOES NOT FIRE

[[exp-a-structural-rename-across-a-vehicle]] CARRIES THE RUNS. Two throwaway
repositories, three commits each, using the rename this iteration actually
performed: `bring-forth-a-copy` to `bring-forth-a-vehicle`, which moved a file
AND changed an identity inside it.

THE FALSIFIER IS NOT MET. A structural migration CAN be expressed as a program:
"rename this identity, and the file follows" addresses the node rather than the
path, and neither run's restructuring would have troubled it.

## But the advantage it was scored for is narrower than the score assumed

THE MEASURED BOUND, and this is what the probe added that nobody had.

- A 20-LINE NODE, upstream renaming the file and editing two lines, the vehicle
  adding a section: `MERGE_EXIT=0`. One file, upstream's identity, the vehicle's
  section. A plain git merge did the whole thing with nobody involved.
- A 3-LINE NODE, two of three lines changed: `MERGE_EXIT=1`, CONFLICT
  (modify/delete), BOTH files left in the tree, and the vehicle's copy still
  claiming the old identity.

WHAT DECIDES IT IS GIT'S RENAME-DETECTION SIMILARITY THRESHOLD, 50 per cent by
default. Two lines of three is 33 per cent and the rename is missed. Two of
twenty is 90 per cent and it is found.

THE CORPUS SITS ON THE SAFE SIDE. Trace nodes run 40 to 130 lines and a typical
upstream edit is a few lines.

## What this does NOT do, and the restraint is deliberate

IT DOES NOT RE-WEIGHT THE AXIS. cand-the-program-route still beats
cand-everything-declared 4 to 3 on req-overlay-survives-update, and the anchors
behind those two cells are unchanged: the winner still matches the best
comparable tool, and the runner-up still errors out on fuzz.

RE-WEIGHTING WITH THE TOTALS VISIBLE IS THE POISONING cut-criteria's ordering
EXISTS TO PREVENT. The weights are fixed before the candidates are known, on
purpose, and a spike run after the scoring is exactly the wrong moment to move
them.

SO THE BOUND IS RECORDED AND THE SEAT STANDS. What it changes is what the next
derivation of criteria should ask, and what M7 has to build.

## The trigger narrows rather than closing

THIS ENTRY STAYS OPEN. The failing case is real, and it fires where a SHORT node
is largely rewritten upstream. That is a nameable situation rather than a
hypothetical, and whoever builds the update mechanism should handle it or say
why they do not.

AND THE OWNER SAID THE SAME THING FROM THE OTHER SIDE on the same day: "Are you
really gonna implement your own merge system? Why not use git for that?"
note-beac84587cd9 records that exchange and what it reprices.
