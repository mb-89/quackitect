// What the schema allows at the cursor, answered off the check module's read
// over the tree.
// [[spec/design_output/lsp#the-completion-reads-the-schema]]
package main

import (
	"encoding/json"

	"quackitect/src/modules/check"
	"quackitect/src/modules/lsp"
)

// [[spec/design_output/lsp#the-completion-reads-the-schema]]
var triggers = lsp.Triggers

// [[spec/design_output/lsp#the-completion-reads-the-schema]]
func (one *server) completes(params json.RawMessage) []check.Completion {
	var said struct {
		TextDocument struct {
			URI string `json:"uri"`
		} `json:"textDocument"`
		Position position `json:"position"`
	}
	if json.Unmarshal(params, &said) != nil {
		return []check.Completion{}
	}
	where := pathOf(said.TextDocument.URI)
	if where == "" {
		return []check.Completion{}
	}
	tree := one.checker.Tree()
	return check.Offers(tree, relativeTo(tree.Root, where), said.Position.Line, said.Position.Character)
}
