// The tested delta over a staged delta, off the bridge's lib/tested.js.
// [[spec/tickets/cage-commit-guards-port]]
package command

import (
	"reflect"
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

func TestALayoutChangeAloneChangesNoCode(t *testing.T) {
	aligned := "diff --git a/src/a.go b/src/a.go\n@@ -1,2 +1,2 @@\n-\tRoot     string\n-\tVale  string\n+\tRoot string\n+\tVale string"
	if got := UntestedIn(aligned, nil, false, nil); got != nil {
		t.Fatalf("a change of spacing alone reads as untested %q", got)
	}
	spaced := "diff --git a/src/a.go b/src/a.go\n@@ -1 +1 @@\n-\tx := a+b\n+\tx := a + c"
	if got := UntestedIn(spaced, nil, false, nil); len(got) != 1 {
		t.Fatalf("a change past spacing reads as tested")
	}
	reordered := "diff --git a/src/a.go b/src/a.go\n@@ -2 +1,0 @@\n-\treturn x\n@@ -3,0 +3 @@\n+\treturn x"
	if got := UntestedIn(reordered, nil, false, nil); len(got) != 1 {
		t.Fatalf("a line moved between hunks reads as layout")
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
