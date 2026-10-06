// The sentinel: it hears each event, fires the failure a matching watch
// names, and arms a quiet watch on the clock door, so nothing polls.
// [[spec/design_output/failures#the-sentinel-fires-a-watch]]
package failure

import "time"

// The clock the sentinel arms a quiet watch on, which the clock module's Clock answers. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
type Timer interface {
	After(span time.Duration, hand func(time.Time)) (stop func())
}

// One event the hooks door hears: its kind and its text. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
type Event struct {
	Kind string
	Text string
}

// The watches of a registry, armed on a clock, firing through a hand and running each reaction through the process door. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
type Sentinel struct{}

// A sentinel over the registry's watches, each quiet watch armed at once. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
func NewSentinel(registry Registry, clock Timer, fire func(Raised), run Runner) *Sentinel {
	return &Sentinel{}
}

// Fires each watch the event matches with no quiet span, and arms each quiet one again. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
func (one *Sentinel) Hear(event Event) {}
