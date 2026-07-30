---
id: e27-fix-make-the-vs-code-host-live-with-two-agen
kind: fix
status: open
opened: 2026-07-30T14:25:27.535Z
goal: "Make the VS Code host LIVE, with two agents on one project. Owner report 2026-07-30: the extension landed, but the mirror webview says \"Starting the server…\" forever and the server output stays empty; Claude can see the MCP server. Rulings from the desk: (1) TWO AGENTS AT ONCE is the bootstrapping requirement — the owner drives one agent (this lane) while the VS Code side attaches to the SAME server; rework whatever blocks a second client, the one-driver rule becomes a deliberate concurrency design. (2) Diagnose the webview hang: spawn vs attach (port 7333 held should mean attach, not spawn). (3) The mirror view opens in the RIGHT side bar, not left — automate or document the closest VS Code allows. (4) The CONSOLE CARD leaves the mirror when hosted in VS Code. (5) A start affordance: the extension detects Claude or Copilot installed and starts the agent in the integrated terminal with the right startup command — a button or automatic. (6) The agent gets EYES: run VS Code as `code serve-web` in Chrome so the driving agent can see and operate VS Code itself (owner is away; agent proves the extension live without a relay). Expedition stays open until the VS Code thing demonstrably runs."
---

# e27-fix-make-the-vs-code-host-live-with-two-agen

Free prose — the human head of the record. Machine-facing fields stay in the frontmatter.
