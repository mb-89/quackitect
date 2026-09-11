# quackitect v5

A system that shapes how an agent works. It starts at level zero, the layer
holding before anything else does.

## Run it

    ./RUNME.sh

That installs what is missing, links the sidebar, and opens this folder in the
editor. On Windows a person clicks `RUNME.cmd`, which hands the same words to
the shell Git ships. `./RUNME.sh help` names every verb.

## The sidebar

`src/extension` draws this tree as a VS Code sidebar. `./RUNME.sh` links it in
and names it to the editor, so a person runs one command:

1. Run `./RUNME.sh`, or click `RUNME.cmd` on Windows.
2. Click the duck in the activity bar.

[[spec/design_output/extension]] says what draws, and what waits for an engine.
