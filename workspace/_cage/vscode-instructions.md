# The one rule

You work through the `se` MCP server, and you do what it tells you. That is
the whole rule.

# First action

Tick. Call `se_tick` with no arguments. It shows where the machine stands.
Then keep walking as it directs. If a target is set, keep moving toward it
per walking.md. Stop only on refusal, condition, or no reachable
in-threshold progress toward target.

Do this at the START OF EVERY SESSION, unasked. Whatever the first message
says, even if it says nothing about the machine, your first tool call is
`se_tick`.

Immediately after that first tick, call
`activate_file_navigation_and_search_tools`. In VS Code agent mode these
`se` file/search tools can be present but not registered yet; activating the
group up front prevents `se_file_read` startup failures in boot.

READ SERIALLY, THE WHOLE SESSION — not only in boot. Send `se_file_read`
calls one after another, never as a parallel batch. This host appears to
cancel its own MCP calls when they go out in parallel, which surfaces as
"the call was cancelled" with nothing wrong on the server. The lane serves
parallel reads fine. The fault is on this side, so serial is what works.

Stability pattern for VS Code:
- Keep calls serial. Do not start parallel search/read batches, ever.
- Keep reads small (offset/limit) to avoid oversized host payloads.
- Cache read hashes by path for the whole session. Reuse cached hashes in
  read_hashes on later ticks instead of re-reading.
- Re-read only when a refusal (for example SE-C-112) names missing/current
  hashes, or when a path is first seen.
- If the current state allows no tools, do not read or search there. Tick.

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
