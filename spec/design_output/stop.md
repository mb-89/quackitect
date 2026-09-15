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
reason the tree holds. It stands on the continue side at fifty, under the
owner's hold and over the claimed reasons. So a turn without the line holds
open. The re-prompt lists every id one to a line. The hold at stop and a fresh
session end a turn over it, and the tooth off ends any turn.

- the vote keeps deciding
- `spec/config/stop/level0.yml` keeps every rule, side and priority
- `stop.mostInARow` keeps capping a runaway

## The hold

`stop.hold` is what the owner picks from the sidebar, and it stays there
until they click it back. The stop door reads it at every call and at the
turn's end:

| hold | at the next call | at the turn's end |
|---|---|---|
| `off` | nothing | the tooth votes |
| `finish` | one context line: finish what stands, start nothing new | the tooth votes |
| `stop` | the door refuses the call: say what stands, end the turn with the stop line | the turn ends over the standing work |

The report tool passes the hold at `stop`, so the agent hands the last report
in before the turn ends. The hold at `stop` fires the rule
`the-owner-holds-this-session` on the stop side at 85, over every continue
rule but the owner's own word. A `hold` line at `debug` says what the door does.

## The canary ends turn one

The canary is a formatted line of its own, and turn one ends on it, last. An
answer holding the canary reaches the vote with no call beside it. The stop
call falls in turn one, and its result names the canary as the one way out.
From turn two on the call ends a turn. For details, see
[[spec/design_output/level0#the-canary-owes-a-debt]].

## The off switch takes it

`stop.enabled` at false skips the hold above and votes at once. The switch
takes the whole tooth out, and the call stands as part of the tooth.

# The vote

Every rule carries a side, a priority and a way of firing. The turn ends where
the reason to stop stands above every reason to continue that fires.

| priority | side | rule | how |
|---:|---|---|---|
| 100 | stop | the owner asks to talk | claimed |
| 99 | continue | the owner says carry on | claimed |
| 95 | stop | the session is new | mechanical |
| 90 | stop | blocked on what only the owner gives | claimed |
| 80 | continue | work still stands | mechanical |
| 45 | stop | the work stands complete | claimed |
| 10 | stop | a wish to give an update | claimed |
| 0 | continue | the tooth is out | mechanical |

An unclaimed turn end carries the mechanical reasons to stop alone. A firing
continue rule above them holds the turn open, and the hook re-prompts.

A turn nothing fires over ends, because the stop side stands at a floor of
zero. So a continue rule wins by standing above that floor, and a tie goes to
the stop side.

Four bands hold the numbers, so a later level lands without renumbering:

| band | who writes there |
|---|---|
| 90 to 100 | the owner, and nothing overrides it |
| 50 to 89 | the state of the work |
| 1 to 49 | a preference |
| 0 | the off switch |

Three numbers carry an argument, and they stay where they stand:

- 99 over 90 puts "carry on" over the block. The owner saying carry on says
  proceed on your best reading.
- 45 under 80 keeps a finished piece from ending a session while a list still
  holds something.
- 95 over 80 frees a session that opens with an old list on it. 95 under 99
  spends that free stop where the owner says get on with it.

## The off switch answers alone

`stop.enabled` set to false takes the tooth out, and the rule at priority 0
records it. That rule wins no vote on its own, because a continue rule at 80
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
| `session-is-new` | under 10 tool calls stand behind this session, and the hook grants no stop |
| `stop-hook-off` | `spec/config/level0.json` says `stop.enabled` is false |
| `never` | nothing, which is what an unbuilt rule takes |

A `runs` value the code does not know answers false, stands out of the vote,
and writes one `warn` line.

The free stop asks for both halves. The count alone hands out a free stop
wherever it resets. The grant alone lets a session read for an hour and still
call itself new.

# A standing stop ends it

- Outcome: a stop that stands ends the turn, and nothing from level zero reaches the prompt after it.
- Order: the agent writes its answer, calls the stop, and writes only "Ending my turn" after it.
- Close: the harness asks for text after a tool call, so that one generic line closes the turn.
- Gate: the turn end reads nothing and writes nothing, because the call holds the verdict on the stop.

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
| `inARow` | the turns the tooth carries one after another |
| granted | whether the hook grants a stop already |
| claim | the reason the last call names, until the next call or the turn's end |

The module reloads with the plugin, so every count starts again where the
maintainer edits level zero mid-session.

# Where the rules live

`spec/config/stop/level0.yml` holds one entry per rule. `stop.js` reads every
file in that folder and pools the entries, so a later level drops `level1.yml`
beside it and changes no code.

    - id: the-owner-asks-to-talk
      side: stop
      priority: 100
      decides: claimed
      asks: Does the last thing the owner said open a discussion?
      says: The owner opens a discussion, so this turn ends and waits.

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
