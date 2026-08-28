---
id: i38-the-machine-sizes-its-own-driver-every-s
status: shipped
closed: 2026-08-21T00:19:18.909Z
started: 2026-08-20T09:13:33.214Z
opened: 2026-08-20T07:17:57.705Z
goal: "The machine sizes its own driver: every state says how hard it is, one fixed list says which model that needs, and the lane records which model actually answered."
vision: A walk that costs what its work costs. Today one model of one strength walks all 52 states, from transcribing a decision already made to framing an architecture, and nothing in the record says which model did either. This iteration gives every state a complexity value, maps those values to model names in ONE list identical on every host, opens each milestone by naming the driver it needs, and stamps the answering model onto every call so a walk can be attributed after the fact.
inputs: null
depends_on: []
---

# i38-the-machine-sizes-its-own-driver-every-s

## Goal

The machine sizes its own driver: every state says how hard it is, one fixed list says which model that needs, and the lane records which model actually answered.

## Rough vision

A walk that costs what its work costs. Today one model of one strength walks all 52 states, from transcribing a decision already made to framing an architecture, and nothing in the record says which model did either. This iteration gives every state a complexity value, maps those values to model names in ONE list identical on every host, opens each milestone by naming the driver it needs, and stamps the answering model onto every call so a walk can be attributed after the fact.

# Design input — what the discussion settled

THESE ARE OWNER RULINGS, NOT SUGGESTIONS. They were captured as notes
during the discussion that seeded this record, and written in here because
`.se/` is machine-local and never committed — a reference to a note cannot
resolve on any other clone, so the substance travels or nothing does.

## i38: the cast is a guide, a walker, reviewers and researchers

OWNER RULING 2026-08-20, settling the multi-agent roster for i37.

TWO AGENTS ARE ALWAYS PRESENT. A GUIDE, which never pulls and never holds a
position in the machine — it answers, reviews and watches the trail. A WALKER,
which is the only role that calls se_pull.

TWO MORE ARE SPAWNED WHERE THEY EARN IT. A REVIEWER, at gates where a review
makes sense, reading the artifacts with no shared context. A RESEARCHER, where
the work asks for deep research on the internet.

THAT IS THE WHOLE CAST. Nothing else spawns.

WHY THE REVIEWER IS SEPARATE RATHER THAN THE GUIDE WEARING A SECOND HAT: the
contract already forbids judging text you wrote yourself in the same pass, and
on the i15 walk that rule was broken at gate-kickoff — four of five fields
authored and blessed by the same agent. A reviewer with no shared context
cannot break it by accident.

## i38: fan-out is bounded, and a submachine takes the max of its items

OWNER RULING 2026-08-20, correcting an earlier reading that fan-out
should be dropped.

IT IS NOT DROPPED. It is bounded. The measured reason: Anthropic's own
multi-agent research system reported about fifteen times the tokens of a
single-agent chat for its parallel setup. That is a reason to be conservative,
not a reason to refuse.

SO A PARALLEL STATE IS NOT AN INVITATION. Ten parallel states do not mean ten
agents. The machine must never spawn a fleet merely because the drawing fans
out.

A SUBMACHINE TAKES THE MAXIMUM COMPLEXITY OVER ITS ITEMS, and one walker
strong enough for the hardest item walks all of them. That holds for
build-steps over its chunks, run-spikes over its spikes, and every other
submachine.

THE PER-ITEM VALUES STILL EARN THEIR KEEP. They are the input to that maximum,
and they record which items are hard for whoever reads the chunk file later.

## i38: the engine names the driver and never spawns it

FOUND BY SEARCHING THE ENGINE, 2026-08-20: there is no agent-spawning
code anywhere in it. The i15 walker/guide arrangement lived entirely in the
harness — the harness spawned, and the walker reached the lane over HTTP.

TEACHING THE ENGINE TO SPAWN WOULD NEED A PER-HARNESS ADAPTER, which is
precisely the per-host difference the owner ruled out, in the worst possible
place: the mechanism itself.

SO THE MACHINE DECIDES AND SAYS; SOMETHING OUTSIDE DOES. The milestone's
setup state computes the tier and names the model, the pull carries it, and
whoever is driving performs the spawn.

THIS IS THE LANE'S EXISTING GRAIN. It does not push, does not open records
unasked, and does not reach the screen. Starting a process is that same class
of act.

## i38: the complexity value is read live and never pinned into demands

A HAZARD FOUND BEFORE BUILDING, 2026-08-20. It would not have shown up
until an already-seeded iteration was next walked.

THE RIGOR MATRIX HASH IS TAKEN OVER THE RAW BYTES of every row file. Adding a
complexity key to all 52 rows changes that hash for every already-seeded
record.

THAT ALONE IS HARMLESS. iterationDrift then compares DEMANDS, finds nothing
moved, and the pin quietly catches up.

BUT IF COMPLEXITY IS PINNED INTO seeded.json's demands, every demand moves at
once, and every standing claim in every open iteration reopens. That is the
28-claim cascade of the i15 walk, at fifty-two times the scale.

SO IT IS READ LIVE FROM THE MATRIX. It is a hint about who drives, never a
claim anything rests on, so nothing needs it frozen.

ONE MORE THING THE CHECK TURNED UP: tests/rigor-matrix.test.ts hard-codes 52
rows. Adding states turns it red, which is correct — the count should not
change by accident.

## i38: the model list is fixed, and its answer is a recommendation

OWNER RULING 2026-08-20, after weighing host-by-host resolution and
rejecting it.

ONE FIXED LIST LIVES IN THE REPO and is identical on every host. No per-host
roster, no runtime discovery, and nobody is asked at setup which models a box
can reach. Models do not change that often; the owner maintains the list by
hand, one sitting at a time.

WHY NOT RESOLVE PER HOST: a system that behaves differently on one machine
than another is the thing being avoided. That outweighs the maintenance saved.

THE ANSWER IS A RECOMMENDATION, NOT AN ORDER, in the same sense the change
size at gate-kickoff is a proposal and never a decision. Judgment stays with
the agent.

ONE ASYMMETRY MAKES THAT SAFE. Asking for a STRONGER model than recommended
needs no argument. Asking for a WEAKER one needs a reason, recorded on the
form. Without it a cheap model can talk itself into staying cheap, which is
the failure the whole design exists to stop.

## i38: the complexity ladder is five rungs, and it is not the autonomy dial

SETTLED 2026-08-20, and recorded here because nothing in the repo carries
it — it existed only in a chat artifact a walking agent cannot read.

TWO AXES, AND A GRID WAS CONSIDERED AND DROPPED. The owner's first shape was a
matrix: autonomy levels as columns, complexity as rows, a model tier per cell.
It was dropped because the cell adds nothing the row and column do not already
say.

AUTONOMY ANSWERS HOW EXPENSIVE A WRONG ANSWER IS. Its real output is not a
model at all: above the dial the walk stops and waits for the person. Below it,
the question of WHICH model is complexity's.

SO THE TWO DRIVE DIFFERENT THINGS. Complexity picks the HANDS — how strong the
walker is. Autonomy picks the EYES — whether a reviewer reads the result.
Stakes want a second reader, not stronger hands, and a reviewer is cheaper
because it reads one artifact rather than carrying the whole context.

DO NOT BUILD THE GRID. Two independent lookups, and a combination that cannot
occur simply never arises rather than needing a cell marked not-applicable.

THE FIVE RUNGS, lowest first:

C0 DERIVE. No agent act at all. The engine computes the answer and writes it.
The state is walked through, not filled. Its cost is nothing and it deletes a
way of being wrong.

C1 TRANSCRIBE OR RULE. The answer already exists somewhere, or the engine drew
it. The agent moves it, accepts it, rejects it, or picks among what was drawn.
Nothing is authored.

C2 APPLY. A named method runs over named inputs. The method decides; the agent
executes it faithfully. Failures are procedural and a checker can usually see
them.

C3 AUTHOR. The agent produces content that did not exist. Correctness is judged
by a reader, not by a check, so a plausible wrong answer passes every
automated gate.

C4 FRAME. The agent must find the right frame rather than fill a given one.
Wrong answers here are plausible, expensive, and they propagate into every
state below.

WHAT THE RATINGS THEMSELVES ARE: this iteration's own work, not seed input.
They belong in states with evidence behind them, never pasted in from a
discussion.

## i38: 23 of 86 evidence fields are already engine-drawn, which is why C0 exists

MEASURED 2026-08-20 by sweeping every evidence declaration in
machines/rigor_matrix/rows. Recorded so the next reader does not re-derive it,
and because it is the evidence C0 rests on.

TWENTY-THREE OF EIGHTY-SIX FIELDS TAKE THEIR ANSWER FROM SOMEWHERE THE ENGINE
CAN REACH — a field declaring reads, writes, picks, or items from a live
source. The Pugh matrix, the flip conditions, the clustered design structure
matrix, the Pareto front, every checklist over a live source.

THE SPLIT RUNS DOWN THE MIDDLE OF THE WALK. M0 through M3 — motivation, inputs,
requirements — have ONE drawn field between them. M4 onward is mostly drawn.
That is coherent rather than accidental: the front half is authorship and the
back half is method.

ONE STATE IN FIFTY-TWO DECLARES filled_by: engine, and that is verification.
Everywhere else the engine's work happens inside an agent-filled state with
nothing declaring it. observe-red's own row says the engine observes the test
reds itself, in prose, in a row marked filled_by: agent.

WHERE C0 IS AVAILABLE AND NOT TAKEN, as candidates rather than decisions:

- package, with none of its three fields drawn. The package path is what the
  build produces and the emit-back list is a diff between two trees; only the
  third is a ruling. M9 is the one late milestone with no drawn field at all,
  doing the most mechanical work in the machine.
- record-adrs. The decisions are already on the record, so scaffolding a stub
  per decision is a lookup and only the consequences paragraph is authored.
- decompose-structure. dsm.ts already exports a function deriving the edge set
  from the functions' own declared inputs and outputs, and derive-functions
  produces exactly those functions.
- Six of the ten gates draw nothing. Two already draw their checklists from
  what was minted, and whether each owed artifact exists is a lookup.

AUTOMATION HERE IS A CORRECTNESS MOVE BEFORE IT IS A COST MOVE.
probe-assumptions, reverse-sensitivity and run-demos can all accept a
DESCRIPTION of the work in the field that asked for its RESULT. Two are drawn
and that failure is gone, because an engine cannot describe a computation
instead of running it. run-demos is not drawn, and on the i15 walk it was the
state that had to be watched.

ONE DISTINCTION THAT MUST SURVIVE. A drawn field does not mean drawn work.
author-tests has a fully drawn field and is still the hardest state in the
build milestone — the tests are written in test files and the table only
registers them. The act marker describes what the FORM costs, never what the
STATE costs.
