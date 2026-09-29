// quack prose answers each document of a request with what the Go vetoes
// keep. [[spec/tickets/prose-checks-run-in-go]]
package main

import (
	"encoding/json"
	"reflect"
	"testing"

	"quackitect/src/prose"
)

func TestProseKeepsWhatTheVetoesLeave(t *testing.T) {
	set := prose.Finding{Rule: "VoiceParagraph.PastTense", Line: 1, Column: 10, Said: "set"}
	wrote := prose.Finding{Rule: "VoiceParagraph.PastTense", Line: 2, Column: 10, Said: "wrote"}
	ask, err := json.Marshal(proseAsk{Mode: prose.Past, Docs: []proseDoc{{
		Text:  "the door set the write\nthe door wrote the file\n",
		Found: []prose.Finding{set, wrote},
	}}})
	if err != nil {
		t.Fatal(err)
	}
	body, err := proseAnswer(ask, nil, prose.Caps{Sentence: 25, ListItem: 25})
	if err != nil {
		t.Fatal(err)
	}
	var got proseAnswered
	if err := json.Unmarshal(body, &got); err != nil {
		t.Fatalf("the answer %q reads as no JSON: %v", body, err)
	}
	want := proseAnswered{Docs: []proseKept{{Kept: []prose.Finding{wrote}}}}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("the answer reads %+v, and wants %+v", got, want)
	}
}
