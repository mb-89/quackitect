// The calls a test makes that wait on the box: a sleep on the wall clock, or a
// spawned process, which a door test alone makes.
// [[spec/guidance/code/testing]]
package imports

import (
	"go/ast"
	"path"
	"regexp"
	"slices"
	"sort"
	"strconv"
	"strings"
)

// The calls that wait on the box, by the path of the package each stands in. [[spec/guidance/code/testing]]
var realWaits = map[string][]string{
	"time":    {"Sleep"},
	"os/exec": {"Command", "CommandContext"},
	"os":      {"StartProcess"},
}

// A code span in the door audit naming a Go test file, or a glob of them. [[spec/design_output/doors#one-contract-test-per-door]]
var auditedTest = regexp.MustCompile("`([^`]+_test\\.go)`")

// Every call in the file that waits on the box, as package.Func, in the order the file makes them. [[spec/tickets/the-testing-rules-name-the-doors]]
func RealWaits(file *ast.File) []string {
	named := map[string]string{}
	for _, spec := range file.Imports {
		at, err := strconv.Unquote(spec.Path.Value)
		if err != nil || realWaits[at] == nil {
			continue
		}
		name := path.Base(at)
		if spec.Name != nil {
			name = spec.Name.Name
		}
		named[name] = at
	}
	found := []string{}
	ast.Inspect(file, func(node ast.Node) bool {
		call, ok := node.(*ast.CallExpr)
		if !ok {
			return true
		}
		sel, ok := call.Fun.(*ast.SelectorExpr)
		if !ok {
			return true
		}
		pkg, ok := sel.X.(*ast.Ident)
		if !ok {
			return true
		}
		if at, ok := named[pkg.Name]; ok && slices.Contains(realWaits[at], sel.Sel.Name) {
			found = append(found, path.Base(at)+"."+sel.Sel.Name)
		}
		return true
	})
	return found
}

// Each test file, keyed by its path under the root, that waits on the box where no span of the audit matches it, as a line naming its waits. [[spec/tickets/the-testing-rules-name-the-doors]]
func UnauditedWaits(audit string, files map[string]*ast.File) []string {
	listed := []string{}
	for _, span := range auditedTest.FindAllStringSubmatch(audit, -1) {
		listed = append(listed, span[1])
	}
	named := []string{}
	for rel, file := range files {
		waits := RealWaits(file)
		if len(waits) > 0 && !slices.ContainsFunc(listed, func(glob string) bool { ok, _ := path.Match(glob, rel); return ok }) {
			named = append(named, rel+" calls "+strings.Join(waits, ", "))
		}
	}
	sort.Strings(named)
	return named
}
