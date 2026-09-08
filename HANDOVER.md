---
kind: [[handover]]
status: done
---

# The editor holds the rules the write door holds

`./RUNME.sh` installs vale-ls beside Vale and Biome, `.vscode` names both
servers, and `./RUNME.sh doctor` says their versions. The design record stands
at [[spec/design_output/editor]].

| what lands | where |
|---|---|
| the version pin and the asset matrix | `src/level0/lib/servers.js` |
| the download, soft on a failure | `src/scripts/install.sh`, `src/scripts/install.ps1` |
| the tracked settings | `.vscode/settings.json` |
| the recommendations | `.vscode/extensions.json` |
| the doctor rows | `src/scripts/cli.js` |
| the tests | `src/level0/test/servers.test.js` |
| the design record | `spec/design_output/editor.md` |

`./RUNME.sh check` passes: the tests, then the rules over the tree.
`./RUNME.sh doctor` answers:

    vale-ls            vale-ls 0.5.1
    biome lsp-proxy    biome 2.5.12
    editor             .vscode/settings.json, both servers

# The answer the brief asks for: `.claude` takes no entry

Level zero reads every Write and Edit at `tool.call` and runs Vale, Biome and
the judge there. That door sits inside the harness process and speaks no
language server protocol, so a `.claude` editor surface has nothing to hold.

The judged rules stay with the write door, as the brief asks. A model answers
one question per span, and no language server speaks that.

# Retro

## The extension manages its own vale-ls

The Vale extension downloads vale-ls into per-extension storage and checks a
SHA-256 against it. It reads `vale.valeCLI.path` for the Vale binary alone, so
no setting points VS Code at `.se/bin/vale-ls`.

The copy in `.se/bin` still earns its place. `doctor` names it, and an editor
that starts a server binary by path runs it. A session that wants VS Code on the
pinned copy has to ask the extension for that setting first.

That surprise turns the download into a want. A failure there costs one warning
line, and `./RUNME.sh` goes on, because Vale and Biome carry the doors. Proof:
point the pin at a tag the release skips, and the install answers 404, warns,
and exits 0.

## Windows breaks the asset pattern

| platform | target |
|---|---|
| Windows x86 | `x86_64-pc-windows-gnu` |
| Windows arm64 | `aarch64-pc-windows-msvc` |

A guess at msvc for x86 answers 404. Every other platform follows the usual Rust
triple. The test holds the whole matrix, so the next version bump shows a
mismatch at once.

## A relative path reaches Vale

`vale.valeCLI.path` travels to vale-ls verbatim, with no `${workspaceFolder}`
expansion. The extension spawns vale-ls with `cwd` set to the workspace folder,
so `.se/bin/vale` resolves from there. `vale.valeCLI.config` takes a relative
path through the extension's own join.

So the settings file travels with the tree and names no machine.

## Dead ends

- The GitHub API answers 403 through this box, so every source read here comes from `raw.githubusercontent.com`.
- `marketplace.visualstudio.com` and `biomejs.dev` sit behind the egress block, so the setting names come from each extension's `package.json`.
- The old Vale extension `errata-ai.vale-server` carries different settings. The live one is `chrischinchilla.vale-vscode`.
- The brief names `vale-cli/vale-ls`, and `errata-ai/vale-ls` serves the same release. The pin uses the name the brief gives.

## What stays open

| thing | why |
|---|---|
| Windows and macOS installs | this box runs Linux, so both stand unproven |
| the `biome.lsp.bin` platform keys | the extension's own example names four, and the rest follow its pattern |
| workspace trust | VS Code holds `vale.valeCLI.path` at its user value until a person trusts the folder |
| the editor diagnostic itself | proving a rule name in the problems panel wants a person with VS Code open |

## A defect this work walks past

`./RUNME.sh check` runs Biome over nothing:

    $ .se/bin/biome lint --config-path=spec/config .
    × Found a nested root configuration, but there's already a root configuration.

The scan of `.` meets `spec/config/biome.json` a second time, Biome lints no
file, and it exits 0. So the check passes green with half a door.

`./RUNME.sh lint src` shows what the `.` path hides: one
`correctness/noUnusedImports` at `src/level0/hooks/level0.js:8`.

That sits outside this brief, so the code stands as it is. It wants its own
branch.

## One word of the contract fails the tree's own rules

`withContract` in `src/scripts/work.js` closes with a sentence whose verb Vale
tags as a past tense. So every generated brief carries one breach, and
`./RUNME.sh check` goes red while a handover sits in the tree.

This branch changes that word to "bring". A test over the contract text still
waits for somebody.

## How this branch ends

Level zero deletes this file when it reads it, so the copy in your context
is the only one left. These steps bring it back.

1. Commit and push each time you finish a thing. A cloud box dies and takes
   its working tree with it.
2. Write your result and your retro into `HANDOVER.md`, at the root, replacing
   this brief. Say what surprises you and every dead end you walk into.
3. Run `./RUNME.sh work done`, which sets the status and pushes.
4. Run `./RUNME.sh work release` instead where you stop early, so the branch
   goes back to `todo` for somebody else.
5. Leave the merge to a person. A cloud box opens no pull request.
