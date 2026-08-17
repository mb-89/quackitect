---
form: find_by_heuristic
by: agent
signed_off: 2026-08-16T17:53:01.593Z
authors: agent
files:
---

# Evidence form / find_by_heuristic

## current_situation

find_without closed. This is the heuristics-catalogue finder, run whole against both new clusters.

## applies

yes

## sweep

| cluster | heuristic | suggests |
| --- | --- | --- |
| cluster-the-query | Group what changes together; separate what changes apart | nothing — the four kinds are already grouped by node type |
| cluster-the-query | Make the common case cheap; make the rare case possible | opt-precompiled-fast-path-explicit-slow-path-extension |
| cluster-the-query | One source of truth; everything else derives | nothing new — constrains other options (any index must derive from the corpus files, never diverge) rather than naming a fresh mechanism |
| cluster-the-query | Push decisions to the last responsible moment | nothing — already scope-non-goals' own rule: extend the subset only when a harvested query needs it |
| cluster-the-query | Make the illegal unrepresentable, not merely checked | opt-closed-field-grammar-makes-unknown-fields-unparseable |
| cluster-the-query | Small interfaces between big parts beat the reverse | nothing new — constrains the MCP surface shape, not which internal option wins |
| cluster-the-query | If it must be remembered, it must be recorded | nothing — a pure read has nothing to remember |
| cluster-the-query | The default should be the safe thing | nothing new — already required by req-query-refuses-unknown-field / req-query-empty-result-explicit |
| cluster-the-disposition | Group what changes together; separate what changes apart | nothing — already confirmed at partition-functions, both functions share cluster-the-disposition |
| cluster-the-disposition | Make the common case cheap; make the rare case possible | opt-hard-cap-ranked-list-length |
| cluster-the-disposition | One source of truth; everything else derives | nothing new — constrains disposition state to live in one place, not a fresh mechanism |
| cluster-the-disposition | Push decisions to the last responsible moment | nothing — confirms the existing rank/record split, ranking early is fine, disposing waits for review |
| cluster-the-disposition | Make the illegal unrepresentable, not merely checked | opt-prepopulate-pending-disposition-rows |
| cluster-the-disposition | Small interfaces between big parts beat the reverse | nothing new — confirms the single flow-candidate-list edge already on the DSM |
| cluster-the-disposition | If it must be remembered, it must be recorded | nothing new — disposition already is the remembering mechanism |
| cluster-the-disposition | The default should be the safe thing | nothing new — reinforces opt-prepopulate-pending-disposition-rows rather than a separate option |

## options

- project/spec/trace/option/opt-precompiled-fast-path-explicit-slow-path-extension.md
- project/spec/trace/option/opt-closed-field-grammar-makes-unknown-fields-unparseable.md
- project/spec/trace/option/opt-hard-cap-ranked-list-length.md
- project/spec/trace/option/opt-prepopulate-pending-disposition-rows.md

## follow_up

Sixteen rows run (8 heuristics × 2 clusters), 4 bit and minted options, 12 confirmed existing decisions without a fresh mechanism. Next finder in the sequence, then enumerate-space joins everything into the morphological chart.

## anything_else

