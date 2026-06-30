# review — assess & look back:  readout | retro | report

## readout
Summarize the board (`quack status`). Show DONE, SUSPECT, and OPEN counts. Name the next gate.
For a SUSPECT check, run `quack why <id>`. Report what input changed.

## retro
Run it at `engage start`, or on demand. Emit improvement notes only. Adopt nothing.
**Blameless.** Fix the system: prompts, process, tools. Never blame a person or the agent.

1. **Field feedback (open here).** Ask the human: "what came back from the field on the last shipped version?" Capture answers as notes (`origin: field`).
2. **Hunt wasted effort.** Scan the record for waste. Look for rework, mid-course reversals, avoidable refactors, and reinventing instead of reusing. Each one is a retro lead.
3. **Mine the record, recency-weighted.** Tally the previous retro's improvements. Promote the wins. Dismiss the duds. Record each dud's reason, so it is never re-proposed.
4. **Aim each improvement at a durable home.** A prompt, a checklist, a guide, or a tool. Every iteration should make the system cheaper and better — not just this project.
5. **Weigh at least one quality signal.** Never cost alone. Emit only the few highest-leverage notes. Make each one specific and checkable. A concrete change, not "improve X". Route them to the inbox.
6. **Spot determinizer candidates.** Read the logs. Which scripts did the AI write that the determinizer could own? A script that failed a few times is a strong lead. The fix may be a new tool. It may be better guidance.

## report
Render the deterministic HTML snapshot: `quack report`. With no args it renders AND opens the report. Pass `--out F` to render only, no open. The determinizer owns it. No judgment. It writes `.quack/out/report.html` by default.
The report is a **display**: it shows the last status snapshot and never re-runs checks, so it is stable and fast and two renders of the same state are byte-identical. If you changed the spec or rebuilt the engine, run `quack status` first to refresh the snapshot.
You MAY add a short human-facing narrative ("where we are / notable risks"). Keep it a separate, OPTIONAL layer on top. It is not part of the deterministic core. Do not let it be mistaken for it.
