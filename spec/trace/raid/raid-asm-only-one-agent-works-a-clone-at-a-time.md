---
unreachable_citations:
  - satellite.ts
  - supervisor.ts
minted_in: i34-one-tree-iterations-and-archives-live-on
id: raid-asm-only-one-agent-works-a-clone-at-a-time
type: "[[raid]]"
kind: assumption
statement: Only one agent works a given clone at a time, so one working tree is enough and two agents never need separate trees on one machine.
owner: the owner
trigger: "the first time two agents WRITE to the same checkout by different paths, or the first time a background worker needs its own tree. A second READER no longer fires it, and neither does a second writer going through the one lane: both have been exercised and both held."
status: open
impact: If two agents share one clone, they overwrite each other's uncommitted work with nothing to detect it. The dirty-tree signal is the only guard and it is not a lock.
breaks_how_badly: crippling
how_likely: conceivable
probe: "HOLDS, both halves probed 2026-08-16. THE INTENT HALF: the owner's own words that two agents run on two clones, never on two worktrees of one. THE CODE HALF: a search of satellite.ts, supervisor.ts, core.ts and channel.ts for a spawn, a fork or a cwd naming a worktree returns five hits and none of them starts a worker in its own tree. satellite.ts takes an injected GitRun(args, cwd) over the git lane's allowlist rather than spawning anything itself. So nothing in the engine today needs a second tree on one machine. WHAT WOULD FALSIFY IT LATER: a background worker that builds or tests while the main walk edits, which i27's satellite design is the shape of."
probed: 2026-08-24
source_refs:
  - req-every-record-path-resolves-in-one-tree
  - raid-dec-one-tree-beats-a-record-travelling-between-machines
  - i34-one-tree-iterations-and-archives-live-on
weighs_with: none
weighs_against: none
---

## Probe

ASK THE OWNER, because this one is about intent rather than about the code.
The question is not whether parallel agents are possible; it is whether they
are wanted on ONE machine.

THEIR ANSWER SO FAR, 2026-08-16, and it is why this is conceivable rather than
plausible: "I can't run two agents in parallel on different worktrees. It
doesn't happen. It's just two agents on two different clones."

WHAT WOULD FALSIFY IT, in order of how likely each is to arrive:

- A BACKGROUND WORKER that needs to build or test while the main walk edits.
  i27's satellite design is exactly this shape, and it is already on the
  record.
- A SECOND AGENT invited onto the same checkout to parallelise one iteration.
- A TOOL that shells out and changes directory, which is a second worker in
  everything but name.

THE CHECK THAT COSTS NOTHING: grep the engine for anything that spawns a
process expecting its own tree. `satellite.ts` and `supervisor.ts` are the two
to open, and both exist today.

## THE TRIGGER FIRED, 2026-08-20, IN A BOUNDED FORM — AND IT HELD

THE TRIGGER READS "the first time two agents are asked to work the same
checkout". On i38's walk that happened four times: three reviewing agents and
one researcher ran against the same clone while the walking agent was writing
to it.

IT HELD, AND THE REASON MATTERS MORE THAN THE RESULT. Every one of them was
READ-ONLY by instruction — told in as many words not to write, not to edit and
not to call git — so no two writers ever met. The assumption's actual hazard,
two agents overwriting each other's uncommitted work, was never exercised.

SO THIS IS EVIDENCE FOR THE WEAKER CLAIM ONLY: concurrent READERS beside one
writer on a single tree cost nothing and need no second worktree. It says
nothing about two writers, which remains the case that would falsify it.

WHAT IT DOES SHARPEN: the trigger as written fires on "two agents asked to work
the same checkout", and that now happens routinely — a reviewer at a gate is
the roster's own design. The trigger should distinguish a second READER from a
second WRITER, or it will keep firing on the safe case and stop being read.

WHY IT IS RECORDED RATHER THAN ASSUMED SILENTLY. i34 removes the only
mechanism that made two trees possible. If this turns out false later, the way
back is two clones — never worktrees again — and that path is written on
raid-dec-one-tree-beats-a-record-travelling-between-machines.

## THE TRIGGER FIRED AGAIN, 2026-08-24 — AND THIS TIME IN THE WRITER FORM

WHAT THE ENTRY SAID WAS MISSING, in its own words: the hazard of two agents
overwriting each other's uncommitted work was never exercised, because every
second agent so far had been read-only by instruction.

THAT GAP IS NOW CLOSED, AND IT HELD. On i62's walk a second agent was spawned
with no read-only instruction, on the same checkout, while the first still held
the record. It filled and submitted an evidence form. Two writers, one tree.

NOTHING COLLIDED, AND LUCK IS NOT THE REASON. Both agents wrote through one
lane served by one engine process, so their writes were serialised by the
thing serving them rather than by care on either side.

SO THE EVIDENCE IS STRONGER THAN BEFORE AND NARROWER THAN IT LOOKS. Two writers
on one tree are safe WHILE both go through one engine. Two writers that reach
the tree by any other path are still unexercised, and that is where the
assumption's hazard actually lives.

WHAT THIS TIES TO. The serialisation depends on there being exactly one engine
on the folder, which is `req-one-instance-holds-a-folder-and-its-port`. That
row was written as a logging concern; this probe shows it is also what keeps
this assumption true.

THE SHARPENING FROM 2026-08-20 STILL STANDS AND IS NOW OVERDUE. The trigger
fires on any second agent and should distinguish a second reader from a second
writer. It has now fired three times on the safe case and once on the real one.
