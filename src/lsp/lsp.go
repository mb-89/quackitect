// The stdio front. An editor speaks the language server protocol down this
// pipe, and every finding goes back as a diagnostic: the rule is the code and
// the message is the text.
// [[spec/design_output/lsp#one-checker-every-front-asks]]
package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"net/url"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"
)

const (
	Version         = "0.1.0"
	severityError   = 1
	severityWarning = 2
	driveColon      = 2
	methodNotFound  = -32601
)

type message struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      json.RawMessage `json:"id,omitempty"`
	Method  string          `json:"method,omitempty"`
	Params  json.RawMessage `json:"params,omitempty"`
	Result  any             `json:"result,omitempty"`
	Error   *rpcError       `json:"error,omitempty"`
}

type rpcError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

type position struct {
	Line      int `json:"line"`
	Character int `json:"character"`
}

type span struct {
	Start position `json:"start"`
	End   position `json:"end"`
}

type diagnostic struct {
	Range    span   `json:"range"`
	Severity int    `json:"severity"`
	Code     string `json:"code"`
	Source   string `json:"source"`
	Message  string `json:"message"`
}

type server struct {
	checker *Checker
	out     io.Writer
	guard   sync.Mutex
	panel   *panel
	// The quiet span a change waits before the bridge reads the buffer, and the timer counting it. [[spec/design_output/lsp#the-panel-lints-as-typed]]
	quiet time.Duration
	timer *time.Timer
	// The panel's goroutines and the answers share one pipe, so a frame goes out whole under this lock. [[spec/design_output/lsp#the-editor-speaks-over-stdio]]
	speaking sync.Mutex
}

// [[spec/design_output/lsp#one-checker-every-front-asks]]
func Speaks(checker *Checker, in io.Reader, out io.Writer) error {
	one := &server{checker: checker, out: out, panel: newPanel(), quiet: lintQuiet}
	reader := bufio.NewReader(in)
	for {
		said, err := reads(reader)
		if err == io.EOF {
			return nil
		}
		if err != nil {
			return err
		}
		if one.took(said) {
			return nil
		}
	}
}

func reads(reader *bufio.Reader) (message, error) {
	var said message
	length := 0
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			return said, err
		}
		line = strings.TrimRight(line, "\r\n")
		if line == "" {
			break
		}
		key, value, held := strings.Cut(line, ":")
		if held && strings.EqualFold(strings.TrimSpace(key), "content-length") {
			length, _ = strconv.Atoi(strings.TrimSpace(value))
		}
	}
	if length <= 0 {
		return said, errorOf("the header names no length")
	}

	body := make([]byte, length)
	if _, err := io.ReadFull(reader, body); err != nil {
		return said, err
	}
	return said, json.Unmarshal(body, &said)
}

// [[spec/design_output/lsp#one-checker-every-front-asks]]
func (one *server) took(said message) bool {
	switch said.Method {
	case "initialize":
		one.answers(said.ID, map[string]any{
			"capabilities": capabilitiesOf(),
			"serverInfo":   map[string]any{"name": "se-lsp", "version": Version},
		})
	case "textDocument/documentLink":
		one.answers(said.ID, one.links(said.Params))
	case "textDocument/completion":
		one.answers(said.ID, one.completes(said.Params))
	case "initialized":
		one.sweeps()
		go one.follows()
	case "shutdown":
		one.answers(said.ID, nil)
	case "exit":
		return true
	case "textDocument/didOpen", "textDocument/didChange", "textDocument/didSave":
		where, text := opened(said.Params)
		one.draws(where, text, said.Method)
	case "textDocument/didClose":
		where, _ := opened(said.Params)
		one.closes(where)
	case "":
		// The editor's answer to a request of this server's own, which asks nothing back. [[spec/design_output/lsp#the-panel-follows-the-index]]
	default:
		if len(said.ID) > 0 {
			one.fails(said.ID, "no method called "+said.Method)
		}
	}
	return false
}

// What the server answers, which initialize announces. [[spec/design_output/lsp#one-checker-every-front-asks]]
func capabilitiesOf() map[string]any {
	return map[string]any{
		"textDocumentSync": 1,
		// A pointer opens its target on a click. [[spec/design_output/lsp#a-pointer-opens-its-target]]
		"documentLinkProvider": map[string]any{"resolveProvider": false},
		// The schema offers what a note carries at the cursor. [[spec/design_output/lsp#the-completion-reads-the-schema]]
		"completionProvider": map[string]any{"triggerCharacters": triggers},
	}
}

// [[spec/design_output/lsp#a-finding-is-a-diagnostic]]
func drawsAs(said Finding, rows []string) diagnostic {
	line := said.Line - 1
	if line < 0 {
		line = 0
	}
	column := said.Column - 1
	if column < 0 {
		column = 0
	}
	// A finding counts bytes, and the editor counts UTF-16 units. [[spec/design_output/lsp#a-finding-is-a-diagnostic]]
	start, end := column, column+1
	if line < len(rows) {
		start, end = unitsTo(rows[line], column), units(rows[line])
		if end <= start {
			end = start + 1
		}
	}

	severity := severityError
	if said.Severity == SeverityWarning {
		severity = severityWarning
	}
	return diagnostic{
		Range:    span{Start: position{Line: line, Character: start}, End: position{Line: line, Character: end}},
		Severity: severity,
		Code:     said.Rule,
		Source:   sourceOf(said),
		Message:  said.Message,
	}
}

func (one *server) answers(id json.RawMessage, result any) {
	one.writes(message{JSONRPC: "2.0", ID: id, Result: result})
}

func (one *server) fails(id json.RawMessage, why string) {
	one.writes(message{JSONRPC: "2.0", ID: id, Error: &rpcError{Code: methodNotFound, Message: why}})
}

func (one *server) says(method string, params any) {
	said, err := json.Marshal(params)
	if err != nil {
		return
	}
	one.writes(message{JSONRPC: "2.0", Method: method, Params: said})
}

func (one *server) writes(said message) {
	body, err := json.Marshal(said)
	if err != nil {
		return
	}
	frame := append([]byte(fmt.Sprintf("Content-Length: %d\r\n\r\n", len(body))), body...)
	one.speaking.Lock()
	defer one.speaking.Unlock()
	one.out.Write(frame)
	if flushes, held := one.out.(interface{ Flush() error }); held {
		flushes.Flush()
	}
}

func opened(params json.RawMessage) (string, string) {
	var said struct {
		TextDocument struct {
			URI  string `json:"uri"`
			Text string `json:"text"`
		} `json:"textDocument"`
		ContentChanges []struct {
			Text string `json:"text"`
		} `json:"contentChanges"`
		Text string `json:"text"`
	}
	if err := json.Unmarshal(params, &said); err != nil {
		return "", ""
	}

	text := said.TextDocument.Text
	if len(said.ContentChanges) > 0 {
		text = said.ContentChanges[len(said.ContentChanges)-1].Text
	}
	if text == "" && said.Text != "" {
		text = said.Text
	}
	return pathOf(said.TextDocument.URI), text
}

// [[spec/design_output/lsp#one-checker-every-front-asks]]
func pathOf(uri string) string {
	if uri == "" {
		return ""
	}
	if !strings.HasPrefix(uri, "file://") {
		return uri
	}
	said, err := url.Parse(uri)
	if err != nil {
		return ""
	}
	path := said.Path
	if len(path) > driveColon && path[0] == '/' && path[driveColon] == ':' {
		path = path[1:] // a Windows drive letter wears no leading slash
	}
	return filepath.FromSlash(path)
}

func uriOf(path string) string {
	said := slashed(path)
	if !strings.HasPrefix(said, "/") {
		said = "/" + said
	}
	return "file://" + (&url.URL{Path: said}).EscapedPath()
}

var _ = stdout

type errorOf string

func (one errorOf) Error() string { return string(one) }

// A finding the bridge hands over names the front it comes from, and the rest are this server's. [[spec/design_output/lsp]]
func sourceOf(said Finding) string {
	if said.Source == "" {
		return "se-lsp"
	}
	return "se-lsp " + said.Source
}
