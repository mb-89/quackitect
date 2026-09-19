---
kind: [[ticket]]
state: open
group: the-bridge-keeps-transport
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

Trunk carries the change the ask names, and this step adds the cases holding
it at the hook.

| what the ask asks for | what stands |
|---|---|
| the two cloud variables read off the environment | `process.env` in the start script, exiting 3 |
| the method root stated | `existsSync(method)`, exiting 4 |
| node run, and its answer read | the hook's catch, reading a refused spawn as code 5 |
| `node_modules` stated | `existsSync`, exiting 6 |
| node put behind it, with the log as its output | `spawn` detached, the log file on both streams |

`starts()` runs `["node", "-e", START, ...]`, so no shell stands between the
hook and any guard.

**What surprises.** `test/contract/cloud-start.test.js` drives the script and
reads its codes, and nothing read what the hook spawns. A hand putting `sh`
back in `starts()` would leave that file green.

- `test/level0/start-road.test.js` reads the argv the hook spawns
- the same file reads every guard standing inside the script
- it holds the cases over the block a session outside the cage reads

**The one shell left.** The install road this group adds runs the tree's own
installer, which is a shell script. It stands past the cloud guard, so a box
reaching it is a cloud box carrying `sh`. Every guard above it runs in node,
and the comment beside the line says so.

# Discussion

The owner reads `the start of the server fails` in the session log, and asks for the note and the fix later.

The same log carries `the server answers nothing at http://127.0.0.1:6510/event` three times, each with its own cause: `remote-cancel`, `Unable to connect`, and `The socket connection was closed unexpectedly`. The middle one follows from this defect, the last one belongs to [[spec/tickets/the-server-holds-its-socket]], and `remote-cancel` stands on its own.

`./RUNME.sh check` runs `serverHolds()` with a 2 second timeout, and answered red once inside `branch merge` while the tree read green a minute either side. A merge turning red on a health probe costs a person the merge, so the check's wait belongs in the same pass.

| what trunk carries | where it stands |
|---|---|
| the start as a node script, holding the guards the shell held | the bridgehead hook |
| one script for the bridgehead and for the cloud take | `src/scripts/serve.js` |
| a refused run of node reading as a box carrying none | the hook's catch |
| the cases driving the start with no shell | `test/contract/cloud-start.test.js` |

A hand taking this ticket reads the diff and closes it, or names what it misses.
