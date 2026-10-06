// A block places a match off its offset or its runs, a search falls back past
// copies against inline code, and prose splits into placed sentences.
// [[spec/design_output/rules#the-text-model]]
package rules

import "testing"

func TestAMatchInARunStandsAtItsSource(t *testing.T) {
	t.Parallel()
	source := "Read `x` and just go.\n"
	one := block{text: "Read *** and just go.", offset: -1, runs: []run{{at: 0, src: 0, n: 4}, {at: 8, src: 8, n: 13}}}
	begin, end, ok := one.place(source, hit{begin: 13, end: 17, match: "just"})
	if !ok || source[begin:end] != "just" {
		t.Errorf("the match stands at %d-%d (%v)", begin, end, ok)
	}
}

func TestTheSearchSkipsACopyAgainstInlineCode(t *testing.T) {
	t.Parallel()
	source := "It ends `x`. The rest. Here.\n"
	one := block{text: "It ends ***. The rest. Here.", offset: -1}
	begin, _, ok := one.place(source, hit{begin: 11, end: 13, match: ". "})
	if !ok || begin != 21 {
		t.Errorf("the match stands at %d (%v), and wants 21", begin, ok)
	}
}

func TestProseSplitsIntoPlacedSentencesAndParagraphs(t *testing.T) {
	t.Parallel()
	text := "The door reads. It writes."
	found := proseBlocks(block{text: text, scope: "text.md", offset: 10}, []byte("0123456789"+text), true)
	want := []block{
		{text: text, scope: "paragraph.text.md", offset: 10},
		{text: "The door reads.", scope: "sentence.text.md", offset: 10},
		{text: "It writes.", scope: "sentence.text.md", offset: 26},
		{text: text, scope: "text.md", offset: 10},
	}
	if len(found) != len(want) {
		t.Fatalf("the prose splits into %+v", found)
	}
	for at, one := range want {
		if found[at].text != one.text || found[at].scope != one.scope || found[at].offset != one.offset {
			t.Errorf("block %d reads %+v, and wants %+v", at, found[at], one)
		}
	}
}

func TestTheTaggerMarksThePastAtItsOffset(t *testing.T) {
	t.Parallel()
	for _, word := range taggedWords("The engine wrote the file.") {
		if word.Text == "wrote" && (word.Tag != "VBD" || word.Start != 11) {
			t.Errorf("wrote tags as %+v", word)
		}
	}
}
