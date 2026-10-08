// The quack verbs reach git through Repo, and read it through the process door,
// so no one of them spawns git in place.
// [[spec/tickets/repo-guard-reads-the-verbs]]
package main_test

import (
	"go/ast"
	"go/parser"
	"go/token"
	"slices"
	"strconv"
	"testing"
)

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

// Each git read, by the file it stands in. [[spec/tickets/quack-git-reads-take-door]]
var gitReads = map[string]string{
	"command.go":        "gitRead",
	"vehicle_verb.go":   "vehicleGit",
	"retro_chapters.go": "retroCommitsIn",
	"verb_lint.go":      "Paths",
	"retro_collect.go":  "retroCollectGitIn",
}

func TestTheQuackGitReadsSpawnThroughTheProcessDoor(t *testing.T) {
	t.Parallel()
	for name, read := range gitReads {
		file, err := parser.ParseFile(token.NewFileSet(), name, nil, 0)
		if err != nil {
			t.Fatal(err)
		}
		found := false
		for _, decl := range file.Decls {
			fn, ok := decl.(*ast.FuncDecl)
			if !ok || fn.Name.Name != read {
				continue
			}
			found = true
			ast.Inspect(fn, func(node ast.Node) bool {
				if sel, ok := node.(*ast.SelectorExpr); ok {
					if pkg, ok := sel.X.(*ast.Ident); ok && pkg.Name == "exec" {
						t.Errorf("%s names exec.%s in %s, where a git read runs through proc", name, sel.Sel.Name, read)
					}
				}
				return true
			})
		}
		if !found {
			t.Errorf("%s holds no %s", name, read)
		}
	}
}
