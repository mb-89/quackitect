---
form: trace-design
by: agent
signed_off: 2026-08-21T11:43:27.455Z
authors: agent
files:
---

# Evidence form / trace-design

## current_situation

The design register drew EMPTY on the first pull, with 41 design specs standing on disk. Two defects were behind it, and both are fixed here.

THE FIRST WAS THE OWNER KEY. Every node this record minted carried `minted_in: i51`. The engine matches that against the record's own id, which is the folder name `i51-work-running-out-of-sight-reports-itself`. Nothing matched, so every typed register in this record has been drawing empty since M3. All 60 nodes now carry the full id, which is the convention every record since i15 uses.

THE SECOND WAS A PHANTOM FILE. [[dsp-the-work-account]] named `deliverable/engine/workregistry.ts` in its `files:`. That file does not exist. The work account was built into `deliverable/engine/run.ts`, beside the shell jobs it already merges. The spec now names the file the code is actually in.

With both corrected the register draws one row, and every file it names exists.

## design_trace

| design-spec | realizes | files |
| --- | --- | --- |
| [[dsp-the-work-account]] | el-work-registry · if-test-runner-to-work-registry · if-walk-engine-to-work-registry · if-work-registry-to-walk-engine | deliverable/engine/run.ts · deliverable/engine/tools-run.ts · deliverable/engine/sessionscript.ts · deliverable/engine/session.ts |

## follow_up

- VERIFICATION IS NEXT, and the full battery runs there. It is the first run since the owner key changed on 60 nodes, so it is also the check on that correction.
- THE OWNER KEY DEFECT IS WORTH A GUARD. Nothing refused a `minted_in` naming no record, and the only symptom was a register quietly drawing empty. A check that every `minted_in` names a record folder that exists would have caught it at M3 rather than M7.
- THE PHANTOM FILE IS THE SAME SHAPE. The file-existence law is written down at this state, and it is the state that found it. Earlier would be better, at specify-build, where the spec's `files:` is authored.

## anything_else

BOTH DEFECTS SHARE ONE CAUSE: a field authored by hand that nothing checks until much later. The register is not wrong about the corpus; it was right about what it was asked, and what it was asked was wrong.
