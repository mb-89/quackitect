// The clock every caller reads the time through and waits on: the time now, a
// hand on each span, and the waits past a span. It names the time types alone,
// so the core calls no member the clock door owns.
// [[spec/design_output/doors#time-is-a-door]]
package q

import (
	"context"
	"time"
)

// The clock IO module holds the real one, and q/qtest the fake. [[spec/tickets/go-waits-on-events]]
type Clock interface {
	Now() time.Time
	Every(span time.Duration, hand func(time.Time)) (stop func())
	After(span time.Duration) <-chan time.Time
	AfterFunc(span time.Duration, hand func()) (stop func() bool)
	WithTimeout(parent context.Context, span time.Duration) (context.Context, context.CancelFunc)
}
