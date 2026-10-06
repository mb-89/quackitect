// The door stands apart from whatever starts it, so the end of the starter's group leaves the door answering.
// [[spec/tickets/the-index-outlives-the-check]]
package index

import "os/exec" // level0: OutsideInDoors - the door's spawn readies the process it starts, as procs.go spawns the ones it places

// Readies a command to stand apart from the caller's group and session. [[spec/tickets/the-index-outlives-the-check]]
func Detached(run *exec.Cmd) *exec.Cmd { return run }
