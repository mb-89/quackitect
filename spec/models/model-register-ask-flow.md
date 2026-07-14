---
id: model-register-ask-flow
type: model
kind: sequence
statement: how does a register answer travel - who talks to whom from tap to recolor, on desk and phone alike?
class: review
killer: false
---
```mermaid
sequenceDiagram
  participant owner-desk
  participant owner-phone
  participant go-register-render
  participant go-register-answer
  participant go-ask-core
  participant go-provenance-block
  participant go-register-colors
  owner-desk->>go-register-render: tap red row
  go-register-render->>go-register-render: killer row? pager pointer only, STOP
  go-register-render->>owner-desk: inline questionnaire (options from the ask)
  owner-desk->>go-register-answer: answer (watch server; static mode emits the console command)
  owner-phone->>go-ask-core: ntfy answer (same ask, first answer wins)
  go-register-answer->>go-ask-core: dispatch as validated answer
  go-ask-core->>go-ask-core: record actor and channel
  go-ask-core->>go-provenance-block: stamp the field's provenance from the ruling
  go-provenance-block->>go-register-colors: provenance changed
  go-register-colors->>go-register-render: recompute row color
  go-register-render->>owner-desk: row green (user-adjudicated mark)
```
## Rationale (not load-bearing)
The register seed's unification demand drawn as the ONE answer path: the desk lane and the
i15 phone lane converge on the same ask store (go-first-wins-lanes rules a race). The
killer-guard is the sequence's first branch by design - a killer row never grows a
questionnaire (adr-register-watch-answers, req-register-killer-guard). Colors move only
because provenance moved (adr-provenance-in-node, req-register-colors).
