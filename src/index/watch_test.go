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
		root := t.TempDir()
		one := &door{touched: map[string]bool{}, dirty: make(chan struct{}, 1)}
		eyes, err := watches(root, one)
		if err != nil {
			t.Fatal(err)
		}
		stop := watchertest.Appearing(root)
		<-one.dirty
		watchertest.Returns(t, eyes.Close)
		stop()
	}
}
