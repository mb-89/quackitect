---
kind: [[design_output]]
---

# Scope

`src/scripts/tools.js` asks this box where every tool stands. This note covers
the survey it writes, who reads it, and where a session puts a script.

# What the survey writes

The install writes `.se/run/tools.json`, and that file says where every tool this
tree calls stands on this box:

    {
      "node": { "path": "/usr/bin/node", "version": "24.19.0" },
      "vale": { "path": "/home/one/quackitect/.se/run/bin/vale", "version": "3.20.0" },
      "sh":   { "path": "/bin/sh" },
      "go":   null
    }

A tool the box carries nowhere reads as `null`, and the caller carries on
without it. A tool this tree asks no version of carries its path alone.

`.se` is git ignored, so the file stays on the box it describes.

# Reading the path variable

The survey looks in `.se/run/bin` first, then in each folder the path variable
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
| the guidance door | the survey at `session.start`, and it runs the survey where the file is absent |
| `./RUNME.sh doctor` | the survey, and it probes nothing twice |

`whereIs` takes the surveyed path first. It falls back to `.se/run/bin/<name>.exe`,
then `.se/run/bin/<name>`, then the bare name. So a clone nobody surveys still
finds a tool in `.se/run/bin`.

# The session reads the survey

The guidance door reads the survey when a session starts, and runs it first
where the box carries none. At `prompt.context` the block `level0-tools`
rides beside the rules block, one line per tool:

    # What this box has

    - `node` 22.19.0, for a helper script
    - `sh`, for a shell script
    - `mcp__level0__find`: Finds the lines in this tree carrying the words, ranked by the index.

| line | comes from |
|---|---|
| a tool the survey finds | its name, its version, and the `for` its entry in `WANTED` carries |
| a tool level zero registers | its name, and the first sentence of its description |

A tool the box lacks earns no line, so the session reads what stands. The
`for` stands beside the name as data, the way the description stands on the
spec, so each reason lives in one place. The canary counts rules and notes,
and the block changes neither count.

# What the survey names

`WANTED` names every tool a caller asks for. `SurveyNamesInstalls` holds it
against the install script: a tool the installer installs stands in the survey.
For details, see [[spec/design_output/tree#the-rules-over-two-files]].

The rule reads the `here()` cases that test a binary, so `editor-link` stays
out of it. A link is no tool.

# Scripts a session writes

A session writing a script of its own puts it under `.se/scripts`. Git ignores
that folder, so the script lives on the box and travels nowhere.

`.se/run/tools.json` says what such a script can call. A cloud session lists every
script it leaves there in its handover, so a person decides whether one earns a
place in `src/scripts`.
