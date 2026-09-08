---
kind: [[handover]]
status: todo
---

# A tool says where it is, and nothing guesses

Scripts in this tree name a path and hope. `.se/bin/vale.exe` is a guess about
the platform. An interpolated `$root` is a guess about the shell, and it fails
twice over, which is why `NoPathInScript` now refuses it.

Nothing asks the box where its tools are, so every caller guesses again.

## What to build

A survey that runs at install and writes `.se/tools.json`, naming what this box
carries and where:

    {
      "node":   { "path": "...", "version": "24.19.0" },
      "vale":   { "path": "...", "version": "3.20.0" },
      "biome":  { "path": "...", "version": "2.5.12" },
      "valeLs": { "path": "...", "version": "0.5.1" },
      "git":    { "path": "...", "version": "..." },
      "sh":     { "path": "..." },
      "python": { "path": "..." }
    }

Then everything reads that file to find a tool:

- `src/level0/lib/vale.js` and `code.js` take the path from it
- the hooks module reads it at `session.start`
- `./RUNME.sh doctor` prints it, which is most of what doctor already does

## Do this

1. Write the survey. It runs `command -v` or `Get-Command` per tool, and it
   asks each one for its version. A tool it cannot find gets a null.
2. Write `.se/tools.json` from it. Git ignores `.se`, so it stays on the box.
3. Make the callers read it, with the guess as the fallback where the file is
   absent.
4. Say in the standing layer that `.se/scripts` is where a session writes a
   script of its own, and that `.se/tools.json` says what it may call.
5. Make a cloud session list every script it writes under `.se/scripts` in its
   handover, so a person decides whether one earns a place in the tree.
6. Take the guessed paths out of `src/level0/lib/vale.js`, `code.js` and
   `servers.js`, or say on this handover why one stays.

## What holds

- `./RUNME.sh check` is green
- `.se/tools.json` names every tool the install script installs
- a tool absent from the box reads as null, and the caller degrades and carries
  on
- no source file builds a path to a binary from a platform test, and this
  handover names every one that still does, with its reason
- `./RUNME.sh doctor` reads the survey, and probes nothing twice

## Where to look

- `src/scripts/install.sh` and `install.ps1` already find each tool to install it
- `src/level0/lib/servers.js` holds the pin and the asset matrix for vale-ls
- `src/level0/lib/scripts.js` holds the rule over an interpolated path
- `spec/design_output/level0.md` says what each door does

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
