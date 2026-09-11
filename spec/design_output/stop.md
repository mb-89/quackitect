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

# The vote

Every rule carries a side, a priority and a way of firing. The turn ends where
the reason to stop stands above every reason to continue that fires.

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

- 99 over 90 puts "carry on" over the block. A person saying carry on is a
  person saying proceed on your best reading.
- 45 under 80 keeps a finished piece from ending a session while a list still
  holds something.
- 95 over 80 frees a session that opens with an old list on it. 95 under 99
  spends that free stop where a person says get on with it.

## The off switch answers alone

`stop.enabled` set to false takes the tooth out, and the rule at priority 0
records it. That rule wins no vote on its own, because a continue rule at 80
stands above it. The tooth would then carry the turn with the switch off.

So a firing `stop-hook-off` ends the turn whatever else fires, and `decide`
holds that one line. The switch stays in the table, and the code reads it from
the rule's own `runs`.

# The mechanical checks

`runs` names a function the hook holds. A shell command inside a config file is
a hole somebody walks through, so the name reaches a function alone.

| `runs` | answers true when |
|---|---|
| `work-waiting` | a todo stands unfinished, or this branch stands at `held` |
| `session-is-new` | under 10 tool calls stand behind this session, and the hook has granted no stop |
| `stop-hook-off` | `spec/config/level0.json` says `stop.enabled` is false |
| `never` | nothing, which is what an unbuilt rule takes |

A `runs` value the code does not know answers false, stands out of the vote,
and writes one `warn` line.

The free stop asks for both halves. The count alone hands out a free stop
wherever it resets. The grant alone lets a session read for an hour and still
call itself new.

# The claim and its life

Level zero registers `claim_stop` at `session.start` through `$.tool.register`,
and serves it by hooking `tool.call` with the matcher for its own name:

    claim_stop({ rule: "the-work-stands-complete", why: "one sentence" })

The tool answers with the claim it holds, so the agent reads its own words
back. A claim lives briefly, and this is the whole of its life:

| what ends a claim | and then |
|---|---|
| the turn ends | the hook counts it |
| two tool calls pass after it | the hook counts nothing |

Whichever comes first. Two tool calls stand between a claim and a stop because
an agent often reads one more thing before it stops. A third says it stands
back at work, so the claim goes. The claim's own call spends none of that life.

A claim lives inside one turn, and the next turn opens with none.

# The tooth holds its state

`toothOf` holds four counts in module state:

| count | what it stands for |
|---|---|
| calls | the tool calls this session |
| inARow | the turns the tooth carries one after another |
| since | the tool calls a claim still lives through |
| granted | whether the hook grants a stop already |

The module reloads with the plugin, so every count starts again where a person
edits level zero mid-session.

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

The re-prompt carries two things: the `says` of the winning continue rule, and
the `asks` of every stop rule standing unclaimed. The agent reads them and
answers itself, because it is the only thing in the room that knows.

    Something on your list stands unfinished, so carry on with it.

    If that reading is wrong, claim the stop and end the turn:
      - Does the last thing the owner said open a discussion?
      - Does going on need what only a person can give?
      - Does the work stand complete?

# Three in a row

The hook counts the turns it has carried one after another.

- Past `mostInARow`, it writes a `warn` line and lets the turn end.
- A prompt from outside the plugin resets the count, because that is a person
  taking the session back.

The hook asks the resolver for `stop.mostInARow` and `stop.enabled` at each
turn end, and `atTurnEnd` takes the cap as an argument. So the tooth carries no
number of its own, and a write to `.se/config.json` reaches the next turn. For
details, see [[spec/design_output/config#a-caller-hands-it-in]].

The tooth is on for a desk session as well as a cloud one. The discussion rule
covers a person standing there.

# What the todo list says

`work-waiting` reads the todo list, which is one of the two work states
standing today. The other is the branch: a brief at `held` says this session
holds work a person gives it.

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

One line per turn end, at `info`, under the door `stop`:

    said:   the turn ends, or the turn goes on
    detail: stop=<id>@<priority> continue=<id>@<priority> inARow=<n>

That line is the whole audit. A person reads a misfiring tooth out of the log,
and `./RUNME.sh log` opens it.
