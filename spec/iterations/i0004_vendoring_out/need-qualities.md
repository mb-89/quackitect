---
id: need-qualities
type: need
statement: The system exhibits cross-cutting QUALITY attributes (NFRs) that no single functional use-case owns — they constrain the whole. This need is the home for those qualities: first the brand design-language (voice, logos, palette, typography), and, as they migrate here, responsiveness, determinism, and the like.
class: judgment
killer: true
---
## Rationale (not load-bearing)
NFRs / quality-attributes are cross-cutting; they do not refine a functional need cleanly. Gathering them under one "qualities" need keeps the trace honest. Design + voice are the first residents; existing NFRs (e.g. responsiveness) can migrate here in a later pass without churning their origin iteration.
