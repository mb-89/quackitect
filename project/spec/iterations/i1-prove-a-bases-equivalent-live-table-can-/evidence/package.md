---
form: package
by: agent
signed_off: 2026-08-11T14:35:36.506Z
authors: agent
files:
---

# Evidence form / package

## current_situation

The M9 recut stands: package is the automated step after the blessed gate-validation. The packager script exists (engine/bin/package.ts, trunk commit 63f3ba43, synced into the record), and the archive is built at dist/quackitect-3.0.0.zip in this record's tree and on trunk.

## package

- dist/quackitect-3.0.0.zip

## works

yes — extracted the archive to a folder outside the repo: the root holds README.md, RUNME.ps1, RELEASES.md and project/; the README renders the product name Quackitect; npm install in project/deliverable added 30 packages clean; preflight from the extracted tree printed preflight green (runs in the call log, job-msorbhdk-5). Not performed: a full RUNME install with VS Code on a fresh machine — that run is already owed as the ramp-up demonstration (raid-issue-must-demos-owed).

## follow_up

The fresh-machine install run closes part of raid-issue-must-demos-owed when performed. The four engine version stamps still say 3.0.0-bootstrap — note-4c4a3f8bb8a5 parks the one-source fix.

## anything_else

