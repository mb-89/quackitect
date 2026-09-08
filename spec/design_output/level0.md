---
kind: [[design_output]]
describes: [[src/level0]]
---

# What level zero is

A plugin whose hooks are a module. It runs inside the harness process and asks
for no server, so its rules hold on turn one of a clone nobody has built.

`.claude/settings.json` turns it on and git tracks that file, so a clone guards
its first session with nothing typed.

# The harness surface

Every line here comes from running it on 2026-09-08 against client 2.1.263. The
surface is early access and moves, so run it again before you trust this.

## A tool argument arrives on the event

A tool's arguments sit on the event beside `tool` and `tool_use_id`, so a write
carries `e.content` and `e.file_path`. Reading `e.input` answers `undefined`,
the hook finds nothing, and the write proceeds. The rule then looks like a
feature nobody built.

## The engine interface takes no computed access

`claude plugin validate` refuses `$[noun]` and `$.fs?.read` by reading the
source. Spell every call `$.noun.method(...)` at the call site, and give `on` a
literal event name.

## A module may import a sibling

So the rules live in `lib` as one copy that the module and the command line both
load. Keep `lib` free of `node:` imports, because the module's environment
carries none.

## The filesystem noun writes and reads

`$.fs` offers `readFile`, `writeFile`, `listDir`, `exists`, `stat` and
`ancestors`. It deletes nothing, so a delete goes through `$.process.run`.

## A session cannot see its own install

A plugin loads once per process at session start, so the session that changes
the module runs the old one. `claude --init-only` fires no `session.start`, so a
probe costs one `-p` turn and one model call.

# The write door

`tool.call` reads every Write and Edit. Prose goes to Vale, code goes to Biome,
and a breach comes back as `{ deny }` naming the rule, the line and the phrase.

The refusal closes by asking the writer to hold that rule for the rest of the
turn. A refusal teaching one line costs a round trip on every line.

## The formatter applies itself

A formatter that asks permission is a formatter somebody skips. So the door
sends a code write through Biome and passes the formatted text on with
`next({ ...e, content })`.

The agent writes its own text and the tree stores what the formatter says, the
way a save-time formatter works for a person.

## The judge costs a model call

Vale and Biome run first, because they cost nothing. The judge asks a model one
question per span, so it runs where the patterns already passed.

It reads every span of the first writes in a session, then samples. A breach
puts it back to reading everything.

# The standing layer

`prompt.context` computes the blocks a conversation's first message carries. It
fires once, and again when the context clears, which is where the guidance, the
handover and the receipt arrive.

The system prompt's sections stay free for guidance that depends on where the
work stands.

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

## Why the rules stay out of the tree

A projection writes the rules into a file, and a guard then has to keep that
copy honest. A copy nobody can edit needs no guard.

# Where a rule lives

| folder | holder |
|---|---|
| `spec/config/styles/VoiceVale` | Vale reads it, because `.vale.ini` names the style |
| `spec/config/styles/VoiceJudged` | a model reads it, and no `BasedOnStyles` names it |
| `spec/config/biome.json` | Biome reads it |

Vale errors on a file carrying no `extends` key inside a style it reads. So the
judged rules sit in a folder of their own.
