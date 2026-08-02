# the lane — the tools, and the cage around them

<!-- AUTHORED TERSE. This register IS the source: the start-the-agent step
     assembles this file verbatim into the prompt layer. Edit the rule here. -->

Your native tools (Read, Write, Edit, Bash, Glob, Grep, web) are blocked here,
tool by tool, by an explicit list. Which file holds that list depends on the
host: Claude Code reads `.claude/settings.json`; GitHub Copilot CLI takes the
same list on its command line from `_cage/copilot-cage.json`.

The effect is the one rule: the `se` lane replaces every native tool, as good
or better.

| you would reach for | use instead |
| --- | --- |
| Read | `se_file_read` (offset/limit for large files; returns the CAS hash) |
| Write | `se_file_write` (base_hash: null creates; hash from read overwrites) |
| Edit | `se_file_patch` (ops:[…] — many edits, many files, ONE atomic call) |
| a rename running through the tree | `se_file_replace` (one regex over a glob; every place it landed comes back with its line before and after) |
| Glob | `se_file_glob` |
| Grep | `se_file_search` (state your intent — it is logged) |
| ls | `se_file_list` |
| Bash | `se_run` (output captured in full under the returned ref) |
| git (via Bash) | `se_git` (allowlisted; push stays with the user) |
| WebFetch | `se_web_fetch` |
| WebSearch | ALLOWED natively — it runs on the provider's backend and cannot be self-hosted keylessly. Every query reaches the feed mechanically, through a hook. |
| your own history | `se_log_query` |

PATHS ARE ROOT-RELATIVE TO THE PROJECT ROOT, which is the parent of the folder
you have open. You open `product/`; a path you pass starts `product/`.

Every call is logged raw to `.se/calls.jsonl`.

TWO DOORS LEAD OUTSIDE THE ROOT, and neither is a path. A past version of this
repo is read at a committed ref — `se_file_read`, `se_file_search` and
`se_file_glob` all take `ref`. Another folder entirely belongs in
`.se/roots.json` as a declared, read-only root, reachable as `@name/rest`; ask
the owner before declaring one.

WHEN A CALL IS REFUSED you get a typed rejection: clause, expected, got, and
an executable remedy — the exact call to make instead. Follow the remedy and
recover in one turn. Never work around a refusal with another lane.

A TRUNCATING PIPE CUTS BEFORE THE ENGINE SEES. What `Select-Object -First`
dropped exists nowhere — not on the result, not in the log. Ends carry
verdicts: exit codes, totals, units. Prefer structured results (`se_test`) and
fetch full output by ref (`se_log_query`) over shaping it in the shell.

Pass this file's rule to every subagent you spawn.
