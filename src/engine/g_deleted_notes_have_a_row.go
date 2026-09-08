package main

import (
	"fmt"
	"os"
	"path/filepath"
)

// A ROW IS NOT TAKEN OUT OF THE ARCHIVE WHILE THE NOTE IS OFF THE DISK.
//
// The archive list is the record of a close, and a close moves two things
// together. It writes the row, and then it takes the note off the disk. The row
// is the only thing naming that note afterwards, so a write that drops the row
// leaves the note gone from the working tree and named by nothing.
//
// MEASURED ON THIS TREE. git status named 112 notes deleted from the working
// tree and not committed. 91 of them had a row in the archive, so those
// deletions were a close doing its job. Twenty of the rest were still on the
// branch, every one open with no disposition. Nothing said who took them off
// the disk, or why.
//
// AND A WRITE OF THIS ONE FILE MADE SOME OF THEM. A sweep on a cloud box took
// 153 notes off the disk and wrote their rows. A hand judged the sweep too
// broad and reverted the rows, and nothing said there were deletions to revert
// beside them. The notes were left off the disk, on the branch, and named by no
// row. That revert was a write of the archive list, which is why this door can
// see it coming.
//
// THE CHECK THIS REPLACES COULD NOT FAIL. It asked git for the notes under one
// folder and then kept only the lines under another folder's name, so the set
// it compared was always empty and every run ended saying it guarded nothing. A
// scan also answers about whatever the tree happens to hold on the day it runs.
// The bytes are in hand here, so the answer is known before the list changes.
//
// A ROW MAY GO WHEN THE NOTE IS BACK. What is refused is losing the last name a
// note nobody can open still has. A row dropped for a note that is on the disk
// again loses no such name, and it goes through.
func anArchiveDroppingANoteThatIsGone(r Roots, _ bool, rel, text string) error {
	if filepath.ToSlash(rel) != TheTrackedFolder+"/archive.jsonl" {
		return nil
	}
	// THE ROWS ARE READ BY THE READER EVERY CLOSE USES. A second reading of the
	// list written here would drift from that one, and this door would then take a
	// list the engine itself cannot read.
	rows, err := archiveRowsIn(rel, []byte(text))
	if err != nil {
		return fmt.Errorf("%s would carry a line the archive cannot read: %v. "+
			"The list is read whole or not at all, so one such line takes every row with it and "+
			"leaves every note already off the disk named by nothing. Write each row as one line "+
			"of JSON carrying its id, or leave the line out.", rel, err)
	}
	kept := make(map[string]bool, len(rows))
	for _, row := range rows {
		kept[row.ID] = true
	}
	said, err := os.ReadFile(ArchiveList(r))
	if err != nil {
		return nil // there is no list yet, so this write drops no row
	}
	was, err := archiveRowsIn(TheTrackedFolder+"/archive.jsonl", said)
	if err != nil {
		return nil // the copy on the disk does not read, and repairing it is the way out
	}
	for _, row := range was {
		if kept[row.ID] {
			continue
		}
		// THE DISK IS ASKED THE WAY EVERY OTHER DOOR ASKS IT, so a note moved
		// between the two folders that hold notes is found rather than called gone.
		if noteAt(r, row.ID) != "" {
			continue
		}
		return fmt.Errorf("%s would drop the row for %s, and no note of that id is on the disk. "+
			"That row is the only thing naming a note a close took away, so dropping it leaves the "+
			"note gone and named by nothing, and the backlog shrinks with nobody told. Keep that "+
			"row in the list. To take it out, put the note back first with "+
			"git checkout -- %s/%s.md, and then the row names something a reader can open.",
			rel, row.ID, TheTrackedFolder, row.ID)
	}
	return nil
}
