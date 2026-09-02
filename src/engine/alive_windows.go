//go:build windows

package main

import (
	"syscall"
)

// A process is alive when it can be opened and has not exited. On Windows a
// signal proves nothing, because every signal to another process is fatal, so
// the state is asked for rather than sent.
func alive(pid int) bool {
	const query = 0x1000 // PROCESS_QUERY_LIMITED_INFORMATION
	h, err := syscall.OpenProcess(query, false, uint32(pid))
	if err != nil {
		return false
	}
	defer syscall.CloseHandle(h)
	var code uint32
	if syscall.GetExitCodeProcess(h, &code) != nil {
		return false
	}
	const stillRunning = 259
	return code == stillRunning
}
