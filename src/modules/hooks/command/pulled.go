// A revert or a reset over a pull commit. The take-back
// verb restores a ticket's step, state and evidence in one move, so the shell
// undo refuses.
// [[spec/tickets/cage-command-rules-port]]
package command

import (
	"regexp"
	"strings"
)

// The folders a ticket stands in, the flags taking a value, and the leaf a subject names where it names none. [[spec/design_output/bash#a-pull-commit-stands]]
const (
	publicTickets  = "spec/tickets"
	privateTickets = ".se/tickets"
	noteEnd        = ".md"
	noLeaf         = "<leaf>"
)

// [[spec/design_output/bash#a-pull-commit-stands]]
var (
	undoValued = setOf("-m", "--mainline", "-X", "--strategy-option", "--strategy", "--pathspec-from-file")
	opens      = regexp.MustCompile(`^([a-z0-9][a-z0-9-]*):\s`)
	leaves     = []*regexp.Regexp{
		regexp.MustCompile(`\s(\S+) fails back to `),
		regexp.MustCompile(`\stakes (\S+) back\b`),
		regexp.MustCompile(`\s(?:passes|fails) ([^\s,]+)`),
	}
)

// One undo a command makes: its verb, the revisions it reads, and whether it walks a range. [[spec/design_output/bash#a-pull-commit-stands]]
type Undo struct {
	Verb  string
	Revs  []string
	Walks bool
}

// Each undo a command makes: a revert reads its revisions alone, and a reset the range it drops. [[spec/design_output/bash#a-pull-commit-stands]]
func undoesIn(command string) []Undo {
	var out []Undo
	segments, _ := partsOf(command)
	for _, one := range segments {
		words := wordsIn(one)
		if BaseName(first(words)) != "git" {
			continue
		}
		rest := afterGit(words)
		if len(rest) == 0 {
			continue
		}
		switch rest[0] {
		case "revert":
			if revs := revisionsIn(rest[1:]); len(revs) > 0 {
				out = append(out, Undo{Verb: "git revert", Revs: revs})
			}
		case "reset":
			if rev := resetTo(rest[1:]); rev != "" {
				out = append(out, Undo{Verb: "git reset", Revs: []string{rev + "..HEAD"}, Walks: true})
			}
		}
	}
	return out
}

// A finding for each undo taking back a pull commit of a ticket that stands. [[spec/design_output/bash#a-pull-commit-stands]]
func pullCommitsIn(command string, it It) []Row {
	if it.Subjects == nil {
		return nil
	}
	var out []Row
	for _, undo := range undoesIn(command) {
		for _, subject := range it.Subjects(undo) {
			found := opens.FindStringSubmatch(subject)
			if found == nil || !ticketStands(found[1], it.Script) {
				continue
			}
			back := "./RUNME.sh ticket pull " + found[1] + " --back " + leafOf(subject)
			out = append(out, row(PullCommitStand, subject,
				undo.Verb+` takes back the pull commit "`+subject+`", and a shell undo`,
				"leaves the record and the evidence behind it. The take-back verb restores",
				"the step, the state and the evidence in one move: run "+back+"."))
			break
		}
	}
	return out
}

// [[spec/design_output/bash#a-pull-commit-stands]]
func revisionsIn(args []string) []string {
	var out []string
	for i := 0; i < len(args); i++ {
		if undoValued[args[i]] {
			i++
		} else if !strings.HasPrefix(args[i], "-") {
			out = append(out, args[i])
		}
	}
	return out
}

// A reset moves HEAD over one revision alone, so a path after it or after -- drops nothing. [[spec/design_output/bash#a-pull-commit-stands]]
func resetTo(args []string) string {
	at := -1
	for i, one := range args {
		if one == "--" {
			at = i
			break
		}
	}
	if at >= 0 && at < len(args)-1 {
		return ""
	}
	if at >= 0 {
		args = args[:at]
	}
	if bare := revisionsIn(args); len(bare) == 1 {
		return bare[0]
	}
	return ""
}

// [[spec/design_output/bash#a-pull-commit-stands]]
func ticketStands(name string, read func(path string) string) bool {
	if read == nil {
		return false
	}
	for _, folder := range []string{publicTickets, privateTickets} {
		if read(folder+"/"+name+noteEnd) != "" {
			return true
		}
	}
	return false
}

// [[spec/design_output/bash#a-pull-commit-stands]]
func leafOf(subject string) string {
	for _, form := range leaves {
		if found := form.FindStringSubmatch(subject); found != nil {
			return found[1]
		}
	}
	return noLeaf
}
