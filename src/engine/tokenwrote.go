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
//
// THE SAME HOLDS ONE APPLY LATER. A token with one apply on record proves that
// one, and a shell write beside it is still in no journal. The narrowing keeps
// it out of the delta, so the answer names every file it left out. An agent
// reading a green run sees what no test was chosen for, whether the write was
// its own shell command or another hand's.

// WhatThisTokenWrote answers the paths the record says this token wrote, and
// whether it proved any.
//
// ONE FUNCTION ANSWERS BOTH HALVES, because a caller that asked them apart
// would narrow a delta to nothing on a record that says nothing, and read the
// silence as a change that touched no file.
//
// AND A PATH NO DELTA CARRIES IS NOT A WRITE THIS CAN PROVE. deltaSince drops
// private material, so a journalled write under .se proved a write the
// narrowing then had nothing to keep: an empty delta with whole false, and the
// suite ran nothing over a tree that had changed and called it ok. That is the
// outcome the empty-record door below exists to refuse, open on the other side.
//
// IT IS THE ORDINARY CASE, NOT A CORNER. The engine tells an agent with nothing
// in hand to put its command file and its manifest under .se/scratchpad and
// apply them there, so a token whose applies are all private is what the
// refusal itself asks for.
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
			// THE SAME READING deltaSince USES, so the two cannot come apart
			// again: what proves a write is exactly what a delta can carry.
			path := filepath.ToSlash(f.File)
			if path == "" || isPrivateMaterial(path) {
				continue
			}
			wrote[path] = true
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

// leftOut names the files the narrowing kept out, once each, in the order the
// delta had them.
//
// A SHELL WRITE AND ANOTHER HAND'S WRITE READ THE SAME to the record, which is
// why this names both rather than guessing between them. What the reader needs
// is the list of changes in the tree that this answer chose no test for.
func leftOut(delta []change, wrote map[string]bool) []string {
	var out []string
	seen := map[string]bool{}
	for _, ch := range delta {
		if wrote[ch.Path] || seen[ch.Path] {
			continue
		}
		seen[ch.Path] = true
		out = append(out, ch.Path)
	}
	return out
}

// nothingOnRecord is what the answer says when no apply under this token can be
// found: the whole diff stands, and the reason names the token rather than
// whichever of somebody else's files happened to trip a trigger.
func nothingOnRecord(on string) string {
	return "nothing in the record says what " + on + " wrote, so the delta is the whole diff"
}
