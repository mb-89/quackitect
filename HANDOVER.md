---
kind: [[handover]]
status: todo
urgency: soon
depends_on: the-config-holds-numbers
---

# A server draws these rules

Eleven rules stand in `test/contract/tree.test.js`, and each one reads two
files and compares them. No linter on the shelf holds a rule of that shape, so
a person meets each one by breaking it and reading a stack trace.

This branch builds a language server that holds them and draws them where the
writer stands.

# What v4 does

v4 runs a language server over stdio speaking LSP 3.17, at `src/engine/lsp.go`,
608 lines. Its comment says why it lives inside the engine:

    It validates on every keystroke, and a process per keystroke is too slow
    to type through.

So one process holds the rules, and the same program holds the command line.

| what it answers | what it does |
|---|---|
| `initialize`, `initialized`, `shutdown`, `exit` | the handshake |
| `textDocument/didOpen`, `didChange`, `didClose` | keeps the buffer, then diagnoses |
| `textDocument/publishDiagnostics` | pushes a finding per rule, severity 1 |
| `textDocument/documentLink` | makes every `[[name]]` clickable |
| `textDocument/completion` | offers a note name inside brackets |

Two more of its choices earn their place:

- It indexes the workspace once at start, which is how a rule reading two files
  answers fast.
- It skips a parked file. A red mark on a parked draft is a server reading what
  a person asks it to leave.

# The client is the cost

v4 pays for a VS Code extension of its own. Its LSP half is 37 lines:

    const server = { command: exe, args: lspArgs(work) };
    const options = { documentSelector: [{ scheme: "file", language: "markdown" }] };
    client = new LanguageClient("quackitect", "quackitect", server, options);

That is small, and packaging an extension is not. This tree ships two servers
already, vale-ls and Biome, and each arrives as a published extension a person
installs. Ours has no publisher.

Settle that first and say the answer in your handback:

| way in | what it costs |
|---|---|
| our own extension, off any registry | a person installs a folder by hand |
| a generic LSP client extension | one more dependency, configured in settings |
| no editor at all, the verb alone | the rules stay where they are today, drawing nowhere |

Take the smallest road that draws in the editor. A server nobody can start
draws nothing.

# The eleven rules it holds

Read them out of `test/contract/tree.test.js` and move each one whole:

| the rule | the two things it compares |
|---|---|
| the settings name the binaries this tree installs | `.vscode/settings.json`, the install script |
| the editor draws the rules the write door draws | `.vscode/settings.json`, `.vale.ini` |
| Windows takes the biome extension | `.vscode/settings.json`, the platform map |
| a clone opens with both extensions on offer | `.vscode/extensions.json`, the settings |
| the lnav format reads what the log door writes | `spec/config/lnav`, `lib/log.js` |
| a second stop file adds a rule with no code change | `spec/config/stop`, `lib/stop.js` |
| no code path deletes a log file | every source file |
| a name in git holds five words | every path git holds |
| the survey names every tool the installer installs | `.se/tools.json`, the install script |
| the survey finds the node running it | `.se/tools.json`, the running process |
| every script passes the path rule | every `.sh` and `.ps1` |

Each becomes a function answering a list of findings, each finding carrying a
file, a line, a column and a message. That shape already stands: `pathInScript`
in `lib/scripts.js` answers it, and the refusal line in `lib/refuse.js` prints
it.

# Where it lives

- The rules go in `.claude/skills/level0/lib/tree.js`, free of `node:` imports,
  so the hooks module may read them later.
- The server goes in `src/scripts/lsp.js`, reaching the outside through the
  doors alone.
- `./RUNME.sh lsp` starts it, and `./RUNME.sh lint` runs the same rules once
  over the tree.

One holder, two callers. A rule that draws in the editor and a rule that fails
the check are the same function.

# What leaves the tests

Delete the eleven from `test/contract/tree.test.js`. That file then holds the
cases that read the real disk and nothing else, or it goes.

Put a contract case in their place for each rule. Hand the function a tree that
breaks it and assert the finding. Then hand it this tree and assert none. The
fake disk makes that cheap.

# What to prove first

1. `./RUNME.sh check` passes, and it runs `claude plugin validate` for you.
2. Each of the eleven answers a finding on a broken tree, under test.
3. `./RUNME.sh lint` reports every one of them, so the check still holds.
4. The server answers `initialize` and publishes a diagnostic. Prove it by
   driving stdio from a test, with no editor.
5. A person opens the tree in the editor and sees one of the eleven draw. Say
   exactly what they install to get there.

# What your handback says

- Which way into the editor you take, and what it costs a person.
- How long the workspace index takes on this tree.
- Which of the eleven refuse to move, and why.

## How this branch runs

Level zero deletes this file when it reads it, so the copy in your context
is the only one left. These steps write it back.

1. Run `./RUNME.sh work sync` FIRST. It takes main into this branch, so
   an old branch works against what the tree holds now. Resolve any conflict
   before you start, because a conflict found later costs the work already
   done.
2. Commit and push each time you finish a thing. A cloud box dies and takes
   its working tree with it.
3. Write your result and your retro into `HANDOVER.md`, at the root, replacing
   this brief. Say what surprises you and every dead end you walk into.
4. Run `./RUNME.sh work done`, which sets the status and pushes.
5. Run `./RUNME.sh work release` instead where you stop early, so the branch
   goes back to `todo` for somebody else.
6. Leave the merge into main to a person. A cloud box opens no pull
   request, and trunk only ever comes towards you.
