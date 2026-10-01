// The features the lsp IO module answers over the protocol, each off the
// files a case hands in.
// [[spec/tickets/lsp-module-serves-the-features]]
package lsp

import (
	"encoding/json"
	"strings"
	"testing"
)

// The files a hover reads: the paragraph schema naming the vocabulary, the terms, the endings, and a note. [[spec/tickets/lsp-module-serves-the-features]]
var hoverFiles = map[string]string{
	"spec/schemas/paragraph.schema.yaml": "kind: paragraph\nlayers:\n  vocabulary:\n    terms: spec/vocabulary/terms.yml\n    endings: spec/config/stems.yaml\n",
	"spec/vocabulary/terms.yml":          "terms:\n  - {word: door, means: \"the one place the tree guards an outside thing\"}\n",
	"spec/config/stems.yaml":             "endings:\n  - end: s\n    to: [none]\n",
	"spec/notes/one.md":                  "The doors hold.\n",
}

// A schema governing one kind, so a bare note offers it. [[spec/tickets/lsp-module-serves-the-features]]
const flagSchema = "kind: flag\ngoverns:\n  - spec/flags/**\nfrontmatter:\n  type: object\n  properties:\n    kind:\n      const: flag\n      x-link: true\n"

// A server over the files named, whose sweep answers nothing, which runs no tool, and whose features the fake check reads off the tree. [[spec/tickets/lsp-module-serves-the-features]]
func featuresOver(t *testing.T, files map[string]string) *Server {
	t.Helper()
	store, as := catalogOf(t)
	return New(Outside{
		Root: "/tree", Store: store, As: as, Bound: func(local string) string { return local },
		Sweep: func() any { return []Finding{} },
		Files: func() map[string]string { return files },
		Check: fakeCheck,
	})
}

// The result of the one reply a request draws, decoded into what the case holds, and false where no reply carries one. [[spec/tickets/lsp-module-serves-the-features]]
func answered(t *testing.T, server *Server, method string, params map[string]any, into any) bool {
	t.Helper()
	body, _ := json.Marshal(map[string]any{"jsonrpc": "2.0", "id": 7, "method": method, "params": params})
	for _, reply := range server.Handle(body) {
		var one struct {
			ID     int             `json:"id"`
			Result json.RawMessage `json:"result"`
		}
		if json.Unmarshal(reply, &one) == nil && one.ID == 7 && len(one.Result) > 0 {
			return json.Unmarshal(one.Result, into) == nil
		}
	}
	return false
}

func at(uri string, line, character int) map[string]any {
	return map[string]any{"textDocument": map[string]any{"uri": uri}, "position": map[string]any{"line": line, "character": character}}
}

func TestInitializeAnnouncesTheFeatures(t *testing.T) {
	var said struct {
		Capabilities map[string]any `json:"capabilities"`
	}
	if !answered(t, featuresOver(t, nil), "initialize", map[string]any{}, &said) {
		t.Fatal("initialize answers nothing")
	}
	for _, one := range []string{"hoverProvider", "completionProvider", "documentLinkProvider", "foldingRangeProvider"} {
		if said.Capabilities[one] == nil {
			t.Errorf("the capabilities %v name no %s", said.Capabilities, one)
		}
	}
}

func TestAHoverOverATermAnswersItsLine(t *testing.T) {
	var said struct {
		Contents struct {
			Value string `json:"value"`
		} `json:"contents"`
	}
	answered(t, featuresOver(t, hoverFiles), "textDocument/hover", at("file:///tree/spec/notes/one.md", 0, 5), &said)
	if !strings.Contains(said.Contents.Value, "the one place the tree guards") {
		t.Fatalf("the hover over doors answers %q, and wants the line the dictionary holds", said.Contents.Value)
	}
}

func TestACompletionAfterKindOffersTheKinds(t *testing.T) {
	server := featuresOver(t, map[string]string{"spec/schemas/flag.schema.yaml": flagSchema})
	server.Handle(opened("file:///tree/spec/free.md", ""))
	var said []struct {
		Label string `json:"label"`
	}
	answered(t, server, "textDocument/completion", at("file:///tree/spec/free.md", 0, 0), &said)
	for _, one := range said {
		if one.Label == "kind: [[flag]]" {
			return
		}
	}
	t.Fatalf("a bare note offers %+v, and wants kind: [[flag]]", said)
}

func TestAPointerAnswersAsALink(t *testing.T) {
	server := featuresOver(t, map[string]string{
		"spec/design_output/one.md": "# Scope\n",
		"spec/guidance/two.md":      "# A rule\n\nSee [[spec/design_output/one]].\n",
	})
	var said []struct {
		Target string `json:"target"`
	}
	answered(t, server, "textDocument/documentLink", map[string]any{"textDocument": map[string]any{"uri": "file:///tree/spec/guidance/two.md"}}, &said)
	if len(said) != 1 || !strings.HasSuffix(said[0].Target, "/spec/design_output/one.md") {
		t.Fatalf("the note's links read %+v, and want the one pointer opening its note", said)
	}
}

func TestTheFrontmatterFolds(t *testing.T) {
	server := featuresOver(t, nil)
	server.Handle(opened("file:///tree/spec/tickets/a.md", "---\nkind: [[ticket]]\nstate: open\n---\n\n# Ask\n"))
	var said []struct {
		StartLine int    `json:"startLine"`
		EndLine   int    `json:"endLine"`
		Kind      string `json:"kind"`
	}
	answered(t, server, "textDocument/foldingRange", map[string]any{"textDocument": map[string]any{"uri": "file:///tree/spec/tickets/a.md"}}, &said)
	if len(said) != 1 || said[0].StartLine != 0 || said[0].EndLine != 3 || said[0].Kind != "region" {
		t.Fatalf("the ticket folds %+v, and wants one region from fence to fence", said)
	}
}
