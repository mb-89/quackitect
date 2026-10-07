package index

import (
	"testing"

	"quackitect/src/watcher/watchertest"
)

// The door's stop closes the watch while its loop adds a folder: the case closes it once the watch hears the first folder appear. [[spec/tickets/a-watch-stops-mid-add]]
func TestTheIndexWatchStopsWhileFoldersAppear(t *testing.T) {
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
