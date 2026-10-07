// The branches of the line scripts the corpus misses, each settled on the
// real Vale. [[spec/design_output/rules#a-script-answers-offsets]]
package rules // level0: InPackageTest - the cases run through the in-package helper paraBranchesMeetVale

import "testing"

// Each branch of Characters, Markup, ListItem and CodeSpans answers the rows and the messages Vale answered. [[spec/design_output/rules#a-script-answers-offsets]]
func TestTheParagraphLineBranchesMeetVale(t *testing.T) {
	t.Parallel()
	paraBranchesMeetVale(t, []paraBranch{
		{"a semicolon outside the exception", "VoiceParagraph.Characters", "notes.md", "Read the TL;DR list; it holds the rest.\n", []paraSettled{
			{1, [2]int{20, 20}, ";", "The character ; stands outside the set a paragraph admits: letters, digits, space, and . , ? ! : ( ) ' \" -. Write it in words, or put it in a code span."},
		}},
		{"a heading naming two things", "VoiceParagraph.Markup", "notes.md", "# The door: a reader\n\nThe door reads.\n", []paraSettled{
			{1, [2]int{1, 20}, "# The door: a reader", "A dash or a colon makes a heading into two. Name one thing."},
		}},
		{"a strong lead past its cap", "VoiceParagraph.Markup", "notes.md", "- **The door reads every note** here.\n", []paraSettled{
			{1, [2]int{1, 37}, "- **The door reads every note** here.", "A strong lead holds 4 words, and this one holds 5. Cut it."},
		}},
		{"a tag", "VoiceParagraph.Markup", "notes.md", "The door reads <b>this</b> line.\n", []paraSettled{
			{1, [2]int{16, 18}, "<b>", "An image and a tag stand outside the markup a paragraph admits. Write a code span, a link, a fence, a table, a list item, a heading or a strong lead."},
			{1, [2]int{23, 26}, "</b>", "An image and a tag stand outside the markup a paragraph admits. Write a code span, a link, a fence, a table, a list item, a heading or a strong lead."},
		}},
		{"a second sentence past the item cap", "VoiceParagraph.ListItem", "notes.md", "- The door reads. It reads every note in the tree and every ticket in the queue and every rule in the folder first today.\n", []paraSettled{
			{1, [2]int{1, 121}, "- The door reads. It reads every note in the tree and every ticket in the queue and every rule in the folder first today.", "A sentence in a list item holds 20 words, and this one holds 21. Cut it."},
		}},
		{"a list item sentence at the cap", "VoiceParagraph.ListItem", "notes.md", "- The door reads. It reads every note in the tree and every ticket in the queue and every rule in the folder first.\n", nil},
		{"a second sentence past the span cap", "VoiceParagraph.CodeSpans", "notes.md", "Run `a`. Then run `a`, `b`, `c`, `d` and `e` in order.\n", []paraSettled{
			{1, [2]int{1, 54}, "Run `a`. Then run `a`, `b`, `c`, `d` and `e` in order.", "A sentence holds 4 code spans, and this one holds 5. Carry the rest as a list or a table."},
		}},
	})
}
