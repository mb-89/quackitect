// example run: one example against the real system, in a clone of the tree
// under the runtime folder, each step its own process, each verdict printed.
// [[spec/design_output/examples#one-runner-two-drivers]]
package main

import (
	"fmt"
	"io"
	"path/filepath"
	"strings"

	"quackitect/src/example"
	"quackitect/src/index"
	"quackitect/src/proc"
)

func init() { register("example", exampleVerb(index.Root, realDisk(), proc.Real, enterOnTerminal)) }

// The folder under the runtime folder holding each example's clone, and the script each step calls. [[spec/design_output/examples#one-runner-two-drivers]]
const (
	examplesFolder = "examples"
	runmeScript    = "./RUNME.sh"
	// [[spec/design_output/examples#one-runner-two-drivers]]
	runWords = 3
)

// The example verb over its root, its disk, its runner and the pause between steps. [[spec/design_output/examples#one-runner-two-drivers]]
func exampleVerb(rootOf func() (string, error), disk diskDoors, run proc.Runner, pause func()) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		if len(argv) != runWords || argv[1] != "run" {
			fmt.Fprintln(errs, "example takes run and the example's path: ./RUNME.sh example run spec/examples/110_tickets/pull.md")
			return exitUsage
		}
		root, err := rootOf()
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		path := filepath.ToSlash(argv[2])
		text, err := disk.read(filepath.Join(root, filepath.FromSlash(path)))
		if err != nil {
			fmt.Fprintf(errs, "%s stands nowhere under the tree: %v\n", path, err)
			return exitFailed
		}
		read, faults := example.Read(path, string(text))
		if len(faults) > 0 {
			fmt.Fprintf(errs, "%s: line %d: %s\n", path, faults[0].Line, faults[0].Message)
			return exitFailed
		}
		clone := filepath.Join(root, filepath.FromSlash(index.Runtime), examplesFolder, strings.TrimSuffix(filepath.Base(path), ".md"))
		if err := disk.removeAll(clone); err != nil {
			fmt.Fprintf(errs, "the last clone at %s stays: %v\n", clone, err)
			return exitFailed
		}
		if said := run(proc.Command{Argv: []string{"git", "clone", "--local", "--quiet", root, clone}}); said.Code != 0 {
			fmt.Fprintf(errs, "the clone into %s fails: %s%s", clone, said.Out, said.Err)
			return exitFailed
		}
		fmt.Fprintf(out, "%s runs in %s, and the clone stays for you to read.\n", path, clone)
		reads := func(at string) (string, bool) {
			body, err := disk.read(filepath.Join(clone, filepath.FromSlash(at)))
			return string(body), err == nil
		}
		code := 0
		for n, step := range read.Steps {
			if n > 0 {
				pause()
			}
			fmt.Fprintf(out, "\n%s\n$ %s %s\n", step.Prose, runmeScript, strings.Join(step.Call, " "))
			said := run(proc.Command{Argv: append([]string{runmeScript}, step.Call...), Dir: clone})
			fmt.Fprint(out, said.Out, said.Err)
			for _, one := range step.Expects {
				line := expectLine(one)
				if miss := example.Holds(one, example.Outcome{Code: said.Code, Out: said.Out + said.Err}, reads); miss != "" {
					fmt.Fprintf(out, "  miss  %s: %s\n", line, miss)
					code = exitFailed
				} else {
					fmt.Fprintf(out, "  holds %s\n", line)
				}
			}
		}
		return code
	}
}

// An expect line as the example writes it, its phrase in quotes. [[spec/design_output/examples#the-format]]
func expectLine(one example.Expect) string {
	words := append([]string{}, one.Words...)
	if one.Form == "says" || one.Form == "quiet" {
		words[0] = fmt.Sprintf("%q", words[0])
	}
	return strings.Join(append([]string{one.Form}, words...), " ")
}
