package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// THE LINT. Every rule a token has to keep, run over the tokens that exist.
//
// The mint checks the same rules, and that is not enough on its own. A note is
// a markdown file a person edits by hand, and a rule added after the work was
// minted has to reach the work. So the check has two homes and one
// implementation.

type Finding3 struct {
	ID    string `json:"id"`
	Title string `json:"title"`
	Says  string `json:"says"`
}

// LintTokens names what breaks a rule. An empty answer is a clean ledger.
func LintTokens(r Roots) []Finding3 {
	var out []Finding3
	for _, t := range Tokens(r) {
		if err := checkTitle(t.Title); err != nil {
			out = append(out, Finding3{ID: t.ID, Title: t.Title, Says: err.Error()})
		}
		for _, dir := range workDirs(r) {
			b, err := os.ReadFile(filepath.Join(dir, t.ID+".md"))
			if err != nil {
				continue
			}
			for _, line := range timesIn(string(b)) {
				out = append(out, Finding3{ID: t.ID, Title: t.Title,
					Says: "a token carries no time, and this one carries " + line})
			}
		}
	}
	return out
}

func runLint(args []string) {
	fs := flag.NewFlagSet("lint", flag.ExitOnError)
	fs.SetOutput(os.Stdout)
	fs.Usage = func() {
		fmt.Fprintln(os.Stdout, "se lint - read every work token and name what breaks a rule.")
		fmt.Fprintln(os.Stdout, "")
		fmt.Fprintln(os.Stdout, "  se lint          say what is wrong, and exit non-zero if anything is")
		fmt.Fprintln(os.Stdout, "")
		fs.PrintDefaults()
	}
	work := fs.String("work", "", "the folder being worked on (default: this one)")
	_ = fs.Parse(args)

	roots, err := FindRoots(*work)
	if err != nil {
		fail(err)
	}
	found := LintTokens(roots)
	answerJSON(map[string]any{"findings": found, "clean": len(found) == 0})
	if len(found) > 0 {
		os.Exit(1)
	}
}

// A TOKEN CARRIES NO TIME. It travels, and a time on it says when somebody was
// at their desk. The record holds every moment instead, and the record never
// travels.
//
// A note is edited by hand and a rule added after the work was minted has to
// reach the work, so this reads what is on disk rather than what this program
// would have written.
func timesIn(text string) []string {
	var found []string
	for _, line := range strings.Split(text, "\n") {
		l := strings.TrimSpace(line)
		for _, key := range []string{"opened:", "taken_at:", "sent_at:", "closed_at:", "**at:**", "at:"} {
			if strings.HasPrefix(l, key) {
				found = append(found, l)
			}
		}
	}
	return found
}
