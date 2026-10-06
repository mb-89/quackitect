// The quack verbs' repository cases run on FakeRepo, so they spawn no git, and
// the doors chapter lists them among no test reaching a real door.
// [[spec/tickets/quack-repos-meet-fake-git]]
package main

import (
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"quackitect/src/imports"
)

// The quack test files building a repository a case, each moving onto FakeRepo. [[spec/tickets/quack-repos-meet-fake-git]]
var repoCases = []string{"commit_test.go", "landing_test.go", "ticket_bless_test.go", "ticket_open_test.go", "ticket_route_test.go", "verb_mint_test.go"}

func TestTheQuackRepositoryCasesSpawnNothingAndTheDoorsChapterListsThemNowhere(t *testing.T) {
	t.Parallel()
	for _, name := range repoCases {
		file, err := parser.ParseFile(token.NewFileSet(), name, nil, 0)
		if err != nil {
			t.Fatal(err)
		}
		if waits := imports.RealWaits(file); len(waits) > 0 {
			t.Errorf("%s calls %v, where the quack repository cases run on FakeRepo", name, waits)
		}
	}
	note, err := os.ReadFile(filepath.Join("..", "..", "spec", "design_output", "doors.md"))
	if err != nil {
		t.Fatal(err)
	}
	for _, name := range repoCases {
		if strings.Contains(string(note), "`src/quack/"+name+"`") {
			t.Errorf("spec/design_output/doors.md still lists src/quack/%s as a test reaching a real door", name)
		}
	}
}
