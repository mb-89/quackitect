---
form: author-tests
by: agent
signed_off: 2026-08-12T21:38:45.908Z
authors: agent
files:
---

# Evidence form / author-tests

## current_situation

M7 author-tests: the delta's four requirements all carry verify_method: test. tests/sehelp.test.ts already existed from earlier this session (five cases); one test-spec node authored to carry the trace edge.

## checks

- tsp-help-search — one test-spec verifying all four new requirements (req-help-searches-tools-and-guidance, req-help-miss-is-logged, req-help-demand-ranked, req-help-query-logged-with-result), method: test, realized by tests/sehelp.test.ts (already written this session, five cases: name/description match ranks first, guidance-statement match surfaces it, a miss logs and demands rank by shape, the no-query-no-demands refusal, and the standard call-log visibility).

## follow_up

build-steps next — the code (engine/help.ts) already exists; what remains is the standing types/lint/tests debt carried through every gate since M1.

## anything_else

## register

- req-help-searches-tools-and-guidance
- req-help-miss-is-logged
- req-help-demand-ranked
- req-help-query-logged-with-result

## set_criteria

- complete: uc-find-the-right-lane-tool's four steps and its 2a/3a/4a extensions are each covered by one of the four requirements; step 4 is the agent's own act and needs no row
- consistent: no two rows conflict; match/miss used the same way throughout
- affordable: four small requirements, one new MCP tool, one JSONL log — inside a minor iteration
- bounded: every row traces to uc-find-the-right-lane-tool; the introspection verb and missing-capability enumeration stay out (see left_out)
- comprehensible: search ranks matches, a miss gets logged, the log ranks by demand, every call is auditable
- no_tbd: swept all four requirement files and this form; zero TBD/TBC/TBR/???
