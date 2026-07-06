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
Sources: least-qualified-reader rule @[[ref-tech-dok-grundlagen]].
-->
<!-- ai:3 -->
{{lede}}
---
fig: context-star
---
## Who reads this document
<!-- tailor: shipped text - the mechanics are the same in every project. Adjust the
  preset naming if this project's presets differ; the rows derive from the
  stakeholder notes.
Sources: who-does-what matrix @[[ref-tech-dok-grundlagen]]; Was-macht-Wer,
  one PRESET per reader cluster @[[ref-tech-dok]].
-->
<!-- ai:3 -->
Find your row below, then open the view preset it names. The preset narrows this document to the chapters that serve your role, at the depth your role needs.

![[stakeholder-matrix.base]]
---
## How to read this document
<!-- tailor: shipped text - the reading mechanics are the same in every project.
  Tailor only if this project adds or removes a layer or a mechanic.
-->
<!-- ai:3 -->
Everything here sits in one of three layers:

- Normative - binds. Requirements, constraints, decisions, and design rules.
- Informative - explains. Ledes, rationales, references, and fundamentals.
- Evidence - records. Verification results and the gate states.

Every unit starts shallow. The statement comes first. The rationale, the children, and the evidence each sit one link away. Stop when you have enough. A term links to its glossary entry on first use.

Three pointers for later:

- Deep whys live in [rationales](man-ch7-rationales.md).
- What was skipped, and why, is in the [tailoring record](man-ch6-project.md).
- How this document is made - and how to correct it - is in [guidance](man-ch8-guidance.md).
