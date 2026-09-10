# quackitect v5

A system that shapes how an agent works. It starts at level zero, the layer
holding before anything else does.

## Run it

    ./RUNME.sh

That installs what is missing and prints what the tree can do. On Windows,
`.\RUNME.ps1` takes the same words.

## The sidebar

`src/extension` draws this tree as a VS Code sidebar. It carries no dependency,
so a person runs it from the folder:

1. Open this folder in VS Code and press F5, which opens a second window.
2. Click the duck in the activity bar of that window.

[[spec/design_output/extension]] says what draws, and what waits for an engine.
