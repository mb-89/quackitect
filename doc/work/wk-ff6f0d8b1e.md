---
kind: [[work-token]]
process: [[trivial]]
guidance: [[work-token]]
title: mint takes done when
status: closed
began:
  - 11dfad0b22f98326f91173cf312e1405c5c79ac4
disposition: done
---

## detail

A trivial mint writes a file without the done-when chapter its own process requires, so every trivial token is born red in the problems panel. se work has no way to pass criteria, and neither does the se_work MCP tool.

## done when

- se work --process trivial with no --done-when is refused, and the refusal names done when
- go test ./src/engine -run TestAMintRequiringDoneWhenRefusesWithoutIt is green
- a token minted with --done-when carries the chapter, checked by the same test

