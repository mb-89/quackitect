//go:build windows

package treelock

import (
	"os"

	"golang.org/x/sys/windows"
)

// Take asks for the exclusive lock on the open file and does not wait. It
// answers false when another process holds it, and an error for anything else.
func Take(f *os.File) (bool, error) {
	var ol windows.Overlapped
	err := windows.LockFileEx(windows.Handle(f.Fd()),
		windows.LOCKFILE_EXCLUSIVE_LOCK|windows.LOCKFILE_FAIL_IMMEDIATELY, 0, 1, 0, &ol)
	if err == nil {
		return true, nil
	}
	if err == windows.ERROR_LOCK_VIOLATION || err == windows.ERROR_IO_PENDING {
		return false, nil
	}
	return false, err
}

// Drop gives the lock back. Closing the file drops it too, so this is for the
// process that goes on running after it let go.
func Drop(f *os.File) error {
	var ol windows.Overlapped
	return windows.UnlockFileEx(windows.Handle(f.Fd()), 0, 1, 0, &ol)
}
