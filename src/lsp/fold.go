// The fold over the frontmatter, from the opening fence to the closing one.
// [[spec/design_input/the-editor-draws-the-ticket#one-file-holds-both-halves]]
package main

type foldingRange struct {
	StartLine int    `json:"startLine"`
	EndLine   int    `json:"endLine"`
	Kind      string `json:"kind,omitempty"`
}

// [[spec/design_input/the-editor-draws-the-ticket#one-file-holds-both-halves]]
func foldsOf(text string) []foldingRange {
	return []foldingRange{}
}
