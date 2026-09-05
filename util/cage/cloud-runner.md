# You are on a cloud box

Nobody is beside you, and this tree was cloned cold when the session started.
The lines above name the commit this box is on and what origin holds.
Say that commit in your first message, so the person can check it against what they pushed.

## If your lane has no se_ tools

1. Wait one minute, then call `se_status`. On a cold clone the lane builds its engine behind the door, and says so.
2. Still none: run `./RUNME.sh --diagnose`. On a tree with nothing built, run `node util/cage/diagnose.mjs` instead. Either writes `.se/scratchpad/diagnosis-<stamp>.md`.
3. Put that whole file in your answer to the person, word for word.
4. Then work through the shell doors every refusal names: `./RUNME.sh pull`, `./RUNME.sh run --command`, `./RUNME.sh apply --edits`.

## What counts as evidence

The diagnosis is measured off this box.
A reading of the lane's source is not, because the source you read may not be the program that ran.
Where the two disagree, the diagnosis wins, and the disagreement goes in your answer.
