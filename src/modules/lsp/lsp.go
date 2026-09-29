// The lsp IO module: an editor's buffers written to the index, and the check
// module's sweep drawn back as diagnostics, over a listener behind a token.
// Its fake replays a recorded session.
// [[spec/tickets/the-lsp-door-lands]]
package lsp

import (
	"bufio"
	"bytes"
	"crypto/rand"
	"crypto/subtle"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/url"
	"os"
	"path/filepath"
	"reflect"
	"strconv"
	"strings"
	"sync"
	"time"
	"unicode/utf16"
	"unicode/utf8"

	"quackitect/src/q"
)

// The family the module writes, by its local name. [[spec/design_output/model#the-topics-and-their-writers]]
const BuffersName = "buffers/<path...>"

// The file the listen writes its port and token to, under the root. .claude/skills/level0/lib/folders.js owns the folder. [[spec/tickets/the-lsp-door-lands]]
const StandingFile = ".se/.runtime/lsp.json"

// The protocol's words: the version and the name the server answers, its methods, the full-text sync kind, and the JSON-RPC error code. [[spec/tickets/the-lsp-door-lands]]
const (
	rpcVersion    = "2.0"
	serverName    = "quackitect"
	serverVersion = "1.0.0"
	initialize    = "initialize"
	shutdown      = "shutdown"
	didOpen       = "textDocument/didOpen"
	didChange     = "textDocument/didChange"
	didClose      = "textDocument/didClose"
	publish       = "textDocument/publishDiagnostics"
	syncFull      = 1
	noMethod      = -32601
)

// The severities a finding carries, and the levels the protocol draws them at. [[spec/design_output/lsp#a-finding-is-a-diagnostic]]
const (
	warning      = "warning"
	hint         = "hint"
	levelError   = 1
	levelWarning = 2
	levelHint    = 4
)

// The cap on one frame's body, the span the token line takes to arrive, and the bytes of the token. [[spec/tickets/hooks-standing-file-names-token]]
const (
	frameCap         = 1 << 24
	tokenReadTimeout = 5 * time.Second
	tokenBytes       = 16
	lengthHeader     = "Content-Length:"
	driveColon       = 2
)

// One finding as the check module's sweep answers it. [[spec/tickets/the-lsp-door-lands]]
type Finding struct {
	File     string `json:"file"`
	Rule     string `json:"rule"`
	Line     int    `json:"line"`
	Column   int    `json:"column"`
	Message  string `json:"message"`
	Severity string `json:"severity"`
	Source   string `json:"source,omitempty"`
}

// What the server reaches: the tree's root, the store the buffers land in, the name a local name binds to, and the sweep the check module answers. [[spec/tickets/the-lsp-door-lands]]
type Outside struct {
	Root  string
	Store *q.Store
	As    q.Writer
	Bound func(local string) string
	Sweep func() any
}

// The server over the buffers an editor holds open, and what it last published for each. [[spec/tickets/the-lsp-door-lands]]
type Server struct {
	from Outside
	mu   sync.Mutex
	open map[string]string
	sent map[string]string
}

// One line of a recording whose replies differ from the server's. [[spec/design_output/model#an-inbound-fake-replays]]
type Mismatch struct {
	Line int
	Want string
	Got  string
}

// What the standing file holds: the port, and the token a connection sends first. [[spec/tickets/hooks-standing-file-names-token]]
type Standing struct {
	Port  int    `json:"port"`
	Token string `json:"token"`
}

type request struct {
	ID     json.RawMessage `json:"id,omitempty"`
	Method string          `json:"method"`
	Params json.RawMessage `json:"params,omitempty"`
}

type document struct {
	URI  string `json:"uri"`
	Text string `json:"text"`
}

type textParams struct {
	TextDocument document `json:"textDocument"`
	Changes      []struct {
		Text string `json:"text"`
	} `json:"contentChanges"`
}

type position struct {
	Line      int `json:"line"`
	Character int `json:"character"`
}

type diagnostic struct {
	Range struct {
		Start position `json:"start"`
		End   position `json:"end"`
	} `json:"range"`
	Severity int    `json:"severity"`
	Code     string `json:"code"`
	Source   string `json:"source"`
	Message  string `json:"message"`
}

// The module type the wiring loads as lsp. [[spec/tickets/the-lsp-door-lands]]
func Registers(c *q.Catalog) q.Writer {
	return q.OutIn(c, BuffersName, "", q.IO(), q.Doc("the unsaved text of a file an editor holds open"))
}

// [[spec/tickets/the-lsp-door-lands]]
func New(from Outside) *Server {
	return &Server{from: from, open: map[string]string{}, sent: map[string]string{}}
}

// Answers one LSP message with the bodies it replies: initialize and shutdown answer, and didOpen and didChange commit the buffer and publish its diagnostics. didClose empties the buffer and publishes none. [[spec/design_output/model#the-editor-starts-quack-lsp]]
func (s *Server) Handle(message []byte) [][]byte {
	var in request
	if err := json.Unmarshal(message, &in); err != nil {
		return nil
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	switch in.Method {
	case initialize:
		return [][]byte{answers(in.ID, map[string]any{
			"capabilities": map[string]any{"textDocumentSync": syncFull},
			"serverInfo":   map[string]any{"name": serverName, "version": serverVersion},
		})}
	case shutdown:
		return [][]byte{answers(in.ID, nil)}
	case didOpen, didChange:
		var params textParams
		if json.Unmarshal(in.Params, &params) != nil {
			return nil
		}
		text := params.TextDocument.Text
		if in.Method == didChange {
			if len(params.Changes) == 0 {
				return nil
			}
			text = params.Changes[len(params.Changes)-1].Text
		}
		at, ok := s.pathOf(params.TextDocument.URI)
		if !ok || s.writes(at, text) != nil {
			return nil
		}
		s.open[at] = text
		return [][]byte{s.publishes(params.TextDocument.URI, at, true)}
	case didClose:
		var params textParams
		if json.Unmarshal(in.Params, &params) != nil {
			return nil
		}
		at, ok := s.pathOf(params.TextDocument.URI)
		if !ok || s.writes(at, "") != nil {
			return nil
		}
		delete(s.open, at)
		delete(s.sent, at)
		return [][]byte{marshal(map[string]any{"jsonrpc": rpcVersion, "method": publish, "params": map[string]any{"uri": params.TextDocument.URI, "diagnostics": []diagnostic{}}})}
	}
	if len(in.ID) > 0 {
		return [][]byte{marshal(map[string]any{"jsonrpc": rpcVersion, "id": in.ID, "error": map[string]any{"code": noMethod, "message": in.Method + " names no method this server answers"}})}
	}
	return nil
}

// A publish for each open path whose diagnostics differ from the last publish, which the sweep settling after a commit calls for. [[spec/tickets/the-lsp-door-lands]]
func (s *Server) Republish(uris map[string]string) [][]byte {
	s.mu.Lock()
	defer s.mu.Unlock()
	var out [][]byte
	for at := range s.open {
		if uri, ok := uris[at]; ok {
			if body := s.publishes(uri, at, false); body != nil {
				out = append(out, body)
			}
		}
	}
	return out
}

func (s *Server) writes(at, text string) error {
	name := s.from.Bound("buffers/" + at)
	_, err := s.from.Store.Commit(s.from.Store.Snapshot().Revision, s.from.As, map[string]any{name: text})
	return err
}

// The publish for a path off the sweep's rows on it. With force off, a publish equal to the last one answers nil. [[spec/design_output/lsp#a-finding-is-a-diagnostic]]
func (s *Server) publishes(uri, at string, force bool) []byte {
	rows := strings.Split(s.open[at], "\n")
	drawn := []diagnostic{}
	for _, one := range s.sweep() {
		if one.File == at {
			drawn = append(drawn, drawsAs(one, rows))
		}
	}
	body := marshal(map[string]any{"jsonrpc": rpcVersion, "method": publish, "params": map[string]any{"uri": uri, "diagnostics": drawn}})
	if !force && s.sent[at] == string(body) {
		return nil
	}
	s.sent[at] = string(body)
	return body
}

// The sweep's rows as this module's Finding, whatever type the store holds them as. [[spec/design_output/model#the-fake-index]]
func (s *Server) sweep() []Finding {
	var rows []Finding
	body, err := json.Marshal(s.from.Sweep())
	if err == nil {
		json.Unmarshal(body, &rows)
	}
	return rows
}

// A finding as a diagnostic: rows count from zero, and a column counts UTF-16 units where a finding counts bytes. The range runs to the row's end. [[spec/design_output/lsp#a-finding-is-a-diagnostic]]
func drawsAs(said Finding, rows []string) diagnostic {
	line, column := max(said.Line-1, 0), max(said.Column-1, 0)
	start, end := column, column+1
	if line < len(rows) {
		start, end = unitsTo(rows[line], column), units(rows[line])
		if end <= start {
			end = start + 1
		}
	}
	level := levelError
	switch said.Severity {
	case warning:
		level = levelWarning
	case hint:
		level = levelHint
	}
	source := said.Source
	if source == "" {
		source = serverName
	}
	var out diagnostic
	out.Range.Start = position{Line: line, Character: start}
	out.Range.End = position{Line: line, Character: end}
	out.Severity, out.Code, out.Source, out.Message = level, said.Rule, source, said.Message
	return out
}

// The UTF-16 units before a byte of the row, counting from the start of a character the byte falls inside. [[spec/design_output/lsp#a-finding-is-a-diagnostic]]
func unitsTo(row string, at int) int {
	at = min(at, len(row))
	for at > 0 && at < len(row) && !utf8.RuneStart(row[at]) {
		at--
	}
	return units(row[:at])
}

func units(row string) int {
	count := 0
	for _, one := range row {
		count += utf16.RuneLen(one)
	}
	return count
}

// The slash path under the root a file URI names, and false for a URI outside the tree. [[spec/tickets/the-lsp-door-lands]]
func (s *Server) pathOf(uri string) (string, bool) {
	parsed, err := url.Parse(uri)
	if err != nil || parsed.Scheme != "file" {
		return "", false
	}
	path := parsed.Path
	if len(path) > driveColon && path[0] == '/' && path[driveColon] == ':' {
		path = path[1:]
	}
	root := strings.TrimSuffix(filepath.ToSlash(s.from.Root), "/")
	if len(path) <= len(root)+1 || !strings.EqualFold(path[:len(root)], root) || path[len(root)] != '/' {
		return "", false
	}
	return path[len(root)+1:], true
}

func answers(id json.RawMessage, result any) []byte {
	return marshal(map[string]any{"jsonrpc": rpcVersion, "id": id, "result": result})
}

func marshal(out map[string]any) []byte {
	body, _ := json.Marshal(out)
	return body
}

func newToken() string {
	secret := make([]byte, tokenBytes)
	rand.Read(secret)
	return hex.EncodeToString(secret)
}

// One connection's writer, so a reply and a republish each write a whole frame, and the URI each open path came in under. [[spec/tickets/the-lsp-door-lands]]
type conn struct {
	mu   sync.Mutex
	out  net.Conn
	uris map[string]string
}

func (c *conn) send(bodies ...[]byte) {
	c.mu.Lock()
	defer c.mu.Unlock()
	for _, body := range bodies {
		fmt.Fprintf(c.out, "%s %d\r\n\r\n%s", lengthHeader, len(body), body)
	}
}

// Keeps the URI an open or changed path came in under, so a republish names it as the editor does. [[spec/tickets/the-lsp-door-lands]]
func (c *conn) remember(server *Server, message []byte) {
	var in request
	var params textParams
	if json.Unmarshal(message, &in) != nil || json.Unmarshal(in.Params, &params) != nil {
		return
	}
	if at, ok := server.pathOf(params.TextDocument.URI); ok {
		c.mu.Lock()
		c.uris[at] = params.TextDocument.URI
		c.mu.Unlock()
	}
}

func (c *conn) known() map[string]string {
	c.mu.Lock()
	defer c.mu.Unlock()
	out := make(map[string]string, len(c.uris))
	for at, uri := range c.uris {
		out[at] = uri
	}
	return out
}

// Serves LSP frames on loopback behind a token, and writes the port and the token to the standing file. A connection sends the token line first, and the listener drops one with another. Each commit that moves a published diagnostic publishes again. [[spec/design_output/model#the-editor-starts-quack-lsp]]
func Listen(root string, server *Server) (func(), error) {
	token := newToken()
	listen, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return nil, err
	}
	at := filepath.Join(root, filepath.FromSlash(StandingFile))
	body, err := json.Marshal(Standing{Port: listen.Addr().(*net.TCPAddr).Port, Token: token})
	if err == nil {
		err = os.MkdirAll(filepath.Dir(at), 0o755)
	}
	if err == nil {
		err = os.WriteFile(at, body, 0o600)
	}
	if err != nil {
		listen.Close()
		return nil, err
	}
	var (
		mu    sync.Mutex
		conns = map[*conn]bool{}
	)
	server.from.Store.OnCommit(func(map[string]any) {
		mu.Lock()
		held := make([]*conn, 0, len(conns))
		for one := range conns {
			held = append(held, one)
		}
		mu.Unlock()
		for _, one := range held {
			one.send(server.Republish(one.known())...)
		}
	})
	go func() {
		for {
			raw, err := listen.Accept()
			if err != nil {
				return
			}
			go serves(raw, token, server, &mu, conns)
		}
	}()
	return func() {
		listen.Close()
		os.Remove(at)
	}, nil
}

// One connection: the token line, then frames in order, each answered before the next is read. [[spec/tickets/the-lsp-door-lands]]
func serves(raw net.Conn, token string, server *Server, mu *sync.Mutex, conns map[*conn]bool) {
	defer raw.Close()
	reader := bufio.NewReader(raw)
	raw.SetReadDeadline(time.Now().Add(tokenReadTimeout))
	line, err := reader.ReadString('\n')
	if err != nil || subtle.ConstantTimeCompare([]byte(strings.TrimSpace(line)), []byte(token)) != 1 {
		return
	}
	raw.SetReadDeadline(time.Time{})
	one := &conn{out: raw, uris: map[string]string{}}
	mu.Lock()
	conns[one] = true
	mu.Unlock()
	defer func() {
		mu.Lock()
		delete(conns, one)
		mu.Unlock()
	}()
	for {
		message, err := readFrame(reader)
		if err != nil {
			return
		}
		one.remember(server, message)
		one.send(server.Handle(message)...)
	}
}

// One frame's body: the headers up to the blank line, then as many bytes as Content-Length names. [[spec/tickets/the-lsp-door-lands]]
func readFrame(reader *bufio.Reader) ([]byte, error) {
	length := -1
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			return nil, err
		}
		line = strings.TrimSpace(line)
		if line == "" {
			break
		}
		if rest, ok := strings.CutPrefix(line, lengthHeader); ok {
			length, _ = strconv.Atoi(strings.TrimSpace(rest))
		}
	}
	if length < 0 || length > frameCap {
		return nil, fmt.Errorf("a frame names the length %d", length)
	}
	body := make([]byte, length)
	_, err := io.ReadFull(reader, body)
	return body, err
}

// One line of a recording: a message as the editor sends it, and the replies the server gives. [[spec/design_output/model#an-inbound-fake-replays]]
type recorded struct {
	Message json.RawMessage   `json:"message"`
	Replies []json.RawMessage `json:"replies"`
}

// The inbound fake: it drives the server off a recording, one message a line, and answers each line whose replies differ. [[spec/design_output/model#an-inbound-fake-replays]]
func Replay(server *Server, recording []byte) ([]Mismatch, error) {
	var missed []Mismatch
	scan := bufio.NewScanner(bytes.NewReader(recording))
	scan.Buffer(nil, frameCap)
	for n := 1; scan.Scan(); n++ {
		line := bytes.TrimSpace(scan.Bytes())
		if len(line) == 0 {
			continue
		}
		var one recorded
		if err := json.Unmarshal(line, &one); err != nil {
			return nil, fmt.Errorf("line %d: %w", n, err)
		}
		got := server.Handle(one.Message)
		if !same(one.Replies, got) {
			gotRaw := make([]json.RawMessage, len(got))
			for i, body := range got {
				gotRaw[i] = body
			}
			want, _ := json.Marshal(one.Replies)
			seen, _ := json.Marshal(gotRaw)
			missed = append(missed, Mismatch{Line: n, Want: string(want), Got: string(seen)})
		}
	}
	return missed, scan.Err()
}

// Whether the recorded replies and the server's decode alike, in order. [[spec/design_output/model#an-inbound-fake-replays]]
func same(want []json.RawMessage, got [][]byte) bool {
	if len(want) != len(got) {
		return false
	}
	for i := range want {
		var a, b any
		if json.Unmarshal(want[i], &a) != nil || json.Unmarshal(got[i], &b) != nil || !reflect.DeepEqual(a, b) {
			return false
		}
	}
	return true
}
