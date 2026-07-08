---
id: man-ch1-motivation
type: manifest
mode: chapter
order: 10
statement: Motivation - where we want to be, and why we can get there.
---
## The big idea
<!-- fill [mandatory]
Contents: why this system exists, in one breath, standalone-readable.
Motivation: a newcomer may read only this chapter - the lede must carry it.
Form: two to four sentences.
-->
<!-- ai:3 -->
The bottleneck of AI-driven work has moved. It is no longer how fast the agent produces - it is how much of the result a person can honestly vouch for. Quackitect moves that limit: the agent fills checks, a person adjudicates the [gates](term:gate), and a deterministic [engine](term:engine) keeps the record honest - so one person can stand behind far more work than they could ever read. This chapter holds the goal, the starting point, and what proves the gap closed.
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
Sources: goal system @[[ref-methodische-entwicklung]]; the pitch template
  @[[ref-crossing-the-chasm]].
-->
<!-- ai:3 -->
The project drives toward three goals, in priority order:
<!-- ai:3 -->
- **Trust.** Every load-bearing claim about the work carries a recorded human adjudication.
- **Durability.** The record is deterministic. It survives sessions, models, and tools. It compiles into a book any stakeholder can read.
- **Speed.** The AI does the heavy work. Each human move costs one command.
<!-- ai:3 -->
The goals conflict, and the conflicts are accepted openly:
<!-- ai:3 -->
- Trust against speed. A [gate](term:gate) stops the walk until a person decides. That wait is the price of the record.
- Durability against freedom. Typed items and stable identifiers constrain the authoring. Free-form notes would be faster to write and worthless to derive from.
<!-- ai:3 -->
When goals collide, trust wins. Chapter 4 carries the trade-offs this forces.
<!-- ai:3 -->
> For the owner of an AI-driven project, who needs to trust work they did not watch happen, quackitect is a user-driven gate [ledger](term:ledger) that turns that work into adjudicated, traceable checks. Unlike raw agent sessions and hand-written process documents, its record is deterministic, and it compiles into the book you are reading.
---
## Where we are
<!-- fill [mandatory]
Contents: the as-is - what exists today, where it hurts, who feels it.
Motivation: the delta below is meaningless without this baseline.
Form: prose, present tense, one paragraph per pain.
-->
<!-- ai:3 -->
Agent work moves in minutes, and this is the baseline it leaves behind. Decisions live in chat scrollback. The context evaporates when the session ends. The next session starts from zero.
<!-- ai:3 -->
Trust rests on self-report. The agent says the tests pass. Without a record, that sentence is a claim, not evidence. The builder feels this every time work resumes.
<!-- ai:3 -->
Documentation does not get written. Hand-written documents fall behind the work silently. A stakeholder outside the loop has nothing readable to hold.
---
## The delta, and what proves it closed
<!-- fill [mandatory]
Contents: two authored moves - the gap as a claim (what every existing
  alternative sheds) and why it is closable now (the why-now pattern). The
  success criteria live on the needs - each need carries its pass lines; the view below renders them.
Motivation: the criteria are exactly what the validation chapter checks against
  - the V-model's outer arc, as data. A criterion nothing will ever check is
  not a criterion.
Form: prose for the two moves; the criteria table renders derived.
Sources: V-model pairing @[[ref-systementwurf-mechatronik]].
-->
<!-- ai:3 -->
The gap, as a claim: every existing alternative sheds one half of the pair.
<!-- ai:3 -->
- Manual process sheds the speed. Reviews and documents a person must write do not survive next to an agent that moves in minutes.
- Agent autonomy sheds the trust. A check the agent grants itself proves nothing.
- Build pipelines shed the meaning. They verify that code compiles and tests run. They do not verify that a claim traces to a person's decision.
<!-- ai:3 -->
Why the gap is closable now: two abilities matured together. Agents follow a written contract well enough to fill structured checks. A dependency-free engine recomputes every verdict from the record alone. Together they make the ledger cheap enough to run on every move.
<!-- ai:3 -->
The criteria below are the pass lines. Chapter 5 traces each one to its demonstrated outcome.

![[criteria.base]]
---
## Business case
<!-- fill [judgment]
Contents: what the effort buys, in whose currency. Internal or strategic is a
  legal answer.
Motivation: the acquirer row of the reader matrix ends here.
Form: short. Skip with a recorded reason where no acquirer exists.
-->
<!-- ai:3 -->
The case is internal and strategic. Quackitect drives its own development and every project its owner runs with an agent. The learning compounds: each [iteration](term:iteration) makes the method cheaper and the record stronger. No paying acquirer exists today. The first quackitect-driven tool shipping to real users is the business case in the field.
---
## Needs
<!-- tailor: shipped text - the register derives from the need notes; the intro
  line is the same in every project.
Sources: the RE rule, a goal without a traceable stakeholder is a wish
  @[[ref-sya-re]].
-->
<!-- ai:3 -->
Each need below names the stakeholder it serves and the criterion that accepts it. The register derives from the need notes - a row without a stakeholder is a wish, not a need.

![[needs.base]]
