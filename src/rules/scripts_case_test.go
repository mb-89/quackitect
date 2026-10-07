// The check each script half runs: a maker over its fixture places the match
// Vale placed, and finds nothing in the plain twin.
// [[spec/design_output/rules#a-script-answers-offsets]]
package rules // level0: InPackageTest - the cases drive the unexported run, scriptIn, scriptMaker and scriptMatch

import (
	"encoding/json"
	"os" // level0: OutsideInDoors - the case reads the rule files the tree ships, as a build check reads source
	"path/filepath"
	"strings"
	"testing"
	"unicode/utf8"
)

// The tree's own texts, read off the root as Load reads them. [[spec/design_output/rules#a-script-answers-offsets]]
func treeRead(path string) string {
	text, _ := os.ReadFile(filepath.Join("..", "..", filepath.FromSlash(path)))
	return string(text)
}

// The line of a match's begin, and its span in runes from 1 holding both ends. [[spec/design_output/rules#a-script-answers-offsets]]
func placedAt(text string, match scriptMatch) (int, [2]int) {
	lineStart := strings.LastIndex(text[:match.Begin], "\n") + 1
	column := utf8.RuneCountInString(text[lineStart:match.Begin]) + 1
	return strings.Count(text[:match.Begin], "\n") + 1, [2]int{column, column + utf8.RuneCountInString(text[match.Begin:match.End]) - 1}
}

// Runs every maker of one half over its fixture and twin, against Vale's answer. [[spec/design_output/rules#a-script-answers-offsets]]
func scriptsMeetVale(t *testing.T, half map[string]scriptMaker) {
	t.Helper()
	var cases []ruleCase
	if err := json.Unmarshal(casesFile, &cases); err != nil {
		t.Fatal(err)
	}
	var answers map[string]valeAnswer
	if err := json.Unmarshal(valeFile, &answers); err != nil {
		t.Fatal(err)
	}
	for _, one := range cases {
		maker := half[one.Check]
		if maker == nil {
			continue
		}
		t.Run(one.Check, func(t *testing.T) {
			run, err := maker(treeRead)
			if err != nil {
				t.Fatal(err)
			}
			want := ofRule(answers[one.Check].Refuses, one.Check)
			got := run(scriptIn{Path: one.Path, Text: one.Refuses})
			if len(got) != len(want) {
				t.Fatalf("%s answers %+v, and Vale answered %+v", one.Check, got, want)
			}
			for index, row := range want {
				if line, span := placedAt(one.Refuses, got[index]); line != row.Line || span != row.Span || one.Refuses[got[index].Begin:got[index].End] != row.Match {
					t.Errorf("%s stands at %d:%v on %q, and Vale stood at %d:%v on %q", one.Check, line, span, one.Refuses[got[index].Begin:got[index].End], row.Line, row.Span, row.Match)
				}
			}
			if found := run(scriptIn{Path: one.Path, Text: one.Passes}); len(found) > 0 {
				t.Errorf("%s refuses its plain twin at %+v", one.Check, found)
			}
		})
	}
}
