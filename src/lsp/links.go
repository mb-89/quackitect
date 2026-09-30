// The pointers a file writes, answered as links off the check module's read
// over the tree.
// [[spec/design_output/lsp#a-pointer-opens-its-target]]
package main

import (
	"encoding/json"

	"quackitect/src/modules/check"
)

// The file an editor asks about, off the request's params. [[spec/design_output/lsp#a-pointer-opens-its-target]]
func (one *server) links(params json.RawMessage) []check.DocumentLink {
	where, _ := opened(params)
	if where == "" {
		return []check.DocumentLink{}
	}
	tree := one.checker.Tree()
	return check.LinksIn(tree, relativeTo(tree.Root, where))
}
