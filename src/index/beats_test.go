// A tree setting no beat takes the built-in span, and a tree setting one takes
// its own. [[spec/design_output/model#a-lease]]
package index

import (
	"testing"
	"time"

	"quackitect/src/config"
)

func TestABeatAtZeroTakesTheBuiltInSpan(t *testing.T) {
	t.Parallel()
	root := tree(t)
	write(t, root, config.Tracked, `{"watchdog":{"beat":0,"lease":7}}`)
	if got := spanOf(root, "watchdog.beat", builtInBeat); got != builtInBeat {
		t.Fatalf("a beat at zero reads %v", got)
	}
	if got := spanOf(root, "watchdog.lease", builtInBeat); got != 7*time.Second {
		t.Fatalf("a lease of seven seconds reads %v", got)
	}
}
