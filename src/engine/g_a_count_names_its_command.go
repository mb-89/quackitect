package main

import (
	"fmt"
	"regexp"
	"strings"
)

// A COUNT A NOTE STATES NAMES THE COMMAND THAT PRODUCED IT.
//
// Voice rule 13 says a number something else answers is never written down, and
// the tree's count is the command that answers it. A number with no command
// beside it cannot be checked and cannot be refreshed. The next reader cites it
// as though it had been.
//
// MEASURED. A note said TempDir lines in engine test files fall from 201 to 126.
// The change was a pure move of eleven function bodies, so it could not have
// moved that count at all, and it did not. The same search answers alike at the
// commit before it, at it, and at HEAD. Neither endpoint was ever a number this
// tree held, and it stood as the note's headline measurement.
//
// THE RULE IS NARROW ON PURPOSE, because the broad one is useless. A first cut
// asked for a command beside any number against a countable noun. It flagged
// 1643 sentences over 361 notes. Two applies from two tokens is prose. Three
// findings followed by the three is a list answering its own count, which rule
// 13 allows outright. Digits alone still flagged 165.
//
// AND THE NARROW ONE MISSED THE SENTENCE IT WAS WRITTEN FOR. Asking for a digit
// with the noun next to it flagged fourteen and let the measured sentence
// through. That sentence puts its numbers after the noun. A rule that cannot
// catch its own worked example is the wrong rule.
//
// SO THE THREE PARTS ARE ASKED FOR ANYWHERE IN THE SENTENCE. The parts are a
// noun this tree can be asked to count, a number, and a verb claiming a
// measurement. They are read in prose rather than in a table cell or a fence.
//
// A NUMBER THAT IS AN ADDRESS IS NOT A COUNT. A step, a chapter, a line number,
// a token id, a date and a commit hash all name a place. They answer where
// rather than how many, so they come out before the sentence is asked.
//
// A CLOSED NOTE IS HISTORY, so only an open one is read. Its numbers were
// written under the tree as it stood, and rewriting them rewrites the record.
// The runnable-command guard beside this one scopes itself the same way.
func aCountNamesTheCommandThatProducedIt(_ Roots, _ bool, rel, text string) error {
	if !doneWhenIsAWorkNote(rel) || !doneWhenNoteIsOpen(text) {
		return nil
	}
	fenced := false
	for at, raw := range strings.Split(text, "\n") {
		line := strings.TrimLeft(strings.TrimRight(raw, "\r"), " \t")
		if strings.HasPrefix(line, "```") {
			fenced = !fenced
			continue
		}
		// A TABLE CELL IS ITS OWN EVIDENCE. A row is the answer a command
		// already gave, laid out beside what asked it, so it is not prose
		// making a claim. A fence shows a run rather than claiming one.
		if fenced || strings.HasPrefix(line, "|") {
			continue
		}
		for _, said := range aCountSentencesOf(line) {
			if !aCountIsStatedIn(said) || aCountCommand.MatchString(said) {
				continue
			}
			return fmt.Errorf(
				"A COUNT IS STATED WITH NO COMMAND BESIDE IT. %s line %d states a count and names "+
					"nothing a reader could run to get it back: %q\n\n"+
					"WHY IT MATTERS. A note said TempDir lines in engine test files fall from 201 to "+
					"126. The change was a pure move of eleven function bodies, so it could not have "+
					"moved that count at all. It did not: the same search answers alike at the commit "+
					"before it, at it, and at HEAD. Neither endpoint was ever a number this tree held, "+
					"and it stood as the note's headline measurement of what the change bought. A number "+
					"something else answers is never written down, and the tree's count is the command "+
					"that answers it.\n\n"+
					"WHAT TO WRITE INSTEAD. Put the command that answers the number in the same sentence, "+
					"in backticks, so the next reader can run it. Like this: `se find --regex TempDir "+
					"--path 'src/engine/*_test.go'` answers 201. A search of the index, a run of se test, "+
					"a git call or a go test all read as that command. If the number is not the tree's to "+
					"answer, do not write it down. If it is already the answer a command gave, move the "+
					"row into a table, where the cell stands as its own evidence.",
				rel, at+1, strings.TrimSpace(said))
		}
	}
	return nil
}

// THE NOUNS ARE THE THINGS THIS TREE CAN BE ASKED TO COUNT. A number against
// anything else measures the world rather than the tree, and no command here
// would answer it.
var aCountNoun = regexp.MustCompile(`(?i)\b(?:lines?|files?|tests?|tokens?|notes?|commits?|checks?|hits?|matches|rows?|functions?|builders?|words?|sentences?|packages?|modules?)\b`)

// AN ADDRESS IS EVERY SHAPE OF NUMBER THAT NAMES A PLACE. A step, a rule, a
// token id, a date, a commit hash and a line number all say where, so each one
// comes out of the sentence before the sentence is asked for a number.
var aCountAddress = regexp.MustCompile(`(?i)\b(?:step|chapter|rule|section|level|round|part|version|go|line|item)\s+\d+|\bwk-[0-9a-f]+|\b\d{4}-\d{2}-\d{2}|\b[0-9a-f]{7,}\b|:\d+`)

// aCountNumber is a bare number, asked for only after the addresses are gone.
var aCountNumber = regexp.MustCompile(`\b\d+\b`)

// AND THE VERB IS WHAT MAKES IT A CLAIM. Without one the number is usually an
// address or a bound rather than a measurement taken.
var aCountVerb = regexp.MustCompile(`(?i)\b(?:answers?|answered|counted?|holds?|held|stands? at|falls? from|fell from|measured|reports?|reported)\b`)

// A COMMAND BESIDE IT is anything a reader could run to get the number back.
var aCountCommand = regexp.MustCompile("`[^`]+`|\\bse (?:find|test|ask|run|work|pull|status)\\b|\\bgit \\w+|\\bnode \\b|\\bgo test\\b|\\bpython3?\\b")

// aCountIsStatedIn answers whether one sentence states a count. All three parts
// have to be there: a noun this tree can be asked to count, a verb claiming a
// measurement, and a number still standing once the addresses are taken out.
func aCountIsStatedIn(said string) bool {
	if !aCountNoun.MatchString(said) || !aCountVerb.MatchString(said) {
		return false
	}
	return aCountNumber.MatchString(aCountAddress.ReplaceAllString(said, " "))
}

// aCountSentencesOf cuts one line into sentences.
//
// THE SENTENCE IS THE UNIT, because a command two sentences away is not beside
// the number it is supposed to answer. A stop ends a sentence only when a space
// follows it, so a file name and a version number stay whole.
func aCountSentencesOf(line string) []string {
	var out []string
	start := 0
	for at := 0; at < len(line); at++ {
		if line[at] != '.' && line[at] != ';' && line[at] != ':' {
			continue
		}
		next := at + 1
		for next < len(line) && (line[next] == ' ' || line[next] == '\t') {
			next++
		}
		if next == at+1 {
			continue
		}
		out = append(out, line[start:at+1])
		start = next
		at = next - 1
	}
	if start < len(line) {
		out = append(out, line[start:])
	}
	return out
}
