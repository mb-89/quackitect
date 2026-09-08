package main

import (
	"path"
	"path/filepath"
	"sort"
	"strings"

	"quackitect/engine/internal/sessionlog"
)

// A STAGE CARRIES ONLY WHAT THIS TOKEN WROTE.
//
// commitpaths.go shut the two wide doors: a commit that names no path, and a
// stage of everything. A stage that names one path is still a stage of
// whatever that path holds, and the path may be another hand's whole change,
// or half of one.
//
// MEASURED, ON THIS BRANCH, from dd2fed69 to HEAD: 174 commits, 67 of which
// import a package under src/engine/internal that the same commit does not
// carry. By package, logbook 63, yaml 5, version 4. Each is a stage that took
// one half of another hand's move and left origin not building.
//
// THE RECORD ALREADY SAYS WHOSE WRITE IS WHOSE. Every apply journals the files
// it wrote under the token it was made on, which is what an undo reads to take
// back its own and nobody else's, and what WhatThisTokenWrote answers. So a
// stage is judged against that: a path this token wrote goes through, and a
// path it did not is refused by name.
//
// A TOKEN WITH NOTHING ON RECORD IS NOT JUDGED. An empty journal proves no
// write rather than proving there was none, and refusing every path on it would
// hand a wall to an agent whose writes were all shell commands. That is the
// same door tokenwrote.go leaves open, on the same reasoning.
//
// THE WALK IS gitVerbAt'S, so git add is found where a program is run and a
// sentence about git add is prose.

// addValueFlags are the git add flags whose value is the next word, so the
// value is not read as a path. A flag with its value attached, --chmod=+x, is
// one word and needs no entry.
var addValueFlags = map[string]bool{"--chmod": true, "--pathspec-from-file": true}

// stagedPaths answers the paths a git add names.
// aMergeIsInFlight says whether git is part way through a merge. MERGE_HEAD
// stands from the moment a merge conflicts until it is committed or given up.
func aMergeIsInFlight(r Roots) bool {
	return exists(filepath.Join(r.Work, ".git", "MERGE_HEAD"))
}

func stagedPaths(args []string) []string {
	var out []string
	for i := 0; i < len(args); i++ {
		a := strings.Trim(args[i], "'\"")
		switch {
		case a == "--":
			return append(out, filesAmong(args[i:])...)
		case addValueFlags[a]:
			i++
		case strings.HasPrefix(a, "-"):
		case a != "":
			out = append(out, a)
		}
	}
	return out
}

// asTheRecordSpellsIt answers a staged path the way the journal spells one:
// forward slashes, no leading dot, and no trailing separator.
func asTheRecordSpellsIt(p string) string {
	p = strings.ReplaceAll(p, "\\", "/")
	if p == "" || p == "." {
		return p
	}
	return path.Clean(p)
}

// AStageCarriesStrangers answers whether this command stages a path the record
// does not say this token wrote, and names every such path. It is asked at both
// doors a shell command comes through: the harness's Bash and the run verb.
func AStageCarriesStrangers(r Roots, on, actor, command string) (string, bool) {
	// A MERGE IN FLIGHT IS THE ONE PLACE ANOTHER HAND'S FILE IS YOURS TO STAGE.
	//
	// Resolving a conflict is not writing somebody's file. It is saying which of
	// two versions the branch keeps, and the paths are the ones git itself left
	// in conflict. The commit guard already makes this exception and the stage
	// guard did not, so a merge could be started and never finished: sixty-nine
	// notes and four files stood conflicted with no legal way to resolve them.
	if aMergeIsInFlight(r) {
		return "", false
	}
	wrote, proved := WhatThisTokenWrote(r, on)
	if !proved {
		return "", false
	}
	var strangers []string
	seen := map[string]bool{}
	for _, part := range pipeline(command) {
		words := shellWords(part)
		var named []string
		if at := gitVerbAt(words, "add"); at >= 0 {
			named = append(named, stagedPaths(words[at+1:])...)
		}
		// A COMMIT NAMES ITS PATHS AND NEEDS NO STAGE AT ALL. With a pathspec
		// git commit is --only: it takes those paths straight out of the working
		// tree, leaving the index where it was. commitpaths.go shuts the commit
		// that names none, and left the one that names another hand's file wide
		// open, by the door the stage of it is refused at.
		if at := gitVerbAt(words, "commit"); at >= 0 {
			paths, _ := commitPaths(words[at+1:])
			named = append(named, paths...)
		}
		var here []string
		for _, p := range named {
			p = asTheRecordSpellsIt(p)
			if p == "" || wrote[p] || seen[p] {
				continue
			}
			seen[p] = true
			here = append(here, p)
		}
		if len(here) == 0 {
			continue
		}
		// AND A HAND THAT MEANS IT SAYS SO ON THE COMMAND THAT STAGES, ONCE, IN
		// THE RECORD. It is asked of this part's own words, so a reason typed in
		// another part opens nothing here.
		if why, meant := theStagingEscape(words); meant {
			inSession(r, "stage", actor,
				on+" staged "+strings.Join(here, ", ")+" past the guard, because "+why,
				sessionlog.Yes(), map[string]any{"id": on, "paths": here, "why": why})
			continue
		}
		strangers = append(strangers, here...)
	}
	if len(strangers) == 0 {
		return "", false
	}
	var mine []string
	for p := range wrote {
		mine = append(mine, p)
	}
	return aStageOfAStrangersPath(on, strangers, mine), true
}

// aStageOfAStrangersPath is the refusal, and it names what was refused and what
// the record does say this token wrote.
func aStageOfAStrangersPath(on string, strangers, mine []string) string {
	sort.Strings(mine)
	said := "A STAGE CARRIES ONLY WHAT THIS TOKEN WROTE.\n\n" +
		"git add names " + strings.Join(strangers, ", ") + ", and nothing in the record says " + on +
		" wrote " + oneOrOther(len(strangers), "it", "them") + ". The index is every agent's at once, so a " +
		"stage of another hand's file puts half of that hand's change in your commit, under your name, " +
		"with no line saying so.\n\n" +
		"MEASURED: of the last 174 commits on this branch, 67 import a package under " +
		"src/engine/internal that the same commit does not carry. Each one is this.\n\n" +
		"The record says " + on + " wrote:\n\n"
	for _, p := range mine {
		said += "    " + p + "\n"
	}
	return said + "\nIF YOU MEAN IT, SAY WHY ON THE COMMAND, and the record carries who staged what and " +
		"for what reason. It is an assignment because git refuses a flag it does not know:\n\n" +
		"    SE_STAGE_ANYWAY=\"the other half of a move\" git add <paths>\n\n" +
		"Stage those and nothing beside them. If you wrote the file with a shell command, " +
		"write it through the engine instead, so the record says whose it is:\n\n" +
		"  se apply --on " + on + " --by <you> --from .se/scratchpad/manifest.json\n\n" +
		"To put your files on the branch tip without touching the shared index at all, the door " +
		"that copies them into a worktree of its own is:\n\n" +
		"    sh util/git/land.sh \"<message>\" <paths>"
}

// theEscapeWord is what a hand types to mean a stage the record cannot vouch
// for. A guard with no way past is a guard people work around, and the way
// round this one is a shell the engine never sees.
//
// IT IS AN ASSIGNMENT RATHER THAN A FLAG, because git refuses a flag it does
// not know and the shell hands an assignment through untouched.
const theEscapeWord = "SE_STAGE_ANYWAY"

// theStagingEscape answers the reason typed on this one command, and whether
// one was typed at all. An escape carrying no reason is no escape: the line it
// leaves in the record is the whole of what it buys.
//
// IT IS A LEADING ASSIGNMENT AND NOTHING ELSE, which is what an assignment is.
// It was any word of any part, so echo SE_STAGE_ANYWAY=x && git add theirs.md
// opened the stage from a part that stages nothing, and the same spelling as a
// pathspec opened it after the program. The reason then went into the record
// against a command that never carried it.
//
// THE WALK IS gitVerbAt'S, so a runner may lead and the words stop where the
// program's own do.
func theStagingEscape(words []string) (string, bool) {
	for _, w := range words {
		if strings.HasPrefix(w, theEscapeWord+"=") {
			if why := strings.TrimSpace(w[len(theEscapeWord)+1:]); why != "" {
				return why, true
			}
			return "", false
		}
		if anAssignment(w) || runner(w) {
			continue
		}
		return "", false // the program has begun, and what follows is its own
	}
	return "", false
}

// oneOrOther says the word that fits the count.
func oneOrOther(n int, one, many string) string {
	if n == 1 {
		return one
	}
	return many
}
