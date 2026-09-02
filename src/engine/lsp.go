package main

import (
	"bufio"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

// A language server over stdio, speaking LSP 3.17.
// https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification
//
// It lives in the engine rather than in a stub of its own because it validates
// on every keystroke, and a process per keystroke is too slow to type through.
// se-mcp can afford one call per request. This cannot.

type rpcMessage struct {
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

type lspRange struct {
	Start position `json:"start"`
	End   position `json:"end"`
}

type diagnostic struct {
	Range    lspRange `json:"range"`
	Severity int      `json:"severity"`
	Source   string   `json:"source"`
	Message  string   `json:"message"`
}

type completionItem struct {
	Label      string `json:"label"`
	Kind       int    `json:"kind"`
	Detail     string `json:"detail,omitempty"`
	InsertText string `json:"insertText,omitempty"`
}

type documentLink struct {
	Range   lspRange `json:"range"`
	Target  string   `json:"target"`
	Tooltip string   `json:"tooltip,omitempty"`
}

type server struct {
	roots Roots
	docs  map[string]string
	// notes maps a note's name to its path, so a link by name is one lookup
	// rather than a walk of the tree per request.
	notes map[string]string
	out   io.Writer
}

func runLSP(args []string) {
	fs := flag.NewFlagSet("lsp", flag.ExitOnError)
	fs.SetOutput(os.Stdout)
	fs.Usage = func() {
		fmt.Fprintln(os.Stdout, "se lsp - serve notes to an editor over stdio, as a language server.")
		fmt.Fprintln(os.Stdout, "")
		fmt.Fprintln(os.Stdout, "  It is spoken to by an editor and answers nothing useful at a terminal.")
		fmt.Fprintln(os.Stdout, "")
		fs.PrintDefaults()
	}
	work := fs.String("work", "", "the folder being worked on (default: this one)")
	// The transport, which is stdio and has never been anything else. It is
	// declared because every language client sends it and a verb here refuses
	// a flag it was not given.
	fs.Bool("stdio", false, "speak over standard input and output")
	parse(fs, "lsp", args)

	roots, err := FindRoots(*work)
	if err != nil {
		fail(err)
	}
	hideOwnConsole()
	s := &server{roots: roots, docs: map[string]string{}, notes: map[string]string{}, out: os.Stdout}
	// Standard error is the editor's output channel, so it is where a person
	// looks when nothing appears.
	s.log("serving %s, method root %s", Build, roots.Method)
	if err := s.serve(os.Stdin); err != nil && err != io.EOF {
		s.log("stopped: %v", err)
		fail(err)
	}
}

func (s *server) log(format string, a ...any) {
	fmt.Fprintf(os.Stderr, "quackitect: "+format+"\n", a...)
}

func (s *server) serve(in io.Reader) error {
	r := bufio.NewReader(in)
	for {
		body, err := readFramed(r)
		if err != nil {
			return err
		}
		var m rpcMessage
		if err := json.Unmarshal(body, &m); err != nil {
			continue // a message this cannot read is not a reason to stop serving
		}
		if s.handle(m) {
			return nil
		}
	}
}

// readFramed reads one message. The header block ends at a blank line and
// Content-Length says how many bytes of body follow it.
func readFramed(r *bufio.Reader) ([]byte, error) {
	n := 0
	for {
		line, err := r.ReadString('\n')
		if err != nil {
			return nil, err
		}
		line = strings.TrimRight(line, "\r\n")
		if line == "" {
			break
		}
		if k, v, found := strings.Cut(line, ":"); found &&
			strings.EqualFold(strings.TrimSpace(k), "content-length") {
			n, _ = strconv.Atoi(strings.TrimSpace(v))
		}
	}
	if n <= 0 {
		return nil, fmt.Errorf("a message arrived with no content length")
	}
	body := make([]byte, n)
	_, err := io.ReadFull(r, body)
	return body, err
}

func (s *server) send(v any) {
	b, err := json.Marshal(v)
	if err != nil {
		return
	}
	fmt.Fprintf(s.out, "Content-Length: %d\r\n\r\n", len(b))
	s.out.Write(b)
}

func (s *server) reply(id json.RawMessage, result any) {
	s.send(rpcMessage{JSONRPC: "2.0", ID: id, Result: result})
}

func (s *server) notify(method string, params any) {
	s.send(rpcMessage{JSONRPC: "2.0", Method: method, Result: nil, Params: mustRaw(params)})
}

func mustRaw(v any) json.RawMessage {
	b, err := json.Marshal(v)
	if err != nil {
		return json.RawMessage("null")
	}
	return b
}

// handle answers one message and says whether the server should stop.
func (s *server) handle(m rpcMessage) bool {
	switch m.Method {
	case "initialize":
		s.reply(m.ID, map[string]any{
			"capabilities": map[string]any{
				// Full sync: a note is small, and a whole buffer per change is
				// simpler than a patch and cannot drift from the editor.
				"textDocumentSync": 1,
				"completionProvider": map[string]any{
					"triggerCharacters": []string{":", " ", "#"},
				},
				"documentLinkProvider": map[string]any{"resolveProvider": false},
			},
			"serverInfo": map[string]any{"name": "quackitect", "version": Build},
		})
	case "initialized":
		s.scanWorkspace()
	case "shutdown":
		s.reply(m.ID, nil)
	case "exit":
		return true
	case "textDocument/didOpen":
		var p struct {
			TextDocument struct {
				URI  string `json:"uri"`
				Text string `json:"text"`
			} `json:"textDocument"`
		}
		json.Unmarshal(m.Params, &p)
		s.docs[p.TextDocument.URI] = p.TextDocument.Text
		s.diagnose(p.TextDocument.URI)
	case "textDocument/didChange":
		var p struct {
			TextDocument struct {
				URI string `json:"uri"`
			} `json:"textDocument"`
			ContentChanges []struct {
				Text string `json:"text"`
			} `json:"contentChanges"`
		}
		json.Unmarshal(m.Params, &p)
		if len(p.ContentChanges) > 0 {
			s.docs[p.TextDocument.URI] = p.ContentChanges[len(p.ContentChanges)-1].Text
			s.diagnose(p.TextDocument.URI)
		}
	case "textDocument/didClose":
		var p struct {
			TextDocument struct {
				URI string `json:"uri"`
			} `json:"textDocument"`
		}
		json.Unmarshal(m.Params, &p)
		delete(s.docs, p.TextDocument.URI)
		s.publish(p.TextDocument.URI, []diagnostic{})
	case "textDocument/completion":
		var p struct {
			TextDocument struct {
				URI string `json:"uri"`
			} `json:"textDocument"`
			Position position `json:"position"`
		}
		json.Unmarshal(m.Params, &p)
		s.reply(m.ID, s.complete(p.TextDocument.URI, p.Position))
	case "textDocument/documentLink":
		var p struct {
			TextDocument struct {
				URI string `json:"uri"`
			} `json:"textDocument"`
		}
		json.Unmarshal(m.Params, &p)
		s.reply(m.ID, s.documentLinks(p.TextDocument.URI))
	default:
		// A request this does not answer still needs an answer, or the editor
		// waits for one that never comes.
		if len(m.ID) > 0 {
			s.reply(m.ID, nil)
		}
	}
	return false
}

// diagnose validates the buffer and publishes what it found.
// A document naming no kind is left alone: not every markdown file is a note.
func (s *server) diagnose(uri string) {
	text := s.docs[uri]
	kind := kindOf(text)
	if kind == "" {
		s.publish(uri, []diagnostic{})
		return
	}
	lines := strings.Split(strings.ReplaceAll(text, "\r\n", "\n"), "\n")
	out := []diagnostic{}
	schema, err := LoadSchema(s.roots.Method, kind)
	if err != nil {
		out = append(out, diagnostic{
			Range: wholeLine(lines, 1), Severity: 1, Source: "quackitect", Message: err.Error()})
		s.publish(uri, out)
		return
	}
	for _, d := range ValidateNote(schema, text, s.roots.Method) {
		out = append(out, diagnostic{
			Range: wholeLine(lines, d.Line), Severity: 1, Source: "quackitect", Message: d.Says})
	}
	s.publish(uri, out)
}

// documentLinks makes every [[name]] in a buffer clickable.
//
// A link is walked from wherever it is written: a frontmatter value, a
// sentence in Discussion, an item in a rule. So the buffer is read for the
// brackets rather than the frontmatter being read for its fields.
func (s *server) documentLinks(uri string) []documentLink {
	out := []documentLink{}
	for n, line := range strings.Split(strings.ReplaceAll(s.docs[uri], "\r\n", "\n"), "\n") {
		at := 0
		for {
			open := strings.Index(line[at:], "[[")
			if open < 0 {
				break
			}
			open += at
			shut := strings.Index(line[open:], "]]")
			if shut < 0 {
				break
			}
			shut += open
			target := s.resolveLink(strings.TrimSpace(line[open+2 : shut]))
			if target != "" {
				out = append(out, documentLink{
					Range: lspRange{
						Start: position{Line: n, Character: len([]rune(line[:open]))},
						End:   position{Line: n, Character: len([]rune(line[:shut+2]))},
					},
					Target:  target,
					Tooltip: "open " + strings.TrimSpace(line[open+2:shut]),
				})
			}
			at = shut + 2
		}
	}
	return out
}

// resolveLink answers where a link points, or nothing when it points nowhere.
// A path is tried first, then a note by its name.
func (s *server) resolveLink(target string) string {
	if target == "" {
		return ""
	}
	for _, base := range []string{s.roots.Method, s.roots.Work} {
		p := filepath.Join(base, filepath.FromSlash(target))
		if info, err := os.Stat(p); err == nil && !info.IsDir() {
			return pathToURI(p)
		}
	}
	if len(s.notes) == 0 {
		s.indexNotes()
	}
	return s.notes[target]
}

// indexNotes learns where every note is, by name.
func (s *server) indexNotes() {
	notes, err := notesUnder(s.roots.Work)
	if err != nil {
		return
	}
	for _, p := range notes {
		s.notes[strings.TrimSuffix(filepath.Base(p), ".md")] = pathToURI(p)
	}
}

// scanWorkspace marks every note in the tree, not only the open ones.
//
// A language server is only asked about documents the editor has opened, so a
// problems panel shows the file in front of you and nothing else. Diagnostics
// may be published for any uri, so the whole tree is read once at startup.
// A note edited outside the editor goes stale until the window is reloaded.
func (s *server) scanWorkspace() {
	notes, err := notesUnder(s.roots.Work)
	if err != nil {
		s.log("the tree could not be read: %v", err)
		return
	}
	marked := 0
	for _, path := range notes {
		b, err := os.ReadFile(path)
		if err != nil {
			continue
		}
		uri := pathToURI(path)
		if _, open := s.docs[uri]; open {
			continue // the open copy is the one that counts
		}
		s.docs[uri] = string(b)
		s.diagnose(uri)
		delete(s.docs, uri) // it is not open, so it is not held
		marked++
	}
	s.log("read %d note(s) under %s", marked, s.roots.Work)
}

// notesUnder answers every markdown file that names a kind.
func notesUnder(root string) ([]string, error) {
	var out []string
	skip := map[string]bool{"node_modules": true, ".git": true, ".bin": true, "out": true}
	// Walk rather than WalkDir, because fs is already a function here.
	err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if info.IsDir() {
			if skip[info.Name()] {
				return filepath.SkipDir
			}
			return nil
		}
		if !strings.HasSuffix(info.Name(), ".md") {
			return nil
		}
		b, err := os.ReadFile(path)
		if err == nil && kindOf(string(b)) != "" {
			out = append(out, path)
		}
		return nil
	})
	return out, err
}

// pathToURI spells a path the way the editor spells it, so a note marked by
// the scan and the same note once opened are one entry rather than two.
func pathToURI(p string) string {
	p = filepath.ToSlash(p)
	if len(p) > 1 && p[1] == ':' {
		return "file:///" + strings.ToLower(p[:1]) + p[1:]
	}
	return "file://" + p
}

func (s *server) publish(uri string, ds []diagnostic) {
	s.notify("textDocument/publishDiagnostics", map[string]any{
		"uri": uri, "diagnostics": ds,
	})
}

// wholeLine marks a whole row. Departure lines are 1-based and LSP is 0-based.
func wholeLine(lines []string, at int) lspRange {
	n := at - 1
	if n < 0 || n >= len(lines) {
		n = 0
	}
	width := 0
	if n < len(lines) {
		width = len([]rune(lines[n]))
	}
	return lspRange{Start: position{Line: n}, End: position{Line: n, Character: width}}
}

// kindOf answers what a buffer says it is, without touching the disk.
func kindOf(text string) string {
	front, _, _ := splitNoteLines(text)
	if strings.TrimSpace(front) == "" {
		return ""
	}
	f, err := ParseFront(front)
	if err != nil {
		return ""
	}
	return unlink(fs(f, "kind"))
}

// AvailableKinds answers every kind this copy has a schema for.
func AvailableKinds(methodRoot string) []string {
	entries, err := os.ReadDir(SchemasDir(methodRoot))
	if err != nil {
		return nil
	}
	var out []string
	for _, e := range entries {
		if name, found := strings.CutSuffix(e.Name(), ".schema.yaml"); found && !Parked(name) {
			out = append(out, name)
		}
	}
	return out
}

// complete offers what the schema allows at the cursor.
//
// Three places are worth offering in: a frontmatter key, a frontmatter value,
// and a chapter heading. Everything else is prose, which the schema has no
// opinion about.
func (s *server) complete(uri string, at position) []completionItem {
	text, held := s.docs[uri]
	if !held {
		return nil
	}
	lines := strings.Split(strings.ReplaceAll(text, "\r\n", "\n"), "\n")
	if at.Line >= len(lines) {
		return nil
	}
	line := lines[at.Line]
	if at.Character <= len(line) {
		line = line[:at.Character]
	}
	key, afterColon, typingValue := strings.Cut(line, ":")
	key = strings.TrimSpace(key)

	if inFrontmatter(lines, at.Line) {
		// A value is offered for the key on this line.
		if typingValue {
			if key == "kind" && strings.TrimSpace(afterColon) == "" {
				return kindItems(AvailableKinds(s.roots.Method))
			}
			schema, err := LoadSchema(s.roots.Method, kindOf(text))
			if err != nil {
				return nil
			}
			if p, declared := schema.Frontmatter.Properties[key]; declared && p.Const != "" {
				return []completionItem{{Label: p.Const, Kind: 12, Detail: p.Description}}
			}
			return nil
		}
		// Otherwise the key itself, and a key already written is not offered.
		schema, err := LoadSchema(s.roots.Method, kindOf(text))
		if err != nil {
			return []completionItem{{Label: "kind", Kind: 10,
				Detail: "which schema reads this note", InsertText: "kind: "}}
		}
		var out []completionItem
		for name, p := range schema.Frontmatter.Properties {
			if hasKey(lines, name) {
				continue
			}
			out = append(out, completionItem{Label: name, Kind: 10,
				Detail: p.Description, InsertText: name + ": "})
		}
		return out
	}

	// A chapter heading, offered from the schema's own list.
	if strings.HasPrefix(strings.TrimSpace(line), "##") {
		schema, err := LoadSchema(s.roots.Method, kindOf(text))
		if err != nil {
			return nil
		}
		var out []completionItem
		for _, sec := range schema.Body.Sections {
			if hasHeading(lines, sec.Header) {
				continue
			}
			out = append(out, completionItem{Label: sec.Header, Kind: 15, Detail: sec.Description})
		}
		return out
	}
	return nil
}

func kindItems(kinds []string) []completionItem {
	var out []completionItem
	for _, k := range kinds {
		out = append(out, completionItem{Label: k, Kind: 12, Detail: "a note kind this copy knows"})
	}
	return out
}

// inFrontmatter says whether a row sits inside the opening yaml block.
func inFrontmatter(lines []string, at int) bool {
	if len(lines) == 0 || lines[0] != noteFence {
		return false
	}
	for i := 1; i < len(lines); i++ {
		if lines[i] == noteFence {
			return at > 0 && at < i
		}
	}
	return at > 0 // an unclosed block is still being written
}

func hasKey(lines []string, name string) bool {
	for i, line := range lines {
		if i == 0 {
			continue
		}
		if line == noteFence {
			return false
		}
		if strings.HasPrefix(strings.TrimSpace(line), name+":") {
			return true
		}
	}
	return false
}

func hasHeading(lines []string, header string) bool {
	for _, line := range lines {
		if strings.TrimSpace(line) == "## "+header {
			return true
		}
	}
	return false
}
