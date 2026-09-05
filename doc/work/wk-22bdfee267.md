---
kind: [[work-token]]
process: [[trivial]]
guidance: [[work-token]]
title: the log keeps End
status: closed
began:
  - 0a179c8e48496e2c222785e3b9dfe516a3ee3399
ended:
  - 1a0aee668a9f1f86ac8a315af7d26b052e26b9d1
disposition: done
---

## detail

Since two panes share the keys, an open details pane takes PgUp, PgDn, Home and End as well as the arrows. So the log cannot be jumped to its newest line while the details are open. The owner: I cannot scroll all the way down. The arrows stay the details pane's. The jump keys are the log's.

## done when

- with details open, End selects the newest log line and PgDn moves the log a screen: TestTwoPanesOneScroll extended, red then green
- with details open, up and down still scroll the details: the same test shows it

