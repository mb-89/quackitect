---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: raid-dec-a-seed-states-its-dependency-or-refuses
type: "[[raid]]"
kind: decision
statement: depends_on is REQUIRED on a seed. Omitting it refuses, and an iteration with nothing to wait for states that as an empty list.
owner: the owner
trigger: any change to the seed verbs, or the first seed that states an empty list where a real wait existed
status: decided
impact: The container is a DAG and this key is its only input. An unset key is a missing EDGE, not a missing note, so two agents can be handed work that fights over the same files.
breaks_how_badly: crippling
how_likely: expected
weighs_with: none
weighs_against: none
source_refs:
  - spec/iterations/i6-conformance-goes-mechanical-checks-bind-/record.md
  - raid-dec-a-check-refuses-a-wrong-write-and-reports-a-wrong-corpus
  - owner ruling 2026-08-13, at i6's seeding
  - i6 draft-vision — conflict 4, required wins
---

## The two answers that look identical today

A seed with no `depends_on` can mean either of two things, and on disk
they are the same absence.

- I FORGOT.
- I DECIDED NONE.

Only one of those is a decision. Today neither is expressible, which is
the whole defect.

## Why a refusal rather than more guidance

THE GUIDANCE ALREADY EXISTED AND DID NOT HOLD. The seed tool's own
argument description states the rule exactly, in the argument list,
where it cannot be missed.

It was read, and the key was still missed on three records.

A RULE BROKEN THAT WAY WANTS A REFUSAL, and that sentence is this
iteration's whole thesis. This entry is the thesis applied to its own
first case.

## What it cost to get wrong, measured

MEASURED 2026-08-13. Twenty-seven iterations had been seeded and the key
was set on seven.

THREE STATED A WAIT IN THEIR OWN VISION PROSE AND CARRIED NO EDGE FOR
IT.

- The UI sitting, after the panel round.
- The comment system, after the machine format.
- The cloud iteration, after the lane binding.

Each of those is a wait a person wrote down and the machine cannot see.

## Why not scan the prose instead

THE OWNER CHOSE THIS SHAPE DELIBERATELY over scanning the vision for
wait-words. A scan guesses at prose. A required key cannot.

## One line of guidance still rides along

A PERSON SEEDS ITERATIONS TOO, and a person does not read a tool schema.

One line, beside the refusal that enforces it: the dependency is the
container's DAG, and it is the only thing stopping two agents racing the
same files.

## Trigger

Any change to the seed verbs.

And the first seed that states an empty list where a real wait existed.
That is the observation that says the key made the silence expressible
without making it honest.

## Rejected options

### Leave it optional and say it louder

THE STATUS QUO, IMPROVED. The rule already stands in the seed tool's
argument description. Move it up, capitalise it, repeat it in the state
guidance.

REJECTED on evidence rather than on principle. It was already in the
argument list, unmissable, and the key was still missed on three
records out of the twenty-seven seeded. More of what did not work is not
a plan.

### Scan the vision prose for wait-words

DERIVE THE EDGE instead of demanding it. The three records that carried
a real wait said so in their own prose — "WAITS ON i18" is right there
in the text.

REJECTED by the owner, 2026-08-13, and the reason generalises: a scan
guesses at prose. It would find the three that said it plainly and miss
every wait phrased any other way, while reading as complete.

WORSE, IT CANNOT TELL THE TWO ANSWERS APART EITHER. Prose with no
wait-word is silence, exactly like an unset key.

### Default it to the previous iteration

A SENSIBLE-LOOKING GUESS. Most iterations do follow the last one, so
seed the edge from the container's tail.

REJECTED because a wrong edge is worse than a missing one. A missing
edge is visible as a gap; a plausible wrong edge is invisible and
orders work incorrectly.

### Ask at the gate instead of at the seed

MOVE THE DEMAND to gate-kickoff, where a person is already reading.

REJECTED because the edge is what makes the container a DAG, and the
container is read before the gate. A record with no edge is already
mis-ordered by the time anybody reaches its kickoff.

## Consequences

WHAT THIS BINDS FROM NOW ON.

- `se_seed_iteration` AND `se_seed_expedition` REFUSE without
  `depends_on`. The refusal is typed and carries the remedy, like every
  other.
- AN EMPTY LIST IS LEGAL AND IS A STATED DECISION. It means I decided
  none, and it is no longer the same bytes as I forgot.
- A PERSON SEEDING GETS ONE LINE OF GUIDANCE beside the refusal, because
  a person does not read a tool schema. It says the dependency is the
  container's DAG and the only thing stopping two agents racing the same
  files.
- THE TWENTY EXISTING RECORDS WITH AN UNSET KEY ARE NOT BACKFILLED BY
  THIS. Backfilling would guess, which is the option rejected above. They
  stay unset and readable as unset.

WHAT IT COSTS. One more required argument on the two seed verbs, and a
moment's thought per seed. That is the whole price.
