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
func WriteField(t *Token, field, to string) error {
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
		t.Bucket = to
	case "reason":
		t.Reason = to
	case "scope":
		s := Scope(to)
		if !s.Known() {
			return fmt.Errorf("a scope is %s, %s or %s", MultiStep, SingleStep, InToken)
		}
		t.Scope = s
	case "id", "seq", "type", "minted_by":
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
