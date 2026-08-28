---
form: the-install-preflight
by: agent
signed_off: 2026-08-20T10:03:52.046Z
reopened: 2026-08-20T09:51:50.345Z — fresh eyes found the verify never runs on the default path, and the runtime pin cannot execute on the runtimes it exists to catch
authors: agent
files: null
---

# Evidence form / the-install-preflight

## current_situation

The chunk stood, and fresh eyes broke two of its claims.

THE VERIFY NEVER RAN ON THE DEFAULT PATH. The editor branch ends in `exit 0`, and the verify call sat after it. The chunk's own statement says the entry point verifies itself and reports ready; on the path the script calls default it did neither.

THE PIN COULD NOT RUN ON THE RUNTIMES IT EXISTS TO CATCH. Removing the installer's hand-written comparison left only a check written in TypeScript, spawned by an installer that had confirmed nothing about the runtime except that one exists. On an old runtime that check is a syntax error before its first line, which is the precise failure the design says a pin prevents.

Three smaller findings stood with them: the declared-floor case went red on divergence rather than on a copy, the nothing-changes case stamped one folder rather than a tree, and the editor was reported optional 27 lines before the installer exited on it.

## built

`deliverable/engine/bin/install-preflight.ts`, `deliverable/package.json` and `RUNME.ps1`, with ten cases in `deliverable/tests/install-preflight.test.ts`.

### The pin moved to where the shell can read it

`package.json` carries `se.runtimePin`. The check reads it. The installer reads the same field with PowerShell's own JSON parser and compares natively, BEFORE it spawns anything.

SO THE ONE NUMBER IS CHECKED BY WHICHEVER OF THE TWO CAN STILL RUN. That is the fix rather than putting the comparison back into the script: a copy in the shell would drift from the copy in the check, and the design's whole point is one declared answer.

A case asserts three things about it: the field is in `package.json`, the check reads it from there, and the installer reads it too. A field nothing consults is a second copy waiting.

### Both paths verify, and each verifies its own work

The two paths do different things. The default one puts the extension in place and hands over, and the engine's dependencies are installed later by the extension. The `--classic` one installs those dependencies itself and copies no extension.

So `afterInstall` takes what to expect. The default path checks the extension it copied; the classic path checks the dependencies it installed. Checking for the other path's work would report a failure that is nobody's.

A case asserts the two paths do not check the same thing.

### Two oracles that could not fail on the fault

- THE FLOOR CASE now reads the check's own source and refuses a copy of the floor in it. Comparing two values only goes red once somebody bumps one; this goes red when the copy appears.
- THE NOTHING-CHANGES CASE stamps the whole engine tree, recursively, and covers the verify run too. It stamped one folder, non-recursively, and would not have seen a write anywhere else.

### The editor

It stays optional to the product and required by the default path, which is what the constraint already said. The installer now says so where it exits, and names `--classic` as the path that does not need one.

### The tree

1552 pass, 7 fail. Lint green, preflight green, corpus sweep green over 1969 nodes. All ten cases for this chunk are green, and the seven reds belong elsewhere.

## follow_up

### What a read-only verification could not reach, and still cannot

No case here runs the installer. The cases prove the check reports correctly and that the installer's text reads the pin; they do not prove the script executes end to end.

THE DEMONSTRATION THAT WOULD is `tsp-the-arrival-in-one-act`, and it needs a machine nobody has cleaned yet. That is the standing gap this chunk cannot close from inside a repository that is already installed.

### The finding that generalises

A check written in the language it is checking for cannot run when the answer is no. That shape is worth looking for elsewhere: any guard that must survive the condition it guards against has to be written in something that survives it too.

### Where the line falls, unchanged

The preflight still installs nothing. The installer installs what it can and reports what it cannot, and the two requirements record that they weigh against each other.

## anything_else

