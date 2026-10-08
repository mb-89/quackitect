// The stop rules this tree ships, read off spec/config/stop the way the hook reads
// them: every file pools whole, a later file's rule votes, and a check a rule names stands.
// [[spec/design_output/stop#where-the-rules-live]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"os" // level0: OutsideInDoors - the case reads the stop rule file the tree holds, as a build check reads source
	"path/filepath"
	"testing"

	"quackitect/src/modules/hooks/stop"
)

// A rule out of a level past the shipped ones, which a later file drops beside them. [[spec/design_output/stop#where-the-rules-live]]
const laterLevel = "- id: a-later-level\n  side: stop\n  priority: 20\n  decides: claimed\n  asks: Later?\n  says: A later level says so.\n"

// Every file under the stop folder, by name and text. [[spec/design_output/stop#where-the-rules-live]]
func shippedStopFiles(t *testing.T) []stop.File {
	t.Helper()
	found, err := filepath.Glob(filepath.Join(treeRoot, filepath.FromSlash(stop.Rules), "*"+stop.RuleEnd))
	if err != nil || len(found) == 0 {
		t.Fatalf("the stop folder holds %q, %v, and wants a rule file", found, err)
	}
	out := []stop.File{}
	for _, at := range found {
		text, err := os.ReadFile(at)
		if err != nil {
			t.Fatal(err)
		}
		out = append(out, stop.File{Name: filepath.Base(at), Text: string(text)})
	}
	return out
}

func stopRuleBy(rules []stop.Rule, id string) (stop.Rule, bool) {
	for _, one := range rules {
		if one.ID == id {
			return one, true
		}
	}
	return stop.Rule{}, false
}

func TestEveryStopFileReadsWhole(t *testing.T) {
	t.Parallel()
	shipped := shippedStopFiles(t)
	rules, broken := stop.Pool(shipped)
	if len(broken) > 0 {
		t.Fatalf("the pool drops %q, and wants every stop file to carry whole rules", broken)
	}
	if _, short := stop.Pool([]stop.File{{Name: "level0.yml", Text: "- id: only-an-id\n"}}); len(short) != 1 {
		t.Fatalf("a file short of a field reads broken %q, and wants it named", short)
	}
	both, _ := stop.Pool(append(shipped, stop.File{Name: "level9.yml", Text: laterLevel}))
	if len(both) != len(rules)+1 {
		t.Fatalf("a later file adds %d rules, and wants one, so the pool reads the folder", len(both)-len(rules))
	}
	quiet := func(string) (bool, bool) { return false, true }
	if said := stop.Decide(both, "a-later-level", quiet); !said.Ends {
		t.Fatalf("a later file's claim reads %+v, and wants the turn to end", said)
	}
}

// [[spec/design_output/stop#the-mechanical-checks]]
func TestEveryMechanicalStopRuleRunsACheckTheDoorHolds(t *testing.T) {
	t.Parallel()
	rules, _ := stop.Pool(shippedStopFiles(t))
	mechanical := 0
	for _, one := range rules {
		if one.Decides != stop.Mechanical {
			continue
		}
		mechanical++
		if !stop.KnowsCheck(one.Runs) {
			t.Errorf("%s runs %q, and the stop door holds no such check", one.ID, one.Runs)
		}
	}
	if mechanical == 0 {
		t.Fatal("the stop folder names no mechanical rule")
	}
}

// [[spec/design_output/stop#a-check-beats-a-claim]]
func TestTheShippedStopRulesKeepTheirYieldsAndRanks(t *testing.T) {
	t.Parallel()
	rules, _ := stop.Pool(shippedStopFiles(t))
	by := func(id string) stop.Rule {
		one, held := stopRuleBy(rules, id)
		if !held {
			t.Fatalf("no stop rule carries %s", id)
		}
		return one
	}
	for _, id := range []string{"a-wrong-answer-leaves-the-box", "the-work-stands-complete"} {
		if !by(id).Yields {
			t.Errorf("%s yields to no check, and wants to, since the agent claims it over its own work", id)
		}
	}
	for _, id := range []string{"the-owner-holds-the-step", "the-chat-is-new", "your-helpers-still-run"} {
		if by(id).Yields {
			t.Errorf("%s yields to a check, and wants to stand over it", id)
		}
	}
	for _, id := range []string{"an-update-is-worth-giving", "a-person-holds-the-answer", "the-owner-asks-to-talk"} {
		if _, held := stopRuleBy(rules, id); held {
			t.Errorf("a stop rule carries %s, and wants none", id)
		}
	}
	helper := by("your-helpers-still-run")
	if helper.Decides != stop.Claimed || helper.Runs != "helpers-running" || helper.Priority <= by("work-still-stands").Priority {
		t.Errorf("the helper stop reads %+v, and wants a claim over helpers-running above work-still-stands", helper)
	}
	if wrong := by("a-wrong-answer-leaves-the-box"); wrong.Decides != stop.Claimed {
		t.Errorf("the blast radius rule decides %q, and wants a claim", wrong.Decides)
	}
	step := by("the-owner-holds-the-step")
	if step.Side != stop.StopSide || step.Decides != stop.Claimed || step.Waits != "owner" || step.Runs != "step-waits-on-person" {
		t.Errorf("the owner's step reads %+v, and wants a claimed stop waiting on the owner over step-waits-on-person", step)
	}
	for _, id := range []string{"work-still-stands", "the-last-line-names-no-stop"} {
		if step.Priority <= by(id).Priority {
			t.Errorf("the owner's step ranks at or under %s", id)
		}
	}
}

// The tree's own rule file holds a-cloud-box-decides running ends-on-a-question, as the pure stop test assumes. [[spec/design_output/stop#a-cloud-box-decides]]
func TestTheTreeHoldsACloudBoxDecides(t *testing.T) {
	t.Parallel()
	at := filepath.Join("..", "..", stop.Rules, "level0.yml")
	text, err := os.ReadFile(at)
	if err != nil {
		t.Fatal(err)
	}
	rules, broken := stop.Pool([]stop.File{{Name: "level0.yml", Text: string(text)}})
	if len(broken) > 0 {
		t.Fatalf("%s reads broken: %v", at, broken)
	}
	for _, one := range rules {
		if one.ID == "a-cloud-box-decides" {
			if one.Runs != "ends-on-a-question" || one.Side != stop.GoSide || !stop.KnowsCheck(one.Runs) {
				t.Fatalf("a-cloud-box-decides reads %+v, want a continue rule running ends-on-a-question", one)
			}
			return
		}
	}
	t.Fatalf("%s holds no rule a-cloud-box-decides", at)
}
