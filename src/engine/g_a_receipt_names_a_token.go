package main

import (
	"fmt"
	"path/filepath"
	"strings"
)

// A RECEIPT NAMING A TOKEN NAMES ONE THAT EXISTS.
//
// The last column of a checklist row is where a hand puts what a reader should
// go and look at. A work id there is a promise that the thing is in the queue,
// and it is how a cleanup gets handed on rather than dropped.
//
// MEASURED, 7 September 2026. A token ticked the line saying the cleanup the
// change revealed is carried by a token of its own. Its receipt named an id
// that was nowhere: no note in the tracked folder, no row in the archive, and
// no commit. The cleanup it stood for was real and correctly found. It went
// into nobody's queue, because the line recording it rested on an id nobody
// minted.
//
// A TICKED LINE IS A CLAIM THAT SOMETHING WAS DONE. This one said the cleanup
// is carried, so nobody looks again. This door is the only thing standing
// between that line and a cleanup nobody ever does.
//
// THE RECEIPT COLUMN IS WHERE THIS LOOKS, and not the prose. A detail may name
// an id from another branch, a session that has not landed, or a token this box
// has never seen, and be right to. A receipt is narrower. It is what the note
// offers as the place a reader goes next.
//
// AN OPEN NOTE ONLY, because a closed note is history. Its receipts were
// written under the queue as it stood, and rewriting them rewrites the record.
//
// AND THE QUEUE THIS ASKS IS INCOMPLETE, which a reader acting on a refusal has
// to know. The archive has lost rows before, and ids named in src resolve in
// neither place. So a refusal means the id cannot be followed from this clone,
// and not that it was never minted. Telling the two apart needs a person and a
// wider search than one write can make.
//
// THE CHECK THIS REPLACES COULD NOT FAIL. It read doc/work, and the tracked
// folder has moved since. So it found no folder, said it guarded nothing, and
// stopped before it judged one receipt. A door reads the bytes going in, and it
// asks the folder the engine itself names, so the same move cannot silence it.
func aReceiptNamingATokenNobodyHas(r Roots, _ bool, rel, text string) error {
	at := filepath.ToSlash(rel)
	if filepath.ToSlash(filepath.Dir(at)) != TheTrackedFolder || !strings.HasSuffix(at, ".md") {
		return nil // a local note is this box's own, and the record is what a receipt promises
	}
	if aReceiptNoteThatIsClosed(text) {
		return nil
	}
	// A NOTE MAY OFFER ITSELF. It is not on the disk yet on the write that makes
	// it, and a reader handed this path opens the very file being written.
	mine := strings.TrimSuffix(filepath.Base(at), ".md")
	for n, line := range strings.Split(text, "\n") {
		for _, id := range aTokenId.FindAllString(theReceiptColumnOf(line), -1) {
			if id == mine {
				continue
			}
			// THE QUEUE IS ASKED THE WAY THE CAGE ASKS IT. A receipt and a citation
			// are the same question, and two readers of the same two places drift.
			if cageCitesTheRecordCarries(r, id) {
				continue
			}
			return fmt.Errorf("%s line %d offers %s as its receipt, and this tree carries no note "+
				"for it under %s and no row naming it in %s/archive.jsonl. The last column is where a "+
				"reader is sent to look next. A work id there is a promise the thing is in the queue. "+
				"MEASURED on 7 September 2026. A token ticked the line carrying a revealed cleanup on "+
				"to a token of its own. Its receipt named an id that was nowhere: no note, no archive "+
				"row, and no commit. The cleanup was real, and it went into nobody's queue. Write a "+
				"receipt a reader can open here: a note under %s, a row in the archive, or the file the "+
				"evidence rests on. If the id was minted where this clone cannot see it, say that in "+
				"words instead. A refusal here means the id cannot be followed from here, and not that "+
				"it was never minted.",
				at, n+1, id, TheTrackedFolder, TheTrackedFolder, TheTrackedFolder)
		}
	}
	return nil
}

// theReceiptColumnOf answers the last field of a checklist row, or nothing.
//
// A ROW IS PIPE SEPARATED AND ENDS WITH ONE, so the receipt is the field before
// the end. A line shorter than four fields is not one of these tables, and a
// line that is not a row at all says nothing about any receipt.
func theReceiptColumnOf(raw string) string {
	said := strings.TrimSpace(raw)
	if len(said) < 2 || !strings.HasPrefix(said, "|") || !strings.HasSuffix(said, "|") {
		return ""
	}
	fields := strings.Split(said[1:len(said)-1], "|")
	if len(fields) < 4 {
		return ""
	}
	return fields[len(fields)-1]
}

// aReceiptNoteThatIsClosed says whether the note being written is history.
//
// THE FIRST STATUS LINE IS THE FRONTMATTER ONE, because the frontmatter is the
// head of the file. A word later in the prose is somebody writing about status
// and not the field, and it does not get to close the note.
func aReceiptNoteThatIsClosed(text string) bool {
	for _, raw := range strings.Split(text, "\n") {
		line := strings.TrimSpace(raw)
		if !strings.HasPrefix(line, "status:") {
			continue
		}
		return strings.TrimSpace(strings.TrimPrefix(line, "status:")) == "closed"
	}
	return false
}
