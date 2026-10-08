// The VoiceVale branches the corpus misses, each answer settled on Vale.
// [[spec/design_output/rules#a-script-answers-offsets]]
package rules // level0: InPackageTest - the cases run through the in-package helpers voiceMeets and homeOf

import "testing"

func TestAValeScriptRefusesTheBranchesTheCorpusMisses(t *testing.T) {
	t.Parallel()
	voiceMeets(t, []voiceCase{
		{check: "VoiceVale.CodeHeader", text: "// a\n// b\n// c\n// d\n// e\n// f [[x]]\n// g\n// It reads 3 doors.\nexport const one = 1;\n", want: []voicePlaced{{7, [2]int{1, 4}, ""}, {8, [2]int{13, 19}, ""}}},
		{check: "VoiceVale.CodeComment", text: "#!/usr/bin/env node\n/* head\n */\nexport const one = 1;\n/* a\n   b\n*/\n// eslint: off\nexport const two = 2;\n", want: []voicePlaced{{5, [2]int{1, 4}, ""}, {6, [2]int{1, 4}, ""}, {7, [2]int{1, 2}, ""}}},
		{check: "VoiceVale.CountedList", text: "The 3 rows below:\n\n| a |\n\nTwo steps here.\n\n1. one\n", want: []voicePlaced{{1, [2]int{5, 10}, ""}, {5, [2]int{1, 9}, ""}}},
		{check: "VoiceVale.OutsideInDoors", text: "const a = process.argv;\nimport \"os\"\n", want: []voicePlaced{{1, [2]int{1, 23}, ""}, {2, [2]int{1, 11}, ""}}},
	})
}

func TestDigitInProseKeepsTheShiftOfALongListNumber(t *testing.T) {
	t.Parallel()
	voiceMeets(t, []voiceCase{
		{check: "VoiceVale.DigitInProse", text: "---\nn: 5\n---\n\nIt takes 30 ms, version 2, v3 and 1.2, and the three doors open.\n\n10. The 4 cases.\n\n    Indented 7 stays.\n", want: []voicePlaced{{5, [2]int{48, 52}, ""}, {7, [2]int{8, 8}, ""}}},
	})
}

// A home path under the user named, built at run time so no source line holds one. [[spec/design_output/rules#a-script-answers-offsets]]
func homeOf(user string) string { return "/" + "home/" + user }

func TestPrivatePassesNobodyAndACodeSpan(t *testing.T) {
	t.Parallel()
	voiceMeets(t, []voiceCase{
		{check: "VoiceVale.Private", text: "Look in " + homeOf("user") + " and " + homeOf("kimlee") + " and `" + homeOf("kimlee") + "` on 2024" + "-01-05, or March 3. Call +49 " + "170 1234567.\n", want: []voicePlaced{{1, [2]int{24, 35}, ""}, {1, [2]int{59, 68}, ""}, {1, [2]int{74, 80}, ""}, {1, [2]int{88, 102}, ""}}},
	})
}
