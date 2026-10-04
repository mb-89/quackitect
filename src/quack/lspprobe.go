// The probe behind the doctor's `quack lsp` row. It starts the server the
// editor starts, opens one note, and reads back what the server draws.
// [[spec/design_output/lsp#the-doctor-probes-the-server]]
package main

import (
	"bytes"
	"encoding/json"
	"net/url"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"
)

// The note the probe opens, under the ticket folder with no frontmatter, so a server reading the tree answers at least one diagnostic, and the span it waits, past the half second a warm server takes. [[spec/design_output/lsp#the-doctor-probes-the-server]]
const (
	probeNote = "spec/tickets/doctor-probe.md"
	probeText = "# Probe\n"
	lspWait   = 30 * time.Second
)

// The head a frame opens on. [[spec/design_output/lsp#the-doctor-probes-the-server]]
var frameHead = regexp.MustCompile(`Content-Length: \d+\r\n\r\n`)

// One message the probe writes, its keys in the order the editor writes them. [[spec/design_output/lsp#the-doctor-probes-the-server]]
type lspFrame struct {
	JSONRPC string `json:"jsonrpc"`
	ID      int    `json:"id,omitempty"`
	Method  string `json:"method"`
	Params  any    `json:"params,omitempty"`
}

// One message framed with its length in bytes, as a language server reads it. [[spec/design_output/lsp#the-doctor-probes-the-server]]
func framed(said lspFrame) string {
	said.JSONRPC = "2.0"
	var body bytes.Buffer
	writes := json.NewEncoder(&body)
	writes.SetEscapeHTML(false)
	_ = writes.Encode(said)
	text := strings.TrimRight(body.String(), "\n")
	return "Content-Length: " + strconv.Itoa(len(text)) + "\r\n\r\n" + text
}

// The file URL of a path, as the editor names a folder or a note. [[spec/design_output/lsp#the-doctor-probes-the-server]]
func fileURL(path string) string {
	if abs, err := filepath.Abs(path); err == nil {
		path = abs
	}
	path = filepath.ToSlash(path)
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}
	return (&url.URL{Scheme: "file", Path: path}).String()
}

// The row `quack lsp` draws: the probe starts the server the editor starts, opens one note, and names each diagnostic code the server sends back. [[spec/design_output/lsp#the-doctor-probes-the-server]]
func lspProbe(d boxDoors, exe, at string) string {
	if exe == "" {
		return "missing, run ./RUNME.sh"
	}
	type document struct {
		URI        string `json:"uri"`
		LanguageID string `json:"languageId"`
		Version    int    `json:"version"`
		Text       string `json:"text"`
	}
	stdin := framed(lspFrame{ID: 1, Method: "initialize", Params: map[string]any{
		"rootUri": fileURL(at), "capabilities": map[string]any{},
	}}) + framed(lspFrame{Method: "textDocument/didOpen", Params: map[string]any{
		"textDocument": document{fileURL(filepath.Join(at, filepath.FromSlash(probeNote))), "markdown", 1, probeText},
	}}) + framed(lspFrame{ID: 2, Method: "shutdown"}) + framed(lspFrame{Method: "exit"})
	ran := d.run([]string{exe, "lsp"}, runOpts{cwd: at, stdin: stdin, timeout: lspWait})
	if ran.stderr == "" && ran.fault != "" {
		ran.stderr = ran.fault
	}
	drawn, sent := diagnosticsIn(ran.stdout)
	if ran.code != 0 || !sent {
		why, _, _ := strings.Cut(strings.TrimSpace(ran.stderr), "\n")
		if why == "" {
			why = "it says nothing"
		}
		return "warn: quack lsp exits with " + strconv.Itoa(ran.code) + " before it answers: " + why
	}
	var codes []string
	seen := map[string]bool{}
	for _, one := range drawn {
		if code := codeOf(one); code != "" && !seen[code] {
			seen[code] = true
			codes = append(codes, code)
		}
	}
	if len(codes) == 0 {
		return "answers, and draws no diagnostic on the probe note"
	}
	return "answers, and draws " + strings.Join(codes, ", ") + " on the probe note"
}

// The diagnostics of the first publish frame, and whether the server sends one. [[spec/design_output/lsp#the-doctor-probes-the-server]]
func diagnosticsIn(stdout string) ([]any, bool) {
	for _, one := range frameHead.Split(stdout, -1) {
		reads := json.NewDecoder(strings.NewReader(one))
		reads.UseNumber()
		var said struct {
			Method string `json:"method"`
			Params struct {
				Diagnostics any `json:"diagnostics"`
			} `json:"params"`
		}
		if reads.Decode(&said) != nil || reads.More() {
			continue
		}
		if said.Method == "textDocument/publishDiagnostics" {
			drawn, _ := said.Params.Diagnostics.([]any)
			return drawn, true
		}
	}
	return nil, false
}

// The code one diagnostic carries, as text. [[spec/design_output/lsp#the-doctor-probes-the-server]]
func codeOf(one any) string {
	said, ok := one.(map[string]any)
	if !ok || said["code"] == nil {
		return ""
	}
	switch code := said["code"].(type) {
	case string:
		return code
	case json.Number:
		return code.String()
	}
	body, _ := json.Marshal(said["code"])
	return string(body)
}
