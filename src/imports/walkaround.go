// The walkaround analyzer: a Go use of a name a door owns, outside every door
// owning it, off the owns.yaml declarations the tree holds.
// [[spec/design_output/doors#nothing-walks-around-a-door]]
package imports

import (
	"go/ast"
	"go/token"
	"os" // level0: OutsideInDoors - the analyzer reads the source it checks, as a build check reads source
	"path/filepath"
	"strings"

	"golang.org/x/tools/go/analysis"

	"quackitect/src/owns"
)

// [[spec/design_output/doors#nothing-walks-around-a-door]]
var Walkaround = &analysis.Analyzer{
	Name: "walkaround",
	Doc:  "a name a door owns stands in no file outside the doors owning it",
	Run:  walkaround,
}

// Each walk-around of the pass's files, past a marked line, which ./RUNME.sh doors lists. [[spec/design_output/doors#nothing-walks-around-a-door]]
func walkaround(pass *analysis.Pass) (any, error) {
	root := rootOf(pass)
	if root == "" || strings.HasSuffix(pass.Pkg.Path(), testMain) {
		return nil, nil
	}
	for _, fault := range WalkFaults(root, pass.Fset, pass.Files) {
		pass.Reportf(fault.at, "%s", fault.says)
	}
	return nil, nil
}

// A walk-around a package's file makes, and where it stands. [[spec/design_output/doors#nothing-walks-around-a-door]]
type WalkFault struct {
	at   token.Pos
	says string
}

func (one WalkFault) String() string { return one.says }

// Where the walk-around stands, which a test outside the package places in its file. [[spec/design_output/doors#nothing-walks-around-a-door]]
func (one WalkFault) At() token.Pos { return one.at }

// Every walk-around the files make past the doors under the root, but a marked line. [[spec/design_output/doors#nothing-walks-around-a-door]]
func WalkFaults(root string, fset *token.FileSet, files []*ast.File) []WalkFault {
	doors := Doors(root)
	var out []WalkFault
	for _, file := range files {
		at := fset.File(file.Pos())
		rel, err := filepath.Rel(root, at.Name())
		if err != nil {
			continue
		}
		text, err := os.ReadFile(at.Name())
		if err != nil {
			continue
		}
		for _, one := range owns.Walks(filepath.ToSlash(rel), string(text), doors) {
			if one.Marked || one.Line > at.LineCount() {
				continue
			}
			out = append(out, WalkFault{at.LineStart(one.Line) + token.Pos(one.Column-1), one.Says()})
		}
	}
	return out
}
