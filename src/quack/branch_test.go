// The branch and cloud verbs print their usage, and run each other through
// this binary's verb road.
// [[spec/tickets/work-verbs-port-to-go]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"bytes"
	"os"
	"path/filepath"
	"testing"

	"quackitect/src/failure"
)

// A bare branch and a bare cloud print their usage off the Go table. [[spec/tickets/work-verbs-port-to-go]]
func TestTheGoVerbsPrintTheirUsage(t *testing.T) {
	t.Parallel()
	root := func() (string, error) { return t.TempDir(), nil }
	v1 := func() (string, error) { return "", nil }
	var out, errs bytes.Buffer
	if code := branchVerb(root, v1)([]string{"branch"}, false, &out, &errs); code != 0 || !bytes.Contains(out.Bytes(), []byte("Usage: ./RUNME.sh branch <verb>")) {
		t.Fatalf("branch answers %d: %s", code, out.String())
	}
	out.Reset()
	if code := cloudVerb(root, v1)([]string{"cloud"}, false, &out, &errs); code != 0 || !bytes.Contains(out.Bytes(), []byte("Usage: ./RUNME.sh cloud <verb>")) {
		t.Fatalf("cloud answers %d: %s", code, out.String())
	}
}

// The branch doors carry the failure nodes under the method root, so a take refusal names its remedies. [[spec/design_output/failures#the-refusals-move-onto-nodes]]
// level0: FixtureOutsideHome - the doors load the nodes off a method root of the case's own
func TestTheBranchDoorsLoadTheFailureNodes(t *testing.T) {
	t.Parallel()
	method := t.TempDir()
	at := filepath.Join(method, filepath.FromSlash(failure.Folder))
	if err := os.MkdirAll(at, 0o755); err != nil {
		t.Fatal(err)
	}
	node := "---\nkind: [[failure]]\nlevel: warn\nremedies: [\"Reopen the group.\"]\n---\n\n# When\n\nThe group stands closed.\n"
	if err := os.WriteFile(filepath.Join(at, "take-group-closed.md"), []byte(node), 0o644); err != nil {
		t.Fatal(err)
	}
	var out, errs bytes.Buffer
	d := branchDoors(func() (string, error) { return method, nil }, func() (string, error) { return "", nil }, &out, &errs)
	if held, ok := d.Failures.Node("take-group-closed"); !ok || held.Level != "warn" || len(held.Remedies) != 1 || held.Remedies[0] != "Reopen the group." {
		t.Fatalf("the branch doors carry %+v, %v", held, ok)
	}
}

// The verbs run each other through this binary's verb road over the scripts folder. [[spec/tickets/the-verbs-need-no-wrapper]]
func TestTheSelfRoadNamesTheScripts(t *testing.T) {
	t.Parallel()
	road := selfRoad("/m")
	if len(road) != 3 || road[1] != "verb" || road[2] != filepath.Join("/m", "src", "scripts") {
		t.Fatalf("the road reads %v", road)
	}
}
