---
kind: [[funnel]]
about: where the rules live, and the shapes the owner weighs
---

# Scope

A rule in this tree lives in one of several homes, and each home names a rule
its own way:

| home | how a firing names itself |
|---|---|
| `VoiceVale/*.yml` | a style name, such as `PastTense` |
| `VoiceShape/*.yml` | a style name, such as `StopRule` |
| `VoiceScript/*.yml` | a style name, such as `NoPathInScript` |
| `VoiceParagraph/*.yml`, projected from the paragraph schema | a style name, such as `Modal` |
| `spec/guidance/*.md` | a note and a number, such as `voice 4` |

`./RUNME.sh rules` names the rules each home holds. Scope splits the same way,
and a Vale rule takes its paths from a `.vale.ini` section.

The schemas under `spec/schemas` hold the shape of each kind of note, so a
document keeping its shape stands answered. For details, see
[[spec/design_output/schema]]. Rule identity stays open, and this note holds
the shapes for it. The owner weighs them, and none stands settled.

# Two shapes stand open

| shape | what moves | what it costs |
|---|---|---|
| one table holds every rule | every rule | a migration of every rule file |
| an editor draws them | nothing | a reader looks, and edits elsewhere |

# One table holds every rule

Every rule becomes an entry in one source. A projection writes that entry into
each Vale folder, into `.vale.ini`, and into a guidance note per group. A
webview writes values, so a person switches a rule off, retunes a limit, or
changes the reaction.

The owner settles two pieces of this already. A rule holds its own limit and
names the paths it reads. A rule answers to a name, and the projection numbers
a note when it draws one.

| what it gives | what it costs |
|---|---|
| one place holding every rule | every rule file moves |
| one identity for a firing | the guidance notes stop being sources |
| a level adds a rule as data | the projection grows a target per tool |

The risk sits in the size. The rules work today, and this shape rewrites how
all of them load to gain a surface nobody has yet.

# An editor draws them

Everything stays where it stands. One webview reads every home and draws every
rule in one place, with its group, its scope, its limit and its level.

| what it gives | what it costs |
|---|---|
| one place to look | switching a rule off means editing a file |
| no migration | identity stays split across the homes |
| a small build | the surface goes stale where a home changes shape |

A read-only draw answers the question the owner asks most: what rules stand,
and what do they say.

# What every shape shares

Whichever shape wins, these hold:

| the piece | where it stands |
|---|---|
| every firing writes a row naming the rule, the path and the line | built, in the door log |
| the retro reads those rows and ranks what fires | built, as `./RUNME.sh voice refused` |
| a rule carries a test proving it fires, and an argument in a rationale | holds rule by rule |
| a count catches a rule that misreads | open: the paragraph schema declares `misreads`, and no code reads it |

# What decides it

Ask whether a rule wants managing or seeing.

A rule that wants managing needs one place that owns it, so the table earns its
migration. A rule that wants seeing needs a window, and the editor gives that
for a fraction of the work.

# What stands open

| the question | what hangs on it |
|---|---|
| Managing or seeing | Which of the two shapes lands |
| One file per rule, or one per group | Whether two boxes adding a rule meet in one file |
| Whether `.vale.ini` survives as a target | `reads` on a rule makes its sections a projection |
| Whether config leaves the sidebar | The owner watches the sidebar first |
