---
minted_in: i1
id: uc-drain-the-inbox
type: "[[use-case]]"
statement: Walk every pending note once and give each exactly one home.
actor: stk-engineer-driving-agents
trigger: the inbox has grown, an iteration finished, or the person asks for a retro
precondition: none
guarantee: the inbox stands at zero, and every note's disposition names where it went or what has to be true for it to come back
refines:
  - sty-clear-the-inbox-with-a-retro
priority: should
---

## Main scenario

1. The retro marks its window's boundary before it drains anything, so its own draining cannot shrink what it looks at.
2. It asks what came back from real use since the last look, and captures every answer.
3. It walks every pending note once.
4. Each note is CHECKED against the code before it is judged — most of what pends turns out to be already built, and the check costs seconds.
5. Each is dispositioned into exactly one home: done, obsolete, carried, or backlog.
6. The inbox reaches zero.

## Lane doors

- `se_note` captures a stray anywhere, and moves nothing.
- `se_note_drain` takes one back out, with the disposition it earned.
- `se_survey` serves the standing rows, each with the condition that makes it ready.

## Extensions

- 3a. A note describes something already shipped. It drains as done, saying where, so the next retro does not re-read it.
- 3b. A note has been overtaken or is simply wrong. It drains as obsolete WITH the reason, so it is never re-litigated.
- 3c. A note is future scope. It drains to backlog, and the disposition must name the condition that brings it back.
- 5a. Draining is attempted outside the retro. Two of the four homes are the retro's judgment and the engine refuses them elsewhere; done and obsolete are checks anyone can run.
- 6a. A parked note's condition has come true. Re-draining it is how it migrates back into scope.
