package main

import (
	"fmt"
	"strings"
)

// A DONE-WHEN LINE NAMES A COMMAND THE HAND DECIDING IT MAY RUN.
//
// A criterion said "Decided by: go test -C src/engine -run ... -count=1 ./".
// Run in an agent lane that command is refused outright, because the engine owns
// the tests, so the one hand that has to decide the sentence may not run the
// command written under it. What happened next was a reviewer translating the
// command by hand, and a verdict recording a run under a heading naming a call
// the lane never made.
//
// THE GATE DECIDES WHAT A CRITERION MAY NAME, AND THE GATE IS WHAT ANSWERS HERE.
// This asks the write gate's own refusals about the command the line names:
// ATestRunByHand, ASearchOverTheTree, ARecursiveSearch, ABuildRunByHand and
// ABuildThatDropsAProgram. Each of them splits the command on the shell's
// separators itself, so a search or a build behind a pipe is judged the way the
// gate judges it, and there is one rule rather than two.
//
// A SECOND COPY OF THE RULE DRIFTS FROM THE FIRST. The reader this replaces
// carried its own program lists and its own reading of which words of a search
// name a path, and the two answers parted: it read the first bare word after a
// searcher as a path where the gate reads it as the pattern, so grep -c behind a
// pipe was reported as a search of the tree over a path called engine-args, and
// three criteria the gate does admit were called criteria nobody could decide.
// Measured: git ls-files util/checks piped into grep -c engine-args goes through
// the shell door and answers 2.
//
// THE REMOVAL GUARDS ARE LEFT OUT ON PURPOSE. What they refuse turns on what the
// actor has already read, which is not in the bytes of this write, so a criterion
// naming a removal is judged where the removal is run.
//
// A CLOSED NOTE IS HISTORY. Its criteria were decided while its lane was open,
// under whatever the gate was then. Refusing a write to it would freeze the
// record rather than mend it, so a note whose status says closed is left alone.
func aDoneWhenLineNamesARunnableCommand(r Roots, _ bool, rel, text string) error {
	if !doneWhenIsAWorkNote(rel) {
		return nil
	}
	if !doneWhenNoteIsOpen(text) {
		return nil
	}
	for _, named := range doneWhenCommandsIn(text) {
		why := doneWhenWhyTheGateRefuses(r, named.command)
		if why == "" {
			continue
		}
		return fmt.Errorf(
			"A DONE-WHEN LINE NAMES A COMMAND NOBODY DECIDING IT MAY RUN. %s line %d names %q, "+
				"and the write gate refuses that command: %s\n\n"+
				"WHY IT MATTERS. A criterion said \"Decided by: go test -C src/engine -run ... -count=1 ./\". "+
				"In an agent lane that command is refused outright, so the one hand that has to decide the "+
				"sentence may not run the command written under it. A reviewer then translated the command by "+
				"hand and the verdict recorded a run under a heading naming a call the lane never made.\n\n"+
				"WHAT TO WRITE INSTEAD. Name a door the lane has. For a Go test: se test --propose <TestName> "+
				"answers ok. For a search over the tree: se find --regex <pattern> --path <glob>. To check that "+
				"a module compiles: go build -o /dev/null ./... or go vet ./..., both of which leave no program "+
				"behind. To build what the tree ships: %s. A program reading its own input behind a pipe is "+
				"admitted, so a state verb piped into grep -c is a criterion a lane can decide, and so is a "+
				"criterion that names a reading rather than a command.",
			rel, named.line, strings.TrimSpace(named.command), why, TheBuildDoor)
	}
	return nil
}

// doneWhenIsAWorkNote answers whether this path is a work note. The tracked
// folder is the one the store names, so a move of that folder carries this rule
// with it, and the private folder beside it holds the notes that never travel.
func doneWhenIsAWorkNote(rel string) bool {
	rel = strings.TrimPrefix(strings.ReplaceAll(rel, "\\", "/"), "./")
	if !strings.HasSuffix(rel, ".md") {
		return false
	}
	dir := ""
	if at := strings.LastIndex(rel, "/"); at >= 0 {
		dir = rel[:at]
	}
	return dir == TheTrackedFolder || dir == ".se/work"
}

// doneWhenNoteIsOpen answers whether the note this text will be is still open.
// The status field is one word on a line of its own, and the first such line is
// the note's own frontmatter.
func doneWhenNoteIsOpen(text string) bool {
	for _, raw := range strings.Split(text, "\n") {
		line := strings.TrimRight(raw, "\r")
		rest, ok := strings.CutPrefix(line, "status:")
		if !ok {
			continue
		}
		value := strings.Trim(rest, " \t")
		if value == "" || strings.ContainsAny(value, " \t") {
			continue // more than one word, so it is prose rather than the field
		}
		return value != "closed"
	}
	return true
}

// doneWhenNamed is one command a criterion names, and the line that named it.
type doneWhenNamed struct {
	line    int
	command string
}

// doneWhenCommandsIn answers every command the done-when criteria of this note
// name. Only the section under the done-when heading is read, because a command
// quoted in the detail is a report of something that was run elsewhere rather
// than an instruction to whoever decides the note.
//
// THE LINE ENDING IS NOT PART OF WHAT A NOTE SAYS. A reader that matched on a
// bare newline answered one way on a checkout with one line ending and another
// way on a checkout with the other, over the same commit, so every line is
// trimmed of its carriage return before it is read.
//
// A FENCED BLOCK IS A QUOTATION. What is inside it is being shown rather than
// named as the command that decides anything.
func doneWhenCommandsIn(text string) []doneWhenNamed {
	var out []doneWhenNamed
	under := false
	fenced := false
	for i, raw := range strings.Split(text, "\n") {
		line := strings.TrimRight(raw, "\r")
		if strings.HasPrefix(strings.TrimLeft(line, " \t"), "```") {
			fenced = !fenced
			continue
		}
		if fenced {
			continue
		}
		if strings.HasPrefix(line, "##") && len(line) > 2 && (line[2] == ' ' || line[2] == '\t') {
			under = strings.EqualFold(strings.TrimSpace(line[2:]), "done when")
			continue
		}
		if !under || !strings.HasPrefix(line, "- ") {
			continue
		}
		for _, command := range doneWhenCommandsOnLine(line) {
			out = append(out, doneWhenNamed{line: i + 1, command: command})
		}
	}
	return out
}

// doneWhenCommandsOnLine answers what one criterion names as the command that
// decides it: whatever is fenced in backticks, and whatever follows the first
// "decided by" or, failing that, the last colon.
//
// PROSE AFTER THE COMMAND IS CUT AT THE FIRST COMMA OUTSIDE QUOTES, because
// "which answers 5 today" is a sentence rather than an argument, and every bare
// word after a searcher reads as a path.
func doneWhenCommandsOnLine(line string) []string {
	var raw []string
	var bare strings.Builder
	rest := line
	for {
		open := strings.IndexByte(rest, '`')
		if open < 0 {
			bare.WriteString(rest)
			break
		}
		shut := strings.IndexByte(rest[open+1:], '`')
		if shut < 0 {
			bare.WriteString(rest)
			break
		}
		if shut == 0 {
			bare.WriteString(rest[:open+1]) // an empty pair names nothing
			rest = rest[open+1:]
			continue
		}
		bare.WriteString(rest[:open])
		bare.WriteString(" ")
		raw = append(raw, rest[open+1:open+1+shut])
		rest = rest[open+1+shut+1:]
	}
	said := bare.String()
	if after, ok := doneWhenAfterDecidedBy(said); ok {
		raw = append(raw, after)
	} else if at := strings.LastIndex(said, ": "); at >= 0 {
		raw = append(raw, said[at+2:])
	}
	var out []string
	for _, one := range raw {
		one = doneWhenUntilTheProse(one)
		if strings.TrimSpace(one) != "" {
			out = append(out, one)
		}
	}
	return out
}

// doneWhenAfterDecidedBy answers what a criterion names after the words that
// introduce its command. The colon is optional and the space is not, so a
// sentence that ends on the phrase names nothing.
func doneWhenAfterDecidedBy(text string) (string, bool) {
	const says = "decided by"
	at := strings.Index(strings.ToLower(text), says)
	if at < 0 {
		return "", false
	}
	rest := strings.TrimPrefix(text[at+len(says):], ":")
	cut := strings.TrimLeft(rest, " \t")
	if cut == rest {
		return "", false
	}
	return cut, true
}

// doneWhenUntilTheProse cuts a command at the first comma outside quotes. A
// comma inside a quoted pattern belongs to the pattern.
func doneWhenUntilTheProse(text string) string {
	quote := byte(0)
	for i := 0; i < len(text); i++ {
		c := text[i]
		switch {
		case quote != 0:
			if c == quote {
				quote = 0
			}
		case c == '\'' || c == '"':
			quote = c
		case c == ',':
			return text[:i]
		}
	}
	return text
}

// doneWhenWhyTheGateRefuses answers which of the write gate's refusals this
// command meets, in its own words, or nothing.
//
// THE SEARCHER NAMED HERE IS A STAND-IN. ARecursiveSearch decides without
// reading the probe and names what the probe found only in the sentence it
// writes, so the answer is the same on every box and does not turn on whether
// this machine has been probed yet.
func doneWhenWhyTheGateRefuses(r Roots, command string) string {
	standIn := Tool{Name: "the searcher the probe found", Path: "this machine"}
	if why, refused := ATestRunByHand(command, r.Work); refused {
		return doneWhenHeadline(why)
	}
	if why, refused := ASearchOverTheTree(command, r.Work); refused {
		return doneWhenHeadline(why)
	}
	if why, refused := ARecursiveSearch(command, standIn); refused {
		return doneWhenHeadline(why)
	}
	if why, refused := ABuildRunByHand(command, r.Method); refused {
		return doneWhenHeadline(why)
	}
	if why, refused := ABuildThatDropsAProgram(command); refused {
		return doneWhenHeadline(why)
	}
	return ""
}

// doneWhenHeadline answers the opening sentence of a refusal, which is the part
// that says which rule was met.
func doneWhenHeadline(why string) string {
	if at := strings.IndexByte(why, '\n'); at >= 0 {
		why = why[:at]
	}
	if at := strings.Index(why, ". "); at >= 0 {
		why = why[:at+1]
	}
	return strings.TrimSpace(why)
}
