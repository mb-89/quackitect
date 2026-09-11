---
kind: [[design_output]]
describes: [[src/scripts/tools.js]]
---

# What the survey writes

The install writes `.se/tools.json`, and that file says where every tool this
tree calls stands on this box:

    {
      "node": { "path": "/usr/bin/node", "version": "24.19.0" },
      "vale": { "path": "/home/one/quackitect/.se/bin/vale", "version": "3.20.0" },
      "sh":   { "path": "/bin/sh" },
      "go":   null
    }

A tool the box carries nowhere reads as `null`, and the caller carries on
without it. A tool this tree asks no version of carries its path alone.

`.se` is git ignored, so the file stays on the box it describes.

# Reading the path variable

The survey looks in `.se/bin` first, then in each folder the path variable
names. Two variables shape that walk, and neither names a platform:

| variable | says |
|---|---|
| `PATH`, or `Path` | the folders to walk, in order |
| `PATHEXT` | the endings a program carries, and the semicolon splitting them |

A box carrying `PATHEXT` is a Windows box, so the survey splits the path
variable on the semicolon there and on the colon everywhere else.

# Where a caller looks

Every caller takes the path from the survey, and falls back to the guess where
the file is absent:

| caller | reads |
|---|---|
| the command line | `readTools`, then `whereIs` per tool |
| the hooks module | `.se/tools.json` through `$.fs`, at `session.start` |
| `./RUNME.sh doctor` | the survey, and it probes nothing twice |

`whereIs` takes the surveyed path first. It falls back to `.se/bin/<name>.exe`,
then `.se/bin/<name>`, then the bare name. So a clone nobody has surveyed still
finds a tool in `.se/bin`.

# What the survey names

`WANTED` names every tool a caller asks for. `SurveyNamesInstalls` holds it
against the install script: a tool the installer installs stands in the survey.
For details, see [[spec/design_output/tree#the-rules-over-two-files]].

The rule reads the `here()` cases that test a binary, so `editor-link` stays
out of it. A link is no tool.

# Scripts a session writes

A session writing a script of its own puts it under `.se/scripts`. Git ignores
that folder, so the script lives on the box and travels nowhere.

`.se/tools.json` says what such a script may call. A cloud session lists every
script it leaves there in its handover, so a person decides whether one earns a
place in `src/scripts`.
