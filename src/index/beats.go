// The index's own lease: a ticker asks the work loop for a step, and the
// loop beats the lease, so a hung loop lets it expire.
// [[spec/design_output/model#a-lease]]
package index

import (
	"time"

	"quackitect/src/config"
)

// The part the index holds its lease under, and the spans a tree setting none takes. [[spec/design_output/model#a-lease]]
const (
	leasePart    = "index"
	builtInBeat  = 5 * time.Second
	builtInLease = 30 * time.Second
)

// A key in seconds, or the built-in span where the tree sets none above zero, since a ticker takes no zero. [[spec/design_output/model#a-lease]]
func spanOf(root, key string, builtIn time.Duration) time.Duration {
	if seconds := config.Count(root, key); seconds > 0 {
		return time.Duration(seconds) * time.Second
	}
	return builtIn
}

// Each beat asks the work loop for a step, and checks the leases off the loop, so a hung loop renews nothing and its lease expires. [[spec/design_output/model#a-lease]]
func (one *door) beats(every time.Duration) (stop func()) {
	ticker, done := time.NewTicker(every), make(chan struct{})
	go func() {
		for {
			select {
			case <-done:
				return
			case <-ticker.C:
				select {
				case one.dirty <- struct{}{}:
				default:
				}
				one.dog.Check()
			}
		}
	}()
	return func() {
		ticker.Stop()
		close(done)
	}
}
