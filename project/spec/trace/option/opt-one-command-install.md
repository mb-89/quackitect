---
id: opt-one-command-install
type: "[[option]]"
statement: collapse the whole install to a single command with no interactive wizard, so nothing stands between a bare machine and a running product
cluster: cluster-the-bootstrap
found_by: prior-art
source: "Getting Started with @microsoft/spfx-cli, https://spknowledge.com/2026/05/12/getting-started-microsoft-spfx-cli-tutorial/"
---

## Mechanism

The vendor replaced a workflow of three global installs plus an interactive
wizard with one command. The reported gain is the minutes of prompt
navigation that used to happen before a single line of project code existed.

WHAT IT WOULD COST HERE. This is what `req-one-script-installs` and
`req-newcomer-one-command` already demand, so the finding confirms the
requirement rather than opening a new cell.

What it does NOT address is the demand this project puts beside it —
stopping before a partial install. The source says nothing about what
happens when the one command fails half way, and the search found no
account of a preflight that aborts before touching anything. That gap is
recorded as a dry well rather than papered over.
