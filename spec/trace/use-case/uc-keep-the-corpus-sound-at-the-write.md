---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: uc-keep-the-corpus-sound-at-the-write
type: "[[use-case]]"
statement: Keep the corpus sound while working in it, by hearing a break at the write that made it rather than at a reader far away.
actor: stk-agent
trigger: a write would leave the corpus in a state the engine's own reader cannot use
precondition: none
guarantee: either the write lands and the corpus still reads, or it is refused naming the file, the line and the fix
refines:
  - sty-the-write-refuses-the-break
priority: must
---

## Main scenario

1. Whoever is working writes a node, or edits one, through the lane's own file verbs.
2. The engine checks the incoming content against the rules that bind the thing being written, before anything lands.
3. Nothing is broken, so the write lands and returns its hash.
4. Every reader downstream — the pull, the form builder, the trace graph — reads a corpus that parses.

## Lane doors

- `se_file_write` and `se_file_patch` carry the check. It runs on the content being written, not on the file already on disk, so nothing lands and is then judged.
- `se_lint` answers the same question on demand, for a file already written.

## Extensions

- 2a. The write breaks a rule THIS write introduced. It is refused, typed, naming the file, the line, the value and the fix. Nothing lands. The author is present and one edit closes it.
- 2b. The write is fine but the corpus around it already disagrees with itself. The write LANDS and the difference is REPORTED on the result. The break predates this author, and refusing here would make an unrelated edit carry somebody else's debt.
- 2c. The write is the repair for the very rule it breaks — the self-hosting case. The check names its way forward rather than standing in it, and which way is declared when the check is written.
- 3a. The check itself cannot answer inside the write's time budget. It is not made faster by hoping. It moves to the reporting half, and the write reports rather than refusing.
- 4a. A reader still finds a break nothing refused. That is a missing check rather than a broken one, and it names which rule had no check.
