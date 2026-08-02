# Same sidebar, more of the Cowork feel — proposal

Finding first: the play button already launches the REAL Claude Code harness
(claude-vscode.sidebar.open + your cage settings + the HTTP attach to :7333).
There is no smarter engine to route it through — the sidebar, headless
`claude -p`, and the Agent SDK are the same runtime. What differs between
your sidebar sessions and a Cowork session is CONFIGURATION, and three of
the four levers are settable in the claude-settings.json the extension
already places:

1. **model: "opus"** — pin it; a sidebar left on default may run a smaller
   model. Likely the single biggest share of the perceived gap.
2. **alwaysThinkingEnabled: true** (+ MAX_THINKING_TOKENS env) — Cowork-style
   sessions run with generous reasoning budget on every turn; a default
   sidebar session does not. Second biggest share.
3. **outputStyle: "se-terse"** — output styles REPLACE part of Claude Code's
   system prompt while keeping the harness. This is the supported door for
   the voice work you said isn't in yet: place se-terse.output-style.md at
   workspace/.claude/output-styles/se-terse.md (RUNME/extension can place it
   like every other cage file).
4. The unexportable rest — Anthropic's Cowork system prompt and cloud
   environment — is small next to 1–3, and the SDK path exists for when you
   want full system-prompt ownership: headless roles (QA, autonomous runs)
   behind your own mirror UI, billed to the subscription because the SDK
   drives the same logged-in Claude Code runtime.

Files here:
- claude-settings.proposed.json — your current cage settings + the three
  additions, nothing removed. Diff it against workspace/_cage/claude-settings.json
  and adopt what you like.
- se-terse.output-style.md — first draft of the walking voice, PROSE_WALL-aware.

Verify empirically, your own way: open one sidebar session with the old
settings and one with these, same kickoff, and compare the first ten calls
in calls.jsonl.
