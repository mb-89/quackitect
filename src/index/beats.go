// The index's own beat: a ticker asks the work loop for a step, and each step
// runs the hands the manager gives it, so a hung loop renews nothing.
// [[spec/design_output/model#a-lease]]
package index

import (
	"time"

	"quackitect/src/config"
)

// The span a tree setting no beat takes. [[spec/design_output/model#a-lease]]
const builtInBeat = 5 * time.Second

// A key in seconds, or the built-in span where the tree sets none above zero, since a ticker takes no zero. [[spec/design_output/model#a-lease]]
func spanOf(root, key string, builtIn time.Duration) time.Duration {
	if seconds := config.Count(root, key); seconds > 0 {
		return time.Duration(seconds) * time.Second
	}
	return builtIn
}

// Each beat asks the work loop for a step, so a hung loop runs no step and the manager's lease expires. [[spec/design_output/model#a-lease]]
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
			}
		}
	}()
	return func() {
		ticker.Stop()
		close(done)
	}
}
