// The import rules, as go/analysis analyzers: onlyq, ioonly, fakesuite and
// nomodule, each reading a package's flag off its q.IO() registration.
// [[spec/design_output/model#the-build-checks-imports]]
package imports

import (
	"fmt"
	"go/ast"
	"go/token"
	"os" // level0: OutsideInDoors - fakesuite reads the folder a package stands in, as a build check reads source
	"path/filepath"
	"strconv"
	"strings"

	"golang.org/x/tools/go/analysis"
)

// The generated main of a package's tests, which no rule reads, and the files naming a suite. [[spec/design_output/model#the-build-checks-imports]]
const (
	testMain     = ".test"
	testFile     = "_test.go"
	contractFile = "_contract_test.go"
	fakePrefix   = "Fake"
	qtestPath    = module + "src/q/qtest"
	qtestSuite   = "suite.go"
)

const module = "quackitect/"

// The renderers, per [[spec/design_output/migration]].
var renderers = []string{"src/tui/frame", "src/tui/tree"}

type rule struct {
	from, to func(string) bool
	says     string
	past     func(from, to string) bool
	flagged  bool
	spare    func(pkg, file string) bool
}

var (
	noModule = rule{from: seesModules, to: isModule, says: "a module, a door, the index or a renderer imports no other module", past: ownModule}
	onlyQ    = rule{from: isModule, to: pastQ, says: "a module imports q, q/qtest and the pure standard library alone", flagged: true}
	ioOnly   = rule{from: isCore, to: reachesOut, says: "the core imports no os, os/exec, net or net/http"}
	drawOnly = rule{from: isRenderer, to: reachesOut, says: "a renderer imports no os, os/exec, net or net/http outside its door.go", spare: beside}
)

// The imports ioonly refuses, per [[spec/design_output/model#the-build-checks-imports]].
var outside = []string{"os", "os/exec", "net", "net/http"}

// The tree's own readers a module takes beside q, each importing the pure standard library alone, the one q rests on among them. [[spec/tickets/tickets-becomes-a-module]]
var pureTree = []string{module + "src/yaml", module + "src/ticket", module + "src/pointer", module + "src/note"}

// The standard library packages that reach the outside, per [[spec/design_output/model#the-build-checks-imports]].
var impure = []string{"os", "io/fs", "io/ioutil", "net", "database/sql", "syscall", "unsafe", "plugin", "log/syslog", "runtime/cgo"}

var OnlyQ = &analysis.Analyzer{
	Name: "onlyq",
	Doc:  "a package under src/modules imports q, q/qtest and the pure standard library alone",
	Run:  onlyQ.run,
}

// [[spec/design_output/model#the-build-checks-imports]]
var IOOnly = &analysis.Analyzer{
	Name: "ioonly",
	Doc:  "the core imports no os, os/exec, net or net/http, and a renderer none outside its door.go",
	Run: func(pass *analysis.Pass) (any, error) {
		if _, err := ioOnly.run(pass); err != nil {
			return nil, err
		}
		return drawOnly.run(pass)
	},
}

// The faults of a renderer package's files, which the tree test reads beside the analyzer. [[spec/design_output/model#the-build-checks-imports]]
func RendererFaults(pkg string, fset *token.FileSet, files []*ast.File) []string {
	out := []string{}
	for _, file := range files {
		if drawOnly.spare(pkg, fset.File(file.Pos()).Name()) {
			continue
		}
		for _, spec := range file.Imports {
			if path, err := strconv.Unquote(spec.Path.Value); err == nil {
				if fault := drawOnly.fault(pkg, path); fault != "" {
					out = append(out, fault)
				}
			}
		}
	}
	return out
}

// [[spec/design_output/model#the-build-checks-imports]]
var FakeSuite = &analysis.Analyzer{
	Name: "fakesuite",
	Doc:  "a package declaring a fake keeps a contract suite beside it",
	Run:  fakeSuite,
}

func fakeSuite(pass *analysis.Pass) (any, error) {
	if strings.HasSuffix(pass.Pkg.Path(), testMain) {
		return nil, nil
	}
	for _, fault := range SuiteFaults(pass.Pkg.Path(), pass.Fset, pass.Files) {
		pass.Reportf(fault.at, "%s", fault.says)
	}
	return nil, nil
}

// A fake the package declares with no suite beside it, and where it stands. [[spec/design_output/model#the-build-checks-imports]]
type SuiteFault struct {
	at   token.Pos
	says string
}

func (one SuiteFault) String() string { return one.says }

// Every fake the package's own files declare with no contract suite in its folder, and q/qtest with no suite.go. [[spec/design_output/model#the-build-checks-imports]]
func SuiteFaults(path string, fset *token.FileSet, files []*ast.File) []SuiteFault {
	var own []*ast.File
	for _, file := range files {
		if !strings.HasSuffix(fset.Position(file.Package).Filename, testFile) {
			own = append(own, file)
		}
	}
	if len(own) == 0 {
		return nil
	}
	folder := filepath.Dir(fset.Position(own[0].Package).Filename)
	if path == qtestPath {
		if _, err := os.Stat(filepath.Join(folder, qtestSuite)); err != nil {
			return []SuiteFault{{own[0].Package, fmt.Sprintf("%s keeps no %s beside its fake", path, qtestSuite)}}
		}
		return nil
	}
	if suiteIn(folder) {
		return nil
	}
	var out []SuiteFault
	for _, file := range own {
		for _, decl := range file.Decls {
			for _, one := range fakesIn(decl) {
				out = append(out, SuiteFault{one.Pos(), fmt.Sprintf("%s declares %s with no contract suite beside it", path, one.Name)})
			}
		}
	}
	return out
}

// The top-level types and functions whose name opens with Fake. [[spec/design_output/model#the-build-checks-imports]]
func fakesIn(decl ast.Decl) []*ast.Ident {
	var out []*ast.Ident
	switch one := decl.(type) {
	case *ast.FuncDecl:
		if one.Recv == nil && strings.HasPrefix(one.Name.Name, fakePrefix) {
			out = append(out, one.Name)
		}
	case *ast.GenDecl:
		for _, spec := range one.Specs {
			if named, ok := spec.(*ast.TypeSpec); ok && strings.HasPrefix(named.Name.Name, fakePrefix) {
				out = append(out, named.Name)
			}
		}
	}
	return out
}

// Whether a file of the folder ends in _contract_test.go. [[spec/design_output/model#the-fake-keeps-a-contract]]
func suiteIn(folder string) bool {
	found, err := os.ReadDir(folder)
	if err != nil {
		return false
	}
	for _, one := range found {
		if strings.HasSuffix(one.Name(), contractFile) {
			return true
		}
	}
	return false
}

// The one nomodule rule, which analyzers-read-the-io-flag reuses. [[spec/tickets/the-wiring-file-binds-ports]]
var NoModule = &analysis.Analyzer{
	Name: "nomodule",
	Doc:  "a module, a door, the index or a renderer imports no package under src/modules past its own",
	Run:  noModule.run,
}

// [[spec/design_output/model#the-build-checks-imports]]
func Faults(from string, imported []string) []string {
	return FaultsIn(from, imported, false)
}

// The faults of a package, where io says its registration carries q.IO(), which onlyq lets pass. [[spec/design_output/model#the-build-checks-imports]]
func FaultsIn(from string, imported []string, io bool) []string {
	out := []string{}
	for _, one := range []rule{noModule, onlyQ, ioOnly} {
		if one.flagged && io {
			continue
		}
		for _, path := range imported {
			if fault := one.fault(from, path); fault != "" {
				out = append(out, fault)
			}
		}
	}
	return out
}

func (one rule) fault(from, path string) string {
	if !one.from(from) || !one.to(path) || (one.past != nil && one.past(from, path)) {
		return ""
	}
	return fmt.Sprintf("%s imports %s: %s", from, path, one.says)
}

// A package's generated test main reads as no package, so its imports name nothing. [[spec/design_output/model#the-build-checks-imports]]
func (one rule) run(pass *analysis.Pass) (any, error) {
	if strings.HasSuffix(pass.Pkg.Path(), testMain) || (one.flagged && CarriesIO(pass.Files)) {
		return nil, nil
	}
	for _, file := range pass.Files {
		if one.spare != nil && one.spare(pass.Pkg.Path(), pass.Fset.File(file.Pos()).Name()) {
			continue
		}
		for _, spec := range file.Imports {
			path, err := strconv.Unquote(spec.Path.Value)
			if err != nil {
				continue
			}
			if fault := one.fault(pass.Pkg.Path(), path); fault != "" {
				pass.Reportf(spec.Pos(), "%s", fault)
			}
		}
	}
	return nil, nil
}

// Whether a file of the package calls q.IO(), the flag of an IO module. [[spec/design_output/model#io-modules-are-modules]]
func CarriesIO(files []*ast.File) bool {
	found := false
	for _, file := range files {
		ast.Inspect(file, func(node ast.Node) bool {
			call, ok := node.(*ast.CallExpr)
			if !ok || found {
				return !found
			}
			if pick, ok := call.Fun.(*ast.SelectorExpr); ok && pick.Sel.Name == "IO" {
				if named, ok := pick.X.(*ast.Ident); ok && named.Name == "q" {
					found = true
				}
			}
			return !found
		})
	}
	return found
}

func under(path, folder string) bool {
	rel, ok := strings.CutPrefix(path, module)
	return ok && (rel == folder || strings.HasPrefix(rel, folder+"/"))
}

func isModule(path string) bool { return under(path, "src/modules") }
func isDoor(path string) bool   { return under(path, "src/doors") }

// The core ioonly holds. [[spec/design_output/model#the-build-checks-imports]]
func isCore(path string) bool { return under(path, "src/q") }

// The window's packages, which reach the outside through a door.go alone. [[spec/design_output/model#the-build-checks-imports]]
func isRenderer(path string) bool { return under(path, "src/tui") }

// A renderer's door and its tests stand beside the rule. [[spec/design_output/model#the-build-checks-imports]]
func beside(_, file string) bool {
	name := filepath.Base(file)
	return name == "door.go" || strings.HasSuffix(name, testFile)
}

func reachesOut(path string) bool {
	for _, one := range outside {
		if path == one {
			return true
		}
	}
	return false
}

// A module path falls to nomodule, so one import names one fault. [[spec/tickets/the-wiring-file-binds-ports]]
func pastQ(path string) bool {
	if path == module+"src/q" || path == module+"src/q/qtest" || isDoor(path) || isModule(path) {
		return false
	}
	for _, one := range pureTree {
		if path == one {
			return false
		}
	}
	first, _, _ := strings.Cut(path, "/")
	if strings.Contains(first, ".") || strings.HasPrefix(path, module) {
		return true
	}
	for _, one := range impure {
		if path == one || strings.HasPrefix(path, one+"/") {
			return true
		}
	}
	return false
}

// A package importing another module breaks nomodule. [[spec/tickets/the-wiring-file-binds-ports]]
func seesModules(path string) bool {
	if isModule(path) || isDoor(path) || under(path, "src/index") {
		return true
	}
	for _, one := range renderers {
		if under(path, one) {
			return true
		}
	}
	return false
}

// A module's own package, its external test and its folders below stand past nomodule. [[spec/tickets/the-wiring-file-binds-ports]]
func ownModule(from, to string) bool {
	from = strings.TrimSuffix(from, "_test")
	return to == from || strings.HasPrefix(to, from+"/")
}
