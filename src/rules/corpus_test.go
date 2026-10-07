// The corpus under testdata pairs each fixture with Vale's answer over it,
// so the span case meets one row a rule. [[spec/tickets/go-rules-span-parity]]
package rules // level0: InPackageTest - the cases read the tree's rules through the in-package helpers rule and ofRule

import (
	"encoding/json"
	"testing"
)

func TestEveryFixtureCarriesOneValeRowOfItsRule(t *testing.T) {
	t.Parallel()
	var cases []ruleCase
	if err := json.Unmarshal(casesFile, &cases); err != nil {
		t.Fatal(err)
	}
	var answers map[string]valeAnswer
	if err := json.Unmarshal(valeFile, &answers); err != nil {
		t.Fatal(err)
	}
	if len(answers) != len(cases) {
		t.Errorf("vale.json answers %d rule(s), and cases.json holds %d", len(answers), len(cases))
	}
	for _, one := range cases {
		answer, found := answers[one.Check]
		if !found {
			t.Errorf("%s carries no answer in vale.json", one.Check)
			continue
		}
		if rows := ofRule(answer.Refuses, one.Check); len(rows) != 1 || rows[0].Line < 1 || rows[0].Span[0] < 1 || rows[0].Span[1] < rows[0].Span[0] {
			t.Errorf("%s carries %+v, and wants one placed row", one.Check, rows)
		}
	}
}
