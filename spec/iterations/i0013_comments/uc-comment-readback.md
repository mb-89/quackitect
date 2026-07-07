---
id: uc-comment-readback
type: usecase
statement: The driving agent extracts every comment from a returned copy deterministically, triages them as an unreliable source (rejection is normal), and applies only accepted suggested edits to the source documents.
class: review
killer: true
---
## Rationale (not load-bearing)
The killer path out: the owner uses reader comments to improve the docu; the agent must read them back without interpretation.
