// The hover shows what a term means, read off the dictionary on each ask.
// [[spec/design_output/lsp#the-hover-shows-a-term]]
package main

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"testing"
)

const hoverSchema = `kind: paragraph
layers:
  vocabulary:
    terms: spec/vocabulary/terms.yml
    endings: spec/config/stems.yaml
`

const hoverTerms = `terms:
  - {word: door, means: "the one place the tree guards an outside thing"}
  - {word: level zero, means: "the plugin holding every door"}
  - {word: vale, means: "a prose linter", source: "https://vale.sh"}
  - {word: read, means: "to take in a file"}
`

const hoverStems = `endings:
  - end: s
    to: [none]
  - end: ies
    to: [y]
prefixes: [un, re]
`

const hoverNote = "The doors hold, and level zero runs vale. We unread it and walk.\n"

func hoverTree(terms string) *Tree {
	return fakeTree(map[string]string{
		"spec/schemas/paragraph.schema.yaml": hoverSchema,
		"spec/vocabulary/terms.yml":          terms,
		"spec/config/stems.yaml":             hoverStems,
		"spec/notes/one.md":                  hoverNote,
	})
}

func hoverOn(tree *Tree, word string) string {
	at := strings.Index(hoverNote, word)
	said := hoverAt(tree, "spec/notes/one.md", position{Line: 0, Character: at + 1})
	if said == nil {
		return ""
	}
	return said.Contents.Value
}

// [[spec/design_output/lsp#the-hover-shows-a-term]]
func TestHoverShowsATermAndItsLine(t *testing.T) {
	tree := hoverTree(hoverTerms)
	cases := map[string]string{
		"doors":  "**door**: the one place the tree guards an outside thing",
		"level":  "**level zero**: the plugin holding every door",
		"zero":   "**level zero**: the plugin holding every door",
		"unread": "**read**: to take in a file",
		"vale":   "**vale**: a prose linter\n\nhttps://vale.sh",
	}
	for word, want := range cases {
		if got := hoverOn(tree, word); got != want {
			t.Errorf("a hover over %s answers %q, and wants %q", word, got, want)
		}
	}
	for _, word := range []string{"hold", "walk", "We"} {
		if got := hoverOn(tree, word); got != "" {
			t.Errorf("a hover over %s answers %q, and wants none", word, got)
		}
	}
}

// [[spec/design_output/lsp#the-hover-shows-a-term]]
func TestHoverReadsTheSavedTerms(t *testing.T) {
	tree := hoverTree(hoverTerms)
	if got := hoverOn(tree, "walk"); got != "" {
		t.Fatalf("walk stands on no list yet, and the hover answers %q", got)
	}
	disk := tree.disk.(*memDisk)
	disk.files["/tree/spec/vocabulary/terms.yml"] = hoverTerms + "  - {word: walk, means: \"to move on foot\"}\n"
	if got := hoverOn(tree, "walk"); got != "**walk**: to move on foot" {
		t.Errorf("a hover after the save answers %q", got)
	}
}

// The real table reaches every case it names, as the JavaScript reader does. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
func TestTheStemsReachEveryCase(t *testing.T) {
	text, err := os.ReadFile(filepath.Join("..", "..", "spec", "config", "stems.yaml"))
	if err != nil {
		t.Fatal(err)
	}
	table := stemsIn(string(text))
	cases := casesIn(string(text))
	if len(cases) == 0 {
		t.Fatal("the table names no case")
	}
	for _, one := range cases {
		if !table.reaches(one.word, map[string]bool{one.reaches: true}) {
			t.Errorf("%s reaches no %s", one.word, one.reaches)
		}
	}
}

// The server names the hover, and a hover request over the protocol answers the line. [[spec/design_output/lsp#the-hover-shows-a-term]]
func TestTheServerAnswersAHover(t *testing.T) {
	tree := hoverTree(hoverTerms)
	at := strings.Index(hoverNote, "doors") + 1
	out := &bytes.Buffer{}
	said := []string{
		`{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}`,
		`{"jsonrpc":"2.0","id":2,"method":"textDocument/hover","params":{"textDocument":{"uri":"file:///tree/spec/notes/one.md"},"position":{"line":0,"character":` + strconv.Itoa(at) + `}}}`,
	}
	if err := Speaks(&Checker{tree: tree}, framed(said...), out); err != nil {
		t.Fatal(err)
	}
	answers := spoken(t, out.String())
	if len(answers) != 2 {
		t.Fatalf("the server answers %d messages", len(answers))
	}
	named, _ := json.Marshal(answers[0].Result)
	if !strings.Contains(string(named), `"hoverProvider":true`) {
		t.Errorf("the capabilities read %s", named)
	}
	shown, _ := json.Marshal(answers[1].Result)
	if !strings.Contains(string(shown), "the one place the tree guards an outside thing") {
		t.Errorf("the hover reads %s", shown)
	}
}
