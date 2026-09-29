// The mcp IO module: one tool an action of the registry, each answering
// within the wait its call sets, over MCP's streamable HTTP. It keeps no tool
// list of its own, and its fake replays a recording.
// [[spec/tickets/the-mcp-module-lands]]
package mcp

import (
	"time"

	"quackitect/src/q"
)

// The local name of the default wait, in seconds, which the wiring binds under the instance. [[spec/design_output/model#a-caller-sets-its-wait]]
const (
	WaitKey     = "wait"
	defaultWait = 1
)

// The file the listen writes its port and token to, under the root. .claude/skills/level0/lib/folders.js owns the folder, and a module spells it again. [[spec/tickets/the-mcp-module-lands]]
const StandingFile = ".se/.runtime/mcp.json"

// The result within the wait, or the operation still running past it, field for field as the manager answers it. [[spec/design_output/model#a-caller-sets-its-wait]]
type Called struct {
	Result   any           `json:"result,omitempty"`
	Error    string        `json:"error,omitempty"`
	Running  bool          `json:"running"`
	Handle   string        `json:"handle"`
	Fraction float64       `json:"fraction"`
	Gone     time.Duration `json:"gone"`
}

// The manager's call of an action. [[spec/design_output/model#a-caller-sets-its-wait]]
type Call func(name string, input any, caller string, wait time.Duration) (Called, error)

// What the server reaches: the store its actions stand in, the name a local name binds to, and the manager's call. [[spec/tickets/the-mcp-module-lands]]
type Outside struct {
	Store *q.Store
	Bound func(local string) string
	Call  Call
}

// One tool as tools/list answers it. [[spec/design_output/model#what-each-surface-gets]]
type Tool struct {
	Name        string         `json:"name"`
	Description string         `json:"description"`
	InputSchema map[string]any `json:"inputSchema"`
}

// [[spec/tickets/the-mcp-module-lands]]
type Server struct {
	from Outside
}

// One line of a recording whose response differs from the server's. [[spec/design_output/model#an-inbound-fake-replays]]
type Mismatch struct {
	Line int
	Want string
	Got  string
}

// The module type the wiring loads as mcp. [[spec/tickets/the-mcp-module-lands]]
func Registers(c *q.Catalog) q.Writer {
	return q.CfgIn(c, WaitKey, defaultWait, q.IO(), q.Doc("the seconds a tool call over MCP waits on its action, where the call sets none"))
}

// [[spec/tickets/the-mcp-module-lands]]
func New(from Outside) (*Server, error) { return &Server{from: from}, nil }

// [[spec/tickets/the-mcp-module-lands]]
func (s *Server) Tools() []Tool { return nil }

// [[spec/tickets/the-mcp-module-lands]]
func (s *Server) Handle(session string, body []byte) ([]byte, string) { return nil, session }

// [[spec/tickets/the-mcp-module-lands]]
func Listen(root string, server *Server) (func(), error) { return func() {}, nil }

// [[spec/design_output/model#an-inbound-fake-replays]]
func Replay(server *Server, recording []byte) ([]Mismatch, error) { return nil, nil }
