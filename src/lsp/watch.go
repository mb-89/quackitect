// The panel follows the index. The door's changes call answers once a sweep
// lands, a pull names the files whose hash moved and the ones that went, and
// each redraws. So a finding leaves when its file mends, whoever mends it.
// [[spec/design_output/lsp#the-panel-follows-the-index]]
package main

import (
	"errors"
	"strings"
	"time"
)

// [[spec/design_output/lsp#the-panel-follows-the-index]]
func (one *server) follows() {
	tree := one.checker.Tree()
	since := int64(0)
	for {
		tick, err := tree.Changes(since)
		if errors.Is(err, errNoIndex) {
			return
		}
		if err != nil {
			time.Sleep(bridgeRetry)
			continue
		}
		if tick == since {
			continue
		}
		since = tick
		one.syncs()
	}
}

// One pull off the index, and a redraw of what it moved. [[spec/design_output/lsp#the-panel-follows-the-index]]
func (one *server) syncs() {
	moved, gone, err := one.checker.Tree().Pulls()
	if err != nil || len(moved)+len(gone) == 0 {
		return
	}
	one.redraws(moved, gone)
}

// A file the index moves redraws, and the bridge answers for it again. A file the index drops takes its row with it. An open file follows the editor instead. [[spec/design_output/lsp#the-panel-follows-the-index]]
func (one *server) redraws(moved, gone []string) {
	tree := one.checker.Tree()
	one.guard.Lock()
	for _, at := range one.closed(gone) {
		for _, path := range one.panel.under(at) {
			one.shows(tree, path)
		}
	}
	paths := one.closed(moved)
	one.guard.Unlock()
	if len(paths) == 0 {
		return
	}
	for _, at := range paths {
		tree.Drops(at)
	}
	got := map[string][]Finding{}
	for _, at := range paths {
		got[at] = nil
		for path, said := range grouped(one.checker.Over(at)) {
			got[path] = append(got[path], said...)
		}
	}
	one.guard.Lock()
	// The rows the bridge drew for a moved file read the text it held before, so they go now, and the bridge draws them again once it answers. [[spec/design_output/lsp#the-panel-follows-the-index]]
	for _, at := range paths {
		delete(one.panel.extra, at)
	}
	for path, said := range got {
		one.panel.own[path] = said
		one.shows(tree, path)
	}
	one.guard.Unlock()
	go one.owes(paths)
}

// The paths no editor holds open, under the guard. [[spec/design_output/lsp#the-panel-follows-the-index]]
func (one *server) closed(paths []string) []string {
	out := []string{}
	for _, at := range paths {
		if !one.panel.open[at] {
			out = append(out, at)
		}
	}
	return out
}

// The rows a path holds: its own, and every one under it where it names a folder. [[spec/design_output/lsp#the-panel-follows-the-index]]
func (one *panel) under(at string) []string {
	out := []string{}
	for path := range one.paths() {
		if path == at || strings.HasPrefix(path, at+"/") {
			out = append(out, path)
		}
	}
	return out
}
