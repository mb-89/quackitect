// quack prose: the findings the Go vetoes leave, read off one JSON request on
// stdin. The bridge reads it beside wink's answer while the prose slice runs
// in shadow.
// [[spec/tickets/prose-checks-run-in-go]]
package main

import (
	"encoding/json"
	"strings"

	"quackitect/src/prose"
	"quackitect/src/yaml"
)

// The paragraph schema the caps and the list paths come off, and the lists it names where it names none. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
const (
	paragraphSchema = "spec/schemas/paragraph.schema.yaml"
	coreList        = "spec/vocabulary/core.yml"
	termsList       = "spec/vocabulary/terms.yml"
	swapsList       = "spec/vocabulary/swaps.yml"
)

// One document of a request: its text and Vale's findings over it. [[spec/tickets/prose-checks-run-in-go]]
type proseDoc struct {
	Text  string          `json:"text"`
	Found []prose.Finding `json:"found"`
}

// A request: the mode and the documents. [[spec/tickets/prose-checks-run-in-go]]
type proseAsk struct {
	Mode string     `json:"mode"`
	Docs []proseDoc `json:"docs"`
}

// One document's answer: the findings the vetoes keep. [[spec/tickets/prose-checks-run-in-go]]
type proseKept struct {
	Kept []prose.Finding `json:"kept"`
}

// The answer, one entry a document in the order the request names them. [[spec/tickets/prose-checks-run-in-go]]
type proseAnswered struct {
	Docs []proseKept `json:"docs"`
}

// The answer to one request, as JSON. [[spec/tickets/prose-checks-run-in-go]]
func proseAnswer(body []byte, words map[string]bool, caps prose.Caps) ([]byte, error) {
	var ask proseAsk
	if err := json.Unmarshal(body, &ask); err != nil {
		return nil, err
	}
	mode := ask.Mode
	if mode != prose.Past {
		mode = prose.All
	}
	out := proseAnswered{Docs: make([]proseKept, 0, len(ask.Docs))}
	for _, doc := range ask.Docs {
		out.Docs = append(out.Docs, proseKept{Kept: prose.Kept(doc.Text, doc.Found, caps, words, mode)})
	}
	return json.Marshal(out)
}

// The caps and the three list paths the paragraph schema names, the way capsOf and pathsOf read them in the bridge. [[spec/design_output/vocabulary#the-vocabulary-is-three-lists]]
func proseSchema(body []byte) (prose.Caps, [3]string) {
	layers := yaml.AsDoc(yaml.AsDoc(yaml.Read(string(body))).Get("layers"))
	said := yaml.AsDoc(yaml.AsDoc(layers.Get("sentence")).Get("words"))
	caps := prose.Caps{Sentence: yaml.AsInt(said.Get("max")), ListItem: yaml.AsInt(said.Get("listItem"))}
	vocabulary := yaml.AsDoc(layers.Get("vocabulary"))
	paths := [3]string{coreList, termsList, swapsList}
	for i, key := range []string{"core", "terms", "swaps"} {
		if held := strings.TrimSpace(yaml.AsString(vocabulary.Get(key))); held != "" {
			paths[i] = held
		}
	}
	return caps, paths
}
