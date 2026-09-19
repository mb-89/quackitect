---
kind: [[ticket]]
state: draft
steps:
  - name: collect
    does: moves everything the private folder holds past its dot folders into the retro's input folder, and copies the transcripts, the memory and the scratchpads beside it
    by: anyone
    to: owner
    needs: ["retro"]
    reads: [[spec/guidance/retro/collect]]
    evidence:
      - name: run
        form: command
        expects: 0
        says: retro collect, which leaves the private folder holding .runtime and .retro alone
      - name: counts
        form: list
        says: the count for each source, as the verb prints it
process: [[spec/processes/retro]]
process_hash: 4d04c84dd2a1fb0f
---

# Ask

<!-- why, as text: what calls for it, as notes standing open, an iteration ending, or the owner asking -->
The owner asks for the retro again, built one step at a time. The two retros before this one read counts that measured nothing, so both leave, and this one reads the window whole.

# collect

<!-- moves everything the private folder holds past its dot folders into the retro's input folder, and copies the transcripts, the memory and the scratchpads beside it -->

## run

    ./RUNME.sh retro collect retro-dbbbc19

<!-- the form is command -->

## counts

- .se: 393 files, the log, the private tickets, the scripts and every loose file
- transcripts: 150 files, off two session folders
- memory: 9 files, copied whole
- scratch: 181 files, off twenty scratchpad folders
- refused: none

<!-- the form is list -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
