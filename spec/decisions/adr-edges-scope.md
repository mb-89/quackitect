---
id: adr-edges-scope
decided_in: i0012_spec_book
type: adr
kind: architecture
adjudicated_by: user
statement: The migration covers the semantic edges - verifies, refines, addresses, refers, chosen, rejected, supersedes. implements stays code-declared (designs live in code; regions already hash) and merges into adjacency views at read time. Task wiring - depends_on and parent - stays frontmatter this iteration; joining later is a cheap jsonl move if a need appears.
class: review
killer: false
---
## Rationale (not load-bearing)
Red-team verdicts 2026-07-06, owner-ratified. Deriving implements files from code markers is silent-drift-shaped (stale generated files, orphan connections bricking the strict guard, read commands writing the workspace) - the exact failure class the engine exists to kill. Task wiring is walk machinery, not book content; nothing reads it as a relation a human follows. The honest story: one system FOR SEMANTIC RELATIONS, three sources acknowledged and merged by the determinizer.
