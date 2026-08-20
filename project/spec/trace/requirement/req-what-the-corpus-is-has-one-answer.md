---
minted_in: i9
id: req-what-the-corpus-is-has-one-answer
type: "[[requirement]]"
statement: When any part of the engine asks what the corpus contains or whether a node parses, it shall get the same answer as every other part, including when the answer is a failure.
kind: quality
characteristic: maintainability
verify_method: test
breaks_if_removed: Two readers disagree about a malformed node, so one caller reports it missing while another throws, and the walk stops somewhere neither of them names. It has already happened.
breaks_how_badly: corrosive
refines:
  - uc-quality-maintainability
source_refs:
  - "the probe on raid-asm-one-parser-decides-what-parses, 2026-08-16: the parser is one answer, the HANDLING is two"
  - "the same probe, naming both: two different functions called frontmatterOf, at worktree.ts:125 and traceschema.ts:82, with different signatures, disagreeing about failure"
  - "i9 kickoff goal: give the engine one corpus reader, so what the corpus IS has a single answer rather than one per caller"
priority: should
weighs_against:
  - req-the-desk-is-usable-soon-after-the-folder-opens > — a wrong answer is worse than a slow start, because the person can see the slow start
  - req-only-a-file-with-its-own-door-is-withheld >
weighs_with: req-the-pool-answers-a-person-and-an-agent-from-one-source — both measure whether two consumers of one store can disagree about what it holds
---

## Scenario

- Source: any caller inside the engine.
- Stimulus: it asks what the corpus contains, or whether one node parses.
- Artifact: the corpus on disk, including nodes that are malformed.
- Environment: normal operation, and the malformed case in particular, because
  that is where readers diverge.
- Response: one answer, whichever caller asked.
- Response measure: a test feeds one malformed node to every reader and asserts
  they agree, on the value AND on the failure. A reader that returns undefined
  where another throws fails this row.

## Why the failure case is the whole row

AGREEING ON A GOOD NODE IS EASY AND PROVES NOTHING. Every reader parses valid
frontmatter the same way, because they all take the same parsing library. That
was probed and it holds.

DISAGREEING ON A BAD NODE IS WHAT COSTS. One reader catches and hands back
nothing; another lets the failure escape. The caller who got nothing reports
the node as absent, and the caller who got the throw stops the walk. Neither
message names the malformed file.

THIS IS NOT HYPOTHETICAL. It happened, it was probed, and the probe named both
functions and both line numbers. The parser was never the problem.

## Why it is written as an outcome rather than as one reader

THE GOAL SAYS ONE READER, WHICH IS A MECHANISM. A single reader is the obvious
way to get one answer and it is not the only way, and naming it here would
freeze the design milestone's choice as an obligation.

WHAT MUST BE TRUE is that callers agree. Whether that is achieved by one reader,
by one shared failure type, or by a check that holds several readers to the same
contract belongs to design.

## What this row does NOT cover

IT SAYS NOTHING ABOUT SPEED. How fast the corpus is read is a different demand
with a different measure, and one standing assumption already carries the
question of whether the checks stay affordable as the corpus grows.

IT SAYS NOTHING ABOUT WHAT COUNTS AS A NODE. Which files are corpus and which
are not is a definition rather than a behaviour, and it is settled by the node
kinds rather than by this row.

## Behaviour

No model wanted. One condition and one response, and the measure carries the
part that matters.
