---
form: sweep-consistency
by: agent
signed_off: 2026-08-13T10:12:01.657Z
authors: agent
files: null
---

# Evidence form / sweep-consistency

## current_situation

M8 sweep for i8, after gate-implementation passed (pass with overrides). This iteration's real changes: se_help (newly wired this session, was previously unwired), the owed-checkbox mechanism (engine/stateform.ts, engine/session.ts, templates/checklist.md), and the slider→dial wording fix (machines/, guidance/, cage/, 2 tests). Swept all 9 surface classes against these three changes.

## swept

- [x] command and tool docs
- [x] engine-served strings (grep the engine for the changed vocabulary - the
- [x] method cards
- [x] matrix rows
- [x] templates and skeletons
- [x] guidance chapters
- [x] book chapters
- [x] README and entry documents
- [owed] panels and form help — raid-debt-checklist-panel-lacks-owed-state

## follow_up

- The panel's checklist editor (engine/editors/checklist.ts) needs its own sketch and a render/collect update for the owed third state — raid-debt-checklist-panel-lacks-owed-state.
- Two more "slider" strings remain in engine-served remedy/needs text (session.ts ~633, ~1797) — found this pass, not fixed: minor, not test-covered, needs the escape-edit-return cycle from a state bound to i8. Named here rather than silently left.
- M8 next: fill-story-evidence's downstream states, then gate-validation and close.

## anything_else

command and tool docs: se_help documents itself fully through its own MCP schema description (no separate command-doc file exists for any lane tool — the system deliberately avoids a hardcoded tool inventory, per front-desk.md's own "no vocabulary on purpose" design; se_help follows the same pattern as every other tool).

engine-served strings: grepped project/deliverable/engine for "slider" this pass. Fixed 2 more genuinely served strings this round (a remedy note and a "needs" field in the doors response) — wait, these were FOUND but not yet fixed; see follow_up. The dozens of remaining hits are code comments (developer-facing, not served to a person or agent), out of scope for a wording sweep the same way tests/ comments were out of scope at gate-implementation's own review.

method cards, matrix rows: none reference se_help, the owed checkbox, or "slider" by name; nothing to update.

templates and skeletons: templates/checklist.md already carries the owed-checkbox rule and line_pattern, updated when the mechanism was built this session.

guidance chapters: the slider→dial sweep already covered guidance/ and machines/ (commit 6c231b5) plus cage/ (commit 6a9dd3a); raid-issue-must-demos-owed.md's own trigger text also still said "slider" and is fixed this pass.

book chapters: none exist in this tree (glob for **/book/** returned nothing) — not applicable.

README and entry documents: sampled at M7 verification (tsp-prose-inspection) — no bare jargon, no stale wording found.
