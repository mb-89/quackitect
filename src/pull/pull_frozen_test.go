// A red leaf's pass freezes its red files: a later pass at a green leaf or a
// final gate meets a moved one refused, and a reopen with its why lets it
// through and shows at the gate. [[spec/design_output/pull#red-tests-freeze]]
package pull // level0: InPackageTest - reaches the in-package helpers cloudPull, landedOn and pulled

import (
	"strings"
	"testing"

	"quackitect/src/proc"
)

// The red file, what it says at the red pass, and the why a reopen carries. [[spec/design_output/pull#red-tests-freeze]]
const (
	frozenFile = "test/a_test.go"
	frozenText = "package a\n"
	movedText  = "package a\n\n// bent to the code\n"
	reopenWhy  = "the case names the wrong door"
)

// A child of g standing at its red leaf, with a green leaf and a final gate after it. [[spec/design_output/pull#red-tests-freeze]]
const frozenTicket = `---
kind: [[ticket]]
state: open
steps:
  - name: design
    steps:
      - name: tests-red
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests fail
          - name: red
            form: list
            says: the red files
  - name: implement
    steps:
      - name: tests-green
        input: design/tests-red
        evidence:
          - name: tests
            form: command
            expects: green
            says: the tests pass
  - name: accept
    gate: does the work answer the ask
    final: true
    evidence:
      - name: verdict
        form: verdict
        says: accept, or reject
process: [[spec/processes/small]]
group: g
step: design/tests-red
---

# Ask

Some change the owner asks for.

# design

## tests-red

### tests

### red

# implement

## tests-green

### tests

# accept

## verdict

# Discussion
`

// A box past the red pass of alpha, which froze the red file. [[spec/design_output/pull#red-tests-freeze]]
func frozenBox(t *testing.T) *It {
	t.Helper()
	it, _, _ := cloudPull(t)
	landedOn(t, it, map[string]string{"spec/tickets/alpha.md": frozenTicket, frozenFile: frozenText})
	pulled(t, it)
	if code, said := pulled(t, it, "alpha", "--pass", "--fields", `{"tests":"echo assertion","red":"- `+frozenFile+`"}`); code != 0 {
		t.Fatalf("the red pass answers %d:\n%s", code, said)
	}
	return it
}

// The ticket's step after a pull at the green leaf hands back with the words. [[spec/design_output/pull#red-tests-freeze]]
func greenPass(t *testing.T, it *It, words ...string) (int, string) {
	t.Helper()
	pulled(t, it)
	return pulled(t, it, append([]string{"alpha", "--pass", "--fields", `{"tests":"echo green"}`}, words...)...)
}

func stepOfAlpha(it *It) string {
	text, _ := it.Disk.Read("spec/tickets/alpha.md")
	return FieldOf(text, "step")
}

func TestARedPassFreezesItsRedFiles(t *testing.T) {
	t.Parallel()
	it := frozenBox(t)
	text, _ := it.Disk.Read("spec/tickets/alpha.md")
	if !strings.Contains(text, "frozen:") || !strings.Contains(text, HashText(frozenText)) {
		t.Fatalf("the red pass freezes no hash of %s:\n%s", frozenFile, text)
	}
}

func TestAMovedRedFileRefusesTheGreenPass(t *testing.T) {
	t.Parallel()
	it := frozenBox(t)
	landedOn(t, it, map[string]string{frozenFile: movedText})
	code, said := greenPass(t, it)
	if code == 0 || !strings.Contains(said, frozenFile) || !strings.Contains(said, "--reopen") {
		t.Fatalf("the green pass over a moved red file answers %d:\n%s", code, said)
	}
	if step := stepOfAlpha(it); step != "implement/tests-green" {
		t.Fatalf("alpha moves on to %s", step)
	}
}

func TestAReopenLetsTheGreenPassThrough(t *testing.T) {
	t.Parallel()
	it := frozenBox(t)
	landedOn(t, it, map[string]string{frozenFile: movedText})
	if code, said := greenPass(t, it, "--reopen", frozenFile+": "+reopenWhy); code != 0 || stepOfAlpha(it) != "accept" {
		t.Fatalf("the reopened green pass answers %d at %s:\n%s", code, stepOfAlpha(it), said)
	}
	text, _ := it.Disk.Read("spec/tickets/alpha.md")
	if !strings.Contains(text, "reopen:") || !strings.Contains(text, reopenWhy) {
		t.Fatalf("the record keeps no reopen:\n%s", text)
	}
}

func TestTheFinalAcceptRefusesAMovedRedFile(t *testing.T) {
	t.Parallel()
	it := frozenBox(t)
	it.Shell = ShellOver((&proc.FakeRunner{Programs: map[string]proc.Program{"sh": func(proc.Command) proc.Said { return proc.Said{Out: "green\n"} }}}).Run, workRoot)
	if code, said := greenPass(t, it); code != 0 {
		t.Fatalf("the green pass answers %d:\n%s", code, said)
	}
	landedOn(t, it, map[string]string{frozenFile: movedText})
	pulled(t, it)
	code, said := pulled(t, it, "alpha", "--fields", `{"verdict":"accept"}`)
	if code == 0 || !strings.Contains(said, frozenFile) || !strings.Contains(said, "--reopen") {
		t.Fatalf("the accept over a moved red file answers %d:\n%s", code, said)
	}
}

func TestAGateShowsTheReopenedRedFiles(t *testing.T) {
	t.Parallel()
	it := frozenBox(t)
	landedOn(t, it, map[string]string{frozenFile: movedText})
	if _, said := greenPass(t, it, "--reopen", frozenFile+": "+reopenWhy); !strings.Contains(said, "alpha at accept") || !strings.Contains(said, frozenFile) || !strings.Contains(said, reopenWhy) {
		t.Fatalf("the accept's hand-out shows no reopened file:\n%s", said)
	}
}
