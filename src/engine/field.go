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
func WriteField(t *Token, field, to string) error {
	return writeField(t, field, to, "person")
}

// WriteFieldBy is the same with the caller named, so the rules that depend on
// who is asking can be applied.
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
	case "guidance":
		t.Guidance = to
	case "assignee":
		if to == "" {
			return fmt.Errorf("a token needs an assignee: every token is somebody's")
		}
		t.Assignee = to
	case "bucket":
		if by != "person" && to != "" {
			return fmt.Errorf("a bucket is a name a person typed. " +
				"What you can say is that it is backlogged, which is a status")
		}
		t.Bucket = to
	case "reason":
		t.Reason = to
	case "scope":
		s := Scope(to)
		if !s.Known() {
			return fmt.Errorf("a scope is %s, %s or %s", MultiStep, SingleStep, InToken)
		}
		t.Scope = s
	case "id", "seq", "type", "minted_by", "submitted_by":
		return fmt.Errorf("%s is the engine's, and it is not written by hand", field)
	case "status", "holder":
		return fmt.Errorf("%s is moved by a pull, not by a keystroke", field)
	case "subs", "depends_on", "successors":
		return fmt.Errorf("%s is a relation, and it is edited in the note", field)
	case "traced":
		return fmt.Errorf("traced is decided at minting, and it decides where the note lives")
	default:
		return fmt.Errorf("this program does not write %q", field)
	}
	return nil
}
