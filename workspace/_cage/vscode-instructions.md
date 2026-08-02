# The one rule

You work through the `se` MCP server, and you do what it tells you. That is
the whole rule.

# First action

Pull. Call `se_pull` with no payload. The machine answers with an
instruction — `read`, `fill`, `choose`, `do`, or `wait` — and its answer
says what to do about it. Do that, then pull again. Everything you hand
back rides `form` (a choice is a form too, and only exists when offered);
stepping out is `escape`, and it lands at the front desk. Stop only at
`wait`, or on a typed refusal you cannot remedy.

Do this at the START OF EVERY SESSION, unasked. Whatever the first message
says, even if it says nothing about the machine, your first tool call is
`se_pull`.

Immediately after that first pull, call
`activate_file_navigation_and_search_tools`. In VS Code agent mode these
`se` file/search tools can be present but not registered yet; activating the
group up front prevents `se_file_read` startup failures in boot.

This file and `workspace/_cage/kickoff.txt` deliberately repeat what
`AGENTS.md` says. They have to. The lane is not callable yet when they are
read, so they cannot point at a file the agent cannot open. `AGENTS.md` is
still the source of truth — change it there first, then carry the change
into these two.

READ SERIALLY, THE WHOLE SESSION — not only in boot. Send `se_file_read`
calls one after another, never as a parallel batch. This host appears to
cancel its own MCP calls when they go out in parallel, which surfaces as
"the call was cancelled" with nothing wrong on the server. The lane serves
parallel reads fine. The fault is on this side, so serial is what works.

Stability pattern for VS Code:
- Keep calls serial. Do not start parallel search/read batches, ever.
- Keep reads small (offset/limit) to avoid oversized host payloads.
- When the pull answers `read`, call `se_reading` one call at a time until
  it answers done, then pull. There are no hashes to carry — the reading
  credits itself.
- If the current state allows no tools, do not read or search there. Pull.

Then report in ONE short message: where you stand, and why you stopped.

# The rest of your instructions

Read `AGENTS.md` through the lane, with `se_file_read`. It is the single
source for how this project is worked, and it carries the tool table and
the autonomy rules.

Do that before you touch anything.

# This host may or may not be caged

It depends on how your session was opened, and you cannot tell from inside.

- STARTED BY THE PLAY BUTTON you ARE caged. The extension opens the chat
  with `toolsExclude`, built from `copilot-cage.json`, so the native tools
  are removed by name exactly as on the CLI.
- OPENED BY HAND from the chat panel you are NOT. Nothing passes
  `toolsExclude`, so your built-in file, search and terminal tools are all
  still there.

So assume you are NOT caged. It is the safe assumption in both cases, and it
changes nothing about what you may DO.

- Never read, write or search the project with a native tool. Use the `se`
  lane, every time.
- A native tool being available is not permission. The rule above is the
  rule.
- If you catch yourself reaching for one, that is the signal you have left
  the lane. Stop and pull.

Every call through the lane is logged to `.se/calls.jsonl`. A call you make
outside it is invisible, and invisible work does not exist here.
