// The lsp IO module. tests-red holds this stub, and tests-green fills it.
// [[spec/tickets/the-lsp-door-lands]]
package lsp

import (
	"errors"

	"quackitect/src/q"
)

// The family the module writes, by its local name. [[spec/design_output/model#the-topics-and-their-writers]]
const BuffersName = "buffers/<path...>"

// The file the listen writes its port and token to, under the root. .claude/skills/level0/lib/folders.js owns the folder. [[spec/tickets/the-lsp-door-lands]]
const StandingFile = ".se/.runtime/lsp.json"

// One finding as the check module's sweep answers it. [[spec/tickets/the-lsp-door-lands]]
type Finding struct {
	File     string `json:"file"`
	Rule     string `json:"rule"`
	Line     int    `json:"line"`
	Column   int    `json:"column"`
	Message  string `json:"message"`
	Severity string `json:"severity"`
}

// What the server reaches. [[spec/tickets/the-lsp-door-lands]]
type Outside struct {
	Root  string
	Store *q.Store
	As    q.Writer
	Bound func(local string) string
	Sweep func() any
}

// [[spec/tickets/the-lsp-door-lands]]
type Server struct{ from Outside }

// [[spec/design_output/model#an-inbound-fake-replays]]
type Mismatch struct {
	Line int
	Want string
	Got  string
}

// [[spec/tickets/the-lsp-door-lands]]
type Standing struct {
	Port  int    `json:"port"`
	Token string `json:"token"`
}

// [[spec/tickets/the-lsp-door-lands]]
func Registers(c *q.Catalog) q.Writer {
	return q.OutIn(c, BuffersName, "", q.IO(), q.Doc("the unsaved text of a file an editor holds open"))
}

// [[spec/tickets/the-lsp-door-lands]]
func New(from Outside) *Server { return &Server{from: from} }

// [[spec/tickets/the-lsp-door-lands]]
func (s *Server) Handle(message []byte) [][]byte { return nil }

// [[spec/tickets/the-lsp-door-lands]]
func Listen(root string, server *Server) (func(), error) {
	return nil, errors.New("the listener stands nowhere yet")
}

// [[spec/design_output/model#an-inbound-fake-replays]]
func Replay(server *Server, recording []byte) ([]Mismatch, error) {
	return []Mismatch{{Line: 1, Want: "a replay", Got: "a stub"}}, nil
}
