---
id: adr-slack-text-poll
type: adr
adjudicated_by: user
statement: The Slack adapter answers by text-reply polling, not Socket Mode.
class: review
killer: false
---
## Rationale (not load-bearing)
Pugh (datum = socket-mode, the strongest rival): text-poll 3.29 vs socket 2.58 weighted - it wins zero-dep (plain HTTP vs ~400 lines RFC6455), build-effort, and corporate-seam (the polling pattern IS the OneDrive-sink twin); it loses one-tap (typed option id) and some auth. Sensitivity REVERSED: socket wins only when one-tap outweighs zero-dep about two-to-one - credible exactly if typed answers prove unacceptable in the field. TRIPWIRE recorded: if the M5 spike or field use shows the typed-answer UX failing the adjudicator, socket-mode re-enters as datum. Consequences: answers are text (option id or n plus comment); the adapter stays ~150 lines.
