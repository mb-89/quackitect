---
kind: [[rationale]]
---

# Why

The owner rules that every fact lives in one place. Two voice rules carry it:
say a thing once, and write no count a command answers. The tree breaks both,
so this audit walks it and writes down every break.

## 1. What the audit reads

The walk covers the design notes, the guidance, the config, the schemas, the
processes, `.vale.ini` and the comments in code. It leaves `spec/rationales`,
`spec/design_input` and `spec/funnel` alone, because those carry history or
the owner's words. It reads for three kinds of break:

| kind | what it reads for |
|---|---|
| restated | prose saying what a config, rule, schema or code header beside it says |
| count | a number in prose that a file holds or a command answers |
| two files | one fact in two files, or two files that disagree |

## 2. The findings

| where | repeats | one place | fix |
|---|---|---|---|
| `stop.md`, the vote table | every rule with its priority | `spec/config/stop/level0.yml` | cut, pointer |
| `stop.md`, the quoted entry | one rule as YAML | the same file | cut |
| `stop.md`, "at fifty", "at 85" | two priorities | the same file | cut |
| `level0.md`, where a rule lives | the style folders and `[formats]` | `.vale.ini` | pointer |
| `tree.md`, `[formats]` | the shell endings | `.vale.ini` | pointer |
| `level0.md`, the owner's prompt | the first rules of working | `spec/guidance/working.md` | pointer |
| `private.md`, the roles | rule 12 of voice | `spec/guidance/voice.md` | cut |
| `extension.md`, the `hold` excerpt | one schema entry, with a stale column | `spec/config/level0.schema.json` | cut |
| `extension.md`, the buttons table | icon, enum and gesture per key | the same schema | cut |
| `extension.md`, the gesture table | the enum order | the same schema | cut |
| `extension.md`, the hold table | what each hold value does | `stop.md`, the hold | cut |
| `extension.md`, "priority 85, at 80" | two priorities | `spec/config/stop/level0.yml` | cut |
| `extension.md`, the report chapters | the chapter names | `spec/config/status.yaml` | pointer |
| `extension.md`, "two presses" | a gesture the schema names otherwise | the schema `gesture` | cut |
| `log.md`, the level ladder | what each level writes | the `log` comment in `level0.json` | pointer |
| `viewer.md`, the level ladder | the same, a third time | `log.md` | cut, pointer |
| `work.md`, "reads `12h`" | a default | `spec/config/level0.json` | pointer |
| `doors.md`, the passing modules | the rule's exceptions | `VoiceVale/DoorsOnly.yml` | pointer |
| `projection.md`, the rule-file table | every file of the folder | `spec/config/styles/VoiceParagraph` | pointer |
| `projection.md`, "three options" | an enum's size | the schema | generic |
| `level0.json`, the section comments | the `help` of each key, and a folder the tree lacks | the schema | trim |
| `guidance.schema.yaml`, the bound | a rule name and 25 words | `spec/schemas/paragraph.schema.yaml` | pointer |
| `ticket.schema.yaml`, "five words" | the name cap | `names.words` | pointer |
| `level0.md`, the `src/bridge` table | what each file holds | the file headers | cut |
| `extension.md`, the file list | what each file holds | the file headers | cut |
| `index.md`, the file table | what each file holds | the file headers | cut |
| `status.js`, "four chapters" | a count of the shape | `spec/config/status.yaml` | cut |
| `config.md`, the layers table | the order of layers | the note | left: the note holds the mechanism |
| `viewer.md`, the keys | the keys, also in the schema and `help.go` | the viewer | left: wants a projection |
| `group.yaml`, the header | what a group is, also in `work.md` | the process | left: the mint copies it |
| `shout.js`, the header | Vale's five actions, also in `level0.md` | the note | left: a header says what the file is for |
| headings naming three lists, places, layers | a design shape, anchored from code | the notes | left: the count names the shape |
| `level0.md`, "five words" | the name cap | `names.words` | heading, anchors |
| `bash.md`, "holds five" | the name cap | `names.words` | heading, anchors |
| `pull.md`, five answers and checks | the size of two lists | the verb | headings, anchors |
| `pull.md`, "four pools" | the size of a list | the list | cut |
| `apply.md`, "five verbs" | the size of a table | the table | heading, anchor |
| `review.md`, "five questions" | the size of a note | `spec/guidance/review/reviewing.md` | heading, anchor |
| `bash.md`, "five rules", "five sticks" | the size of a table | the table | cut |
| `doors.md`, "there are five" | the doors | `./RUNME.sh doors` | cut, command |
| `doors.md`, "two more" | the contract tests | the folder | cut |
| `schema.md`, "six files" | the schemas, and the count is stale | the folder | cut |
| `schema.md`, "all seven" | the size of a table | the table | cut |
| `schema.md`, "three fields" | a heading over a table of four | the table | heading, anchors |
| `work.md`, "six things" | a count over a list of seven | the list | cut |
| `level0.md`, "three readings", "four readings" | the size of two tables | the tables | cut |
| `level0.md`, "two things" | the size of a list | the list | cut |
| `level0.md`, "two roads" | a count over a list of three | the list | cut |
| `level0.md`, "seven kinds" | a constant | `opensATurn` in `lib/answer.js` | pointer |
| `level0.md`, "12 words" | a constant | `CELL_WORDS` in `lib/answer.js` | pointer |
| `level0.md`, "ten words where sixteen" | the size of a list | `spec/schemas/paragraph.schema.yaml` | pointer |
| `stop.md`, "under 10 tool calls" | a constant | `FRESH` in `lib/stop.js` | pointer |
| `config.md`, the magic number counts | what the linter answers | `./RUNME.sh lint` with the rule on | command |
| `config.md`, "stay at two" | the recommended extensions | `.vscode/extensions.json` | pointer |
| `index.md`, "four folders" | a constant | `index.go` | pointer |
| `index.md`, "twenty families" | a constant | `find.go` | cut |
| `index.md`, "Zig 0.16.0" | a pin | `src/scripts/install.sh` | pointer |
| `editor.md`, "3.20.0" | a pin | `src/scripts/install.sh` | cut |
| `editor.md`, the asset matrix | a constant | `lib/servers.js` | cut |
| `vehicle.md`, "73 of 73" | a test count | the test run | cut |
| `log.md`, "80 characters" twice | a constant, twice | `lib/log.js` | one mention |
| `extension.md`, "800ms", "600ms" | two constants | `lib/gesture.js` | pointer |
| `projection.md`, "fifteen targets" | a measurement | the note | left: the argument stands on it |
| `config.md`, the cost table | a measurement | the note | left: the argument stands on it |
| `private.md`, six, twelve and eight | thresholds the note argues for | `COPY_RUN` in `lib/private.js` | left: the argument is the note's job |
| `private.md`, "twelve seconds" | a measurement | the note | left: the argument stands on it |
| `working.md`, "sixty words" | the tool's own threshold | the `check_answer` description | left: the actionable carries its trigger |
| `extension.md`, "five columns" | a constant | `lib/grid.js` | left: the refusal beside it says the width |
| code headers counting their contents | what the file holds | the file | left: a header says what the file is for |
| `src/bridge/config.js`, the anchor | `#three-layers`, a heading that stands nowhere | `config.md` | anchor |
| `level0.md`, `.claude/settings.json` | "turns it on" and "names it nowhere", in one note | the owner | left: the owner decides |

## 3. What the numbers say

| kind | found | fixed | left |
|---|---|---|---|
| restated | 32 | 27 | 5 |
| count | 37 | 30 | 7 |
| two files | 2 | 1 | 1 |

Three of the counts drift from the list under them, and two copied values
disagree with the file they copy. So the retro gains a checklist item in every
process. A fact the change adds stands in one place, and a note points at the
file.
