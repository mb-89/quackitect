package index // level0: InPackageTest - it drives the unexported watches and the door's fields

import (
	"testing"

	"quackitect/src/watcher/watchertest"
)

// The door's stop closes the watch while its loop adds a folder: the case closes it once the watch hears the first folder appear. [[spec/tickets/a-watch-stops-mid-add]]
// level0: FixtureOutsideHome - the case makes folders appear under its own root
func TestTheIndexWatchStopsWhileFoldersAppear(t *testing.T) {
	t.Parallel()
	for round := 0; round < 20; round++ {
		// A hang fails through t.Fatal, which runs the round's defers alone, so the folders stop appearing before TempDir's cleanup. [[spec/tickets/appearing-stops-on-a-fatal]]
		func() {
			root := t.TempDir()
			one := &door{touched: map[string]bool{}, dirty: make(chan struct{}, 1)}
			eyes, err := watches(root, one)
			if err != nil {
				t.Fatal(err)
			}
			defer watchertest.Appearing(root)()
			<-one.dirty
			watchertest.Returns(t, eyes.Close)
		}()
	}
}
