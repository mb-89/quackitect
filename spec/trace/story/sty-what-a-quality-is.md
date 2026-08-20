---
minted_in: i1
id: sty-what-a-quality-is
type: "[[story]]"
statement: When I meet a demand that is not about what the system does but about how well it does it, I want the register to hold it under the nine quality characteristics of ISO/IEC 25010:2023, so I can write it down instead of arguing about where it goes.
actor: stk-engineer-driving-agents
refines:
  - vp-qualities
priority: could
---

## Deck

I have a demand that no feature satisfies. It says the walk must resume after a week, not that the walk must exist. Nobody can tell me where it goes, so it goes in a comment and dies there.
|||
The real row this became: req-resume-needs-no-person, standing in the register instead of a comment.

---

An empty register and a demand in my head. The functional rows have obvious homes under the use cases they serve. This one serves all of them and none of them.
|||
The cross-cutting rule in meth-requirement-authoring: a quality names every use case whose pass it protects.

---

I open the qualities section and find nine doors, one per characteristic of ISO/IEC 25010:2023. Each door names its own sub-characteristics in its own words, so I never have to open the standard to use it.
|||
The nine stand as nodes in spec/trace/use-case/. Here they are in full, so nobody has to open the standard to look one up.

- FUNCTIONAL SUITABILITY. Does it provide the functions the need calls for, under the stated conditions.
- PERFORMANCE EFFICIENCY. What it costs in time and resources to do that.
- COMPATIBILITY. Does it share its environment, and exchange information with what is already there.
- INTERACTION CAPABILITY. Can the specified users work it through its interface. This replaced usability in the 2023 revision.
- RELIABILITY. Does it keep performing over a stated period, and does it survive a fault.
- SECURITY. Does access match authorisation, and is every act attributable.
- MAINTAINABILITY. Can it be changed to improve it, correct it, or adapt it.
- FLEXIBILITY. Can it be adapted to a new requirement, context or environment. This replaced portability in 2023, and it reaches wider than the name it replaced.
- SAFETY. Does it avoid a state that endangers life, health, property or the environment. New in the 2023 revision.

Each node carries its own sub-characteristics in its own words. The source is ISO/IEC 25010:2023.

---

I read the nine and one of them fits. Resuming after a week is fault tolerance, which lives under reliability. I did not have to invent a category, and nobody has to agree with my invention later.
|||
uc-quality-reliability carries the sub-characteristics in its own body; it is graded must in the register.

---

I write the row under that characteristic, with its measure and its pass line, exactly as I would write a functional one. The trace treats it identically: a characteristic above it, the functions that protect it below.
|||
The quality kind and its six-part scenario per meth-quality-scenarios; the requirement template holds both kinds in one shape.

---

A month later somebody asks which characteristics we never considered, and the answer is a list rather than a shrug. The nine are always all there, so an empty one is the register admitting a gap instead of hiding it.
|||
All nine nodes exist whether or not rows hang under them - the trace graph shows the empty ones as exactly that.
