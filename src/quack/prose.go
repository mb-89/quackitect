// quack prose: the findings the Go vetoes leave, read off one JSON request on
// stdin. The bridge reads it beside wink's answer while the prose slice runs
// in shadow.
// [[spec/tickets/prose-checks-run-in-go]]
package main

import "quackitect/src/prose"

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
	return nil, nil
}
