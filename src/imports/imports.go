// The import rules, as go/analysis analyzers: a module imports no door, and a
// door, the index or a renderer imports no module.
// [[spec/design_output/go-doors#the-build-checks-imports]]
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
}

var (
	noDoor = rule{isModule, isDoor, "a module imports no door"}
	noName = rule{seesNames, isModule, "a door, the index or a renderer imports no module"}
)

var NoDoor = &analysis.Analyzer{
	Name: "nodoor",
	Doc:  "a package under src/modules imports no package under src/doors",
	Run:  noDoor.run,
}

var NoName = &analysis.Analyzer{
	Name: "noname",
	Doc:  "a door, the index or a renderer imports no package under src/modules",
	Run:  noName.run,
}

// [[spec/design_output/go-doors#the-build-checks-imports]]
func Faults(from string, imported []string) []string {
	out := []string{}
	for _, one := range []rule{noDoor, noName} {
		for _, path := range imported {
			if fault := one.fault(from, path); fault != "" {
				out = append(out, fault)
			}
		}
	}
	return out
}

func (one rule) fault(from, path string) string {
	if !one.from(from) || !one.to(path) {
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

func seesNames(path string) bool {
	if isDoor(path) || under(path, "src/index") {
		return true
	}
	for _, one := range renderers {
		if under(path, one) {
			return true
		}
	}
	return false
}
