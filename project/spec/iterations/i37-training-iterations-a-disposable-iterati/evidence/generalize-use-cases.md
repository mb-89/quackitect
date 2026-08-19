---
form: generalize-use-cases
by: agent
signed_off: 2026-08-19T17:09:58.566Z
authors: agent
files:
---

# Evidence form / generalize-use-cases

## current_situation

i37 stands at generalize-use-cases, the last work step of M2 before gate-inputs. Two stories are minted and signed.

Each story generalises to one use case, one actor, one goal.

## use_cases

- [[uc-measure-a-machine-change-against-a-finished-iteration]]
- [[uc-walk-an-iteration-from-a-tree-that-cannot-see-its-future]]

## follow_up

- gate-inputs is next and closes M2.
- The extensions are where the requirements come from. 4a on the agent's use case is the fatal ceiling risk stated as a step: a ceiling that cannot prove ancestry refuses.
- 6a is the conditional concealment, and it is the only extension carrying a live dependency.
- 5a on the engineer's use case says a failed run is still a measurement. That has not been written anywhere else and belongs in the report template.

## anything_else

ONE EXTENSION IS DOING MORE WORK THAN ITS NEIGHBOURS AND IS WORTH NAMING.

5a on the agent's use case says the re-walk's tests may differ from the original's and that nothing corrects it. That is the whole quality position in one line: the original is a reference, never an answer.

WITHOUT IT SOMEBODY WILL EVENTUALLY BUILD A DIFF. Comparing the re-walk's tests against the original's looks like a free quality signal and is not one, because the original may have been wrong.

TWO EXTENSIONS ARE THE FATAL RISK RESTATED AS STEPS. 4a says the ceiling refuses when it cannot prove ancestry. A ceiling that goes quiet looks exactly like a ceiling that passed, and that sentence is now in three places: the register entry, this use case and the story deck.
