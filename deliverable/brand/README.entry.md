# $PRODUCT$

$PRODUCT$ runs inside VS Code. You walk a state machine with an AI agent, and
a mirror beside your editor shows where the walk stands.

## Install it, once

    .\RUNME.ps1

Run that ONE time. It installs whatever is missing, places the VS Code
extension, and opens VS Code.

## Then work in VS Code

After that first run, open this folder in VS Code like any other project.
The $PRODUCT_ABBR$ button in the left bar opens the mirror.

You do not run RUNME.ps1 again. It is the installer, not the way in.

## What is in here

- deliverable - the engine, the machines, the VS Code extension.
- guidance - the rules the agent is bound by.
- spec - where your own records get written.
- project/ - the folder you open. Everything being built lives here.
- deliverable/brand/brand.json - the product name. Change it, and every surface follows.
  - Leave `instance` alone. It is this copy's identity, not a name.
- deliverable/brand/palette.css - every colour. Edit it. No code change, no restart.

## Attaching an agent

Open the command palette and run "$PRODUCT$: How to Attach Your Agent".

## Give it to someone else

Open the command palette and run "$PRODUCT$: Create a Vehicle".

It asks where to put it, what to call it, and a short name of two or three
letters. It makes a fresh copy under that name, with its own empty git repo,
and opens it in a new window. Your history and your records stay here.

## Start a project this drives

Open the command palette and run "$PRODUCT$: Start a Project This System
Drives".

The work lives in its own tree and carries none of the method. One small file
in it says which copy drives it, so moving either tree changes nothing.
