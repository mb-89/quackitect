// The VoiceShape branches the corpus misses, each answer settled on Vale.
// [[spec/design_output/rules#a-script-answers-offsets]]
package rules

import "testing"

func TestEachVocabularyEntryMessageMeetsVale(t *testing.T) {
	t.Parallel()
	voiceMeets(t, []voiceCase{
		{check: "VoiceShape.VocabularyEntry", text: "terms:\n  - {word: splice\n  - {means: \"x\"}\n  - {word: Splice, means: \"x\"}\n  - {word: splice, defines: [[x]]}\n  - {word: splice, means: \"to join\", source: \"ftp://x\"}\nwords:\n  - {word: door}\n  - {word: door, from: ste}\nswaps:\n  - {word: utilize}\n", want: []voicePlaced{
			{2, [2]int{1, 17}, "An entry stands on one line, and this one leaves its brace open."},
			{3, [2]int{1, 16}, "An entry names its word. Write word: <the word> first."},
			{4, [2]int{1, 30}, "Splice stands outside the shape of a word: lower case letters, a hyphen, and a space between two words."},
			{5, [2]int{1, 34}, "splice points at a note in the tree. Say what it means under means, and cite an outside source under source."},
			{6, [2]int{1, 55}, "splice cites a source that is no web address. Write source: \"https://<the address>\"."},
			{8, [2]int{1, 16}, "A core entry says where it comes from. Write from: ste, openste, common or pronoun."},
			{11, [2]int{1, 19}, "A swap names the core word to write. Write write: <the word>."},
		}},
		{check: "VoiceShape.VocabularyEntry", text: "  - {word: door}\n", want: []voicePlaced{
			{1, [2]int{1, 16}, "An entry stands under words:, terms: or swaps:, and this one stands under none."},
		}},
	})
}

func TestAShapeScriptRefusesTheBranchesTheCorpusMisses(t *testing.T) {
	t.Parallel()
	voiceMeets(t, []voiceCase{
		{check: "VoiceShape.GuidanceEnv", text: "---\nkind: [[guidance]]\nenv: level_zero\n---\n\n# Actionables\n\n1. Run the check.\n", want: []voicePlaced{{3, [2]int{1, 15}, ""}}},
		{check: "VoiceShape.StopRule", text: "- id: one\n  side: maybe\n  priority: 1\n  decides: x\n  says: y\n- id: two\n  side: stop\n  priority: 1\n  decides: x\n  says: y\n", want: []voicePlaced{{1, [2]int{1, 1}, ""}}},
		{check: "VoiceShape.MarkedRuleNamesFailure", text: "# Actionables\n\n1. Run `a. b. c.` now. *\n2. Run it. See [[x. y]]. *\n", want: []voicePlaced{{3, [2]int{1, 24}, ""}}},
	})
}
