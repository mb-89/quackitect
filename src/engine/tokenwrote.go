package main

import (
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// A DELTA IS THE HOLDER'S CHANGE, NOT THE TREE'S.
//
// se test reads a delta as the tree against the snapshot taken when the token
// was taken up. On one machine with one agent those are the same thing. On a
// tree several agents share they are not: a token that wrote three files came
// back with fifty-seven changes, and the whole battery was ruled because
// util/checks/scripts-are-lf.mjs was in them, which that token never wrote.
//
// A WHOLE RULING IS A SENTENCE ABOUT THIS CHANGE: it says this one is wide
// enough to need everything. Read off the tree it says somebody else's is, and
// the holder pays for it in a battery it did not earn.
//
// THE RECORD ALREADY SAYS WHOSE WRITE IS WHOSE. Every apply journals an entry
// under .se/undo carrying the token it was made on and the files it touched,
// which is what an undo reads to take back its own and nobody else's.
//
// AND A WRITE IT CANNOT PROVE IS ONE IT WILL NOT SILENTLY DROP. A file written
// by a shell command under a token is in no journal, and a retro drains the
// folder, so a token with nothing on record keeps the whole diff and the answer
// says why. Narrowing on an empty record would answer a green run over a change
// nothing looked at, which is worse than a battery nobody needed.

// WhatThisTokenWrote answers the paths the record says this token wrote, and
// whether it proved any.
//
// ONE FUNCTION ANSWERS BOTH HALVES, because a caller that asked them apart
// would narrow a delta to nothing on a record that says nothing, and read the
// silence as a change that touched no file.
func WhatThisTokenWrote(r Roots, on string) (map[string]bool, bool) {
	wrote := map[string]bool{}
	if on == "" {
		return wrote, false
	}
	entries, err := os.ReadDir(undoDir(r))
	if err != nil {
		return wrote, false // no journal folder is no proof, not an empty change
	}
	var names []string
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".json") {
			names = append(names, e.Name())
		}
	}
	sort.Strings(names)
	for _, name := range names {
		// AN ENTRY NOBODY CAN READ NAMES NOBODY'S WRITE, and an entry in the old
		// shape carries no token, so neither is attributed to this one.
		j, err := readJournal(filepath.Join(undoDir(r), name))
		if err != nil || j.On != on {
			continue
		}
		for _, f := range j.Files {
			if f.File != "" {
				wrote[filepath.ToSlash(f.File)] = true
			}
		}
	}
	return wrote, len(wrote) > 0
}

// onlyWhatItWrote keeps the changes whose file this token wrote, in the order
// the delta had them.
//
// THE GRAIN IS THE FILE, NOT THE LINE. Two hands in one file is a collision the
// applier refuses on its own terms; here the honest answer is that the holder
// touched that file, so its changes stay in the delta.
func onlyWhatItWrote(delta []change, wrote map[string]bool) []change {
	out := make([]change, 0, len(delta))
	for _, ch := range delta {
		if wrote[ch.Path] {
			out = append(out, ch)
		}
	}
	return out
}

// nothingOnRecord is what the answer says when no apply under this token can be
// found: the whole diff stands, and the reason names the token rather than
// whichever of somebody else's files happened to trip a trigger.
func nothingOnRecord(on string) string {
	return "nothing in the record says what " + on + " wrote, so the delta is the whole diff"
}
