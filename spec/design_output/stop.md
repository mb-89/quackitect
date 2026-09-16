---
kind: [[design_output]]
---

# Scope

`.claude/skills/level0/lib/stop.js` decides whether a turn ends. This note
covers the tooth, the vote it runs, and the claim the agent makes.

# What the tooth is

A turn ends when the model stops writing. The tooth reads what stands at that
moment and decides whether the session carries on.

Level zero spends no model call here. Another model knows nothing of whether
this session stands in a discussion. So the agent says so itself: it claims a
stop, and the hook counts.

# Holding a turn open

`turn.complete` refuses nothing. Its declaration says a hook returns `{ text }`
and that a different text shows beneath the answer, so the turn ends anyway.

So the tooth works the other way round:

| step | what happens |
|---|---|
| the vote says carry on | the hook calls `$.prompt.submit({ text })` |
| the session goes idle | that prompt opens another turn |
| the agent reads it | it carries on, and the transcript holds the prompt |

The hook leaves that call to run on its own. The prompt runs once the session
goes idle, and this hook stands inside the turn that ends first.

A session torn down as the turn ends escapes the tooth, because the prompt
reaches a session that has already gone. A cloud routine ending its run is that
case.

# The stop is one line

A turn ends where the agent asks for it, and the ask is the last line of the
last message:

    stop: <id>

The ids come from the stop side rules the agent claims, in
`spec/config/stop/level0.yml`. The line stands in the chat where the owner
reads it, so a stop is a thing spoken out loud. The report above it carries
prose alone, and the line comes last.

The stop door reads the last line at the turn's end and runs the vote:

| the last line | what the door does |
|---|---|
| a reason that stands | the turn ends, and the log names the rule |
| a reason a fact denies | the turn holds, and the fact re-prompts |
| an id nobody holds, or no line | the turn holds, and the re-prompt lists the ids |

The tool `stop` stands beside the line. A call with a known reason claims it,
and its result says to end the message with the line. A claim lives until the
turn's end.

## A turn with no line

The rule `the-last-line-names-no-stop` fires where the last line names no
reason the tree holds. It stands on the continue side, under the
owner's hold and over the claimed reasons. So a turn without the line holds
open. The re-prompt lists every id one to a line. The hold at stop and a fresh
session end a turn over it, and the tooth off ends any turn.

- the vote keeps deciding
- `spec/config/stop/level0.yml` keeps every rule, side and priority
- `stop.mostInARow` keeps capping a runaway

## The hold

`stop.hold` is what the owner picks from the sidebar. The stop door reads it
at every call and at the turn's end:

| hold | at every call | at the turn's end |
|---|---|---|
| `off` | nothing | the tooth votes |
| `finish` | the block rides: put the work down, start nothing new | the tooth votes |
| `stop` | every call but the three below meets a refusal | the turn ends over the standing work |

Three calls pass the hold at `stop`, because a turn ends through them: the
report, the stop claim and the answer check. Each carries the block, so the
line stands in the answer to every call a held session makes. The hold at
`stop` fires the rule `the-owner-holds-this-session` on the stop side, over
every continue rule but the owner's own word. A `hold` line at `debug` says
what the door does.

A hold is one turn long, and the turn that meets it ends it. The door marks
the hold as met at the call it acts on, and the turn's end drops a met hold to
`off`. A hold the owner sets between turns meets no call, so it stands into
the next turn and holds that one. So a press that lands while a turn closes
holds the work that follows it.

## A prompt mid-turn holds

The owner speaking into a running turn is a hold of its own. A prompt landing
after the session's first tool call, from outside this plugin, writes
`stop.hold` to `finish`. Every later call then carries the block, so the work
goes down at the next call the session makes.

| what stands | what the prompt does |
|---|---|
| a tool call stands this turn | the hold stands at `finish` |
| the prompt opens the turn | nothing, the turn is its own |
| a helper sends it | nothing, a helper holds no session |
| the hold stands at `finish` or `stop` | nothing, the stronger word stands |

The owner's own words come first, so a prompt naming new work outranks the
block it sets. The block says so.

## The two lines stand apart

The canary opens an answer and the stop line closes it. Each door reads its own
end of the message, and one line stands for the other nowhere:

| the line | where it stands | what reads it |
|---|---|---|
| the canary | first, and alone | the canary door, at the turn's end |
| `stop: <id>` | last, and alone | the stop door, at the turn's end |

The canary ends no turn. A session says it because level zero holds the
session, and a turn ends because a reason stands. An opening answer carries
both: the canary at the top, what the agent sees under it, and the stop line
last. For details, see [[spec/design_output/level0#the-canary-owes-a-debt]].

## The off switch takes it

`stop.enabled` at false skips the hold above and votes at once. The switch
takes the whole tooth out, and the call stands as part of the tooth.

# The vote

Every rule carries a side, a priority and a way of firing. The turn ends where
the reason to stop stands above every reason to continue that fires.
`spec/config/stop/level0.yml` holds every rule with its side and its priority.

An unclaimed turn end carries the mechanical reasons to stop alone. A firing
continue rule above them holds the turn open, and the hook re-prompts. A turn
nothing fires over ends, because the stop side stands at a floor of zero. So a
continue rule wins by standing above that floor, and a tie goes to the stop
side.

Four bands hold the numbers, so a later level lands without renumbering:

| band | who writes there |
|---|---|
| 90 to 100 | the owner, and nothing overrides it |
| 50 to 89 | the state of the work |
| 1 to 49 | a preference |
| 0 | the off switch |

Three numbers carry an argument, and they stay where they stand:

| priority | stands | so |
|---|---|---|
| 99 | over 90 | "carry on" beats the block, and the owner saying it says proceed on your best reading |
| 45 | under 80 | a finished piece ends no session while a list still holds something |
| 95 | over 80 | a chat opening with an old list on it still asks what to do |
| 95 | under 99 | that opening stop goes where the owner says get on with it |

## The off switch answers alone

`stop.enabled` set to false takes the tooth out, and the rule at priority `0`
records it. That rule wins no vote on its own, because a continue rule at `80`
stands above it. The tooth then carries the turn with the switch off.

So a firing `stop-hook-off` ends the turn whatever else fires, and `decide`
holds that one line. The switch stays in the table, and the code reads it from
the rule's own `runs`.

# The mechanical checks

`runs` names a function the hook holds. A shell command inside a config file is
a hole somebody walks through, so the name reaches a function alone.

| `runs` | answers true when |
|---|---|
| `work-waiting` | a todo stands unfinished, or this branch stands at `held` |
| `ticket-in-hand` | a hold stands under `.se/hold`, or an open private ticket stands |
| `group-in-hand` | this branch's group carries a take with no hand-back |
| `queue-waits` | a desk bound to the queue stands on trunk, and `queueHolds` reads a free open ticket or a group at `now` |
| `chat-is-new` | the session log holds one prompt row at most, and the box is no cloud box |
| `stop-hook-off` | `spec/config/level0.json` says `stop.enabled` is false |
| `never` | nothing, which is what an unbuilt rule takes |

A `runs` value the code does not know answers false, stands out of the vote,
and writes one `warn` line.

## A claim a check holds

A rule deciding `claimed` names a check too, and then both halves answer before
it fires. The agent claims the reason, the check says the moment stands, and a
claim outside that moment fires nothing. `fires` in `lib/stop.js` holds it, and
a claimed rule naming no check fires on the claim alone, as before.

## The chat is new

`the-chat-is-new` is the opening turn's reason. A person opens a chat, nobody
names the work yet, and the agent answers with what it sees and asks. The check
reads two things:

| what it reads | it stands where |
|---|---|
| the prompt rows in the session log | one row at most stands, so the work stays unnamed |
| `CLAUDE_CODE_REMOTE` and `SE_CLOUD` | both stay empty, so a person sits at this box |

The log is the record, and it rotates at a session start. So the reason
survives a restart of the server and dies with the chat, which is what a
person means by a new chat.

# A standing stop ends it

- Outcome: a stop that stands ends the turn, and nothing from level zero reaches the prompt after it.
- Order: the agent writes its answer, calls the stop, and writes only "Ending my turn" after it.
- Close: the harness asks for text after a tool call, so that one generic line closes the turn.
- Gate: the turn end reads nothing and writes nothing, because the call holds the verdict on the stop.
- Helper: a turn end carrying an agent id passes untouched, so a helper's refused answer reaches no owner turn.
- Debugger: `./RUNME.sh serve --inspect` sets `SE_BREAK_ON_STOP`, and the hook pauses at every stop with the reason and what prompts after.

# The claim rides the call

The call carries the claim, and the hook hands the reason to `decide` as
`claimed` twice:

| where | what the vote is for |
|---|---|
| inside the call | the result answers the agent at once |
| at the turn's end | the tooth confirms it where the turn ends |

The second vote reads the same facts, so the first answer stands.

The other road is a line last in the answer, which the tooth reads back. It
costs a challenge, and the challenge costs a second answer for every stop, so
the owner reads two endings. The call costs one line in the transcript, and
its absence holds the turn open.

# The tooth holds its state

`toothOf` holds three counts in module state, and the hook holds the claim
beside it:

| count | what it stands for |
|---|---|
| calls | the tool calls this session |
| turns | the prompts from outside this plugin |
| `inARow` | the turns the tooth carries one after another |
| claim | the reason the last call names, until the next call or the turn's end |

The module reloads with the plugin, so every count starts again where the
maintainer edits level zero mid-session. No stop rides those counts, because a
restart that hands a session its reasons again hands out the turn ends with
them. A rule over a session's own age reads the log instead, which rotates with
the session and no sooner.

# Where the rules live

`spec/config/stop/level0.yml` holds one entry per rule. `stop.js` reads every
file in that folder and pools the entries, so a later level drops `level1.yml`
beside it and changes no code. The header of that file says what each key
holds.

A rule missing an id, a side, a priority or a way of deciding stands out of the
vote. Its file comes back named on one `warn` line, and a broken rule file
leaves every turn as it stands.

`readEntries` in `rulefile.js` reads the shape, the way `readRule` reads a
judged rule. One reader holds both, because this tree writes both files the way
Vale writes its own.

# What the re-prompt says

The re-prompt carries three things, and the ids stand one to a line:

- the `says` of the winning continue rule, and the call to make
- the `asks` of every stop rule with no claim on it
- the needs table the answer closes with, in one line

The agent reads them and answers itself, because it is the only thing in the
room that knows. For the table, see [[spec/design_output/level0#the-needs-table]].

    Something on your list stands unfinished, so carry on with it. To stop, call mcp__level0__stop last, with one reason:
      the-owner-asks-to-talk: Does the last thing the owner said open a discussion?
      a-person-holds-the-answer: Does going on need what only a person can give?
      the-work-stands-complete: Does the work stand complete?
      an-update-is-worth-giving: Is there an update the owner wants before you go on?
    Before the call, close the answer with the heading What the agent needs and a table headed No., question and proposed answer, one numbered row a need.

# Three in a row

The hook counts the turns it carries one after another.

- Past `mostInARow`, it writes a `warn` line and lets the turn end.
- A prompt from outside the plugin resets the count, because that is the owner
  taking the session back.
- A continue rule carrying `firm` holds past the cap, because the cap frees a
  stuck session alone. The queue rule in `level1.yml` carries it.

The hook asks the resolver for `stop.mostInARow` and `stop.enabled` at each
turn end, and `atTurnEnd` takes the cap as an argument. So the tooth carries no
number of its own, and a write to `.se/config.json` reaches the next turn. For
details, see [[spec/design_output/config#a-caller-hands-it-in]].

The tooth is on for a desk session as well as a cloud one. The discussion rule
covers the owner standing there.

# What the todo list says

`work-waiting` reads the todo list, which is one of the two work states
standing today. The other is the branch: a brief at `held` says this session
holds work the owner gives it.

Client 2.1.266 carries no `TodoWrite`. Its list is `TaskCreate` and
`TaskUpdate`, which name one task a call, so `todos` counts:

| what goes past | what it counts |
|---|---|
| a call carrying a `todos` array | the list, and every item short of `completed` |
| `TaskCreate` | one more task standing |
| `TaskUpdate` saying `completed` or `deleted` | one fewer |

A list arriving whole replaces the count, so a build writing one puts the
counting right.

# Every decision writes a line

One line per call, and one per turn end, at `info`, under the door `stop`:

    said:   the stop stands, or the stop falls
    said:   the turn ends, or the turn goes on
    detail: stop=<id>@<priority> continue=<id>@<priority> inARow=<n>

Those lines are the whole audit. The maintainer reads a misfiring tooth out of
the log, and `./RUNME.sh log` opens it.
