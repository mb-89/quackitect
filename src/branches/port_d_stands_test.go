// What stands, ported off test/level0/work-stands.test.js: each changed file
// and whether a tag parks it, what a dependency waits on, and a ref behind trunk.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"sort"
	"strings"
	"testing"
)

// A tagged note inside an untracked folder reads as parked, because the status names each file. [[spec/tickets/work-verbs-port-to-go]]
func TestPDATaggedNoteInAFreshFolderReadsParked(t *testing.T) {
	one := newTree(t, map[string]string{"src/x.js": "export const x = 1;\n"})
	one.write(map[string]string{
		"spec/drafts/fresh/later.md": "---\nkind: [[ticket]]\ntodo: true\n---\n\n# Ask\n\nLater.\n",
		"src/x.js":                   "export const x = 2;\n",
	})
	said := one.d.standingIn()
	sort.Slice(said, func(a, b int) bool { return said[a].Name < said[b].Name })
	want := []change{{Name: "spec/drafts/fresh/later.md", Parked: true}, {Name: "src/x.js", Parked: false}}
	if len(said) != len(want) || said[0] != want[0] || said[1] != want[1] {
		t.Fatalf("the tree stands %+v", said)
	}
}

// A parent group on no branch, open on trunk, holds the group depending on it. [[spec/tickets/work-verbs-port-to-go]]
func TestPDAParentWithNoBranchHoldsItsDependents(t *testing.T) {
	after := strings.Replace(pdGroupNote, "state: open\n", "state: open\ndepends_on: move\n", 1)
	one := newTree(t, map[string]string{
		ticketAt("after"):  after,
		ticketAt("move"):   pdGroupNote,
		ticketAt("a-part"): pdChild("move", "open"),
	})
	one.branch("after", nil)
	read := one.d.readFree(one.d.nowSeconds())
	if len(read.Free) != 0 {
		t.Fatalf("free reads %+v", read.Free)
	}
	if len(read.Stand) != 1 {
		t.Fatalf("the stand reads %+v", read.Stand)
	}
	if waits := waitsOf(read.Stand[0], read.Standing, read.Trunk); strings.Join(waits, ",") != "move" {
		t.Fatalf("work/after waits for %v", waits)
	}
}

// A branch answers first, and trunk answers for a dependency on no branch; a name trunk lacks holds nothing. [[spec/tickets/work-verbs-port-to-go]]
func TestPDWaitingOnReadsTheBranchThenTrunk(t *testing.T) {
	text := strings.Replace(pdGroupNote, "state: open\n", "state: open\ndepends_on: [busy, parent, shut, gone]\n", 1)
	standing := map[string]string{workBranch + "busy": todo}
	trunkTickets := map[string]string{
		"parent": pdGroupNote,
		"shut":   strings.Replace(pdGroupNote, "state: open", "state: closed", 1),
	}
	if said := waitingOn(text, standing, trunkTickets); strings.Join(said, ",") != "busy,parent" {
		t.Fatalf("waitingOn answers %v", said)
	}
	if said := waitingOn(text, standing, nil); strings.Join(said, ",") != "busy" {
		t.Fatalf("waitingOn with no trunk answers %v", said)
	}
}

// A ref whose base stands short of the trunk tip reads behind, and one with no trunk tip reads level. [[spec/tickets/work-verbs-port-to-go]]
func TestPDARefShortOfTheTrunkTipReadsBehind(t *testing.T) {
	one := newTree(t, nil)
	one.branch("one-group", map[string]string{ticketAt("one-group"): pdGroupNote})
	pdMainMoves(one, 1)
	refs := one.d.refsHere()
	if len(refs) != 1 || !refs[0].Behind || refs[0].Orphan {
		t.Fatalf("the refs read %+v", refs)
	}
	one.git("update-ref", "-d", "refs/remotes/origin/main")
	refs = one.d.refsHere()
	if len(refs) != 1 || refs[0].Behind {
		t.Fatalf("with no trunk tip the refs read %+v", refs)
	}
}
