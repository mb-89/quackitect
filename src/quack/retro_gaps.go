// The retro's counts on examples: each verb no example shows, and each
// test standing beside a verb an example shows, for the audit to read.
// [[spec/guidance/retro/audit]]
package main

import (
	"fmt"
	"io"
	"regexp"
	"slices"
	"strings"

	"quackitect/src/modules/check"
)

// A Go test function, by its name. [[spec/guidance/retro/audit]]
var testFuncAt = regexp.MustCompile(`(?m)^func (Test\w+)\(`)

func init() {
	register("retro gaps", retroGapsVerb(func() *check.Tree { return lintTree(retroRoot()) }))
}

// The verb: both counts, each item one a line, at exit 0, since each item is a candidate the auditor weighs. [[spec/guidance/retro/audit]]
func retroGapsVerb(treeOf func() *check.Tree) twin {
	return func(_ []string, _ bool, out, _ io.Writer) int {
		tree := treeOf()
		unshown := []string{}
		for _, one := range check.ExampleCovers(tree) {
			call, _, _ := strings.Cut(one.Message, check.UnshownSays)
			unshown = append(unshown, fmt.Sprintf("%s  %s:%d", call, one.File, one.Line))
		}
		fmt.Fprintf(out, "%d feature(s) stand with no example:\n", len(unshown))
		for _, line := range unshown {
			fmt.Fprintln(out, "  "+line)
		}
		beside := testsBesideShown(tree)
		fmt.Fprintf(out, "%d test(s) stand beside a verb an example shows:\n", len(beside))
		for _, line := range beside {
			fmt.Fprintln(out, "  "+line)
		}
		return 0
	}
}

// Each test function in the test file beside a quack file registering a verb an example shows, as the file and the name, sorted. [[spec/guidance/retro/audit]]
func testsBesideShown(tree *check.Tree) []string {
	shown, paths := check.ShownNames(tree), tree.Paths()
	out := []string{}
	for _, path := range paths {
		name, inQuack := strings.CutPrefix(path, "src/quack/")
		if !inQuack || strings.Contains(name, "/") || !strings.HasSuffix(name, ".go") || strings.HasSuffix(name, "_test.go") {
			continue
		}
		beside := strings.TrimSuffix(path, ".go") + "_test.go"
		if !slices.Contains(paths, beside) || !slices.ContainsFunc(check.Registered(tree.Read(path)), func(verb string) bool { return shown[verb] }) {
			continue
		}
		for _, found := range testFuncAt.FindAllStringSubmatch(tree.Read(beside), -1) {
			out = append(out, beside+" "+found[1])
		}
	}
	slices.Sort(out)
	return slices.Compact(out)
}
