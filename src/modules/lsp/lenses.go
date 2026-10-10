// The buttons over a ticket: which ones stand, the press behind each, and the
// fill a save runs. The rules read a ticket's text and the holds alone, and
// the ports the wiring fills reach the store, the actions and the disk.
// [[spec/tickets/lsp-draws-the-ticket-lenses]]
package lsp

import "encoding/json"

// The command each lens runs, which the client's middleware reads too. [[spec/tickets/lsp-draws-the-ticket-lenses]]
const TicketCommand = "quackitect.ticket"

// The levels window/showMessage draws at. [[spec/tickets/lsp-draws-the-ticket-lenses]]
const (
	messageWarning = 2
	messageInfo    = 3
)

// The methods the buttons speak. [[spec/tickets/lsp-draws-the-ticket-lenses]]
const (
	codeLens       = "textDocument/codeLens"
	executeCommand = "workspace/executeCommand"
	didSave        = "textDocument/didSave"
)

// One standing hold, field for field as the holds module answers holds/standing. [[spec/tickets/lsp-draws-the-ticket-lenses]]
type Hold struct {
	Ticket string `json:"ticket"`
	Path   string `json:"path"`
	Step   string `json:"step"`
	Hand   string `json:"hand"`
	Person bool   `json:"person"`
}

// A verb's action answered as a run. [[spec/tickets/lsp-draws-the-ticket-lenses]]
type Ran struct {
	Code int    `json:"code"`
	Out  string `json:"out"`
	Err  string `json:"err"`
}

// What the server reaches for the lenses. [[spec/tickets/lsp-draws-the-ticket-lenses]]
type Tickets struct {
	Holds func() []Hold
	Cloud func() []string
	Act   func(name string, input any) Ran
	Save  func(path, text string) error
	Names []string
}

type step struct {
	path, by      string
	verdict, leaf bool
}

func stepsIn(string) []*step { return nil }

func (s *Server) lenses(json.RawMessage) any { return []any{} }

func (s *Server) presses(id, _ json.RawMessage) [][]byte { return [][]byte{answers(id, nil)} }

func (s *Server) fills(json.RawMessage) [][]byte { return nil }

// Whether a commit's values name one the lenses read. [[spec/tickets/lsp-draws-the-ticket-lenses]]
func (s *Server) MovesLenses(map[string]any) bool { return false }

// The request that asks the client for the lenses again. [[spec/tickets/lsp-draws-the-ticket-lenses]]
func (s *Server) Refresh() []byte { return nil }
