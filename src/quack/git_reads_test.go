// The quack verbs' git reads run through the process door, so no one of them
// spawns git in place. [[spec/tickets/quack-git-reads-take-door]]
package main_test

import (
	"go/ast"
	"go/parser"
	"go/token"
	"testing"
)

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
