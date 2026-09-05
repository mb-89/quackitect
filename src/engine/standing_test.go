package main

import (
	"strings"
	"testing"
)

// GUIDANCE THE PROMPT ALREADY CARRIES IS NEVER SENT.
//
// MEASURED. Every pull carried the whole Actionables chapter of work-token.md,
// 1,201 bytes, and all fourteen of its rules were already in the system prompt
// the same agent was reading from. A quarter of the pull answer, on every pull,
// saying what the agent was told before it started.
func TestGuidanceInThePromptIsNotSentAgain(t *testing.T) {
	t.Parallel()
	r := aTreeWithGuidance(t)

	text, says := TheGuidanceFor(r, "main", "standing")
	if text != "" {
		t.Errorf("it sent %d bytes of guidance the prompt already carries", len(text))
	}
	if !strings.Contains(says, "doc/guidance/standing.md") {
		t.Errorf("it does not say where the rules are: %q", says)
	}
	// AND IT SAYS SO EVERY TIME, because an agent that has lost them has to
	// know what to open.
	if _, again := TheGuidanceFor(r, "main", "standing"); again != says {
		t.Error("the second pull says something different about the same file")
	}
}

// GUIDANCE THE PROMPT DOES NOT CARRY IS SENT ONCE, AND NAMED AFTER THAT.
func TestGuidanceOutsideThePromptIsSentOnce(t *testing.T) {
	t.Parallel()
	r := aTreeWithGuidance(t)

	text, says := TheGuidanceFor(r, "main", "software-development/lane")
	if !strings.Contains(text, "A rule only this lane has") {
		t.Fatalf("the first pull did not send the rules: %q", text)
	}
	if !strings.Contains(says, "doc/guidance/software-development/lane.md") {
		t.Errorf("it does not name the file: %q", says)
	}

	// The second time it is named and not sent.
	again, saysAgain := TheGuidanceFor(r, "main", "software-development/lane")
	if again != "" {
		t.Errorf("it sent the same rules twice: %d bytes", len(again))
	}
	if !strings.Contains(saysAgain, "read this session") {
		t.Errorf("it does not say why it was not sent: %q", saysAgain)
	}

	// ANOTHER ACTOR HAS NOT READ IT. They are separate contexts, and what one
	// holds the other never saw.
	other, _ := TheGuidanceFor(r, "reviewer-2", "software-development/lane")
	if other == "" {
		t.Error("a second actor was told it had already read what it never saw")
	}

	// AND A COMPACTION FORGETS IT, because a compacted agent no longer holds
	// what it read.
	ForgetReads(r, "compaction")
	after, _ := TheGuidanceFor(r, "main", "software-development/lane")
	if after == "" {
		t.Error("after a compaction the rules were still withheld")
	}
}
