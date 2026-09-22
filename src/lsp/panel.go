// The problems panel as this server holds it: its own findings and the
// bridge's, a list per file. An event redraws the file it names and no other,
// so every file keeps what the sweep drew until that file changes.
// [[spec/design_output/lsp]]
package main

import (
	"path/filepath"
	"strings"
	"time"

	"quackitect/yaml"
)

const (
	opens   = "textDocument/didOpen"
	changes = "textDocument/didChange"
	saves   = "textDocument/didSave"
)

type panel struct {
	own   map[string][]Finding
	extra map[string][]Finding
	open  map[string]bool
	shown map[string]bool
	// The open files changed since the bridge last read them, which the next ask carries together. [[spec/design_output/lsp#the-panel-lints-as-typed]]
	pending map[string]bool
	// The files the bridge owes an answer for, asked again until one answers, and whether an ask runs now. [[spec/design_output/lsp#the-panel-follows-the-disk]]
	owed     map[string]bool
	draining bool
}

func newPanel() *panel {
	return &panel{
		own:     map[string][]Finding{},
		extra:   map[string][]Finding{},
		open:    map[string]bool{},
		shown:   map[string]bool{},
		pending: map[string]bool{},
		owed:    map[string]bool{},
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
	go one.asksUntilAnswered()
}

// The whole tree's list waits for a bridge, so the ask repeats until one answers, and the panel fills with every file's findings. [[spec/design_output/lsp#the-panel-reads-the-battery]]
func (one *server) asksUntilAnswered() {
	for !one.asksBridge(nil) {
		time.Sleep(bridgeRetry)
	}
}

// [[spec/design_output/lsp]]
func (one *server) asksBridge(paths []string) bool {
	tree := one.checker.Tree()
	found, ok := bridgeFindings(tree.Root, paths)
	if !ok {
		return false
	}
	got := grouped(found)
	one.guard.Lock()
	defer one.guard.Unlock()
	if len(paths) == 0 {
		one.panel.extra = got
		one.showsAll(tree)
		return true
	}
	for _, path := range paths {
		one.panel.extra[path] = got[path]
		one.shows(tree, path)
	}
	return true
}

// An open, a change or a save redraws that file. A save asks the bridge again for it off the disk, and a change asks after the quiet span, off the buffer. [[spec/design_output/lsp]]
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
	// A save changes the file, so the rows the bridge drew for it go, and the bridge draws them again. [[spec/design_output/lsp#the-panel-follows-the-disk]]
	if method == saves {
		delete(one.panel.extra, at)
	}
	for path, said := range got {
		one.panel.own[path] = said
		one.shows(tree, path)
	}
	one.guard.Unlock()
	if method == saves {
		go one.owes([]string{at})
	}
	if method == changes {
		one.asksSoon(at)
	}
}

// The bridge owes an answer for these paths. One ask runs at a time, and it asks again after the pause until the bridge answers, so a file changed while no bridge stands draws its rows once one does. [[spec/design_output/lsp#the-panel-follows-the-disk]]
func (one *server) owes(paths []string) {
	one.guard.Lock()
	for _, at := range paths {
		one.panel.owed[at] = true
	}
	if one.panel.draining {
		one.guard.Unlock()
		return
	}
	one.panel.draining = true
	one.guard.Unlock()
	for {
		one.guard.Lock()
		asked := []string{}
		for at := range one.panel.owed {
			asked = append(asked, at)
		}
		if len(asked) == 0 {
			one.panel.draining = false
			one.guard.Unlock()
			return
		}
		one.guard.Unlock()
		if one.asksBridge(asked) {
			one.guard.Lock()
			for _, at := range asked {
				delete(one.panel.owed, at)
			}
			one.guard.Unlock()
			continue
		}
		time.Sleep(bridgeRetry)
	}
}

// A change waits the quiet span, and every change inside it joins one ask. [[spec/design_output/lsp#the-panel-lints-as-typed]]
func (one *server) asksSoon(at string) {
	one.guard.Lock()
	defer one.guard.Unlock()
	one.panel.pending[at] = true
	if one.timer != nil {
		one.timer.Stop()
	}
	one.timer = time.AfterFunc(one.quiet, one.asksHeld)
}

// The bridge reads every pending buffer as it stands, and each file redraws with the answer. [[spec/design_output/lsp#the-panel-lints-as-typed]]
func (one *server) asksHeld() {
	tree := one.checker.Tree()
	one.guard.Lock()
	held := map[string]string{}
	for at := range one.panel.pending {
		if one.panel.open[at] {
			held[at] = tree.Read(at)
		}
	}
	one.panel.pending = map[string]bool{}
	one.guard.Unlock()
	if len(held) == 0 {
		return
	}
	found, ok := bridgeHeld(tree.Root, held)
	if !ok {
		// No bridge answers, so the rows it drew before go, because they read a text the buffer no longer holds, and the disk's rows come once a bridge stands. [[spec/design_output/lsp#the-panel-follows-the-disk]]
		paths := []string{}
		one.guard.Lock()
		for at := range held {
			delete(one.panel.extra, at)
			one.shows(tree, at)
			paths = append(paths, at)
		}
		one.guard.Unlock()
		go one.owes(paths)
		return
	}
	got := grouped(found)
	one.guard.Lock()
	defer one.guard.Unlock()
	for at := range held {
		one.panel.extra[at] = got[at]
		one.shows(tree, at)
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
	for path := range one.panel.paths() {
		one.shows(tree, path)
	}
}

// Every path a list names or a row draws. [[spec/design_output/lsp]]
func (one *panel) paths() map[string]bool {
	out := map[string]bool{}
	for path := range one.own {
		out[path] = true
	}
	for path := range one.extra {
		out[path] = true
	}
	for path := range one.shown {
		out[path] = true
	}
	return out
}

// An open file leaves Biome to its own server, which draws it as it is typed. Vale stays here, because the battery's list carries the tense reader's veto. [[spec/design_output/lsp]]
func (one *server) shows(tree *Tree, path string) {
	// A file the disk no longer holds draws nothing, whoever last found something in it, so a move or a delete clears its row. [[spec/design_output/lsp#the-panel-follows-the-disk]]
	if !tree.Held(path) && !tree.Exists(path) {
		delete(one.panel.own, path)
		delete(one.panel.extra, path)
	}
	said := append([]Finding{}, one.panel.own[path]...)
	for _, extra := range one.panel.extra[path] {
		if one.panel.open[path] && extra.Source == fromBiome {
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
