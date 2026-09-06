//go:build !windows

package alive

import (
	"os"
	"strconv"
	"strings"
	"syscall"
)

// Signal zero asks whether a process is there without telling it anything.
//
// A ZOMBIE ANSWERS THE SIGNAL AND IS NOT THERE. A child that has exited and
// nobody has waited on keeps its pid and takes signal zero, so the battery's
// shell read as still going for as long as the engine that started it lived.
// Where /proc says the state, a Z is gone.
func Is(pid int) bool {
	p, err := os.FindProcess(pid)
	if err != nil {
		return false
	}
	if p.Signal(syscall.Signal(0)) != nil {
		return false
	}
	return !zombie(pid)
}

// zombie reads the state letter off /proc/<pid>/stat, after the bracketed
// command name, which may itself hold spaces and brackets. A machine with no
// /proc answers no, and the signal above stands alone there.
func zombie(pid int) bool {
	b, err := os.ReadFile("/proc/" + strconv.Itoa(pid) + "/stat")
	if err != nil {
		return false
	}
	s := string(b)
	after := s[strings.LastIndexByte(s, ')')+1:]
	return strings.HasPrefix(strings.TrimSpace(after), "Z")
}
