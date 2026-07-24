---
id: se.guidance-board-html
kind: guidance
statement: "Working rules for board-html realization work: template-literal escaping, cycle-after-change, screenshot-verify."
provenance:
  iteration: i4-questions-and-hygiene
  ai_involvement: agent-drafted
applies_to:
  - board-html
---

## Rules

- The page lives in ONE TS template literal: no backticks or ${ in client JS; backslash escapes double in the source.
- After board code lands green, cycle the board (se_ps cycle) - the owner wants the new one; never wait to be asked.
- Screenshot-verify visual changes in Chrome before handing them over.
- The visual-design laws bind: click-for-detail, help is a detail never a button, panes hold their size, color = meaning.
- localStorage keys version when a layout's shape changes, or stale saves break the new layout.
