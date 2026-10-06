// The branch and cloud verbs stand registered in Go, so the road hands
// neither to node.
// [[spec/tickets/work-verbs-port-to-go]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"bytes"
	"path/filepath"
	"testing"
)

// branch and cloud take quack's road under the new mode, the queue twin standing beside branch. [[spec/tickets/work-verbs-port-to-go]]
func TestTheBranchAndCloudVerbsRunInGo(t *testing.T) {
	t.Parallel()
	for _, argv := range [][]string{{"branch", "take"}, {"branch"}, {"cloud", "trigger"}, {"branch", "list", "--queue"}} {
		if roadOf(modeNew, argv, registry) != toQuack {
			t.Fatalf("%v reaches node", argv)
		}
	}
	if key, _ := twinOf([]string{"branch", "list", "--queue"}, registry); key != "branch list --queue" {
		t.Fatalf("the queue reads the %q twin", key)
	}
}

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

// The verbs run each other through this binary's verb road over the scripts folder. [[spec/tickets/the-verbs-need-no-wrapper]]
func TestTheSelfRoadNamesTheScripts(t *testing.T) {
	t.Parallel()
	road := selfRoad("/m")
	if len(road) != 3 || road[1] != "verb" || road[2] != filepath.Join("/m", "src", "scripts") {
		t.Fatalf("the road reads %v", road)
	}
}
