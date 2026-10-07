// The doors' rules over the tree: a walk-around of a door, refused in the lint
// and drawn in the editor, and a door standing in no declaration.
// [[spec/design_output/doors#nothing-walks-around-a-door]]
package check

import (
	"fmt"
	"path"
	"strings"

	"quackitect/src/owns"
)

// [[spec/design_output/doors#nothing-walks-around-a-door]]
const (
	WalksAroundADoor = "WalksAroundADoor"
	DoorDeclares     = "DoorDeclares"
	walksSays        = "%s. Reach it through a door, or mark the line: // " + owns.Marker + "<why the door cannot serve>"
	undeclaredSays   = "%s is a door, and no " + owns.File + " holds it. Declare what it owns in one beside it."
	doorsFolder      = "src/doors"
	sourceFolder     = "src/"
	ioFlag           = "q.IO()"
	goDoor           = "door.go"
)

// The declarations a tree holds and the doors they read as, kept while the paths and the texts stand. [[spec/design_output/doors#a-door-declares-what-it-owns]]
type declared struct {
	from   []string
	paths  []string
	texts  string
	doors  []owns.Door
	faults []owns.Fault
}

// Whether two lists of paths are the one list the tree keeps. [[spec/design_output/doors#a-door-declares-what-it-owns]]
func sameList(one, other []string) bool {
	return len(one) == len(other) && (len(one) == 0 || &one[0] == &other[0])
}

// Every door the declarations the tree holds name, and each fault of their form, read again where a declaration's text changes. [[spec/design_output/doors#a-door-declares-what-it-owns]]
func doorsOf(tree *Tree) ([]owns.Door, []owns.Fault) {
	all := tree.Paths()
	tree.guard.Lock()
	kept := tree.declared
	tree.guard.Unlock()
	if !sameList(kept.from, all) {
		kept = declared{from: all}
		for _, at := range all {
			if owns.Declares(at) && doorsWalked(at) {
				kept.paths = append(kept.paths, at)
			}
		}
	}
	texts := map[string]string{}
	var key strings.Builder
	for _, at := range kept.paths {
		texts[at] = tree.Read(at)
		key.WriteString(at + "\x00" + texts[at] + "\x00")
	}
	if kept.doors == nil || kept.texts != key.String() {
		kept.texts = key.String()
		kept.doors, kept.faults = owns.Read(texts, tree.Exists)
		if kept.doors == nil {
			kept.doors = []owns.Door{}
		}
	}
	tree.guard.Lock()
	tree.declared = kept
	tree.guard.Unlock()
	return kept.doors, kept.faults
}

// Every walk-around the file makes: at error where a door owning the name refuses, and as a hint in an editor's buffer where every one stands at report. [[spec/design_output/doors#nothing-walks-around-a-door]]
func walkFaults(tree *Tree, at string) []Finding {
	doors, _ := doorsOf(tree)
	if len(doors) == 0 {
		return nil
	}
	held := tree.Held(at)
	out := []Finding{}
	for _, one := range owns.Walks(at, tree.Read(at), doors) {
		if one.Marked || (one.Report && !held) {
			continue
		}
		said := fault(WalksAroundADoor, at, one.Line, fmt.Sprintf(walksSays, one.Says()))
		if one.Report {
			said.Severity = SeverityHint
		}
		said.Column = one.Column
		out = append(out, said)
	}
	return out
}

// Every declaration of no form, and every door no declaration holds. [[spec/design_output/doors#a-door-declares-what-it-owns]]
func declaresFaults(tree *Tree) []Finding {
	doors, faults := doorsOf(tree)
	out := []Finding{}
	for _, one := range faults {
		out = append(out, fault(DoorDeclares, one.File, one.Line, one.Says))
	}
	for _, at := range tree.Paths() {
		if !walked(at) || !isDoor(tree, at) || heldByOne(doors, at) {
			continue
		}
		out = append(out, fault(DoorDeclares, at, 1, fmt.Sprintf(undeclaredSays, at)))
	}
	return out
}

// Whether a file is a door: a script under src/doors, a door.go, or a Go file whose code calls q.IO(). [[spec/design_output/doors#a-door-declares-what-it-owns]]
func isDoor(tree *Tree, at string) bool {
	if path.Dir(at) == doorsFolder && path.Ext(at) == ".js" {
		return true
	}
	if !strings.HasPrefix(at, sourceFolder) || path.Ext(at) != ".go" || strings.HasSuffix(at, "_test.go") {
		return false
	}
	if path.Base(at) == goDoor {
		return true
	}
	for _, line := range strings.Split(tree.Read(at), "\n") {
		if strings.Contains(codeCut(line), ioFlag) {
			return true
		}
	}
	return false
}

func heldByOne(doors []owns.Door, at string) bool {
	for _, one := range doors {
		if one.Holds(at) {
			return true
		}
	}
	return false
}
