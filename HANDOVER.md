---
kind: [[handover]]
status: held
urgency: now
---

# The log takes everything, and a claim decides whether a turn may end

Two pieces of one thing. The log records what happens. The stop hook reads what
stands and decides whether a turn may end.

This brief settles every decision. Read it whole, and ask for no design input.

# Part one: the log takes everything

## What goes out, and stays out

Nothing this tree writes deletes a log. A retro owns deletion, this tree
carries no retro, so the folder grows. A growing folder costs less than a
folder swept empty under a person mid-diagnosis.

1. Delete `src/scripts/prune.js`.
2. Delete `dropping`, `DAYS`, `FILES`, `LEAST` and `DAY` from
   `.claude/skills/level0/lib/log.js`.
3. Delete `prune` from `src/doors/log.js` and from `src/doors/fake/log.js`.
4. Drop the `session.start` call that runs the prune, and the `pruned` helper.
5. Drop every test over a cap, in `test/level0/log.test.js` and
   `test/contract/log.test.js`.
6. Rewrite the rotation section of `spec/design_output/log.md`: a session file
   closes when its session ends, and a retro removes it later.

## What comes in

| event | one line each | door |
|---|---|---|
| `tool.call`, matching nothing | every call a tool takes | `tool` |
| `prompt.submit` | every prompt, as submitted | `prompt` |

`turn.step` stays out. A transcript holds a turn's steps already, so a line per
step buys a second copy of what stands elsewhere.

The tool line names the tool and one field. That field says what the call aims
at:

| tool | field |
|---|---|
| a write | the path |
| Bash | the command |
| a search | the query |
| a fetch | the url |

That choice sits in `.claude/skills/level0/lib/log.js`, and a test holds the
field for each tool.

Watch the order. The write door and the trunk guard write their own lines
already, so a plain `tool` line beside a `write` line reads as two events. Put
the `tool` line down first, and let the door add what it refuses.

## Levels, and what a box writes

`spec/config/level0.json` takes a `log` object:

    "log": {
      "level": "info"
    }

| level | writes |
|---|---|
| `info` | everything, and this is the default |
| `warn` | a refusal and a fault |
| `error` | a fault |

A level the reader does not know reads as `info`, and a missing object reads as
`info`. So a box configuring nothing writes everything.

# Part two: the stop hook

## The one thing to understand first

Level zero spends no model call here. Another model knows nothing of whether
this session stands in a discussion. So the agent says so itself: it CLAIMS a
stop, and the hook only counts.

`turn.complete` refuses nothing. Its declaration says a hook returns `{ text }`
and that a different text shows beneath the answer, so the turn ends anyway.

So the tooth works the other way round:

- Where the table says carry on, the hook calls `$.prompt.submit({ text })`.
- That prompt runs once the session goes idle, and opens another turn.
- The agent keeps working, and the transcript carries a prompt the plugin owns.

Say this in your handback where you meet it. A session torn down as the turn
ends escapes the tooth: the prompt reaches a session that has already gone. A
cloud routine ending its run is that case.

## The claim, and how the agent makes one

Level zero registers a tool at `session.start` through `$.tool.register`, and
serves it by hooking `tool.call` with the matcher for its own name.

    claim_stop({ rule: "the-work-is-finished", why: "one sentence" })

The tool answers with the claim it holds, so the agent reads its own words back.

A claim lives briefly, and this is the whole of its life:

| what ends a claim | and then |
|---|---|
| the turn ends | the hook counts it |
| two tool calls pass after it | the hook counts nothing |

Whichever comes first. Two tool calls stand between a claim and a stop because
an agent often reads one more thing before it stops. A third says it stands back
at work, so the claim goes.

A claim lives inside one turn, and the next turn opens with none.

## The table

| priority | side | rule | how |
|---:|---|---|---|
| 100 | stop | the owner asks to talk | claimed |
| 99 | continue | the owner says carry on | claimed |
| 95 | stop | the session is new | mechanical |
| 90 | stop | blocked on what only a person gives | claimed |
| 80 | continue | work still stands | mechanical |
| 45 | stop | the work stands complete | claimed |
| 10 | stop | a wish to give an update | claimed |
| 0 | continue | the tooth is out | mechanical |

The rule in one line: the turn ends where the claimed reason to stop stands
above every reason to continue that fires.

An unclaimed turn end carries the mechanical reasons to stop alone. A firing
continue rule above them holds the turn open, and the hook re-prompts.

One reason to stop asks for no claim, because the hook grants it on its own. A
session may ask what to do before it does anything:

| the free stop fires when | |
|---|---|
| fewer than 10 tool calls have passed | and |
| the hook has granted no stop this session | |

Both halves matter. The count alone hands out a free stop wherever it resets.
The grant alone lets a session read for an hour and still call itself new.

95 stands over `work-waiting`, so a list carried in from an earlier branch traps
no fresh session. It stands under `the owner says carry on`, so a person saying
get on with it spends the free stop.

Four bands hold the numbers, so a later level lands without renumbering:

| band | who writes there |
|---|---|
| 90 to 100 | the owner, and nothing overrides it |
| 50 to 89 | the state of the work |
| 1 to 49 | a preference |
| 0 | the off switch |

Three numbers carry an argument, and keep them where they stand:

- 99 over 90 puts "carry on" over the block. A person saying carry on is a
  person saying proceed on your best reading.
- 45 under 80 keeps a finished piece from ending a session while a list still
  holds something.
- 0 for the off switch beats nothing, so every claim wins and the hook turns off
  with no special case.

## The file the rules live in

`spec/config/stop/level0.yml`, one rule per entry. A new
`.claude/skills/level0/lib/stop.js` reads every file in that folder and pools
the entries, so a later level drops `level1.yml` beside it and changes no code.

    - id: the-owner-asks-to-talk
      side: stop
      priority: 100
      decides: claimed
      asks: Does the last thing the owner said open a discussion?
      says: The owner opens a discussion, so this turn ends and waits.

    - id: work-still-stands
      side: continue
      priority: 80
      decides: mechanical
      runs: work-waiting
      says: Something on your list stands unfinished, so carry on with it.

A rule the reader cannot parse writes one `warn` line naming the file, and it
stands out of the vote. A broken rule file leaves every turn as it stands.

## The mechanical checks are functions

`runs` names a function the hook holds. Keep it a function name: a shell
command inside a config file is a hole somebody walks through.

| `runs` | answers true when |
|---|---|
| `work-waiting` | a todo stands unfinished, or this branch stands at `held` |
| `session-is-new` | under 10 tool calls stand behind this session, and the hook has granted no stop |
| `stop-hook-off` | `spec/config/level0.json` says `stop.enabled` is false |
| `never` | nothing, which is what an unbuilt rule takes |

A `runs` value the code does not know answers false and writes one `warn` line.

`work-waiting` reads the todo list, which is the one work state standing today.
Watch `TodoWrite` go past on `tool.call` and hold the latest list in module
state. Any item short of `completed` means work stands.

## What the hook says when it holds a turn open

The re-prompt carries two things: the `says` of the winning continue rule, and
the `asks` of every stop rule standing unclaimed. The agent reads them and
answers itself, because it is the only thing in the room that knows.

    Something on your list stands unfinished, so carry on with it.

    If that reading is wrong, claim the stop and end the turn:
      - Does the last thing the owner said open a discussion?
      - Does going on need what only a person can give?
      - Does the work stand complete?

## Three in a row, and the tooth relents

The hook counts turns it has carried in a row, in module state.

- Past `mostInARow`, default 3, it writes a `warn` line and lets the turn end.
- A prompt from outside the plugin resets the count, because that is a person
  taking the session back.

`spec/config/level0.json` gains:

    "stop": {
      "enabled": true,
      "mostInARow": 3
    }

The tooth is on for a desk session as well as a cloud one. The discussion rule
covers a person standing there.

## Every decision writes a line

One line per turn end, at `info`, under the door `stop`:

    said:   the turn ends, or the turn goes on
    detail: stop=<id>@<priority> continue=<id>@<priority> inARow=<n>

That line is the whole audit. A person reads a misfiring tooth out of the log.

# What this brief settles, so you build none of it

The guidance does not decay, and it needs no re-read per turn. The engine's own
type declaration says `prompt.context` fires once per conversation and again on
"a re-read (compaction, `/clear`)". Level zero hooks it already, so a compaction
and a `/clear` both bring the rules back.

Build nothing there. Write the fact into `spec/design_output/level0.md` under
the harness surface, so the next reader stops asking.

# Part three: the canary

A session says out loud that level zero holds it. A session saying nothing
stands outside the cage, and that failure costs this tree several cloud rounds
already.

## The line

Level zero counts what it holds, so the standing block carries the sentence and
asks for it back word for word in the first answer:

    level0 holds this session: 14 rules, 5 notes, the stop hook on.

The numbers come out of the block, so an agent says the line correctly only
where the block reaches it. That is the whole of the proof.

Where the stop hook stands off, the line ends `the stop hook off`, so the
sentence says which cage this is.

## The hook reads it back

On the first `turn.complete` of a session, level zero looks for that sentence in
the answer.

| what it finds | what it does |
|---|---|
| the sentence, with its own numbers | one `info` line, door `level0` |
| a sentence with other numbers | one `warn` line carrying both |
| no sentence | one `warn` line saying the canary is absent |

So the log carries the canary as well, and a person reads it later without
watching the session run.

## Where the words live

The standing block builds in `.claude/skills/level0/lib/guidance.js`, and the
canary belongs beside it. A guidance note carries actionables, and this sentence
is a fact level zero states about itself.

# What to prove before you call this done

1. `./RUNME.sh check` passes, and it runs `claude plugin validate` for you.
2. No code path deletes a log file. Prove it by grep, and say so.
3. A tool call and a prompt each write one line, against the fake.
4. A claim expires after two tool calls, and it expires at a turn end. Both
   under test.
5. The free stop fires one time in a session, under test.
6. The table reads from the folder, and a second file adds a rule with no code
   change.
7. The vote answers over a table a test hands it, so the comparison stands
   proven without a session.
8. `mostInARow` ends a runaway.
9. A rule file that will not parse leaves the tooth harmless.
10. The canary carries the counts level zero loaded, and a missing canary
    writes one `warn` line. Both under test.

# What to say in your handback

- What one turn end costs in milliseconds.
- Whether the submitted prompt reaches a cloud box at all.
- Whether two tool calls is the right life for a claim, from what you watch.
- Every place the order of the log lines surprises you.

## How this branch runs

Level zero deletes this file when it reads it, so the copy in your context
is the only one left. These steps write it back.

1. Run `./RUNME.sh work sync` FIRST. It takes main into this branch, so
   an old branch works against what the tree holds now. Resolve any conflict
   before you start, because a conflict found later costs the work already
   done.
2. Commit and push each time you finish a thing. A cloud box dies and takes
   its working tree with it.
3. Write your result and your retro into `HANDOVER.md`, at the root, replacing
   this brief. Say what surprises you and every dead end you walk into.
4. Run `./RUNME.sh work done`, which sets the status and pushes.
5. Run `./RUNME.sh work release` instead where you stop early, so the branch
   goes back to `todo` for somebody else.
6. Leave the merge into main to a person. A cloud box opens no pull
   request, and trunk only ever comes towards you.
