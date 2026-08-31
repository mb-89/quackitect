# quackitect v4

Level 0. Nothing above it exists yet.

## Install

    util\setup\install.ps1        Windows
    util/setup/install.sh         Linux

Run it once. After that, everything goes through RUNME:

    .\RUNME.ps1 --help            Windows
    ./RUNME.sh --help             Linux

RUNME is the one command that always works. It installs what has to be
installed and hands every argument to the command line interface. Ask it what
it takes.

## What is here

See `doc/cross-cutting/cross-cutting-design.md`.

| Entry | What it is for |
|---|---|
| `doc/` | The design, as it was collected, the guidance the agent is told, and the work. Start with `user-stories.md`. Not specification. |
| `source/` | Everything that is written. `engine`, `viewer`, `extension`. |
| `util/` | Everything that is run rather than shipped. `setup`, `cage`, and `scratchpad`, which is throwaway and not in version control. |
| `.bin/` | Built programs. Rebuilt from source, and not in version control. |

`.se/` holds private material. Dated reports and measured evidence live there
and never travel.

`doc/coverage.md` maps every story and every case to the test that proves it.
`doc/open.md` names what no test proves yet, and why.

## Which folder do I open

**To work on v4 itself:** open this folder. The method root and the work root
are then the same tree, which is the ordinary self-hosting case.

**To work on anything else:** open that folder. It does not have to contain
anything. On the first start it gets a `.se/` folder, and inside it a
`project.json` naming the copy that drives it.

`.se/` is the marker that a folder is a project this system has worked on.
