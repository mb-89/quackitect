---
form: absent-is-not-zero
by: agent
signed_off: 2026-08-17T12:16:22.738Z
authors: agent
files: null
---

# Evidence form / absent-is-not-zero

## current_situation

The third build chunk. It turns the fourth case of tsp-a-control-is-legible green and closes the failure shape that has bitten this product three times.

PROVEN: a battery ran against the tree as this chunk left it — 1397 tests, 1396 pass, 1 fail, and the single remaining failure belongs to chunk four.

DECLARED AT THE PREVIOUS CHUNK AND REPEATED HERE: this edit was applied while standing in chunk two's state, so one battery could answer for both rather than two answering for one each. The verdict above ran after it.

## built

TWO FILES, because a state a person cannot see is not a state.

project/deliverable/engine/params.ts — the bank stops defaulting.

- `Bank.at` becomes `number | undefined`. The comment on the field says why, naming the two earlier victims rather than describing the type.
- The stopat bank is built with `at: v.stop_at` instead of `at: v.stop_at ?? 0`. That one `?? 0` was the whole defect: it made "handed nothing" and "deliberately at the lowest notch" the same fact.
- `on` and `reachable` test the position explicitly rather than comparing against a defaulted zero.
- An absent position adds an `unknown` class to every rung.

project/deliverable/vscode/src/extension.ts — the state becomes visible.

- `.rung.unknown` draws dashed and muted, both from the host's own theme variables. Not red, because it is not an error: the control genuinely does not know where it stands.

AND ONE THING GOT SIMPLER RATHER THAN MORE COMPLEX. The help string was a five-deep nested ternary and adding the unknown case would have made it six. It is now `rungWhy`, a function of guard clauses where the unknown case is one branch among peers. The complexity ceiling is enforced as an error here, and adding a branch to a nest is how that ceiling gets hit.

MEASURED, from the battery's own text: the absent bank and the zero bank now render differently, and the case that asserted it passed.

## follow_up

ONE CASE REMAINS RED and it is chunk four's: `a running operation past its bound is named on the panel`.

TWO THINGS LANDED AFTER THE VERDICT ABOVE, and both are declared rather than folded in.

- The `.rung.unknown` stylesheet rule. A CSS addition cannot move a params.ts assertion, so the verdict stands for what it was asked, but the rule itself is unproven until the next run.
- The fourth case of tsp-work-past-its-bound-signals was GREEN FROM BIRTH and is now honest. It asserted containment alone, and with no signal built the busy panel and the quiet one are identical, so containment was trivially true. It now demands the signal be present AND contained. It is red again, correctly, and chunk four turns it green.

SO THE NEXT BATTERY SHOULD SHOW TWO FAILURES, not one, and that is the fix working rather than a regression. Saying so here means the next reader does not have to work it out.

WHAT CHUNK FOUR OWES: a running operation reaches the panel as a value and renders beside the controls. It waits on this chunk because both change what the values contract carries.

## anything_else

