// Each rule refuses the fixture Vale refused, and passes its plain twin. The
// corpus under testdata came off the real Vale before it left the tree.
// [[spec/tickets/go-rules-replace-vale]]
package rules // level0: InPackageTest - the cases read the unexported scriptMakers

import (
	_ "embed"
	"encoding/json"
	"os" // level0: OutsideInDoors - the cases read the rule files and cases the tree ships, as a build check reads source
	"path/filepath"
	"slices"
	"strings"
	"testing"
)

//go:embed testdata/cases.json
var casesFile []byte

//go:embed testdata/vale.json
var valeFile []byte

// What Vale answered over one rule's fixture and its twin. [[spec/tickets/go-rules-span-parity]]
type valeAnswer struct {
	Refuses []Finding `json:"refuses"`
}

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
		"spec/design_output/a.md":    true,
		"spec/rationales/a.md":       false,
		"spec/tickets/a.md":          false,
		"spec/_draft.md":             false,
		"src/imports/baseline/a.txt": false,
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
		"a code block":     "Read this.\n\n```\nTHIS IS THE SHOUTED PART, and it follows.\n```\n",
		"a code span":      "`THIS IS THE SHOUTED PART`, and it follows.\n",
		"the front matter": "---\ntitle: THIS IS THE SHOUTED PART, and it follows.\n---\n\nA line.\n",
	} {
		if found := ofRule(set.Lint(path, text), shouted); len(found) > 0 {
			t.Errorf("%s carries %+v", name, found)
		}
	}
}

// A marker quiets its rule over the stretch it opens, and the rule speaks again past its YES. [[spec/design_output/rules#a-marker-quiets-a-rule]]
func TestLintHonoursTheMarker(t *testing.T) {
	t.Parallel()
	set := loaded(t)
	const shouted = "VoiceVale.ShoutedLead"
	const path = "spec/design_output/a.md"
	const line = "THIS IS THE SHOUTED PART, and it follows.\n"
	text := line + "\n<!-- vale VoiceVale.ShoutedLead = NO -->\n\n" + line + "\n<!-- vale VoiceVale.ShoutedLead = YES -->\n\n" + line
	found := ofRule(set.Lint(path, text), shouted)
	if len(found) != 2 || found[0].Line != 1 || found[1].Line != 9 {
		t.Errorf("the marked text answers %+v, and wants rows at lines 1 and 9 alone", found)
	}
}

// Each rule's finding stands at Vale's line and span over the same match, since the editor and the fix verb place their edits there. [[spec/tickets/go-rules-span-parity]]
func TestEachRulePlacesItsFindingWhereValeDid(t *testing.T) {
	t.Parallel()
	var cases []ruleCase
	if err := json.Unmarshal(casesFile, &cases); err != nil {
		t.Fatal(err)
	}
	var answers map[string]valeAnswer
	if err := json.Unmarshal(valeFile, &answers); err != nil {
		t.Fatal(err)
	}
	set := loaded(t)
	for _, one := range cases {
		t.Run(one.Check, func(t *testing.T) {
			want := ofRule(answers[one.Check].Refuses, one.Check)
			got := ofRule(set.Lint(one.Path, one.Refuses), one.Check)
			if len(got) != len(want) {
				t.Fatalf("%s answers %d row(s), and Vale answered %d: %+v", one.Check, len(got), len(want), want)
			}
			for index, row := range want {
				if got[index].Line != row.Line || got[index].Span != row.Span || got[index].Match != row.Match {
					t.Errorf("%s stands at %d:%v on %q, and Vale stood at %d:%v on %q", one.Check, got[index].Line, got[index].Span, got[index].Match, row.Line, row.Span, row.Match)
				}
			}
		})
	}
}

// Every rule the styles hold as a script finds its Go function, keyed by its check id. [[spec/design_output/rules#a-script-answers-offsets]]
func TestEveryScriptRuleHasItsFunction(t *testing.T) {
	t.Parallel()
	makers := scriptMakers()
	files, err := filepath.Glob(filepath.Join("..", "..", "spec", "config", "styles", "*", "*.yml"))
	if err != nil || len(files) == 0 {
		t.Fatalf("the styles read nothing: %v", err)
	}
	for _, path := range files {
		text, err := os.ReadFile(path)
		if err != nil {
			t.Fatal(err)
		}
		if !slices.Contains(strings.Split(string(text), "\n"), "extends: script") {
			continue
		}
		check := filepath.Base(filepath.Dir(path)) + "." + strings.TrimSuffix(filepath.Base(path), ".yml")
		if makers[check] == nil {
			t.Errorf("%s stands as a script and has no Go function", check)
		}
	}
}
