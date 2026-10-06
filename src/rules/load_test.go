// The rule table holds every style file, and a rule file reads into the
// fields its kind takes. [[spec/design_output/rules#load-reads-the-rule-files]]
package rules

import (
	"path/filepath"
	"slices"
	"testing"
)

func TestTheRuleTableNamesEveryStyleFile(t *testing.T) {
	t.Parallel()
	files, err := filepath.Glob(filepath.Join("..", "..", "spec", "config", "styles", "*", "*.yml"))
	if err != nil || len(files) == 0 {
		t.Fatalf("the styles read nothing: %v", err)
	}
	found := []string{}
	for _, path := range files {
		rel, _ := filepath.Rel(filepath.Join("..", ".."), path)
		found = append(found, filepath.ToSlash(rel))
	}
	if !slices.Equal(found, ruleFiles) {
		t.Errorf("the folder holds %v, and the table names %v", found, ruleFiles)
	}
}

func TestARuleFileReadsItsQuotedSwapsInOrderWithItsDefaults(t *testing.T) {
	t.Parallel()
	file, err := parseRule("spec/config/styles/Probe/Swap.yml", "extends: substitution\nmessage: \"'%s' for '%s'\"\naction:\n  name: replace\nswap:\n  '(d)on''t': \"$1o not\"\n  '\\be\\.g\\.': \"for example\"\n")
	if err != nil {
		t.Fatal(err)
	}
	want := []swapRow{{find: "(d)on't", offer: "$1o not"}, {find: `\be\.g\.`, offer: "for example"}}
	if !slices.Equal(file.swaps, want) {
		t.Errorf("the swaps read %v, and want %v", file.swaps, want)
	}
	if file.head.check != "Probe.Swap" || file.head.level != defaultLevel || !slices.Equal(file.scope, []string{defaultScope}) || file.action.Name != actionReplace {
		t.Errorf("the rule reads %+v", file)
	}
}

func TestARuleFileNamingNoKindRefusesToLoad(t *testing.T) {
	t.Parallel()
	if _, err := parseRule("spec/config/styles/Probe/None.yml", "message: plain\n"); err == nil {
		t.Error("a rule file naming no kind loads")
	}
}

func TestARootHoldingNoRuleFileNamesTheFirstPathItReadsEmpty(t *testing.T) {
	t.Parallel()
	_, err := Load(func(string) string { return "" })
	if err == nil || err.Error() != "no rule stands at "+ruleFiles[0] {
		t.Errorf("Load over an empty root answers %v", err)
	}
}
