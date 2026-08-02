# i1 walk preparation — cowork session, 2026-08-02

For the owner and the walking agent. i1 is SEEDED and further along than the
day felt: the worktree stands (.worktrees/i1-prove-a-bases-equivalent…), the
record carries goal, vision, five proofs and inputs, and se_pull (M1b)
shipped this morning. What remains before walking is small.

## The walk, mechanically

1. Enter the iterations machine. i1 stands as its kickoff state (the
   machine's states ARE the open iterations).
2. M0_10 onboard-retro → M0_90 gate-kickoff: retro drained, goal confirmed,
   the agent PROPOSES a rigor column, the owner BLESSES. Floor rows
   (kickoff, green verification, docs-match, accepted handover) are never
   struck at any size.
3. The bless compiles the blessed column from the live rigor matrix into a
   generated sub-machine; the walk continues inside it (M1 vision → M9
   ship, gates at every M*_90).

## Column suggestion for the bless (owner adjudicates)

i1 is a PROOF — risk retirement, not shipping. The natural shape: strike
toward `minor`/spike-heavy, keep M6 (rank-unknowns → run-spikes →
fold-back) at full — the five proofs ARE M6 spikes, risk first:
model-at-scale, expression language, control-writes-the-.base, live
updates, owner-drives-by-hand. Proof 5 doubles as validation evidence
(M8): "the owner drives it BY HAND in VS Code" is the story evidence.

## The by-hand check (what you said you want to verify)

Every mechanism the walk uses is a FILE the owner can produce or fix by
hand; per step: evidence lands in the record's frontmatter (edit it), the
bless is a mirror act (or edit the record), a stuck walk escapes via
se_pull escape or the mirror's emergency lane, the rigor cells are row
files, and every engine act cites a call ref you can open in the log. The
hand-check at each gate: open the file the engine claims it wrote; confirm
you could have written it yourself.

## De-risk artifacts in this folder (evidence infrastructure, not solutions)

- bases-expr-vectors.json — 110 vectors in 14 categories, derived from
  spec/bases-syntax.md: every vector an expression EXPECTED TRUE against a
  named fixture note (or a named error class), so the runner is ~20 lines.
  These are the red tests of the expression spike: all fail while the
  language does not exist; the parser+evaluator turns them green. The
  lambda vectors (filter/map/reduce with BOUND NAMES, not closures) and
  the refusal vectors (unknown function refuses BY NAME) encode the
  standing laws. One vector (string ordering) flags an owner decision.
- make-vault-fixture.mjs — deterministic synthetic vault (seeded PRNG):
  `node make-vault-fixture.mjs <dir> 30000` → 30k notes, nested folders,
  mixed frontmatter types, wikilinks, tags, two .base files including the
  hot-path filter. Same args, same vault: benchmark numbers become
  reproducible evidence. The three numbers proof 1 owes: model build time,
  memory, filter time 30k→dozens.

## Readiness gaps seen from outside (verify, then walk)

- The iterations machine end-to-end: seeded ✓, but the walk INTO the
  generated sub-machine has never been driven by a person. First session
  should walk M0 only and stop at the bless — short, and it proves the
  gate mechanics before any real work stands on them.
- The _incoming/lane-verbs.patch changes the agent's test economics
  mid-iteration if applied mid-walk. Apply it BEFORE the walk starts (or
  after the day's bucket lands), restart the se server, and let the walk
  begin with the new lane rather than switch under it.
