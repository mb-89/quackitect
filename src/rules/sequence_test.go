// A sequence spans its tagged words and skips its exceptions, and a scope
// reads a sentence block only where it asks for one.
// [[spec/design_output/rules#the-token-kinds]]
package rules // level0: InPackageTest - the cases read the unexported scopeOf and sentenceScope

import "testing"

func TestASequenceSpansItsWordsAndSkipsItsExceptions(t *testing.T) {
	t.Parallel()
	found := ofRule(loaded(t).Lint("notes.md", "The engine has written the file, and it has approved the plan.\n"), "VoiceParagraph.Auxiliary")
	if len(found) != 1 || found[0].Span != [2]int{12, 22} || found[0].Message != "Write the simple tense and name the time: 'has written'." {
		t.Errorf("the sequence answers %+v, and wants one row on has written", found)
	}
}

func TestAScopeReadsASentenceOnlyWhereItAsks(t *testing.T) {
	t.Parallel()
	text, sentence := scopeOf([]string{"text"}), scopeOf([]string{"sentence"})
	for scope, wants := range map[string][2]bool{
		"text.md":                {true, false},
		"paragraph.text.md":      {true, false},
		"sentence.text.md":       {false, true},
		"sentence.text.list.md":  {false, true},
		"text.frontmatter.a.md":  {true, false},
		"text.comment.line":      {true, false},
		"text.heading.h1.md":     {true, false},
		"paragraph.text.list.md": {true, false},
	} {
		if got := [2]bool{text.matches(scope), sentence.matches(scope)}; got != wants {
			t.Errorf("%s reads %v under text and sentence, and wants %v", scope, got, wants)
		}
	}
	if paragraph := scopeOf([]string{"paragraph"}); paragraph.matches("text.list.md") || !paragraph.matches("paragraph.text.md") {
		t.Error("the paragraph scope reads a list item, or misses a paragraph")
	}
}

func TestASequenceReadsTheSentencesOfItsScope(t *testing.T) {
	t.Parallel()
	for declared, want := range map[string]string{"text": "sentence", "list": "sentence.list", "paragraph": "sentence", "sentence.heading": "sentence.heading"} {
		if got := sentenceScope([]string{declared}, "Probe.Seq"); len(got) != 1 || got[0] != want {
			t.Errorf("%s narrows to %v, and wants %s", declared, got, want)
		}
	}
}
