// The purity guard: a Go function reaching the outside outside an IO module,
// carrying no reason.
// [[spec/design_output/model#the-guards-hold-a-baseline]]
package imports

import (
	"go/ast"
	"go/parser"
	"go/token"
	"path"
	"regexp"
	"slices"
	"strconv"
	"strings"
)

// A major version closing an import path, which names no package. [[spec/design_output/model#the-guards-hold-a-baseline]]
var majorVersion = regexp.MustCompile(`^v[0-9]+$`)

// The marker a function reaching the outside carries, with its reason. [[spec/design_output/model#the-guards-hold-a-baseline]]
const impureMarker = "level0: Impure - "

// Each outside kind, and the Go names that reach it: a package path, or a path and a member after a dot. [[spec/design_output/model#the-guards-hold-a-baseline]]
var OutsideKinds = map[string][]string{
	"files":     {"os", "io/ioutil", "path/filepath.Abs", "path/filepath.EvalSymlinks", "path/filepath.Glob", "path/filepath.Walk", "path/filepath.WalkDir"},
	"processes": {"os/exec", "syscall"},
	"network":   {"net", "net/http", "net/http/httptest", "net/rpc", "net/smtp", "crypto/tls"},
	"clock":     {"time.Now", "time.Since", "time.Until", "time.Sleep", "time.After", "time.Tick", "time.NewTimer", "time.NewTicker", "time.AfterFunc"},
	"random":    {"math/rand", "math/rand/v2", "crypto/rand"},
	"git":       {"os/exec.Command", "os/exec.CommandContext"},
	"index":     {"database/sql", "quackitect/src/index"},
}

// Each function reaching the outside with no reason, outside an IO module, as its file and its name, sorted. [[spec/design_output/model#the-guards-hold-a-baseline]]
func ImpureFunctions(fset *token.FileSet, files []*ast.File) []string {
	reaching := map[string]bool{}
	for _, names := range OutsideKinds {
		for _, one := range names {
			reaching[one] = true
		}
	}
	byFolder := map[string][]*ast.File{}
	for _, file := range files {
		name := fset.Position(file.Package).Filename
		if !strings.HasSuffix(name, testFile) {
			byFolder[path.Dir(name)] = append(byFolder[path.Dir(name)], file)
		}
	}
	named := []string{}
	for _, group := range byFolder {
		if CarriesIO(group) {
			continue
		}
		for _, file := range group {
			named = append(named, impureIn(fset, file, reaching)...)
		}
	}
	slices.Sort(named)
	return named
}

// The functions of one file that call an outside name and carry no marker. [[spec/design_output/model#the-guards-hold-a-baseline]]
func impureIn(fset *token.FileSet, file *ast.File, reaching map[string]bool) []string {
	imported := map[string]string{}
	for _, spec := range file.Imports {
		at, err := strconv.Unquote(spec.Path.Value)
		if err != nil {
			continue
		}
		imported[localName(spec, at)] = at
	}
	name := fset.Position(file.Package).Filename
	named := []string{}
	for _, decl := range file.Decls {
		fn, ok := decl.(*ast.FuncDecl)
		if !ok || fn.Body == nil || marksImpure(file, fn) || !reachesOutside(fn.Body, imported, reaching) {
			continue
		}
		named = append(named, name+" "+funcLabel(fn))
	}
	return named
}

// The name a file calls an import by. [[spec/design_output/model#the-guards-hold-a-baseline]]
func localName(spec *ast.ImportSpec, at string) string {
	if spec.Name != nil {
		return spec.Name.Name
	}
	parts := strings.Split(at, "/")
	if len(parts) > 1 && majorVersion.MatchString(parts[len(parts)-1]) {
		return parts[len(parts)-2]
	}
	return parts[len(parts)-1]
}

// Whether a body calls a member of an outside package, or an outside member. [[spec/design_output/model#the-guards-hold-a-baseline]]
func reachesOutside(body *ast.BlockStmt, imported map[string]string, reaching map[string]bool) bool {
	found := false
	ast.Inspect(body, func(node ast.Node) bool {
		call, ok := node.(*ast.CallExpr)
		if found || !ok {
			return !found
		}
		sel, ok := call.Fun.(*ast.SelectorExpr)
		if !ok {
			return true
		}
		owner, ok := sel.X.(*ast.Ident)
		if !ok {
			return true
		}
		if at, ok := imported[owner.Name]; ok && (reaching[at] || reaching[at+"."+sel.Sel.Name]) {
			found = true
		}
		return !found
	})
	return found
}

// Whether the function's doc, or a comment inside its body, carries the marker. [[spec/design_output/model#the-guards-hold-a-baseline]]
func marksImpure(file *ast.File, fn *ast.FuncDecl) bool {
	if fn.Doc != nil && strings.Contains(fn.Doc.Text(), impureMarker) {
		return true
	}
	for _, group := range file.Comments {
		if group.Pos() > fn.Body.Lbrace && group.End() < fn.Body.Rbrace && strings.Contains(group.Text(), impureMarker) {
			return true
		}
	}
	return false
}

// A function's name, or its receiver's type and its name for a method. [[spec/design_output/model#the-guards-hold-a-baseline]]
func funcLabel(fn *ast.FuncDecl) string {
	if fn.Recv == nil || len(fn.Recv.List) == 0 {
		return fn.Name.Name
	}
	typ := fn.Recv.List[0].Type
	if star, ok := typ.(*ast.StarExpr); ok {
		typ = star.X
	}
	if index, ok := typ.(*ast.IndexExpr); ok {
		typ = index.X
	}
	if index, ok := typ.(*ast.IndexListExpr); ok {
		typ = index.X
	}
	if ident, ok := typ.(*ast.Ident); ok {
		return ident.Name + "." + fn.Name.Name
	}
	return fn.Name.Name
}

// The purity guard over the tracked files: each Go file outside the tests, parsed whole. [[spec/design_output/model#the-guards-hold-a-baseline]]
func purityTracked(tracked []string, read func(path string) string) []string {
	fset := token.NewFileSet()
	files := []*ast.File{}
	for _, one := range tracked {
		if !strings.HasSuffix(one, ".go") || strings.HasSuffix(one, testFile) {
			continue
		}
		file, err := parser.ParseFile(fset, one, read(one), parser.ParseComments)
		if err != nil {
			continue
		}
		files = append(files, file)
	}
	return ImpureFunctions(fset, files)
}
