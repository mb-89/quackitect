---
form: write-requirements
by: agent
signed_off: 2026-08-19T10:41:36.411Z
authors: agent
files:
---

# Evidence form / write-requirements

## current_situation

Gate-inputs is signed and the resident use-case set holds three genuine journeys plus fixed ISO quality use cases. Six quality requirements already existed from earlier passes in this walk. Checking coverage both directions found uc-route-failed-calls-into-improvement had zero covering requirements, so this pass authored req-repeated-failure-shape-becomes-durable-work to close that hole.

## register

- req-boot-needs-no-manual-test-metadata-repair
- req-interrupted-call-names-the-stopping-layer
- req-native-project-tools-stay-outside-the-cage
- req-oversized-results-remain-recoverable-through-the-lane
- req-stop-hook-yields-only-at-a-machine-stop
- req-supported-harness-serves-one-lane-contract
- req-repeated-failure-shape-becomes-durable-work

## set_criteria

- complete: the three i36 journeys are each covered; uc-arrive-on-an-unattended-machine and uc-research-and-record-an-answer already carry requirements from i35 and i1, and uc-route-failed-calls-into-improvement now carries req-repeated-failure-shape-becomes-durable-work. The five ISO quality characteristics touched by this iteration's scope (reliability, security, performance-efficiency, compatibility) each carry a requirement. Nothing in scope is left uncovered.
- consistent: no two of the seven rows conflict. Shared terms (harness, lane, stop hook, cage, iteration window) are used the same way across all seven and match their existing definitions in project/spec/trace/neighbour and the boot guidance.
- affordable: seven rows, one newly authored here and six drafted earlier in this walk, each maps to one of the five prepared breaks or one of the live findings named in scope-non-goals.md. Nothing demands instrumentation beyond what that scope already committed to.
- bounded: every row sits inside the i36 scope statement. None touches iteration 23's HTML mirror decision or the expedition-archive-visibility backlog token, both named as non-goals. None asks for more than its own breaks_if_removed names.
- comprehensible: a reader with no i36 context can read the seven statements and say what the system must do: identify the harness, cap served payloads to measured limits, keep native tools outside the cage, avoid manual test-metadata repair at boot, name the stopping layer on an interrupted call, block a premature stop, and turn a repeated failure shape into durable work.
- no_tbd: a search of all seven i36-minted requirement files for TBD, TBC, TBR and ??? found zero matches.
- behaviour_modelled: none of the seven rows wanted a behaviour model. Each states one stimulus and one response; none describes an ordered multi-party exchange, a thing with states, or a create-use-retire lifecycle. None here wanted one.

## follow_up

Derive the solution-neutral function structure from these requirements (derive-functions) and sweep them for leaned-on assumptions (identify-assumptions).

## anything_else

