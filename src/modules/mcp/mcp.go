// The mcp IO module: one tool an action of the registry, each answering
// within the wait its call sets, over MCP's streamable HTTP. It keeps no tool
// list of its own, and its fake replays a recording.
// [[spec/tickets/the-mcp-module-lands]]
package mcp

import (
	"bufio"
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"reflect"
	"time"

	"github.com/danielgtaylor/huma/v2"

	"quackitect/src/q"
	"quackitect/src/q/tool"
)

// The local name of the default wait, in seconds, which the wiring binds under the instance. [[spec/design_output/model#a-caller-sets-its-wait]]
const (
	WaitKey     = "wait"
	defaultWait = 1
)

// The file the listen writes its port and token to, under the root. .claude/skills/level0/lib/folders.js owns the folder, and a module spells it again. [[spec/tickets/the-mcp-module-lands]]
const StandingFile = ".se/.runtime/mcp.json"

// The protocol's words: the version and the name the server answers, its methods, and the JSON-RPC error codes. [[spec/tickets/the-mcp-module-lands]]
const (
	protocolVersion = "2025-06-18"
	serverName      = "quackitect"
	serverVersion   = "1.0.0"
	rpcVersion      = "2.0"
	initialize      = "initialize"
	ping            = "ping"
	toolsList       = "tools/list"
	toolsCall       = "tools/call"
	noMethod        = -32601
	badParams       = -32602
	sessionHeader   = "Mcp-Session-Id"
	schemaRefs      = "#/components/schemas/"
)

// The cap on a post's body, the span a request's header takes to read, the bytes of the token and of a session id, and the scheme the post carries the token under. [[spec/tickets/hooks-standing-file-names-token]]
const (
	bodyCap           = 1 << 20
	headerReadTimeout = 5 * time.Second
	tokenBytes        = 16
	sessionBytes      = 8
	bearer            = "Bearer "
)

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

// The server over the store's actions, reading its tools at each ask. [[spec/tickets/the-mcp-module-lands]]
type Server struct {
	from Outside
}

// One line of a recording whose response differs from the server's. [[spec/design_output/model#an-inbound-fake-replays]]
type Mismatch struct {
	Line int
	Want string
	Got  string
}

// What the standing file holds: the port, and the token a post carries. [[spec/tickets/hooks-standing-file-names-token]]
type Standing struct {
	Port  int    `json:"port"`
	Token string `json:"token"`
}

// One JSON-RPC message as a client sends it. A request short of an id is a notification. [[spec/tickets/the-mcp-module-lands]]
type request struct {
	ID     json.RawMessage `json:"id,omitempty"`
	Method string          `json:"method"`
	Params json.RawMessage `json:"params,omitempty"`
}

type rpcError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

type response struct {
	RPC    string          `json:"jsonrpc"`
	ID     json.RawMessage `json:"id"`
	Result any             `json:"result,omitempty"`
	Error  *rpcError       `json:"error,omitempty"`
}

type content struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

type toolResult struct {
	Content []content `json:"content"`
	IsError bool      `json:"isError"`
}

// The module type the wiring loads as mcp. [[spec/tickets/the-mcp-module-lands]]
func Registers(c *q.Catalog) q.Writer {
	return q.CfgIn(c, WaitKey, defaultWait, q.IO(), q.Doc("the seconds a tool call over MCP waits on its action, where the call sets none"))
}

// [[spec/tickets/the-mcp-module-lands]]
func New(from Outside) (*Server, error) { return &Server{from: from}, nil }

// One tool an action the store holds now: its name as every surface spells it, its doc, and its input schema with the wait argument. [[spec/design_output/model#what-each-surface-gets]]
func (s *Server) Tools() []Tool {
	registry := huma.NewMapRegistry(schemaRefs, huma.DefaultSchemaNamer)
	var out []Tool
	for _, name := range s.from.Store.Names() {
		in, _, ok := s.from.Store.Types(name)
		if !ok {
			continue
		}
		schema, _, err := tool.Schema(registry, in)
		if err != nil {
			continue
		}
		looks, _ := s.from.Store.Presentation(name)
		out = append(out, Tool{Name: tool.Name(name), Description: looks.Doc, InputSchema: waits(schema, in)})
	}
	return out
}

// The schema with the wait argument among its properties, where the input declares none of its own. [[spec/design_output/model#a-caller-sets-its-wait]]
func waits(schema map[string]any, in reflect.Type) map[string]any {
	props, ok := schema["properties"].(map[string]any)
	if !ok {
		props = map[string]any{}
		schema["properties"] = props
	}
	if _, declared := props[tool.WaitArg]; !declared {
		props[tool.WaitArg] = map[string]any{"type": "number", "minimum": 0, "description": "the seconds this call waits on its action before it answers still running"}
	}
	return schema
}

// Answers one JSON-RPC message, and the session id it runs under: initialize hands one where the client carries none. A notification answers nothing. [[spec/tickets/the-mcp-module-lands]]
func (s *Server) Handle(session string, body []byte) ([]byte, string) {
	var in request
	if err := json.Unmarshal(body, &in); err != nil {
		return marshal(response{RPC: rpcVersion, ID: json.RawMessage("null"), Error: &rpcError{Code: badParams, Message: err.Error()}}), session
	}
	if len(in.ID) == 0 {
		return nil, session
	}
	out := response{RPC: rpcVersion, ID: in.ID}
	switch in.Method {
	case initialize:
		if session == "" {
			session = newID(sessionBytes)
		}
		out.Result = map[string]any{
			"protocolVersion": protocolVersion,
			"capabilities":    map[string]any{"tools": map[string]any{"listChanged": false}},
			"serverInfo":      map[string]any{"name": serverName, "version": serverVersion},
		}
	case ping:
		out.Result = map[string]any{}
	case toolsList:
		tools := s.Tools()
		if tools == nil {
			tools = []Tool{}
		}
		out.Result = map[string]any{"tools": tools}
	case toolsCall:
		out.Result, out.Error = s.calls(session, in.Params)
	default:
		out.Error = &rpcError{Code: noMethod, Message: in.Method + " names no method this server answers"}
	}
	return marshal(out), session
}

// The action a tool names, called within the call's wait or the key's: its result as text, the line saying it still runs, or its failure as isError. [[spec/design_output/model#a-caller-sets-its-wait]]
func (s *Server) calls(session string, params json.RawMessage) (any, *rpcError) {
	var asked struct {
		Name      string         `json:"name"`
		Arguments map[string]any `json:"arguments"`
	}
	if err := json.Unmarshal(params, &asked); err != nil {
		return nil, &rpcError{Code: badParams, Message: err.Error()}
	}
	action, ok := tool.Action(s.from.Store, asked.Name)
	if !ok || s.from.Call == nil {
		return nil, &rpcError{Code: badParams, Message: asked.Name + " names no tool"}
	}
	input, err := tool.Input(s.from.Store, action, asked.Arguments)
	if err != nil {
		return failed(err.Error()), nil
	}
	wait := tool.Wait(asked.Arguments, s.from.Store.Snapshot().Read(s.from.Bound("config/"+WaitKey)), defaultWait*time.Second)
	said, err := s.from.Call(action, input, session, wait)
	switch {
	case err != nil:
		return failed(err.Error()), nil
	case said.Running:
		return toolResult{Content: []content{{Type: "text", Text: tool.Running(action, said.Fraction, said.Gone, said.Handle)}}}, nil
	case said.Error != "":
		return failed(fmt.Sprintf("%s fails: %s", action, said.Error)), nil
	}
	text, err := json.Marshal(said.Result)
	if err != nil {
		return failed(err.Error()), nil
	}
	return toolResult{Content: []content{{Type: "text", Text: string(text)}}}, nil
}

func failed(text string) toolResult {
	return toolResult{Content: []content{{Type: "text", Text: text}}, IsError: true}
}

func marshal(out response) []byte {
	body, _ := json.Marshal(out)
	return body
}

func newID(bytes int) string {
	secret := make([]byte, bytes)
	rand.Read(secret)
	return hex.EncodeToString(secret)
}

// Serves POST /mcp on loopback behind a token, and writes the port and the token to the standing file, the way the hooks door does. [[spec/tickets/the-mcp-module-lands]]
func Listen(root string, server *Server) (func(), error) {
	token := newID(tokenBytes)
	listen, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return nil, err
	}
	mux := http.NewServeMux()
	mux.HandleFunc("POST /mcp", server.serves(token))
	serving := &http.Server{Handler: mux, ReadHeaderTimeout: headerReadTimeout}
	go serving.Serve(listen)
	at := filepath.Join(root, filepath.FromSlash(StandingFile))
	body, err := json.Marshal(Standing{Port: listen.Addr().(*net.TCPAddr).Port, Token: token})
	if err == nil {
		err = os.MkdirAll(filepath.Dir(at), 0o755)
	}
	if err == nil {
		err = os.WriteFile(at, body, 0o600)
	}
	if err != nil {
		serving.Close()
		return nil, err
	}
	return func() {
		serving.Close()
		os.Remove(at)
	}, nil
}

// A post short of the token answers 401, a body past the cap 400, a notification 202, and every request its JSON-RPC answer with the session id in its header. [[spec/tickets/the-mcp-module-lands]]
func (s *Server) serves(token string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != bearer+token {
			http.Error(w, "the post carries no token the standing file names", http.StatusUnauthorized)
			return
		}
		body, err := io.ReadAll(io.LimitReader(r.Body, bodyCap))
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		reply, session := s.Handle(r.Header.Get(sessionHeader), body)
		if session != "" {
			w.Header().Set(sessionHeader, session)
		}
		if reply == nil {
			w.WriteHeader(http.StatusAccepted)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(reply)
	}
}

// One line of a recording: the session, the request as the client sends it, and the response the server gives, null for a notification. [[spec/design_output/model#an-inbound-fake-replays]]
type recorded struct {
	Session  string          `json:"session"`
	Request  json.RawMessage `json:"request"`
	Response json.RawMessage `json:"response"`
}

// The inbound fake: it drives the server off a recording, one request a line, and answers each line whose response differs. [[spec/design_output/model#an-inbound-fake-replays]]
func Replay(server *Server, recording []byte) ([]Mismatch, error) {
	var missed []Mismatch
	scan := bufio.NewScanner(bytes.NewReader(recording))
	scan.Buffer(nil, bodyCap)
	for n := 1; scan.Scan(); n++ {
		line := bytes.TrimSpace(scan.Bytes())
		if len(line) == 0 {
			continue
		}
		var one recorded
		if err := json.Unmarshal(line, &one); err != nil {
			return nil, fmt.Errorf("line %d: %w", n, err)
		}
		got, _ := server.Handle(one.Session, one.Request)
		if !same(one.Response, got) {
			missed = append(missed, Mismatch{Line: n, Want: string(one.Response), Got: string(got)})
		}
	}
	return missed, scan.Err()
}

// Whether two JSON bodies decode alike, with an empty body reading as null. [[spec/design_output/model#an-inbound-fake-replays]]
func same(want, got []byte) bool {
	var a, b any
	if len(bytes.TrimSpace(want)) > 0 && json.Unmarshal(want, &a) != nil {
		return false
	}
	if len(bytes.TrimSpace(got)) > 0 && json.Unmarshal(got, &b) != nil {
		return false
	}
	return reflect.DeepEqual(a, b)
}
