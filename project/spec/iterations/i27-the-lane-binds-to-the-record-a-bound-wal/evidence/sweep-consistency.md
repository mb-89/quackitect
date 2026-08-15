---
form: sweep-consistency
by: agent
signed_off: 2026-08-14T19:27:05.553Z
authors: agent
files:
---

# Evidence form / sweep-consistency

## current_situation

The sweep found four teaching surfaces carrying behaviour this iteration removed. All four are fixed.

TWO METHOD SURFACES STILL TAUGHT SE-C-134 AS LIVE. The matrix row M9_20_package told an agent to make a method change unbound. meth-emit-back carried a whole section titled "The record cannot write the method", plus an instruction to escape to the desk for a small edit. Both now teach the resolution that replaced the clause: shared method resolves to the machine root from any bound tree, so the write lands where you stand.

THE TRACE LAYER STILL SAID `rebase` WHERE THE CODE SAYS `reconcile`. Eight files across element, design-spec, interface and test-spec. SE-C-002 refuses that git verb outright, so the design record was telling a builder to do something the lane rejects. dsp-claim-lane was the sharpest case: it read "reconcile is a rebase", and its own statement promised rebase-and-retry on a lost race.

THE COMMAND AND TOOL DOCS NEEDED NOTHING. There is ONE help text, in se-mcp.ts, and RUNME renders it by shelling out to that file. Running it proves --mode is in it with all three transports and their costs.

TWO DEFECTS SURFACED THAT WERE NOT DOCUMENTATION AT ALL. Both were fixed rather than recorded:

- The packet reported the STORED run mode as though it were the running one. --mode decides one run and deliberately does not overwrite storage, so the packet lied exactly when the flag was used. The session now carries what the launch actually got. The packet says `mode` for what is running and `stored` for what the next launch takes.
- The mirror had no way to store a mode. writeMode had no caller at all, while the help promised "what the mirror last stored". POST /mode now stores the choice and says which launch applies it.

## swept

- [x] command and tool docs
- [x] engine-served strings (grep the engine for the changed vocabulary - the
- [x] method cards
- [x] matrix rows
- [x] templates and skeletons
- [x] guidance chapters
- [x] book chapters
- [x] README and entry documents
- [x] panels and form help

## follow_up

- The mirror's run-mode control is a ROUTE with no widget. POST /mode works, and /api/levels serves the three modes with their help so a host needs no copy of the list. Nothing draws it yet, in the mirror or in the VS Code webview.
- A `choice` in the panel spec does not post on change. The only existing one, note_priority, is read when the note is captured. Declaring a mode row today would draw a control that does nothing.
- The raid entries about the engine delta still say `rebase`. They are risk records, and one is quoted verbatim in signed evidence. Changing them would break that citation and buy nothing.

## anything_else

WHAT WAS NOT SWEPT, AND WHY.

Historical records keep their original wording. That covers the cloud field report, the decisions log, this iteration's own signed evidence, and the candidate and option nodes that recorded design alternatives. They describe what was true when written. Rewriting them would destroy the record rather than update it.

THE VS CODE BUTTON IS NOT BUILT.

The owner's settled instruction was the launch argument, and that part is complete. --mode reaches every host through RUNME's SE_ARGS, it stands in the one help text, and a bad value stops the launch rather than falling back. The UI toggle was offered as an extra. Its engine half is done and its widget is not.

TESTS.

mode.test.ts passes 15 of 15, including five new cases for the running-versus-stored split and the mirror's control. The five packet-reading suites pass 59 of 59, so the added field broke no reader.
