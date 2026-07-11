---
id: man-ch1-motivation
type: manifest
mode: chapter
order: 10
statement: Motivation - where we want to be, and why we can get there.
---
## The big idea
<!-- fill [mandatory]
Contents: why this system exists, in one breath, standalone-readable. Name the
  idea's lineage where it has one - an old discipline in a new harness reads
  stronger than a novelty claim.
Motivation: a newcomer may read only this chapter - the lede must carry it.
Form: a handful of short sentences.
-->
<!-- ai:3 -->
Let an AI agent run ungoverned and you get slop: work that looks right and cannot be trusted. The cure is not a better model. It is design input - the intent, written down before the agent builds, in a form a machine can check. The industry is rediscovering this principle right now, under the name spec-driven development. The concept is old: systematic engineering has worked this way for over forty years. Quackitect integrates that existing process knowledge into an LLM harness - the agent fills the checks, a person adjudicates the [gates](term:gate), and a deterministic [engine](term:engine) keeps the record honest.
---
## Where we want to be
<!-- fill [mandatory]
Contents: the to-be state as a goal SYSTEM - the goals, their conflicts, their
  priorities. Close with the vision pitch: For <who> who <need>, the <name> is
  a <category> that <benefit>. Unlike <alternative>, it <difference>.
Motivation: the goal is the reader's stop-or-continue filter. A reader who does
  not care about the destination stops here, informed. Big ideas first.
Form: open with the VISION - who does what in the to-be world, alive, not
  abstract - then the goal system, then the pitch as a blockquote. Name goal
  conflicts openly - hiding them poisons the trade-offs. Philosophy belongs
  in the appendix: write it as a why- note and link it.
Sources: goal system @[[ref-methodische-entwicklung]]; the pitch template
  @[[ref-crossing-the-chasm]].
-->
<!-- ai:3 -->
The vision: you tell an AI agent what you want, relatively unstructured. The agent knows the methods. It knows the process. It carries the quality [gates](term:gate). So it leads you - to good design input, to sound decisions, to a reproducible design output. For software, and for any other design.

<!-- ai:3 -->
The thesis behind that vision: design input matters more with AI than it ever did before. A human developer reads between the lines. They infer unstated constraints from context, conventions, and the reason behind a request. A model does not. Where context is missing, it fills the gap with a plausible invention. So the intent must be explicit before implementation starts:

<!-- ai:3 -->
- the needs, and who holds them
- the constraints that bind
- the decisions, and their reasons

<!-- ai:3 -->
The framework governs that loop instead of trusting the run:

<!-- ai:3 -->
- Design input is verifiably present before building starts. The [gates](term:gate) enforce it.
- The agent never passes its own work. A person holds every [gate](term:gate).
- Implementation cannot drift from recorded intent unnoticed. A changed input turns every dependent check [suspect](term:suspect), and the [ledger](term:ledger) shows it.

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
When goals collide, trust wins. The [design input chapter](man-ch3-design-input.md) carries the tensions this forces.

<!-- ai:3 -->
> For the owner of an AI-driven project, who needs to trust work they did not watch happen, quackitect is a user-driven [gate](term:gate) [ledger](term:ledger) that turns that work into adjudicated, traceable checks. Unlike raw agent sessions and hand-written process documents, its record is deterministic, and it compiles into the book you are reading.
---
## Where we are
<!-- fill [mandatory]
Contents: the as-is - what exists today, where it hurts, who feels it.
Motivation: the delta below is meaningless without this baseline.
Form: prose, present tense, one paragraph per pain.
-->
<!-- ai:3 -->
Three witnesses describe the same failure, from three angles:

<!-- ai:3 -->
- Practitioner experience across the industry. Reviewing AI output has become the bottleneck. Changes arrive confident and wrong. Field research finds the same pattern: AI assistance lifts throughput and hurts stability where governance is missing ([DORA on gen-AI](ref-dora-genai)).
- Our own project history. Changes were reversed because the intent behind them was never written down. A later session rebuilt what an earlier one had already rejected.
- The pattern agentic-coding teams report. Decisions live in chat scrollback. The context evaporates when the session ends. Trust rests on the agent's self-report.

<!-- ai:3 -->
Documentation does not close the gap either. Hand-written documents fall behind the work silently. A stakeholder outside the loop holds nothing readable.
---
## The delta, and what closes it
<!-- fill [mandatory]
Contents: two authored moves - the gap as a claim (what every existing
  alternative sheds) and why it is closable now (the why-now pattern) - then
  the needs register. The success criteria live ON the needs: each need
  carries its pass lines, one expand away in the register below.
Motivation: the pass lines are exactly what the validation chapter checks
  against - the V-model's outer arc, as data. A criterion nothing will ever
  check is not a criterion.
Form: prose for the two moves; the needs register renders derived.
Sources: V-model pairing @[[ref-systementwurf-mechatronik]]; the RE rule, a
  goal without a traceable stakeholder is a wish @[[ref-sya-re]].
-->
<!-- ai:3 -->
The gap, as a claim: every existing alternative sheds one half of the pair.

<!-- ai:3 -->
- Manual process sheds the speed. Reviews and documents a person must write do not survive next to an agent that moves in minutes.
- Agent autonomy sheds the trust. A check the agent grants itself proves nothing.
- Build pipelines shed the meaning. They verify that code compiles and tests run. They do not verify that a claim traces to a person's decision.

<!-- ai:3 -->
The cure is the discipline the big idea names, collected:

<!-- ai:3 -->
- requirements engineering, in the lineage of [ISO/IEC/IEEE 29148](ref-iso-29148)
- requirement shapes that make every statement checkable ([EARS](ref-ears))
- decision records that keep the why next to the what ([architecture decision records](ref-nygard-adr))
- verification and validation, paired along the [V-model](ref-systementwurf-mechatronik)

<!-- ai:3 -->
The spec-driven wave works the same ground:

<!-- ai:3 -->
- [spec-kit](ref-spec-kit)
- [OpenSpec](ref-openspec)
- [Kiro](ref-kiro)
- [Tessl](ref-tessl)
- [BMAD-METHOD](ref-bmad)

<!-- ai:3 -->
That wave concentrates on the design output phase: structuring the path from spec to code. Our bet is the opposite end. Models keep getting better at producing output and will need less structure there. That moves the decisive leverage to the design input phase - and to keeping the decision history first-class.

<!-- ai:3 -->
The two ends compose. Quackitect covers the design input; an output-side framework slots in behind it. Combine Quackitect for the input with your favorite programming harness for the output.

<!-- ai:3 -->
Why the gap is closable now: two abilities matured together. Agents follow a written contract well enough to fill structured checks. A dependency-free [engine](term:engine) recomputes every verdict from the record alone. Together they make the [ledger](term:ledger) cheap enough to run on every move.

<!-- ai:3 -->
The idea above composes into a set of needs quackitect has to serve. They are listed below. Each need names the stakeholder it serves - a row without a stakeholder is a wish, not a need. Expand a row for the pass lines that accept it; the [validation chapter](man-ch5-verification-validation.md) traces each one to its outcome.

![[needs.base]]
---
## Business case
<!-- fill [judgment]
Contents: what the effort buys, in whose currency. Internal or strategic is a
  legal answer.
Motivation: the acquirer row of the reader matrix ends here.
Form: short. Skip with a recorded reason where no acquirer exists.
-->
<!-- ai:3 -->
The case is internal and strategic. Quackitect drives its own development and every project its owner runs with an agent. The learning compounds: each [iteration](term:iteration) makes the method of working with AIs cheaper and the record stronger.
