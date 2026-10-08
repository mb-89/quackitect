// The runs of the tools over the server's tree: a change waits its quiet span,
// the listen runs the whole tree once, and each run publishes every file whose
// rows move, closed files among them.
// [[spec/tickets/lsp-module-draws-the-tools]]
package lsp

import (
	"net/url"
	"path/filepath"
	"strings"
	"time"
)

// The quiet span a change waits before the tools read its buffer, where the wiring names none. [[spec/design_output/lsp#the-panel-lints-as-typed]]
const lintQuiet = 400 * time.Millisecond

// Hands the server the writer a publish off a run of the tools goes to. [[spec/tickets/lsp-module-draws-the-tools]]
func (s *Server) Pushes(push func(bodies ...[]byte)) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.push = push
}

// Waits until every run of the tools a change asked for lands. [[spec/tickets/lsp-module-draws-the-tools]]
func (s *Server) Settle() {
	s.pending.Wait()
}

// Every file whose rows move after one whole run of the tools, each as a publish. [[spec/tickets/lsp-module-draws-the-tools]]
func (s *Server) SweepTools() [][]byte {
	if s.from.Tools == nil {
		return nil
	}
	s.runs.Lock()
	defer s.runs.Unlock()
	s.mu.Lock()
	tree := s.tree()
	s.mu.Unlock()
	rows := s.from.Tools.Sweep(tree)
	s.mu.Lock()
	defer s.mu.Unlock()
	s.tools = byFile(rows)
	return s.publishAll(nil)
}

// The tree the tools and the features read: the files git tracks, each open buffer over its file. The caller holds the lock. [[spec/tickets/lsp-module-draws-the-tools]]
func (s *Server) tree() Tree {
	texts := map[string]string{}
	if s.from.Files != nil {
		for at, text := range s.from.Files() {
			texts[at] = text
		}
	}
	tree := s.from.Check.Tree(texts)
	for at, text := range s.open {
		if text != "" {
			tree.Holds(at, text)
		}
	}
	return tree
}

// A run of the tools over the path once its quiet span passes, and a later change starts the span again. The caller holds the lock. [[spec/design_output/lsp#the-panel-lints-as-typed]]
func (s *Server) schedule(at string) {
	if s.from.Tools == nil {
		return
	}
	if stop := s.timers[at]; stop != nil && stop() {
		s.pending.Done()
	}
	quiet := s.from.Quiet
	if quiet < 0 {
		quiet = lintQuiet
	}
	s.pending.Add(1)
	s.timers[at] = s.from.Clock.AfterFunc(quiet, func() {
		defer s.pending.Done()
		s.runOver([]string{at})
	})
}

// Runs the tools over the paths, keeps their rows, and pushes a publish for each file whose rows move. One run goes at a time. [[spec/design_output/lsp#the-panel-follows-the-index]]
func (s *Server) runOver(paths []string) {
	s.runs.Lock()
	defer s.runs.Unlock()
	s.mu.Lock()
	tree := s.tree()
	s.mu.Unlock()
	rows := s.from.Tools.Over(tree, paths)
	s.mu.Lock()
	touched := map[string]bool{}
	for _, at := range paths {
		delete(s.tools, at)
		touched[at] = true
	}
	for at, held := range byFile(rows) {
		s.tools[at] = held
		touched[at] = true
	}
	bodies := s.publishAll(touched)
	push := s.push
	s.mu.Unlock()
	if push != nil && len(bodies) > 0 {
		push(bodies...)
	}
}

// Runs the tools again over what a commit moves: the whole tree where a file the tools read moves, else the files it names. [[spec/design_output/lsp#the-panel-follows-the-index]]
func (s *Server) follows(values map[string]any) {
	if s.from.Tools == nil {
		return
	}
	moved := []string{}
	for name := range values {
		if at, ok := strings.CutPrefix(name, filesPrefix); ok {
			moved = append(moved, at)
		}
	}
	if len(moved) == 0 {
		return
	}
	if s.from.Tools.readByTools(moved) {
		bodies := s.SweepTools()
		s.mu.Lock()
		push := s.push
		s.mu.Unlock()
		if push != nil && len(bodies) > 0 {
			push(bodies...)
		}
		return
	}
	s.runOver(moved)
}

// The publish for each path the set names, or for every path that holds a row or drew one before where the set is nil. The caller holds the lock. [[spec/tickets/lsp-module-draws-the-tools]]
func (s *Server) publishAll(only map[string]bool) [][]byte {
	swept := byFile(s.sweep())
	paths := map[string]bool{}
	for at := range swept {
		paths[at] = true
	}
	for at := range s.tools {
		paths[at] = true
	}
	for at := range s.sent {
		paths[at] = true
	}
	for at := range s.open {
		paths[at] = true
	}
	var out [][]byte
	for at := range paths {
		if only != nil && !only[at] {
			continue
		}
		if body := s.drawn(s.uriOf(at), at, swept[at], false); body != nil {
			out = append(out, body)
		}
	}
	return out
}

// The rows by the file each names. [[spec/tickets/lsp-module-draws-the-tools]]
func byFile(rows []Finding) map[string][]Finding {
	out := map[string][]Finding{}
	for _, one := range rows {
		out[one.File] = append(out[one.File], one)
	}
	return out
}

// The file address a path under the root takes, the one an editor names it by. [[spec/tickets/lsp-module-draws-the-tools]]
func (s *Server) uriOf(at string) string {
	if uri, ok := s.uris[at]; ok {
		return uri
	}
	said := filepath.ToSlash(filepath.Join(s.from.Root, filepath.FromSlash(at)))
	if !strings.HasPrefix(said, "/") {
		said = "/" + said
	}
	return "file://" + (&url.URL{Path: said}).EscapedPath()
}
