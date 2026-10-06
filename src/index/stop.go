// The stop a call asks of the door: main runs the door's own stop, so the
// processes and tool runs it started end with it.
// [[spec/tickets/the-index-stops-its-tools]]
package index

import (
	"sync"
	"time"

	"quackitect/src/q"
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

// [[spec/design_output/index#a-door-comes-back]]
func stopsSoon(clock q.Clock, root string) {
	stopsAfter(clock, root, stopGraceDelay, stopBound, exits)
}

// Asks main for the stop after the grace, and ends the process itself where the stop outlasts the bound. [[spec/tickets/the-index-stops-its-tools]]
func stopsAfter(clock q.Clock, root string, grace, bound time.Duration, exit func(int)) {
	<-clock.After(grace)
	stopAsk.Do(func() { close(stopAsked) })
	<-clock.After(bound)
	dropsOwn(root, pidOf())
	exit(0)
}
