---
kind: matrix-row
name: reverse-sensitivity
statement: "Reverse the sensitivity: find the first plausible world where the winner loses."
state_kind: work
filled_by: agent
depends_on:
  - converge-pugh
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
evidence:
  - name: sensitivity
    template: sensitivity
    reads: evaluate-set#scores
    description: the computed flip conditions — a credible ruling is a click, and the save mints its RAID tripwire
  - name: reverse_graft
    template: findings
    description: every strength the leader holds, tried on each rival, and whether any of them overtakes
    guidance: |
      THE WEIGHT HUNT PERTURBS THE CRITERIA. This one perturbs the
      CANDIDATES, and it is the same question asked the other way: if a
      rival could take what the leader does better, does it win?

      ONE LINE PER STRENGTH THE LEADER HOLDS. The list comes from the
      score table, so nothing is skipped by choosing what to look at.
      For each, say which rivals could take it and what happens to the
      order if they do.

      A RIVAL THAT OVERTAKES IS A CREDIBLE FLIP, and it is ruled here
      like any other, with its RAID tripwire.

      IT RUNS BEFORE THE WINNER IS DECLARED ON PURPOSE (owner ruling
      2026-08-19). Finding out afterwards that a loser could have won is
      a reopen; finding out here is a sentence in this field.

      `none` IS A COMMON AND HONEST ANSWER. A strength no rival can take
      is exactly what a robust choice looks like.
major: full
minor: none
patch: none
product: full
specification: tailored
major_note: |
  Applies in full: perturb the weights, hunt the losing world, credible
  flips become RAID tripwires with fallbacks. The one state that keeps a
  major honest about its own decision.
minor_note: |
  Does not apply. No new architecture decision to stress. STRIKE
  PROPOSAL - owner adjudicates.
patch_note: |
  Does not apply. No decision was taken, so none can flip. STRIKE
  PROPOSAL - owner adjudicates.
product_note: |
  STANDING ARTIFACT: the sensitivity verdict and its tripwires, living in
  RAID. At rest the tripwires are WATCHED: a flip condition that has come
  true and gone unnoticed is this cell failing.
specification_note: |
  DOCUMENT FORM: a sensitivity annex on the deciding ADR - verdict, flip
  conditions, tripwires with their RAID links.
---

## Guidance

Per [[meth-pugh-convergence]]: the perturbation hunt is engine-computed and
the card draws it — per rival, the deficit and the one-point swing cells,
tabled only where three swings or fewer would flip the seat.

## The reverse graft, and why it lives here rather than after the choice

THE PERTURBATION HUNT ASKS WHETHER MOVING THE WEIGHTS FLIPS THE SEAT. There is
a second way to flip it that weights cannot reach: give a rival something the
leader has.

OWNER RULING 2026-08-19: "If we graft something into the others, does somebody
suddenly win?"

WHY BEFORE THE DECLARATION AND NOT AFTER. [[graft-onto-the-winner]] runs after
the winner is fixed and can only strengthen it. Asking the same question of the
rivals AFTER a winner is declared would mean discovering the choice was wrong
one state too late, and unwinding it is a reopen. Asked here it is a sentence.

WHAT MAKES A GRAFT CREDIBLE IS THE SAME TEST AS ANY OTHER FLIP. A rival that
could take the leader's strength without giving up its own is a real world. One
that could take it only by abandoning what put it on the front is not, and the
line says which.

THE RULING IS A CLICK (owner ruling 2026-08-10). Marking a cell credible and
saving mints its RAID tripwire ([[meth-raid]]) with the fallback in its body;
the ruling line keeps the minted ref. An unmarked cell stands visibly
unruled on a card that redraws from the scores — nothing is dismissed in
silence, because nothing disappears.
