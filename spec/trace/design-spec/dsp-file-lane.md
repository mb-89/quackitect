---
minted_in: i1
id: dsp-file-lane
type: "[[design-spec]]"
statement: reading, writing, searching and running inside the root, carried by compare-and-swap writes and root-relative paths
realizes:
  - "el-walk-engine"
files:
  - "deliverable/engine/files.ts"
  - "deliverable/engine/files-patch.ts"
  - "deliverable/engine/signals.ts"
  - "deliverable/engine/paths.ts"
  - "deliverable/engine/resolve.ts"
  - "deliverable/engine/search.ts"
  - "deliverable/engine/move.ts"
  - "deliverable/engine/run.ts"
  - "deliverable/engine/web.ts"
  - "deliverable/engine/gitlane.ts"
  - "deliverable/engine/jsonio.ts"
  - "deliverable/engine/hash.ts"
  - "deliverable/engine/model-fs.ts"
  - "deliverable/engine/bin/outward-search.ts"
  - "deliverable/engine/bin/se-hook-websearch.ts"
---

## Responsibility

The file half of the lane: reads with content hashes, writes as
compare-and-swap, atomic multi-file patches, the search with intent,
the allowlisted git verbs, command runs with captured output, and the
two doors out of the root — a committed ref and a declared root.

## Behavior and constraints

- A write lands only against the hash of the latest read.
- Bound paths resolve into the record's worktree.
- The web and search hooks log every outbound query.

## The outward search actually happened

THE OUTWARD SEARCH ACTUALLY HAPPENED — the check behind the three finders
that face outside (owner ruling 2026-08-08).

Three of the five finders exist to stop the design space collapsing to our
own ideas: prior art, what shipped, and analogy. Each one already REQUIRES
option nodes and refuses an empty submit. None of that proved anybody
looked outside — a person could type five options from memory, cite a
vendor name, and every check would pass.

So this reads two things and compares them.

  - The option nodes. Each one found by an outward finder carries a source.
  - The call log. It records every outward query: the lane's se_web_search
    and se_web_fetch, and the native WebSearch/WebFetch the contract allows
    when the lane's provider is unconfigured — a hook records those under
    the host tool's own name.

An outward option with no outward query behind it is the failure mode this
exists to name.

  node engine/bin/outward-search.ts --root <project root>

## The finders that face outside

The finders that face outside. contradiction and without reason over our
 own clusters, so neither owes a query.

 `shipped` was a third until 2026-08-08. A shipped product IS prior art, so
 it folded into that finder and the two angles became required fields on
 one form.

## Merge is allowed

MERGE IS ALLOWED, REBASE IS NOT (owner ruling 2026-07-29). The asymmetry
is history: a rebase rewrites it, a merge only adds a commit that can be
reverted. The rebase refusal below already named merge as its remedy while
the allowlist forbade it, so the lane pointed at a door it had locked.
TAKING ONE SIDE OF A CONFLICT (gap hit live 2026-07-30, e26). Merging was
allowed but RESOLVING it was not, so seventeen conflict blocks across four
files had to be hand-edited through the agent's context. checkout joins the
list in ONE form: --ours or --theirs, on a named path, while a merge is
actually in progress. That rewrites a file the merge has already broken,
and nothing else.

## The engines own trail is not somebodys uncommitted work

THE ENGINE'S OWN TRAIL IS NOT SOMEBODY'S UNCOMMITTED WORK. A narrated call
 writes the record's decisions.jsonl into the bound worktree, so a walk can
 never present a clean tree while it is narrating — and a sync is wanted
 exactly when an expedition is entered, which is when narration is heaviest.
 The two mechanisms refused each other: riding an update on the sync dirtied
 the tree before it checked, so it refused itself (found live 2026-08-02).

 Only the trail is excused. A reconcile must still never bury real work.

## Untracked files do not block a reconcile

UNTRACKED FILES DO NOT BLOCK A RECONCILE. A merge cannot silently
bury one — git itself aborts when an incoming file would overwrite
it, and that abort already refuses typed. Counting them deadlocked
once: the ignore rule for four generated files sat on the very
branch the gate was refusing to land (found live 2026-08-02, e31).

## Cut the middle

CUT THE MIDDLE, NEVER THE END (owner law 2026-08-02). The end of an
 output is where verdicts live — exit codes, error totals, closing
 units. A head-only cap once turned "(425.501917ms)" into "(425.501",
 and a confident wrong diagnosis was built on the missing "ms". So a
 cap keeps BOTH ends, backs off to whitespace so no token is ever
 split, and the marker states exactly what was dropped.

## The search lane

The search lane — drop-in replacement for Grep.

ripgrep and git are HARD dependencies (owner ruling 2026-07-26): there is
no fallback engine. ripgrep ships via @vscode/ripgrep (npm install in the
RUNME); PATH rg is accepted too. Missing both is a red preflight, not a
degraded search — v2's lesson: a weaker lane silently teaches the agent
to distrust the lane.

ref search (v2 parity): pass ref to search a committed state instead of
the tree — git grep against any branch or tag (v3 is a branch of quack,
so `main` reaches v1, `v2` reaches v2).
Results are LOCATIONS; the remedy for "show me more" is a range read.

## A file that cannot be searched says so

A FILE THAT CANNOT BE SEARCHED SAYS SO (found live 2026-07-29).
engine/records.ts carried one raw NUL byte as a cache-key separator.
ripgrep called the whole file binary and reported it on a line this
parser did not understand, so the line was dropped and the search
returned an empty, confident "no matches".

The file was invisible to every search in the lane, and nothing ever
said so. An empty result and an unreadable file must never look alike.

## The exclusion globs are relative to the working directory

THE EXCLUSION GLOBS ARE RELATIVE TO THE WORKING DIRECTORY, never to the
search target. Without a cwd of its own, ripgrep resolved them against
the SERVER's cwd — and a bound expedition worktree lives under
.worktrees, so `!.worktrees/**` excluded every file of the very tree the
search was pointed at. Every directory search in an open expedition
returned a confident, empty "no matches" (found live 2026-07-30).
A single named FILE survived it, because ripgrep never applies these
filters to a target it was handed explicitly — which is what made the
failure look like a parser bug rather than a scoping one.

## A git failure at a ref

A GIT FAILURE AT A REF, TYPED.

 THE ONE PLACE THE LANE'S OWN LAW DID NOT HOLD (i35 field report,
 2026-08-17). Every other refusal names a clause, what was expected, what
 arrived, and a remedy that runs. This threw raw git text, and raw git text
 reads as "the file is missing" when what is missing is the BRANCH.

 IT COST A FALSE CLAIM THROUGH SIX EVIDENCE FORMS. The i15 run read an
 unresolvable ref as an empty result, minted an assumption on it, and carried
 the conclusion forward.

 A SHALLOW CLONE IS THE ORDINARY CAUSE. A cloud box clones one branch, so
 `main` and `v2` do not exist locally, and a fetch alone does not create
 them — the remedy below is the pair that does, measured on that run.

## A patch names where it goes

A WRITE DOES NOT HAVE TO RESEND THE FILE. A patch carries the ops instead:
each names a place — by regex, by an edge it sits against, by a line range, or
by the exact text it expects to find — and what to put there.

EVERY OP IS GUARDED BEFORE ANY OF THEM APPLIES, and they apply against a
staged copy. A patch that would half-land lands not at all, so a file is never
left in the state between two ops.

WHY IT IS ITS OWN FILE. Reading, writing and deleting need a path and its
content. Placing an edit inside content needs none of that — it needs the ops
and the text. The seam is where the second stops needing the first.

## One tree needs no reconciliation

THERE IS ONE WORKING TREE AND A RECORD IS A FOLDER IN IT. Work is written
where every reader already looks, from the first keystroke.

SO THERE IS NOTHING TO RECONCILE. A verb that brought shared work in, and a
verb that put a record's work out, both answered a question that only exists
when two stores hold two answers to one thing. With one store the question is
empty, and an empty question is deleted rather than answered.

WHAT STAYS. Close is still its own act: it retires a record, and that is a
ruling about the record's life, not a reconciliation between stores.

