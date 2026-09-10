---
kind: [[funnel]]
about: where the rules live, and three shapes the owner weighs
---

# The rules live apart

A rule in this tree lives in one of four homes, and each home names a rule its
own way:

| home | count | how a firing names itself |
|---|---|---|
| `VoiceVale/*.yml` | 16 | a style name, such as `PastTense` |
| `VoiceShape/*.yml` | 5 | a style name, such as `JudgedRule` |
| `VoiceJudged/*.yml` | 1 | a style name, such as `Actionable` |
| `spec/guidance/*.md` | 58 | a note and a number, such as `voice 4` |

Scope splits the same way. A Vale rule takes its paths from a `.vale.ini`
section, and a judged rule takes them from `reads` inside the rule file.

This note holds three shapes for fixing that. The owner weighs them, and none
of them stands settled.

# Three shapes stand open

| shape | what moves | what it costs |
|---|---|---|
| one table holds every rule | every rule | a migration of 22 rule files |
| the schema holds the shape | nothing | it answers a different question |
| an editor draws them | nothing | a reader looks, and edits elsewhere |

# One table holds every rule

Every rule becomes an entry in one source. A projection writes that entry into
`VoiceVale`, into `.vale.ini`, into `VoiceJudged`, and into a guidance note per
group. A webview writes values, so a person switches a rule off, retunes a
limit, or changes the reaction.

The owner settles two pieces of this already. A rule holds its own limit and
names the paths it reads. A rule answers to a name, and the projection numbers
a note when it draws one.

| what it gives | what it costs |
|---|---|
| one place holding every rule | 22 rule files move |
| one identity for a firing | the guidance notes stop being sources |
| a level adds a rule as data | the projection grows a target per tool |

The risk sits in the size. The rules work today, and this shape rewrites how
all of them load to gain a surface nobody has yet.

# The schema holds the shape

v4 carries `spec/schemas/guidance.schema.yaml`, and this tree carries nothing
like it. It reads the frontmatter as JSON Schema, and the body as ordered
sections, each with its own tense and its own limits:

    - header: Actionables
      required: true
      list: true
      ordered: true
      tense: present
      maxItems: 15
      maxWordsPerItem: 25

This answers a question the rules leave open. A document meets a refusal for
its shape, so a handover, a rationale and a guidance note each hold their own
form. Three of today's rules exist because no schema does.

| what it gives | what it costs |
|---|---|
| a document keeping its shape | rule identity stays split |
| a home for a limit that varies by kind | a firing still names a style alone |
| `kind` in the frontmatter earns its keep | one more thing at the write door |

This shape stands beside either other one. It answers document shape, and the
table answers rule identity, so taking the schema blocks nothing.

# An editor draws them

Everything stays where it stands. One webview reads all four homes and draws
every rule in one place, with its group, its scope, its limit and its level.

| what it gives | what it costs |
|---|---|
| one place to look | switching a rule off means editing a file |
| no migration | identity stays split across four homes |
| a week of work, at most | the surface goes stale where a home changes shape |

A read-only draw answers the question the owner asks most: what rules stand,
and what do they say.

# What every shape shares

Four things hold whichever shape wins:

1. Every firing writes a row naming the rule, the path and the line. The door
   log carries rows of that shape today.
2. The retro reads those rows and ranks what fires. No verb reads them now.
3. A rule carries a test proving it fires, and an argument in a rationale.
4. A count catches a rule that misreads. `PastTense` misreads eleven words in
   one session, and a person catches all eleven. The exceptions land on `main`,
   and the count that finds the twelfth stands nowhere.

# What decides it

Ask whether a rule wants managing or seeing.

A rule that wants managing needs one place that owns it, so the table earns its
migration. A rule that wants seeing needs a window, and the editor gives that
for a fraction of the work.

The schema sits outside that question, and the owner likes it on its own
merits. So take it first, and let the answer to the other question wait.

# What stands open

| the question | what hangs on it |
|---|---|
| Managing or seeing | Which of the three shapes lands |
| One file per rule, or one per group | Whether two boxes adding a rule meet in one file |
| Whether `.vale.ini` survives as a target | `reads` on a rule makes its sections a projection |
| What a `lint` rule looks like as an entry | Eleven of them stand on a branch already |
| Whether config leaves the sidebar | The owner watches the sidebar first |
