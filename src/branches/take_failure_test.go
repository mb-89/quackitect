// The take and the branch guards raise each refusal through the failure door:
// the id, its level and each remedy print beneath the message, and the log
// row carries the id. [[spec/design_output/failures#the-refusals-move-onto-nodes]]
package branches

import (
	"strings"
	"testing"

	"quackitect/src/failure"
)

func TestTakeRefusalsNameTheirIds(t *testing.T) {
	t.Parallel()
	cases := []struct {
		name string
		sets func(one *tree)
		argv []string
		id   string
	}{
		{"an open naming no group", func(*tree) {}, []string{"open"}, "take-open-names-no-group"},
		{"an open naming a group main lacks", func(*tree) {}, []string{"open", "ghost"}, "take-group-unpushed"},
		{"an open off main", func(one *tree) { one.git("switch", "-q", "-c", "feature") }, []string{"open", "ghost"}, "branch-off-trunk"},
		{"a take on a desk", func(one *tree) { one.desk() }, []string{"take"}, "desk-works-on-trunk"},
		{"a take over uncommitted work", func(one *tree) { one.write(map[string]string{"stray.md": "x\n"}) }, []string{"take"}, "branch-tree-dirty"},
		{"a take naming a branch that stands nowhere free", func(*tree) {}, []string{"take", "ghost"}, "take-branch-not-free"},
	}
	for _, one := range cases {
		t.Run(one.name, func(t *testing.T) {
			t.Parallel()
			at := newTree(t, nil)
			at.d.Failures = failure.Fake(failure.Node{ID: one.id, Level: "warn", Remedies: []string{"Do the thing."}})
			var logged []string
			at.d.Log = func(level, kind, _ string, more map[string]any) {
				if kind == failure.RowKind {
					logged = append(logged, level+" "+more[failure.IDField].(string))
				}
			}
			one.sets(at)
			code := at.branchSays(one.argv...)
			if code == codeOK || !strings.Contains(at.errs.String(), "failure "+one.id+" at warn\nremedy: Do the thing.\n") {
				t.Fatalf("the verb answers %d, and names no %s:\n%s", code, one.id, at.errs.String())
			}
			if strings.Join(logged, ",") != "warn "+one.id {
				t.Fatalf("the log takes %q", logged)
			}
		})
	}
}

// The take's message carries no remedy, so the node's remedy prints once. [[spec/tickets/the-twins-leave-whole]]
func TestDeskTakePrintsTheRemedyOnce(t *testing.T) {
	t.Parallel()
	at := newTree(t, nil)
	at.d.Failures = failure.Fake(failure.Node{ID: "desk-works-on-trunk", Level: "warn", Remedies: []string{"Run git switch main, and take a finished cloud branch in with ./RUNME.sh branch merge <name>."}})
	at.desk()
	at.branchSays("take")
	if count := strings.Count(at.errs.String(), "git switch main"); count != 1 {
		t.Fatalf("the take prints the remedy %d times:\n%s", count, at.errs.String())
	}
}
