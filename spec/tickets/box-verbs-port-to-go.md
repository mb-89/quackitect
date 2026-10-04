---
kind: [[ticket]]
state: closed
steps:
  - name: design
    steps:
      - name: owner-read
        does: reads the ask a handover carries, before any draft
        by: person
        when: handed
        input: ask
        evidence:
          - name: read
            form: verdict
            says: pass where the ask says what the owner said, or fail with the owner's words
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it"]
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
          - name: callers
            form: list
            says: every caller of what the approach changes, one a line, as a file and a function
          - name: tests
            form: list
            says: every test the change adds, one a line, as a file and a test name
          - name: answers
            form: list
            says: every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft
          - name: size
            form: list
            says: every file the approach touches, one a line
      - name: tests-red
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: draft
        checklist: ["every done_when line meets a test that fails, or a checkpoint the hand answers where no command decides", "every door the tests reach has a fake"]
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: red
            form: list
            says: every test file standing red until tests-green closes, one a line, which the check leaves out
          - name: seen
            form: text
            says: what you see, and what surprises you
  - name: gate
    gate: does the approach answer the ask, and does a red test decide every done_when line
    does: reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points
    not: design/draft
    tags: ["review"]
    input: ["design/draft", "design/tests-red"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: implement
    tags: ["code", "testing"]
    needs: ["branch test"]
    input: ["design/draft", "gate"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    steps:
      - name: change
        does: makes the change
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: design/tests-red
        to: retro
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
  - name: accept
    gate: does the whole work answer the ask, and does every command of the route pass
    final: true
    when: backlog
    does: reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points
    not: implement/change
    tags: ["review", "accept"]
    input: ["ask", "implement"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: view
    does: reads the change in the view the ask names
    by: person
    when: view
    on_fail: implement
    to: retro
    input: ["ask", "implement/tests-green"]
    evidence:
      - name: seen
        form: verdict
        says: pass where the view shows the ask's number, or fail with what it shows
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: box-verbs-run-in-go
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 8ca46dccf16b · claude-code-remote
    hash_before: cae20575d6585b896bf000088a67341ee3f57cd4
    hash_after: cae20575d6585b896bf000088a67341ee3f57cd4
    inputs:
      - name: ask
        hash: 327480c1ffa3cd47
        size: 736
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 8ca46dccf16b · claude-code-remote
    hash_before: 91b88675d883881819b84a12b9ddda9ed00d133b
    hash_after: 91b88675d883881819b84a12b9ddda9ed00d133b
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 9c1d77d5afb7ce6a
        size: 5115
    def: 08e16d07b0de477c
  - step: gate
    hand: box 8ca46dccf16b · claude-code-remote · helper-4
    hash_before: e51372b88c22e7ce9adce33406af1dc8e8898c44
    hash_after: e51372b88c22e7ce9adce33406af1dc8e8898c44
    inputs:
      - name: design/draft
        hash: 9c1d77d5afb7ce6a
        size: 5115
      - name: design/tests-red
        hash: 423535c10e4ff510
        size: 759
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 660db8e33adc · claude-code-remote
    hash_before: 2636ea1a96893f246c0bf39c81c1721f99355b3f
    hash_after: 8a0fc2adec83d30f3eb8076e8203bb3f0426bfca
    answered:
      - name: lint
        exit: 0
        said: "   70.0  in all"
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 660db8e33adc · claude-code-remote
    hash_before: 32ca54b1708502333dcb791a3be32ed45e4f7a4d
    hash_after: 32ca54b1708502333dcb791a3be32ed45e4f7a4d
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   70.1  in all"
    inputs:
      - name: design/tests-red
        hash: 423535c10e4ff510
        size: 759
    def: ec253787263043a7
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
  - step: view
    skipped: true
    why: the ask names no view the owner reads
reason: done
---

# Ask

The verbs setup, probe, tools and doctor run in Go, each registered in its own file under `src/quack`, and their JavaScript leaves the tree.

A fresh box sets itself up and probes itself without Node, which phase 10 leaves as the one runtime it still starts. Until it lands, these verbs start node, and `probe*.js`, `editor.js` and the setup verb stay in the tree.

- `go test ./src/quack ./src/modules/...` passes, with a case for every road the verbs' JavaScript tests cover
- `./RUNME.sh <verb>` reaches no node for each of setup, probe, tools and doctor
- `ls src/scripts/verbs` names none of setup, probe, tools and doctor
- a search of `src` names no importer of a JavaScript module this group deletes
- `./RUNME.sh check` exits 0

# design

## owner-read

<!-- reads the ask a handover carries, before any draft -->

### read

<!-- pass where the ask says what the owner said, or fail with the owner's words -->

<!-- the form is verdict -->

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

Each verb registers from an init in its own file under src/quack: setup_verb.go, probe_verb.go, tools_verb.go and doctor_verb.go. The shared pieces stand one file each beside them: survey.go ports the tool list of .claude/skills/level0/lib/tools.js and the survey writer of src/engine/tools.js; browser.go ports browserFrom of src/scripts/browser.js; editorlink.go ports link, linked, registered and homeIn of src/scripts/editor.js; brand.go ports stamps of src/scripts/brand.js over an order-keeping JSON rewrite in jsonorder.go; copilotsetup.go ports the registrations and setup of lib/copilot-setup.js; lspprobe.go ports src/scripts/lsp-probe.js; hookprobe.go ports src/scripts/cli-hooks.js. Each verb takes its doors as a struct, so a test hands fakes, and init hands the real ones. The setup calls the survey, the browser, the editor link, the copilot setup and the brand in process, and starts npm, npx and code alone, so it starts no node. The probe answers compact, cold and reply in Go, each driving the claude client. Assumption, with its cost: probe dry loads the plugin's JavaScript hook module in process, which only a JavaScript runtime does, so the Go verb hands that one subcommand to node over src/scripts/probe-dry.js run as its own entry, and probeApart, which the check runs, starts the same entry. probe dry starts node until the hook module itself leaves JavaScript; the other three subcommands and the other three verbs start none. JavaScript leaving: the four verb programs; src/scripts/probe.js, whose logRows moves into probe-cold.js; probe-reply.js; brand.js; lsp-probe.js and cli-hooks.js, once tools, doctor and their row helpers leave cli-check.js. Their tests leave with them. verb-programs.test.js loads every program that stands, and asks a register call under src/quack for every verb of the table without one, so a later port edits no line of it. install.test.js reads the setup's wants off setup_verb.go. RUNME.sh's road without an index drops the setup call, since the setup now lives in the index, and install.sh says so. probe-cold.js drops verbs/setup.js from the cold path, which src/quack/ already covers.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/scripts/install.sh, runs the index's setup verb
- RUNME.sh, the road with no index runs node verbs/setup.js
- src/quack/verbs.go verbRoad, hands registry to the road
- src/quack/twins.go nodeAccept, runs a registered verb in Go
- src/scripts/probe-dry.js probeApart, starts node verbs/probe.js dry
- src/scripts/cli-check.js level0Runs, calls probeApart
- src/scripts/probe-cold.js, probe-dry.js, probe-reply.js, import logRows from probe.js
- src/scripts/commit-verb.js, imports coldIn and probeCold from probe-cold.js
- test/contract/verb-programs.test.js, imports the four programs
- test/contract/install.test.js, imports WANTS from verbs/setup.js and reads RUNME.sh's setup line
- test/contract/doctor-browser.test.js, calls doctor in cli-check.js
- test/level0/probe-cold.test.js, reads COLD_PATH
- test/level0/probe-dry.test.js, reads probeApart's argv
- src/quack/verb_tools_test.go programTable, reads src/scripts/verbs as the verb table

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/box_verbs_test.go TestTheBoxVerbsRegister
- src/quack/box_verbs_test.go TestTheBoxVerbsLeaveTheScripts
- src/quack/tools_verb_test.go, the survey, the version read, the places a PATH names, the table
- src/quack/doctor_verb_test.go, every row the doctor prints
- src/quack/browser_test.go, every rung of the browser order
- src/quack/editorlink_test.go, the list read, the upsert, the link and the refusals
- src/quack/brand_test.go, the stamps and the tracked tree standing stamped
- src/quack/copilotsetup_test.go, the registrations equal the tracked files, the refusal of a foreign file
- src/quack/setup_verb_test.go, every item, the skip list, the survey, the shims
- src/quack/probe_verb_test.go, compact, cold, reply, dry and the usage

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/quack/setup_verb.go
- src/quack/probe_verb.go
- src/quack/tools_verb.go
- src/quack/doctor_verb.go
- src/quack/survey.go
- src/quack/browser.go
- src/quack/editorlink.go
- src/quack/brand.go
- src/quack/jsonorder.go
- src/quack/copilotsetup.go
- src/quack/lspprobe.go
- src/quack/hookprobe.go
- their tests under src/quack
- src/scripts/verbs/setup.js, probe.js, tools.js, doctor.js
- src/scripts/probe.js, probe-reply.js, brand.js, lsp-probe.js, cli-hooks.js
- src/scripts/cli-check.js
- src/scripts/probe-cold.js, probe-dry.js
- RUNME.sh, src/scripts/install.sh
- test/contract/verb-programs.test.js, install.test.js, doctor-browser.test.js, compact.test.js
- test/level0/setup, probe, probe-reply, brand, doctor-hooks, probe-cold, probe-dry tests

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file named stands opened: the four verbs, their imports, the tests that import them
- the callers list comes off a search of src, test, RUNME.sh and .github for each path and export
- each done_when line meets a test: go test for the first, TestTheBoxVerbsRegister for the second, TestTheBoxVerbsLeaveTheScripts for the third, verb-programs and the import search for the fourth, the check for the fifth

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/box_verbs_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/box_verbs_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Both cases fail on their own assertion: no box verb registers, and all four programs stand. The behaviour tests land beside each Go file in implement, since a case naming a function that stands nowhere fails the compile and takes the whole package red. The verb table test reads src/scripts/verbs, so it shrinks as programs leave.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- done_when lines 2 and 3 meet TestTheBoxVerbsRegister and TestTheBoxVerbsLeaveTheScripts, line 1 meets go test, line 4 meets verb-programs.test.js and a search, line 5 meets the check
- the behaviour tests hand each verb a doors struct of fakes: a map disk, a recording process runner, an env map

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- box-verbs-brand-caller: src/scripts/work-review.js imports stamps from brand.js (and test/level0/review.test.js reaches it), so deleting brand.js breaks the review verb and done_when 4; the callers list misses it. Implement either points work-review at the Go stamps or keeps brand.js; fix in place.
- probe-dry-leaves-node: the approach keeps ./RUNME.sh probe dry (and probeApart in the check) on node through probe-dry.js, while done_when 2 says probe reaches no node; the ask's second paragraph tolerates it, so record the exception on the ticket and carry the hook module's port as its own ticket.
- box-verbs-no-node-test: TestTheBoxVerbsRegister checks registration alone and decides no part of 'reaches no node'; implement adds a case per verb whose fake runner refuses node, dry excepted.
- setup-road-without-index: RUNME.sh's no-index road drops the setup call, so a box with no index runs no setup at all, against spec/tickets/setup-runs-without-an-index; implement says how that road sets up or names the index build as its first step.
- probe-dry-entry: once verbs/probe.js leaves, probe-dry.js needs a main guard to run as its own entry, and test/level0/probe-dry.test.js reads probeApart's argv; implement updates both.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the approach names, plus three contract tests (cli-leaves, tree, verb-programs) that read a verb as a program alone; each now reads a program or a Go registration through registered() in test/contract/commands.js, one owner, so a later port edits none of them
- every door the change reaches has a fake: fakeBoxDoors hands a temp tree, a recording runner and a refusing GET, and TestEveryBoxVerbStartsNoNode runs every box verb over it
- each Go file opens on a header naming what it is for, and each function links spec/tickets/box-verbs-port-to-go or the design section its JavaScript linked
- every value the Go copies from the JavaScript lib names the file that owns it beside it; the names the probe and the doctor both declared stand once, in probe_cold.go. brand.js stays as the review module (box-verbs-brand-caller), and editor.js, browser.js, copilot-setup.js, probe-cold.js and probe-dry.js stay, since code outside this group imports them

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/box_verbs_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

setup, probe, tools and doctor answer in Go. Each one registers from its own file under src/quack through registerBox, over a boxDoors struct a test fills with fakes. setup runs the survey, the browser order, the editor link, the copilot setup and the brand in process, and starts npm, npx and code alone. doctor prints every row the JavaScript printed, the hook probe and the language server probe among them. probe answers compact, cold and reply in Go, and hands dry alone to src/scripts/probe-dry.js, because the dry session loads the plugin hook module, which takes a JavaScript runtime (see the Discussion). Their programs, probe.js, probe-reply.js, lsp-probe.js and cli-hooks.js, and the doctor part of cli-check.js leave the tree. brand.js stays as the module the review imports, without its program entry. The contract tests reading the verb table take a verb as a program or as a Go registration, through registered() in test/contract/commands.js, so a later port edits none of them.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches no file the ask leaves out past the three contract tests that read every verb as a program, named under implement/change
- every door has a fake: fakeBoxDoors and the no-node case over every box verb
- each file header names what it is for, and each function links this ticket or its design section
- one owner for every copied value, named beside it

# accept

<!-- reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

# view

<!-- reads the change in the view the ask names -->

## seen

<!-- pass where the view shows the ask's number, or fail with what it shows -->

<!-- the form is verdict -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

`probe dry` starts node, and it stands as the one exception to the second done_when line. The dry session loads the plugin's hook module in process, and the client takes a plugin's function hooks as JavaScript. So a probe loading that module needs a JavaScript runtime while that contract holds, whatever language the verb runs in. The Go verb hands that one road to `src/scripts/probe-dry.js`, and the check starts the same program. The other roads of the probe, and setup, tools and doctor, start no node, and `TestEveryBoxVerbStartsNoNode` decides it.
