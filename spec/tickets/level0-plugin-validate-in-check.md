---
kind: [[ticket]]
state: closed
step: implement/tests-green
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
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it", "every config key the approach adds names each default file it lands in"]
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
process_hash: c671f20a6ae2a4a6
group: level-zero-becomes-a-typed-mod
depends_on: ["level0-hooks-move-to-typescript"]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box eabbd46a6a23 · claude-code-remote
    hash_before: b5cf549abb3ce3a03db77ffd536574cf7c63a31e
    hash_after: b5cf549abb3ce3a03db77ffd536574cf7c63a31e
    inputs:
      - name: ask
        hash: b1fcb495716c6933
        size: 915
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box eabbd46a6a23 · claude-code-remote
    hash_before: 44102444e963f14a35b1a844dfcf1245c2d72291
    hash_after: 44102444e963f14a35b1a844dfcf1245c2d72291
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 745a1714cb407b2b
        size: 1713
    def: 08e16d07b0de477c
  - step: gate
    hand: box eabbd46a6a23 · claude-code-remote · helper-4
    hash_before: 29ff39f7314a166659b5972a2fc2b54c2c2048c6
    hash_after: 29ff39f7314a166659b5972a2fc2b54c2c2048c6
    inputs:
      - name: design/draft
        hash: 745a1714cb407b2b
        size: 1713
      - name: design/tests-red
        hash: b8b7bace0d37b348
        size: 636
    def: dc4904ab364efa10
  - step: implement/change
    hand: box eabbd46a6a23 · claude-code-remote
    hash_before: c1e9c2ebcebbaefe7db3e8ebf076169e62daf257
    hash_after: e3adb5dc3142ac0f655bb24cb5eedb6b196a00e7
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/the-dead-bridge-tests-leave.md:47:1: ListItem: A sentence in a list item holds 20 words, and this one holds"
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box eabbd46a6a23 · claude-code-remote
    hash_before: 8543dea7171ef73d42146fc2aa0d23b8828123e9
    hash_after: 8543dea7171ef73d42146fc2aa0d23b8828123e9
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   93.1  in all"
    inputs:
      - name: design/tests-red
        hash: b8b7bace0d37b348
        size: 636
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

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

gain: `claude plugin validate .claude/skills/level0` runs inside the check, so the manifest, `hooks/hooks.json` and the hooks module's load stand proved by the tool Claude Code ships. The smoke test then drops every probe validate already proves, and keeps only what a live session alone shows.

breaks: A broken manifest or hooks file reaches a session before anything flags it, and the smoke test keeps paying for proofs the standard tool gives for free.

done_when:
- `./RUNME.sh check` runs `claude plugin validate --strict .claude/skills/level0` and fails where it fails; the `plugin` part in `src/quack/check.go` already runs validate without `--strict`
- a Go test feeds `pluginHolds` a refusing validate and reads the part fail
- the smoke test holds no probe that validate proves; the level-zero-smoke group, on another box, meets the cut through `main`
- `./RUNME.sh check` exits 0

view: none

from: none

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

The plugin part of the check, pluginHolds in src/quack/check.go, runs claude plugin validate with --strict, so a warning the runtime tolerates fails the check too. The standing case of check_test.go already feeds the part a refusing validate and reads it fail, so it now expects --strict in the argv. The design note line in level0.md that tells a person to run validate says the check runs it with --strict. The smoke cut takes nothing: validate reads the manifest, hooks.json, the module parse, the hooks it names and the nouns its source touches, statically. Each of the seven smoke checks reads runtime behavior through the Go door: door, rules, prompt, tools, guard, canary and quiet. So no smoke check repeats a proof validate gives, and the table under Discussion says so check by check.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/check.go partsOf, which names the plugin part
- src/quack/check_test.go the plugin part case, which drives pluginHolds

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/check_test.go the plugin part validates the plugin strictly, and passes where claude stands nowhere

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/quack/check.go
- src/quack/check_test.go
- spec/design_output/level0.md
- spec/tickets/level0-plugin-validate-in-check.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

I opened check.go pluginHolds and partsOf, check_test.go, probe-dry.js DRY and SMOKE and smokeTree, and the note lines on validate, and each claim stands there
the callers list names partsOf and the plugin part case, the only callers of pluginHolds
the strict line meets the plugin part case, the refusing validate line meets the same case, the smoke line meets the table the gate reads, and the check line meets the check
the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/quack/check_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/check_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The plugin part case fails on its argv: the part runs validate without --strict. On this box validate --strict already passes over the plugin, so the switch costs nothing today. No smoke check repeats a proof validate gives, and the table under Discussion says so check by check.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the strict line and the refusing validate line meet the plugin part case, the smoke line meets the table under Discussion, which the gate answers, and the check line meets the check
the plugin part case reaches claude through the check fake

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches src/quack/check.go and spec/design_output/level0.md, which the draft names in its size list
the part reaches claude through checkDoors run, and the part test fakes that door with a refusing validate
the comment over pluginHolds says it validates strictly and points at this ticket
the strict run stands in pluginHolds alone, and the note names the plugin part

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test src/quack/check_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The plugin part of the check in src/quack/check.go runs claude plugin validate with --strict, so a warning on the manifest or the hooks file fails the check as an error does. The part test feeds the part a refusing validate, reads it fail, and reads --strict in the argv. The level0 note names the plugin part where it asked a person to run validate by hand. The smoke holds runtime checks alone, so it loses nothing. Commit e3adb5dc3.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches src/quack/check.go and spec/design_output/level0.md, which the draft names
the part reaches claude through the check doors, and the part test fakes that door
the comment over the part says it validates strictly and points at this ticket
the strict run stands in the part alone, and the note names the part

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

What `claude plugin validate --strict` reads stands apart from what each smoke check reads, so the smoke drops none:

| smoke check | what it reads | validate reads it |
|---|---|---|
| door | the standing file the Go door writes at start | no, the door is Go at runtime |
| rules | the context row carrying the named blocks | no, the rules come off the Go door |
| prompt | an owner prompt rewritten with the answer-first line | no, the door rewrites it at runtime |
| tools | the tools the hook registers off the door | no, validate names the noun and registers nothing |
| guard | a read passing and a guarded call refused | no, the refusal comes off the door |
| canary | the door hearing the canary off the answer text | no, the stream reaches the door at runtime |
| quiet | every post reaching the hooks door | no, validate posts nothing |

Validate reads the manifest, `hooks/hooks.json`, the module parse, the hooks it names, the nouns its source touches and the env it reads.
