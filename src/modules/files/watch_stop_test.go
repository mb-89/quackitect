package files

import (
	"testing"
	"time"

	"quackitect/src/watcher/watchertest"
)

// The stop hung on Windows while the watch added a folder. [[spec/tickets/a-watch-stops-mid-add]]
func TestAStopReturnsWhileFoldersAppear(t *testing.T) {
	for round := 0; round < 20; round++ {
		root := t.TempDir()
		stop, err := NewWatch(root).Changes(func(string, string, int64, bool) {})
		if err != nil {
			t.Fatal(err)
		}
		appearing := watchertest.Appearing(root)
		time.Sleep(5 * time.Millisecond)
		watchertest.Returns(t, func() error { stop(); return nil })
		appearing()
	}
}
