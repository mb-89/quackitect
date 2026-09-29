// The folder root carries no code: each module stands in a package under it.
// [[spec/design_output/model#the-fake-index]]
package modules

import (
	_ "embed"
	"go/parser"
	"go/token"
	"testing"
)

//go:embed modules.go
var root string

func TestTheRootDeclaresNothing(t *testing.T) {
	file, err := parser.ParseFile(token.NewFileSet(), "modules.go", root, 0)
	if err != nil {
		t.Fatal(err)
	}
	if len(file.Decls) != 0 || len(file.Imports) != 0 {
		t.Fatalf("the root declares %d things and imports %d", len(file.Decls), len(file.Imports))
	}
}
