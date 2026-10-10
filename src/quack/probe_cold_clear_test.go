// The cold probe's clear check over recorded rows and streams.
// [[spec/tickets/the-clear-runs-live-remote]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"slices"
	"strings"
	"testing"

	"quackitect/src/modules/hooks"
)

func streamUser(content any) string {
	return streamLine(map[string]any{"type": "user", "parent_tool_use_id": nil, "message": map[string]any{"content": content}})
}

func streamResult(text string) string {
	return streamUser([]any{map[string]any{"type": "tool_result", "content": []any{map[string]any{"type": "text", "text": text}}}})
}

// The stream a live clear leaves: the handover, the clear, the resume prompt, and the read past it. [[spec/tickets/the-clear-runs-live-remote]]
func clearStream() string {
	return stream(streamResult("handover stands in your hand."), streamResult(clearHanded), streamUser(hooks.ResumePrompt), streamResult(dryReadHeld))
}

const clearHanded = handoverClosed + "\n" + clearHeldLine

func TestAStreamReadsTheResultsAndPromptsTheSessionReads(t *testing.T) {
	t.Parallel()
	steps := stepsOf(stream(streamUser("carry on"), streamResult("one"), streamUser([]any{map[string]any{"type": "tool_result", "content": "two"}}),
		streamLine(map[string]any{"type": "user", "parent_tool_use_id": "toolu_1", "message": map[string]any{"content": "a helper's own"}})))
	if !slices.Equal(steps.prompts, []string{"carry on"}) || !slices.Equal(steps.results, []string{"one", "two"}) {
		t.Errorf("the steps read %+v", steps)
	}
}

func TestTheClearCheckReadsEveryRoad(t *testing.T) {
	t.Parallel()
	refused := probeRowOf("warn", "bridge", clearRefused, map[string]any{"detail": "command.run: called from a classic.Stop hook"})
	resumes := probeRowOf("info", promptRowKind, "Level zero cleared the conversation", map[string]any{"text": hooks.ResumePrompt})
	cases := []struct {
		name         string
		rows         []probeRow
		stream, word string
		evidence     string
	}{
		{"a live clear", nil, clearStream(), "PASS", "opens on the resume prompt and pulls read-handover"},
		{"the resume prompt in the log alone", []probeRow{resumes}, stream(streamResult(clearHanded), streamResult(dryReadHeld)), "PASS", "pulls read-handover"},
		{"a host refusing the clear", []probeRow{refused}, stream(streamResult(clearHanded)), "WARN", "refuses the clear: command.run"},
		{"no handover closed", []probeRow{refused}, stream(streamResult("handover stays in hand")), "FAIL", "no pull closes the handover and hands the clear: handover stays in hand"},
		{"no resume prompt", nil, stream(streamResult(clearHanded), streamResult(dryReadHeld)), "FAIL", "no conversation opens on the resume prompt"},
		{"a read before the clear alone", []probeRow{resumes}, stream(streamResult(dryReadHeld), streamResult(clearHanded)), "FAIL", "no pull hands read-handover"},
	}
	for _, one := range cases {
		line := coldLines([]coldCheck{clearHolds(clearSeen{rows: one.rows, steps: stepsOf(one.stream)})})[0]
		if !strings.HasPrefix(line, one.word+" clear: ") || !strings.Contains(line, one.evidence) {
			t.Errorf("%s reads %q", one.name, line)
		}
	}
}
