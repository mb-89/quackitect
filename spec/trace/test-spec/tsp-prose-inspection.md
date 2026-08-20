---
minted_in: i1
id: tsp-prose-inspection
type: "[[test-spec]]"
statement: The published prose holds its laws — plain entry documents, roles over names, claims backed by kept sources — verified by inspection of the artifacts.
method: inspection
verifies:
  - req-entry-speaks-plainly
  - req-tour-speaks-plainly
  - req-roles-never-usernames
  - req-no-claim-without-evidence
  - req-vendor-page-claim-only
  - req-comparison-carries-both-sides
  - req-one-note-per-settled-point
  - req-desk-offers-a-tour
files:
  - deliverable/engine/bin/prose-inspect.ts
---

## Scope

Static attributes of published text, examined directly. Some items are
partly mechanical already (the voice lint, the terms lint); the
inspection covers what those lints cannot see, and retires item by item
as lints grow teeth.

## THREE ITEMS NOW HAVE A RUNNER (i33, 2026-08-17)

`engine/bin/prose-inspect.ts` answers items 1, 3 and 8, and it runs at the
boot's exit beside the sweep. Items 2, 4, 5, 6 and 7 stay hand-judged, and
the command says so on every run rather than letting a pass read as full
coverage.

WHY IT WAS WORTH BUILDING RATHER THAN MARKING OWED AGAIN. This spec had no
runner since i28. In that time four factual errors accumulated in the README,
which item 1 exists to catch: an instruction the engine never emitted, a tool
count off by 23, a deleted mechanism described as current, and seven bare
method terms. i33's tester found them by reading. The command finds them now.

THE FIRST RUN PRODUCED 97 FALSE POSITIVES, and that is recorded because it is
the more useful half. The git user here is the same word as the product, so
every mention of the product read as a leaked username. The command now skips
a colliding needle and PRINTS THE BLIND SPOT every run. A check that cannot
tell two things apart must say so rather than answer confidently.

ITEM 3 IS THEREFORE PARTIAL. The email, the home directory and the machine
name are checked. The user name cannot be, by any text search, while it
remains the product's own word.

## Approach

Inspection over the standing corpus at each gate: entry documents, tour
text, stored records, research notes. One checklist item per claim, each
with its pass criterion.

## Checklist

- Entry documents: zero bare method terms; every present term linked to
  its definition.
- Tour text: a method term only where its definition is one interaction
  away.
- Stored records: every acting party a role from the fixed vocabulary;
  zero usernames or hostnames.
- Recorded answers: no claim the kept sources do not support.
- Research records: a vendor-page source marked as a claimed feature,
  never a quality judgment.
- Comparative claims: evidence on both sides, or the named reason the
  comparison was not made.
- Live discussions: one consolidated note per settled point, none per
  exchange.
- The desk's offer list: a tour listed among the offers.
