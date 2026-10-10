// The answer rules read the file an answer lints as, and no ticket or note
// whose name ends the same way. [[spec/design_output/rules#a-rule-reads-its-paths]]
package rules // level0: InPackageTest - the case reads the unexported turnedOn

import "testing"

func TestTheAnswerRulesReadTheAnswerFileAlone(t *testing.T) {
	t.Parallel()
	checks := []string{"VoiceParagraph.ShapeAnswer", "VoiceParagraph.ParagraphAnswer"}
	for path, want := range map[string]bool{
		"level0-answer.md":                          true,
		"spec/tickets/deliver-checks-the-answer.md": false,
		".se/tickets/the-owner-wants-an-answer.md":  false,
		"spec/design_output/answer.md":              false,
	} {
		on := turnedOn(path, checks)
		for _, check := range checks {
			if on[check] != want {
				t.Fatalf("%s turns %s %v, and wants %v", path, check, on[check], want)
			}
		}
	}
}
