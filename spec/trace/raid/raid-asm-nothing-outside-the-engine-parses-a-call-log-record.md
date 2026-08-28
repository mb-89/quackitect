---
minted_in: i5-engine-hygiene-one-version-source-every-
id: raid-asm-nothing-outside-the-engine-parses-a-call-log-record
type: "[[raid]]"
kind: assumption
statement: Nothing outside this engine parses a call-log record, so a new field can be added to one without breaking a reader.
owner: the maintainer
trigger: the first time a field is added to or renamed in a logged record
status: open
impact: A reader that pins the record's shape breaks silently on the next append. The log is append-only, so the broken records are permanent.
breaks_how_badly: corrosive
how_likely: conceivable
probed: 2026-08-19
probe: holds, probed 2026-08-19 on this clone. Every reader of .se/calls.jsonl sits inside the engine or its tests — calllog.ts, se-hook-stop.ts, record-inspect.ts, se-hook-websearch.ts, preflight.ts for writability, and four test files. Each parses a line with optional keys and none validates against a schema that forbids unknown ones; se-hook-stop.ts destructures {tool?, ok?, response?} and ignores the rest. The candidate falsifier was the editor extension, and a search of engine/editors for calls.jsonl, CallRecord, log_query or a .se path returns 0 hits, so it does not read the log at all.
source_refs:
  - req-the-actor-is-recorded-where-the-call-is-served
  - raid-iss-a-recorded-act-carries-no-acting-role
  - i5-engine-hygiene-one-version-source-every-
weighs_with: none
weighs_against: none
---

## Probe

SEARCH THE TREE FOR EVERY READER of the log, and count them.

- `calls.jsonl` by name, which finds anything opening the file directly.
- The query lane, which is the sanctioned reader.
- The mirror's feed, which renders rows.
- Anything under `deliverable/vendor` or an editor extension, which are the
  two places a reader could sit outside the engine's own build.

WHAT WOULD FALSIFY IT. Any reader that destructures a record with a fixed
shape, or validates it against a schema that forbids unknown keys.

WHY IT IS AN ASSUMPTION AND NOT A FACT. The record is JSON on disk in a file
this product owns, and adding a key to JSON is normally free. The thing not
established is whether a reader outside this repository — the VS Code
extension is the candidate — reads it too.

WHY IT MATTERS FOR THIS RECORD. The actor stamp is a new key on every record
written from now on. If the assumption is false, the fix is not the stamp, it
is the reader, and that changes what this iteration builds.
