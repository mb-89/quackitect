---
form: package
by: agent
signed_off: 2026-08-19T14:01:46.739Z
authors: agent
files: null
---

# Evidence form / package

## current_situation

The validation gate is blessed and the archive is built: `dist/quackitect-5.0.0.zip`, 2,936,369 bytes, assembled by `engine/bin/package.ts` from the working tree minus what stays home.

It was checked by being USED, not by being inspected. A fresh directory, an unzip, and the questions a new owner would ask in the order they would ask them.

The first of those questions is the one this record built: what version is this. It answered before the dependencies were installed.

## package

- dist/quackitect-5.0.0.zip

## works

yes — extracted into an empty directory and exercised in the order a new owner would.

`node project/deliverable/engine/bin/se-mcp.ts --version` from the extracted tree: exit 0, stdout `5.0.0`, stderr empty, 196 ms — WITH NO `node_modules` PRESENT. That is this record's own requirement answering from the artifact it was written for, and it is a harder case than the story asked for: the copy says what it is before the install is even finished.

`npm install --no-audit --no-fund` in the extracted `project/deliverable`: exit 0, 32 packages in 5 s, from the archive's own manifest.

`preflight.ts` from the extracted copy: `preflight green`, exit 0, 269 ms — including this record's new check, which asks the brand module and the palette reader where THEY look. Both files are in the archive; the zip manifest lists `brand/brand.json` and `brand/palette.css`.

`smoketest.ts` from the extracted copy: `smoke green in 0.4s`, exit 0 — cards load, the rigor matrix reads, the machines compile, every engine module loads.

WHAT THIS DOES NOT SHOW: the VS Code side. `RUNME.ps1` is in the archive and was not run, because this box has no PowerShell and no editor. That is the same gap every cloud-run package check has carried and it is not new here.

## emit_back

- The archive answers `--version` with no dependencies installed. That is stronger than the story claimed and belongs in the story's own slide, where it now is.
- `preflight` from the extracted copy runs in 269 ms against 721 ms in the developing checkout. The archive carries no records and no history, so the sweep has almost nothing to walk — a number worth knowing before anybody quotes the boot time as one figure.
- The package check still cannot touch the Windows half. RUNME.ps1 ships unexercised from every cloud run, and no record has yet said what that is worth.

## follow_up

THE PACKAGE PROOF IS NOW RUNNABLE AND NOBODY RUNS IT AUTOMATICALLY. Everything above was done by hand at this state. The same five commands would make a package smoke test, and the release gate would then be reading a result instead of a story about one.

RUNME.ps1 REMAINS UNEXERCISED on every cloud run. It is in the archive, it is the documented way in, and no automated check on any box this project uses can touch it.

## anything_else

