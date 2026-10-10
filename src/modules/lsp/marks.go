// The marks over the fields a person's hold still wants: the hint at each
// line, the hover naming what it asks, and the cursor a new take moves.
// [[spec/design_output/lsp#a-take-marks-the-fields]]
package lsp

import (
	"encoding/json"
	"fmt"
	"strings"
)

// The code a mark's hint carries, which the client's middleware draws as the underline, and the method a new take moves the cursor through. [[spec/design_output/lsp#a-take-marks-the-fields]]
const (
	heldField    = "HeldField"
	showDocument = "window/showDocument"
)

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

type mark struct {
	line        int
	name, hover string
}

// Every field of the held leaf standing unfilled, at the line the drawing hands. [[spec/design_output/lsp#a-take-marks-the-fields]]
func marksIn(drawing Drawing, hold Hold) []mark {
	leaf, ok := drawing.Leaves[hold.Step]
	if !ok {
		return nil
	}
	var out []mark
	for _, field := range leaf.Fields {
		if !field.Filled {
			out = append(out, mark{line: field.Line, name: field.Name, hover: hoverOf(hold.Step, leaf, field)})
		}
	}
	return out
}

// The leaf's work, then the field's name, form and ask, then its items. [[spec/design_output/lsp#a-take-marks-the-fields]]
func hoverOf(step string, leaf DrawnLeaf, field DrawnField) string {
	says := ""
	if field.Says != "" {
		says = ": " + field.Says
	}
	lines := []string{"**" + step + "**: " + leaf.Does, "", "`" + field.Name + "` · " + field.Form + says}
	if len(field.Items) > 0 {
		lines = append(lines, "")
		for _, one := range field.Items {
			lines = append(lines, "- "+one)
		}
	}
	return strings.Join(lines, "\n")
}

// The holds the person stands in, off the port. [[spec/design_output/lsp#a-take-marks-the-fields]]
func (s *Server) personal() []Hold {
	if s.from.Tickets.Holds == nil || s.from.Tickets.Drawn == nil {
		return nil
	}
	var out []Hold
	for _, one := range s.from.Tickets.Holds() {
		if one.Person {
			out = append(out, one)
		}
	}
	return out
}

// The marks over a path, where the person holds a leaf of its ticket. [[spec/design_output/lsp#a-take-marks-the-fields]]
func (s *Server) marksAt(at string) []mark {
	ticket := ticketOf(at)
	if ticket == "" {
		return nil
	}
	for _, one := range s.personal() {
		if one.Ticket == ticket {
			return marksIn(s.from.Tickets.Drawn(at), one)
		}
	}
	return nil
}

// The marks over a path as hint rows beside the sweep's. [[spec/design_output/lsp#a-take-marks-the-fields]]
func (s *Server) markRows(at string) []Finding {
	var out []Finding
	for _, one := range s.marksAt(at) {
		out = append(out, Finding{File: at, Rule: heldField, Line: one.line, Column: 1, Message: fmt.Sprintf("%s waits on the held leaf", one.name), Severity: hint})
	}
	return out
}

// The mark's text on a marked line, and the term hover on any other. The caller holds the lock. [[spec/design_output/lsp#a-take-marks-the-fields]]
func (s *Server) hovers(params json.RawMessage) any {
	var said struct {
		TextDocument document `json:"textDocument"`
		Position     position `json:"position"`
	}
	if json.Unmarshal(params, &said) == nil {
		if at, ok := s.pathOf(said.TextDocument.URI); ok {
			for _, one := range s.marksAt(at) {
				if one.line-1 == said.Position.Line {
					return map[string]any{"contents": map[string]any{"kind": "markdown", "value": one.hover}}
				}
			}
		}
	}
	return s.reads(s.from.Check.Hover, params, nil)
}

// The holds standing at the start, which move no cursor. The caller holds the lock. [[spec/design_output/lsp#a-take-marks-the-fields]]
func (s *Server) learns() {
	s.known = map[string]bool{}
	for _, one := range s.personal() {
		s.known[one.Ticket] = true
	}
}

// Whether a commit's values add a person's hold, and the cursor each new take moves to its first mark. [[spec/tickets/lsp-marks-the-held-fields]]
func (s *Server) Takes(values map[string]any) [][]byte {
	if !s.MovesLenses(values) {
		return nil
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	now := map[string]bool{}
	var out [][]byte
	for _, one := range s.personal() {
		now[one.Ticket] = true
		if s.known[one.Ticket] {
			continue
		}
		if marks := marksIn(s.from.Tickets.Drawn(one.Path), one); len(marks) > 0 {
			line := position{Line: max(marks[0].line-1, 0)}
			id := fmt.Sprintf("show-%d", s.asked.Add(1))
			out = append(out, marshal(map[string]any{"jsonrpc": rpcVersion, "id": id, "method": showDocument, "params": map[string]any{
				"uri": s.uriOf(one.Path), "takeFocus": true, "selection": map[string]any{"start": line, "end": line},
			}}))
		}
	}
	s.known = now
	return out
}
