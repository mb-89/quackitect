// The disk as the panel watches it. The editor names every file that changes
// under the root, whoever changes it, and the panel redraws each one off the
// disk and asks the bridge again. So a finding leaves when its file mends.
// [[spec/design_output/lsp#the-panel-follows-the-disk]]
package main

import (
	"encoding/json"
	"strings"
)

const (
	watched     = "workspace/didChangeWatchedFiles"
	registering = "client/registerCapability"
	everyFile   = "**/*"
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

// The paths a change names, relative to the root, past the folders no rule reads. [[spec/design_output/lsp#the-panel-follows-the-disk]]
func changedIn(root string, params json.RawMessage) []string {
	var said struct {
		Changes []struct {
			URI string `json:"uri"`
		} `json:"changes"`
	}
	if err := json.Unmarshal(params, &said); err != nil {
		return nil
	}
	seen := map[string]bool{}
	out := []string{}
	for _, change := range said.Changes {
		at := relativeTo(root, pathOf(change.URI))
		if at == "" || seen[at] || isUnwatched(at) {
			continue
		}
		seen[at] = true
		out = append(out, at)
	}
	return out
}

func isUnwatched(path string) bool {
	for _, folder := range unwatched {
		if strings.HasPrefix(path, folder) {
			return true
		}
	}
	return false
}

// A file the disk changes redraws off the disk, and the bridge answers for it again. An open file follows the editor instead. [[spec/design_output/lsp#the-panel-follows-the-disk]]
func (one *server) refreshes(params json.RawMessage) {
	tree := one.checker.Tree()
	paths := []string{}
	one.guard.Lock()
	for _, at := range changedIn(tree.Root, params) {
		if one.panel.open[at] {
			continue
		}
		paths = append(paths, at)
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
