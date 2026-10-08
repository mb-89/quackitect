// The index verb asks the index the words it reads, standing where none come,
// and prints the answer indented, or the fault on the error stream.
// [[spec/tickets/read-verbs-port-to-go]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"errors"
	"strings"
	"testing"
)

// An ask recording the words it takes and answering the value or the fault it holds. [[spec/tickets/read-verbs-port-to-go]]
func askHolding(said any, fault error, asked *[][]string) asker {
	return func(argv ...string) (any, error) {
		*asked = append(*asked, argv)
		return said, fault
	}
}

// Runs a twin over the words, and answers its code, its output and its error stream. [[spec/tickets/read-verbs-port-to-go]]
func runsTwin(one twin, argv ...string) (int, string, string) {
	var out, errs strings.Builder
	code := one(argv, false, &out, &errs)
	return code, out.String(), errs.String()
}

func TestIndexVerb(t *testing.T) {
	t.Parallel()
	t.Run("no words ask standing, and the answer prints indented", func(t *testing.T) {
		asked := [][]string{}
		code, out, _ := runsTwin(indexVerb(askHolding(map[string]any{"port": 1}, nil, &asked)), "index")
		if code != 0 || out != "{\n  \"port\": 1\n}\n" || len(asked) != 1 || strings.Join(asked[0], " ") != "standing" {
			t.Fatalf("index answers %d, %q, asked %v, and wants standing printed indented", code, out, asked)
		}
	})
	t.Run("the words pass to the index whole", func(t *testing.T) {
		asked := [][]string{}
		runsTwin(indexVerb(askHolding([]any{}, nil, &asked)), "index", "call", "value", "{}")
		if strings.Join(asked[0], " ") != "call value {}" {
			t.Fatalf("index asks %v, and wants call value {}", asked)
		}
	})
	t.Run("why prints the answer's text, as se-index prints it", func(t *testing.T) {
		asked := [][]string{}
		code, out, _ := runsTwin(indexVerb(askHolding(map[string]any{"text": "a\n└ b"}, nil, &asked)), "index", "why", "a")
		if code != 0 || out != "a\n└ b\n" {
			t.Fatalf("index why answers %d, %q, and wants the text", code, out)
		}
	})
	t.Run("a fault prints on the error stream and exits 1", func(t *testing.T) {
		code, out, errs := runsTwin(indexVerb(askHolding(nil, errors.New("no door"), &[][]string{})), "index")
		if code != exitFailed || out != "" || !strings.Contains(errs, "no door") {
			t.Fatalf("index answers %d, %q, %q, and wants the fault on the error stream", code, out, errs)
		}
	})
}
