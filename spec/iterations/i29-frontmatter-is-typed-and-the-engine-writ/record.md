---
id: i29-frontmatter-is-typed-and-the-engine-writ
status: seeded
opened: 2026-08-13T16:54:19.709Z
goal: "Frontmatter is typed and the engine writes it: a field declares its type in one place, the agent selects rather than composes, and a wrong value refuses at the boundary."
vision: |-
  THE RULE, the owner's, stated three times across two weeks. Everything in the data schema the machinery CAN answer, the machinery MUST answer. The agent writes the PROSE. Frontmatter fields are ARGUMENTS TO THE ENGINE, and the engine refuses a node whose frontmatter is wrong, missing or invented.

  WHAT EXISTS TODAY, IN TWO SEPARATE PLACES AND NEITHER AT AUTHORING TIME.

  - VALUE ENUMERATION. An item template declares checks: one_of, and conformance refuses a value outside the list. That holds flow kind, requirement priority and cluster coupling.
  - REFERENCE TYPING, but only for the SPINE. machines/trace-schema.md declares from/key/to per edge, and edgeProblems refuses a node pointing at the wrong type.

  WHAT DOES NOT EXIST.

  - LATERAL EDGES ARE UNTYPED. A function's inputs and outputs name flow ids, and its cluster names a cluster id. Nothing declares that anywhere, and edgeProblems reads only the upward slot — so those keys are not refused, not checked, just unseen.
  - NOTHING CONSTRAINS AT AUTHORING TIME. Both mechanisms fire at conformance, after the fact. You type a value, submit, and find out.
  - ONE FIELD'S RULES LIVE IN TWO FILES, and the lateral ones in none.

  THE COST, four instances measured rather than argued.

  - minted_in hand-stamped from a git log, got the owner wrong, and produced duplicate YAML keys that refused to parse.
  - priority matched by string, so three spellings of blocked resolved to 0 — the one value that makes a blocked state run at every setting.
  - The change size was read by more than one extractor before it was made one.
  - Prose written into a quoted YAML scalar broke the whole corpus parse, twice in ten minutes, because a record's vision is duplicated into frontmatter.

  Every one is a field the engine could have owned and did not.

  WHAT IT BUILDS.

  - A FIELD DECLARES ITS TYPE ON THE ITEM CARD. One home, covering a value enumeration and a reference target alike.
  - MINTING IS A VERB. The engine creates a node and sets id, type and minted_in from what it already knows, then hands back a file the agent fills with prose.
  - AN UNKNOWN KEY REFUSES, and a missing required key refuses, both naming the template.
  - THE SCHEMA DRIVES AN EDITOR. A reference field offers its target set, an enumeration offers its values, and a node table edits frontmatter. The precedent already ships one level up: evidence fields carry picks, and the form offers that source rather than a text box. The NODE has no equivalent, which is why the same field is constrained on a form and free text in the file.
  - AN LSP OVER THE VAULT flags a value outside the declared set as a person types it, reading the engine's schema rather than repeating it.

  WHAT COMES WITH IT, from the pool.

  - The DSM editor becomes a VIEW on the general editor rather than carrying its own copy of the same behaviour. What stays specific to it is small: the matrix picture, the cluster boxes, and the row order that makes the blocks visible.
  - A node-table field spanning two node kinds stops writing a column the target's template does not declare. Today the collector takes the union of every widget's columns, so a function row serialises a cluster's fields as blanks, and whether the write-back drops them is unverified.

  DO NOT BUILD THE EDITOR FIRST. It waits on the schema, because building it first means guessing at the types it edits.

  FROM THE POOL, 2026-08-13. Three more, and the first two are fields to strike rather than type.

  - THE MECHANISM, IN THE OWNER'S WORDS (note-2244d26d5077). The agent must never type frontmatter: the engine hands a schema, the agent picks a value. Four parts - the engine declares each key's type and its legal values where the set is closed, the agent SELECTS without composing the line, the engine writes the frontmatter, and a wrong value refuses at the boundary with the legal set in the remedy. The bug that provoked it was not the guard: a field with six legal values was ever free text.
  - STRIKE THE characteristic FIELD from the requirement template (owner agreed, note-69d710297f3c). It holds a second copy of an edge the trace already carries, which this project's own rule refuses, and it is already inconsistent at 8 of 19 qualities. Nothing reads it - the only match outside the template is a comment written the same day. Three steps: remove the field block including its nine-value enumeration, strip the key from the 8 nodes carrying it, and check no form template, lint or view reads it first. WHAT MUST SURVIVE: the nine characteristics themselves, as use cases. A quality is placed by what it refines.
  - DOES current_situation EARN ITS PLACE (owner question, note-1d59851377ac). The check ran: all 30 of 30 evidence files carry it and none is boilerplate, NOTHING MECHANICAL READS IT, and its content is restatement of what upstream states already stamped. THE DECISION IS THE OWNER'S and it is unanswered. The proposed direction is to keep it on GATE forms, where an adjudicator reads cold, and drop it from operational states, whose reader arrives from the trace.
  - CONFORMANCE MOVES TO THE WRITE (owner, note-b93ad16c18a5), which is this iteration's authoring-time half stated as a rule. Two pieces already exist: item templates declare checks and conformance runs them, but at submit and at the gate; and the write path already lints and formats covered files, so the hook point is there. THE SKELETON MINT STAYS LEGAL - the check must distinguish unanswered from wrong, as conformance already does.
inputs: null
depends_on: null
---

# i29-frontmatter-is-typed-and-the-engine-writ

## Goal

Frontmatter is typed and the engine writes it: a field declares its type in one place, the agent selects rather than composes, and a wrong value refuses at the boundary.

## Rough vision

THE RULE, the owner's, stated three times across two weeks. Everything in the data schema the machinery CAN answer, the machinery MUST answer. The agent writes the PROSE. Frontmatter fields are ARGUMENTS TO THE ENGINE, and the engine refuses a node whose frontmatter is wrong, missing or invented.

WHAT EXISTS TODAY, IN TWO SEPARATE PLACES AND NEITHER AT AUTHORING TIME.

- VALUE ENUMERATION. An item template declares checks: one_of, and conformance refuses a value outside the list. That holds flow kind, requirement priority and cluster coupling.
- REFERENCE TYPING, but only for the SPINE. machines/trace-schema.md declares from/key/to per edge, and edgeProblems refuses a node pointing at the wrong type.

WHAT DOES NOT EXIST.

- LATERAL EDGES ARE UNTYPED. A function's inputs and outputs name flow ids, and its cluster names a cluster id. Nothing declares that anywhere, and edgeProblems reads only the upward slot — so those keys are not refused, not checked, just unseen.
- NOTHING CONSTRAINS AT AUTHORING TIME. Both mechanisms fire at conformance, after the fact. You type a value, submit, and find out.
- ONE FIELD'S RULES LIVE IN TWO FILES, and the lateral ones in none.

THE COST, four instances measured rather than argued.

- minted_in hand-stamped from a git log, got the owner wrong, and produced duplicate YAML keys that refused to parse.
- priority matched by string, so three spellings of blocked resolved to 0 — the one value that makes a blocked state run at every setting.
- The change size was read by more than one extractor before it was made one.
- Prose written into a quoted YAML scalar broke the whole corpus parse, twice in ten minutes, because a record's vision is duplicated into frontmatter.

Every one is a field the engine could have owned and did not.

WHAT IT BUILDS.

- A FIELD DECLARES ITS TYPE ON THE ITEM CARD. One home, covering a value enumeration and a reference target alike.
- MINTING IS A VERB. The engine creates a node and sets id, type and minted_in from what it already knows, then hands back a file the agent fills with prose.
- AN UNKNOWN KEY REFUSES, and a missing required key refuses, both naming the template.
- THE SCHEMA DRIVES AN EDITOR. A reference field offers its target set, an enumeration offers its values, and a node table edits frontmatter. The precedent already ships one level up: evidence fields carry picks, and the form offers that source rather than a text box. The NODE has no equivalent, which is why the same field is constrained on a form and free text in the file.
- AN LSP OVER THE VAULT flags a value outside the declared set as a person types it, reading the engine's schema rather than repeating it.

WHAT COMES WITH IT, from the pool.

- The DSM editor becomes a VIEW on the general editor rather than carrying its own copy of the same behaviour. What stays specific to it is small: the matrix picture, the cluster boxes, and the row order that makes the blocks visible.
- A node-table field spanning two node kinds stops writing a column the target's template does not declare. Today the collector takes the union of every widget's columns, so a function row serialises a cluster's fields as blanks, and whether the write-back drops them is unverified.

DO NOT BUILD THE EDITOR FIRST. It waits on the schema, because building it first means guessing at the types it edits.

FROM THE POOL, 2026-08-13. Three more, and the first two are fields to strike rather than type.

- THE MECHANISM, IN THE OWNER'S WORDS (note-2244d26d5077). The agent must never type frontmatter: the engine hands a schema, the agent picks a value. Four parts - the engine declares each key's type and its legal values where the set is closed, the agent SELECTS without composing the line, the engine writes the frontmatter, and a wrong value refuses at the boundary with the legal set in the remedy. The bug that provoked it was not the guard: a field with six legal values was ever free text.
- STRIKE THE characteristic FIELD from the requirement template (owner agreed, note-69d710297f3c). It holds a second copy of an edge the trace already carries, which this project's own rule refuses, and it is already inconsistent at 8 of 19 qualities. Nothing reads it - the only match outside the template is a comment written the same day. Three steps: remove the field block including its nine-value enumeration, strip the key from the 8 nodes carrying it, and check no form template, lint or view reads it first. WHAT MUST SURVIVE: the nine characteristics themselves, as use cases. A quality is placed by what it refines.
- DOES current_situation EARN ITS PLACE (owner question, note-1d59851377ac). The check ran: all 30 of 30 evidence files carry it and none is boilerplate, NOTHING MECHANICAL READS IT, and its content is restatement of what upstream states already stamped. THE DECISION IS THE OWNER'S and it is unanswered. The proposed direction is to keep it on GATE forms, where an adjudicator reads cold, and drop it from operational states, whose reader arrives from the trace.
- CONFORMANCE MOVES TO THE WRITE (owner, note-b93ad16c18a5), which is this iteration's authoring-time half stated as a rule. Two pieces already exist: item templates declare checks and conformance runs them, but at submit and at the gate; and the write path already lints and formats covered files, so the hook point is there. THE SKELETON MINT STAYS LEGAL - the check must distinguish unanswered from wrong, as conformance already does.

## Overhaul input (2026-08-20)

The overhaul found the second frontmatter parser this record exists to
retire, with a measured divergence. Evidence in
spec/overhauls/2026-08-20/findings.md, engine-core section.

- stateform's nodeField/nodeList hand-parse frontmatter beside notes.ts's
  real YAML parse; on a CRLF file the fence detection fails and the
  FRONTMATTER-ONLY guard silently turns off. The corpus is all-LF today,
  so the divergence is latent, on a Windows repo.
- Seven rows write weighs_with as a scalar (including the literal none),
  which mergeEqualities turns into an equality judgment against a
  phantom node — i40 guards the crash path; the typed-field refusal that
  makes the shape unwritable is this record's work.
