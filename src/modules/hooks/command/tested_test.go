// The tested delta over a staged delta, off the bridge's lib/tested.js.
// [[spec/tickets/cage-commit-guards-port]]
package command

import (
	"reflect"
	"slices"
	"testing"
)

// A tree holding the files a case names, and a hold. [[spec/tickets/cage-commit-guards-port]]
func (one seeded) text(path string) string { return one[path] }

func TestUntestedInReadsTheBridgesDelta(t *testing.T) {
	code := deltaOf("src/engine/thing.js", "export const THING = 1;")
	for _, one := range []struct {
		name    string
		delta   string
		read    seeded
		merging bool
		carried []string
		want    []string
	}{
		{"code with no test", code, seeded{}, false, nil, []string{"src/engine/thing.js"}},
		{"Go code with no test", deltaOf("src/modules/thing/thing.go", "package thing"), seeded{}, false, nil, []string{"src/modules/thing/thing.go"}},
		{"a Go test alone", deltaOf("src/modules/thing/thing_test.go", "package thing"), seeded{}, false, nil, nil},
		{"Go code beside its package's test", deltaOf("src/modules/thing/thing.go", "package thing") + "\n" + deltaOf("src/modules/thing/a_test.go", "package thing"), seeded{}, false, nil, nil},
		{"comments alone", deltaOf("src/engine/thing.js", "// a line saying why"), seeded{}, false, nil, nil},
		{"a test named alike", code + "\n" + deltaOf("test/engine/thing.test.js", "// the test"), seeded{}, false, nil, nil},
		{"a test importing it on disk", code + "\n" + deltaOf("test/engine/other.test.js", "// the test"), seeded{"test/engine/other.test.js": `import { THING } from "../../src/engine/thing.js";`}, false, nil, nil},
		{"a merge", code, seeded{}, true, nil, nil},
		{"a test a held ticket carries", code, seeded{"test/engine/thing-cases.test.js": ""}, false, []string{"test/engine/thing-cases.test.js"}, nil},
	} {
		t.Run(one.name, func(t *testing.T) {
			if got := UntestedIn(one.delta, one.read.text, one.merging, one.carried); !reflect.DeepEqual(got, one.want) {
				t.Fatalf("UntestedIn reads %q, want %q", got, one.want)
			}
		})
	}
}

func TestAMoveOfAWholeBlockChangesNoCode(t *testing.T) {
	moved := "diff --git a/src/a.js b/src/a.js\n@@ -1,3 +0,0 @@\n-function a() {\n-  return 1;\n-}\n@@ -0,0 +9,3 @@\n+function a() {\n+  return 1;\n+}"
	if got := UntestedIn(moved, nil, false, nil); got != nil {
		t.Fatalf("a moved block reads as untested %q", got)
	}
}

func TestHeldTestsReadTheHeldTicketsCommandLines(t *testing.T) {
	tree := seeded{
		".se/.runtime/hold/one.json": `{"ticket":"a-ticket","path":"spec/tickets/a-ticket.md"}`,
		".se/.runtime/hold/two.json": `{"ticket":"shut","path":"spec/tickets/shut.md"}`,
		"spec/tickets/a-ticket.md":   "---\nstate: open\n---\n\n    node --test test/level0/a.test.js\n./RUNME.sh test src/q/q_test.go\nnot test/b.test.js\n",
		"spec/tickets/shut.md":       "---\nstate: closed\n---\n\n    node --test test/level0/c.test.js\n",
	}
	if got, want := HeldTests(tree), []string{"test/level0/a.test.js", "src/q/q_test.go"}; !reflect.DeepEqual(got, want) {
		t.Fatalf("HeldTests reads %q, want %q", got, want)
	}
}

// Several hands hold on one box, so a test two held tickets carry comes back once, off the case test/level0/held-tests.test.js held. [[spec/design_output/tree#the-rules-over-two-files]]
func TestHeldTestsComeBackOnceAndAHoldWithNoTicketAddsNone(t *testing.T) {
	ticket := func(line string) string { return "# Ask\n\nA thing.\n\n### tests\n\n    " + line + "\n" }
	tree := seeded{
		".se/.runtime/hold/a-hand.json": `{"ticket":"one","path":"spec/tickets/one.md"}`,
		".se/.runtime/hold/b-hand.json": `{"ticket":"two","path":"spec/tickets/two.md"}`,
		".se/.runtime/hold/c-hand.json": `{"ticket":"gone","path":"spec/tickets/gone.md"}`,
		"spec/tickets/one.md":           ticket("./RUNME.sh branch test test/level0/one.test.js"),
		"spec/tickets/two.md":           ticket("./RUNME.sh branch test test/level0/one.test.js src/q/q_test.go"),
	}
	got := HeldTests(tree)
	slices.Sort(got)
	if want := []string{"src/q/q_test.go", "test/level0/one.test.js"}; !reflect.DeepEqual(got, want) {
		t.Fatalf("HeldTests reads %q, and wants each test once and nothing off a hold whose ticket stands nowhere", got)
	}
	if got := HeldTests(seeded{}); len(got) != 0 {
		t.Fatalf("HeldTests over no hold reads %q, and wants nothing", got)
	}
}
