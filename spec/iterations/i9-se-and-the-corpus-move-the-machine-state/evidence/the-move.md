---
form: the-move
by: agent
signed_off: 2026-08-20T10:55:06.406Z
reopened: 2026-08-20T10:44:55.303Z — bundleStale compares modification times, which git does not preserve, so a fresh clone can be refused a launch for a current bundle
authors: agent
files: null
---

# Evidence form / the-move

## current_situation

The chunk stood, and the bundle check I added to defend it would have broken a fresh clone.

IT COMPARED MODIFICATION TIMES. Git does not preserve them, so on a checkout whichever file the tool happened to write last looks newer than the bundle. A current tree reads as stale.

AND THE INSTALLER EXITS ON A RED ENGINE CHECK. So a clone could have been refused a launch for a build that was fine, by a check written to protect it.

The check also read the source folder one level deep, so a file in a subdirectory could never make the bundle look stale.

## built

`statedecl.ts`, `paths.ts`, `statedecl-check.ts`, `rootcheck.ts`, `files.ts`, `errors.ts`, `toll.ts`, `esbuild.mjs`, `guidance/refusals.md`, and the editor extension.

### The declaration

`statedecl.ts` holds the folder's name, which of its files a structured verb serves instead of a read, and `productOwnedNames` — the names that belong inside the opened folder and nowhere above it.

A third list records that `reading.md` is served DESPITE having a verb, and why. Its door IS the read.

### The resolver

`paths.ts` gained `openedFolder`, `seDir`, `seRelative` and `withheldDoor`. No path is hard-coded in the engine.

### Four checks, and two were added after fresh eyes

`statedecl-check.ts` carries them; `binpreflight.ts` fails on any.

- `strayLiterals` — an address spelled out, across the engine and the tests, in every source extension.
- `joinsItself` — the same fault with no literal to see: a caller handing the declaration's own join a repository root.
- `bundleStale` — a shipped bundle not built from the source beside it.
- `splitsItself` — an engine file that finds a frontmatter block by hand. It belongs to the corpus reader's chunk and is named here because preflight runs them together.

### The bundle check compares content

The build writes a hash of its sources into the bundle's banner. The check recomputes that hash and compares. Two hashes of the same bytes agree on every machine; a modification time does not.

ONE FUNCTION COMPUTES IT. The first attempt had two — one in the build, one in the check — hashing the same files under different keys, and they never agreed. That is the same duplication this iteration spent a day removing, reintroduced while removing it.

A case asserts four things: this tree is current, it stays current when every source file is touched to a checkout-fresh instant, an unstamped bundle is reported, and a stamp that does not match is reported.

### The editor extension

It wrote the machine state at the old address and would have undone this move on its next activation. It now derives the same way the engine does. The opened folder's name was a bare literal inside its own root test; it is a declared constant, and the drift check compares both constants in both the source and the shipped bundle.

### The exclusion split, and the toll

`files.ts` refuses a door file with SE-C-144, naming the verb that serves it. `toll.ts` exempts a spill read and a poll, neither of which is work.

### The sweep

- 179 lines of hard-coded address in the code, down to THREE, and all three are correct: the declaration itself, and its two generated copies — the extension's source and the shipped bundle — which the drift check now compares.
- 237 lines of live text, down to twelve, each one right.
- 88 lines in past iterations' evidence left alone, and ten dated measurements the script rewrote put back.
- Three ignored trees searched by script, plus the client configuration. Nothing in the product needed changing there.

### The tree

1555 pass, 7 fail. Lint green, preflight green, corpus sweep green over 1969 nodes.

## follow_up

### A check written to protect something can break it

This one would have turned away a clone. The fault was choosing a signal that is not preserved by the thing that moves code between machines, and no case would have caught it because every case runs where the file was just written.

THE CASE NOW SIMULATES A CHECKOUT, by touching every source file to one instant. That is the cheapest thing that would have failed the old check.

### The stale bundle predates this iteration

Rebuilding it moved 73 lines, most of them features that had landed in the source and never reached the file the editor loads. Nothing in the battery runs the extension, so those lines entered the shipped artifact with no verification beyond the two constants matching.

WHETHER THE STALENESS WAS DELIBERATE IS NOT SETTLED HERE. It is put to the owner; if the bundle was pinned on purpose, the rebuild is what to revert, not the check.

### The folder still moves by hand

The engine cannot move the state it is running on. The move's own case stays red until it lands, which is what it is for.

## anything_else

WHY THE WALK SEEMED STUCK FAR UP THE MACHINE, which the owner spotted twice: the running lane was stale. It predated the morning's merges, so it served the old machine and re-climbed states that were already signed. `se_file_read` refusing `char_offset` proved it, because that argument had shipped hours earlier. `se_reload` fixed it and the next pull stamped immediately.

THE CHECK THAT CATCHES THE WRONG ARGUMENT WAS ADDED AFTER IT BIT. `strayLiterals` reads text and cannot see a call that hands the right function the wrong thing. `joinsItself` was written because the vault did that and the failure surfaced three files away, in a watcher test that has nothing to do with paths.
