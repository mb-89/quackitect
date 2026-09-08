---
kind: [[handover]]
status: todo
---

# Wire the language server

Level zero holds its rules at the write door and on the command line. The editor
shows none of them, so a person meets a rule one write too late.

## What is already settled

Both language servers exist. This work installs and configures them.

| server | holds | how it arrives |
|---|---|---|
| `vale-ls` v0.5.1 | every Vale rule in `spec/config/styles/VoiceVale` | a prebuilt binary per platform, from `vale-cli/vale-ls` releases |
| `biome lsp-proxy` | every Biome rule over JavaScript and JSON | already in `.se/bin/biome`, one subcommand |

`vale-ls` wraps the Vale binary this tree already installs, reads the same
`.vale.ini`, and answers diagnostics as a person types. It also serves code
actions over a vocabulary and a code lens per document.

## Do this

1. Add `vale-ls` to `src/scripts/install.sh` and `install.ps1`, one row each
   beside Vale and Biome. Pin the version and take the binary into `.se/bin`.
2. Write `.vscode/settings.json` naming both servers, so a clone opens with the
   rules live in the problems panel.
3. Answer whether a `.claude` editor surface needs its own entry, and write what
   you find here.
4. Add a `doctor` row for each server, so `./RUNME.sh doctor` names both.
5. Leave the judged rules alone. They need a model per span, no language server
   speaks that, and `spec/config/styles/VoiceJudged` stays with the write door.

## What holds

- `./RUNME.sh check` stays green
- `./RUNME.sh doctor` names both servers and their versions
- a breach opened in the editor draws a diagnostic carrying the same rule name
  the write door names
- a cold clone reaches that state with one `./RUNME.sh` and no setup

## Where to look

- `src/level0/lib/vale.js` is the one caller of Vale, and the finding shape
  every door reads
- `spec/design_output/level0.md` says what each door does today
- `.vale.ini` scopes rules by path, and the editor reads the same file

## When you finish

1. Replace this brief with your result, keeping the frontmatter.
2. Write a retro under `## Retro`: what surprises you, and every dead end you
   walk into. The next session pays for a repeat.
3. Run `./RUNME.sh work done`, which sets the status and pushes.

## How this branch ends

Level zero deletes this file when it reads it, so the copy in your context
is the only one left. These steps put it back.

1. Commit and push each time you finish a thing. A cloud box dies and takes
   its working tree with it.
2. Write your result and your retro into `HANDOVER.md`, at the root, replacing
   this brief. Say what surprises you and every dead end you walk into.
3. Run `./RUNME.sh work done`, which sets the status and pushes.
4. Run `./RUNME.sh work release` instead where you stop early, so the branch
   goes back to `todo` for somebody else.
5. Leave the merge to a person. A cloud box opens no pull request.
