// The fold over the frontmatter, answered off the check module's read.
// [[spec/design_input/the-editor-draws-the-ticket#one-file-holds-both-halves]]
package main

import (
	"encoding/json"

	"quackitect/src/modules/check"
)

// The folds of a file, read off the buffer the tree holds. [[spec/design_input/the-editor-draws-the-ticket#one-file-holds-both-halves]]
func (one *server) folds(params json.RawMessage) []check.FoldingRange {
	var said struct {
		TextDocument struct {
			URI string `json:"uri"`
		} `json:"textDocument"`
	}
	if json.Unmarshal(params, &said) != nil {
		return []check.FoldingRange{}
	}
	where := pathOf(said.TextDocument.URI)
	if where == "" {
		return []check.FoldingRange{}
	}
	tree := one.checker.Tree()
	return check.FoldsOf(tree.Read(relativeTo(tree.Root, where)))
}
