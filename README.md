# quackitect v5

A system that shapes how an agent works, starting from the layer that holds
before anything else does.

## Level zero

Level zero is the rules that shape what the agent writes. It runs as a plugin
whose hooks are a module, inside the harness process.

That placement is the point. The harness lists a tool registered at
`session.start` on turn one, so nothing waits for a build and nothing arrives
late.

## Running it

Run RUNME. It installs what is missing, then hands every argument to the
command line. A first run on a fresh box needs nothing typed beforehand.
See RUNME -h for more.