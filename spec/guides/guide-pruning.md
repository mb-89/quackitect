---
id: guide-pruning
type: guide
audience: project-owner
statement: How to prune the spec, the code, and the logs again. The reusable method.
---

# Pruning - the reusable method

Iterations grow weight: requirement sprawl, stale prose, dead metrics,
heavy logs, unlinted code. Pruning is an iteration KIND - run it lean, light on
features, agent-solo until the owner's docs round. This guide is the recipe.

## The laws that keep pruning safe

- **Zero lost ledger truth.** The ledger never compacts; recorded hashes never
  move; deletions leave tombstones; git history is the archive for everything
  removed outright.
- **Determinized migrations, never hand edits.** Every bulk change is a quack
  command run per judgment call (`cluster`, `cluster --tests`, `compact`) -
  the tool is mechanical, the GROUPING is authored.
- **One re-baseline, one wave bless** per migration - and the wave bless must
  target the migration's suspects, never sweep open gates (an unadjudicated
  killer swept by `bless --all` is a falsified adjudication; the wave filter
  refuses OPEN gates).

## Clustering the trace (data)

- Requirements cluster where concerns belong tightly together: `quack cluster
  --into <id> --statement "<umbrella>" <members...>` - umbrella statement,
  NUMBERED singular statements in the body (each tagged *(was req-x)*),
  sub-addresses (req-x.2) stay targetable by edges and code markers.
- Tests cluster by shared requirement: `quack cluster --tests` - one node runs
  several selftests (all must pass); merged SHIPPED tests get the birth-red
  exemption (their red records stand under the origin ids). The grouping rule
  is RE-VERIFICATION ECONOMICS: split where an invalidation would force
  unrelated rework; cluster where the case is cheap to rerun whole.
- Designs do NOT data-merge: a region is a coherent code span; their weight is
  render-side. Skip tests carrying exemption markers (citations cannot survive
  a merge) and never merge across iterations or against semantic pull.
- After the migration: check for stale ID references in selftests and fixtures
  (the battery finds them), and remember the three listers (coverage rule,
  hole lister, delta lister) must all fold sub-addresses.

## Folding the renders (display)

Render-only, data untouched, all pre-baked static DOM: regular fans collapse
to one box (external edges at the boundary); themes cluster by file; iterations
older than the last five fold behind a click.

## Compacting the working set

- `quack compact <iteration>`: a shipped iteration's files merge into
  archive.md (verbatim payloads, byte-exact round trip, hashes preserved -
  the selftest proves it on a fixture). Evidence docs stay beside the archive.
- Logs, gather caches, and spike homes delete freely - no hashes bind them.
- Field results (the first real run): eleven iterations, 699 files -> 78,
  golden root byte-identical through probe and batch. The run order that made
  it safe: build clean, PROBE one iteration, full battery, batch the rest, full
  battery, `quack build` re-baseline must land on the SAME root. Keep the last
  five shipped iterations uncompacted (they match the report's age fold).
- Two seams the first run exposed (both fixed, battery-covered - re-check them
  if the loader changes): the strict referee must index ARCHIVED ids too, or
  live lanes referencing compacted nodes read dangling; and archived
  iteration.md entries must stay OUT of the id universe (mirroring the
  plain-file walk), or every archive collides on the id `iteration`.

## Pruning prose and rules

- The retired-vocabulary lint runs on every `quack lint`; its rule-set is
  CONFIG (`method/config/retired-vocabulary.json`) - retiring a term is a
  config edit plus fixing the findings. Add terms whenever a mechanism dies.
- Rules that are data live in config (weasel words, facets); shapes live in
  the template files (mint skeletons); logic stays code.

## Pruning code

- The build refuses static-analysis findings (gofmt, vet, grab-if-present
  staticcheck) - format debt cannot re-accumulate.
- Dead features delete outright with a veto decision recording both
  testimonies (was it ever consulted?) and a TOMBSTONE design region marking
  where the code lived - a removal's design is its tombstone, which also
  satisfies designs-realized.

## When to run one

When the working set outgrows review-ability: requirement count beyond what a
human weighs, graphs unreadable before folding, prose naming dead mechanisms.
Frame it with a baseline number and a target so success is checkable, and put
the owner's docs round at the END as the killer gate.
