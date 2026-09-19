// The problems panel as this server holds it: its own findings and the
// bridge's, a list per file. An event redraws the file it names and no other,
// so every file keeps what the sweep drew until that file changes.
// [[spec/design_output/lsp]]
package main

import (
	"path/filepath"
	"strings"

	"quackitect/yaml"
)

const (
	opens = "textDocument/didOpen"
	saves = "textDocument/didSave"
)

type panel struct {
	own   map[string][]Finding
	extra map[string][]Finding
	open  map[string]bool
	shown map[string]bool
}

func newPanel() *panel {
	return &panel{
		own:   map[string][]Finding{},
		extra: map[string][]Finding{},
		open:  map[string]bool{},
		shown: map[string]bool{},
	}
}

// A path reads the same off every source, so the lists meet on it. [[spec/design_output/lsp]]
func grouped(found []Finding) map[string][]Finding {
	out := map[string][]Finding{}
	for _, said := range found {
		path := strings.ReplaceAll(said.File, "\\", "/")
		out[path] = append(out[path], said)
	}
	return out
}

// The sweep draws this server's rules at once, then the bridge's as they come. [[spec/design_output/lsp]]
func (one *server) sweeps() {
	tree := one.checker.Tree()
	own := grouped(one.checker.Sweep())
	one.guard.Lock()
	one.panel.own = own
	one.showsAll(tree)
	one.guard.Unlock()
	go one.asksBridge(nil)
}

// [[spec/design_output/lsp]]
func (one *server) asksBridge(paths []string) {
	tree := one.checker.Tree()
	found, ok := bridgeFindings(tree.Root, paths)
	if !ok {
		return
	}
	got := grouped(found)
	one.guard.Lock()
	defer one.guard.Unlock()
	if len(paths) == 0 {
		one.panel.extra = got
		one.showsAll(tree)
		return
	}
	for _, path := range paths {
		one.panel.extra[path] = got[path]
		one.shows(tree, path)
	}
}

// An open, a change or a save redraws that file, and a save asks the bridge again for it. [[spec/design_output/lsp]]
func (one *server) draws(where, text, method string) {
	if where == "" {
		return
	}
	tree := one.checker.Tree()
	at := relativeTo(tree.Root, where)
	if text != "" {
		tree.Holds(at, text)
	}
	got := grouped(one.checker.Over(at))
	got[at] = got[at] // an empty list clears what the file drew before

	one.guard.Lock()
	if method == opens {
		one.panel.open[at] = true
	}
	for path, said := range got {
		one.panel.own[path] = said
		one.shows(tree, path)
	}
	one.guard.Unlock()
	if method == saves {
		go one.asksBridge([]string{at})
	}
}

// A closed file reads off the disk again, and keeps its problems drawn. [[spec/design_output/lsp]]
func (one *server) closes(where string) {
	if where == "" {
		return
	}
	tree := one.checker.Tree()
	at := relativeTo(tree.Root, where)
	tree.Drops(at)
	got := grouped(one.checker.Over(at))

	one.guard.Lock()
	defer one.guard.Unlock()
	delete(one.panel.open, at)
	one.panel.own[at] = got[at]
	one.shows(tree, at)
}

func (one *server) showsAll(tree *Tree) {
	paths := map[string]bool{}
	for path := range one.panel.own {
		paths[path] = true
	}
	for path := range one.panel.extra {
		paths[path] = true
	}
	for path := range one.panel.shown {
		paths[path] = true
	}
	for path := range paths {
		one.shows(tree, path)
	}
}

// An open file leaves Vale and Biome to their own servers, which draw it as it is typed. [[spec/design_output/lsp]]
func (one *server) shows(tree *Tree, path string) {
	said := append([]Finding{}, one.panel.own[path]...)
	for _, extra := range one.panel.extra[path] {
		if one.panel.open[path] && (extra.Source == fromVale || extra.Source == fromBiome) {
			continue
		}
		said = append(said, extra)
	}
	if len(said) == 0 && !one.panel.shown[path] {
		return
	}
	one.panel.shown[path] = len(said) > 0

	rows := yaml.SplitLines(tree.Read(path))
	drawn := make([]diagnostic, 0, len(said))
	for _, each := range said {
		drawn = append(drawn, drawsAs(each, rows))
	}
	one.says("textDocument/publishDiagnostics", map[string]any{
		"uri":         uriOf(filepath.Join(tree.Root, filepath.FromSlash(path))),
		"diagnostics": drawn,
	})
}
