// The reads the editor's features answer: the hover over a term, the
// completion at the cursor, the links a file's pointers draw, and the fold
// over the frontmatter. Each reads the tree and nothing past it.
// [[spec/tickets/lsp-module-serves-the-features]]
package check

// A place in a file as the protocol counts it: rows from zero, and a column in UTF-16 units. [[spec/tickets/lsp-module-serves-the-features]]
type Position struct {
	Line      int `json:"line"`
	Character int `json:"character"`
}

// [[spec/tickets/lsp-module-serves-the-features]]
type Span struct {
	Start Position `json:"start"`
	End   Position `json:"end"`
}

// [[spec/tickets/lsp-module-serves-the-features]]
type Hover struct {
	Contents Markup `json:"contents"`
}

// [[spec/tickets/lsp-module-serves-the-features]]
type Markup struct {
	Kind  string `json:"kind"`
	Value string `json:"value"`
}

// [[spec/tickets/lsp-module-serves-the-features]]
type Completion struct {
	Label      string    `json:"label"`
	Kind       int       `json:"kind"`
	Detail     string    `json:"detail,omitempty"`
	InsertText string    `json:"insertText,omitempty"`
	TextEdit   *TextEdit `json:"textEdit,omitempty"`
}

// [[spec/tickets/lsp-module-serves-the-features]]
type TextEdit struct {
	Range   Span   `json:"range"`
	NewText string `json:"newText"`
}

// [[spec/tickets/lsp-module-serves-the-features]]
type DocumentLink struct {
	Range   Span   `json:"range"`
	Target  string `json:"target"`
	Tooltip string `json:"tooltip,omitempty"`
}

// [[spec/tickets/lsp-module-serves-the-features]]
type FoldingRange struct {
	StartLine int    `json:"startLine"`
	EndLine   int    `json:"endLine"`
	Kind      string `json:"kind,omitempty"`
}

// The term under the cursor and the line the dictionary holds for it. [[spec/tickets/lsp-module-serves-the-features]]
func HoverAt(tree *Tree, path string, line, character int) *Hover { return nil }

// What the schema allows at the cursor. [[spec/tickets/lsp-module-serves-the-features]]
func Offers(tree *Tree, path string, line, character int) []Completion { return nil }

// Every pointer of the file that lands on a file, with its target. [[spec/tickets/lsp-module-serves-the-features]]
func LinksIn(tree *Tree, path string) []DocumentLink { return nil }

// The fold over the frontmatter, fence to fence. [[spec/tickets/lsp-module-serves-the-features]]
func FoldsOf(text string) []FoldingRange { return nil }
