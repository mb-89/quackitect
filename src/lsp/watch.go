// The disk as the panel watches it. The editor names every file that changes
// under the root, whoever changes it, and the panel redraws each one off the
// disk and asks the bridge again. So a finding leaves when its file mends.
// [[spec/design_output/lsp#the-panel-follows-the-disk]]
package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
)

const (
	watched     = "workspace/didChangeWatchedFiles"
	registering = "client/registerCapability"
	everyFile   = "**/*"
)

// The change types the editor names, off the protocol's FileChangeType. [[spec/design_output/lsp#the-panel-follows-the-disk]]
const (
	created = 1
	changed = 2
	deleted = 3
)

// The folders no rule reads, the ones the battery skips too. [[spec/design_output/lsp#the-panel-follows-the-disk]]
var unwatched = []string{".se/", ".git/", "node_modules/", ".claude/types/", ".claude/worktrees/"}

// [[spec/design_output/lsp#the-panel-follows-the-disk]]
func (one *server) watches() {
	params, err := json.Marshal(map[string]any{
		"registrations": []map[string]any{{
			"id":     "se-lsp-disk",
			"method": watched,
			"registerOptions": map[string]any{
				"watchers": []map[string]any{{"globPattern": everyFile}},
			},
		}},
	})
	if err != nil {
		return
	}
	one.writes(message{JSONRPC: "2.0", ID: json.RawMessage(`"se-lsp-disk"`), Method: registering, Params: params})
}

// The paths a change names, relative to the root, past the folders no rule reads: the ones to redraw off the disk, and the ones the disk drops. A path named twice reads its last type. [[spec/design_output/lsp#the-panel-follows-the-disk]]
func changedIn(root string, params json.RawMessage) (redrawn, gone []string) {
	var said struct {
		Changes []struct {
			URI  string `json:"uri"`
			Type int    `json:"type"`
		} `json:"changes"`
	}
	if err := json.Unmarshal(params, &said); err != nil {
		return nil, nil
	}
	order := []string{}
	last := map[string]int{}
	for _, change := range said.Changes {
		at := relativeTo(root, pathOf(change.URI))
		if at == "" || isUnwatched(at) {
			continue
		}
		if _, seen := last[at]; !seen {
			order = append(order, at)
		}
		last[at] = change.Type
	}
	redrawn, gone = []string{}, []string{}
	for _, at := range order {
		if last[at] == deleted {
			gone = append(gone, at)
		} else {
			redrawn = append(redrawn, at)
		}
	}
	return redrawn, gone
}

func isUnwatched(path string) bool {
	for _, folder := range unwatched {
		if strings.HasPrefix(path, folder) {
			return true
		}
	}
	return false
}

// A file the disk changes redraws off the disk, and the bridge answers for it again. A file the disk drops takes its row with it, and a folder every row under it. An open file follows the editor instead. [[spec/design_output/lsp#the-panel-follows-the-disk]]
func (one *server) refreshes(params json.RawMessage) {
	tree := one.checker.Tree()
	redrawn, gone := changedIn(tree.Root, params)
	one.guard.Lock()
	for _, at := range one.closed(gone) {
		for _, path := range one.panel.under(at) {
			one.shows(tree, path)
		}
	}
	paths := []string{}
	for _, at := range one.closed(redrawn) {
		paths = append(paths, filesUnder(tree, at)...)
	}
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
	for path, said := range got {
		one.panel.own[path] = said
		one.shows(tree, path)
	}
	one.guard.Unlock()
	go one.asksBridge(paths)
}

// The paths no editor holds open, under the guard. [[spec/design_output/lsp#the-panel-follows-the-disk]]
func (one *server) closed(paths []string) []string {
	out := []string{}
	for _, at := range paths {
		if !one.panel.open[at] {
			out = append(out, at)
		}
	}
	return out
}

// The rows a path holds: its own, and every one under it where it names a folder. [[spec/design_output/lsp#the-panel-follows-the-disk]]
func (one *panel) under(at string) []string {
	out := []string{}
	for path := range one.paths() {
		if path == at || strings.HasPrefix(path, at+"/") {
			out = append(out, path)
		}
	}
	return out
}

// The files a path names: itself, or every file under it where it names a folder, past the folders no rule reads. [[spec/design_output/lsp#the-panel-follows-the-disk]]
func filesUnder(tree *Tree, at string) []string {
	whole := filepath.Join(tree.Root, filepath.FromSlash(at))
	if stat, err := os.Stat(whole); err != nil || !stat.IsDir() {
		return []string{at}
	}
	out := []string{}
	filepath.WalkDir(whole, func(where string, entry os.DirEntry, err error) error {
		if err != nil || entry.IsDir() {
			return nil
		}
		rel, err := filepath.Rel(tree.Root, where)
		if err != nil {
			return nil
		}
		if path := slashed(rel); !isUnwatched(path) {
			out = append(out, path)
		}
		return nil
	})
	return out
}
