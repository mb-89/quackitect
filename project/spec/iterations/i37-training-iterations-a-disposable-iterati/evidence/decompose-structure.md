---
form: decompose-structure
by: agent
signed_off: 2026-08-19T18:59:45.309Z
authors: agent
files:
---

# Evidence form / decompose-structure

## current_situation

i37 stands at decompose-structure. record-adrs is signed with five decisions.

Three elements carry the winner's eight functions. The split follows lifetime rather than subject: the binding is the run's whole life, the guard exists only while it stands, and the report is what survives it.

ONE QUESTION DEFERRED THREE TIMES IS SETTLED HERE, because this is the last state that could take it without the architecture inventing it silently: how a run is reached.

## elements

- [[el-benchmark-binding]]
- [[el-benchmark-guard]]
- [[el-benchmark-report]]

## allocation

| fn-the-benchmark-run.choose-the-iteration-to-re-walk | el-benchmark-binding | same element — no crossing |
| fn-the-benchmark-run.locate-the-rewind-point | el-benchmark-binding | same element — no crossing |
| fn-the-benchmark-run.stand-a-throwaway-tree-and-bind-the-run | el-benchmark-binding | same element — no crossing |
| fn-the-benchmark-run.refuse-what-the-rewind-point-cannot-reach | el-benchmark-guard | if-benchmark-binding-to-guard — the binding hands the guard its rewind commit and its lifetime |
| fn-the-benchmark-run.conceal-the-benchmark-history-for-the-length-of-a-run | el-benchmark-guard | if-benchmark-binding-to-guard — same crossing, same handover |
| fn-the-benchmark-run.derive-what-the-walk-cost | el-benchmark-report | if-benchmark-binding-to-report — the report reads the call log for the binding's window |
| fn-the-benchmark-run.state-the-conditions-of-the-run | el-benchmark-report | if-benchmark-binding-to-report — the three unrecoverable conditions are written at bind time and read here |
| fn-the-benchmark-run.fill-the-report-and-say-where-the-run-stopped | el-benchmark-report | same element — no crossing |

## follow_up

- evaluate-architecture is next, then gate-architecture closes M5.
- TWO CROSSINGS NEED INTERFACE NODES and neither exists yet: binding to guard, and binding to report. evaluate-architecture is where their bounds are stated.
- EL-BENCHMARK-GUARD CARRIES BOTH OPEN DEPENDENCIES. `merge-base` is not on `se_git`'s allowlist, and the visibility drift is a standing work token. Neither is a design question now; both are build work with a named shape.
- NOTHING IS ALLOCATED TWICE and nothing is unallocated. Eight functions, three elements, and every boundary-crossing cell names its interface.

## anything_else

HOW A RUN IS REACHED IS SETTLED: A LANE VERB.

It was named at gate-inputs, again at gate-requirements, and again at gate-candidates, and deferred each time. Deferring it past here would have meant the architecture answered it by accident.

THE TWO ALTERNATIVES AND WHY THEY LOST.

- A DESK DOOR. Rejected because the desk recommends a vehicle for work and a benchmark run is not one. It would sit in the same list as expeditions and iterations and invite the question of which one to open, which is exactly the confusion the front-desk method warns about.
- NOTHING AT ALL, with a run implied by entering a rewound tree. Rejected because binding is an act that can REFUSE — the guard is exercised before the run opens — and a refusal needs a caller it can reach.

SO `se_benchmark {iteration?, stop_at?}` OPENS A RUN and `se_benchmark {stop: true}` ENDS ONE. One verb, because a run has one lifetime.

THE SPLIT INTO THREE ELEMENTS IS BY LIFETIME AND NOT BY SUBJECT, which is worth saying because a subject split would have looked more natural.

- The binding IS the lifetime.
- The guard exists only inside it and its two refusals are both properties of that lifetime rather than of any path.
- The report is the only thing that outlives it.

A SUBJECT SPLIT would have put the ceiling with the rewind — both are about git — and the concealment with the report — both are about the benchmarks folder. That would have cut the guard in half and given two elements a shared failure mode across a boundary, which is the seam partition-functions already argued against.
