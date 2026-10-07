package watchertest

import (
	"path/filepath"
	"runtime"
	"testing"
)

// [[spec/tickets/a-watch-stops-mid-add]]
func TestFoldersAppearUntilQuitAndAQuickStopPasses(t *testing.T) {
	root := t.TempDir()
	stop := Appearing(root)
	for stands, _ := filepath.Glob(filepath.Join(root, "*")); len(stands) == 0; stands, _ = filepath.Glob(filepath.Join(root, "*")) {
		runtime.Gosched()
	}
	Returns(t, func() error { stop(); return nil })
}
