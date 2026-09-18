---
kind: [[ticket]]
state: open
urgency: soon
steps:
  - name: do
    does: makes the change the ask names
    to: retro
    evidence:
      - name: change
        form: text
        says: what you change, and what surprises you
step: do
---

# Ask

The bridgehead starts the server without a shell, and stays quiet on a box where a person starts it.

`starts()` runs `["sh", "-c", START, ...]`. A Windows box carries no `sh` on the host's path, so the spawn answers `ENOENT`. The `catch` then writes `the start of the server fails` at warn, and the log line names no repair.

| what the log says | what stands behind it |
|---|---|
| `the start of the server fails` | `level0: $.process.run(sh) failed to start: ENOENT: Command 'sh' not found or is in an unsafe location (current directory)` |

The warn is wrong twice. The first line of `START` reads `test -n "${CLAUDE_CODE_REMOTE:-}${SE_CLOUD:-}" || exit 3`, and `REASONS[3]` reads `["", "a person starts the server here"]`, which writes nothing. A local box stays silent by design, and this one warns instead, because the shell holding that guard fails to start.

Done is a bridgehead reaching the same answers with no shell:

| what the shell does now | what stands instead |
|---|---|
| reads `CLAUDE_CODE_REMOTE` and `SE_CLOUD`, exits 3 | the script reads the two off the environment, and exits before any start |
| `cd "$2"`, exits 4 where the root is absent | the hook stats the method root |
| `command -v node`, exits 5 | the hook runs `node` and reads the answer that run gives |
| `test -d node_modules`, exits 6 | the hook stats `node_modules` |
| `nohup node src/bridge/server.js ... &` | the script puts `node` behind it, with the log file as its output |

`the start of the server fails` then stands for a node that refuses to spawn, and for that alone.

# do

<!-- makes the change the ask names -->

## change

<!-- what you change, and what surprises you -->

<!-- the form is text -->

# Discussion

The owner reads `the start of the server fails` in the session log, and asks for the note and the fix later.

The same log carries `the server answers nothing at http://127.0.0.1:6510/event` three times, each with its own cause: `remote-cancel`, `Unable to connect`, and `The socket connection was closed unexpectedly`. The middle one follows from this defect, the last one belongs to [[spec/tickets/the-server-holds-its-socket]], and `remote-cancel` stands on its own.

`./RUNME.sh check` runs `serverHolds()` with a 2 second timeout, and answered red once inside `branch merge` while the tree read green a minute either side. A merge turning red on a health probe costs a person the merge, so the check's wait belongs in the same pass.
