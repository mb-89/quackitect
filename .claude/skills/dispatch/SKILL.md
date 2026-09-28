---
name: dispatch
description: Reads the dispatcher's plan and leaves. The Action at .github/workflows/dispatch.yml lands the writes, opens their pull request, fires one worker a ready group and a stuck hand-over, and hands a question to a box. It opens no GitHub issue. Use it where a routine says to run the dispatch skill.
---

# Dispatch

The Action at `.github/workflows/dispatch.yml` runs the dispatch every hour, with no model. For what it does, see [[spec/design_input/the-cloud-runs-itself#firing-the-workers]].

1. Start no session, open no pull request, and send no message. The Action does each.
2. Run `./RUNME.sh dispatch --dry`, and read the plan it prints.
3. Leave.
