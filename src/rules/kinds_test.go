// Each token kind answers as Vale answered: a substitution's offer and its
// fix, an occurrence's first match past its cap, and a message's slots.
// [[spec/design_output/rules#the-token-kinds]]
package rules // level0: InPackageTest - the cases drive the unexported run, ruleFile, ruleHead, optionsOf, occurrenceOf and formatMessage

import (
	"slices"
	"testing"
)

// The real Vale answered these three rows over this line. [[spec/design_output/rules#a-finding-carries-its-fix]]
func TestASubstitutionOffersItsSwapAndItsFixAsValeDid(t *testing.T) {
	t.Parallel()
	found := loaded(t).Lint("notes.md", "The door doesn't read it, e.g. a note, etc.\n")
	want := map[string]Finding{
		"VoiceParagraph.Contraction": {Line: 1, Span: [2]int{10, 16}, Match: "doesn't", Message: "Write both words: 'does not' instead of 'doesn't'.", Action: &Action{Name: ActionReplace, Params: []string{"does not"}}},
		"VoiceParagraph.Latin":       {Line: 1, Span: [2]int{27, 30}, Match: "e.g.", Message: "Write it out: 'for example' instead of 'e.g.'.", Action: &Action{Name: ActionReplace, Params: []string{"for example"}}},
		"VoiceParagraph.EtCetera":    {Line: 1, Span: [2]int{40, 43}, Match: "etc.", Message: "Write it out: 'and so on' instead of 'etc.', and keep the full stop the sentence needs."},
	}
	for check, row := range want {
		got := ofRule(found, check)
		if len(got) != 1 || got[0].Line != row.Line || got[0].Span != row.Span || got[0].Match != row.Match || got[0].Message != row.Message {
			t.Errorf("%s answers %+v, and Vale answered %+v", check, got, row)
			continue
		}
		if (got[0].Action == nil) != (row.Action == nil) || (row.Action != nil && (got[0].Action.Name != row.Action.Name || !slices.Equal(got[0].Action.Params, row.Action.Params))) {
			t.Errorf("%s offers %+v, and Vale offered %+v", check, got[0].Action, row.Action)
		}
	}
}

func TestAnOccurrenceReportsItsFirstMatchPastItsCap(t *testing.T) {
	t.Parallel()
	run, err := occurrenceOf(ruleFile{head: ruleHead{message: "Past %d."}, token: `\b\w+\b`, max: 2})
	if err != nil {
		t.Fatal(err)
	}
	if found := run("one two"); len(found) != 0 {
		t.Errorf("a text at its cap answers %+v", found)
	}
	found := run("one two three")
	if len(found) != 1 || found[0].match != "one" || found[0].message != "Past 3." {
		t.Errorf("a text past its cap answers %+v", found)
	}
}

func TestAMessageLeavesASlotPastItsValuesEmpty(t *testing.T) {
	t.Parallel()
	if said := formatMessage("'%s %s'.", "was"); said != "'was '." {
		t.Errorf("the message reads %q", said)
	}
	if said := formatMessage("Plain.", "was"); said != "Plain." {
		t.Errorf("the message reads %q", said)
	}
}

func TestTheOffersJoinAsOneQuotedChoice(t *testing.T) {
	t.Parallel()
	if said := toSentence([]string{"a", "b", "c"}); said != "'a', 'b', or 'c'" {
		t.Errorf("three offers read %q", said)
	}
	if said := optionsOf(`a|b\|c`); !slices.Equal(said, []string{"a", "b|c"}) {
		t.Errorf("the offers split as %q", said)
	}
}
