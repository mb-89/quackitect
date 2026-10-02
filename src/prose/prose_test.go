// The Go vetoes answer the tables of the tense reader, and every prose reader
// asks them through quack prose.
// [[spec/tickets/prose-checks-run-in-go]]
package prose

import (
	"reflect"
	"testing"
)

// The rule names the vetoes read, as Vale spells them. [[spec/tickets/prose-checks-run-in-go]]
const (
	pastRule     = "VoiceParagraph.PastTense"
	sentenceRule = "VoiceParagraph.Sentence"
	outsideRule  = "VoiceParagraph.Vocabulary"
)

var caps = Caps{Sentence: 6, ListItem: 6}

func TestPastReadsTheTenseTable(t *testing.T) {
	cases := []struct {
		line, word string
		past       bool
	}{
		{"the door set the write", "set", false},
		{"the door put the write", "put", false},
		{"the door read the write", "read", false},
		{"the door skips the write", "skips", false},
		{"the door standing there", "standing", false},
		{"the door wrote the file", "wrote", true},
		{"the door did the file", "did", true},
		{"the door failed the file", "failed", true},
		{"| the part | what it holds |", "|", false},
	}
	for _, one := range cases {
		if got := ReadsAsPast(one.line, one.word); got != one.past {
			t.Errorf("%q in %q reads past %v, and wants %v", one.word, one.line, got, one.past)
		}
	}
}

func TestLemmaReadsIrregularForms(t *testing.T) {
	for form, lemma := range map[string]string{
		"wrote": "write", "did": "do", "stood": "stand", "refused": "refuse",
		"skips": "skip", "standing": "stand", "doors": "door",
	} {
		if got := Lemma(form); got != lemma {
			t.Errorf("%q reads the lemma %q, and wants %q", form, got, lemma)
		}
	}
}

func TestExceptionListOverridesGolem(t *testing.T) {
	listed := Exceptions()
	if len(listed) == 0 {
		t.Fatal("the exception list holds no form")
	}
	for form, lemma := range listed {
		if got := Lemma(form); got != lemma {
			t.Errorf("%q reads the lemma %q, and the exception list names %q", form, got, lemma)
		}
	}
}

func TestLongestCountsCodeAndLinkAsOneWord(t *testing.T) {
	cases := map[string]int{
		"The door reads the file.":                           5,
		"The `one/two/three.js` door reads the file.":        6,
		"The [[spec/one#two]] door reads the file.":          6,
		"The door reads. The door reads the whole file now.": 7,
	}
	for text, want := range cases {
		if got := Longest(text); got != want {
			t.Errorf("%q counts %d, and wants %d", text, got, want)
		}
	}
}

func TestLengthFallsUnderTheCap(t *testing.T) {
	short := Finding{Rule: sentenceRule, Line: 1, Column: 1, Said: "The"}
	long := Finding{Rule: sentenceRule, Line: 2, Column: 1, Said: "The"}
	text := "The `a/b/c.js` door reads the file.\nThe door reads the whole file and the note now.\n"
	got := Kept(text, []Finding{short, long}, caps, nil, All)
	if !reflect.DeepEqual(got, []Finding{long}) {
		t.Fatalf("the vetoes keep %v, and want the long sentence alone", got)
	}
}

func TestOutsideFallsOnAListedLemma(t *testing.T) {
	one := Finding{Rule: outsideRule, Line: 1, Column: 5, Said: "doors"}
	text := "the doors stand\n"
	if got := Kept(text, []Finding{one}, caps, map[string]bool{"door": true}, All); len(got) != 0 {
		t.Errorf("a listed lemma keeps %v, and wants nothing", got)
	}
	if got := Kept(text, []Finding{one}, caps, map[string]bool{}, All); len(got) != 1 {
		t.Errorf("an unlisted lemma keeps %v, and wants the finding", got)
	}
}

func TestPastModeLeavesOtherRules(t *testing.T) {
	set := Finding{Rule: pastRule, Line: 1, Column: 10, Said: "set"}
	short := Finding{Rule: sentenceRule, Line: 1, Column: 1, Said: "the"}
	got := Kept("the door set the write\n", []Finding{set, short}, caps, nil, Past)
	if !reflect.DeepEqual(got, []Finding{short}) {
		t.Fatalf("the past mode keeps %v, and wants the sentence finding alone", got)
	}
}
