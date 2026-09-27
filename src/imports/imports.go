// The import rules, as go/analysis analyzers: a module imports no door, and a
// module, a door, the index or a renderer imports no other module.
// [[spec/design_output/model#the-build-checks-imports]]
package imports

import (
	"fmt"
	"strconv"
	"strings"

	"golang.org/x/tools/go/analysis"
)

const module = "quackitect/"

// The renderers, per [[spec/design_output/migration]].
var renderers = []string{"src/tui/frame", "src/tui/tree"}

type rule struct {
	from, to func(string) bool
	says     string
	past     func(from, to string) bool
}

var (
	noDoor   = rule{from: isModule, to: isDoor, says: "a module imports no door"}
	noModule = rule{from: seesModules, to: isModule, says: "a module, a door, the index or a renderer imports no other module", past: ownModule}
	onlyQ    = rule{from: isModule, to: pastQ, says: "a module imports q, q/qtest and the pure standard library alone"}
)

// The standard library packages that reach the outside, per [[spec/design_output/model#the-build-checks-imports]].
var impure = []string{"os", "io/fs", "io/ioutil", "net", "database/sql", "syscall", "unsafe", "plugin", "log/syslog", "runtime/cgo"}

var NoDoor = &analysis.Analyzer{
	Name: "nodoor",
	Doc:  "a package under src/modules imports no package under src/doors",
	Run:  noDoor.run,
}

var OnlyQ = &analysis.Analyzer{
	Name: "onlyq",
	Doc:  "a package under src/modules imports q, q/qtest and the pure standard library alone",
	Run:  onlyQ.run,
}

// The one nomodule rule, which analyzers-read-the-io-flag reuses. [[spec/tickets/the-wiring-file-binds-ports]]
var NoModule = &analysis.Analyzer{
	Name: "nomodule",
	Doc:  "a module, a door, the index or a renderer imports no package under src/modules past its own",
	Run:  noModule.run,
}

// [[spec/design_output/model#the-build-checks-imports]]
func Faults(from string, imported []string) []string {
	out := []string{}
	for _, one := range []rule{noDoor, noModule, onlyQ} {
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

func (one rule) run(pass *analysis.Pass) (any, error) {
	for _, file := range pass.Files {
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

func under(path, folder string) bool {
	rel, ok := strings.CutPrefix(path, module)
	return ok && (rel == folder || strings.HasPrefix(rel, folder+"/"))
}

func isModule(path string) bool { return under(path, "src/modules") }
func isDoor(path string) bool   { return under(path, "src/doors") }

// A module path falls to nomodule, so one import names one fault. [[spec/tickets/the-wiring-file-binds-ports]]
func pastQ(path string) bool {
	if path == module+"src/q" || path == module+"src/q/qtest" || isDoor(path) || isModule(path) {
		return false
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
