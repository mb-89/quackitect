// quack sweep asks the index for the settled sweep and prints it whole.
// [[spec/tickets/the-lsp-server-leaves]]
package main

import (
	"errors"
	"strings"
	"testing"
)

func TestTheSweepVerbPrintsTheSettledSweep(t *testing.T) {
	var asked []string
	var out strings.Builder
	rows := []any{map[string]any{"file": "spec/a.md", "rule": "DeadAnchor", "line": 1}}
	err := sweeps(&out, func(argv ...string) (any, error) {
		asked = argv
		return rows, nil
	})
	if err != nil {
		t.Fatal(err)
	}
	if strings.Join(asked, " ") != "value check/sweep" {
		t.Fatalf("the verb asks %v, and wants the settled value of check/sweep", asked)
	}
	if out.String() != `[{"file":"spec/a.md","line":1,"rule":"DeadAnchor"}]`+"\n" {
		t.Fatalf("the verb prints %q", out.String())
	}
}

func TestAnEmptySweepPrintsAnEmptyList(t *testing.T) {
	var out strings.Builder
	if err := sweeps(&out, func(...string) (any, error) { return nil, nil }); err != nil || out.String() != "[]\n" {
		t.Fatalf("an empty sweep prints %q and %v", out.String(), err)
	}
}

func TestAnIndexFaultReachesTheCaller(t *testing.T) {
	var out strings.Builder
	if err := sweeps(&out, func(...string) (any, error) { return nil, errors.New("down") }); err == nil || out.Len() != 0 {
		t.Fatalf("a fault prints %q and answers %v", out.String(), err)
	}
}
