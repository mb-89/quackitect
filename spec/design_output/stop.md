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
prose alone, and the line comes last. The two stand in one message, because
the owner's view shows the last message alone.

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

The calls below pass the hold at `stop`, because a turn ends through them: the
report, the stop claim and the answer check. Each carries the block, so the
line stands in the answer to every call a held session makes. The hold at
`stop` fires the rule `the-owner-holds-this-session` on the stop side, over
every continue rule but the owner's own word. A `hold` line at `debug` says
what the door does.

The hold is the stop hook's opposite. The hook holds a turn open, and the hold
ends it, at the strengths below:

| strength | what the owner asks for | which rule ends it |
|---|---|---|
| `finish` | bring what stands to a point a hand picks up later, then end | `the-owner-asks-to-finish`, at 84 |
| `stop` | end this turn now | `the-owner-holds-this-session`, at 85 |

The agent judges where that point stands at `finish`, because the work in
hand decides it. At `stop` the door decides, and the calls above are
what it leaves.

Each stands over every continue rule but the owner's own word, the queue's
firm rule among them. So a held turn ends with work still waiting.

So a hold is one turn long. It ends the turn it lands in, the turn's end puts
it back to `off`, and it reaches no later turn. A prompt writes no hold,
because the press is the owner's word and the prompt carries its own.

## The hold outlives its drop

The events below end a turn, and they arrive in either order:

| the event | the door | what it does with the hold |
|---|---|---|
| `turn.complete` | `dropsHold` | writes it back to `off` |
| `classic.Stop` | `onStop` | reads it, and the vote runs |

A drop landing first leaves the vote reading `off`. The rules ending a turn
for the owner lose there, a continue rule wins, and the turn reopens over work
the owner puts down.

So the drop leaves a mark. `holdHere` reads the hold the owner holds now, or
that mark. A hold standing anywhere in a turn ends that turn.

| what clears the mark | why |
|---|---|
| a prompt from outside this plugin | a hold is one turn long, and a prompt opens the next |
| a reload of the module | the mark shares the lifetime of the tooth's counts |

A helper's turn end reaches neither the hold nor the mark, the way every door
beside this one skips a helper.

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

The free stop of a new chat takes one exception. Where the first answer
names a next step, `namesNext` reads it, the chat-is-new rule fires no
more, and the turn holds open. So the canary rides that answer and closes no
turn, and the agent does the step it names. A sentence opening on `Next`,
`Then I` or `I` and a verb of the agent's own act names a step. A table, a
heading and the stop line stand outside that reading.

## The off switch takes it

`stop.enabled` at false skips the hold above and votes at once. The switch
takes the whole tooth out, and the call stands as part of the tooth.

## The grace

The engine wants something of the agent now and then, and a refusal with no
warning is a wall. So an ask opens a grace. The engine says it on the next
call, and lets a number of calls pass with the ask riding each result. Then
it refuses every call until the agent reacts. `grace.js` holds it, one ask at
a time, and the calls ending a turn pass whatever stands.

| the ask | what opens it | what answers it |
|---|---|---|
| the refactoring hand | the list past `refactor.mostWarnings`, and a file at rest past `refactor.untouchedFor` | the turn's end, where the stop door spawns the hand |
| the plan's three questions | every `plan.everyCalls` calls | a `plan` field on a level zero call, or the `plan` call |
| the owner's ask for an update | the sidebar's ask, with `grace.update` calls before the reply is due | the reply, in the chat and through `report` |
| the finish hold | the sidebar's hold at finish, with `grace.finish` calls before the calls refuse | the turn's end |

The list stands in `.se/.runtime/refactor.json`, one entry a warning, which
the lint writes at each check. `refactor.grace` names the calls that pass.

## The plan

Where a model keeps a private todo list, this tree keeps it in the queue. A
todo is a title and a detail line in `.se/.runtime/plan.json`, placed like a
ticket, and drawn in the work tab with no link. A sentence is the light road,
and a note or a ticket stays the road for anything that travels. `plan.js`
holds the door.

| every `plan.everyCalls` calls, the engine asks | what answers it |
|---|---|
| what you work on now, by title or ticket name | the plan names it, and the queue draws it held |
| which todos you finish | they leave the queue |
| which todos you add, each at its place | they land, up to `plan.mostOpen` open ones |

The count of calls reaches the number, and the ask stands due. It lands on the
first call no other ask holds, and the count starts over at the answer alone.
So a standing update or refactor ask delays it, and the ask lands once the
agent answers that one. A hand answering nothing spends the grace and meets the
refusal.

The ask rides the grace. The answer rides a channel off the chat: a `plan`
field on any level zero call, or the `plan` call where none is due. A
built-in tool refuses a field its schema names nowhere, so the answer rides
no such call. The log shows each change, and the queue shows the rest: the
row at zero, a new row, a row gone. The count starts over at
an answer, and the grace stands past a batch of calls sent at once.

# The vote

Every rule carries a side, a priority and a way of firing. The turn ends where
the reason to stop stands above every reason to continue that fires.
`spec/config/stop/level0.yml` holds every rule with its side and its priority.

An unclaimed turn end carries the mechanical reasons to stop alone. A firing
continue rule above them holds the turn open, and the hook re-prompts. A turn
nothing fires over ends, because the stop side stands at a floor of zero. So a
continue rule wins by standing above that floor, and a tie goes to the stop
side.

The bands below hold the numbers, so a later level lands without renumbering:

| band | who writes there |
|---|---|
| 90 to 100 | the owner, and nothing overrides it |
| 50 to 89 | the state of the work |
| 1 to 49 | a preference |
| 0 | the off switch |

The priorities below carry an argument, and they stay where they stand:

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
| `ticket-in-hand` | a hold stands under `.se/.runtime/hold`, or an open private ticket stands |
| `group-in-hand` | this branch's group carries a take with no hand-back |
| `queue-waits` | a desk bound to the queue stands on trunk, and `queueHolds` reads a free open ticket or a group at `now` |
| `chat-is-new` | the session log holds one prompt row at most, the box is no cloud box, and the answer names no next step |
| `a-report-stands` | the message ending the turn carries the heading What the agent needs with a numbered row under it |
| `the-plan-is-empty` | the plan holds no todo and nothing in hand, so a claim of done stands on an empty plan |
| `stop-hook-off` | `spec/config/level0.json` says `stop.enabled` is false |
| `never` | nothing, which is what an unbuilt rule takes |

A `runs` value the code does not know answers false, stands out of the vote,
and writes one `warn` line.

## A claim a check holds

A rule deciding `claimed` names a check too, and then both halves answer before
it fires. The agent claims the reason, the check says the moment stands, and a
claim outside that moment fires nothing. `fires` in `lib/stop.js` holds it, and
a claimed rule naming no check fires on the claim alone.

## A check beats a claim

A rule carrying `yields` loses to any mechanical continue that fires, whatever
the priorities say. `decide` in `lib/stop.js` holds it, and the vote reports the
yield under `yields`.

The flag marks a stop the agent claims over its own work. Such a claim reads the
agent, and a check reads the tree. So the tree wins:

| rule | what it reads |
|---|---|
| `a-wrong-answer-leaves-the-box` | what the agent takes a wrong answer to cost |
| `the-work-stands-complete` | what the agent takes for a finish |
| `an-update-is-worth-giving` | what the agent takes the owner to want |

A stop the owner drives carries no flag. `the-owner-asks-to-talk` reads the
owner's own words, so it stands over every check but one.

## A talk follows a report

A stop line with no report above it tells the owner nothing to talk about.
So `the-owner-asks-to-talk` runs `a-report-stands`: the message ending the
turn carries the needs table, or the claim fires nothing and the turn holds.
The report and the line stand in one message, because the owner's view shows
the last message alone.

The band table puts `90` to `100` in the owner's hands. A claim about the agent's
own work stands there today, and it overrides every check reading the branch. The
flag takes that override away and leaves the number alone.

## The blast radius decides

`a-wrong-answer-leaves-the-box` asks what a wrong answer costs, and who undoes
it. A box answers a question whose wrong answer a commit undoes. It hands out a
question whose wrong answer reaches past the branch.

A wrong answer leaves the box where it does one of these:

- it spends, sends or opens a door: money, a message to somebody outside, a secret
- it loses work nobody rebuilds: a dropped commit, a deleted row, a release
- it stands outside the ask: a product call the group's ask leaves open

The reason this replaces asks whether a person answers, and a person answers
anything. That test lets every hard call out of the box, so a cloud box ends its
turn on a question it owns.

## The chat is new

`the-chat-is-new` is the opening turn's reason. A person opens a chat, nobody
names the work yet, and the agent answers with what it sees and asks. The check
reads the following:

| what it reads | it stands where |
|---|---|
| the prompt rows in the session log | one row at most stands, so the work stays unnamed |
| `CLAUDE_CODE_REMOTE` and `SE_CLOUD` | both stay empty, so a person sits at this box |
| the answer itself, through `namesNext` | it names no next step, so nothing stands half done |

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
the owner reads both endings. The call costs one line in the transcript, and
its absence holds the turn open.

# The tooth holds its state

`toothOf` holds the counts below in module state, and the hook holds the claim
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

The re-prompt carries the following, and the ids stand one to a line:

- the `says` of the winning continue rule, and the call to make
- the `asks` of every stop rule with no claim on it
- the needs table the answer closes with, in one line

The agent reads them and answers itself, because it is the only thing in the
room that knows. For the table, see [[spec/design_output/level0#the-needs-table]].

    Something on your list stands unfinished, so carry on with it. To stop, call mcp__level0__stop last, with one reason:
      the-owner-asks-to-talk: Does the last thing the owner said open a discussion?
      a-wrong-answer-leaves-the-box: Would a wrong answer here reach past this branch?
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
number of its own, and a write to `.se/.runtime/config.json` reaches the next turn. For
details, see [[spec/design_output/config#a-caller-hands-it-in]].

The tooth is on for a desk session as well as a cloud one. The discussion rule
covers the owner standing there.

# What the todo list says

`work-waiting` reads the todo list, which is one of the two work states
standing today. The other is the branch: a group at `held` says this session
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
the log, and `./RUNME.sh tui` opens it.
