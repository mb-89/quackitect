//go:build !windows

package alive

import (
	"os"
	"syscall"
)

// Signal zero asks whether a process is there without telling it anything.
func Is(pid int) bool {
	p, err := os.FindProcess(pid)
	if err != nil {
		return false
	}
	return p.Signal(syscall.Signal(0)) == nil
}
