package main

import (
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// A RED IS AN ASSERTION THAT FAILED, AND A BUILD FAILURE IS NOT ONE.
//
// A package that will not compile is answered here as a build, never as a test
// that failed, and the answer names the files the build error names together
// with the token the record says wrote each of them.
//
// Why many hands share one tree, and why the engine pays for that rather than a
// worktree each: [[workers-share-one-tree]].

// aBuildFailure is the answer for a chosen test whose package will not
// compile: a run of kind build, so nothing downstream reads it as a red.
func aBuildFailure(r Roots, id, dir, said string) ran {
	if strings.TrimSpace(said) == "" {
		said = "the cover binary for " + dir + " will not build"
	}
	return ran{ID: id, Kind: "build", OK: false, Said: theBuildRefusal(r, dir, said)}
}

// theBuildRefusal is what it says: that nothing ran, that this is no red, and
// whose writes the build error names.
func theBuildRefusal(r Roots, dir, said string) string {
	return "THE PACKAGE DID NOT COMPILE, SO THIS IS NO RED. A red is an assertion that failed, " +
		"and no test ran here. The package is " + dir + ". " +
		theHandsThatBrokeIt(r, dir, said) + "\n\n" + tailOf(said, 1500)
}

// theHandsThatBrokeIt names each file the build error names, and the token the
// record says wrote it.
//
// A FILE NO JOURNAL CARRIES IS SAID TO BE ONE. A write made by a shell command
// is on nobody's record, and naming a hand for it would be a guess.
func theHandsThatBrokeIt(r Roots, dir, said string) string {
	files := filesBuildNamed(r.Work, dir, said)
	if len(files) == 0 {
		return "The build error names no file, so the record cannot say whose write it was."
	}
	wrote := whoWroteWhat(r)
	says := ""
	for _, f := range files {
		switch {
		case wrote[f] == "":
			says += " " + f + ", which no apply on record wrote."
		default:
			says += " " + f + ", written on " + wrote[f] + "."
		}
	}
	return "What the build error names, and whose write the record says each is:" + says
}

// whoWroteWhat answers, for every path the record carries, the token it was
// written on and who held it. The newest entry wins, because that is the write
// standing in the tree now.
//
// IT IS THE OTHER HALF OF WhatThisTokenWrote, which is handed a token and
// answers its paths. This one is handed a path and answers the token, so the
// two walk one folder for two questions.
func whoWroteWhat(r Roots) map[string]string {
	out := map[string]string{}
	entries, err := os.ReadDir(undoDir(r))
	if err != nil {
		return out // no journal folder is a record that names nobody
	}
	var names []string
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".json") {
			names = append(names, e.Name())
		}
	}
	sort.Strings(names)
	for _, name := range names {
		// AN ENTRY IN THE OLD SHAPE CARRIES NO TOKEN, so it attributes nothing.
		j, err := readJournal(filepath.Join(undoDir(r), name))
		if err != nil || j.On == "" {
			continue
		}
		who := j.On
		if j.By != "" {
			who += ", by " + j.By
		}
		for _, f := range j.Files {
			if p := filepath.ToSlash(f.File); p != "" {
				out[p] = who
			}
		}
	}
	return out
}

// filesBuildNamed reads the files a Go build's output names, once each, in the
// order it named them.
//
// THE PATH IS SPELLED THE WAY THE RECORD SPELLS IT. A build names a file
// relative to the package it ran in, or absolutely, and a journal names it
// relative to the tree, so both are brought to the tree's spelling before they
// are matched.
func filesBuildNamed(work, dir, said string) []string {
	var out []string
	seen := map[string]bool{}
	for _, line := range strings.Split(said, "\n") {
		for _, word := range strings.Fields(line) {
			cut := strings.Index(word, ".go:")
			if cut < 0 {
				continue
			}
			name := strings.TrimPrefix(word[:cut+len(".go")], "./")
			p := filepath.ToSlash(filepath.Join(dir, name))
			if filepath.IsAbs(name) {
				rel, err := filepath.Rel(work, name)
				if err != nil {
					continue // a path outside this tree is nothing the record can hold
				}
				p = filepath.ToSlash(rel)
			}
			if !seen[p] {
				seen[p] = true
				out = append(out, p)
			}
		}
	}
	return out
}
