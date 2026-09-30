// The stop package against lib/stop.js: the rule reader, the vote, the tooth
// and each check, over rules written inline.
// [[spec/tickets/cage-stop-rules-port]]
package stop

import (
	"reflect"
	"testing"
)

// The priorities and the cap the cases vote over. [[spec/tickets/cage-stop-rules-port]]
const (
	highStop   = 90
	midGo      = 80
	lowGo      = 50
	lowStop    = 45
	mostInARow = 2
)

const ruleText = `# A comment above the rules.

- id: the-owner-says-carry-on
  side: continue
  priority: 99
  decides: claimed
  says: carry on

- id: broken
  side: sideways
  priority: 1
  decides: claimed

- id: done
  side: stop
  priority: 45
  decides: claimed
  yields: true
  runs: the-plan-is-empty
  asks: "Does the work stand complete?"
  says: The work stands complete.
`

// Every whole rule reads with its keys, a broken one stands out and names its file, and a file of nothing names itself too. [[spec/design_output/stop#where-the-rules-live]]
func TestTheRulesReadAsThePoolReadsThem(t *testing.T) {
	rules, broken := Pool([]File{{Name: "level0.yml", Text: ruleText}, {Name: "empty.yml", Text: "# nothing\n"}})
	want := []Rule{
		{ID: "the-owner-says-carry-on", Side: GoSide, Priority: 99, Decides: Claimed, Says: "carry on"},
		{ID: "done", Side: StopSide, Priority: lowStop, Decides: Claimed, Yields: true, Runs: "the-plan-is-empty", Asks: "Does the work stand complete?", Says: "The work stands complete."},
	}
	if !reflect.DeepEqual(rules, want) {
		t.Fatalf("the pool reads %+v, want %+v", rules, want)
	}
	if !reflect.DeepEqual(broken, []string{"level0.yml", "empty.yml"}) {
		t.Fatalf("the pool names %v broken, want both files", broken)
	}
	if reasons := StopReasons(rules); len(reasons) != 1 || reasons[0].ID != "done" {
		t.Fatalf("the reasons read %+v, want done alone", reasons)
	}
}

// The higher side wins, a tie goes to stop, a claim yields to a mechanical continue, and the hook set off ends the turn. [[spec/design_output/stop#the-vote]]
func TestDecideVotesAsTheToothVotes(t *testing.T) {
	stops := Rule{ID: "asks", Side: StopSide, Priority: highStop, Decides: Claimed}
	yields := Rule{ID: "done", Side: StopSide, Priority: lowStop, Decides: Claimed, Yields: true, Runs: "yes"}
	goes := Rule{ID: "work", Side: GoSide, Priority: midGo, Decides: Mechanical, Runs: "yes"}
	off := Rule{ID: "out", Side: GoSide, Priority: 0, Decides: Mechanical, Runs: OffCheck}
	ran := func(on bool) func(string) (bool, bool) {
		return func(name string) (bool, bool) {
			if name == OffCheck {
				return on, true
			}
			return name == "yes", name == "yes"
		}
	}
	for _, one := range []struct {
		name    string
		rules   []Rule
		claimed string
		off     bool
		ends    bool
	}{
		{"a claim over a lower continue ends", []Rule{stops, goes}, "asks", false, true},
		{"no claim leaves the continue standing", []Rule{stops, goes}, "", false, false},
		{"a yielding claim loses to a mechanical continue", []Rule{yields, goes}, "done", false, false},
		{"a yielding claim alone ends", []Rule{yields}, "done", false, true},
		{"nothing firing ends", []Rule{goes}[:0], "", false, true},
		{"the hook set off ends", []Rule{goes, off}, "", true, true},
	} {
		if got := Decide(one.rules, one.claimed, ran(one.off)); got.Ends != one.ends {
			t.Errorf("%s: the vote ends=%v, want %v", one.name, got.Ends, one.ends)
		}
	}
}

// The tooth counts the holds in a row, lets go at its cap, and stays past it where pinned. [[spec/design_output/stop#three-in-a-row]]
func TestTheToothLetsGoAfterItsCap(t *testing.T) {
	held := Decision{Go: &Rule{ID: "work", Priority: lowGo}}
	inARow := 0
	for range mostInARow {
		var said Decision
		if said, inARow = AtTurnEnd(held, inARow, mostInARow, false); said.Ends {
			t.Fatalf("the tooth lets go at %d holds, before its cap of %d", said.InARow, mostInARow)
		}
	}
	if said, _ := AtTurnEnd(held, inARow, mostInARow, true); said.Ends {
		t.Fatal("a pinned turn ends past the cap, want it held")
	}
	said, next := AtTurnEnd(held, inARow, mostInARow, false)
	if !said.Ends || !said.Runaway || said.InARow != mostInARow || next != 0 {
		t.Fatalf("past the mostInARow the tooth reads %+v and %d after, want a runaway naming %d holds and none after", said, next, mostInARow)
	}
}

// Each check reads its own facts, and a claim that falls names its check and what it sees. [[spec/design_output/stop#the-mechanical-checks]]
func TestEachCheckReadsItsFacts(t *testing.T) {
	rules, _ := RulesOf(ruleText)
	for _, one := range []struct {
		name  string
		facts Facts
		want  bool
	}{
		{"chat-is-new", Facts{Prompts: 1, Text: "The chat opens."}, true},
		{"chat-is-new", Facts{Prompts: 1, Text: "I'll read the tests."}, false},
		{"chat-is-new", Facts{Prompts: 1, Cloud: true}, false},
		{"queue-waits", Facts{Binding: QueueBinding, Queue: true}, true},
		{"queue-waits", Facts{Binding: GodBinding, Queue: true}, false},
		{"helpers-running", Facts{Running: true}, true},
		{"helpers-running", Facts{Running: true, Cloud: true}, false},
		{"ticket-in-hand", Facts{Private: true}, true},
		{"ticket-in-hand", Facts{Holds: 1, Binding: GodBinding}, false},
		{"the-plan-is-empty", Facts{Working: "a-ticket"}, false},
		{"no-stop-line", Facts{Claimed: "done", Rules: rules}, false},
		{"no-stop-line", Facts{Claimed: "done", Rules: rules, Planned: []string{"Push"}}, true},
	} {
		if got, known := Ran(one.name, one.facts); !known || got != one.want {
			t.Errorf("%s over %+v reads %v, want %v", one.name, one.facts, got, one.want)
		}
	}
	if _, known := Ran("unbuilt", Facts{}); known {
		t.Error("a check the door holds nowhere reads as known")
	}
	want := `The line claims done, and its check the-plan-is-empty answers false: the plan still holds "Push", "a-ticket". Name each under done in mcp__level0__plan, then claim again.`
	if got := ClaimFalls(Facts{Claimed: "done", Rules: rules, Planned: []string{"Push", ""}, Working: "a-ticket"}); got != want {
		t.Errorf("the claim falls saying %q, want %q", got, want)
	}
}
