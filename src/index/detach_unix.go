//go:build !windows

// The door leads a session of its own, so the end of its starter's group leaves it standing.
// [[spec/tickets/the-index-outlives-the-check]]
package index

import (
	"os/exec" // level0: OutsideInDoors - the door's spawn readies the process it starts, as procs.go spawns the ones it places
	"syscall"
)

// The process a spawn starts is the door itself. [[spec/tickets/door-outlives-taskkill-tree]]
const starterIsDoor = true

// [[spec/tickets/the-index-outlives-the-check]]
func detached(run *exec.Cmd) *exec.Cmd {
	if run.SysProcAttr == nil {
		run.SysProcAttr = &syscall.SysProcAttr{}
	}
	run.SysProcAttr.Setsid = true
	return run
}
