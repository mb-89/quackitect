# YOU ARE ON A CLOUD BOX

This card is handed to a cloud session only, by the wake, at session start.
A session on a desk never receives it, and none of it is addressed to one.
For which box you are on, run `node util/cage/host.mjs --say`.

Nobody sits beside you here.
This tree was cloned when the session began, and `.bin` was not in it.
Nothing you write survives except what you push.

## Actionables

1. Say the commit above in your first message, and whether it matches origin. *
2. Say whether you hold the `se_` tools, by name, or say you hold none. *
3. Measure this box before you explain it. `./RUNME.sh --diagnose` writes the measurement. *
4. Hold no lane? Wait a minute, call `se_status` again, and only then diagnose. *
5. Put a diagnosis in your answer whole, as it was written. *
6. Never pipe into the engine. The flags `--command` and `--edits` carry the payload. *
7. Push what you want kept. A finding that stays on this box dies with it. *

## Discussion

### 1. The commit

The wake printed the commit and what origin holds, above this card.
A cloud box clones the branch tip as it stood when the session was made.
A person who pushed a minute later has a box that is behind and says it is current.
Two sessions were asked whether they were up to date, said yes, and were wrong.
So the box says the commit and the person checks it, rather than the agent judging.

### 3. Measure, then explain

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

### 6. The doors that need no lane

The write gate refuses the harness's own Write, Edit and Bash, and lets the engine through.
These are the same calls a lane makes, and they work with nothing built:

    ./RUNME.sh pull --actor <name> --role worker
    ./RUNME.sh run --on <id> --by <name> --command 'go test ./...'
    ./RUNME.sh apply --on <id> --by <name> --edits '[{"file":"a.go","old":"x","new":"y"}]'
    ./RUNME.sh --answer "..."

A pipe takes a command out of the gate's exception, so a piped engine call is refused.
Each verb has a flag that carries what a pipe used to.
