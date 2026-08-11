---
kind: method
statement: "One register holds the risks, assumptions, issues and dependencies — and the decisions, whose high-graded members are the ADRs."
---

## Situation

The register opens at M1 log-risks and is added to for the life of the
product. Assumptions get two states of their own at M3: identify, then probe.

## THE REGISTER IS NODES, AND THE TABLE IS A VIEW

Every entry is a node shaped by [[raid]], living in
`project/spec/trace/raid/`, landing on trunk exactly as a requirement does.

That is what makes an entry addressable, durable across iterations, and
linkable. A table row inside one iteration's evidence form is none of those:
nothing can point at it, and an assumption recorded in one iteration cannot be
probed by a later one.

A FORM FIELD CARRIES REFERENCES. log-risks lists the raid ids it opened. The
register a person reads is a VIEW over the folder, filtered by kind — so one
source serves the project chapter and the design-input chapter without either
restating the other.

## Writing one

- ONE ENTRY, ONE CONCERN. Two things that would be mitigated differently are
  two entries.
- THE STATEMENT IS WHAT IS AT STAKE, in one sentence. Not how worried you are.
- THE OWNER IS A ROLE. One person holds several roles and the role outlives
  the person. This is also the privacy law.
- THE TRIGGER IS THE LIVE PART. Name the event that brings this back for a
  look. An entry with no trigger is filed, not watched, and the register
  becomes a graveyard the first time nobody re-reads it.
- IMPACT IS A SENTENCE, AND THE GRADES RIDE BESIDE IT. Every entry carries
  `breaks_how_badly` ([[meth-damage-scale]]) and `how_likely`
  ([[meth-likelihood-scale]]) — ordinal words with tests, never numbers,
  because a probability nobody measured reads exactly like one somebody
  did.

## Telling the kinds apart

| kind | what it is | the tell |
| --- | --- | --- |
| risk | might happen, would hurt | it has not happened |
| assumption | treated as true without being established | you are already relying on it |
| issue | has happened, hurts now | present tense |
| dependency | outside your control, needed | somebody else owns it |
| decision | chosen and relied on | it can only be superseded |
| debt | a shortcut taken knowingly, cost deferred | somebody chose it, and it compounds |

A FALSIFIED ASSUMPTION BECOMES AN ISSUE. It has already happened, so it is not
a risk. Change the kind, keep the id, say so in the body.

A TENSION BETWEEN STAKEHOLDER ROLES IS A RISK and belongs here, not in a table
of its own ([[meth-stakeholder-analysis]]).

A CREDIBLE DECISION FLIP IS A RISK with its fallback recorded
([[meth-pugh-convergence]]).

## Where entries come from

- M1 log-risks opens the register from the vision and the actual.
- M3 identify-assumptions adds the assumptions the requirements lean on.
- M5 reverse-sensitivity adds a tripwire per credible flip.
- M5 record-adrs adds the decisions — every ADR is a register entry.
- M7 and M8 add what the build and the validation turned up. The debt
  taken at gate-implementation stands as kind `debt`, and the gate's
  debt_taken field references it.
- Any state may add one the moment it is noticed. Waiting for the right state
  is how an entry is lost.

## What the gates read

A gate does not count the register. It asks whether what stands there is
believable, and whether anything obvious is missing. The counting is the
engine's.

## Sources

- RAID as project practice: risks, assumptions, issues and dependencies as one
  log, each entry with one owner and one trigger.
