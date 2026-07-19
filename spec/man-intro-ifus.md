---
id: man-intro-ifus
type: manifest
mode: chapter
statement: Introduction and IFUs. What this book is, how to read it, and how to use the system.
---
## Document overview
<!-- fill [mandatory]
Contents: what this document IS and why to read it. The chapter lines and the
  derived documents render from the figure below - one line per chapter, derived
  from the book structure at render time, never hand-maintained. The system
  itself is introduced on the README home page.
Motivation: a mis-landed reader is served fastest by one place that says what
  this document is and where each question is answered. No method talk - ch8
  owns it.
Form: two to four short sentences, then the derived figure.
Sources: least-qualified-reader rule @[[ref-tech-dok-grundlagen]].
-->
<!-- ai:3 -->
This book is the full specification of quackitect. It holds the needs, the requirements, the design, and the proof, all generated from one trace. Read it when the README is not enough. The chapter lines below say where each question is answered. 

<!-- ai:0 -->
- What the system IS lives on the [README](man-readme.md) home page.
- How to use it: see the IFUs below.
---
fig: views-home
---
## IFUs
<!-- tailor: quackitect-specific landing (owner ruling, req-ch2-ifu-intro): the ONE
  onboarding home; never duplicated later. The section ROUTES (Diataxis: the deck
  teaches, the guides serve work, this landing only points). The deck link rides
  the anchor rail into present mode; the guides link carries the audience preset
  fragment.
-->
<!-- ai:3 -->
An IFU is an instruction for use: it teaches one thing a user can do with the system, told as that user's story.

![[ifus.base]]
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
- Deep whys live in [rationales](man-guidance.md).
- What was skipped, and why, is in the [tailoring record](man-project.md).
- How this document is made - and how to correct it - is in [guidance](man-guidance.md).
---
## Who reads this document
<!-- tailor: shipped text - the mechanics are the same in every project. The view
  pill on each row derives from the stakeholder's preset link (else its id); the
  rows derive from the stakeholder notes.
Sources: who-does-what matrix @[[ref-tech-dok-grundlagen]]; Was-macht-Wer,
  one PRESET per reader cluster @[[ref-tech-dok]].
-->
<!-- ai:3 -->
Find your row below. Click the view pill on your row. It narrows this document to the chapters that serve your role. A second click clears it.

![[stakeholder-matrix.base]]
