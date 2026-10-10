// The marks over the fields a person's hold still wants: the hint at each
// line, the hover naming what it asks, and the cursor a new take moves.
// [[spec/design_output/lsp#a-take-marks-the-fields]]
package lsp

// A ticket's drawing, field for field as the tickets module answers tickets/drawn. [[spec/tickets/lsp-marks-the-held-fields]]
type Drawing struct {
	Leaves map[string]DrawnLeaf `json:"leaves"`
}

type DrawnLeaf struct {
	Does   string       `json:"does"`
	Fields []DrawnField `json:"fields"`
}

type DrawnField struct {
	Name   string   `json:"name"`
	Form   string   `json:"form"`
	Says   string   `json:"says"`
	Items  []string `json:"items"`
	Line   int      `json:"line"`
	Filled bool     `json:"filled"`
}

// Whether a commit's values add a person's hold, and the cursor each new take moves to its first mark. [[spec/tickets/lsp-marks-the-held-fields]]
func (s *Server) Takes(map[string]any) [][]byte { return nil }
