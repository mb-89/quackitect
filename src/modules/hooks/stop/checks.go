// Every check the stop door answers, off CHECKS, claimFalls and FALLS in
// src/bridge/stop.js, each a function over the facts the door stamps and the
// box keeps. [[spec/tickets/cage-stop-rules-port]]
package stop

import "strings"

// The owner's holds, the binding that stands the engine's checks down, and the one a desk's queue reads. [[spec/design_output/config#the-engine-controls]]
const (
	StopHold     = "stop"
	FinishHold   = "finish"
	GodBinding   = "god"
	QueueBinding = "queue"
	noStopLine   = "no-stop-line"
	planIsEmpty  = "the-plan-is-empty"
	helpersRun   = "helpers-running"
	groupInHand  = "group-in-hand"
)

// What a check reads: the hook set off, the hold over the turn, the claim and the last text, the box, and the tree. [[spec/design_output/stop#the-mechanical-checks]]
type Facts struct {
	Off     bool
	Hold    string
	Claimed string
	Text    string
	Cloud   bool
	Binding string
	// The owner's prompts this session, whether a todo stands open, the helpers spawned and running, a helper the harness names running, and a report this turn carried. [[spec/design_output/stop#the-tooth-holds-its-state]]
	Prompts  int
	Todos    bool
	Helpers  int
	Running  bool
	Reported bool
	// The tree: the group in hand off the branch, the holds standing, an open private ticket, the queue's free work on trunk, a person's step in hand, and the plan. [[spec/tickets/the-stop-reads-the-state]]
	Group      bool
	Holds      int
	Private    bool
	Queue      bool
	PersonStep bool
	Working    string
	Planned    []string
	Rules      []Rule
}

// The checks reading the engine's own work, which the god binding stands down. [[spec/design_output/config#the-engine-controls]]
var engineChecks = map[string]bool{"ticket-in-hand": true, groupInHand: true, "work-waiting": true}

// The checks reading the answer's text, which the stop call runs before any answer stands. [[spec/design_output/stop#a-refusal-names-its-check]]
var ReadsText = map[string]bool{"a-report-stands": true, noStopLine: true}

// Every check this door answers, one a key. [[spec/design_output/stop#the-mechanical-checks]]
var checks = map[string]func(Facts) bool{
	OffCheck:         func(f Facts) bool { return f.Off },
	"owner-holds":    func(f Facts) bool { return f.Hold == StopHold },
	"owner-finishes": func(f Facts) bool { return f.Hold == FinishHold },
	// An answer naming a next step takes no free stop. [[spec/design_output/stop#the-chat-is-new]]
	"chat-is-new":    func(f Facts) bool { return !f.Cloud && f.Prompts <= 1 && !NamesNext(f.Text) },
	"work-waiting":   func(f Facts) bool { return f.Todos },
	groupInHand:      func(f Facts) bool { return f.Group },
	"ticket-in-hand": func(f Facts) bool { return f.Holds > 0 || f.Private },
	// A desk bound to the queue on trunk has work while a free ticket stands. [[spec/design_output/stop#the-mechanical-checks]]
	"queue-waits": func(f Facts) bool { return !f.Cloud && f.Binding == QueueBinding && f.Queue },
	// A cloud box that ends its turn loses every helper in it. [[spec/design_output/stop#a-helper-still-runs]]
	helpersRun: func(f Facts) bool { return !f.Cloud && (f.Helpers > 0 || f.Running) },
	// A cloud box hands a person's step back as a ticket, so no step there waits on a person. [[spec/tickets/the-stop-reads-the-state]]
	"step-waits-on-person": func(f Facts) bool { return !f.Cloud && f.PersonStep },
	"a-person-sits-here":   func(f Facts) bool { return !f.Cloud },
	"a-report-stands":      func(f Facts) bool { return ReportStands(f.Text) || f.Reported },
	"never":                func(Facts) bool { return false },
	planIsEmpty:            PlanEmpty,
}

// A check's answer, and whether this door holds it. The god binding stands the engine's checks down. [[spec/design_output/stop#the-mechanical-checks]]
func Ran(name string, f Facts) (bool, bool) {
	// A claim a fact denies reads as no stop line, so the turn holds and the fact re-prompts. [[spec/design_output/stop#a-talk-follows-a-report]]
	if name == noStopLine {
		return !claimStands(f), true
	}
	check, known := checks[name]
	if !known {
		return false, false
	}
	if f.Binding == GodBinding && engineChecks[name] {
		return false, true
	}
	return check(f), true
}

// Whether the door holds a check by that name. [[spec/design_output/stop#the-mechanical-checks]]
func KnowsCheck(name string) bool {
	_, known := checks[name]
	return known || name == noStopLine
}

// A claim of done stands on an empty plan: no todo open, and nothing in hand. [[spec/design_output/stop#the-plan]]
func PlanEmpty(f Facts) bool {
	return len(f.Planned) == 0 && f.Working == ""
}

func claimStands(f Facts) bool {
	return f.Claimed != "" && ClaimFalls(f) == ""
}

// Why a claim falls, or nothing where it stands or no claim stands, so every refusal names its check. [[spec/design_output/stop#a-refusal-names-its-check]]
func ClaimFalls(f Facts) string {
	if f.Claimed == "" {
		return ""
	}
	rule, known := ReasonOf(f.Rules, f.Claimed)
	if !known {
		return "The line claims " + f.Claimed + ", which names no reason this tree holds."
	}
	if said, _ := Ran(rule.Runs, f); rule.Runs == "" || said {
		return ""
	}
	why := "."
	if seen := falls(rule.Runs, f); seen != "" {
		why = ": " + seen
	}
	return "The line claims " + rule.ID + ", and its check " + rule.Runs + " answers false" + why
}

// What a check sees where it answers false. [[spec/design_output/stop#a-refusal-names-its-check]]
func falls(name string, f Facts) string {
	switch name {
	case planIsEmpty:
		var held []string
		for _, one := range append(append([]string{}, f.Planned...), f.Working) {
			if one != "" && !contains(held, one) {
				held = append(held, one)
			}
		}
		quoted := make([]string, 0, len(held))
		for _, one := range held {
			quoted = append(quoted, `"`+one+`"`)
		}
		return "the plan still holds " + strings.Join(quoted, ", ") + ". Name each under done in mcp__level0__plan, then claim again."
	case helpersRun:
		if f.Cloud {
			return "a cloud box that ends its turn stops its container, and every helper in it stops too, so no answer wakes this session. Wait for the helper inside this turn, or do its work yourself."
		}
		return "the harness names no helper running at this turn's end, so its answer wakes nothing."
	}
	return ""
}

// A cloud box holding its group stays past the cap. [[spec/design_output/stop#three-in-a-row]]
func Pinned(f Facts) bool {
	said, _ := Ran(groupInHand, f)
	return f.Cloud && said
}

// Whether the winning continue reads the stop line, so its block names why the claim falls. [[spec/design_output/stop#a-refusal-names-its-check]]
func ReadsTheLine(decision Decision) bool {
	return decision.Go != nil && decision.Go.Runs == noStopLine
}

func contains(list []string, one string) bool {
	for _, each := range list {
		if each == one {
			return true
		}
	}
	return false
}
