// The quack verbs' repository cases run on FakeRepo, so they spawn no git, and
// the doors chapter lists them among no test reaching a real door.
// [[spec/tickets/quack-repos-meet-fake-git]]
package main

import (
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"slices"
	"strconv"
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

// The commit and ticket verbs moving onto Repo, and the seams alone that build the real one. [[spec/tickets/repo-guard-reads-the-verbs]]
var (
	repoVerbs = []string{"commit.go", "push.go", "rename.go", "ticket_doors.go", "ticket_bless.go", "ticket_open.go", "ticket_note.go", "ticket_pull.go", "ticket_update.go", "verb_mint.go"}
	repoSeams = []string{"landingHere", "realRepo"}
)

func TestTheQuackRepositoryVerbsReachGitThroughRepoAndBuildTheRealOneInTheirSeamsAlone(t *testing.T) {
	t.Parallel()
	for _, name := range repoVerbs {
		file, err := parser.ParseFile(token.NewFileSet(), name, nil, 0)
		if err != nil {
			t.Fatal(err)
		}
		for _, spec := range file.Imports {
			if at, _ := strconv.Unquote(spec.Path.Value); at == "os/exec" {
				t.Errorf("%s imports os/exec, where the verbs reach git through Repo", name)
			}
		}
		for _, decl := range file.Decls {
			fn, ok := decl.(*ast.FuncDecl)
			if !ok || slices.Contains(repoSeams, fn.Name.Name) {
				continue
			}
			ast.Inspect(fn, func(node ast.Node) bool {
				sel, ok := node.(*ast.SelectorExpr)
				if !ok {
					return true
				}
				if pkg, ok := sel.X.(*ast.Ident); ok && pkg.Name == "git" && sel.Sel.Name == "NewRepo" {
					t.Errorf("%s names %s.%s in %s, where the real Repo stands in %v alone", name, pkg.Name, sel.Sel.Name, fn.Name.Name, repoSeams)
				}
				return true
			})
		}
	}
}
