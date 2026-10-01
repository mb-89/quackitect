// The edit door's rules past the schema and the voice, against the bridge's texts.
// [[spec/tickets/edit-door-rules-port]]
package write

import (
	"strings"
	"testing"
)

// An open ticket and a closed one, each with an Ask and a Discussion. [[spec/tickets/edit-door-rules-port]]
const (
	openTicket   = "---\nkind: [[ticket]]\nstate: open\nstep: do\n---\n\n# Ask\n\nA thing.\n\n# Discussion\n"
	closedTicket = "---\nkind: [[ticket]]\nstate: closed\nstep: done\n---\n\n# Ask\n\nA thing.\n"
)

// [[spec/tickets/edit-door-rules-port]]
func TestAnOpenTicketTakesItsDiscussionAlone(t *testing.T) {
	where := "spec/tickets/a.md"
	if got := OpenTicketRefusal(where, openTicket, openTicket+"\nA word.\n"); got != "" {
		t.Errorf("a line under Discussion meets %q", got)
	}
	if got := OpenTicketRefusal(where, openTicket, strings.Replace(openTicket, "A thing.", "Another.", 1)); !strings.HasPrefix(got, where+" stands open, and the engine writes it.") {
		t.Errorf("a change to the Ask meets %q", got)
	}
	if got := OpenTicketRefusal(where, closedTicket, strings.Replace(closedTicket, "A thing.", "Another.", 1)); got != "" {
		t.Errorf("a closed ticket meets %q", got)
	}
}

// [[spec/tickets/edit-door-rules-port]]
func TestTheEngineFieldsComeBackAndTheRestLands(t *testing.T) {
	now := strings.Replace(strings.Replace(closedTicket, "state: closed", "state: open", 1), "A thing.", "Another.", 1)
	got, keys := RestoredFields(closedTicket, now, []string{"state", "step"})
	if want := strings.Replace(closedTicket, "A thing.", "Another.", 1); got != want || strings.Join(keys, ",") != "state" {
		t.Errorf("the fields come back as %q over %v, and want %q over state", got, keys, want)
	}
	dropped := strings.Replace(closedTicket, "step: done\n", "", 1)
	if got, keys := RestoredFields(closedTicket, dropped, []string{"step"}); got != closedTicket || len(keys) != 1 {
		t.Errorf("a dropped field comes back as %q over %v", got, keys)
	}
	if got, keys := RestoredFields("# Plain\n", "# Other\n", []string{"state"}); got != "# Other\n" || keys != nil {
		t.Errorf("a note past the tickets reads %q over %v", got, keys)
	}
}

// [[spec/tickets/edit-door-rules-port]]
func TestAProjectionOwnsTheFilesItNames(t *testing.T) {
	entries := []Projection{
		{Name: "the commands", Target: ".claude/commands", Writes: []string{"se-*.md"}, From: "spec/config/level0.json"},
		{Name: "the style", Target: ".claude/output-styles", From: "spec/guidance"},
	}
	if owner, ok := OwnerOf(entries, ".claude/commands/se-one.md"); !ok || owner.Name != "the commands" {
		t.Errorf("a named command reads owned by %+v, %v", owner, ok)
	}
	if _, ok := OwnerOf(entries, ".claude/commands/mine.md"); ok {
		t.Errorf("a command no glob names reads owned")
	}
	owner, ok := OwnerOf(entries, ".claude/output-styles/level0.md")
	if !ok || !strings.HasPrefix(RefusedWrite(owner, ".claude/output-styles/level0.md"), ".claude/output-styles/level0.md is projected, so nothing may write it by hand.") {
		t.Errorf("the style reads owned by %+v, %v", owner, ok)
	}
}

// [[spec/tickets/edit-door-rules-port]]
func TestTheDoorsWordsReadTheBridgesText(t *testing.T) {
	if got := BlessRefusal(); got != ".se/.runtime/bless.json is the owner's word on who blesses, and the sidebar button alone writes it. An agent reads and writes it nowhere." {
		t.Errorf("the bless refusal reads %q", got)
	}
	if got := MarkedRefusal("spec/tickets/a.md", []int{3, 5}); !strings.HasPrefix(got, "spec/tickets/a.md still carries conflict markers, at line(s) 3, 5.") {
		t.Errorf("the marker refusal reads %q", got)
	}
}
