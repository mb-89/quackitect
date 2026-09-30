package main

import (
	"encoding/json"
	"strings"
	"testing"
)

// The server names the capability, and answers the request over the protocol. [[spec/design_output/lsp#a-pointer-opens-its-target]]
func TestTheServerAnswersADocumentLink(t *testing.T) {
	tree := fixture(t, map[string]string{
		"spec/design_output/one.md": "# Scope\n",
		"spec/guidance/two.md":      "# A rule\n\nSee [[spec/design_output/one]].\n",
	})
	one := &server{checker: &Checker{tree: tree}, panel: newPanel()}
	params, _ := json.Marshal(map[string]any{"textDocument": map[string]any{"uri": uriOf(tree.Root + "/spec/guidance/two.md")}})

	got := one.links(params)
	if len(got) != 1 || !strings.HasSuffix(got[0].Target, "/spec/design_output/one.md") {
		t.Fatalf("the request answers the file's one link, and it answers %+v", got)
	}
}
