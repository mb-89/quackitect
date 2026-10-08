// The tested delta over a staged delta, which tested.go owns.
// [[spec/tickets/cage-commit-guards-port]]
package command

import (
	"reflect"
	"slices"
	"strings"
	"testing"
)

// A tree holding the files a case names, and a hold. [[spec/tickets/cage-commit-guards-port]]
func (one seeded) text(path string) string { return one[path] }

// One file's block the way `git diff --cached --unified=0` writes it, headers and all. [[spec/tickets/a-comment-hunk-is-prose]]
func staged(path string, gone bool, rows ...string) string {
	lines := []string{"diff --git a/" + path + " b/" + path}
	if gone {
		lines = append(lines, "deleted file mode 100644")
	}
	lines = append(lines, "index 1111111..2222222 100644", "--- a/"+path)
	if gone {
		lines = append(lines, "+++ /dev/null")
	} else {
		lines = append(lines, "+++ b/"+path)
	}
	if len(rows) > 0 {
		lines = append(append(lines, "@@ -3,1 +3,1 @@"), rows...)
	}
	return strings.Join(lines, "\n") + "\n"
}

const (
	pointerWas = "-// [[spec/design_output/tree]]"
	pointerNow = "+// [[spec/design_output/tree#the-rules-over-two-files]]"
)

func TestUntestedInReadsTheBridgesDelta(t *testing.T) {
	code := deltaOf("src/engine/thing.js", "export const THING = 1;")
	one, two := "src/engine/one.js", "src/engine/two.js"
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
		{"a test importing it with a query", code + "\n" + deltaOf("test/engine/other.test.js", `const { THING } = await import("../../src/engine/thing.js?case");`), seeded{}, false, nil, nil},
		{"a merge", code, seeded{}, true, nil, nil},
		{"a test a held ticket carries", code, seeded{"test/engine/thing-cases.test.js": ""}, false, []string{"test/engine/thing-cases.test.js"}, nil},
		{"a fake, a copy of its door", deltaOf("src/doors/fake/disk.js", "export const disk = 1;"), seeded{}, false, nil, nil},
		{"the stub's template, a copy of the plugin", deltaOf("src/stub/.claude/skills/level0/hooks/bridgehead.js", "export const head = 1;"), seeded{}, false, nil, nil},
		{"an editor file", deltaOf("src/extension/editor-process.js", "export const run = 1;"), seeded{}, false, nil, nil},
		{"the editor file's neighbour", deltaOf("src/extension/sidebar.js", "export const side = 1;"), seeded{}, false, nil, []string{"src/extension/sidebar.js"}},
		{"code taken away", "diff --git a/" + one + " b/" + one + "\n+++ b/" + one + "\n@@ -3,1 +3,0 @@\n-export const one = 1;\n", seeded{}, false, nil, []string{one}},
		{"a stray test", code + "\n" + deltaOf("test/engine/other.test.js", "// the test"), seeded{}, false, nil, []string{"src/engine/thing.js"}},
		{"an import off the test's own hunk alone", deltaOf(one, "export const one = 1;") + "\n" + deltaOf(two, "import { one } from './one.js';") + "\n" +
			deltaOf("test/engine/other.test.js", "import { two } from '../../src/engine/two.js';"), seeded{}, false, nil, []string{one}},
		{"a comment traded for a comment over two files", staged(one, false, pointerWas, pointerNow) + staged(two, false, pointerWas, pointerNow), seeded{}, false, nil, nil},
		{"code added beside a comment", staged(one, false, pointerNow, "+export const one = 1;"), seeded{}, false, nil, []string{one}},
		{"code traded for a comment", staged(one, false, "-export const one = 1;", pointerNow), seeded{}, false, nil, []string{one}},
		{"a removed line reading --x", staged(one, false, "---x;", pointerNow), seeded{}, false, nil, []string{one}},
		{"a comment fix beside a deleted module", staged(one, false, pointerWas, pointerNow) + staged(two, true, "-export const two = 2;"), seeded{}, false, nil, nil},
		{"a rename with no hunk", "diff --git a/" + one + " b/src/engine/uno.js\nsimilarity index 100%\nrename from " + one + "\nrename to src/engine/uno.js\n", seeded{}, false, nil, nil},
	} {
		t.Run(one.name, func(t *testing.T) {
			if got := UntestedIn(one.delta, one.read.text, one.merging, one.carried); !reflect.DeepEqual(got, one.want) {
				t.Fatalf("UntestedIn reads %q, want %q", got, one.want)
			}
		})
	}
}

func TestAMoveOfAWholeBlockChangesNoCode(t *testing.T) {
	for _, one := range []struct {
		name  string
		delta string
		want  []string
	}{
		{"a function moved whole", "diff --git a/src/a.js b/src/a.js\n@@ -1,3 +0,0 @@\n-function a() {\n-  return 1;\n-}\n@@ -0,0 +9,3 @@\n+function a() {\n+  return 1;\n+}", nil},
		{"a statement moved inside a body", "diff --git a/src/a.js b/src/a.js\n@@ -2 +1,0 @@\n-  return x;\n@@ -3,0 +3 @@\n+  return x;", []string{"src/a.js"}},
	} {
		t.Run(one.name, func(t *testing.T) {
			if got := UntestedIn(one.delta, nil, false, nil); !reflect.DeepEqual(got, one.want) {
				t.Fatalf("UntestedIn reads %q, want %q", got, one.want)
			}
		})
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

// Several hands hold on one box, so a test two held tickets carry comes back once. [[spec/design_output/tree#the-rules-over-two-files]]
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
