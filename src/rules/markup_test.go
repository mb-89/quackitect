// The markdown model reads front matter as text, keeps a list item out of the
// paragraph rules, and masks the parts a match never lands on.
// [[spec/design_output/rules#the-text-model]]
package rules

import (
	"strings"
	"testing"
)

// The real Vale answered the hedge at 2:43-46 and no passive over this file. [[spec/design_output/rules#the-text-model]]
func TestFrontMatterReadsAsTextAndNoSentence(t *testing.T) {
	t.Parallel()
	found := loaded(t).Lint("notes.md", "---\ntitle: The file was written by the engine just now.\nother: [a, b]\n---\n\nThe door just reads it.\n")
	hedge := ofRule(found, "VoiceParagraph.Hedge")
	if len(hedge) != 2 || hedge[0].Line != 2 || hedge[0].Span != [2]int{43, 46} || hedge[1].Line != 6 || hedge[1].Span != [2]int{10, 13} {
		t.Errorf("the hedge answers %+v", hedge)
	}
	if passive := ofRule(found, "VoiceVale.Passive"); len(passive) > 0 {
		t.Errorf("the front matter reads as a sentence: %+v", passive)
	}
}

func TestAListItemIsNoParagraph(t *testing.T) {
	t.Parallel()
	item := "- " + strings.Repeat("The door reads the file. ", 8) + "\n"
	if found := ofRule(loaded(t).Lint("notes.md", item), "VoiceParagraph.Paragraph"); len(found) > 0 {
		t.Errorf("a list item answers %+v", found)
	}
}

func TestThePrepMasksInfoStringsLinkLabelsAndListNumbers(t *testing.T) {
	t.Parallel()
	content := []byte("```json just\n12. Read [a][just] and [just]: x\n")
	prepMarkdown(content)
	if want := "```*********\n*** Read [a][****] and [****]: x\n"; string(content) != want {
		t.Errorf("the prep reads %q, and wants %q", content, want)
	}
}

func TestTheFrontMatterEndsOnItsClosingFence(t *testing.T) {
	t.Parallel()
	for text, want := range map[string]int{"---\na: b\n---\nbody\n": 13, "---\na: b\n": 0, "body\n---\n": 0} {
		if got := frontEnd(text); got != want {
			t.Errorf("%q ends its front matter at %d, and wants %d", text, got, want)
		}
	}
}
