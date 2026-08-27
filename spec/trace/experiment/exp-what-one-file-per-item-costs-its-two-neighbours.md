---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: exp-what-one-file-per-item-costs-its-two-neighbours
type: "[[experiment]]"
statement: How many files does one file per piece of work make, and does either neighbour that holds them mind?
probes:
  - raid-asm-one-file-per-work-token-stays-workable-in-the-vault-and-the-repository
timebox: half a day
form: script
faked: the throwaway repository was built rather than measured on the real archive, and every item carries VARIED prose because identical bodies deduplicate in git
fallback: none needed for the repository half; the vault half has no fallback and was not run
verdict: holds
measured: "2026-08-26 — 424 items if every card were walked, median 2 per position, largest 23; the heaviest record on disc holds 95 files; at 1,292 files git add takes 1,535 ms and git commit 151 ms"
folds_to: raid-dec-work-is-a-file-while-open-and-one-folded-file-once-closed — the repository half is affordable and the fold answers the growth case
promote: "nothing for the repository. The vault half needs one run with the files present, and it needs the vault rather than a script"
chunk: none — no build step follows from this, and the missing half is a measurement rather than work
source_refs:
  - rank-unknowns, the seeded pick
  - scratchpad/spike-mint-cost-and-volume.mjs
  - scratchpad/probe-fold-at-real-size.mjs
---

## The volume, counted over the real cards

| figure | value |
| --- | --- |
| items if every card were walked | 424 |
| median per position | 2 |
| largest single position | 23 |
| heaviest record on disc today | 95 files |

A RECORD WALKS ONE MACHINE, NOT THE WHOLE TREE, so 424 is a ceiling nobody
reaches. The heaviest record standing today holds 95 files in total, work items
included in that count only once they exist.

## The repository half is answered

AT 1,292 FILES, `git add` TAKES 1,535 ms and `git commit` 151 ms. That figure
was taken for the fold and it bounds this question too, because a record's work
items are a fraction of 1,292.

SO THE REPOSITORY COPES AT THIS VOLUME. It is not the same as saying the figure
is comfortable.

THE SAME 1,535 ms IS READ THE OTHER WAY ELSEWHERE, and a cold review flagged the
two readings as a contradiction. They are not, once the questions are separated,
and writing them without separating the questions was the fault.

- THE FOLD QUESTION asks whether folding saves something a person notices.
  1,535 ms to 129 ms says yes.
- THIS QUESTION asks whether the repository can hold the files at all. 1,535 ms
  says yes, slowly.

BOTH ARE TRUE AND ONLY ONE OF THEM IS COMFORTABLE. The honest sentence is that
the repository is not a blocker and the fold is worth having anyway.

## The vault half was inflated into a blocker, and the owner corrected it

OWNER RULING, 2026-08-26: the main interface is VS Code. The vault is a
compatibility target, and it opens tens of thousands of files.

SO 424 IS NOT A QUESTION FOR IT. The assumption named two neighbours as though
both were load-bearing, and only one is.

THE VERDICT WAS `unsettled` FOR A DAY AND IS NOW `holds`. What changed is not a
measurement; it is the recognition that the missing measurement was never owed.

WHY THIS IS WORTH RECORDING RATHER THAN QUIETLY FIXING. Marking something
unsettled reads as rigour. It can also be a way of carrying a non-question
forward with a serious face on it, and that is what happened here.

THE HONEST RESIDUE: nobody has timed the vault at this volume, and nobody needs
to. If it ever matters it is one run, and it needs the vault open.
