package main

import (
	"strings"
	"testing"
)

// AN AGENT PICKS A TOOL OFF WHAT IT SAYS OF ITSELF.
//
// se_status answers the state of play, which carries what the engine returned
// this session and how much of it was wrong. What it SAID it answers was the two
// roots, the log it is writing and the rules in force, and none of those is the
// count. So the numbers arrived, and the only reader who would think to ask for
// them is one who had already read the change that put them there.
//
// AND THE COLD DOOR IS THE OTHER HALF. util/cage/mcp-lane.mjs answers tools/list
// off util/cage/tools.json before the lane is built, so a sentence written in the
// lane and not regenerated into that file is a cold session shown the old door.
func TestSeStatusSaysItAnswersTheStateOfPlay(t *testing.T) {
	t.Parallel()
	says := describes(t, tools(), "se_status")

	// The state of play, and the two halves of the count it carries: what came
	// back this session, and how much of it was wrong.
	for _, want := range []string{"state of play", "returned", "wrong"} {
		t.Run("se_status says "+want, func(t *testing.T) {
			if !strings.Contains(says, want) {
				t.Errorf("se_status does not say %q, so nobody comes here for it: %q", want, says)
			}
		})
	}

	t.Run("the cold door says the same", func(t *testing.T) {
		if cold := describes(t, coldDoor(t), "se_status"); cold != says {
			t.Errorf("the cold door says something else. Rewrite it: "+
				".bin/se-mcp --tools > util/cage/tools.json\n  lane: %q\n  cold: %q", says, cold)
		}
	})
}

// describes answers what one tool in a list says of itself, and refuses when
// the list does not carry it: a name nothing describes is a check on nothing.
func describes(t *testing.T, list []map[string]any, name string) string {
	t.Helper()
	for _, tool := range list {
		if tool["name"] == name {
			d, _ := tool["description"].(string)
			return d
		}
	}
	t.Fatalf("%s is not in the list, so there is no description to judge", name)
	return ""
}
