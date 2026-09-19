// A server running a binary a rebuild swaps out ends itself, so the editor or
// the next call starts the new one. Windows holds a running binary open, so
// the install renames the old one aside and puts the new build at its path.
// [[spec/design_output/lsp]]
package swap

import (
	"os"
	"time"
)

// How often a server looks at the path it runs from. [[spec/design_output/lsp]]
const look = 5 * time.Second

// Watches calls gone once another file stands at the path this binary starts from. [[spec/design_output/lsp]]
func Watches(gone func()) {
	path, err := os.Executable()
	if err != nil {
		return
	}
	first, err := os.Stat(path)
	if err != nil {
		return
	}
	go func() {
		for range time.Tick(look) {
			if Swapped(first, path) {
				gone()
				return
			}
		}
	}()
}

// Swapped answers whether the file at the path differs from the one the server started from. [[spec/design_output/lsp]]
func Swapped(first os.FileInfo, path string) bool {
	now, err := os.Stat(path)
	if err != nil {
		return false
	}
	return !now.ModTime().Equal(first.ModTime()) || now.Size() != first.Size()
}
