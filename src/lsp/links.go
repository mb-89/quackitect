// The pointers a file writes, answered as links an editor draws and opens. A
// pointer resolves the way the resolve rule reads it, and a chapter lands on
// the line its heading stands on.
// [[spec/design_output/lsp#a-pointer-opens-its-target]]
package main

import (
	"encoding/json"
	"path/filepath"
	"strconv"
	"strings"
	"unicode/utf16"

	"quackitect/yaml"
)

// [[spec/design_output/lsp#a-pointer-opens-its-target]]
type documentLink struct {
	Range   span   `json:"range"`
	Target  string `json:"target"`
	Tooltip string `json:"tooltip,omitempty"`
}

// The file an editor asks about, off the request's params. [[spec/design_output/lsp#a-pointer-opens-its-target]]
func (one *server) links(params json.RawMessage) []documentLink {
	where, _ := opened(params)
	if where == "" {
		return []documentLink{}
	}
	tree := one.checker.Tree()
	return linksIn(tree, relativeTo(tree.Root, where))
}

// Every pointer of the file that lands on a file, with its target. [[spec/design_output/lsp#a-pointer-opens-its-target]]
func linksIn(tree *Tree, path string) []documentLink {
	out := []documentLink{}
	text := tree.Read(path)
	if !textual(text) {
		return out
	}
	rows := yaml.SplitLines(text)
	held := placesIn(tree)
	for _, one := range pointersIn(path, rows) {
		target, ok := landing(tree, held, one.target)
		if !ok {
			continue
		}
		row := rows[one.line-1]
		out = append(out, documentLink{
			Range: span{
				Start: position{Line: one.line - 1, Character: units(row[:one.start])},
				End:   position{Line: one.line - 1, Character: units(row[:one.end])},
			},
			Target:  target,
			Tooltip: "open " + one.target,
		})
	}
	return out
}

// The URI a pointer opens, and the heading's line where it names a chapter. [[spec/design_output/lsp#a-pointer-opens-its-target]]
func landing(tree *Tree, held places, target string) (string, bool) {
	name, anchor, chaptered := strings.Cut(target, "#")
	at := held.fileOf(name)
	if at == "" || !held.paths[at] {
		return "", false
	}
	uri := uriOf(filepath.Join(tree.Root, filepath.FromSlash(at)))
	if !chaptered {
		return uri, true
	}
	found, ok := chapterOf(tree, at, strings.TrimSpace(anchor))
	if !ok {
		return "", false
	}
	return uri + "#L" + strconv.Itoa(found.Line), true
}

// A column in UTF-16 units, the unit the protocol counts by default. [[spec/design_output/lsp#a-pointer-opens-its-target]]
func units(said string) int {
	return len(utf16.Encode([]rune(said)))
}
