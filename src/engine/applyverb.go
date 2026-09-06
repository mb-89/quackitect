package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"os"
	"quackitect/engine/internal/sessionlog"
)

// se apply - change files, naming the token the change belongs to.
//
// THE NAME IS ON THE WRITE AND NOT BEFORE IT. --on says which token this change
// is, every time, so there is no separate call to make and nothing to forget.
// Naming a different token from the one in hand puts the old one back and takes
// the new one up, which is what changing what you are working on means.
//
// AND --edits IS THE SAME MANIFEST WITH NO PIPE IN IT. A session whose tool lane
// never came up reaches this verb at a shell, where the Bash guard refuses a
// pipe and the Write tool is refused for naming no token. Both doors were shut
// on the same session at once, so it could read the tree and could not change
// one byte of it. --manifest reads a file, which helps a manifest too long for a
// command line, and --edits carries it inline, which is the form that works when
// there is no way to put the file there in the first place.
//
// AND --from READS IT OUT OF THE SCRATCHPAD, the one folder that session can put
// a file in: the harness's Write is let through under .se/scratchpad with
// nothing in hand, so a manifest goes there whole, quotes and all, and is
// named here. See payloadFrom. --manifest stays for a person at a terminal,
// whose file may sit anywhere.
func runApply(c *call) int {
	fs := flag.NewFlagSet("apply", flag.ContinueOnError)
	fs.SetOutput(c.err)
	fs.Usage = func() {
		fmt.Fprintln(c.err, "se apply - change files. Prints what it wrote as JSON.")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, `  echo '[{"file":"a.go","old":"x","new":"y"}]' | se apply --on wk-1234567890`)
		fmt.Fprintln(c.err, `  se apply --on wk-1234567890 --edits '[{"file":"a.go","old":"x","new":"y"}]'`)
		fmt.Fprintln(c.err, "  se apply --on wk-1234567890 --manifest edits.json")
		fmt.Fprintln(c.err, "  se apply --on wk-1234567890 --from .se/scratchpad/manifest.json")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  The manifest is a JSON array on standard input. Each entry is one edit:")
		fmt.Fprintln(c.err, `    {"file":"...","old":"...","new":"..."}   replace, and old must be there once`)
		fmt.Fprintln(c.err, `    {"file":"...","op":"create","new":"..."}  a file that is not there yet`)
		fmt.Fprintln(c.err, `    {"file":"...","op":"write","new":"..."}   replace a whole file`)
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  Every edit is checked before any is written. One bad edit writes nothing.")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  --edits and --manifest are the same call with no pipe in it, for a")
		fmt.Fprintln(c.err, "  session whose tool lane never came up and whose Bash guard refuses one.")
		fmt.Fprintln(c.err, "  --from reads the manifest whole from a file under .se/scratchpad, which")
		fmt.Fprintln(c.err, "  is the one folder that session may write into with nothing in hand.")
		fmt.Fprintln(c.err, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	on := fs.String("on", "", "the token this change belongs to, by id")
	by := fs.String("by", "", "who is writing")
	edits := fs.String("edits", "", "the manifest itself, when there is no pipe to send it down")
	manifest := fs.String("manifest", "", "a file holding the manifest, instead of standard input")
	from := fs.String("from", "", "a file under .se/scratchpad holding the manifest, read whole")
	dry := fs.Bool("dry", false, "check every edit and write nothing")
	undo := fs.Bool("undo", false, "instead of writing: put back what this token's last apply overwrote")
	if code, stop := c.parse(fs, "apply"); stop {
		return code
	}

	roots := c.roots
	// PUTTING BACK NAMES ITS TOKEN TOO, and it used to name none.
	//
	// The reasoning was that an undo is not a change to the work but a taking
	// back of one, so it could read the journal rather than be told. That holds
	// with one agent on a tree. With several it means the newest apply in the
	// folder is somebody else's most of the time, and this took one: an undo
	// called on one token put back a file belonging to another actor's, and the
	// newer content was gone. So the token is named here as it is on a write,
	// and an undo reaches only what that token wrote.
	if *undo {
		if *on == "" {
			c.answerJSON(map[string]any{"error": "say which token to undo, with --on <id>. " +
				"An undo puts back what that token wrote and never another's work"})
			return 1
		}
		done, err := Undo(roots, *on, orElse(*by, "main"))
		if err != nil {
			c.answerJSON(map[string]any{"error": err.Error(), "on": *on})
			return 1
		}
		c.answerJSON(map[string]any{"undone": done, "on": *on})
		return 0
	}
	// UNBOUND MEANS NO TOKEN ON A WRITE. See the same rule in runverb.go.
	if *on == "" && !Unleashed(c.roots) {
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

	// ONE MANIFEST, FROM WHICHEVER DOOR NAMED ONE. Naming two is a caller who
	// believes two different things about what is being written, and writing one
	// of them silently is how the other is lost.
	b, err := theManifest(c, *edits, *manifest, *from)
	if err != nil {
		c.answerJSON(map[string]any{"error": err.Error()})
		return 1
	}
	var list []Edit
	if err := json.Unmarshal(b, &list); err != nil {
		c.answerJSON(map[string]any{"error": "the manifest is not a JSON array of edits: " + err.Error()})
		return 1
	}

	got, err := Apply(roots, list, *dry, *on, orElse(*by, "main"))
	if err != nil {
		c.answerJSON(map[string]any{"error": err.Error(), "on": *on})
		return 1
	}
	got.On = *on
	// EVERY FILE THIS CHANGED IS SAID OUT LOUD, in the record, under the token
	// it was named against. That is the whole point of naming it.
	for _, path := range got.Files {
		inSession(roots, "call", orElse(*by, "main"), *on+" wrote "+path, sessionlog.Yes(),
			map[string]any{"id": *on, "path": path})
	}
	c.answerJSON(got)
	return 0
}

// theManifest answers the edits, from whichever of the four doors named them.
//
// STANDARD INPUT IS READ LAST AND ONLY WHEN NOTHING ELSE SAID ANYTHING. At a
// shell with no pipe in front of it, standard input is the terminal, and reading
// it there is a call that never returns.
func theManifest(c *call, edits, manifest, from string) ([]byte, error) {
	var named []string
	for _, door := range []struct{ flag, value string }{
		{"--edits", edits}, {"--manifest", manifest}, {"--from", from},
	} {
		if door.value != "" {
			named = append(named, door.flag)
		}
	}
	if len(named) > 1 {
		return nil, fmt.Errorf("%s are two manifests, so name one. "+
			"--edits carries the JSON itself, --manifest names a file holding it, and "+
			"--from names one under .se/scratchpad", joinAnd(named))
	}
	if edits != "" {
		return []byte(edits), nil
	}
	if from != "" {
		return payloadFrom(c.roots, from)
	}
	if manifest != "" {
		b, err := os.ReadFile(manifest)
		if err != nil {
			return nil, fmt.Errorf("the manifest will not read: %w", err)
		}
		return b, nil
	}
	b, err := io.ReadAll(c.in)
	if err != nil {
		return nil, fmt.Errorf("the manifest will not read: %w", err)
	}
	return b, nil
}
