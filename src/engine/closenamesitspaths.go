package main

import (
	"path/filepath"
	"strings"
)

// thePathsAClose answers the files a submission writes that git carries, for
// the hand that has to land them.
//
// A CLOSE WRITES TWO THINGS AND A HAND LANDS ONE. The note goes one way and
// the archive row the other, and the answer named neither, so a hand landed
// what it remembered and the branch read the token as still open.
//
// MEASURED, 2026-09-07, three times in one session, each time by the stop hook
// rather than by anything the engine said.
//
// IT IS ASKED BEFORE THE WRITE, because a close archives the note and takes it
// off the disk. Asked afterwards it answers nothing, which is the half
// wk-bf10a262a0 carries.
//
// A PRIVATE NOTE TRAVELS NOWHERE. A token under .se/work answers nothing at
// all, rather than a path no push would take.
func thePathsAClose(r Roots, t Token, ends bool) []string {
	at := noteAt(r, t.ID)
	if at == "" {
		return nil
	}
	if !strings.HasPrefix(filepath.ToSlash(at), filepath.ToSlash(TrackedDir(r))+"/") {
		return nil
	}
	out := []string{fromTheRoot(r, at)}
	// THE ROW IS WRITTEN ONLY WHERE THE TOKEN ENDS. A step that hands the token
	// on writes the note and nothing beside it.
	if ends {
		out = append(out, fromTheRoot(r, ArchiveList(r)))
	}
	return out
}

// fromTheRoot is a path as the branch names it, which is how a land is given
// one.
func fromTheRoot(r Roots, at string) string {
	rel, err := filepath.Rel(r.Work, at)
	if err != nil {
		return filepath.ToSlash(at)
	}
	return filepath.ToSlash(rel)
}

// theLanding is the sentence a hand acts on.
//
// A CLOSE THAT TOUCHED NOTHING GIT CARRIES SAYS NOTHING. A line on every
// submission is noise, and noise is what teaches an agent to stop reading.
func theLanding(paths []string) string {
	if len(paths) == 0 {
		return ""
	}
	all := strings.Join(paths, " ")
	return "\n\nLAND EVERY PATH THIS CLOSE WROTE, rather than the one you remember: " +
		all + "\n  sh util/git/land.sh \"<message>\" " + all
}
