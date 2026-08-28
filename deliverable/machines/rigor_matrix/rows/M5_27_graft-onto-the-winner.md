---
kind: matrix-row
name: graft-onto-the-winner
statement: Take what each loser does better, try it on the winner one at a time, and re-score whatever moved.
state_kind: work
filled_by: agent
depends_on:
  - declare-winner
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
  - name: grafts
    template: table
    columns:
      - strength
      - from
      - verdict
      - why
    column_help:
      - what the loser does better, in one line
      - which candidate it comes from
      - adopted, rejected or incompatible
      - the reason, and for incompatible what taking it would cost the winner
    picks:
      from: $candidates
      verdict:
        - adopted
        - rejected
        - incompatible
    description: every axis a loser beat the winner on, and what became of it
    guidance: |
      ONE ROW PER AXIS A LOSER BEAT THE WINNER ON. The list is computed
      from the score table, so nothing is skipped by choosing what to
      look at. A loser that beat the winner nowhere contributes no rows,
      and that is a result.

      `incompatible` IS A REAL ANSWER AND THE MOST USEFUL ONE. It says the
      strength cannot be taken without giving up something the winner won
      on, and the `why` names what. That sentence is the trade the whole
      comparison was about, written down where a builder will find it.

      `rejected` IS DIFFERENT AND WANTS A HARDER REASON. It says the
      strength COULD be taken and should not be. Cost, complexity or
      scope are legal reasons; "the winner is fine" is not.

      A GRAFT CANNOT COST THE WINNER THE SEAT, and this state does not
      pretend otherwise. One that costs more
      than it buys is `incompatible` and never adopted, so the winner's
      scores only ever move up. The question of whether a RIVAL could
      overtake was already asked at [[reverse-sensitivity]], before the
      declaration, where it can still be acted on.

      SO WHAT THIS FIELD PROTECTS IS THE TRADE BEING VISIBLE. A graft
      that buys one axis by spending another is legal, and the `why` has
      to say so, because a builder reading this later needs the trade and
      not just the verdict.
  - name: rescored
    template: table
    columns:
      - axis
      - was
      - now
      - what_changed
    column_help:
      - which criterion moved
      - the winner's score before the graft
      - the winner's score after it
      - the graft that moved it, and who scored it
    picks:
      axis: $criterion_axes
      was:
        - "0"
        - "1"
        - "2"
        - "3"
        - "4"
        - "5"
      now:
        - "0"
        - "1"
        - "2"
        - "3"
        - "4"
        - "5"
    description: every axis whose score moved because of a graft, re-scored rather than assumed
    guidance: |
      THE RE-SCORE IS NOT A GUARD ON THE OUTCOME. The winner cannot lose
      here, and saying the re-score protects against that would be a
      justification that does not survive one question.

      IT IS A GUARD ON THE NUMBER. "We grafted it and now we score a 4"
      is a claim, made by the hand that did the grafting, and it travels
      into the build as if it were measured. That is precisely the claim
      the spawned-scorer rule exists to stop, arriving one state later.

      AND IT CATCHES THE ONE THING JUDGMENT CANNOT. A graft is adopted
      because it helps on the axis somebody was looking at. Nobody asked
      what it did to the axes they were not looking at. A second hand
      scoring the changed design finds that; the person who chose the
      graft never will.

      SO IT IS A SECOND HAND, exactly as at evaluate-set. Spawn a subagent
      with a clean context, give it the grafted winner and the axes that
      moved, and land what it returns.

      ONLY THE AXES THAT MOVED. Re-scoring everything invites a quiet
      re-run of the whole comparison, which this state is not.

      NO ROWS IS A LEGAL ANSWER. Every graft rejected or incompatible means
      nothing moved, and the table says `none`.
major: full
major_complexity: C3/R3
minor: none
patch: none
product: full
product_complexity: C3/R3
specification: full
major_note: |
  Applies in full: every axis a loser won gets asked, and every adopted
  graft is re-scored by a second hand before the architecture is recorded.
minor_note: |
  Does not apply. No candidate set, so no losers to learn from. STRIKE
  PROPOSAL - owner adjudicates.
patch_note: |
  Does not apply. Nothing was selected, so there is nothing to strengthen.
  STRIKE PROPOSAL - owner adjudicates.
product_note: |
  STANDING ARTIFACT: what the chosen architecture took from the ones it
  beat, and what it could not take without giving something up. The
  incompatible rows are the trade the decision rests on.
specification_note: |
  DOCUMENT FORM: rides the decisions chapter beside the declaration - the
  grafts as a short table, the incompatible rows as the named trade.
---

## Guidance

THE WINNER IS NOT THE BEST DESIGN. It is the best of the ones somebody
happened to compose, and every loser beat it somewhere or it would not have
been on the front.

THIS STATE ASKS THE OBVIOUS QUESTION NOBODY WAS ASKING. Can the winner take
that, and keep what it won on?

## Why it sits after the winner is declared and not before

YOU CANNOT IMPROVE A DESIGN BEFORE YOU KNOW WHICH ONE YOU ARE IMPROVING. Run
earlier and it is hybridising, which produces a new candidate that has to be
composed, scored and compared like any other. That is a bigger act and the
front is where it belongs.

RUN HERE, THE TARGET IS FIXED and each graft is a small yes or no against one
axis. The cost is that a graft can only strengthen the chosen shape; it cannot
find a shape nobody drew.

OWNER RULING 2026-08-19, placing it: "We declare the winner, then we graft
features onto it that make it better."

## Why the re-score is not optional, and what it is NOT for

IT IS NOT FOR PROTECTING THE OUTCOME. A graft only lands if it improves the
winner, so the winner's scores only move up and the seat cannot change hands
here. That was this state's first justification and it did not survive being
asked about.

THE RIVAL QUESTION IS ASKED EARLIER. [[reverse-sensitivity]] now grafts the
leader's strengths onto each rival and asks whether any overtakes, before the
winner is declared and while a flip is still a sentence rather than a reopen.

WHAT THE RE-SCORE IS ACTUALLY FOR, in two parts.

- THE NUMBER IS A CLAIM. The method spawns a clean context to score because the
  hand that composed a design scores it favourably. Grafting IS composing, and
  asserting the improved score is the same failure one state later.
- THE SIDE EFFECT IS INVISIBLE FROM HERE. A graft is adopted for what it does to
  the axis somebody was looking at. What it did to the other eleven is not a
  judgment anybody made, and only a re-score finds it.

SO AN ADOPTED GRAFT THAT MOVES A SCORE IS RE-SCORED by a second hand, on the
axes it touched and no others.

## What this state must not do

IT DOES NOT RE-OPEN THE CHOICE. If the work here shows a loser should have won,
that is a FINDING for the gate rather than a re-run, and it goes to follow_up
loudly. Quietly swapping the winner here would put a selection outside the
recorded convergence, which is the one thing the whole milestone is arranged to
prevent.

IT DOES NOT INVENT STRENGTHS. The rows come from the score table. A strength no
score records is an opinion.

## Its near relative, and the difference

[[record-adrs]] ALREADY RUNS A PRIOR-ART BACK-CHECK asking what the ORIGINAL
does better than what we chose. This is the same question asked of the LOSERS
instead of the ancestor.

BOTH EXIST because they find different things. The ancestor knows what a decade
of use taught it. The losers know what this problem's own alternatives buy, at
this size, under these criteria.

The method is [[meth-pugh-convergence]].
