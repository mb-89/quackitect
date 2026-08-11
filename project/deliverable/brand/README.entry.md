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

- project/deliverable - the engine, the machines, the VS Code extension.
- project/guidance - the rules the agent is bound by.
- project/spec - where your own records get written.
- project/ - the folder you open. Everything being built lives here.
- project/deliverable/brand/brand.json - the product name. Change it, and every surface follows.
- project/deliverable/brand/palette.css - every colour. Edit it. No code change, no restart.

## Attaching an agent

Open the command palette and run "$PRODUCT$: How to Attach Your Agent".

## Give it to someone else

    .\RUNME.ps1 --export C:\path\to\empty "Their Name" TN

That makes a fresh copy under a new name, with its own empty git repo. Your
history and your records stay here.
