---
form: sweep-consistency
by: agent
signed_off: 2026-08-15T20:19:45.989Z
authors: agent
files:
---

# Evidence form / sweep-consistency

## current_situation

The sweep was run by search, not by memory. Two live surfaces were teaching something the iteration had made false, and both are fixed.

WHAT i28 CHANGED THAT IS TAUGHT SOMEWHERE.

- A new command, `se-start.ts`, with four flags and seven steps.
- The runtime pin, from `>=22.6` to `>=24.0.0`.
- A measurement, retracted: the start step holds its caller for 74 ms, not 45,600 ms.
- The adopt step now takes a real claim, so a second machine is refused.

WHAT THE SWEEP FOUND WRONG.

- The VS Code extension told users "needs Node 22.6 or newer" against a pin of `>=24.0.0`. It is a served string, seen by a person, and it was wrong in both the source and the built copy.
- `project/spec/cloud-agent-handover.md` taught 22.6 as the floor in its setup section.
- Three trace nodes still carried the retracted measurement as live fact: the test spec, the POSIX-branch experiment, and the runtime assumption's probe.

WHAT WAS DELIBERATELY NOT TOUCHED. This iteration's own signed evidence still records 45,600 ms. Those forms are the dated account of what was believed when they were signed, and rewriting them would destroy the record rather than correct it. The retraction lives in the experiment node, which carries both numbers and the diagnosis.

ONE CLASS HOLDS NO DOCUMENTS. There is no book yet; i20 is the seeded iteration that emits it.

## swept

- [x] command and tool docs
- [x] engine-served strings
- [x] method cards
- [x] matrix rows
- [x] templates and skeletons
- [x] guidance chapters
- [x] book chapters
- [x] README and entry documents
- [x] panels and form help

## follow_up

NOTHING NEW IS OWED BY THIS SWEEP. What it found, it fixed.

ONE THING WORTH CARRYING TO THE RETRO, and it is already noted. A retracted measurement had reached six documents before anything caught it, and only a search found them all. note-e0b6769a3a5a already argues for typed links so a mechanism's mentions are computable instead of grepped. This sweep is a second instance of that argument.

THE STANDING NOTES ARE UNCHANGED by this state. They are listed in gate-implementation's follow-up and in `.se/HANDOVER.md`.

## anything_else

HOW EACH CLASS WAS ACTUALLY SWEPT, so a reader can repeat it rather than trust it.

COMMAND AND TOOL DOCS. Searched the whole project for `se-start`. Twenty-one hits. The two that TEACH the command are the entrypoint's own usage line and the cloud-runner card, and both now show `--repo`, `--iteration`, `--mirror-port` and `--agent`. Neither shows `--root`, which this iteration cut. The rest are evidence and tests.

ENGINE-SERVED STRINGS. Searched for the old pin. `vscode/src/extension.ts` line 338 and `vscode/extension.js` line 307 both carried it in a message shown to a person. Fixed in both, and the comment at line 119 with them.

METHOD CARDS. `cloud-runner.md` is the only one added. Voice lint returns 0 findings on it. It is reachable two ways: `applies_to: [boot, front_desk]`, which `engine/pull.ts` line 177 matches against the state id, and the launch step, which refuses to start an agent if the card is missing.

MATRIX ROWS, TEMPLATES AND SKELETONS, PANELS AND FORM HELP. i28 changed none of them. No row, template, skeleton, panel or field help was added or altered.

GUIDANCE CHAPTERS. `cloud-agent-handover.md` taught 22.6 and now teaches 24, with a sentence saying what the old number actually bought and why it was not enough.

BOOK CHAPTERS. Globbed for one and found none. The class is empty until i20 runs.

README AND ENTRY DOCUMENTS. Searched for a node version and for the entrypoint. The README teaches neither, so there was nothing to bring current.

WHAT THE SEARCH DELIBERATELY LEFT ALONE. `project/spec/cloud-first-run-field-report.md` records a past run and its observations, including the old floor being honest at the time. A field report is a dated observation. Editing it would be rewriting what somebody saw.
