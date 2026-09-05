# YOU ARE ON A CLOUD BOX

This card is handed to a cloud session only, by the wake, at session start.
A session on a desk never receives it, and none of it is addressed to one.
For which box you are on, run `node util/cage/host.mjs --say`.

Nobody sits beside you here.
This tree was cloned when the session began, and `.bin` was not in it.
Nothing you write survives except what you push.

## Actionables

1. Say the commit above in your first message, and whether it matches origin. *
2. Call `se_start` first. It builds the engine if this tree carries none, and starts it. *
3. Nothing refuses you until an engine is up, so work with the harness's own tools until then. *
4. Say whether you hold the `se_` tools, by name, or say you hold none. *
5. Measure this box before you explain it. `./RUNME.sh --diagnose` writes the measurement. *
6. Put a diagnosis in your answer whole, as it was written. *
7. Never pipe into the engine. The flags `--command` and `--edits` carry the payload. *
8. Push what you want kept. A finding that stays on this box dies with it. *
9. Answer the person in the chat. `se_answer` is the record's copy, and they do not read the record. *
10. Turn your notes into tracked tokens. A note is private, and private does not leave this box. *

## Discussion

### 1. The commit

The wake printed the commit and what origin holds, above this card.
A cloud box clones the branch tip as it stood when the session was made.
A person who pushed a minute later has a box that is behind and says it is current.
Two sessions were asked whether they were up to date, said yes, and were wrong.
So the box says the commit and the person checks it, rather than the agent judging.

### 2. Start the engine, then follow the rest

This tree was cloned with nothing built, so there is no engine here until you start one.
`se_start` builds it and starts it, and it is safe to call twice.
The first build compiles SQLite and takes a few minutes, once.
It answers at once and says which it did, rather than waiting.
`.se/lane.out` says how far the build has got.

### 3. Nothing is refusing you

Every guard this project has lives in the engine, and the engine is not here yet.
The hooks that can refuse a call are written by the engine when it starts, so a box with no engine carries none of them.
Sessions before you read the standing rules, held no `se_apply` and no `se_run`, and concluded they could do nothing.
Nothing had refused them.
Use Write, Edit and Bash until an engine answers, then use the lane.

### 10. A note dies here, and a token does not

A note is private by what it is: nobody has decided about it yet, so it lives under `.se`, which nothing pushes.
On a desk that is right, because the disk outlives the session.
Here the container is reclaimed and every note in it goes with it.
So the engine counts them, and at twenty it holds your work until they are turned in.
Each note has three answers.
Drop it where it is useless.
Mint a tracked token from it where it is work.
Where the answer is not yours, mint one carrying your best attempt and set `needs_human` on it.
A note that became a token or was dropped stops counting, and the work goes through again.

### 9. The chat is where they read you

The rules say to answer the person with `se_answer`, and a cloud session did exactly that.
Every answer went into the record, and the person read none of them.
On a cloud box the record is not shown to them, and the chat is.
The owner said so in September 2026: answer me in the chat, or I do not see it.
So the answer goes to the chat first, whole, and `se_answer` carries the copy the record needs.

### 5. Measure, then explain

A session read the tool lane's source and explained a failure with the code of an older build.
The fix that report asked for was already in the tree it was running.
A whole attempt was spent on it, and the real fault stayed.
The source you read may not be the program that ran, and on a cold clone it usually is not.
`./RUNME.sh --diagnose` asks this box instead: the commit, the built programs against their source, the engine, the lane's log and the network.
On a tree with nothing built, `node util/cage/diagnose.mjs` is the same call.
Where your reading and the diagnosis disagree, the diagnosis stands and you say both.

### 4. A lane that is late is not a lane that is gone

The tool lane answers its handshake and its tool list at once, from a snapshot.
The engine behind it is built while you work, and the first build compiles SQLite.
So a call can answer `THE ENGINE IS STILL BEING BUILT`, which is the door working.
`.se/lane.out` says how far that build has got.

### 7. The doors that need no lane

The write gate refuses the harness's own Write, Edit and Bash, and lets the engine through.
These are the same calls a lane makes, and they work with nothing built:

    ./RUNME.sh pull --actor <name> --role worker
    ./RUNME.sh run --on <id> --by <name> --command 'go test ./...'
    ./RUNME.sh apply --on <id> --by <name> --edits '[{"file":"a.go","old":"x","new":"y"}]'
    ./RUNME.sh --answer "..."

A pipe takes a command out of the gate's exception, so a piped engine call is refused.
Each verb has a flag that carries what a pipe used to.
