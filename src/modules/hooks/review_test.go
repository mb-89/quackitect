// The review tool answers off the door: a call answers a spawn of the reader
// under a token, and agent answered answers the report the token names.
// [[spec/tickets/review-spawns-off-the-door]]
package hooks

import (
	"encoding/json"
	"fmt"
	"os"
	"testing"

	"quackitect/src/modules/hooks/brief"
	"quackitect/src/modules/hooks/review"
)

// The tool the case calls, the branch it names, and the material the verb gathers. [[spec/tickets/review-spawns-off-the-door]]
const (
	reviewTool   = "mcp__level0__review_branch"
	reviewBranch = "work/a-group"
	unasked      = "the reader answered a review nobody asked for"
)

var gathered = review.Material{Branch: reviewBranch, Ask: "# Ask", Handback: "# Ask", Check: review.Check{OK: true}, Retro: true}

// A door whose verb gathers the material, or the why the case names. [[spec/tickets/review-spawns-off-the-door]]
func reviewDoor(t *testing.T, why string) *Door {
	t.Helper()
	door := doorOver(t, &calls{}, &book{}).door
	door.from.Review = func(root, branch string) (review.Material, string) {
		if why != "" {
			return review.Material{}, why
		}
		return gathered, ""
	}
	return door
}

func reviewCall(branch string) Post {
	return Post{Event: toolEvent, E: map[string]any{"tool": reviewTool, "branch": branch, "session_id": "s1"}}
}

func answered(e map[string]any) Post {
	e["session_id"] = "s1"
	return Post{Event: "agent.answered", E: e}
}

// The result an answer carries, as the plugin reads it off the wire. [[spec/tickets/review-spawns-off-the-door]]
func reviewResultOf(t *testing.T, said Answer) map[string]any {
	t.Helper()
	for _, one := range said.Effects {
		if one.Kind != resultKind || one.Result == nil {
			continue
		}
		text, err := json.Marshal(one.Result)
		if err != nil {
			t.Fatal(err)
		}
		var out map[string]any
		if err := json.Unmarshal(text, &out); err != nil {
			t.Fatal(err)
		}
		return out
	}
	t.Fatalf("the door answers %+v, and wants a result effect carrying a result", said.Effects)
	return nil
}

// [[spec/tickets/review-spawns-off-the-door]]
func TestAReviewCallAnswersASpawnUnderAToken(t *testing.T) {
	said := reviewResultOf(t, hooks(t, reviewDoor(t, ""), reviewCall(reviewBranch)))
	spawn, _ := said["spawn"].(map[string]any)
	if spawn["prompt"] != review.ReaderAsks(gathered, "") || spawn["description"] != "read "+reviewBranch || spawn["subagentType"] != "general-purpose" {
		t.Errorf("the spawn reads %v, and wants the reader's prompt over the material, read %s, and general-purpose", spawn, reviewBranch)
	}
	back, _ := said["back"].(map[string]any)
	if want := fmt.Sprintf("review-%x", fixed.UnixMilli()); back["event"] != "agent.answered" || back["token"] != want {
		t.Errorf("the back reads %v, and wants agent.answered under %s", back, want)
	}
}

// [[spec/tickets/review-spawns-off-the-door]]
func TestTheAnsweredEventAnswersTheReport(t *testing.T) {
	door := reviewDoor(t, "")
	back, _ := reviewResultOf(t, hooks(t, door, reviewCall(reviewBranch)))["back"].(map[string]any)
	token, _ := back["token"].(string)
	said := reviewResultOf(t, hooks(t, door, answered(map[string]any{"token": token, "text": `{"fix":0}`})))
	if want := reviewBranch + "   nothing to fix. Run branch merge to take it in."; said["result"] != want {
		t.Errorf("the report reads %v, and wants %q", said["result"], want)
	}
	again := reviewResultOf(t, hooks(t, door, answered(map[string]any{"token": token, "text": `{"fix":0}`})))
	if again["result"] != unasked {
		t.Errorf("a token read twice answers %v, and wants %q", again["result"], unasked)
	}
}

// [[spec/tickets/review-spawns-off-the-door]]
func TestATokenNobodyHoldsAnswersTheBridgesLine(t *testing.T) {
	said := reviewResultOf(t, hooks(t, reviewDoor(t, ""), answered(map[string]any{"token": "review-0"})))
	if said["result"] != unasked {
		t.Errorf("the door answers %v, and wants %q", said["result"], unasked)
	}
}

// [[spec/tickets/review-spawns-off-the-door]]
func TestAReviewNamingNoBranchSaysWhatItTakes(t *testing.T) {
	said := reviewResultOf(t, hooks(t, reviewDoor(t, ""), reviewCall("  ")))
	if want := "review_branch takes one branch name."; said["result"] != want {
		t.Errorf("the door answers %v, and wants %q", said["result"], want)
	}
}

// [[spec/tickets/review-spawns-off-the-door]]
func TestAReviewTheVerbGathersNothingForSaysWhy(t *testing.T) {
	said := reviewResultOf(t, hooks(t, reviewDoor(t, "no such branch"), reviewCall(reviewBranch)))
	if want := reviewBranch + ": the verb gathered nothing.\n\nno such branch"; said["result"] != want {
		t.Errorf("the door answers %v, and wants %q", said["result"], want)
	}
}

// [[spec/tickets/review-reads-branch-off-input]]
func TestAReviewCallCarryingItsBranchUnderInputAnswersTheSameSpawn(t *testing.T) {
	call := Post{Event: toolEvent, E: map[string]any{"tool": reviewTool, "input": map[string]any{"branch": reviewBranch}, "session_id": "s1"}}
	said := reviewResultOf(t, hooks(t, reviewDoor(t, ""), call))
	spawn, _ := said["spawn"].(map[string]any)
	if spawn["description"] != "read "+reviewBranch {
		t.Errorf("the spawn reads %v, and wants read %s off the input", spawn, reviewBranch)
	}
}

// [[spec/tickets/review-spawn-pins-helper-layer]]
func TestTheReadersPromptTakesTheHelperLayer(t *testing.T) {
	row := layerRowsOf(t)[0]
	root := treeOf(t, row.Files, "")
	door := reviewDoor(t, "")
	layer := brief.LayerFor(door.treeAt(root), os.Getenv, "")
	if layer == "" {
		t.Fatalf("the row %q answers no helper layer", row.Name)
	}
	call := reviewCall(reviewBranch)
	call.Root = root
	spawn, _ := reviewResultOf(t, hooks(t, door, call))["spawn"].(map[string]any)
	if spawn["prompt"] != review.ReaderAsks(gathered, layer) {
		t.Errorf("the reader's prompt reads %v, and wants the reader's asks over the helper layer", spawn["prompt"])
	}
}
