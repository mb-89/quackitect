// The fold over the frontmatter, from the opening fence to the closing one,
// so the drawing the editor host holds stands over it.
// [[spec/design_input/the-editor-draws-the-ticket#one-file-holds-both-halves]]
package main

import (
	"encoding/json"
	"strings"
)

// The kind the protocol names for a fold that is neither a comment nor an import. [[spec/design_input/the-editor-draws-the-ticket#one-file-holds-both-halves]]
const regionFold = "region"

type foldingRange struct {
	StartLine int    `json:"startLine"`
	EndLine   int    `json:"endLine"`
	Kind      string `json:"kind,omitempty"`
}

// [[spec/design_input/the-editor-draws-the-ticket#one-file-holds-both-halves]]
func foldsOf(text string) []foldingRange {
	front := frontOf(strings.Split(text, "\n"))
	if !front.Stands {
		return []foldingRange{}
	}
	return []foldingRange{{StartLine: 0, EndLine: front.Close, Kind: regionFold}}
}

// The folds of a file, read off the buffer the tree holds. [[spec/design_input/the-editor-draws-the-ticket#one-file-holds-both-halves]]
func (one *server) folds(params json.RawMessage) []foldingRange {
	var said struct {
		TextDocument struct {
			URI string `json:"uri"`
		} `json:"textDocument"`
	}
	if json.Unmarshal(params, &said) != nil {
		return []foldingRange{}
	}
	where := pathOf(said.TextDocument.URI)
	if where == "" {
		return []foldingRange{}
	}
	tree := one.checker.Tree()
	return foldsOf(tree.Read(relativeTo(tree.Root, where)))
}
