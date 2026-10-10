---
kind: [[ticket]]
state: open
steps:
  - name: sync
    does: takes trunk into the branch, so the box works on the latest
    when: cloud
    by: agent
    needs: ["branch sync"]
    evidence:
      - name: sync
        form: command
        expects: 0
        says: branch sync, so the branch carries trunk
  - name: split
    does: reads the standing children, and mints more where the goal needs them, each naming this group
    from: anyone
    by: anyone
    input: ask
    checklist: ["every child is small enough to review whole, or is a group itself", "the children add up to the goal, and nothing of the goal stands outside them", "a child that waits on another names it under depends_on", "each child names what it reads from its siblings, and the children land in that order", "a group whose diff grows past one review splits into a group of its own before it grows further"]
    evidence:
      - name: children
        form: list
        says: every child as a link, one a line, with its process
  - name: children
    by: children
    on_fail: split
  - name: accept
    gate: does the work of every child add up to the goal, and does every command of the route pass
    final: true
    does: reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points
    tags: ["review", "accept"]
    input: ["ask", "children"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: retro
    to: retro
    steps:
      - name: notes
        does: decides every private note on the box, and works what it mints into this group
        needs: ["retro"]
        evidence:
          - name: drained
            form: command
            expects: 0
            says: retro notes, which passes when the private folder is empty
      - name: write
        does: writes the retro over the box's own window
        input: ["children", "notes"]
        checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every number the change adds carries a name in one place, and a copy a technical reason forces says so beside it", "every header the change writes says what its file is for, and counts nothing", "the chapter carries the run's owner prompts and errors off the transcript, each with its time", "the chapter says the role, and carries no name, address or path of the box"]
        evidence:
          - name: done
            form: list
            says: what was done, one line a ticket or a thing
          - name: well
            form: list
            says: what went well, and what made it go well
          - name: badly
            form: list
            says: what did not go well, each error of the run and each owner prompt turning it, with its time
          - name: improve
            form: list
            home: true
            says: how each bad line stops happening, each line naming its home as a link, a ticket in backticks or a path in backticks
          - name: thoughts
            form: text
            says: what the thoughts say that the actions do not, off the transcript
      - name: cloud
        does: names what the box lacked, met and leaves for a person
        when: cloud
        input: write
        evidence:
          - name: lacked
            form: list
            says: a tool, a host the proxy refused, a right the platform refused, an install, each with its moment
          - name: met
            form: list
            says: the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone
          - name: left
            form: list
            says: every person step parked, every ticket minted with no group, and what the handover says
process: [[spec/processes/group]]
process_hash: d9f9539fef3ec913
step: accept
record:
  - step: sync
    hand: box c729ff43c0cb · claude-code-remote
    hash_before: 75eb0fa3ef2445795b8cd00bc0813891fb252506
    session: cse_013fMAyhVtjaJgmP3RMQ2Ca4
  - step: sync
    hand: box c729ff43c0cb · claude-code-remote
    hash_before: ea760eaafde5b4bf5ab367d00b9f7a84849042ba
    hash_after: ea760eaafde5b4bf5ab367d00b9f7a84849042ba
    answered:
      - name: sync
        exit: 0
        said: work/lsp-takes-the-lenses already carries every commit on main.
    def: 8a9850a81227554b
  - step: split
    hand: box c729ff43c0cb · claude-code-remote
    hash_before: c752a071caf6013ba8cfdf5a216b7ace56fa3bd9
    hash_after: c752a071caf6013ba8cfdf5a216b7ace56fa3bd9
    inputs:
      - name: ask
        hash: 63a403de5b0c670a
        size: 315
    def: 19b6849b1f151cd5
  - step: children
    hand: the engine
    hash_before: 700d94c4a3d795912e3578a5cab78d320b8dbf44
    hash_after: 700d94c4a3d795912e3578a5cab78d320b8dbf44
---

# Ask

<!-- goal, as text: what these tickets add up to, for the hand that takes them -->
goal: `se-index lsp` draws the buttons over a ticket and runs their press. It marks the fields a held leaf still wants, and answers their hover. Every LSP editor gets them through the standard. The extension starts the language client and keeps its editor-only parts. A VS Code user sees the same buttons and marks.

# sync

<!-- takes trunk into the branch, so the box works on the latest -->

## sync

<!-- branch sync, so the branch carries trunk -->
<!-- the form is command -->

./RUNME.sh branch sync

# split

<!-- reads the standing children, and mints more where the goal needs them, each naming this group -->

## children

<!-- every child as a link, one a line, with its process -->
<!-- the form is list -->

- [[spec/tickets/lsp-draws-the-ticket-lenses]], standard
- [[spec/tickets/lsp-marks-the-held-fields]], standard
- [[spec/tickets/the-client-drops-fields-js]], trivial
- [[spec/tickets/the-marks-note-names-marksin]], trivial
- [[spec/tickets/extension-keeps-the-editor-parts]], standard

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each child closed through its own review, and the group's diff reads as one review of the server, the client and their notes
- the server's buttons, its marks and hover, and the extension's shrink cover the goal, and every child stands closed
- extension-keeps-the-editor-parts names both server children under depends_on
- the server children landed first, and the extension child read their command and HeldField code
- the diff stays one move, the buttons and marks from the extension into the server, so it takes no subgroup

# children

# accept

<!-- reads the diff since its last verdict against the goal and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

# retro

## notes

<!-- decides every private note on the box, and works what it mints into this group -->

### drained

<!-- retro notes, which passes when the private folder is empty -->

<!-- the form is command -->

## write

<!-- writes the retro over the box's own window -->

### done

<!-- what was done, one line a ticket or a thing -->

<!-- the form is list -->

### well

<!-- what went well, and what made it go well -->

<!-- the form is list -->

### badly

<!-- what did not go well, each error of the run and each owner prompt turning it, with its time -->

<!-- the form is list -->

### improve

<!-- how each bad line stops happening, each line naming its home as a link, a ticket in backticks or a path in backticks -->

<!-- the form is list -->

### thoughts

<!-- what the thoughts say that the actions do not, off the transcript -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## cloud

<!-- names what the box lacked, met and leaves for a person -->

### lacked

<!-- a tool, a host the proxy refused, a right the platform refused, an install, each with its moment -->

<!-- the form is list -->

### met

<!-- the trunk guard, a conflict at sync, the cap, a hook, a test that fails on the box alone -->

<!-- the form is list -->

### left

<!-- every person step parked, every ticket minted with no group, and what the handover says -->

<!-- the form is list -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The order that minted this group leaves main unpushed, and `./RUNME.sh branch open` pushes a marker on main. The box cut `work/lsp-takes-the-lenses` off main by hand, as `#138` and `#140` did, and the pull request carries the group to main.

What the extension computes, and where each part lands:

| part | today | lands | why |
|---|---|---|---|
| the buttons over a ticket | `lensesOf` in `src/extension/lib/lens.js`, drawn by `editor-lens.js` | the server, as `textDocument/codeLens` | the rule reads the ticket and the holds alone |
| the press | `took` in `lens.js`, posting `ticket/pull` | the server, as `workspace/executeCommand` | the index runs the action in its own process |
| the answer's toast and log | `tells` and `says` | the server, as `window/showMessage` and `window/logMessage` | both are LSP words |
| the reason a fail asks | `asksLine` | the client middleware | LSP holds no input box |
| the save before a hand-back | `saves` | the client middleware, and the server writes the buffer for an editor that saves nothing | LSP holds no save request |
| the fill on save | `saved` in `lens.js` | the server, on `textDocument/didSave` | a notification every client sends |
| the field marks' hover | `hoverOf` in `lib/fields.js`, drawn by `editor-fields.js` | the server, in `textDocument/hover` beside the term hover | the hover is an LSP word |
| the field marks' underline | a decoration in `editor-fields.js` | the server publishes a hint diagnostic, and the middleware draws it as the same underline | LSP holds no decoration, and a hint keeps the mark in every editor |
| the cursor on a new take | `held` in `lib/fields.js` | the server, as `window/showDocument` | an LSP word since 3.16 |
| the route drawing and its flip | `route-host.js`, `editor-inset.js` | stays | a webview inset, which LSP holds no word for |
| the sidebar, the status bar and the toasts on a state | `sidebar.js`, `editor.js` | stays | editor UI |
| the biome quiet | `quiets` in `editor.js` | stays | an editor setting |
| code actions | none registered | none added | the extension computes none, so nothing moves |
| diagnostics | none computed | the server's sweep, as today | the server already publishes them |
