package main

import (
	"fmt"
	"path/filepath"
	"regexp"
	"strings"
)

// A NOTE THAT CALLS A SNAPSHOT ABSENT IS RIGHT ABOUT IT.
//
// The engine warns a box at session start that the snapshots its tokens name
// were taken elsewhere and are no objects here. That warning is true of a token
// begun on another box. It is false of one begun on this one, where the engine
// wrote the snapshot itself. Copied onto a note without asking git, it is a
// claim nobody checked.
//
// MEASURED, 7 September 2026. A note said a snapshot was no object in this
// clone. git cat-file -t answered commit. The snapshot was held by a step ref
// written on this box when the work was taken up, and the diff over its span
// was exactly that token's two files. Six notes from one session carried the
// same sentence about a snapshot that resolved, and five about one that did
// not.
//
// THE COST IS PAID BY THE REVIEWER. Reviewing tells them to read every hunk of
// the named span, and a note saying the span cannot be read sends them to HEAD
// instead. The authoritative diff was sitting there and the note said it was
// not. A reviewer who takes the claim at its word has reviewed the note.
//
// SO THE CLAIM IS ASKED OF GIT AT THE WRITE. Every hexadecimal word in a
// sentence that calls something no object is put to git cat-file -t, and one
// that answers is the refusal. A note may still say a snapshot is absent,
// because it may not be wrong.
//
// ALMOST NO WRITE PAYS FOR THE ASKING. The claim is rare, so the whole text is
// matched for the words first, and a note without them asks git nothing.
//
// WHERE THERE IS NO REPOSITORY THIS SAYS NOTHING. The battery also runs over a
// clean archive of a commit, which holds no .git, and a door that refused for
// want of one would say nothing about any note.
//
// A CLOSED NOTE IS READ THE SAME WAY. The sweep this came from passed over one,
// because a sweep reads a whole folder and cannot ask anybody to change what
// already landed. A door stands at the write with the writer in front of it,
// and reviewing reads a closed token's note like any other.
func aSnapshotCalledAbsentDoesNotResolve(r Roots, _ bool, rel, text string) error {
	rel = filepath.ToSlash(rel)
	if !absentSnapshotIsANote(rel) {
		return nil // nothing outside the two note folders is read by a reviewer as a note
	}
	if !absentSnapshotClaim.MatchString(text) {
		return nil // the claim is rare, and a note without it asks git nothing
	}
	if _, err := gitHere(r, "rev-parse", "--git-dir"); err != nil {
		return nil // there is no repository over this tree to ask, so this decides nothing
	}
	asked := map[string]string{}
	for n, line := range strings.Split(text, "\n") {
		for _, whole := range absentSnapshotSentences(line) {
			said := absentSnapshotWithoutQuotations(whole)
			if !absentSnapshotClaim.MatchString(said) {
				continue
			}
			for _, id := range absentSnapshotName.FindAllString(said, -1) {
				kind, seen := asked[id]
				if !seen {
					// A NAME GIT DOES NOT KNOW ANSWERS NOTHING, and that is the note
					// being right. Each name is put to git once, however often the note
					// writes it.
					kind, _ = gitHere(r, "cat-file", "-t", id)
					asked[id] = kind
				}
				if kind == "" {
					continue
				}
				return fmt.Errorf("%s line %d calls %s no object, and git cat-file -t %s answers "+
					"%s. The warning at session start is true of a token begun on another box. It "+
					"is false of one begun on this one, so a note that copies it carries a claim "+
					"nobody checked. Measured on 7 September 2026: six notes from one session said "+
					"this of a snapshot that resolved, and the diff over its span was exactly that "+
					"token's two files. A reviewer told the span cannot be read goes to HEAD "+
					"instead, and reviews the note rather than the change. Ask git before writing "+
					"the sentence: git cat-file -t %s. If it answers, name the span so the reviewer "+
					"reads that diff. If it answers nothing, the sentence may stand.",
					rel, n+1, id, id, kind, id)
			}
		}
	}
	return nil
}

// absentSnapshotClaim is a sentence calling something no object, and
// absentSnapshotName is the shape of a snapshot named in one. Seven is where
// git's own short hash begins.
var absentSnapshotClaim = regexp.MustCompile(`(?i)\bno object\b`)

var absentSnapshotName = regexp.MustCompile(`\b[0-9a-f]{7,40}\b`)

// absentSnapshotIsANote says whether a written path is a note somebody reviews.
// Two folders hold them, the tracked record and this box's own, and a reviewer
// is sent to a span by either.
func absentSnapshotIsANote(rel string) bool {
	if !strings.HasSuffix(rel, ".md") {
		return false
	}
	at := filepath.ToSlash(filepath.Dir(rel))
	return at == TheTrackedFolder || at == absentSnapshotPrivateFolder
}

// absentSnapshotPrivateFolder is where a note that never travels lives.
const absentSnapshotPrivateFolder = ".se/work"

// A QUOTATION IS NOT THE NOTE'S OWN CLAIM. A finding reports the sentence it
// found by writing it out, so a note that exists to say the claim is wrong
// carries it word for word. Read as the note's own it is the very defect being
// reported, and the door would refuse the report rather than the fault.
//
// MEASURED: the sweep this came from refused, on its first run, the finding
// that asked for it, on the sentence that finding was quoting.
var absentSnapshotQuoted = regexp.MustCompile(`"[^"]*"`)

func absentSnapshotWithoutQuotations(said string) string {
	return absentSnapshotQuoted.ReplaceAllString(said, " ")
}

// absentSnapshotStops are the marks a sentence ends on.
const absentSnapshotStops = ".:;"

// absentSnapshotSentences cuts a line where a sentence ends, so a claim is
// judged with the names of its own sentence and never with those of the whole
// line. A note that gives a span and then reports a warning about some other
// snapshot is saying two things, and only one of them is a claim about a name.
//
// A STOP WITH NOTHING AFTER IT ENDS NOTHING. It is inside a number or a word,
// which is where the dots of a version and the colon of a path both sit.
func absentSnapshotSentences(line string) []string {
	var said []string
	start := 0
	for i := 0; i < len(line); i++ {
		if strings.IndexByte(absentSnapshotStops, line[i]) < 0 {
			continue
		}
		after := i + 1
		for after < len(line) && (line[after] == ' ' || line[after] == '\t' || line[after] == '\r') {
			after++
		}
		if after == i+1 {
			continue
		}
		said = append(said, line[start:i+1])
		start = after
		i = after - 1
	}
	return append(said, line[start:])
}
