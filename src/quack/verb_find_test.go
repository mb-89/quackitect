// The find verb hands a log search to the log verb and every other search to
// the index.
// [[spec/design_output/log#one-verb-reads-the-log]]
package main

import (
	"io"
	"strings"
	"testing"
)

func TestFindVerb(t *testing.T) {
	t.Run("a search of the tree asks the index", func(t *testing.T) {
		asked, logged := [][]string{}, [][]string{}
		find := findVerb(askHolding([]any{}, nil, &asked), logRecording(&logged))
		if code, _, _ := runsTwin(find, "find", "verb registry"); code != 0 || strings.Join(asked[0], " ") != "find verb registry" || len(logged) != 0 {
			t.Fatalf("find answers %d, asks %v and logs %v, and wants the index alone", code, asked, logged)
		}
	})
	t.Run("a search of the log hands the words to the log verb", func(t *testing.T) {
		asked, logged := [][]string{}, [][]string{}
		find := findVerb(askHolding([]any{}, nil, &asked), logRecording(&logged))
		if code, _, _ := runsTwin(find, "find", "lint", "--log", "pass"); code != 0 || len(asked) != 0 || strings.Join(logged[0], "|") != "log|--words|lint pass" {
			t.Fatalf("find answers %d, asks %v and logs %v, and wants log --words lint pass", code, asked, logged)
		}
	})
}

// A log twin recording the words it takes. [[spec/design_output/log#one-verb-reads-the-log]]
func logRecording(logged *[][]string) twin {
	return func(argv []string, _ bool, _, _ io.Writer) int {
		*logged = append(*logged, argv)
		return 0
	}
}
