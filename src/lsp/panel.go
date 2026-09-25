// The problems panel as this server holds it: its own findings and the rows
// Vale and Biome answer, a list per file. An event redraws the file it names,
// so every other file keeps what it drew until it changes.
// [[spec/design_output/lsp#the-panel-reads-the-battery]]
package main

import (
	"path/filepath"
	"sort"
	"strings"
	"time"

	"quackitect/yaml"
)

const (
	opens   = "textDocument/didOpen"
	changes = "textDocument/didChange"
	saves   = "textDocument/didSave"
	// The pause after the last change before Vale reads the buffer, so a burst of typing costs one run. [[spec/design_output/lsp#the-panel-lints-as-typed]]
	lintQuiet = time.Second
)

type panel struct {
	own   map[string][]Finding
	extra map[string][]Finding
	open  map[string]bool
	shown map[string]bool
	// The open files changed since Vale last read them, which the next run carries together. [[spec/design_output/lsp#the-panel-lints-as-typed]]
	pending map[string]bool
	// The paths the tools owe a run, whether the whole tree waits on one, whether a run goes now, and whether a whole sweep lands once. [[spec/design_output/lsp#the-panel-follows-the-index]]
	owed    map[string]bool
	whole   bool
	running bool
	swept   bool
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

// A path reads the same off every source, so the lists meet on it. [[spec/design_output/lsp#the-panel-reads-the-battery]]
func grouped(found []Finding) map[string][]Finding {
	out := map[string][]Finding{}
	for _, said := range found {
		path := strings.ReplaceAll(said.File, "\\", "/")
		out[path] = append(out[path], said)
	}
	return out
}

// The sweep draws this server's rules at once, then the tools' rows as they land. [[spec/design_output/lsp#the-panel-reads-the-battery]]
func (one *server) sweeps() {
	tree := one.checker.Tree()
	own := grouped(one.checker.Sweep())
	one.guard.Lock()
	one.panel.own = own
	one.showsAll(tree)
	one.guard.Unlock()
	one.owes(nil, true)
}

// An open, a change or a save redraws that file. A save runs the tools over it at once, and a change after the quiet span, off the buffer. [[spec/design_output/lsp#the-panel-reads-the-battery]]
func (one *server) draws(where, text, method string) {
	if where == "" {
		return
	}
	tree := one.checker.Tree()
	at := relativeTo(tree.Root, where)
	// An open and a change carry the whole buffer, an empty one too, and a save carries none. [[spec/design_output/lsp#the-editor-speaks-over-stdio]]
	if method == opens || method == changes {
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
		one.owes([]string{at}, false)
	}
	if method == changes {
		one.asksSoon(at)
	}
}

// The tools owe a run over these paths, or over the whole tree. One run goes at a time, and a path named while it goes waits for the next, so the rows that land read the newest text. [[spec/design_output/lsp#the-panel-follows-the-index]]
func (one *server) owes(paths []string, whole bool) {
	one.guard.Lock()
	// A checker holding no tools runs none, and its sweep stands whole at once. [[spec/design_output/lsp#the-server-runs-the-tools]]
	if one.checker.outside == nil {
		one.panel.swept = one.panel.swept || whole
		one.guard.Unlock()
		return
	}
	for _, at := range paths {
		one.panel.owed[at] = true
	}
	if whole || len(one.panel.owed) > mostPaths {
		one.panel.whole = true
	}
	if one.panel.running {
		one.guard.Unlock()
		return
	}
	one.panel.running = true
	one.guard.Unlock()
	go one.runs()
}

// [[spec/design_output/lsp#the-panel-follows-the-index]]
func (one *server) runs() {
	for {
		one.guard.Lock()
		whole := one.panel.whole
		asked := []string{}
		for at := range one.panel.owed {
			asked = append(asked, at)
		}
		sort.Strings(asked)
		if !whole && len(asked) == 0 {
			one.panel.running = false
			one.guard.Unlock()
			return
		}
		one.panel.whole = false
		one.panel.owed = map[string]bool{}
		one.guard.Unlock()
		if whole {
			one.lands(nil, one.checker.OutsideSweep())
			continue
		}
		one.lands(asked, one.checker.OutsideOver(asked))
	}
}

// A run's rows stand in place of what the tools drew on each file it covers, and a whole sweep covers every file. [[spec/design_output/lsp#the-panel-follows-the-index]]
func (one *server) lands(asked []string, found []Finding) {
	tree := one.checker.Tree()
	got := grouped(found)
	one.guard.Lock()
	defer one.guard.Unlock()
	if asked == nil {
		for path := range one.panel.extra {
			got[path] = got[path]
		}
		one.panel.extra = map[string][]Finding{}
		one.panel.swept = true
	}
	for _, at := range asked {
		got[at] = got[at]
	}
	for path, said := range got {
		one.panel.extra[path] = said
		one.shows(tree, path)
	}
}

// Whether no run goes, none waits, and the whole tree lands once. [[spec/design_output/lsp#a-port-serves-the-list]]
func (one *server) settled() bool {
	one.guard.Lock()
	defer one.guard.Unlock()
	return one.panel.swept && !one.panel.running && !one.panel.whole &&
		len(one.panel.owed) == 0 && len(one.panel.pending) == 0
}

// A change waits the quiet span, and every change inside it joins one run. [[spec/design_output/lsp#the-panel-lints-as-typed]]
func (one *server) asksSoon(at string) {
	one.guard.Lock()
	defer one.guard.Unlock()
	one.panel.pending[at] = true
	if one.timer != nil {
		one.timer.Stop()
	}
	one.timer = time.AfterFunc(one.quiet, one.asksHeld)
}

// The tools read every pending buffer as it stands, and each file redraws with the rows. [[spec/design_output/lsp#the-panel-lints-as-typed]]
func (one *server) asksHeld() {
	one.guard.Lock()
	paths := []string{}
	for at := range one.panel.pending {
		if one.panel.open[at] {
			paths = append(paths, at)
		}
	}
	one.panel.pending = map[string]bool{}
	one.guard.Unlock()
	if len(paths) > 0 {
		one.owes(paths, false)
	}
}

// A closed file reads off the disk again, and the tools read the disk too, because the buffer they read stands no more. [[spec/design_output/lsp#the-panel-lints-as-typed]]
func (one *server) closes(where string) {
	if where == "" {
		return
	}
	tree := one.checker.Tree()
	at := relativeTo(tree.Root, where)
	tree.Drops(at)
	got := grouped(one.checker.Over(at))

	one.guard.Lock()
	delete(one.panel.open, at)
	delete(one.panel.pending, at)
	one.panel.own[at] = got[at]
	one.shows(tree, at)
	one.guard.Unlock()
	one.owes([]string{at}, false)
}

func (one *server) showsAll(tree *Tree) {
	for path := range one.panel.paths() {
		one.shows(tree, path)
	}
}

// Every path a list names or a row draws. [[spec/design_output/lsp#the-panel-reads-the-battery]]
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

// The rows a file holds, this server's and the tools', under the guard. A file the disk and the editor hold nowhere holds none, and its lists go. [[spec/design_output/lsp#a-port-serves-the-list]]
func (one *server) rowsOf(tree *Tree, path string) []Finding {
	// A file the disk no longer holds draws nothing, whoever last found something in it, so a move or a delete clears its row. [[spec/design_output/lsp#the-panel-follows-the-index]]
	if !tree.Held(path) && !tree.Exists(path) {
		delete(one.panel.own, path)
		delete(one.panel.extra, path)
		return nil
	}
	return append(append([]Finding{}, one.panel.own[path]...), one.panel.extra[path]...)
}

// An open file leaves Biome to its own server, which draws it as it is typed. Vale stays here, because the battery's list carries the tense reader's veto. [[spec/design_output/lsp#the-panel-reads-the-battery]]
func (one *server) shows(tree *Tree, path string) {
	said := []Finding{}
	for _, each := range one.rowsOf(tree, path) {
		if one.panel.open[path] && each.Source == fromBiome {
			continue
		}
		said = append(said, each)
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
