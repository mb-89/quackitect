// A marker in an HTML comment quiets a rule over the stretch it opens, as
// Vale 3.20.0 reads it. [[spec/design_output/rules#a-marker-quiets-a-rule]]
package rules

import "testing"

const (
	quietCheck = "VoiceVale.Antithesis"
	quietOther = "VoiceParagraph.Characters"
)

// The answer of the quiet over one place, for each check named. [[spec/design_output/rules#a-marker-quiets-a-rule]]
func quietAt(text string, line, column int, checks ...string) []bool {
	quiet := quietOf(text)
	out := []bool{}
	for _, check := range checks {
		out = append(out, quiet.holds(check, line, column))
	}
	return out
}

func TestACheckMarkerQuietsItsCheckUntilItsYes(t *testing.T) {
	t.Parallel()
	text := "A line.\n<!-- vale VoiceVale.Antithesis = NO -->\nA door.\n<!-- vale VoiceVale.Antithesis = YES -->\nA window.\n"
	for _, row := range []struct {
		line  int
		wants []bool
	}{{1, []bool{false, false}}, {3, []bool{true, false}}, {5, []bool{false, false}}} {
		if got := quietAt(text, row.line, 1, quietCheck, quietOther); got[0] != row.wants[0] || got[1] != row.wants[1] {
			t.Errorf("line %d answers %v, and wants %v", row.line, got, row.wants)
		}
	}
}

func TestAStyleMarkerQuietsEveryCheckOfItsStyle(t *testing.T) {
	t.Parallel()
	if got := quietAt("<!-- vale VoiceVale = NO -->\nA door.\n", 2, 1, quietCheck, quietOther); !got[0] || got[1] {
		t.Errorf("the style marker answers %v, and wants [true false]", got)
	}
}

func TestValeOffQuietsEveryCheckUntilValeOn(t *testing.T) {
	t.Parallel()
	text := "<!-- vale off -->\nA door.\n<!-- vale on -->\nA window.\n"
	if got := quietAt(text, 2, 1, quietCheck, quietOther); !got[0] || !got[1] {
		t.Errorf("inside vale off answers %v, and wants both quiet", got)
	}
	if got := quietAt(text, 4, 1, quietCheck, quietOther); got[0] || got[1] {
		t.Errorf("past vale on answers %v, and wants neither quiet", got)
	}
}

func TestAMarkerQuietsFromItsColumnOn(t *testing.T) {
	t.Parallel()
	text := "Ünd a door <!-- vale VoiceVale.Antithesis = NO -->here.\n"
	if got := quietAt(text, 1, 11, quietCheck); got[0] {
		t.Errorf("the column before the marker answers quiet")
	}
	if got := quietAt(text, 1, 12, quietCheck); !got[0] {
		t.Errorf("the marker's own column, counted in runes, answers loud")
	}
}

func TestAnUnclosedMarkerRunsToTheEnd(t *testing.T) {
	t.Parallel()
	if got := quietAt("<!-- vale VoiceVale.Antithesis = NO -->\n\n\nA door.\n", 4, 1, quietCheck); !got[0] {
		t.Errorf("the line past an unclosed marker answers loud")
	}
}

func TestAMarkerInCodeQuietsNothing(t *testing.T) {
	t.Parallel()
	for name, text := range map[string]string{
		"a fenced block": "```\n<!-- vale off -->\n```\n\nA door.\n",
		"a tilde block":  "~~~md\n<!-- vale off -->\n~~~\n\nA door.\n",
		"a code span":    "Write `<!-- vale off -->` there.\n\nA door.\n",
	} {
		if got := quietAt(text, 5, 1, quietCheck); got[0] {
			t.Errorf("a marker inside %s quiets the line past it", name)
		}
	}
}

func TestLintHonoursTheMarker(t *testing.T) {
	t.Parallel()
	set := loaded(t)
	const shouted = "VoiceVale.ShoutedLead"
	const path = "spec/design_output/a.md"
	const line = "THIS IS THE SHOUTED PART, and it follows.\n"
	text := line + "\n<!-- vale VoiceVale.ShoutedLead = NO -->\n\n" + line + "\n<!-- vale VoiceVale.ShoutedLead = YES -->\n\n" + line
	found := ofRule(set.Lint(path, text), shouted)
	if len(found) != 2 || found[0].Line != 1 || found[1].Line != 9 {
		t.Errorf("the marked text answers %+v, and wants rows at lines 1 and 9 alone", found)
	}
}
