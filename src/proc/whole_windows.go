//go:build windows

// The run's end runs taskkill over its tree, since Windows keeps no process group a kill reaches.
// [[spec/tickets/the-check-ends-what-it-drops]]
package proc

import (
	"os/exec" // level0: OutsideInDoors - this file is the process door's ending
	"strconv"
)

// Readies a run so the end of its context ends it with every process it started. [[spec/tickets/the-check-ends-what-it-drops]]
func Whole(run *exec.Cmd) {
	run.Cancel = func() error {
		return exec.Command("taskkill", "/T", "/F", "/PID", strconv.Itoa(run.Process.Pid)).Run()
	}
}
