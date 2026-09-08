package main

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

// EVERY ROW A WRITE PUTS IN THE ARCHIVE NAMES AN OBJECT A CLONE OF THE BRANCH
// IS SENT.
//
// The archive is one line per closed token, and the line is the only thing
// naming where the note went. What a clone is sent is what the branch reaches.
// A blob written at the close with git hash-object sits in the store reachable
// from no tree and no branch, so no clone is ever sent it. A tag has to be
// pushed, and refs/tags answers 403 from the git proxy a cloud box runs behind,
// so a tag written here stays here. What travels is on_branch, the note as the
// branch committed it, which is inside a commit every clone carries.
//
// MEASURED. Rows in this tree name a tag and nothing else. The note was removed
// from the tracked folder at the close, the push of the tag was refused by the
// proxy, and the only copy left was a local ref on a box about to be destroyed.
// The reader that scanned the tree for this could not hold the rule either. It
// answered green where there was no list on the disk to read, and green again
// where git would not answer, so a tree carrying neither passed it while the
// archive was the one thing that had gone.
//
// SO THE RULE IS DECIDED PER WRITE AND PER ROW. A row the list already carries
// is history somebody else wrote, and this door leaves it alone. A row this
// write adds, and a row whose named objects this write changes, has to name the
// copy that travels.
func everyNewArchiveRowTravels(r Roots, isNew bool, rel, text string) error {
	if !archiveRowsTravelIsTheList(rel) {
		return nil
	}
	held := map[string]bool{}
	if !isNew {
		for _, line := range archiveRowsTravelLines(archiveRowsTravelOnDisk(r, rel)) {
			if row, ok := archiveRowsTravelRead(line); ok {
				held[archiveRowsTravelKey(row)] = true
			}
		}
	}
	// THE LINE NUMBER IS THE ONE IN THE FILE. Counting only the lines that say
	// something names a different line to whoever opens the list to fix it.
	for i, raw := range strings.Split(text, "\n") {
		line := strings.TrimSpace(raw)
		if line == "" {
			continue
		}
		n := i + 1
		row, ok := archiveRowsTravelRead(line)
		if !ok {
			return errors.New("line " + strconv.Itoa(n) + " of " + rel + " does not read as an " +
				"archived token, and the list is the archive. A line nothing can parse takes a " +
				"closed token out of the record in silence, and the next write makes that " +
				"permanent. Write the row as one JSON object on one line, carrying id and " +
				"on_branch: " + archiveRowsTravelShort(line))
		}
		if held[archiveRowsTravelKey(row)] {
			continue // the list already carries this row, naming these objects
		}
		if archiveRowsTravelNamesAnObject(row.OnBranch) {
			continue
		}
		if row.OnBranch != "" {
			return errors.New(rel + " gives " + row.ID + " an on_branch of " +
				archiveRowsTravelShort(row.OnBranch) + ", which is not the name of a git object. " +
				"A clone resolves the row by that name, so a word that names no object reads " +
				"back as nothing on every box but this one. Write the full object id of the blob " +
				"the branch committed for the note, forty characters of hex, which git rev-parse " +
				"HEAD:<path of the note> answers and se archive --sweep folds in.")
		}
		return errors.New(rel + " adds a row for " + row.ID + " that names " +
			archiveRowsTravelNamed(row) + ", and a clone of the branch is sent none of that. " +
			"A blob written at the close with git hash-object is reachable from no tree and no " +
			"branch, and a tag has to be pushed, which refs/tags answers 403 for from the git " +
			"proxy a cloud box runs behind. The note itself came off the disk when the token " +
			"closed, so a row naming only those leaves the note on the one box that wrote it. " +
			"Give the row on_branch, the blob the branch committed for the note, which " +
			"se archive --sweep folds in, or leave the row out of the list.")
	}
	return nil
}

// archiveRowsTravelIsTheList says whether a written path is the archive.
//
// IT ASKS THE TRACKED FOLDER RATHER THAN SPELLING IT. That folder has moved
// once already, and a rule that carries its own copy of the name goes quiet the
// day it moves again. The older spellings stay so a tree that has not moved yet
// is held to the same rule.
func archiveRowsTravelIsTheList(rel string) bool {
	at := strings.TrimPrefix(filepath.ToSlash(rel), "./")
	for _, folder := range []string{TheTrackedFolder, "doc/work", "src/work"} {
		if at == folder+"/archive.jsonl" {
			return true
		}
	}
	return false
}

// archiveRowsTravelRow is the part of a row this door reads: who it is about and
// which objects it names.
type archiveRowsTravelRow struct {
	ID       string `json:"id"`
	Blob     string `json:"blob"`
	OnBranch string `json:"on_branch"`
	Tag      string `json:"tag"`
}

// archiveRowsTravelRead reads one line as a row, and says so when it will not.
// A row with no id is about nobody, so it does not read either.
func archiveRowsTravelRead(line string) (archiveRowsTravelRow, bool) {
	var row archiveRowsTravelRow
	if err := json.Unmarshal([]byte(line), &row); err != nil || row.ID == "" {
		return row, false
	}
	return row, true
}

// archiveRowsTravelKey is what makes two rows the same row to this door: the
// token it is about and the objects it names.
//
// THE TITLE IS NOT PART OF IT ON PURPOSE. Fixing the wording of an old row is
// not this rule's business, and refusing that write would leave a person holding
// a row they may not touch and may not remove.
func archiveRowsTravelKey(row archiveRowsTravelRow) string {
	return strings.Join([]string{row.ID, row.Blob, row.OnBranch, row.Tag}, "\x00")
}

// archiveRowsTravelOnDisk is the list as it stands before this write. A list
// that will not read leaves nothing held, and then every row of the write is
// this write's to answer for.
func archiveRowsTravelOnDisk(r Roots, rel string) string {
	said, err := os.ReadFile(filepath.Join(r.Work, filepath.FromSlash(rel)))
	if err != nil {
		return ""
	}
	return string(said)
}

// archiveRowsTravelLines is every line of a list that says anything, with the
// carriage return a Windows checkout leaves taken off.
func archiveRowsTravelLines(text string) []string {
	var out []string
	for _, line := range strings.Split(text, "\n") {
		if line = strings.TrimSpace(line); line != "" {
			out = append(out, line)
		}
	}
	return out
}

// archiveRowsTravelNamesAnObject says whether a word is the name of a git
// object. Forty characters for the older hash and sixty four for the newer one,
// and hex either way. Case is taken as it comes, because git writes the name in
// lower case and a person copying one by hand is not the defect here.
func archiveRowsTravelNamesAnObject(name string) bool {
	if len(name) != 40 && len(name) != 64 {
		return false
	}
	for _, c := range name {
		switch {
		case c >= '0' && c <= '9':
		case c >= 'a' && c <= 'f':
		case c >= 'A' && c <= 'F':
		default:
			return false
		}
	}
	return true
}

// archiveRowsTravelNamed says what a row does name, so the refusal quotes the
// row back rather than describing it.
func archiveRowsTravelNamed(row archiveRowsTravelRow) string {
	var said []string
	if row.Blob != "" {
		said = append(said, "the blob "+archiveRowsTravelShort(row.Blob))
	}
	if row.Tag != "" {
		said = append(said, "the tag "+archiveRowsTravelShort(row.Tag))
	}
	if len(said) == 0 {
		return "no object at all"
	}
	return strings.Join(said, " and ")
}

// archiveRowsTravelShort keeps a quoted word short enough to read in a refusal.
func archiveRowsTravelShort(said string) string {
	said = strings.TrimSpace(said)
	if len(said) > 60 {
		return said[:60] + "..."
	}
	return said
}
