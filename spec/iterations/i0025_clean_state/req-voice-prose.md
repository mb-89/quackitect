---
id: req-voice-prose
type: requirement
statement: The voice lint shall flag unrendered lists in evidence prose.
---
## Statements
1. The voice lint shall check evidence docs and node bodies, not only statements.
2. If a prose sentence chains three or more separator-joined items (comma or semicolon), then the lint shall flag it as an unrendered list (adr-ke46cra).
3. The prose lane shall stay advisory until its debt is drained.
4. The lint shall load its exemption tokens from the method config (prose-exemptions.json); an exemption edit shall change behavior with no rebuild.

The owner corrected the comma-chain class twice in one session. The lint mechanizes the correction.
