// The doors verb: every door, the contract test that holds it, and every
// walk-around of a door with every line marked past one.
// [[spec/guidance/code/testing]]
package main

import (
	"fmt"
	"io"
	"io/fs"
	"path"
	"path/filepath"
	"strings"

	"quackitect/src/index"
	"quackitect/src/modules/check"
	"quackitect/src/owns"
)

// Where the doors and their contract tests stand. A marked line carries no colon past its column, so setup-go's problem matcher reads it as no error and leaves the step's annotations to the failing case. [[spec/design_output/doors#one-contract-test-per-door]] [[spec/tickets/doors-walk-reads-clean]]
const (
	doorsFolder    = "src/doors"
	contractFolder = "test/contract"
	walkLine       = "%s:%d:%d: %s\n"
	markedWalk     = "%s:%d:%d %s stands marked: %s\n"
	contractLine   = "%s keeps the contract of %s\n"
	outsideLine    = "%s stands inside %s, its own outside\n"
	walksRefused   = "A walk-around reaches past its door. Reach it through the door, or mark the line: // " + owns.Marker + "<why the door cannot serve>"
)

func init() { register("doors", doorsVerb(index.Root)) }

// doors over the root: each door under src/doors with no contract test named, each walk-around and marked line, or the count where nothing stands. [[spec/design_output/doors#one-contract-test-per-door]]
func doorsVerb(root func() (string, error)) twin {
	return func(_ []string, _ bool, out, errs io.Writer) int {
		at, err := root()
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		refused := walksOver(at, out, errs)
		disk := rootDisk{at}
		held := map[string]bool{}
		for _, name := range disk.Names(contractFolder) {
			if test, ok := strings.CutSuffix(name, ".test.js"); ok {
				held[test] = true
			}
		}
		doors, missing := 0, 0
		for _, name := range disk.Names(doorsFolder) {
			door, ok := strings.CutSuffix(name, ".js")
			if !ok {
				continue
			}
			doors++
			if !held[door] {
				missing++
				fmt.Fprintf(errs, "%s/%s.js has no %s/%s.test.js.\n", doorsFolder, door, contractFolder, door)
			}
		}
		if missing > 0 {
			fmt.Fprintln(errs, "A door with no contract test lets its fake drift. Write one.")
		}
		if refused > 0 {
			fmt.Fprintln(errs, walksRefused)
		}
		if missing > 0 || refused > 0 {
			return exitFailed
		}
		fmt.Fprintf(out, "%d doors, and a contract test holds each one.\n", doors)
		return 0
	}
}

// The files a declaration names, or its folder where it names none. [[spec/design_output/doors#a-door-declares-its-names]]
func ownFiles(door owns.Door) []string {
	if door.Files != nil {
		return door.Files
	}
	return []string{door.At}
}

// Every contract test a door names, then every walk-around and marked line of the files the lint's walk reaches: a marked line to out, every other walk-around to errs, and the count refused. [[spec/design_output/doors#nothing-walks-around-a-door]]
func walksOver(root string, out, errs io.Writer) int {
	disk := rootDisk{root}
	declared, files := map[string]string{}, []string{}
	_ = filepath.WalkDir(root, func(at string, entry fs.DirEntry, err error) error {
		if err != nil {
			return nil
		}
		rel, err := filepath.Rel(root, at)
		if err != nil || rel == "." {
			return nil
		}
		rel = filepath.ToSlash(rel)
		if !check.DoorsWalked(rel) {
			if entry.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}
		switch {
		case entry.IsDir():
		case owns.Declares(rel):
			if text, ok := disk.Read(rel); ok {
				declared[rel] = text
			}
		case path.Ext(rel) == ".go" || path.Ext(rel) == ".js" || path.Ext(rel) == ".mjs":
			files = append(files, rel)
		}
		return nil
	})
	doors, _ := owns.Read(declared, disk.Exists)
	if len(doors) == 0 {
		return 0
	}
	for _, door := range doors {
		for _, test := range door.Contract {
			fmt.Fprintf(out, contractLine, test, door.Name)
		}
		if door.Outside {
			for _, at := range ownFiles(door) {
				fmt.Fprintf(out, outsideLine, at, door.Name)
			}
		}
	}
	refused := 0
	for _, rel := range files {
		text, _ := disk.Read(rel)
		for _, one := range owns.Walks(rel, text, doors) {
			switch {
			case one.Marked:
				fmt.Fprintf(out, markedWalk, rel, one.Line, one.Column, one.Name, one.Reason)
			default:
				refused++
				fmt.Fprintf(errs, walkLine, rel, one.Line, one.Column, one.Says())
			}
		}
	}
	return refused
}
