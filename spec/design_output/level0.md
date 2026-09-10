---
kind: [[design_output]]
describes: [[.claude/skills/level0]]
---

# What level zero is

A plugin whose hooks are a module. It runs inside the harness process and asks
for no server, so its rules hold on turn one of a clone nobody has built.

`.claude/settings.json` turns it on and git tracks that file, so a clone guards
its first session with nothing typed.

# The harness surface

Every line here comes from running it on 2026-09-08 against client 2.1.263. The
surface is early access and moves, so run it again before you trust this.

The sections below carry their own date where a later run measures them again.

## The file surface renames itself

Measured on 2026-09-09 against client 2.1.267:

| what this tree calls | what the client offers |
|---|---|
| `$.fs.readFile` | `$.fs.read` |
| `$.fs.writeFile` | `$.fs.write` |
| `$.fs.listDir` | `$.fs.list` |

The old three answer `undefined`. A hook calling one throws, the engine skips
that hook, and the chain carries on without it.

So on that client level zero writes no stamp, writes no log line, reads no
guidance and holds no write door. The prompt says nothing about it.

Three readings of the same module, and what each one tells you:

| what you run | what it says about a moved method |
|---|---|
| `claude plugin validate` | nothing, it reads which nouns the source touches |
| `claude --debug` | the throw, in the debug log alone |
| `/plugin-types` | the running build's own declarations |

So read `/plugin-types` first, and run the module against the client before you
trust it.

## A subagent brings no session

Measured on 2026-09-09 against client 2.1.267, by a probe writing one file per
hook event through a whole run.

| what a subagent fires | what reaches it |
|---|---|
| `session.start` | nothing, the session fires it once |
| `prompt.context` | nothing, so the standing layer misses it |
| `tool.call` | the session's own hooks, `agentId` set |

One module instance holds the session and every subagent inside it. A
subagent's calls come back through the session's own hooks, under an `agentId`
the main loop leaves out.

So the write door already holds over a helper, and the guidance is the gap.
`agent.spawn` closes it.

## The spawn carries a rewrite

Measured the same day and the same way. `agent.spawn` fires once per subagent,
before its model resolves.

| what the event carries | what a hook does with it |
|---|---|
| `prompt`, `description`, `subagentType` | a rewrite stands |
| `model`, `cwd`, `background` | a rewrite stands |
| `tool_use_id`, `fork`, `parentModel` | pinned |

A hook calling `next({ ...e, prompt })` hands the subagent the new prompt. A
probe prepending one instruction sees the subagent obey it, and `next(e)`
resolves to `{ model }`, the id the spawn settles on.

## A step arrives late

`turn.step` fires once the step's tool calls run. It says what a step does, and
a door reading it learns too late.

`$.session.messages()` answers sooner. At `tool.call` the transcript already
carries the text the model writes in that same response.

So a hook there reads whether the session has spoken this turn.

## Arguments arrive on the event

A tool's arguments sit on the event beside `tool` and `tool_use_id`, so a write
carries `e.content` and `e.file_path`. Reading `e.input` answers `undefined`,
the hook finds nothing, and the write proceeds. The rule then looks like a
feature nobody built.

## No computed engine access

`claude plugin validate` refuses `$[noun]` and `$.fs?.read` by reading the
source. Spell every call `$.noun.method(...)` at the call site, and give `on` a
literal event name.

## A module imports a sibling

So the rules live in `lib` as one copy that the module and the command line both
load. Keep `lib` free of `node:` imports, because the module's environment
carries none.

## Nothing imports past the plugin

`claude plugin validate` refuses a relative import that climbs past the plugin
root, and it names the file. So the whole of level zero stands inside one
folder. A shape holding `lib` under `src` and the hooks module elsewhere fails
before a session starts.

## The filesystem reads and writes

`$.fs` offers `read`, `write`, `list`, `exists`, `stat` and `ancestors`. It
deletes nothing, so a delete goes through `$.process.run`.

## A session misses its install

A plugin loads once per process at session start, so the session that changes
the module runs the old one. `claude --init-only` fires no `session.start`, so a
probe costs one `-p` turn and one model call.

## The guidance stays put

The rules reach the agent once and stand for the conversation. The engine's own
type declaration says `prompt.context` fires once per conversation, and again
on "a re-read (compaction, `/clear`)".

Level zero hooks it already, so a compaction and a `/clear` both bring the
rules back. Nothing here re-reads them per turn, and nothing needs to.

# Where the plugin stands

Level zero lives at `.claude/skills/level0`, holding its manifest, its hooks
module and its rules. The client finds
`.claude/skills/<name>/.claude-plugin/plugin.json`, adopts the folder as a
plugin under the id `level0@skills-dir`, and enables it by default. Nothing
registers it, and `.claude/settings.json` names it nowhere.

A marketplace reaches no cloud box, which is why this shape stands:

| way in | what it asks for | a fresh cloud clone |
|---|---|---|
| `extraKnownMarketplaces` in settings | the workspace carries accepted trust | no trust, so the key stays unread |
| a routine's `extra_marketplaces` | the API stores it | the API answers 200 and drops the value |
| `.claude/skills/<name>` | the workspace carries accepted trust | no trust, so the scan skips it |
| `claude --plugin-dir <path>` | the flag on the command line | it loads |

The trust gate reads a flag a person accepts once per folder on one box. A
cloud clone is a new folder every run, so it carries none.

## The trust gate reaches skills

Client 2.1.266 gates a skills-directory plugin on the same trust every
marketplace waits for. `claude plugin list` says so on a cloud box:

    ‼ 1 project-scope directory under ./.claude/skills/ that may load as a
      plugin was skipped because this workspace was not trusted when plugins
      were scanned.

So level zero holds no cloud session that starts the ordinary way, and
`~/.claude.json` carries `hasTrustDialogAccepted: false` there. The flag lives
outside the tree, so no tracked file moves it.

Two things reach a cloud box today:

- `claude --plugin-dir .claude/skills/level0`, which loads the folder for that
  session and skips the scan.
- A box whose setup writes the trust flag into `~/.claude.json` before the
  session starts.

The canary finds this. A session saying the line out loud is a session level
zero holds, and a cloud session that starts the ordinary way says nothing.

# The write door

`tool.call` reads every Write and Edit. Prose goes to Vale, code goes to Biome,
and a breach comes back as `{ deny }` naming the rule, the line and the phrase.

The refusal closes by asking the writer to hold that rule for the rest of the
turn. A refusal teaching one line costs a round trip on every line.

A shell reaches the same files through `>`, `tee`, `sed -i` and a heredoc, so
`tool.call` reads a Bash command as well. For details, see
[[spec/design_output/bash]].

## The door reaches a helper

A subagent's writes go through the same `tool.call` chain, so the door reads
them the way it reads the session's own. A live run on 2026-09-09 watches it
refuse a helper's `Write` over `Contraction`.

That helper then writes the same text through `printf` in Bash. The write door
hooks `Write`, `Edit` and `MultiEdit` alone, so a shell reaches past it. The
Bash door reads that road, for a helper and for a session alike.

## The formatter applies itself

A formatter that asks permission is a formatter somebody skips. So the door
sends a code write through Biome and passes the formatted text on with
`next({ ...e, content })`.

The agent writes its own text and the tree stores what the formatter says, the
way a save-time formatter works for a person.

## The judge costs a call

Vale and Biome run first, because they cost nothing. The judge asks a model one
question per span, so it runs where the patterns already passed.

It reads every span of the first writes in a session, then samples. A breach
puts it back to reading everything.

# The standing layer

`prompt.context` computes the blocks a conversation's first message carries. It
fires once, and again when the context clears, which is where the guidance, the
handover and the canary arrive.

The system prompt's sections stay free for guidance that depends on where the
work stands.

## The canary

A session says out loud that level zero holds it. A session saying nothing
stands outside the cage, and that failure costs this tree several cloud rounds
already.

    level0 holds this session: 53 rules, 6 notes, the stop hook on.

The numbers come out of the standing block, so an agent says the line correctly
only where the block reaches it. That is the whole of the proof. Where the stop
hook stands off, the line ends `the stop hook off`, so the sentence says which
cage this is.

On the first `turn.complete` of a session, level zero looks for that sentence
in the answer:

| what it finds | what it does |
|---|---|
| the sentence, with its own numbers | one `info` line, door `level0` |
| a sentence with other numbers | one `warn` line carrying both |
| no sentence | one `warn` line saying the canary is absent |

So the log carries the canary as well, and a person reads it later without
watching the session run. `./RUNME.sh standing` ends with the same sentence,
because `canary` builds it in `lib/guidance.js` and both callers read it there.

## The helper takes the guidance

A subagent reads no standing layer of its own, so `agent.spawn` hands it one.
The hook prepends the session's own standing text to the spawn's prompt, under
the heading the session reads, and puts the task under `# Your task`.

One guidance file then binds every agent in the tree, and no helper reads a
second copy. `forHelper` in `lib/guidance.js` builds the text, and the log
writes one `agent` line naming the type it reaches.

The rules a helper writes under are the rules the write door holds it to, so
the two now say the same thing.

# The owner's prompt comes first

`spec/guidance/working.md` opens with two rules: answer the owner before the
next tool call, and open that answer by saying back what you understood.

Both hold exactly as well as a session remembers them. So a door holds them
instead.

## What the door reads

The door marks a turn a person opens, and refuses the first `tool.call` of that
turn while nothing has reached them.

| what the hook holds | when |
|---|---|
| a turn stands open, and nothing answers it | `prompt.submit`, from a person |
| the turn carries an answer | any text the session sends |
| the mark clears | `turn.complete` |

Whether the turn carries an answer comes out of `$.session.messages()`. The
prompt standing open is the last user message carrying no tool result, and text
from the session after it answers that prompt.

The read costs no model call, and it sees text the model writes beside the very
call the door holds. A response opening with a sentence and closing with a tool
call therefore passes.

## Which prompt opens a turn

`e.origin.kind` says who asks. A person asks through `composer`, `bridge`,
`sdk`, `scheduled-trigger`, `slack-ping`, `channel` and `auto-continuation`. A
routine's prompt belongs to the person behind the routine.

Every other kind is a machine talking to the session, and a machine waits. The
tooth submits prompts under `plugin`, and a session owes no readback to itself.

`unclassified` stays out. The engine hands it both a person's socket and its own
delivery receipts, so a door reading it bites the wrong turn.

## What the refusal says

    The owner asked something and nothing has answered it. Say back what you
    understood and what you do next, then work.

That is the rule in its own words, and a refusal quoting the rule teaches it
better than a refusal naming it.

## Where it must not bite

- A turn nobody opens.
- A turn the session has already answered, however briefly.
- A helper's call. A subagent's `tool.call` carries `agentId`, and a helper owes
  the owner no readback.
- `AskUserQuestion`, which reaches the owner itself. A door refusing it stops a
  session from asking the one thing it needs.

`answerFirst` in `spec/config/level0.json` turns the door off, the way the judge
and the tooth turn off. A rule nobody can turn off stops the tree on the day it
reads something wrongly.

The door sits inside the write door's own `tool.call` hook, after the log line
and before the linting. The engine refuses a second `tool.call` hook carrying no
matcher, so one hook holds both.

## Guidance a variable switches on

A guidance note names the environment variables it waits for:

    env:
      - CLAUDE_CODE_REMOTE
      - SE_CLOUD

Level zero hands that note over where one of them carries a value. A note
naming none binds every box, and `0`, `false` and an empty string count as no
value.

The variable does the deciding, so a new kind of box needs a new note and no
code. `spec/guidance/cloud.md` waits for the two above, which is how a cloud
session reads its own rules and a desk session skips them.

`./RUNME.sh standing` reads the same variables, so setting one shows a person
exactly what that box reads.

## Why rules stay out

A projection writes the rules into a file, and a guard then has to keep that
copy honest. A copy nobody can edit needs no guard.

# The rules Vale cannot hold

Vale reads no `.sh` and no `.ps1`, so a rule over a shell script lives in
`.claude/skills/level0/lib/scripts.js`, and the command line runs it beside Vale's own.

`NoPathInScript` refuses an interpolated path on a line running an inline
script. Git Bash hands node a path beginning `/c/`, node reads it as a folder
under the drive root, and it resolves to a place nobody has. Changing into the
root first and passing a relative path holds under either shell.

That fault stands in this tree twice over: once from a cloud box, and once from
a hand writing the same shape a week before.

# A name holds five words

A heading, a file name, a folder name and a branch name each hold five words at
most. Vale counts a heading, through `ShortHeading`, and refuses a dash or a
colon inside one through `OneTitle`, because both turn one title into two.

Vale reads what a file holds, and its path stays outside that. So
`.claude/skills/level0/lib/names.js` counts a name instead. `work new` refuses a
long branch, and a contract test holds every tracked path.

# A broken rule says so

Vale answers a broken rule file with an `E201`. It writes that to standard
error and leaves standard output empty, so a reader parsing JSON alone finds no
breach.

One broken rule therefore turns every rule in the tree off, and the tree
answers that the rules pass.

`faultIn` in `lib/vale.js` reads that answer, and `./RUNME.sh lint` stops on it.

# Where a rule lives

| folder | holder |
|---|---|
| `spec/config/styles/VoiceVale` | Vale reads it over prose and code |
| `spec/config/styles/VoiceShape` | Vale reads it over the shape of a note or a rule file |
| `spec/config/styles/VoiceJudged` | a model reads it, and no `BasedOnStyles` names it |
| `spec/config/biome.json` | Biome reads it |

`[formats]` in `.vale.ini` maps `yml` to `md`, so Vale reads a rule file at all.
A path-scoped section names which shape rules reach which folder.

The prose rules stay away from a rule file, because such a file lists the very
words they refuse.

Vale errors on a file carrying no `extends` key inside a style it reads. So the
judged rules sit in a folder of their own.

# The fixer calms a shout

`./RUNME.sh fix` runs a round at a time until the tree stops moving. Each round
calms every shout this tree finds, then hands the file to `vale fix --apply`.

Vale carries five actions, and none of them folds case:

| action | what it does |
|---|---|
| `suggest` | offers a spelling |
| `replace` | writes the swap value, expanding `$1` |
| `remove` | drops the match |
| `edit` | trims, replaces, truncates, splits or runs a regex |
| `convert` | lowercases and drops the punctuation |

So `ShoutedLead` carries no action, and `.claude/skills/level0/lib/shout.js` makes the fix
from the line and the column Vale already reports. Vale skips a code fence and
honours an exemption marker, so the finding it hands over carries both for free.

The calming runs first because Vale writes `DON'T STOP AT ALL HERE,` into
`Do not STOP AT ALL HERE,`, which no longer opens with a run of capitals. Round
two then catches the contraction the calming uncovers.

## One replacement per matched text

Two swap entries matching the same text collapse to one, and the first entry
wins for both. So a fix depending on what follows the match belongs to a person.

`etc.` is that case: its full stop ends the sentence as often as it ends the
abbreviation. It sits in `EtCetera.yml`, which carries no action, and the four
short forms that read the same everywhere keep theirs.

## Vale refuses overlapping fixes

Vale drops both fixes and names the overlap. A token reaching past its own word
therefore costs the fix beside it, so every token here stops at its own edge.
