# The one rule

You work through the `se` MCP server, and you do what it tells you. That is
the whole rule.

# First action

Tick. `se_tick` with no arguments shows where you are; keep walking as the
machine directs — advance state by state until you reach idle or a refusal
stops you. How walking works: product/guidance/walking.md — it is pulled
into every state's packet.

The session runs an AUTONOMY (the user's slider in the mirror). When an
advance is refused with SE-C-113, that step is the user's — STOP, and
tell them PLAINLY, in words like these: "I'm at start — entering boot is
above the threshold. I'm stopping here. Changing the slider alone cannot
wake me: after you adjust it (or advance the machine in the mirror), send
me a message — 'continue' is enough — and I pick up from wherever the
machine stands." Then end your turn. The same message is how you rest at
idle with nothing to do. (`se_tick {wait: true}` exists for SHORT in-turn
holds when you expect the user's change within seconds — never as a
parking loop.)

THE HANDOVER RULE: the packet's `human_checked` list is what the user
checked as read while driving the mirror themselves. Your advances must
prove the SAME reading — read every listed doc through the lane and carry
its hash in `read_hashes`, or the tick refuses. Their checkmark is not
your reading.

Your native tools (Read, Write, Edit, Bash, Glob, Grep, web) are blocked in
this workspace — by an explicit deny list in `.claude/settings.json`, tool by
tool. The `se` lane replaces every one of them, as good or better:

| you would reach for | use instead |
| --- | --- |
| Read | `se_file_read` (offset/limit for large files; returns the CAS hash) |
| Write | `se_file_write` (base_hash: null creates; hash from read overwrites) |
| Edit | `se_file_patch` (ops:[…] — many edits, many files, ONE atomic call) |
| Glob | `se_file_glob` |
| Grep | `se_file_search` (state your intent — it is logged) |
| ls | `se_file_list` |
| Bash | `se_run` (output captured in full under the returned ref) |
| git (via Bash) | `se_git` (allowlisted; push stays with the user) |
| WebFetch | `se_web_fetch` |
| WebSearch | ALLOWED natively (owner ruling 2026-07-28) — web search runs on the provider's backend and cannot be self-hosted keylessly. THE LOGGING DUTY rides the exception: after every native search, record the query and what it found as an update, so the mirror still tells the story. `se_web_search` stays for key-configured setups. |
| your own history | `se_log_query` |

Paths are root-relative to the project root (the folder holding `product/`
and `workspace/`). Every call you make is logged raw to `.se/calls.jsonl`.

When a call is refused you get a typed rejection: clause, expected, got, and
an executable remedy — the exact call to make instead. Follow the remedy;
recover in one turn. Do not work around a refusal with another lane.

Pass this file's rule to every subagent you spawn.
