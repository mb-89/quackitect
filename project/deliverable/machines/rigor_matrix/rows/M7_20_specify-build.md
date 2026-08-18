---
kind: matrix-row
name: specify-build
statement: "Specify the build: author the design specs below the architectural line, then seed the chunk machine that realizes them."
state_kind: work
filled_by: agent
depends_on:
  - author-tests
entry_read:
  - project/deliverable/machines/methods/meth-build-strategies.md
seeds: build-chunks
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_delete
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
evidence:
  - name: design_specs
    template: node-table
    of: design-spec
    items:
      - $design-specs
    columns:
      - realizes
      - files
    page_size: 25
    description: the design-spec register — one row per spec; the law checks element coverage and that every spec names its files
  - name: promotions
    template: node-table
    of: experiment
    items:
      - $promotions
    columns:
      - promote
      - chunk
    description: "every promoted spike, assigned: chunk names the step of the seeded drawing it enters as — the law refuses an unassigned promotion"
major: full
minor: full
patch: none
product: full
specification: tailored
major_note: |
  Applies in full: design specs authored for every element, the chunk
  machine seeded - chunks, dependency edges, realization kinds, promoted
  spikes placed.
minor_note: |
  Applies. The delta's design is specified and its build chunked: small
  resumable chunks, dependency edges, realization kind each, promoted
  spikes as pre-verified chunks. A minor is exactly the size where an
  unplanned build starts sprawling.
patch_note: |
  Does not apply. A patch is one chunk by definition; no chunk machine is
  seeded. STRIKE PROPOSAL - owner adjudicates.

  ESCALATE: a fix that wants a build plan is not one chunk, and not a
  patch.
product_note: |
  Standing obligation: every build the product ever ran left its design
  specs and its chunk record - the design and the build history are
  reconstructable from the records, not from memory.
specification_note: |
  DOCUMENT FORM: the design-spec nodes in the trace, and the chunk
  drawing in the iteration record. The detailed-design chapter derives
  from the specs; the book does not teach build plans.
---

## Guidance

TWO ACTS, one state: say HOW it is designed, then say WHAT is built in
which order.

FIRST THE DESIGN SPECS ([[design-spec]]): one node per design concern
below the architectural line, minted from the item template into
project/spec/trace/design-spec/. The spec carries the trace edge —
`realizes:` names the element ids — and `files:` names the code it
lands in, planned names included.

The law at submit:

- every element is realized by at least one spec
- every spec's edges resolve
- every spec names files

File existence and the dead-code sweep get their teeth at trace-design,
after the build.

A LINK IS A CONTRIBUTION. A spec names an element only when its design
actually serves it. Do not file code somewhere to look covered — an
unclaimed file at trace-design is a finding to discuss, not to bury.

THEN THE CHUNK MACHINE, seeded NOW. Only now is it known what will be
built. The plan carries:

- small resumable chunks
- dependency edges, parallel where independent, so chunks fan out to
  sub-agents
- iteration-unique ids
- one `realization: <kind>` per chunk

The guidance registry serves each builder its discipline's guidance and
checks ([[meth-realization-guidance]]).

A PROMOTED SPIKE ENTERS AS A PRE-VERIFIED STARTING CHUNK — and it is
ASSIGNED, on the experiment node's `chunk:`, to the step it enters as.
The promotions table above shows every promotion; the law refuses one
left unassigned, so nothing promoted is lost.

A monolithic build is lost on interruption. Small chunks make progress
durable.

The strategies inform the order, several at once
([[meth-build-strategies]]). Nothing enforces a pick; the plan records
which lenses shaped it.
