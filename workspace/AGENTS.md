# The one rule

You work through the `se` MCP server, and you do what it tells you. That is
the whole rule.

# First action

Pull. `se_pull` with no payload asks the machine what to do, and its answer
is an instruction: `read`, `fill`, `choose`, `do`, or `wait`. Do what it
says, then pull again. Keep pulling until the answer is `wait`. Everything
you hand back rides `form` — evidence sections, or `{"choice": "<to>"}`
where the machine offered doors; you never choose unasked. Stepping out is
`escape`, one hatch, landing at the front desk — but a QUESTION is not an
escape: waiting on an answer, stay where you stand, ask, and stop; escape
only when no answer could unblock the walk from here. How walking works:
product/guidance/walking.md — it is pulled into every state's packet.

Do this AT THE START OF EVERY SESSION, unasked. Whatever the user's first
message says — even if it says nothing about the machine — your first tool
call is `se_pull`. Immediately after that first pull, make the `se`
file/search lane callable. The reading needs it. HOW depends on the
host, so do whichever applies:

- GITHUB COPILOT CLI hides the lane behind an activation tool. Call
  `activate_file_navigation_and_search_tools` right after the first pull.
- EVERY OTHER HOST offers the `se` tools directly, or defers them by name.
  Load them the way that host loads deferred tools.
- NO ACTIVATION TOOL IS NOT A BOOT FAILURE. Do not hunt for it. Its absence
  means the host is not Copilot.

Pull as far as the machine allows, then report in ONE short message: where
you stand, and why you stopped (the pull's `wait` says which). The launcher
may also send you an opening prompt saying exactly this; the two agree on
purpose, so that an agent started by hand, with no prompt at all, still
boots the same way.

The session runs an AUTONOMY (the user's slider in the mirror). A step
that weighs more than the slider is the user's: the pull answers `wait`
and names it. STOP, and tell them PLAINLY, in words like these: "The next
step is <step>, and it waits for your hand. Changing the slider alone
cannot wake me: after you adjust it (or advance the machine in the
mirror), send me a message - 'continue' is enough - and I pick up from
wherever the machine stands." Then end your turn. The same message is how
you rest at `wait` with nothing to do.

BOOT STABILITY FOR THIS HOST:
- Keep boot calls serial. Do not run parallel search/read batches.
- THE READING IS A LOOP. When the pull answers `read`, call `se_reading`,
  read the text it hands back, and call it again. Stop when it answers
  `done: true`. Then pull.
- Each call carries ONE document and credits it as it serves it. There are
  no hashes to carry — the reading is the proof.
- Do not read the guidance files yourself. The loop knows what you owe,
  including everything on the way to the target.
- One document per call is deliberate. A host that moves a big tool result
  to disk hands you a preview instead of the text, and you would stand
  credited for guidance you never saw. That is what the loop prevents.
- A document that is ALLOWED to be missing is read with `optional: true`.
  Absence answers `exists: false` rather than refusing. The handover is the
  case this exists for. Boot should produce no errors at all.

Your native tools (Read, Write, Edit, Bash, Glob, Grep, web) are blocked in
this workspace — tool by tool, by an explicit list. Which file holds that
list depends on the host: Claude Code reads `.claude/settings.json`, and
GitHub Copilot CLI takes the same list on its command line from
`_cage/copilot-cage.json` (Copilot's `--excluded-tools`; its `--deny-tool`
only gates approval and hides nothing). Either way the effect is the one
rule: the `se` lane replaces every native tool, as good or better:

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
| WebSearch | ALLOWED natively (owner ruling 2026-07-28) — web search runs on the provider's backend and cannot be self-hosted keylessly. Every query reaches the feed MECHANICALLY, through a PostToolUse hook, so there is no logging duty to remember. `se_web_search` stays for key-configured setups. |
| your own history | `se_log_query` |

Paths are root-relative to the project root (the folder holding `product/`
and `workspace/`). Every call you make is logged raw to `.se/calls.jsonl`.

When a call is refused you get a typed rejection: clause, expected, got, and
an executable remedy — the exact call to make instead. Follow the remedy;
recover in one turn. Do not work around a refusal with another lane.

Pass this file's rule to every subagent you spawn.
