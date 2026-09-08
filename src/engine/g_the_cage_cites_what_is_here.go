package main

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// THE CAGE CITES NOTHING A READER CANNOT OPEN.
//
// The settings files that carry the cage each hold a long comment, and it is
// the only place a reader learns why the cage is shaped the way it is. One of
// them ended by naming the token the measurement was on, and that token was a
// private note on another box. It never travelled. So every clone shipped a
// comment pointing at an id that resolves to nothing, and the reader has no way
// to tell a lost source from one they simply have not found.
//
// A PATH IS A CITATION TOO. The comment names files as well as tokens, and a
// path into the tree that no clone carries is the same shut door as a lost id.
//
// THE READER THAT SCANNED THE TREE FOR THIS HELD NEITHER HALF. It resolved a
// path only under util, doc and src, so a citation into spec, which is where
// the record moved to, went unread. And it took a note under the private work
// folder for an answer, which is the one folder that does not travel: the id
// that was lost would have passed it on the box that wrote it, and every other
// box had no note to scan and so found nothing to fail on either.
//
// SO THE RULE IS DECIDED PER WRITE, off the bytes going in. Every id the text
// names has to be one the record carries, and every path it names has to be a
// file this tree has. The folders are read rather than the index, so the answer
// is the same on a fresh clone where nothing has been indexed yet.
func theCageCitesOnlyWhatTravels(r Roots, _ bool, rel, text string) error {
	if !cageCitesIsASettingsFile(rel) {
		return nil
	}
	for _, id := range cageCitesTokensNamed(text) {
		if cageCitesTheRecordCarries(r, id) {
			continue
		}
		if cageCitesPrivatelyHeld(r, id) {
			return errors.New(rel + " cites " + id + ", and the only note for it is under " +
				cageCitesThePrivateFolder + ", which is this box's own folder and never travels. " +
				"This file ships to every clone, and the comment in it is the one place a reader " +
				"learns why the cage is shaped this way, so an id that opens here and nowhere else " +
				"reads to everybody else exactly like a source they have not found. That is how the " +
				"last one was lost. Cite a token the record carries, a note under " + TheTrackedFolder +
				" or a row in " + TheTrackedFolder + "/archive.jsonl, or say in words what the " +
				"source held.")
		}
		return errors.New(rel + " cites " + id + ", and this tree carries no note for it under " +
			TheTrackedFolder + " and no row naming it in " + TheTrackedFolder + "/archive.jsonl. " +
			"This file ships to every clone, and the comment in it is the one place a reader learns " +
			"why the cage is shaped this way, so an id that resolves to nothing leaves the reader " +
			"unable to tell a lost source from one they have not found. Cite a token the record " +
			"carries, a note under " + TheTrackedFolder + " or a row in " + TheTrackedFolder +
			"/archive.jsonl, or say in words what the source held.")
	}
	for _, named := range cageCitesFilesNamed(text) {
		if exists(filepath.Join(r.Work, filepath.FromSlash(named))) {
			continue
		}
		return errors.New(rel + " names " + named + ", and this tree does not carry it. A path is a " +
			"citation the same way an id is, and this file ships to every clone, so a path that opens " +
			"nothing is the same shut door as a lost token: the reader cannot tell a source that " +
			"moved from one they have not found. Name a file the tree has, or say in words what it " +
			"held.")
	}
	return nil
}

// cageCitesThePrivateFolder is where a note that never travels lives, written
// once so the refusal and the lookup name the same folder.
const cageCitesThePrivateFolder = ".se/work"

// cageCitesIsASettingsFile says whether a written path is one of the files that
// carry the cage.
//
// THE PROJECTED PAIR IS HELD TO THE SAME RULE AS THE SOURCE. What a person
// opens is the file under .claude, the projection copies the comment across
// whole, and a citation broken on the way through would sit in the copy the
// reader actually reads.
func cageCitesIsASettingsFile(rel string) bool {
	at := strings.TrimPrefix(filepath.ToSlash(rel), "./")
	for _, name := range []string{
		"src/cage/claude-settings.json",
		"src/cage/claude-settings-local.json",
		".claude/settings.json",
		".claude/settings.local.json",
	} {
		if at == name {
			return true
		}
	}
	return false
}

// cageCitesAToken finds an id the way the record writes one.
var cageCitesAToken = regexp.MustCompile(`wk-[0-9a-f]{10}`)

func cageCitesTokensNamed(text string) []string {
	return cageCitesOnceEach(cageCitesAToken.FindAllString(text, -1))
}

// cageCitesTheRecordCarries says whether a reader of this tree can open the
// token, in the two places the record keeps one: a note in the tracked folder,
// and a row in the archive for a token that has closed and gone.
//
// IT ASKS THE TRACKED FOLDER RATHER THAN SPELLING IT. That folder has moved
// once already, and a rule carrying its own copy of the name goes quiet the day
// it moves again. The older spellings stay so a tree that has not moved yet is
// held to the same rule.
func cageCitesTheRecordCarries(r Roots, id string) bool {
	for _, folder := range []string{TheTrackedFolder, "doc/work", "src/work"} {
		at := filepath.Join(r.Work, filepath.FromSlash(folder))
		if exists(filepath.Join(at, id+".md")) {
			return true
		}
		if cageCitesArchived(filepath.Join(at, "archive.jsonl"), id) {
			return true
		}
	}
	return false
}

// cageCitesArchived says whether the archive holds a row about a token.
//
// A ROW IS READ AS JSON RATHER THAN LOOKED FOR AS TEXT. An id also turns up in
// another row's successors, and a row about somebody else is not a page this
// reader can open.
func cageCitesArchived(path, id string) bool {
	said, err := os.ReadFile(path)
	if err != nil {
		return false // no archive on this clone, and the notes alone answer
	}
	for _, raw := range strings.Split(string(said), "\n") {
		line := strings.TrimSpace(raw)
		if line == "" {
			continue
		}
		var row struct {
			ID string `json:"id"`
		}
		if err := json.Unmarshal([]byte(line), &row); err != nil {
			continue // a row nothing can read names no id either way
		}
		if row.ID == id {
			return true
		}
	}
	return false
}

// cageCitesPrivatelyHeld says whether the note is in the folder that stays on
// this box. It is asked only to tell the writer which of two things went wrong.
func cageCitesPrivatelyHeld(r Roots, id string) bool {
	return exists(filepath.Join(r.Private("work"), id+".md"))
}

// A CITATION INTO THE TREE IS A RUN OF SEGMENTS ENDING IN AN EXTENSION, so a
// folder named in passing is not read as a file.
//
// The first group is what the run is allowed to follow. This matcher has no
// look behind, so the character before is taken into the match and handed back
// unused, and it is what keeps a path out of the middle of a longer word. Every
// segment of a web address is preceded by a slash, a letter or a dot, and a
// variable the shell expands is preceded by a dollar or a brace, so neither is
// read as a path in this tree.
var cageCitesAPath = regexp.MustCompile(`(^|[^A-Za-z0-9_.:/$%{-])([A-Za-z0-9_.-]+(?:/[A-Za-z0-9_.-]+)+\.[a-z][A-Za-z0-9]*)`)

// cageCitesFilesNamed answers every path the text cites, once each, in the order
// they are written.
func cageCitesFilesNamed(text string) []string {
	var out []string
	for _, m := range cageCitesAPath.FindAllStringSubmatch(text, -1) {
		// A COMMAND NAMES A FILE FROM WHERE IT STANDS. The projected cage runs
		// node on ./src/cage/hook-lane.mjs, and a leading dot left on the front
		// makes that read as a folder nobody resolves.
		named := strings.TrimPrefix(m[2], "./")
		head := named
		if at := strings.Index(head, "/"); at >= 0 {
			head = head[:at]
		}
		// A DOT FOLDER IS NOT RESOLVED HERE. What the engine writes under .claude
		// is absent until it has run, and .se is this box's own state and never
		// travels, so neither says anything about what a clone carries. An id
		// written inside such a path is still held by the half above.
		if strings.HasPrefix(head, ".") {
			continue
		}
		// AND A FIRST SEGMENT CARRYING A DOT IS A HOST RATHER THAN A FOLDER, so
		// what hangs off it is somebody else's tree and not this one's to have.
		if strings.Contains(head, ".") {
			continue
		}
		out = append(out, named)
	}
	return cageCitesOnceEach(out)
}

// cageCitesOnceEach keeps the first of every repeat, so a comment naming one
// source twice is answered for once and in the order it reads.
func cageCitesOnceEach(all []string) []string {
	seen := map[string]bool{}
	var out []string
	for _, one := range all {
		if seen[one] {
			continue
		}
		seen[one] = true
		out = append(out, one)
	}
	return out
}
