# note — capture an idea (do not process it)

Frictionless. Capture exactly one note THROUGH THE ENGINE. Then stop.

- Record the idea in the user's own words.
- ALWAYS ask the user for the **origin**. Where, or how, did the idea arise? Use their words. Never infer it. Origin lives in the frontmatter `origin:` field ONLY — never restate it in the body. (A bare `quack note` from a terminal stamps `origin: commandline` by itself.)
- **Call the engine — never write a note file by hand.** One line: `quack note "<text>" --origin "<their words>"`. Multi-line body: pipe it or use a temp file — `quack note --file <path|-> --origin "..."`. The engine stamps id, timestamp, slug, frontmatter, and the out-of-repo location; a hand-written note is format drift.
- If the note is too thin to be useful later, ask at most ONE batched question.
- Do not edit spec, checks, or the backlog.
- Confirm tersely. Then stop.

A note is never a check. It becomes one only when `engage start` bakes it. Later sub-op: `comment`.
