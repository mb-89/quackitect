---
kind: [[ticket]]
state: open
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/reviewing]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass or fail, with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: design/draft
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements"]
    steps:
      - name: tests-red
        does: writes the tests the ask calls for
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: seen
            form: text
            says: what you see, and what surprises you
      - name: reflect
        does: names the class of error in the findings, and the fix for the class
        when: returned
        input: verdict
        evidence:
          - name: class
            form: text
            says: the class of error the findings describe, and the fix for the class
      - name: change
        does: makes the change
        reads: [[spec/guidance/code/code]]
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: tests-red
        evidence:
          - name: tests
            form: command
            expects: green
            says: the same tests pass
          - name: check
            form: command
            expects: 0
            says: the check is green on the commit
          - name: says
            form: text
            says: what changes and why, for a reader who was not there
  - name: verdict
    does: reads every hunk against the ask and the approach
    not: implement
    on_fail: implement/reflect
    reads: [[spec/guidance/review/reviewing]]
    input: ["diff", "implement"]
    to: retro
    checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: read
        form: files
        says: every file you read, one a line
      - name: verdict
        form: verdict
        says: pass or fail, findings one a line
group: the-rules-hold-themselves
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: design/draft
record:
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: f3207481318c868ec4e9cd220a99279670c51544
    hash_after: f3207481318c868ec4e9cd220a99279670c51544
  - step: design/review
    hand: box 5387e4f82b24 · claude-code-remote · helper-2
    hash_before: ec36534a027da40fa81b8f4c0ad64c97f1d49a6b
    hash_after: ec36534a027da40fa81b8f4c0ad64c97f1d49a6b
    returns: 1
    why: The approach puts the pass list in `DoorsOnly.yml`. A rule there reads the; raw text of a file alone, so a list of roots in the rule file stands unread.; `.vale.ini` owns that fact already, in the sections standing the rule off; `src/doors` and the editor files. Put the roots there.; The approach gives `src/lsp` a door file and names no section standing the; Go reading off it. Name it, beside the sections `.vale.ini` already holds.; The approach hands the reads outside the two the ask names to the implement; step. The ask asks for a clean `./RUNME.sh lint src`, so say which of them; move behind a door and which take the value off the hand. A read of; `process.platform` that builds a path is the case the criterion leaves open.; The rest holds. `DoorsOnly.yml` stands, and `.vale.ini` runs it over `.go`; beside `.js`. The hand `src/scripts/cli-doors.js` builds carries `env`, so; the two reads the ask names take `it.env` and `box.env` as written.
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: e0e917c2bfbf38d110d363a6555b197e0cecb84a
    hash_after: e0e917c2bfbf38d110d363a6555b197e0cecb84a
  - step: design/review
    hand: box 5387e4f82b24 · claude-code-remote · helper-4
    hash_before: f5090a0e166b1a0fc90025362269192edd6a80de
    hash_after: f5090a0e166b1a0fc90025362269192edd6a80de
    returns: 2
    why: The Go section names `src/lsp/doors.go`, and that file stands nowhere.; `src/viewer` and `src/index` each call theirs `door.go`. Take that name.; The Go reading reaches `src/viewer`, `src/index` and `src/swap` too. The; approach names a section for none of the three. Each package imports `os` in; several files at once. So one door file a package leaves the rule refusing; every other file of it. Say which file of each package names the outside, and; how the rest of the package reaches it.; `src/extension/extension.js` reads the platform. `.vale.ini` stands off; `editor*.js` alone, and the extension reaches no door under `src/doors`. Put; it in the pass list, beside the editor files.; `src/scripts/editor.js` reads the environment on its entry line, and; `cli*.js` misses it. Put it in one of the two tables.; The three findings of the round before stand answered. The pass list moves to; `.vale.ini`, the Go section carries a name, and the module table says what; each read takes. `process.platform` riding down from a root holds.; `src/extension/node_modules` stays out of reach, because the index skips it.
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 818cfead149a26113864a5ab5364bf3869f6718a
    hash_after: 818cfead149a26113864a5ab5364bf3869f6718a
  - step: design/review
    hand: box 5387e4f82b24 · claude-code-remote · helper-6
    hash_before: 20cfcd837167a7ac5f8e681655f60bddb2c27a26
    hash_after: 20cfcd837167a7ac5f8e681655f60bddb2c27a26
    returns: 3
    why: "`src/index/main.go` imports `os/exec` to spawn the resident, and; `src/index/door.go` imports none. The table says nothing moves for; `src/index`, and the pass list stands `door.go` off alone, so the rule; refuses `main.go`. Say whether the spawn moves into `door.go` or `main.go`; joins the pass list.; The first table draws the Go rule over an import of `os` or `os/exec`, and; the closing paragraph holds it to `os/exec`. The hand implementing reads two; rules. Write the scope once.; `src/scripts/trust.js` and `src/scripts/copilot.js` read `process.argv` on; their entry lines, the way `precommit.js` and `prepush.js` do. The module; table hands each `it.env` alone, so the rule refuses those lines. Put each in; one of the two tables.; `src/scripts/copilot.js` and `src/scripts/vehicle.js` read; `process.platform`, and the platform sentence names `cli-read.js` alone.; `cli-check.js` builds `windows` onto the hand, so say whether the two take; that off the hand or stand off as roots.; `.vale.ini` stands the stub's bridgehead off already, and `**/src/stub/**`; opens a second section over the same file. Grow the section standing, and; open no second.; The findings of the round before stand answered. The Go section takes; `door.go`, `src/viewer` and `src/swap` import no `os/exec`, and; `src/extension/*.js` and `src/scripts/editor.js` reach the pass list. The; file calls ride `a-door-holds-the-go-file-calls`, which stands in the tree."
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: 122656e2eac3e79371dc42494e4ebdedb902ce07
    hash_after: 122656e2eac3e79371dc42494e4ebdedb902ce07
  - step: design/review
    hand: box 5387e4f82b24 · claude-code-remote · helper-8
    hash_before: 1a72525f2a423fd2eac0a7bce64a80d7346b3ed7
    hash_after: 1a72525f2a423fd2eac0a7bce64a80d7346b3ed7
    returns: 4
    why: "`src/scripts/vehicle.js` carries no `it`: `registerDirs` and `readRegister`; open on `(files, env)`, and `cli.js`, `cli-doors.js` and; `src/bridge/vehicle.js` call them that way. The `windows` `cli-check.js`; builds rides the viewer's hand alone, and vehicle sees none of it. Say which; caller carries the platform in, or stand the file off as a root.; The pass list opens `**/src/extension/*.js`, and `.vale.ini` stands; `**/src/extension/editor*.js` off already, so two sections cover the editor; files. Grow the section standing, the way the stub's row reads now.; The rule draws on `process.env`, `process.argv` and `process.platform`, and; `src/scripts/vehicle.js` reads `process.pid` outside a door. Name what the; scope leaves to a later ticket, beside the three reads it takes.; The findings of the round before stand answered. The spawn in; `src/index/main.go` moves into `src/index/door.go`. The Go scope reads; `os/exec` in the table and the paragraph alike. `trust.js` and `copilot.js`; reach the pass list, and the stub's bridgehead keeps its one section."
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: feea15d7cece4654886fa5fd6d5ee41d40af4e1b
    hash_after: feea15d7cece4654886fa5fd6d5ee41d40af4e1b
  - step: design/review
    hand: box 5387e4f82b24 · claude-code-remote · helper-10
    hash_before: f125f932c65b5d0ee3d991432e55358de934e553
    hash_after: f125f932c65b5d0ee3d991432e55358de934e553
    returns: 5
    why: The tests read the environment, and the pass list names none of them.; `test/contract/*.js` reads `process.env` and `process.platform`, and; `test/level0/*.js` sets `process.env` around a case. The `check` verb runs; `lint` over the whole tree, so the rule turns the check red. Say which of the; two folders stands off, and which takes the value off a hand.; A section stands a file off `DoorsOnly` whole, and that rule refuses a `node:`; import outside the doors today. So every root the pass list gains gives that; refusal up beside the environment read. Say whether a rule file of its own; carries the reading, or the roots give the import guard up.; The Go table names `src/lsp`, `src/index`, `src/viewer` and `src/swap`, and; `src/yaml` stands outside it. Name that package beside the four, with what; moves for it.; `src/scripts/cli-check.js` reads `process.version`, and; `src/scripts/cli-doors.js` reads `process.execPath`. The pass list covers both; files, so name the two reads beside `process.pid`, where the scope hands a; read to the later ticket.; The findings of the round before stand answered. `src/scripts/vehicle.js`; takes a `windows` argument off its callers, the extension grows the section; standing, and `process.pid` rides a private note to the retro.
  - step: design/draft
    hand: box 5387e4f82b24 · claude-code-remote
    hash_before: ccfad8d001cd53c38c97829d2d2ff223592e15e9
    hash_after: ccfad8d001cd53c38c97829d2d2ff223592e15e9
  - step: design/review
    hand: box 5387e4f82b24 · claude-code-remote · helper-12
    hash_before: b019a68360313d52fe5a179df5944e307a411490
    hash_after: 9ce24c777acc53fc86f136ddb7f8eda7dd555dd2
    returns: 6
    why: The new rule joins `VoiceVale`, and the section over `*.md` names it nowhere.; `DoorsOnly` stands off there because a note writes `process.env` in its prose,; and a ticket in the tree does today. `[formats]` reads a `.yml` as markdown; too, so the rule file meets its own tokens. Name the line the markdown; section takes.; The sections standing `DoorsOnly` off today name the new rule nowhere:; `src/doors/*.js`, their fakes, the hooks module and the stub's bridgehead.; `src/doors/proc.js` reads `process.env`, so `./RUNME.sh lint src` comes back; red on a door. Say that each section takes a line for the new rule beside the; one it holds.; Growing the section over `editor*.js` to `*.js` gives the `node:` import guard; up for `src/extension/extension.js` and `src/extension/sidebar.js`. The; approach opens a rule file of its own so a pass keeps that guard. Open the; wider glob under the new rule alone, and leave `DoorsOnly` where it stands.; `src/bridge/review.js` reads `process.execPath` as well, and the table naming; the reads a later ticket carries stands `src/scripts/cli-doors.js` alone.; Name the second file beside it.; The findings of the round before stand answered. The test folders reach the; pass list, and the reading takes a rule file of its own. `src/yaml` stands in; the Go table, and the later ticket carries `process.version` and; `process.execPath` beside `process.pid`.
---

# Ask

Every reach outside runs through a door, so a test drives the code with a fake.

Code reads the environment and runs commands in place, and a test of it touches the real box.

- The door rule refuses a read of the environment outside `src/doors`.
- A rule holds Go to a door package for `os/exec` and file calls.
- The reads in `src/scripts/pull-hand.js` and `src/bridge/stop.js` move behind a door.
- `./RUNME.sh lint src` names no such read.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

One rule file grows the reading, and the lint config says where it stands off:

| what stands | where |
|---|---|
| the environment read, and the Go import of `os/exec` | `spec/config/styles/VoiceVale/OutsideInDoors.yml`, a rule of its own |
| the places standing off | `.vale.ini`, in a section for each, the way the fakes stand off today |

The reading takes a rule file of its own, because a section standing a file off
`DoorsOnly` gives up its import guard as well. A root reads the environment and
imports no door, so the two rules want two switches.

A rule under `spec/config/styles` reads one buffer and no path, so the pass list
belongs where every other path rule stands. Vale skips its own styles folder, so
the rule file meets none of its own tokens.

The readings:

- the rule draws on `process.env`, `process.argv` and `process.platform` outside `src/doors`
- a root builds the hand every other module takes, so it reads the environment once
- the Go rule reads an import line, so one file of a package names the outside

Every section standing `DoorsOnly` off names the new rule as well. A door reads
the environment, a fake stands in for a door, and a hooks module runs where no
door reaches:

| the section standing today | why the new rule stands off there too |
|---|---|
| `**/src/doors/*.js` | `src/doors/proc.js` hands a child the environment it holds |
| `**/src/doors/fake/*.js` | a fake stands in for a door, and takes the same road |
| `**/.claude/skills/level0/hooks/*.js` | the hooks module reads the environment on its entry line |
| `**/src/stub/.claude/skills/level0/hooks/*.js` | the stub copies that module out of the template |
| `[*.{md,markdown,txt}]` | a note names the read in prose, and two tickets do today |

The sections `.vale.ini` gains, each naming the new rule alone:

| the section | why it stands off |
|---|---|
| `**/test/contract/*.js`, `**/test/level0/*.js` | a case reads the environment to drive a door, and sets one around itself |
| `**/src/scripts/cli*.js` | the command roots build the `it` every verb takes |
| `**/src/scripts/precommit.js`, `**/src/scripts/prepush.js` | each is a hook a person's git runs, and it builds its own |
| `**/src/scripts/trust.js`, `**/src/scripts/copilot.js` | each opens on its own line of arguments, the way a hook does |
| `**/src/scripts/editor.js` | the editor's own root, which reads the environment on its entry line |
| `**/src/bridge/server.js` | the server root builds the box each door reads |
| `**/src/extension/*.js` | the extension loads as CommonJS, so its own files are its door layer |
| `**/src/*/door.go` | each Go package names the outside in that one file |

The extension takes a section of its own, because the section standing
`editor*.js` off gives up the `node:` import guard where it grows. The new
section names the new rule alone, so that guard holds over
`src/extension/extension.js` and `src/extension/sidebar.js`.

Every other module takes the value off the hand. The implement step moves them,
and the two the ask names open the list:

| the module | what it takes |
|---|---|
| `src/scripts/pull-hand.js` | `it.env`, and the read of the process goes |
| `src/bridge/stop.js` | `box.env`, and the break mark rides the box beside it |
| `work.js` | `it.env`, off the hand the root builds |
| `vehicle.js` | `windows`, beside the `env` its callers hand it today |
| `src/bridge/bash.js`, `src/bridge/guidance.js` | `box.env`, off the box the server builds |

`process.platform` reads the same way. `cli-check.js` builds `windows` onto the
hand already, so a module past a root takes it there. The stub's bridgehead
stands off in `.vale.ini` today, so no section opens over it twice.

| what reads the platform | what it takes |
|---|---|
| `src/scripts/cli-read.js`, `src/scripts/copilot.js` | each stands off as a root |
| `src/scripts/vehicle.js` | a `windows` argument, because it takes `(files, env)` and no hand |

So `./RUNME.sh lint src` answers clean, and the rule names every read a later
hand writes.

The rule reads the three the ask names, and three more reads stand outside it:

| the read | where it stands | what a grown rule meets |
|---|---|---|
| `process.pid` | `src/scripts/vehicle.js` | a module past a root |
| `process.execPath` | `src/bridge/review.js` | a module past a root |
| `process.version`, `process.execPath` | `src/scripts/cli*.js` | a root the list passes already |

A private note carries the reads, and the retro decides whether the rule grows
to meet them. The doors and the editor files read the exec path too, and the
sections above pass all three.

The Go rule reads an import of `os/exec`, which runs a command. Each package
names that import in its `door.go`, and `src/index` holds one today.

| the package | what moves |
|---|---|
| `src/lsp` | the command running of four files, into a `door.go` of its own |
| `src/index` | the spawn of the resident in `main.go`, into the `door.go` standing there |
| `src/viewer`, `src/swap`, `src/yaml` | nothing, because none of the three runs a command |

The `os` import, which reads a file, stands in a file of nearly every Go
package. `./RUNME.sh lint src` answers how many, and a rule over it asks for a
door in each. So this ticket holds the rule to `os/exec`, and
`a-door-holds-file-calls` carries the rest.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

- The new rule joins `VoiceVale`, and the section over `*.md` names it nowhere.
  `DoorsOnly` stands off there because a note writes `process.env` in its prose,
  and a ticket in the tree does today. `[formats]` reads a `.yml` as markdown
  too, so the rule file meets its own tokens. Name the line the markdown
  section takes.
- The sections standing `DoorsOnly` off today name the new rule nowhere:
  `src/doors/*.js`, their fakes, the hooks module and the stub's bridgehead.
  `src/doors/proc.js` reads `process.env`, so `./RUNME.sh lint src` comes back
  red on a door. Say that each section takes a line for the new rule beside the
  one it holds.
- Growing the section over `editor*.js` to `*.js` gives the `node:` import guard
  up for `src/extension/extension.js` and `src/extension/sidebar.js`. The
  approach opens a rule file of its own so a pass keeps that guard. Open the
  wider glob under the new rule alone, and leave `DoorsOnly` where it stands.
- `src/bridge/review.js` reads `process.execPath` as well, and the table naming
  the reads a later ticket carries stands `src/scripts/cli-doors.js` alone.
  Name the second file beside it.
- The findings of the round before stand answered. The test folders reach the
  pass list, and the reading takes a rule file of its own. `src/yaml` stands in
  the Go table, and the later ticket carries `process.version` and
  `process.execPath` beside `process.pid`.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
