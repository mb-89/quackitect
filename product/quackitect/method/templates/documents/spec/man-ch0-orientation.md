---
id: man-ch0-orientation
type: manifest
mode: chapter
statement: Orientation - who reads what, and where to start.
---
## The system at a glance
<!-- fill [mandatory]
Contents: what the system is, who this document serves, that nobody reads all of it.
Motivation: a mis-landed reader is served fastest by knowing what the system is.
Form: two to four sentences. System first, document second. No motivation creep -
  the why lives in ch1. No method talk - ch8 owns it.
Sources: tech-dok-grundlagen digest (least-qualified-reader rule).
-->
<!-- ai:3 -->
{{lede}}
---
fig: context-star
---
## Who reads this document
<!-- fill [mandatory]
Contents: the who-does-what matrix - the stakeholder rows below map roles to
  their entry points; one line of prose above the table naming the entry presets.
Motivation: the matrix is GENERATIVE - the least-qualified reader of a chapter
  sets its detail level; readers find their row, then their button.
Form: one short prose line, then the derived table. The row set derives from the
  project types; a class with zero stakeholder notes renders as a TBD row.
Sources: tech-dok-grundlagen digest (who-does-what matrix); tech-dok digest
  (Was-macht-Wer, one document per circled cluster - here: one PRESET per cluster).
-->
<!-- ai:3 -->
{{reader-matrix-lede}}

```base
filters:
  and:
    - 'type == "stakeholder"'
views:
  - type: table
    name: Stakeholders
    order: [file.name, role, interest, influence, weight]
    sort:
      - property: role
        direction: ASC
```
---
## How to read this document
<!-- fill [mandatory]
Contents: the three layers (normative binds, informative explains, evidence
  records); the presets; the depth mechanic (statement, rationale, children,
  evidence - each one link away); term links and the glossary behavior.
  Close with three links: rationales live in ch7, the tailoring record in ch6,
  how the document is made in ch8 (sibling artifacts included).
Motivation: the reader's contract, folded into reading mechanics - a standalone
  contract unit reads as ceremony.
Form: short prose, one list for the layers. Links, no repetition.
-->
<!-- ai:3 -->
{{how-to-read}}
