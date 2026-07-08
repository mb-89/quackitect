---
id: man-ch0-orientation
type: manifest
mode: chapter
order: 0
statement: The document at a glance - what this book is and how to read it.
---
## The document at a glance
<!-- fill [mandatory]
Contents: what THIS BOOK is, who it serves, that nobody reads all of it. The system
  itself is introduced on the README home page; this chapter is about the document.
Motivation: a mis-landed reader is served fastest by knowing what the book is and
  how to move through it. No method talk - ch8 owns it.
Form: two to four sentences. Document first. Point at the README for the system.
Sources: least-qualified-reader rule @[[ref-tech-dok-grundlagen]].
-->
<!-- ai:3 -->
This book is the project's record, compiled: a user-driven gate [ledger](term:ledger) where the AI fills the checks, a person adjudicates the [gates](term:gate), and a deterministic [engine](term:engine) keeps it honest. What the system IS lives on the [README](man-readme.md) home page. This chapter is about the book itself - nobody reads all of it, so pick your view below and stop when you have enough.
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

<!-- ai:3 -->
- Normative - binds. Requirements, constraints, decisions, and design rules.
- Informative - explains. Ledes, rationales, references, and fundamentals.
- Evidence - records. Verification results and the gate states.

<!-- ai:3 -->
Every unit starts shallow. The statement comes first. The rationale, the children, and the evidence each sit one link away. Stop when you have enough. A term links to its glossary entry on first use.

<!-- ai:3 -->
Three pointers for later:

<!-- ai:3 -->
- Deep whys live in [rationales](man-ch8-guidance.md).
- What was skipped, and why, is in the [tailoring record](man-ch6-project.md).
- How this document is made - and how to correct it - is in [guidance](man-ch8-guidance.md).
