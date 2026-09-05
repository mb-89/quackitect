//go:build !windows

package treelock

import (
	"os"
	"syscall"
)

// Take asks for the exclusive lock on the open file and does not wait. It
// answers false when another process holds it, and an error for anything else.
func Take(f *os.File) (bool, error) {
	err := syscall.Flock(int(f.Fd()), syscall.LOCK_EX|syscall.LOCK_NB)
	if err == nil {
		return true, nil
	}
	if err == syscall.EWOULDBLOCK {
		return false, nil
	}
	return false, err
}

// Drop gives the lock back. Closing the file drops it too, so this is for the
// process that goes on running after it let go.
func Drop(f *os.File) error { return syscall.Flock(int(f.Fd()), syscall.LOCK_UN) }
