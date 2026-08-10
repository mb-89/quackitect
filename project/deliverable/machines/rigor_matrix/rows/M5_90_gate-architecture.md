---
kind: matrix-row
name: gate-architecture
statement: "GATE architecture: the matrix review - the owner adjudicates the decomposition itself."
state_kind: gate
busbar: true
filled_by: agent
depends_on:
  - record-adrs
  - evaluate-architecture
legal_tools:
  - se_file_read
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
evidence:
  - name: choice_traced
    description: the winner traced to the weighted criteria; both Pugh runs recorded where status-quo was used
  - name: sensitivity_ruled
    description: the verdict with tripwires in RAID
  - name: matrix_review
    description: every baseline matrix reviewed, none skipped
  - name: evaluation_recorded
    description: every quality scenario addressed or flagged
  - name: adrs_traced
    description: every deciding ADR addresses its requirement
major: full
minor: tailored
patch: none
product: full
specification: tailored
major_note: |
  Applies in full - the gate a major exists to pass. The matrix review is
  the killer. The decomposition and the clustering are reviewed, and so are the allocation and the interfaces. Reviewed
  as data. M7 builds inside this baseline; a new element found mid-build
  returns HERE.
minor_note: |
  Tailored to ONE question: the new allocations reviewed - the delta's
  functions land in the right existing elements, and nothing else moved.
  A light look, and the tripwire's second net: the reviewer who sees a
  new element or interface in the diff sends the work to major through
  this gate's full form.
patch_note: |
  Does not apply - AND THIS IS THE TRIPWIRE CELL. The build half of the
  patch must stay inside the allocated elements. A patch that needs a new
  element, a new interface, or a moved allocation has outgrown its column:
  STOP, escalate to major, and this gate returns with the escalation.
  Never silently. STRIKE PROPOSAL - owner adjudicates.
product_note: |
  The bless of the standing baseline. Its obligation at rest: the
  baseline stays the reviewed one - every element in the code was
  sanctioned through this gate, at whatever column it entered.
specification_note: |
  DOCUMENT FORM: the gate record into the derived milestone table. The
  reviewed baseline is the artifact; the record proves the review
  happened on the matrices as data.
---

## Guidance

The killer here is the MATRIX review. The clustering, the allocation and the
interfaces are reviewed as data. Never as a picture.

Diagrams are derived views. If standardised diagrams return, a visual review
can be reinstated.

M7 builds inside this baseline. A new element found mid-build returns HERE,
never in silently.

Review per [[meth-gate-review]].
