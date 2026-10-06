// The fault functions name each break of the registry off the texts a case
// hands in.
// [[spec/design_output/failures#the-check-holds-the-registry]]
package failure

import (
	"reflect"
	"testing"
)

func TestNodeFaultsNameANodeWithNoRemedy(t *testing.T) {
	t.Parallel()
	dir := FakeDir{
		Folder + "/bare.md":      "---\nkind: [[failure]]\nlevel: error\n---\n\n# When\n\nIt fails.\n",
		Folder + "/leaf-held.md": heldNode,
	}
	if got, want := NodeFaults(dir), []string{"bare names no remedy"}; !reflect.DeepEqual(got, want) {
		t.Fatalf("NodeFaults names %q, want %q", got, want)
	}
}

func TestRaiseFaultsNameAnIdWithNoNode(t *testing.T) {
	t.Parallel()
	files := map[string]string{
		"src/a.go": "failure.Raise(registry, \"leaf-held\", \"x\")\nfailure.Raise(reg, \"ghost\")\n",
		"src/b.js": "await failures.raise(\"ghost-js\", \"x\");\nawait failure(disk, log).raise(\"leaf-held\");\n",
		"src/c.js": "engine.raise(\"session.start\", {});\nraise(\"tool.call\");\n",
	}
	want := []string{
		"src/a.go raises ghost, and no node under spec/failures carries it",
		"src/b.js raises ghost-js, and no node under spec/failures carries it",
	}
	if got := RaiseFaults(Fake(held), files); !reflect.DeepEqual(got, want) {
		t.Fatalf("RaiseFaults names %q, want %q", got, want)
	}
}

func TestDoorFaultsNameAMovedFileHoldingItsRefusal(t *testing.T) {
	t.Parallel()
	moved := map[string]string{"src/pull/held.go": "refuse(", "src/pull/moved.go": "refuse("}
	files := map[string]string{
		"src/pull/held.go":  "return refuse(\"a leaf stands\")\n",
		"src/pull/moved.go": "return failure.Raise(registry, \"leaf-held\")\n",
		"src/pull/other.go": "return refuse(\"elsewhere\")\n",
	}
	want := []string{"src/pull/held.go still writes refuse( past the failure door"}
	if got := DoorFaults(moved, files); !reflect.DeepEqual(got, want) {
		t.Fatalf("DoorFaults names %q, want %q", got, want)
	}
}
