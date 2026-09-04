package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"quackitect/engine/internal/voice"
)

// THE WRITE DOOR IS HELD TO THE VOICE RULES, THE WAY THE HARNESS'S IS.
//
// The check lives in the guard hook, which fires on Write and Edit. Those are
// refused, because the method sends every write through se_apply. So the rules
// were enforced on the door nobody uses and not on the one everybody uses, and
// prose that the guard would have refused went into a report through here and
// was taken. It was found by writing one sentence twice, once through each
// door, and getting two different answers.
func TestAnApplyIsHeldToTheVoiceRules(t *testing.T) {
	t.Parallel()
	r := aTreeToWriteIn(t)
	// THE TREE'S OWN RULES, so this holds the door to what the product ships
	// rather than to a fixture that agrees with it by construction.
	raw, err := os.ReadFile(filepath.Join("..", "..", "util", "voice-rules.json"))
	if err != nil {
		t.Fatalf("the tree's voice rules will not read: %v", err)
	}
	if err := writeAtomic(filepath.Join(r.Method, "util", "voice-rules.json"), raw, 0o644); err != nil {
		t.Fatal(err)
	}
	rules, err := voice.Load(r.Method)
	if err != nil {
		t.Fatalf("the voice rules will not read: %v", err)
	}
	// A sentence the rules can see, taken from the rules themselves so this
	// test cannot disagree with them about what a breach is.
	bad := aBreachTheRulesSee(t, rules)

	name := "doc/prose.md"
	if _, err := Apply(r, []Edit{{File: name, Op: "create", New: bad}}, false, "", "tester"); err == nil {
		t.Fatal("prose the voice check refuses at the harness door was taken at the engine's")
	} else if !strings.Contains(err.Error(), "voice check") {
		t.Fatalf("it was refused for something else: %v", err)
	}
	if _, err := os.Stat(filepath.Join(r.Work, filepath.FromSlash(name))); err == nil {
		t.Fatal("a refused apply wrote the file anyway")
	}

	// AND PROSE THAT READS GOES THROUGH. This refuses a form, never a place.
	if _, err := Apply(r, []Edit{{File: name, Op: "create", New: "The engine reads the tree.\n"}},
		false, "", "tester"); err != nil {
		t.Fatalf("prose the rules do not object to was refused: %v", err)
	}

	// AND A FILE THAT IS NOT PROSE IS NOT THIS RULE'S BUSINESS.
	if _, err := Apply(r, []Edit{{File: "src/engine/x.go", Op: "create", New: bad}},
		false, "", "tester"); err != nil {
		t.Fatalf("a program was held to the prose rules: %v", err)
	}
}

// aBreachTheRulesSee answers a line this tree's own rules object to, so the
// test asks the rules rather than assuming which words they carry.
func aBreachTheRulesSee(t *testing.T, rules voice.Rules) string {
	t.Helper()
	for _, try := range []string{
		"It doesn't matter; the engine e.g. reads it.\n",
		"This is utilized in order to leverage the tree.\n",
		"We can't do that, i.e. the engine won't.\n",
	} {
		if len(rules.Check(try)) > 0 {
			return try
		}
	}
	t.Fatal("none of the sentences this test knows breaks a rule in this tree, " +
		"so this test cannot show the door refusing anything")
	return ""
}
