// The voice scripts against Vale's answer over the corpus, and the shared
// check of a hand-settled case. [[spec/design_output/rules#a-script-answers-offsets]]
package rules

import (
	"sort"
	"testing"
)

// One case past the corpus: a text, and each match Vale placed there with its line, its span and its message. [[spec/design_output/rules#a-script-answers-offsets]]
type voiceCase struct {
	check, text string
	want        []voicePlaced
}

// One placed match: its line, its span in runes from 1, and its message where the script names one. [[spec/design_output/rules#a-script-answers-offsets]]
type voicePlaced struct {
	line    int
	span    [2]int
	message string
}

// The matches as Vale reports them: the first at each begin, sorted by position, as AddAlert and SortedAlerts do. [[spec/design_output/rules#a-script-answers-offsets]]
func voiceReported(found []scriptMatch) []scriptMatch {
	out := []scriptMatch{}
	seen := map[int]bool{}
	for _, match := range found {
		if !seen[match.Begin] {
			seen[match.Begin] = true
			out = append(out, match)
		}
	}
	sort.SliceStable(out, func(i, j int) bool { return out[i].Begin < out[j].Begin })
	return out
}

// Runs each case's script and holds its reported matches to what Vale placed. [[spec/design_output/rules#a-script-answers-offsets]]
func voiceMeets(t *testing.T, cases []voiceCase) {
	t.Helper()
	for _, one := range cases {
		run, err := voiceScripts[one.check](treeRead)
		if err != nil {
			t.Fatal(err)
		}
		got := voiceReported(run(scriptIn{Path: "probe", Text: one.text}))
		if len(got) != len(one.want) {
			t.Errorf("%s over %q answers %+v, and Vale answered %+v", one.check, one.text, got, one.want)
			continue
		}
		for index, row := range one.want {
			line, span := placedAt(one.text, got[index])
			if line != row.line || span != row.span || got[index].Message != row.message {
				t.Errorf("%s over %q stands at %d:%v saying %q, and Vale stood at %d:%v saying %q", one.check, one.text, line, span, got[index].Message, row.line, row.span, row.message)
			}
		}
	}
}

func TestTheVoiceScriptsMeetVale(t *testing.T) {
	t.Parallel()
	scriptsMeetVale(t, voiceScripts)
}
