// The registry keys every node by its id, off the folder or off the nodes a
// case hands in.
// [[spec/design_output/failures#the-registry-reads-the-nodes]]
package failure // level0: InPackageTest - declares heldNode, which the in-package check_test and schema_test read

import (
	"reflect"
	"testing"
)

const heldNode = `---
kind: [[failure]]
level: warn
remedies:
  - Pull again.
  - Hand the leaf back first.
reaction: branch release
watch:
  event: tool
  match: branch take
  quiet: 30
---

# When

A hand pulls while a leaf stands in it.
`

func TestLoadKeysEveryNodeById(t *testing.T) {
	t.Parallel()
	dir := FakeDir{
		Folder + "/leaf-held.md":  heldNode,
		Folder + "/plain.md":      "---\nkind: [[failure]]\nlevel: error\nremedies:\n  - Run it again.\n---\n\n# When\n\nIt fails.\n",
		Folder + "/notes.txt":     "no node",
		"spec/elsewhere/other.md": heldNode,
	}
	got := Load(dir)
	want := Registry{
		"leaf-held": {ID: "leaf-held", Level: "warn", Remedies: []string{"Pull again.", "Hand the leaf back first."}, Reaction: "branch release", Watch: &Watch{Event: "tool", Match: "branch take", Quiet: 30}},
		"plain":     {ID: "plain", Level: "error", Remedies: []string{"Run it again."}},
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("Load answers %#v, want %#v", got, want)
	}
}

func TestFakeAnswersTheNodesHandedIn(t *testing.T) {
	t.Parallel()
	one := Node{ID: "one", Level: "error", Remedies: []string{"Do it."}}
	registry := Fake(one)
	if got, ok := registry.Node("one"); !ok || !reflect.DeepEqual(got, one) {
		t.Fatalf("the fake answers %#v, %v for one, want %#v", got, ok, one)
	}
	if _, ok := registry.Node("two"); ok {
		t.Fatal("the fake answers a node nobody handed in")
	}
}
