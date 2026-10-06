// The verb table: the usage, and a need naming a branch verb.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"strings"
	"testing"
)

// A bare branch prints the usage, and a verb the table lacks refuses with it. [[spec/design_output/work#the-round-trip]]
func TestTheBranchVerbPrintsItsUsage(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	if code := one.branchSays(); code != 0 {
		t.Fatalf("a bare branch answers %d", code)
	}
	holds(t, one.out.String(), "Usage: ./RUNME.sh branch <verb>\n\n  open <group>")
	if code := one.branchSays("nope"); code != codeRefused {
		t.Fatalf("an unknown verb answers %d", code)
	}
}

// A need names a branch verb this box holds, and one it lacks. [[spec/design_output/pull#a-need-is-a-verb]]
func TestANeedReadsTheVerbTable(t *testing.T) {
	t.Parallel()
	if !holdsVerb("branch sync") || !holdsVerb("ticket pull") || holdsVerb("branch fly") || holdsVerb("deploy") {
		t.Fatal("the needs read apart from the table")
	}
}

// A loud verb leaves a log row at warn on red. [[spec/design_output/log#which-kind-says-what]]
func TestALoudVerbLogsItsCode(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	var rows []string
	one.d.Log = func(level, kind, said string, _ map[string]any) {
		if kind == "work" {
			rows = append(rows, level+" "+kind+" "+said)
		}
	}
	one.branchSays("open")
	if len(rows) != 1 || rows[0] != "warn work open answered 2" {
		t.Fatalf("the log holds %v", rows)
	}
}

// Whether a text holds a part. [[spec/tickets/work-verbs-port-to-go]]
func contains(text, part string) bool { return strings.Contains(text, part) }
