// The stdio front. An editor speaks the language server protocol down this
// pipe, and every finding goes back as a diagnostic: the rule is the code and
// the message is the text.
// [[spec/design_output/lsp#the-editor-speaks-over-stdio]]
package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
)

const Version = "0.1.0"

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
	drawn   map[string]bool
}

// [[spec/design_output/lsp#the-editor-speaks-over-stdio]]
func Speaks(checker *Checker, in io.Reader, out io.Writer) error {
	one := &server{checker: checker, out: out, drawn: map[string]bool{}}
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

// [[spec/design_output/lsp#the-editor-speaks-over-stdio]]
func (one *server) took(said message) bool {
	switch said.Method {
	case "initialize":
		one.answers(said.ID, map[string]any{
			"capabilities": map[string]any{"textDocumentSync": 1},
			"serverInfo":   map[string]any{"name": "se-lsp", "version": Version},
		})
	case "shutdown":
		one.answers(said.ID, nil)
	case "exit":
		return true
	case "textDocument/didOpen", "textDocument/didChange", "textDocument/didSave":
		one.draws(opened(said.Params))
	case "textDocument/didClose":
		where, _ := opened(said.Params)
		if where != "" {
			one.checker.Tree().Drops(relativeTo(one.checker.Tree().Root, where))
			one.clears()
		}
	default:
		if len(said.ID) > 0 {
			one.fails(said.ID, "no method called "+said.Method)
		}
	}
	return false
}

func (one *server) draws(where, text string) {
	if where == "" {
		return
	}
	tree := one.checker.Tree()
	at := relativeTo(tree.Root, where)
	if text != "" {
		tree.Holds(at, text)
	}

	found := map[string][]Finding{}
	for _, said := range one.checker.Over(at) {
		found[said.File] = append(found[said.File], said)
	}
	found[at] = found[at] // an empty list clears the panel for the open file

	one.guard.Lock()
	defer one.guard.Unlock()
	for path, said := range found {
		one.publishes(tree, path, said)
	}
	for path := range one.drawn {
		if _, still := found[path]; !still {
			one.publishes(tree, path, nil)
			delete(one.drawn, path)
		}
	}
}

func (one *server) clears() {
	one.guard.Lock()
	defer one.guard.Unlock()
	tree := one.checker.Tree()
	for path := range one.drawn {
		one.publishes(tree, path, nil)
	}
	one.drawn = map[string]bool{}
}

func (one *server) publishes(tree *Tree, path string, found []Finding) {
	rows := splitLines(tree.Read(path))
	drawn := make([]diagnostic, 0, len(found))
	for _, said := range found {
		drawn = append(drawn, drawsAs(said, rows))
	}
	if len(found) > 0 {
		one.drawn[path] = true
	}
	one.says("textDocument/publishDiagnostics", map[string]any{
		"uri":         uriOf(filepath.Join(tree.Root, filepath.FromSlash(path))),
		"diagnostics": drawn,
	})
}

// [[spec/design_output/lsp#a-finding-draws-as-a-diagnostic]]
func drawsAs(said Finding, rows []string) diagnostic {
	line := said.Line - 1
	if line < 0 {
		line = 0
	}
	column := said.Column - 1
	if column < 0 {
		column = 0
	}
	end := column + 1
	if line < len(rows) && len(rows[line]) > column {
		end = len(rows[line])
	}

	severity := 1
	if said.Severity == SeverityWarning {
		severity = 2
	}
	return diagnostic{
		Range:    span{Start: position{Line: line, Character: column}, End: position{Line: line, Character: end}},
		Severity: severity,
		Code:     said.Rule,
		Source:   "se-lsp",
		Message:  said.Message,
	}
}

func (one *server) answers(id json.RawMessage, result any) {
	one.writes(message{JSONRPC: "2.0", ID: id, Result: result})
}

func (one *server) fails(id json.RawMessage, why string) {
	one.writes(message{JSONRPC: "2.0", ID: id, Error: &rpcError{Code: -32601, Message: why}})
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
	fmt.Fprintf(one.out, "Content-Length: %d\r\n\r\n", len(body))
	one.out.Write(body)
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

// [[spec/design_output/lsp#the-editor-speaks-over-stdio]]
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
	if len(path) > 2 && path[0] == '/' && path[2] == ':' {
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

var _ = os.Stdout

type errorOf string

func (one errorOf) Error() string { return string(one) }
