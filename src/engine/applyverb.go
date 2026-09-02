package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"os"
)

// se apply - change files, naming the token the change belongs to.
//
// THE NAME IS ON THE WRITE AND NOT BEFORE IT. --on says which token this change
// is, every time, so there is no separate call to make and nothing to forget.
// Naming a different token from the one in hand puts the old one back and takes
// the new one up, which is what changing what you are working on means.
func runApply(args []string) {
	fs := flag.NewFlagSet("apply", flag.ExitOnError)
	fs.SetOutput(os.Stdout)
	fs.Usage = func() {
		fmt.Fprintln(os.Stdout, "se apply - change files. Prints what it wrote as JSON.")
		fmt.Fprintln(os.Stdout, "")
		fmt.Fprintln(os.Stdout, `  echo '[{"file":"a.go","old":"x","new":"y"}]' | se apply --on wk-1234567890`)
		fmt.Fprintln(os.Stdout, "")
		fmt.Fprintln(os.Stdout, "  The manifest is a JSON array on standard input. Each entry is one edit:")
		fmt.Fprintln(os.Stdout, `    {"file":"...","old":"...","new":"..."}   replace, and old must be there once`)
		fmt.Fprintln(os.Stdout, `    {"file":"...","op":"create","new":"..."}  a file that is not there yet`)
		fmt.Fprintln(os.Stdout, `    {"file":"...","op":"write","new":"..."}   replace a whole file`)
		fmt.Fprintln(os.Stdout, "")
		fmt.Fprintln(os.Stdout, "  Every edit is checked before any is written. One bad edit writes nothing.")
		fmt.Fprintln(os.Stdout, "")
		fs.PrintDefaults()
	}
	work := fs.String("work", "", "the folder being worked on (default: this one)")
	on := fs.String("on", "", "the token this change belongs to, by id")
	by := fs.String("by", "", "who is writing")
	dry := fs.Bool("dry", false, "check every edit and write nothing")
	undo := fs.Bool("undo", false, "instead of writing: put back what the last apply overwrote")
	parse(fs, "apply", args)

	roots, err := FindRoots(*work)
	if err != nil {
		fail(err)
	}
	// PUTTING BACK WHAT THE LAST APPLY DID NAMES NO TOKEN. It is not a change
	// to the work, it is taking one back, and it reads the journal for what to
	// do rather than being told.
	if *undo {
		done, err := Undo(roots)
		if err != nil {
			answerJSON(map[string]any{"error": err.Error()})
			os.Exit(1)
		}
		answerJSON(map[string]any{"undone": done})
		return
	}
	if *on == "" {
		answerJSON(map[string]any{"error": "say which token this change is, with --on <id>. " +
			"Every write names its work, so there is nothing to remember and nothing to arm"})
		os.Exit(1)
	}

	// TAKING IT UP IS WHAT NAMING IT MEANS. Whatever this actor held goes back
	// on its own, so changing what you are working on is one word on one write.
	if _, err := TakeUp(roots, *on, orElse(*by, "main")); err != nil {
		answerJSON(map[string]any{"error": err.Error()})
		os.Exit(1)
	}

	b, err := io.ReadAll(os.Stdin)
	if err != nil {
		answerJSON(map[string]any{"error": "the manifest will not read: " + err.Error()})
		os.Exit(1)
	}
	var edits []Edit
	if err := json.Unmarshal(b, &edits); err != nil {
		answerJSON(map[string]any{"error": "the manifest is not a JSON array of edits: " + err.Error()})
		os.Exit(1)
	}

	got, err := Apply(roots, edits, *dry)
	if err != nil {
		answerJSON(map[string]any{"error": err.Error(), "on": *on})
		os.Exit(1)
	}
	got.On = *on
	// EVERY FILE THIS CHANGED IS SAID OUT LOUD, in the record, under the token
	// it was named against. That is the whole point of naming it.
	for _, path := range got.Files {
		inSession(roots, "call", orElse(*by, "main"), *on+" wrote "+path, Yes(),
			map[string]any{"id": *on, "path": path})
	}
	answerJSON(got)
}
