// The dispatch verb registers in Go, the road reaches no node for it, its
// program stands nowhere under src/scripts/verbs, and no file under src
// imports a JavaScript module the port deletes.
// [[spec/tickets/dispatch-verbs-port-to-go]]
package main

import (
	"bytes"
	"errors"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"quackitect/src/branches"
)

// The modules the port deletes, the program among them. [[spec/tickets/dispatch-verbs-port-to-go]]
var dispatchModules = []string{"verbs/dispatch.js", "dispatch.js", "dispatch-write.js", "dispatch-fire.js"}

func TestDispatchLeavesNode(t *testing.T) {
	if registry["dispatch"] == nil {
		t.Fatal("the registry holds no dispatch")
	}
	for _, argv := range [][]string{{"dispatch"}, {"dispatch", "--dry"}, {"dispatch", "--json", "--fire"}} {
		if roadOf(modeNew, argv, registry) != toQuack {
			t.Fatalf("%v reaches node", argv)
		}
	}
	reached := false
	doors, _, _ := roadOver(modeNew, "", map[string]twin{"dispatch": twinSaying("", &[]bool{})})
	doors.old = func(io.Writer) int { reached = true; return 0 }
	if verbs(doors, []string{"dispatch", "--dry"}); reached {
		t.Fatal("dispatch reaches node under new")
	}
	for _, module := range dispatchModules {
		if _, err := os.Stat(filepath.Join("..", "scripts", filepath.FromSlash(module))); err == nil {
			t.Errorf("src/scripts/%s stands, and the dispatch runs in Go", module)
		}
	}
	err := filepath.WalkDir("..", func(path string, entry fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if entry.IsDir() && entry.Name() == "node_modules" {
			return fs.SkipDir
		}
		if entry.IsDir() || !strings.HasSuffix(path, ".js") {
			return nil
		}
		text, err := os.ReadFile(path)
		if err != nil {
			return err
		}
		for _, module := range dispatchModules {
			if strings.Contains(string(text), "/"+module+"\"") || strings.Contains(string(text), "/"+module+"'") {
				t.Errorf("%s imports %s, which the port deletes", path, module)
			}
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

// The verb hands every word past its name to the package, over the send door it holds. [[spec/tickets/dispatch-verbs-port-to-go]]
func TestDispatchVerbRunsTheDryPlanOverTheDoors(t *testing.T) {
	root := func() (string, error) { return t.TempDir(), nil }
	v1 := func() (string, error) { return "", nil }
	sent := false
	send := func(string, branches.Request) (branches.Reply, error) {
		sent = true
		return branches.Reply{}, errors.New("no network")
	}
	var out, errs bytes.Buffer
	if code := dispatchVerb(root, v1, send)([]string{"dispatch", "--dry"}, false, &out, &errs); code != 0 {
		t.Fatalf("the dry run answers %d: %s", code, errs.String())
	}
	if !strings.Contains(out.String(), "ready groups, one worker each:") || sent {
		t.Fatalf("the dry run prints %q, and sends %v", out.String(), sent)
	}
}
