//go:build windows

// The run's end runs taskkill over its tree, since Windows keeps no process group a kill reaches.
// [[spec/tickets/the-check-ends-what-it-drops]]
package proc

import (
	"os/exec"
	"strconv"
)

// [[spec/tickets/the-check-ends-what-it-drops]]
func whole(run *exec.Cmd) {
	run.Cancel = func() error {
		return exec.Command("taskkill", "/T", "/F", "/PID", strconv.Itoa(run.Process.Pid)).Run()
	}
}
