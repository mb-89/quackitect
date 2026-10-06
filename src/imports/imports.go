// The import rules, as go/analysis analyzers: onlyq, ioonly, fakesuite and
// nomodule, each reading a package's flag off its q.IO() registration.
// [[spec/design_output/model#the-build-checks-imports]]
package imports

import (
	"fmt"
	"go/ast"
	"go/token"
	"io/fs"
	"os" // level0: OutsideInDoors - fakesuite and the declarations read the folders a package stands in, as a build check reads source
	"path/filepath"
	"slices"
	"strconv"
	"strings"
	"sync"

	"golang.org/x/tools/go/analysis"

	"quackitect/src/owns"
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
	from    func(string) bool
	to      func(path string, owned []string) bool
	says    string
	past    func(from, to string) bool
	flagged bool
	spare   func(pkg, file string) bool
}

var (
	noModule = rule{from: seesModules, to: func(path string, _ []string) bool { return isModule(path) }, says: "a module, a door, the index or a renderer imports no other module", past: ownModule}
	onlyQ    = rule{from: isModule, to: pastQ, says: "a module imports q, q/qtest and the pure standard library alone", flagged: true}
	ioOnly   = rule{from: isCore, to: reachesOut, says: "the core imports no package a door owns whole"}
	drawOnly = rule{from: isRenderer, to: reachesOut, says: "a renderer imports no package a door owns whole outside its door.go", spare: beside}
)

// The tree's own readers a module takes beside q, each importing the pure standard library alone, the one q rests on among them. [[spec/tickets/tickets-becomes-a-module]]
var pureTree = []string{module + "src/yaml", module + "src/ticket", module + "src/pointer", module + "src/note", module + "src/front"}

// The standard library packages past the pure library that no door owns whole, each with every package below it, per [[spec/design_output/model#the-build-checks-imports]].
var floor = []string{"io/fs", "io/ioutil", "database/sql", "syscall", "unsafe", "plugin", "log/syslog", "runtime/cgo"}

// Whether a package reaches the outside: a door owns it whole, or the floor holds it. [[spec/design_output/model#the-build-checks-imports]]
func impure(path string, owned []string) bool {
	if slices.Contains(owned, path) {
		return true
	}
	for _, one := range floor {
		if path == one || strings.HasPrefix(path, one+"/") {
			return true
		}
	}
	return false
}

var declared sync.Map

// The packages the declarations under the root own whole, read once a root. [[spec/design_output/model#the-build-checks-imports]]
func Owned(root string) []string {
	if held, ok := declared.Load(root); ok {
		return held.([]string)
	}
	texts := map[string]string{}
	_ = filepath.WalkDir(root, func(at string, entry fs.DirEntry, err error) error {
		if err != nil {
			return nil
		}
		if entry.IsDir() && at != root && (strings.HasPrefix(entry.Name(), ".") || entry.Name() == "node_modules") {
			return filepath.SkipDir
		}
		if rel, err := filepath.Rel(root, at); err == nil && !entry.IsDir() && owns.Declares(rel) {
			if text, err := os.ReadFile(at); err == nil {
				texts[filepath.ToSlash(rel)] = string(text)
			}
		}
		return nil
	})
	doors, _ := owns.Read(texts, func(rel string) bool {
		_, err := os.Stat(filepath.Join(root, filepath.FromSlash(rel)))
		return err == nil
	})
	held, _ := declared.LoadOrStore(root, owns.Whole(doors))
	return held.([]string)
}

// The folder the module stands in, off the first file of the pass and its package path, or empty. [[spec/design_output/model#the-build-checks-imports]]
func rootOf(pass *analysis.Pass) string {
	if len(pass.Files) == 0 {
		return ""
	}
	rel, ok := strings.CutPrefix(strings.TrimSuffix(pass.Pkg.Path(), "_test"), module)
	folder := filepath.Dir(pass.Fset.File(pass.Files[0].Pos()).Name())
	root, cut := strings.CutSuffix(folder, string(filepath.Separator)+filepath.FromSlash(rel))
	if !ok || !cut {
		return ""
	}
	return root
}

// The packages a door owns whole under the pass's root. [[spec/design_output/model#the-build-checks-imports]]
func ownedOf(pass *analysis.Pass) []string {
	if root := rootOf(pass); root != "" {
		return Owned(root)
	}
	return nil
}

var OnlyQ = &analysis.Analyzer{
	Name: "onlyq",
	Doc:  "a package under src/modules imports q, q/qtest and the pure standard library alone",
	Run:  onlyQ.run,
}

// [[spec/design_output/model#the-build-checks-imports]]
var IOOnly = &analysis.Analyzer{
	Name: "ioonly",
	Doc:  "the core imports no package a door owns whole, and a renderer none outside its door.go",
	Run: func(pass *analysis.Pass) (any, error) {
		if _, err := ioOnly.run(pass); err != nil {
			return nil, err
		}
		return drawOnly.run(pass)
	},
}

// The faults of a renderer package's files, which the tree test reads beside the analyzer. [[spec/design_output/model#the-build-checks-imports]]
func RendererFaults(pkg string, fset *token.FileSet, files []*ast.File, owned []string) []string {
	out := []string{}
	for _, file := range files {
		if drawOnly.spare(pkg, fset.File(file.Pos()).Name()) {
			continue
		}
		for _, spec := range file.Imports {
			if path, err := strconv.Unquote(spec.Path.Value); err == nil {
				if fault := drawOnly.fault(pkg, path, owned); fault != "" {
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
func Faults(from string, imported, owned []string) []string {
	return FaultsIn(from, imported, owned, false)
}

// The faults of a package, against the packages a door owns whole, where io says its registration carries q.IO(), which onlyq lets pass. [[spec/design_output/model#the-build-checks-imports]]
func FaultsIn(from string, imported, owned []string, io bool) []string {
	out := []string{}
	for _, one := range []rule{noModule, onlyQ, ioOnly} {
		if one.flagged && io {
			continue
		}
		for _, path := range imported {
			if fault := one.fault(from, path, owned); fault != "" {
				out = append(out, fault)
			}
		}
	}
	return out
}

func (one rule) fault(from, path string, owned []string) string {
	if !one.from(from) || !one.to(path, owned) || (one.past != nil && one.past(from, path)) {
		return ""
	}
	return fmt.Sprintf("%s imports %s: %s", from, path, one.says)
}

// A package's generated test main reads as no package, so its imports name nothing. [[spec/design_output/model#the-build-checks-imports]]
func (one rule) run(pass *analysis.Pass) (any, error) {
	if strings.HasSuffix(pass.Pkg.Path(), testMain) || (one.flagged && CarriesIO(pass.Files)) {
		return nil, nil
	}
	owned := ownedOf(pass)
	for _, file := range pass.Files {
		if one.spare != nil && one.spare(pass.Pkg.Path(), pass.Fset.File(file.Pos()).Name()) {
			continue
		}
		for _, spec := range file.Imports {
			path, err := strconv.Unquote(spec.Path.Value)
			if err != nil {
				continue
			}
			if fault := one.fault(pass.Pkg.Path(), path, owned); fault != "" {
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

func reachesOut(path string, owned []string) bool {
	return slices.Contains(owned, path)
}

// A module path falls to nomodule, so one import names one fault. [[spec/tickets/the-wiring-file-binds-ports]]
func pastQ(path string, owned []string) bool {
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
	return impure(path, owned)
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
