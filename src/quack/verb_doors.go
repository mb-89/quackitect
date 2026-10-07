// The doors verb: every door, and the contract test that holds it.
// [[spec/guidance/code/testing]]
package main

import (
	"fmt"
	"io"
	"strings"

	"quackitect/src/index"
)

// Where the doors and their contract tests stand. [[spec/design_output/doors#one-contract-test-per-door]]
const (
	doorsFolder    = "src/doors"
	contractFolder = "test/contract"
)

func init() { register("doors", doorsVerb(index.Root)) }

// doors over the root: each door under src/doors with no contract test named, or the count where each holds one. [[spec/design_output/doors#one-contract-test-per-door]]
func doorsVerb(root func() (string, error)) twin {
	return func(_ []string, _ bool, out, errs io.Writer) int {
		at, err := root()
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		disk := rootDisk{at}
		held := map[string]bool{}
		for _, name := range disk.Names(contractFolder) {
			if test, ok := strings.CutSuffix(name, ".test.js"); ok {
				held[test] = true
			}
		}
		doors, missing := 0, 0
		for _, name := range disk.Names(doorsFolder) {
			door, ok := strings.CutSuffix(name, ".js")
			if !ok {
				continue
			}
			doors++
			if !held[door] {
				missing++
				fmt.Fprintf(errs, "%s/%s.js has no %s/%s.test.js.\n", doorsFolder, door, contractFolder, door)
			}
		}
		if missing > 0 {
			fmt.Fprintln(errs, "A door with no contract test lets its fake drift. Write one.")
			return exitFailed
		}
		fmt.Fprintf(out, "%d doors, and a contract test holds each one.\n", doors)
		return 0
	}
}
