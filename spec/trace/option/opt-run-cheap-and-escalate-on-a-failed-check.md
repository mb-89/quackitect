---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: opt-run-cheap-and-escalate-on-a-failed-check
type: "[[option]]"
cluster: the-sizing
question: what happens on a failed check
statement: "no strength is chosen in advance at all: the cheapest worker attempts the work, a check reads the result, and only a failed check escalates to a stronger one"
found_by: prior-art
source: "the LLM cascading literature surveyed in arxiv.org/html/2603.04445v2, which distinguishes routing — one decision mapping the query to one model — from cascading, which escalates after a quality estimate on the produced answer; FrugalGPT is the ancestor of the pattern"
---

## Mechanism

THE DECISION MOVES FROM BEFORE THE WORK TO AFTER IT. Attempt, check, escalate
on failure. Nothing is predicted, because the real answer is produced and then
judged.

WHY IT IS THE STRONGEST IDEA IN THIS SET ON CORRECTNESS: a check reads an actual
result rather than guessing at difficulty, so it cannot be wrong about what the
work turned out to need. That is precisely the failure mode every declared
scheme carries.

WHY IT MAY NOT FIT HERE, as an honest objection rather than a dismissal: it
needs a CHECK on the output, and this process's own ladder says the hardest
states are exactly the ones where a plausible wrong answer passes every
automated gate. Where a checker exists the escalation works; where it does not,
cascading degrades to running everything cheap and hoping.

SO IT MAY BE A HYBRID RATHER THAN A RIVAL. Cascade the states that have
checkers, declare the ones that do not — a different partition of the same
problem, and worth enumerating as such.
