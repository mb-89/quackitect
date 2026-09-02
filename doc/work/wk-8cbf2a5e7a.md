---
id: wk-8cbf2a5e7a
seq: 1000123
type: work
title: copilot reads nothing here
status: backlogged
assignee: main
scope: single-step
traced: true
minted_by: cowork
---

## detail

util/projections.json projects util/cage/copilot-mcp.json to .copilot/mcp-config.json, and vendor documentation says Copilot CLI reads only ~/.copilot/mcp-config.json, .github/mcp.json, .mcp.json and .vscode/mcp.json. So the copilot lane likely never attaches, and nothing reports it. Run Copilot CLI in this tree and ask whether the quackitect server is connected. If it attaches, abort this token. If not, move the projection target to .github/mcp.json or delete the projection, since .mcp.json at the root is read by both harnesses. Then make a start that finds no lane say so on either harness.
