# the lane — the tools, and the cage around them

<!-- AUTHORED TERSE. This register IS the source: the start-the-agent step
     assembles this file verbatim into the prompt layer. Edit the rule here. -->

Your native tools are blocked here, tool by tool, by an explicit list:

- Read
- Write
- Edit
- Bash
- Glob
- Grep
- web

Which file holds that list depends on the host. Claude Code reads
`.claude/settings.json`, and GitHub Copilot CLI takes the same list on its
command line from `deliverable/cage/copilot-cage.json`.

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
| git (via Bash) | `se_git` (allowlisted; push stays with the user, EXCEPT on a cloud run — see cloud-runner.md) |
| WebFetch | `se_web_fetch` |
| WebSearch | ALLOWED natively — it runs on the provider's backend and cannot be self-hosted keylessly. Every query reaches the feed mechanically, through a hook. |
| your own history | `se_log_query` |

PATHS ARE ROOT-RELATIVE TO THE PROJECT ROOT, which is the parent of the folder
you have open. You open `project/`; a path you pass starts `project/`.

DROPPING THAT ONE WORD IS LEGAL AND SILENT. A path beginning `spec/` where it
should begin `spec/` resolves, the write succeeds, and the file lands
beside `project/` where nothing reads it. Nothing refuses it, because the root
is a real place and its own files live there.

MEASURED ON THE i15 WALK: a harvest wrote 25 query files and an ADR to a
top-level `spec/`, noticed only afterwards, and cleaned up with an `rm -rf` at
the repository root through the `no_tool_reason` hatch — because delete and
move were both illegal where the walk stood.

SO CHECK THE PREFIX ON THE FIRST WRITE OF A BATCH, not the twenty-sixth. A
path that names a folder the product does not have is the tell.

Every call is logged raw to `.se/calls.jsonl`.

THE RECORD CARRIES WHO ACTED, WHERE, AND ON WHAT. Four coordinates, and only
one of them is something the server can see for itself.

- `actor` — a person, an agent, or the surface itself. Stamped where the call
  is SERVED, by the code that knows. Nothing downstream infers it from the tool
  name: a reader guessing the actor from which verb was called gets it wrong
  the moment one verb serves two callers, and it did.
- `state` — where the walk stood. Also the server's own observation.
- `part` — WHICH HAND, from a closed vocabulary: owner, walker, guide,
  reviewer, surface. Two agents are both `actor: agent`, and this is what
  tells them apart.
- `answered_by` — the model that served the call, not the one that was asked
  for.

YOU DECLARE THE LAST TWO AND THE RECORD MARKS THEM AS CLAIMS. Every lane tool
takes `as`, `relayed_by` and `answered_by`, the same way every one takes
`update`. Omit `as` and the record says `walker`, which is right for the
hand holding the session.

SAY `as: "guide"` WHEN YOU ARE THE HAND THAT WAS ASKED. A guide is delegated
one step and says so — a default of `guide` would let the strong hand's work
hide in the weak hand's count.

AND WHEN YOU FILE WORK SOMEBODY ELSE DID, say `as` for the AUTHOR and
`relayed_by` for yourself. A walker typing a guide's judgment into a form
under its own name erases the only thing the coordinate is for.

THREE MORE RIDE EVERY TOOL AND CARRY THE SAFETY RULE. `named_driver` is the
strength the step was told it needs; `went_weaker` is your own word that a
weaker hand took it; `weaker_reason` is why. Saying you went weaker and
giving no reason marks the record `unreasoned` — marked, never refused.

TWO DOORS LEAD OUTSIDE THE ROOT, and neither is a path. A past version of this
repo is read at a committed ref — `se_file_read`, `se_file_search` and
`se_file_glob` all take `ref`.

Another folder entirely belongs in `.se/roots.json`, as a declared root. It is
reachable as `@name/rest`. Ask the owner before declaring one.

A DECLARED ROOT IS READ-ONLY BY DEFAULT. Declaring one writable is how this
system drives a project that is not itself. The one thing it may never reach
is the tree it was produced from. That guard compares recorded identities and
not paths, so moving or renaming either tree changes nothing (SE-C-143).

WHEN A CALL IS REFUSED you get a typed rejection. It carries:

- the clause
- what was expected
- what it got
- an executable remedy, the exact call to make instead

Follow the remedy and recover in one turn. Never work around a refusal with
another lane.

A TRUNCATING PIPE IS REFUSED (SE-C-137), and a filter after a pipe counts:
`Select-String`, `findstr` and `grep` drop the lines they do not match, which
is where the totals live. The refusal names the lane verb that handles length
instead — `se_test`, `se_file_search`, `se_file_read`, or a whole run paged
back by ref. `no_tool_reason` runs it anyway and logs why.

WHAT IT CUTS. What `Select-Object -First`
dropped exists nowhere — not on the result, not in the log. Ends carry
verdicts: exit codes, totals, units. Prefer structured results (`se_test`) and
fetch full output by ref (`se_log_query`) over shaping it in the shell.

A RESULT THE HOST MOVED TO DISK IS NOT READ BACK FROM THE HOST'S FILE. Retro
finding 2026-08-10: several shell reads of host-persisted files stood where a
lane call belonged.

WHAT THE LOG ACTUALLY KEEPS, because this used to promise more than it holds.
The call log is a TRAIL, not an archive.

- `se_run` OUTPUT IS KEPT WHOLE, and `se_log_query {ref}` serves it back. That
  is the one a caller comes back for, and it is the one that is there.
- EVERY OTHER RESPONSE IS CAPPED IN THE LOG, middle cut, about five hundred
  characters. A big form or a big pull is NOT recoverable from it.

SO A HOST-TRUNCATED ANSWER IS ASKED FOR AGAIN, SMALLER. Page a read with
`offset`/`limit`, narrow a search, or pull again — the machine recomputes from
where the walk stands, so nothing is lost by asking twice. Hunting the log for
a payload it never held costs a call and answers nothing.

A RESULT WITH `bounded: true` WAS CUT BY THE LANE BEFORE THE HOST COULD CUT IT.
The first page and a `next` call ride in the result. Make that exact call.
For an answer spill, continue `se_file_read` at `char_range.to` until it reaches
`char_range.of`, then parse the concatenated text as the original JSON result.
Do not use line paging for an answer spill. Escaped JSON may be one long line.

FOLLOWING THAT CURSOR IS ALWAYS LEGAL. An `se_file_read` under `.se/answers/`
is exempt from the state gate and from the narration toll, in every state,
including ones that allow no tools at all. The lane handed you the call, so
the lane does not then refuse it. Before i36 both guards bit, and a state that
served a bounded answer could make its own answer unreadable.

## A LONG LINE IS CUT WITHOUT A CURSOR, so never read-modify-write source

USE `se_file_patch` FOR EVERY EDIT TO SOURCE. Never read a file whole, edit it
in memory, and write it back. A patch names `old_string` and `new_string`, so
it cannot destroy what it did not name.

WHY THE HABIT IS A RULE. `se_file_read` truncates a single long LINE and says
so in one phrase inside a wall of source. Unlike a `bounded` answer, that cut
carries NO cursor and the file looks whole. A write-back then makes the cut
real.

MEASURED 2026-08-20 on i37. `deliverable/engine/tools.ts` holds the `se_pull` description
as one 3,246-character string literal. The read returned it cut at 2,035
characters. The write-back left an unterminated string and three parse errors,
and the tool surface would not compile.

WHAT CAUGHT IT WAS BIOME, not the lane. Nothing in the write path asks whether
the content came from a truncating read.

SO THE CHECK IS ON YOU, and the patch verb removes the need for it.

WRITE A SCRIPT WHEN THE QUESTION IS ABOUT MANY THINGS. Counting what a rule
touches, routing four hundred blocks, measuring which methods need what,
applying one shape across a tree — these are programs, not readings. Reading
the files one at a time to answer them costs a hundred calls and gets the
count wrong.

THIS IS ENCOURAGED, NOT TOLERATED (owner ruling 2026-08-18). A shell command
that runs a script is the shell doing what ONLY a shell does. It is not a
missing lane verb, it is not a smell, and it does not count against you.

TWO SHAPES, AND BOTH ARE RIGHT.

- INLINE, for a one-off. `node -e '...'` on any host, or a heredoc on POSIX:
  `python3 - <<'PY' ... PY`. Nothing to clean up, and the whole program is in
  the call log because the command is.
- A FILE, for anything you will run twice. `se_file_write` it into
  `scratchpad/` — the workbench, never committed — then `se_run`
  `node scratchpad/<name>.mjs`. Change it and run it again.

DEFAULT TO NODE. The engine runs on it, so it cannot be missing on any host
the lane runs on. PowerShell is there on Windows and bash on POSIX. Python is
usually there and is not guaranteed; reach for it when it earns the bet.

WHERE PYTHON EARNS IT, RUN IT THROUGH `uv`. On this machine a bare `python`
is not the interpreter you want; `uv run python ...` is. That applies to the
heredoc above as much as to a script file.

THIS IS MACHINE-SPECIFIC AND IT IS WRITTEN DOWN ANYWAY. It lived in an
assistant memory until 2026-08-19, where the next session could not see it,
and the repo is the memory.

THE SCRIPT PRINTS WHAT YOU NEED, so nothing has to be piped. A script that
answers "how many and which" prints the count and the list itself. That is why
the truncating-pipe refusal never bites this loop.

THE RETRO READS THESE. Every command is logged in full, so a script that
worked once can be found, repeated, and promoted into the engine if it earns
it. Writing it through the lane rather than in your head is what makes it
survive the session.

Pass this file's rule to every subagent you spawn.
