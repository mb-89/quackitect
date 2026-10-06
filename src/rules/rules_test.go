// Each rule refuses the fixture Vale refused, and passes its plain twin. The
// corpus under testdata came off the real Vale before it left the tree.
// [[spec/tickets/go-rules-replace-vale]]
package rules

import (
	_ "embed"
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

//go:embed testdata/cases.json
var casesFile []byte

// One rule's fixture: the path it reads as, the text it refuses, and the plain twin it passes. [[spec/tickets/go-rules-replace-vale]]
type ruleCase struct {
	Check   string `json:"check"`
	Path    string `json:"path"`
	Refuses string `json:"refuses"`
	Passes  string `json:"passes"`
}

// The rules over the tree's own schema and vocabulary, which the tests read off the root. [[spec/tickets/go-rules-replace-vale]]
func loaded(t *testing.T) *Set {
	t.Helper()
	set, err := Load(func(path string) string {
		text, _ := os.ReadFile(filepath.Join("..", "..", filepath.FromSlash(path)))
		return string(text)
	})
	if err != nil {
		t.Fatal(err)
	}
	return set
}

// The findings of one rule among every finding. [[spec/tickets/go-rules-replace-vale]]
func ofRule(found []Finding, check string) []Finding {
	out := []Finding{}
	for _, one := range found {
		if one.Check == check {
			out = append(out, one)
		}
	}
	return out
}

func TestEachRuleRefusesItsFixtureAndPassesItsTwin(t *testing.T) {
	t.Parallel()
	var cases []ruleCase
	if err := json.Unmarshal(casesFile, &cases); err != nil {
		t.Fatal(err)
	}
	set := loaded(t)
	for _, one := range cases {
		t.Run(one.Check, func(t *testing.T) {
			if found := ofRule(set.Lint(one.Path, one.Refuses), one.Check); len(found) == 0 {
				t.Errorf("%s passes its fixture under %s, and Vale refused it:\n%s", one.Check, one.Path, one.Refuses)
			}
			if found := ofRule(set.Lint(one.Path, one.Passes), one.Check); len(found) > 0 {
				t.Errorf("%s refuses its plain twin under %s at %+v", one.Check, one.Path, found[0])
			}
		})
	}
}

// A rule scoped to a path reads the files under it and none outside. [[spec/tickets/go-rules-replace-vale]]
func TestAScopedRuleReadsItsPathsAlone(t *testing.T) {
	t.Parallel()
	set := loaded(t)
	const history = "VoiceVale.History"
	text := "The door used to refuse the write.\n"
	for path, wants := range map[string]bool{
		"spec/design_output/a.md": true,
		"spec/rationales/a.md":    false,
		"spec/tickets/a.md":       false,
		"spec/_draft.md":          false,
	} {
		if found := len(ofRule(set.Lint(path, text), history)) > 0; found != wants {
			t.Errorf("%s under %s answers %v, and wants %v", history, path, found, wants)
		}
	}
	const header = "VoiceVale.CodeHeader"
	code := "// The four doors this module reads.\n\nexport const one = 1;\n"
	for path, wants := range map[string]bool{"src/bridge/a.js": true, "src/a.go": true, "spec/a.md": false} {
		if found := len(ofRule(set.Lint(path, code), header)) > 0; found != wants {
			t.Errorf("%s under %s answers %v, and wants %v", header, path, found, wants)
		}
	}
}

// Code spans, code blocks and the front matter carry no finding of a rule over the prose. [[spec/tickets/go-rules-replace-vale]]
func TestTheMarkupHidesCodeAndFront(t *testing.T) {
	t.Parallel()
	set := loaded(t)
	const shouted = "VoiceVale.ShoutedLead"
	const path = "spec/design_output/a.md"
	if found := ofRule(set.Lint(path, "THIS IS THE SHOUTED PART, and it follows.\n"), shouted); len(found) != 1 || found[0].Line != 1 || found[0].Span != [2]int{1, 25} {
		t.Fatalf("the shouted lead answers %+v, and wants one row at 1:1-25", found)
	}
	for name, text := range map[string]string{
		"a code block":    "Read this.\n\n```\nTHIS IS THE SHOUTED PART, and it follows.\n```\n",
		"a code span":     "`THIS IS THE SHOUTED PART`, and it follows.\n",
		"the front matter": "---\ntitle: THIS IS THE SHOUTED PART, and it follows.\n---\n\nA line.\n",
	} {
		if found := ofRule(set.Lint(path, text), shouted); len(found) > 0 {
			t.Errorf("%s carries %+v", name, found)
		}
	}
}
