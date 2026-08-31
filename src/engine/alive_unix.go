//go:build !windows

package main

import (
	"os"
	"syscall"
)

// Signal zero asks whether a process is there without telling it anything.
func alive(pid int) bool {
	p, err := os.FindProcess(pid)
	if err != nil {
		return false
	}
	return p.Signal(syscall.Signal(0)) == nil
}
