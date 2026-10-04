// The links verb asks what reaches the target named, and what reaches nothing
// where no target comes.
// [[spec/tickets/read-verbs-port-to-go]]
package main

import (
	"strings"
	"testing"
)

func TestLinksVerb(t *testing.T) {
	for _, one := range []struct{ argv, want string }{
		{"links spec/guidance/working", "links spec/guidance/working"},
		{"links", "dangling"},
	} {
		asked := [][]string{}
		if code, _, _ := runsTwin(linksVerb(askHolding([]any{}, nil, &asked)), strings.Fields(one.argv)...); code != 0 || strings.Join(asked[0], " ") != one.want {
			t.Fatalf("%s answers %d and asks %v, and wants %s", one.argv, code, asked, one.want)
		}
	}
}
