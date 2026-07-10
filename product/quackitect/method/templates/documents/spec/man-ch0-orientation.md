---
id: man-ch0-orientation
type: manifest
mode: chapter
order: 0
statement: Introduction - what this book is and how to read it.
---
<!-- design: des-prose-rework  implements: req-prose-rework :: ch0 opens with the views home; ch1 leads with the moved bottleneck; the README opens story-first and closes on the dogfood claim - all reader-first per the voice rules. -->
## Views
<!-- fill [mandatory]
Contents: the views home - nobody reads all of this book, so the reader narrows it
  here. The view buttons and the derived documents render from the figure below;
  this unit only says how they work. The system itself is introduced on the README
  home page.
Motivation: a mis-landed reader is served fastest by one place that narrows the
  document. No method talk - ch8 owns it.
Form: two to four short sentences, then the derived figure.
Sources: least-qualified-reader rule @[[ref-tech-dok-grundlagen]].
-->
<!-- ai:3 -->
{{lede}}
<!-- enddesign -->
---
fig: views-home
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
