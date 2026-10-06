// The fixtures the port_e cases share: a marked group, a closed one, a tree
// ready to merge, a refusing origin, and the reads on origin a case asserts.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"errors"
	"testing"
)

// The group carrying the cloud marker. [[spec/tickets/work-verbs-port-to-go]]
var peMarked = withField(groupNote, cloudMark, "true")

// The marked group standing done. [[spec/tickets/work-verbs-port-to-go]]
var peMarkedDone = withField(peMarked, "state", closedState)

// The bare group standing done. [[spec/tickets/work-verbs-port-to-go]]
var peDone = withField(groupNote, "state", closedState)

// The cloud routine's branch the merge cases take in. [[spec/tickets/work-verbs-port-to-go]]
const peClaude = "claude/a-thing"

// A desk tree whose main carries the files and an empty install, the check green, and work/g pushed where branch files stand. [[spec/tickets/work-verbs-port-to-go]]
func peMergeTree(t *testing.T, trunkFiles, branchFiles map[string]string) *tree {
	t.Helper()
	if trunkFiles == nil {
		trunkFiles = map[string]string{}
	}
	if _, ok := trunkFiles["src/scripts/install.sh"]; !ok {
		trunkFiles["src/scripts/install.sh"] = ""
	}
	one := newTree(t, trunkFiles).desk()
	one.d.Runme = []string{"true"}
	if branchFiles != nil {
		one.branch("g", branchFiles)
	}
	return one
}

// Pushes a claude branch off main carrying the files, and comes back to main. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) peClaudeBranch(files map[string]string) {
	one.t.Helper()
	one.cut(peClaude, "main")
	one.land(peClaude+" lands", files)
	one.push(peClaude)
	one.switchTo("main")
	one.drop(peClaude)
	one.fetch()
}

// Lands files on main and pushes them. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) peTrunkMoves(files map[string]string) {
	one.t.Helper()
	one.land("main moves", files)
	one.push("main")
}

// Sets a pre-receive hook on origin, refusing a push where the case reads true of the ref and the commit it moves to, empty for a delete. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) peOriginRefuses(refuses func(ref, to string) bool) {
	one.origin.Hook("pre-receive", func(ref, to string) error {
		if refuses(ref, to) {
			return errors.New("refused")
		}
		return nil
	})
}

// The tip origin holds for a branch, or nothing. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) peOriginTip(branch string) string { return one.originAt(branch) }

// A file as origin's branch carries it, read straight off origin. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) peOriginFile(branch, rel string) string { return one.originShows(branch, rel) }
