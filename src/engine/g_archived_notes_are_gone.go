package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// A NOTE NEVER STANDS BESIDE ITS OWN ARCHIVE ROW.
//
// A CLOSE MOVES TWO THINGS TOGETHER. It writes the row into the archive list
// and it takes the note off the disk. Only the row is remembered when the
// change is landed, because the note is gone by then and nothing lists it. So
// the branch takes the row and keeps the note, and the record disagrees with
// itself.
//
// MEASURED, September 2026, over a detached worktree of the branch. Of the 32
// notes there carrying bucket claims, 25 already had an archive row saying
// done. Seven were genuinely open. The queue, the burndown and every count
// taken off the tracked folder read 32.
//
// THE QUEUE ITSELF CANNOT FIX IT. Its pull answers that the clone is behind and
// asks a person to bring the tracked folder into step. The clone is not behind.
// It deleted the notes when it closed them, and the deletion never travelled.
//
// SO THE DOOR HOLDS BOTH SIDES OF THE PAIR. A note written while the list
// already carries its close is refused, and a row written for a note still on
// the disk is refused. Either write on its own puts the two into disagreement,
// and each of them is one write this door can read whole.
//
// A ROW THE LIST ALREADY CARRIED IS NOT THIS WRITE'S DOING. The list is
// rewritten whole on every close, so ruling on all of it would refuse a writer
// for a pair somebody else left standing, with no move open to them but to
// repair work they never touched. That is a wall rather than a door. Only the
// rows this write adds are ruled on, and the note side catches a standing pair
// the moment anybody writes the note again.
//
// THE WORKING COPY OF THE LIST IS WHAT THIS READS. The archive can also be read
// out of the branch, and archiveListRows does that for a tree whose copy has
// gone. This runs on every write, and a shell out to git on each one is paid by
// every write in the tree, so a tree missing its list decides nothing here
// rather than deciding it slowly.
func aNoteStandingBesideItsArchiveRow(r Roots, _ bool, rel, text string) error {
	rel = filepath.ToSlash(rel)
	if filepath.ToSlash(filepath.Dir(rel)) != TheTrackedFolder {
		return nil // a local note is kept until a retro reads it, and it is not the record
	}
	standing, _ := os.ReadFile(ArchiveList(r))
	if rel == TheTrackedFolder+"/archive.jsonl" {
		return theCloseThisListWouldAdd(r, rel, string(standing), text)
	}
	if !strings.HasSuffix(rel, ".md") {
		return nil
	}
	id := strings.TrimSuffix(filepath.Base(rel), ".md")
	closed := theIDsThisArchiveNames(string(standing))
	if closed[id] == "" {
		return nil
	}
	return fmt.Errorf("%s would be written, and %s/archive.jsonl already carries %s as %s. "+
		"A close writes the row and takes the note off the disk together, so a note standing "+
		"beside its own row makes every reader of %s count finished work as open: 25 of 32 "+
		"notes read that way in September 2026, and the queue answered that the clone was "+
		"behind when it was not. If this work is closed, land the deletion instead: "+
		"sh util/git/land.sh \"<message>\" %s %s/archive.jsonl. If it is open again, take its "+
		"row out of the list first, and then write this note.",
		rel, TheTrackedFolder, id, closed[id], TheTrackedFolder, rel, TheTrackedFolder)
}

// theCloseThisListWouldAdd rules on the rows a write of the list puts there
// that the list did not carry before.
func theCloseThisListWouldAdd(r Roots, rel, standing, text string) error {
	was := theIDsThisArchiveNames(standing)
	for n, line := range strings.Split(text, "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		// A LINE THAT WILL NOT READ IS A REFUSAL AND NEVER A SKIP. The list is the
		// record of what closed, so a line nobody can read may be the row for a note
		// still sitting in the folder, and passing over it would excuse that note.
		var row Archived
		if err := json.Unmarshal([]byte(line), &row); err != nil || row.ID == "" {
			return fmt.Errorf("line %d of %s does not read as an archive row: %s. Each line is "+
				"the record of one close, and a line this door cannot read may be the row for a "+
				"note still sitting in %s. Write one JSON object per line, each carrying an id.",
				n+1, rel, line, TheTrackedFolder)
		}
		if was[row.ID] != "" {
			continue // the list already carried this close, so this write is not what put it there
		}
		if _, err := os.Stat(filepath.Join(TrackedDir(r), row.ID+".md")); err != nil {
			continue // the note is off the disk, which is what a close leaves behind
		}
		return fmt.Errorf("%s would carry %s as %s while %s/%s.md is still on the disk. A close "+
			"moves two things together: it writes the row and it takes the note off the disk. A "+
			"row that lands without the deletion leaves the work open to every reader of %s, "+
			"which is how 25 of 32 notes came to be counted as open in September 2026. Delete "+
			"%s/%s.md first, then write this row, and land the two together: "+
			"sh util/git/land.sh \"<message>\" %s/%s.md %s/archive.jsonl.",
			rel, row.ID, howTheRowClosed(row), TheTrackedFolder, row.ID, TheTrackedFolder,
			TheTrackedFolder, row.ID, TheTrackedFolder, row.ID, TheTrackedFolder)
	}
	return nil
}

// theIDsThisArchiveNames answers what each line of a list closes, by id.
//
// A LINE IT CANNOT READ NAMES NO ID, so it says nothing about any note here.
// The refusal for such a line belongs to the write that puts it there, which is
// where the writer can still do something about it.
func theIDsThisArchiveNames(said string) map[string]string {
	closed := map[string]string{}
	for _, line := range strings.Split(said, "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		var row Archived
		if err := json.Unmarshal([]byte(line), &row); err != nil || row.ID == "" {
			continue
		}
		closed[row.ID] = howTheRowClosed(row)
	}
	return closed
}

// howTheRowClosed says how a row closed its token, and says archived for a row
// that names no disposition. A row is the record of a close either way, and an
// empty word in a refusal reads as a defect in the refusal.
func howTheRowClosed(row Archived) string {
	if row.Disposition == "" {
		return "archived"
	}
	return row.Disposition
}
