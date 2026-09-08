# quackitect v5

A system that shapes how an agent works, starting from the layer that holds
before anything else does.

This is v5. It is an orphan rewrite and carries nothing forward from v1 to v4,
which stand on their own branches. It starts at level zero.

## Level zero

Level zero is the rules that shape what the agent writes. It runs as a plugin
whose hooks are a module, inside the harness process.

That placement is the point. A tool registered at `session.start` is listed by
turn one, so nothing waits for a build and nothing arrives late.

Six cloud sessions in earlier lines died on a spawned server that had thirty
seconds to answer. Removing the spawn ends that class of failure.

What level zero holds today:

- the voice rules, at the write door, so a write breaking one is refused
- a refusal that names the rule and asks the writer to hold it for the turn
- the rules as a section of the system prompt, computed here and written to no
  file in the tree
- three tools the model may call: `voice_check`, `voice_format` and
  `voice_rules`
- a linter over the same rules, for a person and for a build

There is no engine yet, no work tokens and no index. Level zero comes first
because it holds whatever is built after it.

## Running it

Run RUNME. It installs what is missing, then hands every argument to the
command line. A first run on a fresh box needs nothing typed beforehand.

    ./RUNME.sh            what this tree can do
    ./RUNME.sh check      the tests, then the rules over the tree
    ./RUNME.sh doctor     what is installed, and what level zero found

On Windows, `.\RUNME.ps1` takes the same words.

RUNME holds no logic. It calls `src/scripts/install.ps1` or `install.sh`, which
names every dependency this tree takes, and then `src/scripts/cli.mjs`, which
holds the verbs. A new dependency is a row in the install script.

The plugin is enabled by `.claude/settings.json`, which is tracked. A clone is
guarded on its first session with nothing typed and nothing installed. That
file carries no port and no path belonging to one machine, so it travels.

## The shape

    RUNME.sh / RUNME.ps1      install, then hand every argument through
    .claude/settings.json     the cage: one file, and it travels
    .claude-plugin/           this tree own marketplace, so a clone finds level 0
    spec/guidance/voice.md    what each rule is for
    src/scripts/
      install.ps1 / .sh       every dependency this tree takes
      cli.mjs                 the verbs
    src/level0/
      hooks/level0.mjs        the module: the doors, and no rules
      lib/                    the rules, in pure JavaScript
      test/                   the tests

The rules live in `lib` and are pure JavaScript, so the module and the command
line read one copy. A rule is written once and every door says the same thing
about it.

## What this tree does not carry

No MCP server and no `.mcp.json`. The tools are registered inside the harness,
so there is nothing to spawn and nothing to configure.

No second settings file. The events that needed a per-machine port are hooks in
the module now, so the cage is one tracked file.

No Copilot.
