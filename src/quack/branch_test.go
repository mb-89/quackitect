// The branch and cloud verbs print their usage, and run each other through
// this binary's verb road.
// [[spec/tickets/work-verbs-port-to-go]]
package main

import (
	"bytes"
	"path/filepath"
	"testing"
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

// The verbs run each other through this binary's verb road over the scripts folder. [[spec/tickets/the-verbs-need-no-wrapper]]
func TestTheSelfRoadNamesTheScripts(t *testing.T) {
	t.Parallel()
	road := selfRoad("/m")
	if len(road) != 3 || road[1] != "verb" || road[2] != filepath.Join("/m", "src", "scripts") {
		t.Fatalf("the road reads %v", road)
	}
}
