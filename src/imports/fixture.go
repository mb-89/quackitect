// The fixture guard: a top-level Go test building a fixture outside the home.
// [[spec/design_output/model#the-guards-hold-a-baseline]]
package imports

import (
	"go/ast"
	"go/parser"
	"go/token"
	"path"
	"slices"
	"strings"
)

// The calls that build a fixture, by the package or receiver they hang off, where any receiver builds under "". [[spec/design_output/model#the-guards-hold-a-baseline]]
var fixtureCalls = map[string][]string{
	"":      {"TempDir", "MkdirTemp"},
	"exec":  {"Command", "CommandContext"},
	"index": {"Run", "Serve", "StartBus"},
}

// The fixture home: a package's main_test.go, and the shared test package. [[spec/design_output/model#the-guards-hold-a-baseline]]
const (
	homeFile   = "main_test.go"
	homeFolder = "src/q/qtest/"
)

// The marker sparing a fixture build outside the home, with its reason. [[spec/design_output/model#the-guards-hold-a-baseline]]
const fixtureMarker = "level0: FixtureOutsideHome - "

// Each top-level test reaching a fixture build outside the home, as its file and its name, sorted. [[spec/design_output/model#the-guards-hold-a-baseline]]
func FixtureBuilds(fset *token.FileSet, files []*ast.File) []string {
	byFolder := map[string][]*ast.File{}
	for _, file := range files {
		name := fset.Position(file.Package).Filename
		byFolder[path.Dir(name)] = append(byFolder[path.Dir(name)], file)
	}
	named := []string{}
	for _, group := range byFolder {
		named = append(named, buildsIn(fset, group)...)
	}
	slices.Sort(named)
	return named
}

// Whether a file stands in the fixture home. [[spec/design_output/model#the-guards-hold-a-baseline]]
func homed(name string) bool {
	return path.Base(name) == homeFile || strings.HasPrefix(name, homeFolder)
}

// The tests of one package that reach a build outside the home, through their own body or a helper of the package. [[spec/design_output/model#the-guards-hold-a-baseline]]
func buildsIn(fset *token.FileSet, files []*ast.File) []string {
	marked := map[token.Position]bool{}
	helpers := map[string]*ast.FuncDecl{}
	type test struct {
		file string
		fn   *ast.FuncDecl
	}
	tests := []test{}
	for _, file := range files {
		name := fset.Position(file.Package).Filename
		for _, group := range file.Comments {
			if strings.Contains(group.Text(), fixtureMarker) {
				marked[lineOf(fset, group.Pos())] = true
			}
		}
		for _, decl := range file.Decls {
			fn, ok := decl.(*ast.FuncDecl)
			if !ok || fn.Body == nil || fn.Recv != nil {
				continue
			}
			if homed(name) {
				helpers[fn.Name.Name] = nil
				continue
			}
			helpers[fn.Name.Name] = fn
			if strings.HasPrefix(fn.Name.Name, testPrefix) && fn.Name.Name != "TestMain" && takesT(fn) {
				tests = append(tests, test{name, fn})
			}
		}
	}
	// A call on a marked line builds nothing, since its comment carries the reason. [[spec/design_output/model#the-guards-hold-a-baseline]]
	builds := func(call *ast.CallExpr) bool {
		return !marked[lineOf(fset, call.Pos())] && buildsFixture(call)
	}
	reaches := map[string]bool{}
	var reach func(name string, seen map[string]bool) bool
	reach = func(name string, seen map[string]bool) bool {
		fn := helpers[name]
		if fn == nil || seen[name] {
			return false
		}
		if known, ok := reaches[name]; ok {
			return known
		}
		seen[name] = true
		found := false
		local := locals(fn)
		ast.Inspect(fn.Body, func(node ast.Node) bool {
			call, ok := node.(*ast.CallExpr)
			if found || !ok {
				return !found
			}
			if builds(call) {
				found = true
			} else if ident, ok := call.Fun.(*ast.Ident); ok && !local[ident.Name] && reach(ident.Name, seen) {
				found = true
			}
			return !found
		})
		reaches[name] = found
		return found
	}
	named := []string{}
	for _, one := range tests {
		if one.fn.Doc != nil && strings.Contains(one.fn.Doc.Text(), fixtureMarker) {
			continue
		}
		if reach(one.fn.Name.Name, map[string]bool{}) {
			named = append(named, one.file+" "+one.fn.Name.Name)
		}
	}
	return named
}

// The names a function binds itself, its parameters and its variables, so a call on one reaches no helper of the package. [[spec/tickets/fixture-guard-matches-by-bare]]
func locals(fn *ast.FuncDecl) map[string]bool {
	bound := map[string]bool{}
	bind := func(names []*ast.Ident) {
		for _, one := range names {
			bound[one.Name] = true
		}
	}
	ast.Inspect(fn, func(node ast.Node) bool {
		switch it := node.(type) {
		case *ast.Field:
			bind(it.Names)
		case *ast.ValueSpec:
			bind(it.Names)
		case *ast.AssignStmt:
			if it.Tok == token.DEFINE {
				for _, left := range it.Lhs {
					if ident, ok := left.(*ast.Ident); ok {
						bound[ident.Name] = true
					}
				}
			}
		}
		return true
	})
	return bound
}

// The file and line a position stands on, so a marker spares its own file's line alone. [[spec/design_output/model#the-guards-hold-a-baseline]]
func lineOf(fset *token.FileSet, at token.Pos) token.Position {
	position := fset.Position(at)
	return token.Position{Filename: position.Filename, Line: position.Line}
}

// Whether a call builds a fixture: a temporary folder, a process, or an index start. [[spec/design_output/model#the-guards-hold-a-baseline]]
func buildsFixture(call *ast.CallExpr) bool {
	sel, ok := call.Fun.(*ast.SelectorExpr)
	if !ok {
		return false
	}
	if slices.Contains(fixtureCalls[""], sel.Sel.Name) {
		return true
	}
	owner, ok := sel.X.(*ast.Ident)
	return ok && slices.Contains(fixtureCalls[owner.Name], sel.Sel.Name)
}

// The fixture guard over the tracked files: each Go test file parsed whole. [[spec/design_output/model#the-guards-hold-a-baseline]]
func fixturesTracked(tracked []string, read func(path string) string) []string {
	fset := token.NewFileSet()
	files := []*ast.File{}
	for _, one := range tracked {
		if !strings.HasSuffix(one, "_test.go") {
			continue
		}
		file, err := parser.ParseFile(fset, one, read(one), parser.ParseComments)
		if err != nil {
			continue
		}
		files = append(files, file)
	}
	return FixtureBuilds(fset, files)
}

// The package a fixture offender stands in: the folder of its file. [[spec/design_output/model#the-guards-hold-a-baseline]]
func fixturePackage(offender string) string {
	file, _, _ := strings.Cut(offender, " ")
	return path.Dir(file)
}
