// The branches of the vocabulary script the corpus misses, each settled on
// the real Vale. [[spec/design_output/rules#a-script-answers-offsets]]
package rules // level0: InPackageTest - the cases run through the in-package helper paraBranchesMeetVale

import "testing"

// Each branch of Vocabulary answers the rows and the messages Vale answered. [[spec/design_output/rules#a-script-answers-offsets]]
func TestTheParagraphVocabularyBranchesMeetVale(t *testing.T) {
	t.Parallel()
	paraBranchesMeetVale(t, []paraBranch{
		{"a swapped word", "VoiceParagraph.Vocabulary", "notes.md", "The door must ensure the file stands, and Flibbertigibbet reads it.\n", []paraSettled{
			{1, [2]int{15, 20}, "ensure", "ensure stands outside the words this tree writes. Write make instead."},
		}},
		{"a prose field of the frontmatter", "VoiceParagraph.Vocabulary", "notes.md", "---\nstate: flibbertigibbet\nsays: a flibbertigibbet\n---\n\nThe door rereads the files.\n", []paraSettled{
			{3, [2]int{9, 23}, "flibbertigibbet", "flibbertigibbet stands outside the words this tree writes. Write a core word, or add flibbertigibbet to spec/vocabulary/terms.yml with one line that says what it means."},
		}},
	})
}
