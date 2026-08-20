---
form: find_analogy
by: agent
signed_off: 2026-08-19T11:20:44.640Z
authors: agent
files:
---

# Evidence form / find_analogy

## current_situation

Prior art, benchmarking and contradiction findings are recorded. This is the analogy finder, run over the same touched clusters.

## applies

yes

## abstractions

| cluster | abstract_problem | domains |
| --- | --- | --- |
| cluster-the-walk (hold-the-session-through-work) | keeping a running unit of work alive until it reaches a safe stopping point, when something outside wants it to end now | container orchestration, industrial safety, aviation holding patterns |
| cluster-the-walk (name-the-stopping-layer) | telling apart several possible causes of one observed failure, when each sits at a different layer of a stack | network fault isolation, medicine, aviation incident investigation |
| cluster-the-arrival (identify-the-harness) | identifying who is connecting before deciding how to serve them | USB/plug-and-play device enumeration, HTTP content negotiation |
| cluster-the-walk (route-a-failure-shape) | recognising a repeated shape among many individual events and turning it into one actionable unit | epidemiology, statistical process control, SRE incident management |

## options

- opt-graceful-shutdown-drain-before-terminate
- opt-layered-fault-isolation-report

## follow_up

The without/trimming, heuristic and transform finders, plus probing, run next.

## anything_else

