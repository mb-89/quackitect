// The VoiceParagraph scripts against the answers Vale gave over the corpus,
// and the runner the branch cases beside each script file share.
// [[spec/design_output/rules#a-script-answers-offsets]]
package rules

import "testing"

// Each VoiceParagraph script places the match Vale placed over its fixture. [[spec/design_output/rules#a-script-answers-offsets]]
func TestTheParagraphScriptsMeetVale(t *testing.T) {
	t.Parallel()
	scriptsMeetVale(t, paragraphScripts)
}

// One row the real Vale answered: its line, its span, its match and its message. [[spec/design_output/rules#a-script-answers-offsets]]
type paraSettled struct {
	line    int
	span    [2]int
	match   string
	message string
}

// One branch the corpus misses, its answer settled on the real Vale over the text at the path. [[spec/design_output/rules#a-script-answers-offsets]]
type paraBranch struct {
	name, check, path, text string
	want                    []paraSettled
}

// Runs each branch and holds its rows and messages to Vale's. [[spec/design_output/rules#a-script-answers-offsets]]
func paraBranchesMeetVale(t *testing.T, branches []paraBranch) {
	t.Helper()
	for _, one := range branches {
		t.Run(one.name, func(t *testing.T) {
			t.Parallel()
			run, err := paragraphScripts[one.check](treeRead)
			if err != nil {
				t.Fatal(err)
			}
			got := run(scriptIn{Path: one.path, Text: one.text})
			if len(got) != len(one.want) {
				t.Fatalf("%s answers %+v, and Vale answered %+v", one.check, got, one.want)
			}
			for index, row := range one.want {
				line, span := placedAt(one.text, got[index])
				found := paraSettled{line, span, one.text[got[index].Begin:got[index].End], got[index].Message}
				if found != row {
					t.Errorf("%s answers %+v, and Vale answered %+v", one.check, found, row)
				}
			}
		})
	}
}

// A schema missing a number a rule reads stops the maker, so every rule runs on a cap it reads. [[spec/design_output/projection#the-second-target]]
func TestAParagraphRuleRefusesASchemaWithoutItsNumber(t *testing.T) {
	t.Parallel()
	empty := func(string) string { return "" }
	for check, maker := range paragraphScripts {
		if check == "VoiceParagraph.Characters" || check == "VoiceParagraph.Vocabulary" {
			continue
		}
		if _, err := maker(empty); err == nil {
			t.Errorf("%s builds over an empty schema", check)
		}
	}
}
