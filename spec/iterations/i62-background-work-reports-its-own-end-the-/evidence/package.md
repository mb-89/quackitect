---
form: package
by: agent
signed_off: 2026-08-24T17:36:01.579Z
authors: agent
files:
---

# Evidence form / package

## current_situation

The validation gate is signed and blessed, and every gate behind it is too. The tree is green at rest.

The version went from 8.0.0 to 8.1.0 in the one place that holds it, and the packaged engine reports the new number back.

The archive assembled by script and was then checked by installing from it and driving it.

## package

- dist/quackitect-8.1.0.zip

## works

yes

OBSERVED ON THIS MACHINE, 2026-08-24, on linux with node v22.

WHAT WAS DONE. The archive was unpacked into an empty folder. The engine's dependencies were installed, which is the step the one-time installer performs. The packaged engine was then started and spoken to over its own protocol.

WHAT CAME BACK. It named itself and its version: 8.1.0, so the bump travelled into the artifact rather than only into the manifest. It served 41 tools with se_pull among them. A first pull answered `read` and handed over the boot document, which is the first instruction of the walk.

WHAT THE RAW UNPACK DOES. It refuses to start, naming the missing dependency. That is by design, not a defect: the archive ships no node_modules and the installer fetches them. The refusal names what is missing rather than failing silently.

A SECOND ENGINE ALONGSIDE THIS ONE WAS FINE. The packaged engine served a different folder, so it took a different hold and neither refused the other.

THAT IS NOT THE GUARD BEING DEMONSTRATED, and this line first said it was. Two engines on DIFFERENT folders not refusing each other shows the absence of a false refusal. The requirement is about the same folder, and that case is demonstrated by a case rather than here.

## emit_back

- The desk's greeting itself. The check reached the FIRST instruction of boot, not the end of it — the greeting is several reading rounds further on, and driving those over the protocol would be re-implementing the agent.
- The one-time installer end to end. RUNME.ps1 is PowerShell and this is a linux box, so the install step was performed by hand rather than by running the installer. What the installer does beyond it was read, not run.
- The editor extension in use. It travels as deliverable/vscode/extension.js and was confirmed present in the archive. Nothing here opened an editor.
- Windows. Nothing in this record ran anywhere but linux.
- The same-folder refusal, through the package. Two packaged engines on ONE folder were never started against each other here. The refusal is demonstrated by a case that spawns a real second holder, not by this check.
- Whether the archive's contents were audited for what should NOT be in them. This check confirmed what is present. A separate reading of the packaging script's exclusions covers the other direction.

## follow_up

- CHECK THE PACKAGE ON WINDOWS, where the one-time installer can actually be run. Ready when a Windows machine is available.
- NOTHING ELSE IS PARKED BY THIS STATE.

## anything_else

