---
id: man-ch1-motivation
type: manifest
mode: chapter
statement: Motivation - where we want to be, and why we can get there.
---
## The big idea
<!-- fill [mandatory]
Contents: why this system exists, in one breath, standalone-readable.
Motivation: a newcomer may read only this chapter - the lede must carry it.
Form: two to four sentences.
-->
<!-- ai:3 -->
{{lede}}
---
## Where we want to be
<!-- fill [mandatory]
Contents: the to-be state as a goal SYSTEM - the goals, their conflicts, their
  priorities. Close with the vision pitch: For <who> who <need>, the <name> is
  a <category> that <benefit>. Unlike <alternative>, it <difference>.
Motivation: the goal is the reader's stop-or-continue filter. A reader who does
  not care about the destination stops here, informed. Big ideas first.
Form: prose, two to four paragraphs, then the pitch as a blockquote. Name goal
  conflicts openly - hiding them poisons the ch4 trade-offs. Philosophy belongs
  in ch7: write it as a why- note and link it.
Sources: methodische-entwicklung digest (goal system); sebot_v1 Motivation
  (worked example of the pitch).
-->
<!-- ai:3 -->
{{where-we-want-to-be}}
---
## Where we are
<!-- fill [mandatory]
Contents: the as-is - what exists today, where it hurts, who feels it.
Motivation: the delta below is meaningless without this baseline.
Form: prose, present tense, one paragraph per pain.
-->
<!-- ai:3 -->
{{where-we-are}}
---
## The delta, and what proves it closed
<!-- fill [mandatory]
Contents: three moves - the gap as a claim (what every existing alternative
  sheds); why it is closable now (the why-now pattern); measurable success
  criteria, each checkable.
Motivation: the success criteria written here are exactly what the validation
  chapter checks against - the V-model's outer arc. A criterion nothing will
  ever test is not a criterion.
Form: prose for the first two moves, a list for the criteria.
Sources: systementwurf-mechatronik digest (V-model pairing).
-->
<!-- ai:3 -->
{{delta-and-proof}}
---
## Business case
<!-- fill [judgment]
Contents: what the effort buys, in whose currency. Internal or strategic is a
  legal answer.
Motivation: the acquirer row of the reader matrix ends here.
Form: short. Skip with a recorded reason where no acquirer exists.
-->
<!-- ai:3 -->
{{business-case}}
---
## Needs
<!-- fill [mandatory]
Contents: one line introducing the register - every need carries its source
  stakeholder and an acceptance criterion.
Motivation: a goal without a traceable stakeholder is a wish (the RE rule).
Form: one prose line, then the derived register.
-->
<!-- ai:3 -->
{{needs-lede}}

```base
filters:
  and:
    - 'type == "need"'
views:
  - type: table
    name: Needs
    order: [file.name, statement]
```
