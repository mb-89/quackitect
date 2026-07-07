---
id: cand-impl-code
type: candidate
axis: implements-lane
ratings:
  trust: 0.9
  dry: 1
  churn: 1
statement: implements stays code-declared; the adjacency view derives it at read time.
class: review
killer: false
---
Pro: designs live in code (standing rule); code regions already hash; zero migration risk; DRY holds by deriving the VIEW, never materializing files. Con: the connections home is not the whole story - acknowledged in the adjacency determinizer, which merges the code-derived edges so no view lies. (Trust red-team verdict, 2026-07-06.)
