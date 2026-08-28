---
minted_in: i1
id: tsp-record-inspection
type: "[[test-spec]]"
statement: The records carry their provenance — purpose, reasoning, order, losers, sources and links — each readable from the file that owns it, verified by inspection of the stored records.
method: inspection
verifies:
  - req-purpose-recorded-at-begin
  - req-record-arrives-prefilled
  - req-recommendation-is-derived
  - req-routing-reasoning-recorded
  - req-losers-stay-on-record
  - req-divergence-order-on-record
  - req-finding-keeps-its-sources
  - req-finding-lands-as-reference
  - req-finding-names-its-home
  - req-story-links-its-proving-run
  - req-upward-links-live-in-the-file
  - req-test-run-carries-its-question
files:
  - deliverable/engine/bin/record-inspect.ts
---

## Scope

Static attributes of stored records and nodes, examined directly at the
gates that consume them. Each item retires into a lint when one grows
teeth; until then the inspection carries it.

## Approach

Inspection per record at its gate, and per corpus sweep at the retro.
One checklist item per claim, each with its pass criterion.

## THREE ITEMS NOW HAVE A RUNNER (i33 2026-08-17, item 13 added 2026-08-24)

`engine/bin/record-inspect.ts` answers items 11, 12 and 13, and it runs at the
boot's exit beside the sweep.

- ITEM 11 PASSES CLEAN across the whole corpus: every story, use case,
  requirement, function, element, interface, design spec and test spec carries
  its upward links in its own frontmatter, readable from the file alone.
- ITEM 12 FOUND A REAL DEFECT. Every recorded test run carried a job id and
  its results and NOT the question it answered - the question rode the call
  that started the run and was dropped by the record of it. Eight runs sat in
  the log unable to say what any of them was for. Fixed in engine/tools.ts the
  same day; runs before that date cannot carry one, so the check judges the
  LATEST run and counts the rest out loud.

THE OTHER TEN NEED ACTS NOBODY HAS PERFORMED RECENTLY - a begun product, a
seeded record, a desk recommendation, a divergence. They want those acts to
have happened, not a cleverer sweep.

HOW THE TWO WERE FOUND. i33's verification tester ran ONE of the twelve by
hand and took the no-runner argument as the verdict for the other eleven,
then said so itself: "I did not run them because the runner argument gave me a
defensible verdict without the work." Two of the eleven turned out mechanical.

### ITEM 13 — NO FIELD REPORT IS IN VERSION CONTROL

THE FIELD REPORT IS PRIVATE DATA (owner ruling 2026-08-21). It is written for
one person, it is not a corpus document, and it is delivered as a file that
person downloads.

WHERE IT MAY LIVE is `.se/`, which is gitignored. Anywhere else is a finding.

WHY IT BECAME A CHECK. The rule stands in the contract and twice in the
cloud-runner card, and two reports were committed anyway — 3,584 lines across
two records, which no guidance, machine or register entry ever cited. The owner
named the pattern directly: "I want field reports, but I want them as
downloadable files and not in Git, and some agents mess that up."

THE FINDING NAMES THE RIGHT HOME, not only the fault. An agent that put the
file in the wrong place needs to be told where it goes.

OBSERVED FAILING BEFORE IT FIRST PASSED, 2026-08-24: green on the clean tree,
RED with exit 1 on a report planted in a record's folder, green again once it
was removed.

## Checklist

- A begun product: the stated purpose carried in as one recorded
  statement.
- A seeded record: every field carrying a proposed value from the
  person's words.
- A desk recommendation: derived from the standing state, every Detail
  part present.
- Landed work: the recommendation, the choice and the reasoning on the
  record.
- A made choice: every unchosen option readable, each with its recorded
  reasoning.
- A divergence: the entry order of problem, options and choice recorded.
- A kept finding: its supporting sources linked in the reference corpus.
- A settled research question: the surviving finding standing as a
  reference node.
- A sweep finding: the drifted file named.
- A filled story: linked to the recorded run that proved it.
- Any trace node: its upward links in its own file, readable from the
  file alone.
- Any test run: recorded with the question and scope it answered.
