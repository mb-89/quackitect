package main

import (
	"os"
	"strings"
)

// A READ THROUGH THE ENGINE IS A READ.
//
// The delete guard asks whether this actor has looked at a file, and the answer
// came from the harness alone. A Read call was noted in the evidence and a cat
// through se_run was not.
//
// MEASURED, September 2026, on a cloud box. Three files were read whole through
// se_run and the next se_run naming rm on them was refused with NOTHING IS
// DELETED THAT NOBODY LOOKED AT. The same three read with the harness Read tool,
// and the same rm, went through at once.
//
// THE WRITE GATE REFUSES THE HARNESS'S OWN BASH there, so se_run is the only
// door left. An agent following the card could never satisfy the guard, and one
// reaching past it could, so the guard rewarded going round the door the project
// wants used.
//
// THE RULE IS UNCHANGED. Nothing is deleted that nobody looked at. What changes
// is where a look may happen.

// readers are the programs whose job is to print what a file holds. It is the
// mirror of remover in removal.go, and it is read the same way: a program is
// where a command starts, so a word appearing in prose is not a read.
var readers = map[string]bool{
	"cat": true, "head": true, "tail": true, "nl": true, "od": true,
	"xxd": true, "hexdump": true, "strings": true, "sed": true, "awk": true,
	"less": true, "more": true,
}

func reader(word string) bool {
	return readers[strings.ToLower(strings.Trim(word, "'\""))]
}

// readerAt answers where in these words a reading program is RUN, or -1. The
// walk is removerAt's, for the reasons written over it.
func readerAt(words []string) int {
	past := ""
	value := false
	for i, w := range words {
		if value {
			value = false
			continue
		}
		if reader(w) {
			return i
		}
		if runner(w) {
			past = strings.ToLower(strings.Trim(w, "'\""))
			continue
		}
		if past != "" && strings.HasPrefix(w, "-") {
			value = takesAValue(past, w)
			continue
		}
		return -1
	}
	return -1
}

// AReadThroughTheEngine notes every file this command printed, so the delete
// guard sees it the way it sees a harness Read. It answers what it noted.
//
// A WORD THAT IS NO FILE IS NOT NOTED. sed takes a script before its file and
// head takes a count, so a reader's arguments carry words that name nothing.
// Noting one would record a look at a file nobody has.
func AReadThroughTheEngine(r Roots, actor, command, work string) []string {
	var noted []string
	for _, part := range pipeline(command) {
		words := strings.Fields(part)
		at := readerAt(words)
		if at < 0 {
			continue
		}
		for _, p := range filesAmong(words[at+1:]) {
			if !anyInside([]string{p}, work) {
				continue
			}
			full := underWork(work, p)
			if info, err := os.Stat(full); err != nil || !info.Mode().IsRegular() {
				continue
			}
			NoteRead(r, actor, full)
			noted = append(noted, full)
		}
	}
	return noted
}
