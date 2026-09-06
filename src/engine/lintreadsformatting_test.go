package main

import (
	"bytes"
	"encoding/json"
	"strings"
	"testing"
)

// THE LINT READS FORMATTING, so the battery does not have to.
//
// gofmt was the last Go tool the lint verb did not cover. The four go vet
// lines came out of the battery because LintGo already ran vet over every
// module, so the second pass learned nothing. gofmt was not that case: no
// linter in the default golangci set formats, and the tree carries no config
// adding one, so a file gofmt would rewrite was reported by the battery and
// by nothing else.
//
// SO THE READING HALF OF THE FORMATTER SITS BEHIND THE LINT VERB. se format
// writes such a file, and a check never writes the tree it judges, so the
// lint names it instead and the battery's gofmt line can go.

// theLintSays runs the verb over a tree and answers what it wrote.
func theLintSays(t *testing.T, r Roots) struct {
	Findings []Finding `json:"findings"`
	Refused  []string  `json:"refused"`
} {
	t.Helper()
	var out, errs bytes.Buffer
	run["lint"](&call{ctx: t.Context(), roots: r,
		args: []string{}, in: strings.NewReader(""), out: &out, err: &errs})
	var said struct {
		Findings []Finding `json:"findings"`
		Refused  []string  `json:"refused"`
	}
	if err := json.Unmarshal(out.Bytes(), &said); err != nil {
		t.Fatalf("the lint did not answer JSON: %v: %s", err, out.String()+errs.String())
	}
	return said
}

// aFormattingFinding answers the finding about this file, and the empty
// string when the lint said nothing about it.
func aFormattingFinding(said []Finding, file string) string {
	for _, f := range said {
		if strings.Contains(f.ID, file) && strings.Contains(strings.ToLower(f.Says), "format") {
			return f.Says
		}
	}
	return ""
}

func TestTheLintNamesAFileTheFormatterWouldChange(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	// THE SAME CROOKED FILE THE FORMAT TEST PLANTS: spaces where gofmt
	// writes a tab, and ordinary Go otherwise.
	aGoModule(t, r.Method, "crooked",
		"package main\n\nfunc main() {\n        println(\"hello\")\n}\n")

	said := theLintSays(t, r)
	found := aFormattingFinding(said.Findings, "main.go")
	if found == "" {
		t.Fatalf("the lint read the Go and said nothing about a file gofmt would "+
			"rewrite, so the battery is the only thing that would catch it: %+v", said)
	}
	// A FINDING SAYS WHAT TO DO ABOUT IT, and for this one the move is the
	// verb that writes the file.
	if !strings.Contains(found, "se format") {
		t.Errorf("the finding does not name se format, so it names no next move: %s", found)
	}
}

// AND A STRAIGHT TREE IS NOT ACCUSED, which is the half that says the rule
// reads the file rather than the presence of a module.
func TestAStraightFileIsNoFormattingFinding(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	aGoModule(t, r.Method, "straight",
		"package main\n\nfunc main() {\n\tprintln(\"hello\")\n}\n")

	said := theLintSays(t, r)
	if found := aFormattingFinding(said.Findings, "main.go"); found != "" {
		t.Fatalf("a file the formatter would leave alone was reported: %s", found)
	}
}
