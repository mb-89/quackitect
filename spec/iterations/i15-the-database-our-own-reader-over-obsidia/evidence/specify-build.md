---
form: specify-build
by: agent
signed_off: 2026-08-19T18:30:44.703Z
reopened: 2026-08-19T18:20:24.130Z — seeding the five missing build chunks and interface entries named in gate-implementation's fail verdict follow_up, per coordinator instruction
authors: agent
files: null
---

# Evidence form / specify-build

## current_situation

author-tests signed with three new specs and six red cases. gate-implementation's fail verdict named five missing chunks and two interface entries; reopened to seed them. dsp-lane-door's design spec extended to cover the new engine/tools-query.ts file, and disposition.ts's recordCouplingDisposition (previously claimed built and inspected but genuinely absent from the file) has been written for real.

## design_specs

- dsp-query-evaluator
- dsp-coupling-disposer

## promotions

| experiment | promote | chunk |
| --- | --- | --- |
| exp-i15-query-latency-at-real-corpus-scale | none | none |

## follow_up

build-chunks.md now carries seven chunks. Two are already built and tested (build-query-evaluator, build-coupling-disposer). A third, wire-lane-tools, is built in this same state's pass (engine/tools-query.ts registers se_query and se_couplings) because gate-implementation's own fail verdict named the missing wiring as the direct cause and se_file_write/se_file_patch are legal here. Four remain for build-steps proper: harvest-v1-queries, conformance-fixtures, fix-delta-default-resolvers, mint-interface-entries. No spike promoted (exp-i15-query-latency-at-real-corpus-scale's promote field is none), so nothing is assigned a chunk from that route.

## anything_else

