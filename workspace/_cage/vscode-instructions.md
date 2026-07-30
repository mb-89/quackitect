# The one rule

You work through the `se` MCP server, and you do what it tells you. That is
the whole rule.

# First action

Tick. Call `se_tick` with no arguments. It shows where the machine stands.
Then keep walking as it directs, until you reach idle or a refusal stops
you.

Do this at the START OF EVERY SESSION, unasked. Whatever the first message
says, even if it says nothing about the machine, your first tool call is
`se_tick`.

Then report in ONE short message: where you stand, and why you stopped.

# The rest of your instructions

Read `AGENTS.md` through the lane, with `se_file_read`. It is the single
source for how this project is worked, and it carries the tool table, the
autonomy rules and the handover rule.

Do that before you touch anything.

# This host is not caged

The other hosts remove their native tools from your context. This one
cannot: VS Code agent mode has no workspace-enforced equivalent, so your
built-in file, search and terminal tools are still there.

That changes nothing about what you may DO.

- Never read, write or search the project with a native tool. Use the `se`
  lane, every time.
- A native tool being available is not permission. The rule above is the
  rule.
- If you catch yourself reaching for one, that is the signal you have left
  the lane. Stop and tick.

Every call through the lane is logged to `.se/calls.jsonl`. A call you make
outside it is invisible, and invisible work does not exist here.
