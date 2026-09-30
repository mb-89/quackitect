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

	"quackitect/src/modules/check"
	"quackitect/src/yaml"
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

// The real table reaches every case it names, as the JavaScript reader does. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
func TestTheStemsReachEveryCase(t *testing.T) {
	text, err := os.ReadFile(filepath.Join("..", "..", "spec", "config", "stems.yaml"))
	if err != nil {
		t.Fatal(err)
	}
	table := check.StemsIn(string(text))
	cases := yaml.AsList(yaml.AsDoc(yaml.Read(string(text))).Get("cases"))
	if len(cases) == 0 {
		t.Fatal("the table names no case")
	}
	for _, row := range cases {
		doc := yaml.AsDoc(row)
		word, reaches := yaml.AsString(doc.Get("word")), yaml.AsString(doc.Get("reaches"))
		if !table.Reaches(word, map[string]bool{reaches: true}) {
			t.Errorf("%s reaches no %s", word, reaches)
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
