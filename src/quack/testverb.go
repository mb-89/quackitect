// The test verb: the tests alone, or the test files and Go folders you name,
// which the branch's runner takes under the check's own tally.
// [[spec/design_output/pull#the-test-verb]]
package main

import (
	"fmt"
	"io"
	"path/filepath"
)

func init() { register("test", testVerb(checkDoorsOf, selfPath)) }

// The test verb over the doors: the test part where no word names a file, and branch test over the words where one does. [[spec/design_output/pull#the-test-verb]]
func testVerb(doorsOf func(out, errs io.Writer) checkDoors, self func() (string, error)) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		d := doorsOf(out, errs)
		if len(argv) < 2 {
			return testsRun(d, false)
		}
		quack, err := self()
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		tally, err := freshTally(d)
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		named := append([]string{quack, "verb", filepath.Join(d.root, "src", "scripts"), "branch", "test"}, argv[1:]...)
		code, _, err := d.run(named, []string{spawnsEnv + "=" + tally}, false)
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		return code
	}
}
