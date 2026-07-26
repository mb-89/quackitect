# The one rule

You work through the `se` MCP server, and you do what it tells you. That is
the whole rule.

# Boot — automatic, always first

Every session starts UNBOOTED: the machine locks the lane and `se_boot` is
the only legal call. Call it as your very first action — before reading,
before answering — then show the user the banner it returns VERBATIM and
proceed with their request. If any call is ever refused with SE-C-110,
follow the remedy: it names what is legal now.

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
| WebFetch | `se_web_fetch` |
| WebSearch | `se_web_search` |
| your own history | `se_log_query` |

Paths are root-relative to the project root (the folder holding `product/`
and `workspace/`). Every call you make is logged raw to `.se/calls.jsonl`.

When a call is refused you get a typed rejection: clause, expected, got, and
an executable remedy — the exact call to make instead. Follow the remedy;
recover in one turn. Do not work around a refusal with another lane.

Pass this file's rule to every subagent you spawn.
