package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// NOTHING READ A FINISHED SESSION AND SAID HOW IT WENT.
//
// The voice rules refuse a write in hook.go, so they catch prose on its way to
// a file and nothing else. What an agent says in the record went unread, and a
// session's worth of it is where the drift shows: one refused write is an
// accident, forty answers with the same break is a habit.
//
// The retro is the place, because it is the cycle boundary and it already has
// the retired sessions in its hands.
//
// WHOSE WORDS ARE JUDGED. The agent's, and only the agent's. The person's
// prompt is theirs to write however they like, and the engine's own messages
// are not prose anybody is asked to improve. Counting either would put the
// number beyond the reach of the one who could act on it, so this test writes
// breaks into all three and expects two of them ignored.

func TestTheRetroCountsTheVoiceBreaksTheAgentWrote(t *testing.T) {
	t.Parallel()
	r := aSessionWithVoiceBreaks(t)

	got, err := Retro(t.Context(), r, "main", nil)
	if err != nil {
		t.Fatalf("the retro did not run: %v", err)
	}

	// THE FOLDER CARRIES IT, which is the criterion: a person opening the retro
	// folder finds the findings without being told where to look.
	if got.Voice == "" {
		t.Fatal("the retro said nothing about where the voice findings went")
	}
	b, err := os.ReadFile(got.Voice)
	if err != nil {
		t.Fatalf("the retro folder carries no voice findings: %v", err)
	}
	var read VoiceReading
	if err := json.Unmarshal(b, &read); err != nil {
		t.Fatalf("the voice findings will not read: %v\n%s", err, b)
	}

	// Three of the five records are the agent's, and two of those break a rule.
	if read.Messages != 3 {
		t.Fatalf("read %d messages, wanted the agent's 3 and neither the person's nor the engine's\n%s",
			read.Messages, b)
	}
	if read.Breaches != 2 {
		t.Fatalf("counted %d breaks, wanted 2\n%s", read.Breaches, b)
	}

	want := map[string]int{"no semicolon": 1, "no contraction": 1}
	for _, tally := range read.ByRule {
		if tally.Count != want[tally.Rule] {
			t.Fatalf("%s was counted %d times, wanted %d\n%s", tally.Rule, tally.Count, want[tally.Rule], b)
		}
		delete(want, tally.Rule)
		// WHERE, and not only which and how many. A count with no place to look
		// is a number nobody can act on.
		if len(tally.Where) == 0 {
			t.Fatalf("%s says how many and not where\n%s", tally.Rule, b)
		}
		for _, w := range tally.Where {
			if !strings.Contains(w, "session-20260101-000000.jsonl") {
				t.Fatalf("%s points at %q, which names no session file\n%s", tally.Rule, w, b)
			}
		}
	}
	for rule := range want {
		t.Fatalf("%s broke a rule the retro did not report\n%s", rule, b)
	}
}

// A CHECKER THAT CANNOT RUN MUST NOT STOP THE RETRO. hook.go allows the write
// and says so loudly when the rules will not load, and a retro is a cycle
// boundary, so a missing rules file taking it down would be worse still. It
// says why it could not look rather than reporting nought breaks, because
// nought reads as a clean session.
func TestAMissingRulesFileDoesNotStopTheRetro(t *testing.T) {
	t.Parallel()
	r := aSessionWithVoiceBreaks(t)
	if err := os.Remove(filepath.Join(r.Method, "util", "voice-rules.json")); err != nil {
		t.Fatal(err)
	}

	got, err := Retro(t.Context(), r, "main", nil)
	if err != nil {
		t.Fatalf("a missing rules file took the retro down: %v", err)
	}
	b, err := os.ReadFile(got.Voice)
	if err != nil {
		t.Fatalf("the retro folder says nothing about the voice check: %v", err)
	}
	var read VoiceReading
	if err := json.Unmarshal(b, &read); err != nil {
		t.Fatalf("the voice findings will not read: %v\n%s", err, b)
	}
	if read.Unavailable == "" {
		t.Fatalf("the retro reported a clean session rather than saying it could not look\n%s", b)
	}
}
