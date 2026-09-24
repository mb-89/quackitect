// The panel follows the index. The door's changes call answers once a sweep
// lands, a pull names the files whose hash moved and the ones that went, and
// each redraws. So a finding leaves when its file mends, whoever mends it.
// [[spec/design_output/lsp#the-panel-follows-the-index]]
package main

import (
	"errors"
	"strings"
	"time"

	"quackitect/yaml"
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
	for _, at := range paths {
		tree.Drops(at)
	}
	// A file pointing at a moved or dropped note reads that note's headings, so it redraws too. [[spec/design_output/lsp#the-panel-follows-the-index]]
	leaning := pointingAt(tree, append(append([]string{}, moved...), gone...), paths)
	if len(paths)+len(leaning) == 0 {
		return
	}
	got := map[string][]Finding{}
	for _, at := range append(append([]string{}, paths...), leaning...) {
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
	if len(paths) > 0 {
		go one.owes(paths)
	}
}

// The tracked files a pointer of which names one of the paths, past the ones named to skip. [[spec/design_output/lsp#the-panel-follows-the-index]]
func pointingAt(tree *Tree, targets, skip []string) []string {
	out := []string{}
	if len(targets) == 0 {
		return out
	}
	for _, path := range tree.Paths() {
		if listed(skip, path) {
			continue
		}
		text := tree.Read(path)
		if !strings.Contains(text, "[[") || !textual(text) {
			continue
		}
		for _, said := range pointersIn(path, yaml.SplitLines(text)) {
			if namesAny(said.target, targets) {
				out = append(out, path)
				break
			}
		}
	}
	return out
}

// Whether a pointer names one of the paths: as written, past an ending, by its id, or as a folder over it. [[spec/design_output/index#a-note-and-its-links]]
func namesAny(target string, paths []string) bool {
	name, _, _ := strings.Cut(target, "#")
	name = strings.Trim(strings.TrimSpace(name), "/")
	if name == "" {
		return false
	}
	for _, path := range paths {
		base := path[strings.LastIndex(path, "/")+1:]
		for _, end := range pointerEndings {
			if path == name+end || base == name+end {
				return true
			}
		}
		if strings.HasPrefix(path, name+"/") || strings.HasPrefix(name, path+"/") {
			return true
		}
	}
	return false
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
