// A function body standing in another package too drifts, because a fix reaches
// one copy and leaves the other. The rule prints every body with its parameter
// and local names renamed to their place, and refuses the later of equal prints.
// [[spec/tickets/shared-helpers-stand-once]]
package check

import (
	"bytes"
	"crypto/sha256"
	"go/ast"
	"go/parser"
	"go/printer"
	"go/token"
	"path"
	"sort"
	"strconv"
	"strings"
)

const (
	// The rule over a function body standing in another package. [[spec/tickets/shared-helpers-stand-once]]
	HelperStandsOnce = "HelperStandsOnce"
	// The fewest statements a body holds before the rule reads it, so a one-line getter draws nothing. [[spec/tickets/shared-helpers-stand-once]]
	copyFloor = 5
)

// One top-level function and the print of its renamed body. [[spec/tickets/shared-helpers-stand-once]]
type copyAt struct {
	file, name string
	line       int
}

// Every body standing in an earlier package too, read once for each set of Go texts. [[spec/tickets/shared-helpers-stand-once]]
func helperCopies(tree *Tree) []Finding {
	paths := goSources(tree)
	key := sha256.New()
	for _, at := range paths {
		key.Write([]byte(at + "\x00" + tree.Read(at) + "\x00"))
	}
	return tree.copiesOnce(string(key.Sum(nil)), func() []Finding {
		first := map[string]copyAt{}
		out := []Finding{}
		for _, at := range paths {
			for print, one := range bodiesIn(at, tree.Read(at)) {
				there, held := first[print]
				if !held {
					first[print] = one
					continue
				}
				if path.Dir(there.file) == path.Dir(at) {
					continue
				}
				out = append(out, fault(HelperStandsOnce, at, one.line,
					one.name+" copies the body of "+there.name+" in "+path.Dir(there.file)+". Call that one, and delete this copy."))
			}
		}
		return out
	})
}

// The tracked Go files the rule reads, past tests, drafts and test data, in path order. [[spec/tickets/shared-helpers-stand-once]]
func goSources(tree *Tree) []string {
	out := []string{}
	for _, at := range tree.Paths() {
		if strings.HasSuffix(at, ".go") && !strings.HasSuffix(at, "_test.go") && !isDraft(at) && !strings.Contains("/"+at, "/testdata/") {
			out = append(out, at)
		}
	}
	sort.Strings(out)
	return out
}

// Each top-level function past the floor and past the methods, keyed by the print of its renamed signature and body. [[spec/tickets/shared-helpers-stand-once]]
func bodiesIn(at, text string) map[string]copyAt {
	set := token.NewFileSet()
	file, err := parser.ParseFile(set, at, text, 0)
	if err != nil {
		return nil
	}
	out := map[string]copyAt{}
	for _, decl := range file.Decls {
		one, ok := decl.(*ast.FuncDecl)
		// A method answers for its own receiver, so two types sharing a body stand apart. [[spec/tickets/shared-helpers-stand-once]]
		if !ok || one.Recv != nil || one.Body == nil || statementsIn(one.Body) < copyFloor {
			continue
		}
		renamed(one)
		var print bytes.Buffer
		if printer.Fprint(&print, set, &ast.FuncLit{Type: one.Type, Body: one.Body}) != nil {
			continue
		}
		if _, held := out[print.String()]; !held {
			out[print.String()] = copyAt{file: at, name: one.Name.Name, line: set.Position(one.Pos()).Line}
		}
	}
	return out
}

// The statements a body holds at every depth, past the blocks that only group them. [[spec/tickets/shared-helpers-stand-once]]
func statementsIn(body *ast.BlockStmt) int {
	count := 0
	ast.Inspect(body, func(node ast.Node) bool {
		if _, ok := node.(ast.Stmt); ok {
			if _, block := node.(*ast.BlockStmt); !block {
				count++
			}
		}
		return true
	})
	return count
}

// Renames each name the function declares, its parameters and its locals, to its place: v0, v1, and on. [[spec/tickets/shared-helpers-stand-once]]
func renamed(one *ast.FuncDecl) {
	places := map[*ast.Object]string{}
	inside := func(at token.Pos) bool { return at >= one.Pos() && at < one.End() }
	ast.Inspect(one, func(node ast.Node) bool {
		name, ok := node.(*ast.Ident)
		if !ok || name == one.Name || name.Obj == nil || name.Obj.Kind == ast.Typ {
			return true
		}
		decl, ok := name.Obj.Decl.(ast.Node)
		if !ok || !inside(decl.Pos()) {
			return true
		}
		place, held := places[name.Obj]
		if !held {
			place = "v" + strconv.Itoa(len(places))
			places[name.Obj] = place
		}
		name.Name = place
		return true
	})
}

// The copies a Go file holds, off the pass over every Go text. [[spec/tickets/shared-helpers-stand-once]]
func copiesOver(tree *Tree, where string) []Finding {
	out := []Finding{}
	for _, said := range helperCopies(tree) {
		if said.File == where {
			out = append(out, said)
		}
	}
	return out
}
