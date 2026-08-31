package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestTheFloorCannotBeLowered(t *testing.T) {
	r := guidanceTree(t)
	os.MkdirAll(filepath.Join(r.Work, ".se"), 0o755)
	// A project that tries to turn a guard off and to make a budget bigger.
	os.WriteFile(filepath.Join(r.Work, ".se", "parameters.json"),
		[]byte(`{"guards.guard_projections":false,"guards.stop_needs_claim":false,"limits.ready_budget_ms":99000}`), 0o644)

	c := LoadConfig(r)
	if !c.GuardProjections {
		t.Fatal("a guard that is on was turned off by a file, and a floor a file can lower is not a floor")
	}
	if c.ReadyBudgetMs != TheFloor().ReadyBudgetMs {
		t.Fatalf("a budget was widened by a file: %d", c.ReadyBudgetMs)
	}

	// A guard the method declares on cannot be turned off by the project.
	if !c.StopNeedsClaim {
		t.Fatal("a guard that is on was turned off by a file")
	}
}

func TestALaterLayerMayNarrow(t *testing.T) {
	r := guidanceTree(t)
	os.MkdirAll(filepath.Join(r.Work, ".se"), 0o755)
	os.WriteFile(filepath.Join(r.Work, ".se", "parameters.json"),
		[]byte(`{"limits.ready_budget_ms":8000,"limits.heartbeat_seconds":2}`), 0o644)

	c := LoadConfig(r)
	if c.ReadyBudgetMs != 8000 || c.HeartbeatSeconds != 2 {
		t.Fatalf("narrowing was refused: %+v", c)
	}
	// And a person can ask where a value came from.
	if c.From["limits.ready_budget_ms"] != "the project" {
		t.Fatalf("the source of a value is not recorded: %v", c.From)
	}
}

func TestAnUnreadableConfigIsSkipped(t *testing.T) {
	r := guidanceTree(t)
	os.MkdirAll(filepath.Join(r.Work, ".se"), 0o755)
	os.WriteFile(filepath.Join(r.Work, ".se", "parameters.json"), []byte("{not json"), 0o644)
	c := LoadConfig(r)
	if !c.GuardProjections {
		t.Fatal("one bad file stopped the machine from working")
	}
}

// Emergency mode ends on its own, so it cannot be left on and forgotten.
func TestEmergencyModeExpires(t *testing.T) {
	r := guidanceTree(t)
	if _, err := ArmEmergency(r, "someone", "repairing the projector", 30); err != nil {
		t.Fatal(err)
	}
	if !LoadEmergency(r).Armed {
		t.Fatal("arming did not take")
	}
	// Write one that is already over.
	e := Emergency{Armed: true, By: "someone", At: time.Now().Add(-time.Hour), Until: time.Now().Add(-time.Minute)}
	b, _ := json.MarshalIndent(e, "", "  ")
	os.WriteFile(emergencyPath(r), b, 0o644)
	if LoadEmergency(r).Armed {
		t.Fatal("an expired arming is still in force")
	}
	// And it says who and why while it is on.
	ArmEmergency(r, "someone", "repairing the projector", 30)
	if got := LoadEmergency(r); got.By != "someone" || got.Reason == "" {
		t.Fatalf("the record of who armed it is incomplete: %+v", got)
	}
	if err := DisarmEmergency(r); err != nil {
		t.Fatal(err)
	}
	if LoadEmergency(r).Armed {
		t.Fatal("disarming did not take")
	}
}

// The panel is a subtree of the same tree. A group marked shown is a section.
func TestTheShownGroupsAreTheSections(t *testing.T) {
	r := guidanceTree(t)
	root, err := LoadTree(r.Method)
	if err != nil {
		t.Fatal(err)
	}
	shown := 0
	Walk(root, "", func(path string, n Node) {
		if n.Type == "group" && n.Shown {
			shown++
		}
	})
	if shown == 0 {
		t.Fatal("no group is shown, so the panel would be empty")
	}
}

// The engine validates, and it says why when it refuses.
func TestSettingAValueIsValidatedByTheEngine(t *testing.T) {
	r := guidanceTree(t)
	if _, err := SetValue(r, "limits.heartbeat_seconds", 2); err != nil {
		t.Fatalf("a narrowing change was refused: %v", err)
	}
	if got := LoadConfig(r).HeartbeatSeconds; got != 2 {
		t.Fatalf("the change did not take: %d", got)
	}
	if _, err := SetValue(r, "limits.heartbeat_seconds", 30); err == nil {
		t.Fatal("a widening change was allowed")
	}
	if _, err := SetValue(r, "guards.guard_projections", false); err == nil {
		t.Fatal("a guard was turned off")
	}
	if _, err := SetValue(r, "no.such.parameter", 1); err == nil {
		t.Fatal("an unknown parameter was accepted")
	}
}
