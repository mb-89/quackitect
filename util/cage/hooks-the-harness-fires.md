# Which hook events each harness fires

The two settings files beside this one register hook events. This is what the
record says about them, so a reader can tell what the cage asks for from what a
harness was seen to send.

The table is the spike's, carried here because the note it was written on was
private to the box that ran it and no clone can open that. The counts came from
`.se/log` and `.se/retro/*/log`, joined to a harness by the `entrypoint` field
in the Claude transcripts. That is the whole method there is, and it is not
enough to reproduce a number. `wk-977319bccb` carries that gap.

## The three marks

A number is record lines, so the event fires under that harness.

A dash is silent. The harness was driven, the record was open, and no line
arrived where one would have been written.

A question mark is not measured. Nothing could have been recorded there: the
record was not open, or the harness was never driven, or the moment the event
names never came.

Silent and not measured were one mark before, and that is what this file is
for. The rule that struck an event from the cage reads this table, and an event
silent everywhere is one no harness sends. An unmeasured cell says nothing
about any harness, and drawn as a dash it argued for striking a line nobody had
ever watched.

|event|cli 2.1.258|editor 2.1.206 and 2.1.259|desktop Code tab|copilot|
|---|---|---|---|---|
|PreToolUse|94|530|?|?|
|PostToolUse|635|9581|?|?|
|PostToolUseFailure|7|30|?|?|
|UserPromptSubmit|41|90|?|?|
|SessionStart|?|16|?|?|
|SessionEnd|1|13|?|?|
|SubagentStart|7|82|?|?|
|SubagentStop|119|73|?|?|
|Stop|28|44|?|?|
|StopFailure|?|32|?|?|
|Notification|10|6|?|?|
|ConfigChange|?|4|?|?|
|PreCompact|?|?|?|?|
|PostCompact|?|?|?|?|

## Why a cell is not measured

The engine log opened after that command line session had started, so the
moment SessionStart names had already passed. No stop failed and no settings
change happened while that log was open, so StopFailure and ConfigChange had
nothing to write either.

No session in the record has compacted, under any harness. So neither compact
event has been in a position to fire.

The desktop Code tab is one of the three harnesses the spike set out to answer
for, and it never appears in the record at all. It was never driven, so its
column says nothing about it.

Copilot is registered no hooks at all, here or anywhere. Nothing could arrive
from it, which is a cage that asks for nothing rather than a harness that sends
nothing.

## What this table does not settle

No cell in it is silent. Twelve of the fourteen events were seen to arrive
under the editor and nine of those under the command line, and every other cell
is a cell nothing could have been recorded in.

So nothing here proves an event that no harness sends. PostCompact is struck
from the cage all the same, because a SessionStart whose source is compact is
the same moment. That is an argument about what the two events mean, and not a
count.
