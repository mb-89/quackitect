//go:build !windows

// The run stands in a process group of its own, and its end kills the group.
// [[spec/tickets/the-check-ends-what-it-drops]]
package proc

import (
	"os/exec"
	"syscall"
)

// [[spec/tickets/the-check-ends-what-it-drops]]
func whole(run *exec.Cmd) {
	if run.SysProcAttr == nil {
		run.SysProcAttr = &syscall.SysProcAttr{}
	}
	run.SysProcAttr.Setpgid = true
	run.Cancel = func() error { return syscall.Kill(-run.Process.Pid, syscall.SIGKILL) }
}
