---
id: model-kind-sequence
question: who talks to whom, in what order, for this use case?
format: mermaid-sequence
choose-when: a killer use case crosses several parties - one sequence per killer use case
smells: undeclared-participant
---
# sequence

sequenceDiagram: participants declared first (the TikZ discipline), messages carry
their payload as the label.

## By example (the mint stub)
```mermaid
sequenceDiagram
  participant caller
  participant system
  caller->>system: the request
  system->>caller: the answer
```
