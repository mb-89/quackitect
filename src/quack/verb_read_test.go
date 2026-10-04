// The read verbs register in Go, the road reaches no node for any of them,
// their programs stand nowhere under src/scripts/verbs, and no file under src
// imports a JavaScript module the port deletes.
// [[spec/tickets/read-verbs-port-to-go]]
package main

import (
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// The verbs this group ports. [[spec/tickets/read-verbs-port-to-go]]
var readVerbs = []string{"index", "links", "lint", "notes", "find", "log"}

// The modules beside the programs that the port deletes, which nothing imports. [[spec/tickets/read-verbs-importer-test]]
var readModules = []string{"log-verb.js"}

func TestReadVerbsLeaveNode(t *testing.T) {
	for _, verb := range readVerbs {
		t.Run(verb, func(t *testing.T) {
			if registry[verb] == nil {
				t.Fatalf("the registry holds no %s", verb)
			}
			reached := false
			doors, _, _ := roadOver(modeNew, "", map[string]twin{verb: twinSaying("", &[]bool{})})
			doors.old = func(io.Writer) int { reached = true; return 0 }
			if verbs(doors, []string{verb, "--help"}); reached {
				t.Fatalf("%s reaches node under new", verb)
			}
			if _, err := os.Stat(filepath.Join("..", "scripts", "verbs", verb+".js")); err == nil {
				t.Fatalf("src/scripts/verbs/%s.js stands, and the verb runs in Go", verb)
			}
		})
	}
	t.Run("no file under src imports a module the port deletes", func(t *testing.T) {
		gone := []string{}
		for _, verb := range readVerbs {
			gone = append(gone, "verbs/"+verb+".js")
		}
		for _, module := range readModules {
			if _, err := os.Stat(filepath.Join("..", "scripts", module)); err == nil {
				t.Fatalf("src/scripts/%s stands, and nothing imports it", module)
			}
			gone = append(gone, module)
		}
		err := filepath.WalkDir("..", func(path string, entry fs.DirEntry, err error) error {
			if err != nil || entry.IsDir() || !strings.HasSuffix(path, ".js") {
				return err
			}
			text, err := os.ReadFile(path)
			if err != nil {
				return err
			}
			for _, module := range gone {
				if strings.Contains(string(text), "/"+module+"\"") {
					t.Errorf("%s imports %s, which the port deletes", path, module)
				}
			}
			return nil
		})
		if err != nil {
			t.Fatal(err)
		}
	})
}
