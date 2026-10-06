// A server running a binary a rebuild swaps out ends itself, so the editor or
// the next call starts the new one. Windows holds a running binary open, so
// the install renames the old one aside and puts the new build at its path.
// [[spec/design_output/lsp]]
package swap

import (
	"io/fs"
	"time"

	"quackitect/src/q"
)

// How often a server looks at the path it runs from. [[spec/design_output/lsp]]
const look = 5 * time.Second

// Watches calls gone once another file stands at the path this binary starts from. [[spec/design_output/lsp]]
func Watches(clock q.Clock, gone func()) {
	path, err := executableOf()
	if err != nil {
		return
	}
	first, err := statOf(path)
	if err != nil {
		return
	}
	watchesAt(clock, path, first, gone)
}

// Looks at the path each span, and calls gone once another file stands there. [[spec/tickets/go-waits-on-events]]
func watchesAt(clock q.Clock, path string, first fs.FileInfo, gone func()) {
	looks := make(chan struct{}, 1)
	stop := clock.Every(look, func(time.Time) {
		select {
		case looks <- struct{}{}:
		default:
		}
	})
	go func() {
		defer stop()
		for range looks {
			if Swapped(first, path) {
				gone()
				return
			}
		}
	}()
}

// Swapped answers whether the file at the path differs from the one the server started from. [[spec/design_output/lsp]]
func Swapped(first fs.FileInfo, path string) bool {
	now, err := statOf(path)
	if err != nil {
		return false
	}
	return !now.ModTime().Equal(first.ModTime()) || now.Size() != first.Size()
}
