package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
)

// se apply - change files, naming the token the change belongs to.
//
// THE NAME IS ON THE WRITE AND NOT BEFORE IT. --on says which token this change
// is, every time, so there is no separate call to make and nothing to forget.
// Naming a different token from the one in hand puts the old one back and takes
// the new one up, which is what changing what you are working on means.
func runApply(c *call) int {
	fs := flag.NewFlagSet("apply", flag.ContinueOnError)
	fs.SetOutput(c.out)
	fs.Usage = func() {
		fmt.Fprintln(c.out, "se apply - change files. Prints what it wrote as JSON.")
		fmt.Fprintln(c.out, "")
		fmt.Fprintln(c.out, `  echo '[{"file":"a.go","old":"x","new":"y"}]' | se apply --on wk-1234567890`)
		fmt.Fprintln(c.out, "")
		fmt.Fprintln(c.out, "  The manifest is a JSON array on standard input. Each entry is one edit:")
		fmt.Fprintln(c.out, `    {"file":"...","old":"...","new":"..."}   replace, and old must be there once`)
		fmt.Fprintln(c.out, `    {"file":"...","op":"create","new":"..."}  a file that is not there yet`)
		fmt.Fprintln(c.out, `    {"file":"...","op":"write","new":"..."}   replace a whole file`)
		fmt.Fprintln(c.out, "")
		fmt.Fprintln(c.out, "  Every edit is checked before any is written. One bad edit writes nothing.")
		fmt.Fprintln(c.out, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	on := fs.String("on", "", "the token this change belongs to, by id")
	by := fs.String("by", "", "who is writing")
	dry := fs.Bool("dry", false, "check every edit and write nothing")
	undo := fs.Bool("undo", false, "instead of writing: put back what the last apply overwrote")
	if code, stop := c.parse(fs, "apply"); stop {
		return code
	}

	roots := c.roots
	// PUTTING BACK WHAT THE LAST APPLY DID NAMES NO TOKEN. It is not a change
	// to the work, it is taking one back, and it reads the journal for what to
	// do rather than being told.
	if *undo {
		done, err := Undo(roots)
		if err != nil {
			c.answerJSON(map[string]any{"error": err.Error()})
			return 1
		}
		c.answerJSON(map[string]any{"undone": done})
		return 0
	}
	if *on == "" {
		c.answerJSON(map[string]any{"error": "say which token this change is, with --on <id>. " +
			"Every write names its work, so there is nothing to remember and nothing to arm"})
		return 1
	}

	// TAKING IT UP IS WHAT NAMING IT MEANS. Whatever this actor held goes back
	// on its own, so changing what you are working on is one word on one write.
	if _, err := TakeUp(roots, *on, orElse(*by, "main")); err != nil {
		c.answerJSON(map[string]any{"error": err.Error()})
		return 1
	}

	b, err := io.ReadAll(c.in)
	if err != nil {
		c.answerJSON(map[string]any{"error": "the manifest will not read: " + err.Error()})
		return 1
	}
	var edits []Edit
	if err := json.Unmarshal(b, &edits); err != nil {
		c.answerJSON(map[string]any{"error": "the manifest is not a JSON array of edits: " + err.Error()})
		return 1
	}

	got, err := Apply(roots, edits, *dry)
	if err != nil {
		c.answerJSON(map[string]any{"error": err.Error(), "on": *on})
		return 1
	}
	got.On = *on
	// EVERY FILE THIS CHANGED IS SAID OUT LOUD, in the record, under the token
	// it was named against. That is the whole point of naming it.
	for _, path := range got.Files {
		inSession(roots, "call", orElse(*by, "main"), *on+" wrote "+path, Yes(),
			map[string]any{"id": *on, "path": path})
	}
	c.answerJSON(got)
	return 0
}
