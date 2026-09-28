package watchertest

import (
	"os"
	"testing"
	"time"
)

// [[spec/tickets/a-watch-stops-mid-add]]
func TestFoldersAppearUntilQuitAndAQuickStopPasses(t *testing.T) {
	root := t.TempDir()
	quit := make(chan struct{})
	Appearing(root, quit)
	deadline := time.Now().Add(Hung)
	for {
		entries, err := os.ReadDir(root)
		if err == nil && len(entries) > 0 {
			break
		}
		if time.Now().After(deadline) {
			t.Fatal("no folder appears under the root")
		}
		time.Sleep(time.Millisecond)
	}
	Returns(t, func() error { close(quit); return nil })
}
