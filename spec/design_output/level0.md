---
kind: [[design_output]]
---

# Scope

`.claude/skills/level0` is the plugin holding every door. This note covers the
harness surface, the write door, and the standing layer it hands each session.

# What level zero is

A plugin whose hooks are a module. It runs inside the harness process and asks
for no server, so its rules hold on turn one of a clone nobody builds.

`.claude/settings.json` turns it on and git tracks that file, so a clone guards
its first session with nothing typed.

# The harness surface

Every line here comes from running it against client 2.1.263. The
surface is early access and moves, so run it again before you trust this.

The sections below carry their own date where a later run measures them again.

## The file surface renames itself

Measured against client 2.1.267:

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

Measured against client 2.1.267, by a probe writing one file per
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

## A step streams

Measured against client 2.1.269. `turn.step` streams, so its hook
takes `async function* ($, e, next)`, yields the chunks through `yield* next(e)`
and returns the result. A plain `async` hook there fails `claude plugin
validate`, and the client then loads none of the module:

| what a person sees | what stands behind it |
|---|---|
| `claude plugin list` says `√ loaded` | the client adopts the plugin, and refuses its hooks |
| no `.se/level0.stamp` | `session.start` reaches no hook |
| no line in `./RUNME.sh log` | every door in the module stays silent |
| the canary is absent from every answer | the standing layer reaches no session |

So one hook of the wrong shape takes the whole cage off, and the four readings
above are how a person catches it. Run `claude plugin validate
.claude/skills/level0` on the client of the day, because the shape a hook takes
moves with the build.

## A step arrives late

`turn.step` fires at the step's first tool result, so its first call runs
before it. It carries the step's visible text in `answer`.

Measured against client 2.1.267, in a session past 4096 messages: at `tool.call`,
`$.session.messages()` carries no text from the response in flight. The list
also answers its newest 4096 alone, so a position in it shifts.

So the answer gate reads the step first and the transcript second, and lets the
calls of a response in flight pass. For details, see
[[spec/design_output/level0#a-step-carries-the-answer]].

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

`$.fs` reads a file, writes one, lists a folder and answers what stands. It
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

# The layer after a compaction

The layer survives. Measured against client 2.1.269, by the probe
below. A compaction fires `prompt.context` a second time, the hook hands the
same blocks over, and the answer after it carries the canary with its own
numbers.

A second prompt on its own fires `prompt.context` once only, so the event
counts a conversation. That control is what makes the second read a
compaction's own.

## Three roads to a compaction

| road | what it answers on client 2.1.269 |
|---|---|
| `$.command.run({ command: "compact" })` | it holds, and `session.compact` fires inside the call |
| `$.session.compact({ instructions })` | it throws under `-p`: compaction there runs inside a turn |
| two headless runs under `--resume` | untried, because the first road holds |

`$.session.compact` names the reason itself, so a session under the editor
still takes it. The probe takes the command road, which holds in both places.

## What the probe does

`./RUNME.sh probe compact` runs the client headless under `SE_PROBE_COMPACT`,
asks for the canary, and reads the log that run leaves:

1. The hook reads the variable at `session.start`, and stands idle without it.
2. At the first `turn.complete` it runs the compact command, then submits a
   second prompt asking for the canary again.
3. `session.compact` writes a line naming what fires it and how many messages
   it keeps.
4. The re-read of `prompt.context` carries one extra block, which asks for the
   canary a second time and carries none of its numbers.
5. The second answer carries the canary, and `turn.complete` writes the same
   line the first turn writes.

The numbers come out of the standing block alone. So an answer carrying them
proves the block stands in front of the model past the compaction.

## What the probe reads

`readsCompaction` in `src/scripts/probe.js` is a pure function over log rows:

| the log carries | the verb answers |
|---|---|
| a `compact` line, a `re-read` context line, and the canary whole | `survives` |
| a `compact` line, and a canary absent or carrying other numbers | `drops` |
| a `compact` line, and no `re-read` context line | `drops` |
| no `compact` line at `info` | `no compaction`, and the road stands unproven |

The verb exits 0 on `survives` and 1 on anything else.

`test/contract/compact.test.js` drives the verb against the real client. One
run costs ninety seconds and two model calls, so `SE_SLOW` switches it on and
`./RUNME.sh check` stays fast without it.

## Without the verb

The two log lines pay on their own. A session that compacts in the ordinary
course writes a second `context` line in `./RUNME.sh log`, with `reason` at
`re-read`, and a `compact` line beside it. So a person reads a compaction out
of the log with no probe running.

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

The gate holds the scan alone. Measured against client 2.1.267,
by a probe on a cloud clone carrying no trust. The `env` key bites there, and
so does a `permissions` deny rule in `.claude/settings.json`. So the tracked
file still says what a session can do, and level zero is the one part waiting
on the flag.

Read the flag before you read anything else. A second probe the same day, on
client 2.1.42, reads the box around it:

| what a cloud box carries | what the probe reads |
|---|---|
| `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS` | `1`, so the switch stands ready |
| `hasTrustDialogAccepted`, per project | `false`, and the top level holds no key |
| permission mode | auto, and no call there raises a prompt |

Two things reach a cloud box today:

- `claude --plugin-dir .claude/skills/level0`, which loads the folder for that
  session and skips the scan.
- A box whose setup writes the trust flag into `~/.claude.json` before the
  session starts.

The canary finds this. A session saying the line out loud is a session level
zero holds, and a cloud session that starts the ordinary way says nothing.

Client 2.1.267 stands the same way, measured on a cloud box. The
debug log names the count, and `.se/level0.stamp` stands nowhere in the tree:

    [plugins] Found 1 plugins (1 enabled, 0 disabled)
    [plugins] Registered 0 hooks from 1 plugins

The one plugin it counts belongs to the client. So a branch measuring what a
hook costs at `session.start` measures the module itself here, and says which
door it takes.

## The setup writes the flag

`src/scripts/trust.js` writes it where the tree and `node` both stand to hand.
A cloud environment carries neither at setup time. Measured against client
2.1.267: a
setup naming `node src/scripts/trust.js` fails, and the session ends at
`init_script` with no first turn. A failing setup takes the session with it, so
the one an environment carries leans on nothing:

    #!/bin/bash
    set -u
    repo="$PWD"
    [ -d "$repo/.git" ] || repo=/home/user/quackitect
    python3 - "$repo" <<'PY' || true
    import json, os, sys
    folder = sys.argv[1]

    def merge(path, change):
        try:
            said = json.load(open(path))
        except Exception:
            said = {}
        change(said)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        tmp = path + ".tmp"
        json.dump(said, open(tmp, "w"), indent=2)
        os.replace(tmp, path)
        return path

    def trust(said):
        said["hasTrustDialogAccepted"] = True
        said.setdefault("projects", {}).setdefault(folder, {})["hasTrustDialogAccepted"] = True

    def auto(said):
        said.setdefault("permissions", {})["defaultMode"] = "auto"
        said["skipAutoPermissionPrompt"] = True

    print("trusted", folder, "in", merge(os.path.expanduser("~/.claude.json"), trust))
    print("auto mode in", merge(os.path.expanduser("~/.claude/settings.json"), auto))
    PY
    exit 0

Both readers mark this folder one the client trusts, and both leave every other
key and every other project alone. The `exit 0` holds a session up where the
write fails. Nothing races either one, because the setup runs before a session
holds the file.

## Where the mode stands

The client takes `permissions.defaultMode` values `auto` and `bypassPermissions`
from user settings, and from the settings an organisation controls. A project
file naming either one changes nothing. So the setup writes
`~/.claude/settings.json`, and `.claude/settings.json` carries the allow list by
itself.

| what a file sets | project settings | user settings |
|---|---|---|
| `permissions.allow` | it holds | it holds |
| `permissions.defaultMode: auto` | the client passes it by | it holds |

A routine meeting a prompt stalls until a person looks. So an unattended box
takes its mode from the setup.

A box carrying that setup says the canary out loud. Measured against client
2.1.267, on
a cloud box cloning `main`:

| what a box answers | with no setup | with the setup |
|---|---|---|
| `hasTrustDialogAccepted` | false | true |
| `claude plugin list` | the scan skips one folder | level zero loads |
| the canary line | absent | the session says it |
| the cloud guidance | absent | the standing layer carries it |

The scan happens once, at the start, so a session already under way needs one
more step. The client names it in the same line the probe read: once the trust
stands, `/reload-plugins` loads what qualifies, and a relaunch does the same. A
person types that, so the setup stays the road for a box nobody watches.

The flag sits in the home of the box, which a cloud box puts at `/root` while
the tree sits under `/home/user`. So the script reads `HOME` for the path, and
it prints the file it writes for the setup log to carry.

# The write door

`tool.call` reads every Write and Edit. A breach comes back as `{ deny }`
naming the rule, the line and the phrase.

| what the write carries | what reads it |
|---|---|
| a run or a token out of a note under `.se/notes` | [[spec/design_output/private#the-door-reads-the-notes]] |
| prose | Vale, then the judge |
| code | Biome |
| a shell command landing a file | [[spec/design_output/bash]] |

The private half answers first, so a note's own words stop at the door. The
refusal closes by asking the writer to hold that rule for the rest of the turn.
A refusal teaching one line costs a round trip on every line.

## The door reaches a helper

A subagent's writes go through the same `tool.call` chain, so the door reads
them the way it reads the session's own. A live run against client 2.1.267
watches it
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

## The path a rule reads

Hand every rule the path the repo root holds. Vale scopes on it, and the judge
scopes on it.

| what the client sends | what the door hands on |
|---|---|
| `C:\...\quackitect-v5\spec\rationales\a.md` | `spec/rationales/a.md` |
| `spec/rationales/a.md` | `spec/rationales/a.md` |

Keep every folder in that path, so `[spec/rationales/*.md]` and each other
`.vale.ini` section matches what Vale reads at `--path`.

Ask git for the root once a session, through `git rev-parse --show-toplevel`,
and take it off the front with `relativeTo`. Leave the path whole where the box
answers nothing.

## A judged rule scopes

Give a judged rule `ignores`, holding one glob a line. The judge asks the model
nothing for a file those globs reach.

    ignores:
      - spec/rationales/*.md

List a folder there where the rule's question misreads its job. `Actionable`
ignores `spec/rationales` and `spec/design_output`, and stands everywhere else.

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

## The canary owes a debt

The log alone holds nobody. A session skipping the line runs free to the end,
and the owner reads the failure long afterwards. So the sentence carries a
debt, and the cage holds the session to it.

The debt opens where the first `turn.complete` carries an answer the canary is
absent from. `canaryIn` answers `same`, `other` or `none`. The first one alone
pays. A line with other counts comes out of a block the session lacks, so it
owes what silence owes.

While the debt stands, `tool.call` behaves the way the owner's prompt door
behaves. For details, see [[spec/design_output/level0#one-warning-then-a-refusal]].

| the call | what it meets | the `gate` line |
|---|---|---|
| the first | a warning after its result | `warned <tool> before the canary` |
| every one after | a refusal naming the debt | `refused <tool> before the canary` |

The refusal carries the sentence itself, so the session reads what to say. Any
later answer holding it clears the debt. That answer writes the `info` line the
whole canary writes, and every call passes again.

Two roads stay open, because this session's own debt reaches past both:

- a subagent carries a canary of its own, so `e.agentId` passes
- `AskUserQuestion` is the road to the owner, so `reachesTheOwner` passes
- `godPasses` wraps the door, so the binding at `god` passes the refusal

The probe after a compaction pays nothing. It reads the canary through
`heardCanary` on a session holding the line already, so a second debt stays
shut.

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

The door marks what a person waits for, and holds every `tool.call` while
nothing reaches them. Text the session writes after the mark answers it,
and `turn.complete` clears the mark.

Whether an answer stands comes out of `$.session.messages()`. The mark notes how
many messages stand when it goes down, and text from the session past that
point answers it. Text from before the mark answers an older demand, and counts
for nothing.

## What counts as owed

- A prompt a person opens a turn with, at `prompt.submit`.
- An update a person asks for: `ask.wanted` moving away from `quiet`.
- A hold: `stop.hold` moving to `stopped`.

The hook reads the two keys at every `tool.call`, so a button pressed mid-turn
reaches the next call. The latest demand replaces the one before it, and starts
with a warning of its own.

## One warning, then a refusal

The response in flight when a demand lands can carry the answer, and its text
reaches the hook only once the response completes. So every call of that
response passes.

A response completing with no text leaves the demand open. The next call runs,
and carries a warning the session reads after the tool's result. The warning
names what the person waits for. The call after it stands refused, and every
call after that, until an answer stands.

Each writes a `gate` line at `warn`: `warned Read before an answer`, then
`refused Read before an answer`, with the demand in the detail.

## A step carries the answer

`turn.step` hands the hook each response once its blocks stand, with its
visible text in `answer`. Text there answers the demand, and the hook writes it
as the `answer` line. For details, see
[[spec/design_output/log#the-answer-under-its-prompt]].

The transcript stands behind the step. `$.session.messages()` answers its newest
4096 messages alone, so the door remembers the last answer standing when the
demand lands, and text after that one answers it. A position in the list shifts
as the window slides, so the door counts none.

## The owner binds god

`engine.binding` at `god` takes every refusal level zero holds out of the way.
The hook wraps every `tool.call` it registers. Where a hook refuses and the
binding reads `god`, the call goes on. A `god` line names the refusal it passes.
The answer gate, the write door, the trunk guard and the cage all pass.

The binding comes out of the config layers at the moment of the refusal, so a
button press reaches the next call. The sidebar shows the binding in the status
bar. For details, see [[spec/design_output/extension#the-status-bar-says-it]].

## Which prompt opens a turn

`e.origin.kind` says who asks. Seven kinds carry a person:

- `composer`, `bridge` and `sdk`
- `scheduled-trigger` and `slack-ping`
- `channel` and `auto-continuation`

A routine's prompt belongs to the person behind it.

Every other kind is a machine talking to the session, and a machine waits. The
tooth submits prompts under `plugin`, and a session owes no readback to itself.

`unclassified` stays out. The engine hands it both a person's socket and its own
delivery receipts, so a door reading it bites the wrong turn.

## What the refusal says

    The owner sent a prompt. The owner asked something and nothing has
    answered it. Say back what you understood and what you do next, then work.

The refusal opens with the demand. The rest is the rule in its own words, and a refusal quoting the rule teaches it
better than a refusal naming it.

## Where it must not bite

- A turn nobody opens.
- A turn the session has already answered, however briefly.
- A helper's call. A subagent's `tool.call` carries `agentId`, and a helper owes
  the owner no readback.
- `AskUserQuestion`, which reaches the owner itself. A door refusing it stops a
  session from asking the one thing it needs.

`answer.enabled` in `spec/config/level0.json` turns the door off, the way the judge
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

# The gate reads the answer

The turn's end runs the answer through Vale under the `*answer.md` section of
`.vale.ini`, and the score of what comes back cuts into three bands. The reply
already stands on screen when `turn.complete` fires, so the gate refuses
nothing. It re-prompts, it carries a line into the next prompt, or it does
nothing at all.

The measurement behind the bands stands in
[[spec/funnel/a-paragraph-has-a-schema]].

## The score is a rate

The score of an answer is its findings a thousand words, over the words standing
outside every fence. A fence belongs to the formatter and the compiler, so it
counts for nothing on either side of that division.

A short answer scores high on one finding. Twenty words and one finding read as
fifty, which stands over the ceiling. So the owner tunes the two values against
the answers a session really writes.

## The three bands

`answer.warnAt` and `answer.ceiling` in `spec/config/level0.json` hold the two
edges, and the score falls in one of three bands:

| the score | what happens |
|---|---|
| under `warnAt` | nothing |
| from `warnAt` to the ceiling | the findings ride the next prompt as one line |
| at the ceiling or over it | one re-prompt saying rewrite, once per turn |

An answer carrying no finding reads clean, whatever its length. Every band
writes one `answer` line naming the score, the findings and the count.

## The re-prompt over the ceiling

A re-prompt is a `$.prompt.submit` from the hook, the way the tooth does it.
Three things hold the count at one:

- A lock per turn. A second turn end inside one turn submits nothing, and the
  findings wait instead.
- `stop.mostInARow`, which caps the re-prompts the way it caps the tooth. The
  next prompt from a person drops the count.
- The tooth itself. One prompt goes out per turn end, and where the tooth holds
  the turn open that prompt belongs to it. The findings wait for the next one.

The prompt carries the findings in the wording `refusal` in `lib/refuse.js`
already uses, because a refusal quoting the rule teaches it better than a
refusal naming it. The door holding the owner's prompt first reads
`e.origin.kind`, and a plugin prompt is a machine, so that door owes this one no
readback.

## The carry rides a prompt

Under the ceiling the findings wait for the next prompt a person sends, and ride
it as one line under the text. The line names the score and every rule behind
it, and asks the session to hold those rules for the rest of the turn.

The findings ride once. A prompt from a machine leaves them waiting, so the line
reaches a person's turn and no other.

## The gate holds its state

`gateOf` in `lib/answer.js` holds the lock, the count and the findings waiting,
and the hook hands it one reading per turn end. It mirrors the tooth. A prompt
from a person drops the count, and a prompt of the hook's own leaves it standing.
The turn's end answers what comes next.

## What the gate says

    The voice rules refuse this answer. Write it again.

      the score is 50 findings a thousand words.

      level0-answer.md:1:7  PastTense
        wrote: was
        Write the present tense: 'was'.

    Hold PastTense for the rest of this turn: apply the same rule to every line
    you write next, and fix the lines you already wrote if they break it.

## The tool reads a draft

`check_answer` takes one draft, runs it through the answer register as
`level0-answer.md`, and answers the findings in the wording above. A draft
coming back clean meets the gate clean, so the tool closes the gap a gate
refusing nothing leaves open.

The tool registers beside `claim_stop` at the session's start, and
`spec/guidance/working.md` carries the line that sends a session to it.

# The rules past one buffer

Vale hands a rule one buffer, so a rule weighing two files stands outside it.
Vale reads a shell script once `[formats]` names the ending, and the leading dot
carries that mapping: `.ps1 = md` reads the file, and a bare `ps1 = md` answers
`unsupported extension`.

Both kinds reach a person the same way, through the command line and the panel:

| the rule | where it lives |
|---|---|
| a rule weighing two files | `.claude/skills/level0/lib/tree.js` |
| a rule over a shell script | `spec/config/styles/VoiceScript` |

For details, see [[spec/design_output/tree#the-rules-over-two-files]].

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
long branch, and `NameHoldsTheWords` holds every path git tracks.
For details, see [[spec/design_output/tree#the-rules-over-two-files]].

The config holds the cap as `names.words`, and the caller hands it to
`overLong`.
For details, see [[spec/design_output/config#a-caller-hands-it-in]].

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
| `spec/config/styles/VoiceScript` | Vale reads it over a shell script |
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

# What the cage loads

Level zero fills its state once: the linter it runs, the config it reads, the
guidance it hands over, the rules the tooth votes on. Every door then reads that
state.

A session filling none of it holds every door open. `bin` stands at null, the
write door skips the lint inside `if (bin)`, and the call passes. The tree reads
green throughout, because `./RUNME.sh check` carries its own Vale and asks the
plugin nothing.

So the load stands in `loadCage`, and it answers two questions in place of one:

| the load meets | the cage answers |
|---|---|
| a linter it finds | the write door reads a write |
| a linter it misses | the cage holds nothing |
| guidance it reads | the session carries the rules |
| guidance it misses | the cage holds nothing |

Every fault goes into one list, and the throw comes last, so a cage missing one
thing still holds everything else it reads.

`ensureCage` wraps that load in a `try`, and any door asks it. The first door to
ask pays for the load, and the rest take the answer. A session the harness
resumes carries no `session.start`, so the first `tool.call` loads the cage
instead, and the session mends itself before it writes anything.

The engine refuses `$` handed to a function nested inside `register`, so both
stand at the top of the file and take the state as an argument.

# God mode

A cage holding nothing says so, and refuses the work until somebody mends it.
`.se/level0.health` carries that answer:

    { "ok": false, "why": "no vale stands here", "at": "..." }

While `ok` reads false, the door refuses every call except the ones that mend
the cage:

| the call | god mode |
|---|---|
| a write under `.claude/skills/level0/` | passes |
| a shell command landing no file | passes |
| a read, a search, a question to the owner | passes |
| every other write, and every other command | refuses |

The refusal names the fault and the road out, so a session that meets it reads
what to do. A door refusing everything shuts the road that mends it, and
the session stands there for good.

The mend clears itself. `ensureCage` retries while the answer reads false, so
the first call after a repair loads the rules again, writes `ok: true`, and says
`the cage holds again` to the log. The install runs once, and a retry costs a
read.

## What stands outside

A module failing to import registers no door at all, and every door inside it
stays silent about that. Two things outside the process answer in their place:

- `./RUNME.sh check` reads `.se/level0.health` and goes red where it reads
  false. `doctor` prints the same line.
- `test/contract/loads.test.js` imports the module, calls `register`, and names
  every door it expects. A file carrying a conflict marker fails that test,
  because a merge writes those into the very file the cage lives in.

`.github/workflows/check.yml` runs both on a machine with no stake in it.
