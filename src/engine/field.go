package main

import (
	"fmt"
	"strings"
)

// WRITING ONE FIELD, AND WHAT MAY NOT BE WRITTEN.
//
// A person edits a cell and the engine decides whether that is allowed. The
// editor asks rather than writing, because two places that decide disagree.
//
// WHAT THE ENGINE DECIDES IS NOT A PERSON'S TO TYPE. A status is moved by a
// pull, an id is minted, a list is a relation. Typing over one of those puts
// the note and the engine's reading of it out of step, and nothing would say so.
// A BUCKET IS A NAME A PERSON TYPED, and the agent does not invent one. What
// an agent can say about where work sits is the backlog, which is a status and
// shows as a group beside open. A name nobody asked for is a grouping nobody
// meant, and it spreads: two agents inventing two names for one idea is how a
// list stops being readable.
// The caller is named, so the rules that depend on who is asking can be
// applied. There is no version that does not name one: a caller that would not
// say who it was got "person" by default, and a default answer to who did this
// is the answer nothing can check.
func WriteFieldBy(t *Token, field, to, by string) error {
	return writeField(t, field, to, by)
}

// refusedByHand answers why a field is not the caller's to type over, and
// nothing when it is.
//
// ONE PLACE RULES ON AN EDIT. The editor carried a list of its own naming the
// same properties and the same reasons, so the refusal was decided twice, and a
// property renamed here left the editor offering an edit this refused. The pane
// answer now carries this ruling per column, and the editor draws it.
func refusedByHand(field, by string) string {
	if strings.HasPrefix(field, "file.") {
		return "renaming is a move, not an edit"
	}
	switch field {
	case "title", "detail", "proposed_action", "ready_when", "reason", "needs_human":
		return ""
	case "urgent":
		// ONLY A PERSON SAYS WHAT COMES FIRST. The queue hands an urgent token
		// out before everything else, so an agent that could set it would put
		// its own work at the front of every other agent's queue. What an agent
		// can say about what it found is a token, and a person reads it.
		if by != "person" {
			return fmt.Sprintf("urgent is a person saying what comes first, and %s is not a person. "+
				"Say what is wrong in a token, and a person decides where it goes", by)
		}
		return ""
	case "bucket":
		// ONLY A PERSON MAKES A GROUP. What an agent can say about where work
		// sits is the state, which the process owns and the pull moves. A name
		// nobody asked for is a grouping nobody meant, and it spreads: two
		// agents inventing two names for one idea is how a list stops being
		// readable.
		if by != "person" {
			return fmt.Sprintf("a bucket is a person's own name for a group, and %s is not a person. "+
				"Say what you mean about where the work stands, and the process moves it", by)
		}
		return ""
	case "kind", "id", "guidance", "began", "ended":
		return field + " is the engine's, and it is not written by hand"
	case "process":
		return "a process is chosen at minting, and it decides the token's shape"
	case "status":
		return field + " is moved by a pull, not by a keystroke"
	case "holder":
		// NOT A FIELD ANY MORE, and the refusal says so rather than repeating
		// the one above it. A caller reaching for this is working from a note
		// written before the hold moved into the engine, and telling them it
		// is moved by a pull would leave them looking for it on the page.
		return "a holder is not on the token. The engine keeps who holds what, " +
			"and se --doing answers it"
	case "depends_on", "successors", "parent":
		return field + " is a relation, and it is edited in the note"
	}
	return fmt.Sprintf("this program does not write %q", field)
}

func writeField(t *Token, field, to, by string) error {
	if why := refusedByHand(field, by); why != "" {
		return fmt.Errorf("%s", why)
	}
	switch field {
	case "title":
		if err := checkTitle(to); err != nil {
			return err
		}
		t.Title = to
	case "detail":
		t.Detail = to
	case "proposed_action":
		t.ProposedAction = to
	case "ready_when":
		t.ReadyWhen = to
	case "reason":
		t.Reason = to
	case "needs_human":
		t.NeedsHuman = to == "true"
	case "urgent":
		t.Urgent = to == "true"
	case "bucket":
		t.Bucket = to
	}
	return nil
}
