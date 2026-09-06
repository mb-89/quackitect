package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// ONE RULE, SAID ONCE, IN BOTH PLACES AN AGENT READS IT.
//
// The rule about recording what a person said is written in the guidance and
// again in the tool description, because a tool description is not a
// projection. Nothing joined the two and they drifted: the guidance said record
// whenever you are unsure, and this layer said look in the log first and use
// this only when their words are not already there. An agent reads both.
//
// So the sentence here is the guidance's own, and this refuses when it is not.
func TestTheToolSaysWhatTheGuidanceSays(t *testing.T) {
	t.Parallel()
	path := filepath.Join("..", "..", "doc", "guidance", "driving-the-engine.md")
	b, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("%s cannot be read, so this guards nothing: %v", path, err)
	}
	if len(tools()) == 0 {
		t.Fatal("this layer sends no tools, so this guards nothing")
	}
	// The guidance wraps its lines, and a description does not, so the
	// comparison is on the words rather than on the line breaks.
	guidance := strings.Join(strings.Fields(string(b)), " ")

	t.Run("the guidance carries the rule this layer sends", func(t *testing.T) {
		want := strings.Join(strings.Fields(saidRule), " ")
		if !strings.Contains(guidance, want) {
			t.Fatalf("the tool sends a rule the guidance does not carry:\n  %s", want)
		}
	})

	// AND THE RULE THE GUIDANCE REPLACED IS NOT SENT BESIDE IT. A condition
	// over a private log is the thing the guidance exists to remove.
	for _, gone := range []string{"Look in the log first", "only when their words are not already there"} {
		t.Run("no tool still sends "+gone, func(t *testing.T) {
			for _, tool := range tools() {
				d, _ := tool["description"].(string)
				if strings.Contains(d, gone) {
					t.Errorf("%v still sends %q", tool["name"], gone)
				}
			}
		})
	}
}
