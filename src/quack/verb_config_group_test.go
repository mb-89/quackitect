// The config group's verbs register in Go, the road reaches no node for any of
// them, their programs stand nowhere under src/scripts/verbs, and no file under
// src imports a JavaScript module the port deletes.
// [[spec/tickets/config-verbs-port-to-go]]
package main

import (
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// The verbs this group ports. [[spec/tickets/config-verbs-port-to-go]]
var configVerbs = []string{"config", "fix", "project", "rules", "standing", "doors"}

// The modules the port deletes, each by its path under the tree root. [[spec/tickets/config-verbs-port-to-go]]
var configModules = []string{"src/scripts/cli-fix.js", ".claude/skills/level0/lib/shout.js"}

func TestConfigVerbsLeaveNode(t *testing.T) {
	t.Parallel()
	for _, verb := range configVerbs {
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
		for _, verb := range configVerbs {
			gone = append(gone, "verbs/"+verb+".js")
		}
		for _, module := range configModules {
			if _, err := os.Stat(filepath.Join("..", "..", filepath.FromSlash(module))); err == nil {
				t.Fatalf("%s stands, and the port deletes it", module)
			}
			gone = append(gone, filepath.Base(module))
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
