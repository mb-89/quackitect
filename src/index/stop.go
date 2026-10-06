// The stop a call asks of the door: main runs the door's own stop, so the
// processes and tool runs it started end with it.
// [[spec/tickets/the-index-stops-its-tools]]
package index

import (
	"sync"
	"time"
)

// The grace a stop call's answer takes to leave, and the longest the door's own stop runs before the process ends without it. [[spec/tickets/the-index-stops-its-tools]]
const (
	stopGraceDelay = 100 * time.Millisecond
	stopBound      = 10 * time.Second
)

// The stop a call asks, which main waits on beside a signal. [[spec/tickets/the-index-stops-its-tools]]
var (
	stopAsked = make(chan struct{})
	stopAsk   sync.Once
)

// Waits until the process with the pid exits, and a case swaps it for a fake. [[spec/tickets/smoke-waits-for-the-door]]
var awaits = awaitsExit

// Waits on the door a stop answer names, so the caller of a stop meets no running door in the tree. [[spec/tickets/smoke-waits-for-the-door]]
func awaitsStopped(result any) {
	said, _ := result.(map[string]any)
	if pid, ok := said["pid"].(float64); ok && pid > 0 && int(pid) != pidOf() {
		awaits(int(pid))
	}
}

// [[spec/design_output/index#a-door-comes-back]]
func stopsSoon(root string) {
	stopsAfter(root, stopGraceDelay, stopBound, exits)
}

// Asks main for the stop after the grace, and ends the process itself where the stop outlasts the bound. [[spec/tickets/the-index-stops-its-tools]]
func stopsAfter(root string, grace, bound time.Duration, exit func(int)) {
	time.Sleep(grace)
	stopAsk.Do(func() { close(stopAsked) })
	time.Sleep(bound)
	dropsOwn(root, pidOf())
	exit(0)
}
