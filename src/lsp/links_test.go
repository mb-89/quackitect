package main

import (
	"encoding/json"
	"strings"
	"testing"
)

// A pointer draws as a link over its brackets, a chapter lands on its heading's line, and a pointer landing nowhere draws none. [[spec/design_output/lsp#a-pointer-opens-its-target]]
func TestAPointerOpensItsTarget(t *testing.T) {
	tree := fixture(t, map[string]string{
		"spec/design_output/one.md": "# Scope\n\nA line.\n\n# The stop hook holds a turn\n\nMore.\n",
		"spec/guidance/two.md":      "# A rule\n\nSee [[spec/design_output/one]], then [[spec/design_output/one#the-stop-hook-holds-a-turn]].\nA `[[spec/design_output/one]]` span, and [[nobody]], and [[one]].\n",
	})

	got := linksIn(tree, "spec/guidance/two.md")
	if len(got) != 3 {
		t.Fatalf("three pointers land, and the span and the dead one draw none, and it answers %+v", got)
	}
	whole := got[0]
	if whole.Range.Start != (position{Line: 2, Character: 4}) || whole.Range.End != (position{Line: 2, Character: 30}) {
		t.Fatalf("the link spans the brackets whole, and it answers %+v", whole.Range)
	}
	if !strings.HasSuffix(whole.Target, "/spec/design_output/one.md") || !strings.HasPrefix(whole.Target, "file://") {
		t.Fatalf("a path without its ending opens the note, and it answers %q", whole.Target)
	}
	if !strings.HasSuffix(got[1].Target, "/spec/design_output/one.md#L5") {
		t.Fatalf("a chapter lands on its heading's line, and it answers %q", got[1].Target)
	}
	if got[2].Range.Start.Line != 3 || !strings.HasSuffix(got[2].Target, "/spec/design_output/one.md") {
		t.Fatalf("a note's id opens the note, past the span on its line, and it answers %+v", got[2])
	}
}

// A column counts UTF-16 units, so a pointer past a wide character keeps its place. [[spec/design_output/lsp#a-pointer-opens-its-target]]
func TestALinkCountsUTF16Units(t *testing.T) {
	tree := fixture(t, map[string]string{
		"spec/design_output/one.md": "# Scope\n",
		"spec/guidance/two.md":      "# A rule\n\nä 😀 [[spec/design_output/one]]\n",
	})

	got := linksIn(tree, "spec/guidance/two.md")
	if len(got) != 1 || got[0].Range.Start.Character != 5 {
		t.Fatalf("one link, after a character of one unit and one of two, and it answers %+v", got)
	}
}

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
