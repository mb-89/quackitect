// The read verbs register in Go, the road reaches no node for any of them,
// and their programs stand nowhere under src/scripts/verbs.
// [[spec/tickets/read-verbs-port-to-go]]
package main

import (
	"io"
	"os"
	"path/filepath"
	"testing"
)

// The verbs this group ports. [[spec/tickets/read-verbs-port-to-go]]
var readVerbs = []string{"index", "links", "lint", "notes", "find", "log"}

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
}
