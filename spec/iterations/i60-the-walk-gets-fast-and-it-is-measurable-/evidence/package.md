---
form: package
by: agent
signed_off: 2026-08-24T20:07:24.857Z
authors: agent
files: null
---

# Evidence form / package

## current_situation

THE VERSION IS BUMPED AND THE ARCHIVE IS ASSEMBLED BY SCRIPT.

`deliverable/package.json` moves 8.0.0 to 8.1.0, which is the minor this round pinned.

`node deliverable/engine/bin/package.ts --root .` produced `dist/quackitect-8.1.0.zip`, 3,354,721 bytes, in 10.2 seconds.

NOTHING WAS ASSEMBLED BY HAND. The script is the product, and its exclusion list lives in `deliverable/engine/produce.ts` so the packaging and the producing act cannot drift.

## package

- dist/quackitect-8.1.0.zip

## works

yes — the archive was extracted OUTSIDE the project root and every item the ship method names is present: the README, the RUNME.ps1 one-time installer, the editor extension at deliverable/vscode/extension.js, and the engine at deliverable/engine/bin/se-mcp.ts. The extraction went to a temporary folder on purpose: an in-tree second copy of the project is what failed two tests in this repository for weeks, and this round is what found it.

## emit_back

- none

## follow_up

### What this check did NOT do, said plainly

NO INSTALL WAS RUN FROM THE PACKAGE, and no desk greeting was reached from it. The method asks for that, and what stands here is a contents check of the extracted archive rather than a live install.

WHY IT WAS NOT DONE: installing puts a second engine on this machine holding the same folder and port, which the record already carries as an open work token. The gap is named rather than papered over, which is what the method asks for when a check cannot close.

### What was checked instead, at the owner's request

THE SHUTDOWN-AT-FRONT-DESK CONTROL. Its code is sound: a thirty-second timer fires when nothing has happened for five minutes, no job younger than an hour is running, and every active state is the front desk.

TWO GAPS, BOTH IN `note-93619be479d7`. Nothing counts down while it is armed, so a person sees five silent minutes and then Windows' own sixty seconds. And an agent cannot arm it, because the toggle is a mirror control rather than a lane verb — which is awkward for a feature whose whole purpose is the case where nobody is there to press it.

## anything_else

