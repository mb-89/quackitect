//go:build windows

// Windows refuses to remove a folder a running process stands in, so the caller of a stop waits on the door's handle until it exits.
// [[spec/tickets/smoke-waits-for-the-door]]
package index

import "os" // level0: OutsideInDoors - the stop client waits on the door's process handle, as the door's spawn starts that process

// Waits on the process's exit event, and answers at once where no process stands at the pid. [[spec/tickets/smoke-waits-for-the-door]]
func awaitsExit(pid int) {
	door, err := os.FindProcess(pid)
	if err != nil {
		return
	}
	_, _ = door.Wait()
}
