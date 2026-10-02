// The features the lsp IO module answers over the protocol: the hover, the
// completion, the links and the fold, each read by the check module through
// the ports the wiring fills.
// [[spec/tickets/lsp-module-serves-the-features]]
package lsp

import "encoding/json"

// The characters an editor asks for a completion again on. [[spec/design_output/lsp#the-completion-reads-the-schema]]
var Triggers = []string{":", " ", "#", "["}

// What initialize announces: full-text sync, and the four features the check module reads. [[spec/tickets/lsp-module-serves-the-features]]
var capabilities = map[string]any{
	"textDocumentSync":     syncFull,
	"documentLinkProvider": map[string]any{"resolveProvider": false},
	"completionProvider":   map[string]any{"triggerCharacters": Triggers},
	"foldingRangeProvider": true,
	"hoverProvider":        true,
}

// A feature's answer over the tree at the file and the cursor a request names, and the empty answer where the request names no file of the tree. The caller holds the lock. [[spec/tickets/lsp-module-serves-the-features]]
func (s *Server) reads(feature Feature, params json.RawMessage, empty any) any {
	var said struct {
		TextDocument document `json:"textDocument"`
		Position     position `json:"position"`
	}
	if feature == nil || s.from.Check.Tree == nil || json.Unmarshal(params, &said) != nil {
		return empty
	}
	at, ok := s.pathOf(said.TextDocument.URI)
	if !ok {
		return empty
	}
	return feature(s.tree(), at, said.Position.Line, said.Position.Character)
}
