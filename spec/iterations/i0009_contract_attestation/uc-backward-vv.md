---
id: uc-backward-vv
type: usecase
statement: An iteration's verification and validation look backward only — they re-check everything up to and including their own iteration; later iterations never reopen an earlier iteration's verdicts by mere addition.
class: review
killer: false
---
## Rationale (not load-bearing)
Owner directive 2026-07-04, after two rounds of explaining the 74-suspect wave: the current iteration must re-check all old tests (regression net), but old iterations must not look into the future. Additions stop rippling backward; a genuinely failing old test still flips its own iteration red — that flip is a true regression signal and stays.
