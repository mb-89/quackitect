// The hover over a term, answered off the check module's read over the tree.
// [[spec/design_output/lsp#the-hover-shows-a-term]]
package main

import (
	"encoding/json"

	"quackitect/src/modules/check"
)

// [[spec/design_output/lsp#the-hover-shows-a-term]]
func (one *server) hovers(params json.RawMessage) *check.Hover {
	var said struct {
		TextDocument struct {
			URI string `json:"uri"`
		} `json:"textDocument"`
		Position position `json:"position"`
	}
	if json.Unmarshal(params, &said) != nil {
		return nil
	}
	where := pathOf(said.TextDocument.URI)
	if where == "" {
		return nil
	}
	tree := one.checker.Tree()
	return check.HoverAt(tree, relativeTo(tree.Root, where), said.Position.Line, said.Position.Character)
}
