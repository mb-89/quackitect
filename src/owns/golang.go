// The Go walk: an import of a package a door owns whole, and a selector on a
// package a door owns by member, read off the parsed file.
// [[spec/design_output/doors#nothing-walks-around-a-door]]
package owns

import (
	"go/ast"
	"go/parser"
	"go/token"
	"path"
	"regexp"
	"strconv"

	"quackitect/src/yaml"
)

// A major version closing an import path, which names no package. [[spec/design_output/doors#nothing-walks-around-a-door]]
var majorAt = regexp.MustCompile(`^v[0-9]+$`)

// The walks of a Go file, or none where it reads as no Go. An identifier the parser resolves names a local, so a local shadowing a package walks nowhere. [[spec/design_output/doors#nothing-walks-around-a-door]]
func goWalks(at, text string, owned map[string]*claim) []Walk {
	if len(owned) == 0 {
		return nil
	}
	fset := token.NewFileSet()
	file, err := parser.ParseFile(fset, at, text, parser.ParseComments)
	if err != nil {
		return nil
	}
	lines := yaml.SplitLines(text)
	var out []Walk
	locals := map[string]string{}
	for _, spec := range file.Imports {
		pkg, err := strconv.Unquote(spec.Path.Value)
		if err != nil {
			continue
		}
		if one := owned[pkg]; one != nil && !one.held {
			where := fset.Position(spec.Path.Pos())
			out = append(out, walkAt(at, lines, where.Line, where.Column, pkg, one))
		}
		local := localOf(pkg)
		if spec.Name != nil {
			local = spec.Name.Name
		}
		if local != "_" && local != "." {
			locals[local] = pkg
		}
	}
	ast.Inspect(file, func(node ast.Node) bool {
		pick, ok := node.(*ast.SelectorExpr)
		if !ok {
			return true
		}
		named, ok := pick.X.(*ast.Ident)
		if !ok || named.Obj != nil {
			return true
		}
		pkg, ok := locals[named.Name]
		if !ok {
			return true
		}
		name := pkg + "." + pick.Sel.Name
		if one := owned[name]; one != nil && !one.held {
			where := fset.Position(named.Pos())
			out = append(out, walkAt(at, lines, where.Line, where.Column, name, one))
		}
		return true
	})
	return out
}

// The name a package goes by where its import names none: its last segment, past a major version. [[spec/design_output/doors#nothing-walks-around-a-door]]
func localOf(pkg string) string {
	last := path.Base(pkg)
	if majorAt.MatchString(last) && path.Dir(pkg) != "." {
		return path.Base(path.Dir(pkg))
	}
	return last
}
