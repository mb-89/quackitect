---
steps:
  - id: chunk-guard-tests
    statement: "Two tests for guards that already exist and have never been exercised: a write lane refuses an @ address, and a path cannot climb out of a declared base. Both should pass on the unchanged engine — a red means the guard was never real."
    depends_on: []
    realization: software
  - id: chunk-travelling-bound
    statement: A producing act is bounded to the tree it is producing, for the duration of the act. The bound travels with the act rather than sitting at a fixed root, and it is checked at the one resolution seam every verb goes through.
    depends_on:
      - chunk-guard-tests
    realization: software
  - id: chunk-declared-write-target
    statement: A declared root gains a writable flag, resolveInRoot routes a writable root-ref into the resolver that already contains it, and a declared target that is the tree this system came from is refused. This is what lets the engine drive a foreign project.
    depends_on:
      - chunk-guard-tests
    realization: software
  - id: chunk-producing-acts
    statement: "Both producers as lane verbs: copy the tree, delete the engine's own expedition and iteration folders, write the name and the upstream file, git init and one commit. The project producer writes the record naming which vehicle drives the tree. Refuse before writing anything."
    depends_on:
      - chunk-travelling-bound
    realization: software
  - id: chunk-the-two-buttons
    statement: Two VS Code commands, one per producing act. Each asks for what it needs — the vehicle button asks where, what to call it and the short name — then opens a new window on what it produced, leaving the window it was launched from untouched.
    depends_on:
      - chunk-producing-acts
    realization: software
  - id: chunk-runme-drops-the-export
    statement: The export section leaves RUNME.md, because the buttons replace it and a second way to do it in the front-door document keeps the problem the story describes. The script's two hard-won guards are already recorded on el-vehicle-producer so the deletion cannot take them.
    depends_on:
      - chunk-the-two-buttons
    realization: software
---
