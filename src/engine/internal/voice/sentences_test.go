package voice

import (
	"testing"

	"github.com/google/go-cmp/cmp"
)

// A full stop inside a word is not the end of a sentence. Every word limit and
// every paragraph limit is counted over what this answers, so a path splitting
// into four makes a paragraph of one sentence break a limit of six.
func TestASentenceEndsOnAStopThatEndsOne(t *testing.T) {
	t.Parallel()
	for _, c := range []struct {
		name string
		line string
		want []string
	}{
		{"a file extension is one word", "It answers true for .md and .txt today.",
			[]string{"It answers true for .md and .txt today."}},
		{"a dotted call is one word", "$.model.classify answers one label.",
			[]string{"$.model.classify answers one label."}},
		{"a version is one word", "This box runs 2.1.263 with the flag set.",
			[]string{"This box runs 2.1.263 with the flag set."}},
		{"a stop before a capital ends one", "The gate holds. The panel draws it.",
			[]string{"The gate holds.", " The panel draws it."}},
		{"a stop before a code span ends one", "It reads .md. `isProse` says so.",
			[]string{"It reads .md.", " `isProse` says so."}},
		{"an ellipsis ends none", "It waited... Then it went on.",
			[]string{"It waited... Then it went on."}},
		{"a question and a shout end one", "Does it? It does! Twice.",
			[]string{"Does it?", " It does!", " Twice."}},
		{"a table row is not a paragraph", "| a | b |", nil},
	} {
		t.Run(c.name, func(t *testing.T) {
			t.Parallel()
			if d := cmp.Diff(c.want, SentencesIn(c.line)); d != "" {
				t.Errorf("SentencesIn(%q) (-want +got):\n%s", c.line, d)
			}
		})
	}
}
