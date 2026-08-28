---
minted_in: i9
id: raid-dec-a-produced-copy-is-built-from-an-include-list
type: "[[raid]]"
kind: decision
statement: Every act that produces a copy assembles it from an explicit list of what belongs in it, so a file nobody named cannot ship, instead of listing what must stay out and checking that the list is right.
owner: the driving agent
trigger: any new producing act, and any change to what the packaged artefact contains
status: decided
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - req-fresh-product-starts-empty
  - req-only-a-file-with-its-own-door-is-withheld
  - probe P3 at i9 M4, 2026-08-19 — both producing acts already run one shared filter function
---

## Rejected options

EXCLUDE BY NAME AND PROVE IT WITH A TEST.
[[opt-exclude-at-the-packaging-boundary-and-prove-it]]. What the runner-up takes,
and what ships today. Rejected on the asymmetry rather than on principle: a deny
list that is wrong ships something private and nothing breaks, while an include
list that is wrong fails on install for the first person who tries it. A loud
failure is cheaper than a silent one.

DECLARE THE EXCLUSION PER PRODUCING ACT.
[[opt-the-exclusion-is-declared-per-producing-act]]. It generalises something the
deny-list option already admits, that different acts want different answers.
Rejected because three declarations drift where one cannot, and a new act
inherits nothing rather than inheriting the safe answer.

## Consequences

EVERY NEW SOURCE FILE MUST BE NAMED BEFORE IT SHIPS. That is friction on ordinary
work, paid by whoever adds a file, forever.

A FUTURE PRODUCING ACT THAT DOES NOT CONSULT THE LIST INHERITS NOTHING, and that
residual is silent in the same direction the deny list was.

THE TEST THE M2 GATE ASKED FOR IS STILL OWED. What changes is what it guards: a
build step rather than a growing set of patterns.

### The prior-art back-check

NPM'S `files` FIELD IS THIS DECISION, SHIPPED. It is an allowlist, it TAKES
PRECEDENCE over the ignore file, and OWASP's NPM Security Cheat Sheet recommends
it for exactly the reason argued here, that denylists are error-prone and a
forgotten entry publishes a secret.

WHAT THE ORIGINAL DOES BETTER: precedence is defined and documented, so a project
carrying both an allowlist and a denylist has a stated winner. Ours has one
mechanism and has not had to answer that question yet.

WHAT IT PAID THAT WE HAVE NOT: years of the mixed case, where developers updated
one list and forgot the other. That is the documented failure the allowlist was
promoted to fix.

WHAT WE ONLY LEARNED BY CHECKING: the whole neighbourhood of comparable tools
goes the other way. `.cursorignore`, `.aiderignore`, `.geminiignore`,
`.clineignore` and the cross-tool `.agentignore` are all deny files taking
gitignore syntax. That is prior art AGAINST this decision, and it is recorded
here rather than left out because it argues the wrong way: a deny file is a
convention users already know and can edit, and an include list is ours alone.
