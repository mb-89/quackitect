---
form: sweep-consistency
by: agent
signed_off: 2026-08-19T13:49:45.315Z
authors: agent
files: null
---

# Evidence form / sweep-consistency

## current_situation

The build is done, verified and blessed. Five behaviours changed and five engine or corpus defects were repaired, so the sweep walks nine surface classes against that list.

Seven live surfaces were stale and are fixed. One class has no surface in this tree and is named as residue rather than ticked silently.

The prompt layer was re-projected after every guidance edit, because preflight refuses to boot when the projection drifts from its source.

## swept

- [x] command and tool docs
- [x] engine-served strings
- [x] method cards
- [x] matrix rows
- [x] templates and skeletons
- [x] guidance chapters
- [x] book chapters
- [x] README and entry documents
- [x] panels and form help

## follow_up

The `--version` flag now exists on the lane entrypoint only. Every other program in `engine/bin/` still cannot say which build it is, and the help guard does not ask for the flag the way it asks for the others. That is a note, not a defect of this record.

The book class has no surface in this tree yet. When one is written, the five behaviours this record changed are among the first things it has to teach, and nobody will find that out from this form.

`project/spec/version-planning.md` carries thirteen standing voice findings, none of them on the lines this record touched. It is the largest un-linted document on the tree.

## anything_else

