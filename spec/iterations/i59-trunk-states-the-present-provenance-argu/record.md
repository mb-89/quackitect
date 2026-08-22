---
id: i59-trunk-states-the-present-provenance-argu
status: seeded
opened: 2026-08-21T15:34:40.203Z
goal: "Trunk states the present: provenance, argumentation and superseded text leave every describing surface for git history, a RAID decision or a new rationale node, and the consistency sweep blocks their return."
vision: "THE RULE. A trunk artifact says what the machine does now. Provenance, argumentation, superseded text and dated owner attributions do not belong on it. Scope statements do: goals and non-goals stay, because clarifying scope is not history.\n\nTHREE HOMES TAKE WHAT LEAVES. Git history takes the change and why it was made. The RAID register takes the commitment — `kind: decision` already exists with `status: superseded`, `Rejected options` and `Consequences`, so no ADR type is needed. A new rationale node takes the derivation.\n\nTHE RATIONALE NODE IS A TRACE NODE THAT IS NOT IN THE TRACE GRAPH (owner ruling). It is reached by link from a note and through the database. It is never drawn as a spine edge and never scored by coverage. A fifty-step derivation of a formula is a document, not a register entry with an owner and a trigger.\n\nMEASURED BEFORE THE WORK BEGINS: 3,572 flagged lines across 897 trunk files, plus 313 comment lines in 91 of 169 engine source files. The worst single file is dsp-walk-machine.md at 231 lines. The sweep-consistency row that would catch this carries four violations of its own.\n\nTHE DETECTORS: self-referential past tense, owner attribution, bare dates, iteration identifiers in prose, and retained-superseded phrasing. A flagged line carrying a link to a rationale or a decision PASSES. That redirect is the mechanism prose-inspect already uses for bare method terms, so it is proven rather than new.\n\nITERATION RECORDS ARE NOT FULLY EXEMPT (owner ruling). Dates and owner attributions are agent slop that a person would never write, so those detectors bind there too. Only the rules about an iteration's own history are lifted.\n\nCOMMIT MESSAGES GET A TEMPLATE AND A LINT. This is the standing template shape: the agent fills fields and the engine writes the artifact. The decision belongs in the commit body, and nothing composes a commit message today.\n\nARM AT ZERO DEBT. Findings are corrected, never exempted. No ratchet and no exemption markers. This iteration lands BEFORE i25 arms its linter, because i25's zero-debt rule needs the zero this iteration produces.\n\nDONE LOOKS LIKE: the detectors report zero on trunk; the rules sit on the `blocking:` list in voice-lint.md; sweep-consistency refuses an exit that reintroduces one; spec/trace/rationale holds the extracted derivations; every drained passage that was load-bearing carries a link to one; a commit message template exists and is linted.\n\nWHAT STAYS WITH OTHER RECORDS. Vale, the ASD-STE100 dictionary at the newest issue, the glossary and the link graph stay with i25. Retired-mechanism corrections and the voice_matrix fold stay with i42."
inputs:
depends_on: []
---

# i59-trunk-states-the-present-provenance-argu

## Goal

Trunk states the present: provenance, argumentation and superseded text leave every describing surface for git history, a RAID decision or a new rationale node, and the consistency sweep blocks their return.

## Rough vision

THE RULE. A trunk artifact says what the machine does now. Provenance, argumentation, superseded text and dated owner attributions do not belong on it. Scope statements do: goals and non-goals stay, because clarifying scope is not history.

THREE HOMES TAKE WHAT LEAVES. Git history takes the change and why it was made. The RAID register takes the commitment — `kind: decision` already exists with `status: superseded`, `Rejected options` and `Consequences`, so no ADR type is needed. A new rationale node takes the derivation.

THE RATIONALE NODE IS A TRACE NODE THAT IS NOT IN THE TRACE GRAPH (owner ruling). It is reached by link from a note and through the database. It is never drawn as a spine edge and never scored by coverage. A fifty-step derivation of a formula is a document, not a register entry with an owner and a trigger.

MEASURED BEFORE THE WORK BEGINS: 3,572 flagged lines across 897 trunk files, plus 313 comment lines in 91 of 169 engine source files. The worst single file is dsp-walk-machine.md at 231 lines. The sweep-consistency row that would catch this carries four violations of its own.

THE DETECTORS: self-referential past tense, owner attribution, bare dates, iteration identifiers in prose, and retained-superseded phrasing. A flagged line carrying a link to a rationale or a decision PASSES. That redirect is the mechanism prose-inspect already uses for bare method terms, so it is proven rather than new.

ITERATION RECORDS ARE NOT FULLY EXEMPT (owner ruling). Dates and owner attributions are agent slop that a person would never write, so those detectors bind there too. Only the rules about an iteration's own history are lifted.

COMMIT MESSAGES GET A TEMPLATE AND A LINT. This is the standing template shape: the agent fills fields and the engine writes the artifact. The decision belongs in the commit body, and nothing composes a commit message today.

ARM AT ZERO DEBT. Findings are corrected, never exempted. No ratchet and no exemption markers. This iteration lands BEFORE i25 arms its linter, because i25's zero-debt rule needs the zero this iteration produces.

DONE LOOKS LIKE: the detectors report zero on trunk; the rules sit on the `blocking:` list in voice-lint.md; sweep-consistency refuses an exit that reintroduces one; spec/trace/rationale holds the extracted derivations; every drained passage that was load-bearing carries a link to one; a commit message template exists and is linted.

WHAT STAYS WITH OTHER RECORDS. Vale, the ASD-STE100 dictionary at the newest issue, the glossary and the link graph stay with i25. Retired-mechanism corrections and the voice_matrix fold stay with i42.
