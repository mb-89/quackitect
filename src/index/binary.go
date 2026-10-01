// The binary a start runs: the index itself, the index beside the caller, or
// the tree's own build.
// [[spec/design_output/index#a-door-comes-back]]
package index

import (
	"path/filepath"
	"runtime"
	"sync/atomic"
)

// The index binary the tree builds, whose folder .claude/skills/level0/lib/folders.js owns and whose name lib/index.js owns. [[spec/design_output/index#a-door-comes-back]]
func indexBinary(root string) string {
	name := "se-index"
	if runtime.GOOS == "windows" {
		name += ".exe"
	}
	return filepath.Join(root, filepath.FromSlash(Runtime), "bin", name)
}

// Whether this process is the index, which Main says, and the composition root before any verb. [[spec/design_output/index#a-door-comes-back]]
var serving atomic.Bool

// Marks this process as the index, so a start it makes runs itself. [[spec/design_output/index#a-door-comes-back]]
func Serving() { serving.Store(true) }

// The binary a start runs: the index itself, and for a client the index beside it, else the tree's own. [[spec/design_output/index#a-door-comes-back]]
func serverOf(self, root string) string {
	if serving.Load() {
		return self
	}
	beside := filepath.Join(filepath.Dir(self), filepath.Base(indexBinary(root)))
	if _, err := statOf(beside); err == nil {
		return beside
	}
	return indexBinary(root)
}
