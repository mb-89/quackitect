// Whether a hand works a leaf: one answer for the pull and the write door.
// [[spec/tickets/the-one-answer-takes-shape]]
package pull

import (
	"strings"
	"testing"
)

// [[spec/tickets/the-one-answer-takes-shape]]
func TestWritesHereReadsEachHandAgainstTheStepBy(t *testing.T) {
	t.Parallel()
	desk, agent, cloud := handRule{}, handRule{agent: true}, handRule{agent: true, cloud: true}
	for _, one := range []struct {
		by, why string
		hand    handRule
		writes  bool
		person  bool
	}{
		{by: "anyone", hand: desk, writes: true},
		{by: "anyone", hand: agent, writes: true},
		{by: "anyone", hand: cloud, writes: true},
		{by: "", hand: agent, writes: true},
		{by: Person, hand: agent, why: "waits for a person at design/review", person: true},
		{by: Person, hand: desk, writes: true},
		{by: Person, hand: handRule{agent: true, ownerSays: true}, writes: true},
		{by: Person, hand: cloud, writes: true},
		{by: "agent", hand: desk, why: "waits for an agent"},
		{by: "agent", hand: agent, writes: true},
		{by: helper, hand: desk, why: "waits for a hand the engine spawns"},
		{by: helper, hand: agent, why: "waits for a hand the engine spawns"},
		{by: helper, hand: cloud, why: "waits for a hand the engine spawns"},
		{by: "children", hand: desk, why: "waits for its own children"},
		{by: "children", hand: agent, why: "waits for its own children"},
		{by: "children", hand: cloud, why: "waits for its own children"},
		{by: "retro", hand: agent, why: "waits for a hand at a retro step"},
		{by: "retro", hand: handRule{agent: true, atRetro: true}, writes: true},
	} {
		writes, why, person := writesHere(&Leaf{Entry: Entry{Path: "design/review"}, By: one.by}, one.hand)
		if writes != one.writes || person != one.person || !strings.Contains(why, one.why) || (writes && why != "") {
			t.Errorf("a %q step for %+v answers %v %q %v, and wants %v %q %v", one.by, one.hand, writes, why, person, one.writes, one.why, one.person)
		}
	}
}
