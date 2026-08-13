---
form: author-tests
by: agent
signed_off: 2026-08-13T10:51:05.186Z
reopened: "2026-08-13T10:50:32.151Z — sty-ask-the-lane-what-it-can-do's Deck evidence halves are empty, another gate-validation law gap to fix"
authors: agent
files:
---

# Evidence form / author-tests

## current_situation

M7 author-tests: the delta's four requirements all carry verify_method: test. tests/sehelp.test.ts already existed from earlier this session (five cases); one test-spec node authored to carry the trace edge.

## checks

- tsp-help-search — one test-spec verifying all four new requirements (req-help-searches-tools-and-guidance, req-help-miss-is-logged, req-help-demand-ranked, req-help-query-logged-with-result), method: test, realized by tests/sehelp.test.ts (already written this session, five cases: name/description match ranks first, guidance-statement match surfaces it, a miss logs and demands rank by shape, the no-query-no-demands refusal, and the standard call-log visibility).
- tsp-lane-help-run — the demonstration-method test-spec carrying demonstrates: sty-ask-the-lane-what-it-can-do (must), the edge gate-validation's law requires; mechanics ride the same tests/sehelp.test.ts and tsp-help-search, reconfirmed live by the full battery (job test-msrcohsf-11). Minted after the M7 pass to close a gap found at gate-validation. The story's own Deck evidence halves were filled in the same pass.

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
