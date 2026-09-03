# quackitect v4

An engine that records and guards an agent's session, and the work tokens the
agent pulls. Everything that was planned around it, and may or may not have
happened, is in `dev_guide/`.

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

| Entry | What it is for |
|---|---|
| `doc/` | The guidance the agent is told. Start with `guidance/voice.md`. |
| `src/` | Everything that is written. `engine`, `viewer`, `extension`, `mcp`, and the schemas and processes the engine reads. |
| `util/` | Everything that is run rather than shipped. `setup`, `cage` and `checks`. |
| `dev_guide/` | Design notes, plans and drafts. Not the product, and not kept current. |
| `.bin/` | Built programs. Rebuilt from source, and not in version control. |

`.se/` holds private material, and it never travels. Dated reports, measured
evidence, the record, the index, ephemeral work, and `scratchpad/` for anything
throwaway.

`sh util/checks/battery.sh` runs every check, and says whether the tree is
sound. What is not done yet is work, so it is a token. Ask the engine.

## Which folder do I open

**To work on v4 itself:** open this folder. The method root and the work root
are then the same tree, which is the ordinary self-hosting case.

**To work on anything else:** open that folder. It does not have to contain
anything. On the first start it gets a `.se/` folder, and inside it a
`project.json` naming the copy that drives it.

`.se/` is the marker that a folder is a project this system has worked on.
