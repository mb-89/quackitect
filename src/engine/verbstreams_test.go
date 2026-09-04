package main

import (
	"bytes"
	"strings"
	"testing"
)

// THE ANSWER STREAM CARRIES THE ANSWER, AND NOTHING ELSE.
//
// THE OWNER'S WORDS: What's up with this error message?
//
// The panel showed "The engine answered something that is not JSON, so it did
// not read the call and nothing was minted." That sentence is the extension's
// last resort, for an answer it could not parse and could not name. Every
// verb sent its flag errors and its usage to the answer stream, so a call
// with one wrong flag put a usage message where a JSON reader was looking,
// and every reader of every verb met the same unnameable failure.
//
// SO A FLAG A VERB HAS NOT GOT LEAVES THE ANSWER STREAM EMPTY and says what
// happened where errors go. A reader parsing the answer then sees nothing to
// parse, which is honest, and the reason is on the stream that carries
// reasons.
//
// EVERY VERB, COUNTED FROM THE SIDE THAT PRODUCES THEM. The dispatch table is
// the set, so a verb added next month is held to this without anybody editing
// this test.
func TestAFlagAVerbHasNotGotLeavesTheAnswerStreamEmpty(t *testing.T) {
	t.Parallel()
	for _, name := range Verbs() {
		t.Run(name, func(t *testing.T) {
			t.Parallel()
			r := guidanceTree(t)
			var out, errs bytes.Buffer
			code := run[name](&call{roots: r, args: []string{"--a-flag-nothing-has", "x"},
				in: strings.NewReader(""), out: &out, err: &errs})

			if out.Len() != 0 {
				t.Errorf("%s put %d bytes on the answer stream: %s", name, out.Len(), out.String())
			}
			if !strings.Contains(errs.String(), "a-flag-nothing-has") {
				t.Errorf("%s did not name the flag where errors go: %s", name, errs.String())
			}
			if code == 0 {
				t.Errorf("%s answered success for a call it did not read", name)
			}
		})
	}
}
