package main

import "fmt"

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

func writeField(t *Token, field, to, by string) error {
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
	case "bucket":
		// ONLY A PERSON MAKES A GROUP. What an agent can say about where work
		// sits is the state, which the process owns and the pull moves. A name
		// nobody asked for is a grouping nobody meant, and it spreads: two
		// agents inventing two names for one idea is how a list stops being
		// readable.
		if by != "person" {
			return fmt.Errorf("a bucket is a person's own name for a group, and %s is not a person. "+
				"Say what you mean about where the work stands, and the process moves it", by)
		}
		t.Bucket = to
	case "kind", "id", "guidance":
		return fmt.Errorf("%s is the engine's, and it is not written by hand", field)
	case "process":
		return fmt.Errorf("a process is chosen at minting, and it decides the token's shape")
	case "status", "holder":
		return fmt.Errorf("%s is moved by a pull, not by a keystroke", field)
	case "depends_on", "successors":
		return fmt.Errorf("%s is a relation, and it is edited in the note", field)
	default:
		return fmt.Errorf("this program does not write %q", field)
	}
	return nil
}
