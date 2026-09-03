package main

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

// A CHECK THAT CANNOT READ WHAT IT GUARDS SAYS SO.
//
// Both linters returned nothing when the declaration was missing or would not
// parse, so se lint answered clean precisely when the file it guards was
// broken. That is the moment it was most worth hearing from.
//
// The rule is in doc/guidance/behaviour.md and in all three projections: a
// check that finds nothing to check refuses.
func TestALinterThatCannotReadTheDeclarationRefuses(t *testing.T) {
	t.Parallel()
	for _, how := range []struct {
		name  string
		write func(path string)
	}{
		{"missing", func(path string) { os.Remove(path) }},
		{"unparseable", func(path string) {
			os.WriteFile(path, []byte("{ this is not json }"), 0o644)
		}},
	} {
		t.Run(how.name, func(t *testing.T) {
			r := guidanceTree(t)
			how.write(filepath.Join(r.Method, "util", "parameters.json"))

			for what, found := range map[string][]Finding{
				"LintLimits": LintLimits(r),
				"LintIcons":  LintIcons(r),
			} {
				if len(found) == 0 {
					t.Errorf("%s answered clean with a %s declaration", what, how.name)
					continue
				}
				if !strings.Contains(found[0].Says, "cannot be read") {
					t.Errorf("%s does not say it could not read it: %q", what, found[0].Says)
				}
			}
		})
	}
}

// And with a declaration it can read, it says nothing about reading it.
func TestALinterThatCanReadSaysNothingAboutIt(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	for what, found := range map[string][]Finding{
		"LintLimits": LintLimits(r),
		"LintIcons":  LintIcons(r),
	} {
		for _, f := range found {
			if strings.Contains(f.Says, "cannot be read") {
				t.Errorf("%s says it cannot read a file that is there: %q", what, f.Says)
			}
		}
	}
}

// A VERB REFUSES WHAT IT WILL NOT USE.
//
// Every verb here parsed its flags and dropped whatever was left over. So
// `se lint doc/guidance/reviewing.md` answered clean, and so did
// `se lint /nope/not-a-file.md`, because neither path was read by anything.
// It is spelled like a check on the thing named, it exits zero, and the answer
// is indistinguishable from one where the file was read and approved. Three
// submissions in one day cited it as evidence about a file, in good faith.
//
// THE CHECK IS OVER EVERY VERB AND NOT OVER THE ONE THAT WAS CAUGHT. A scope
// drawn around what was touched is the shape this project keeps finding, so
// the list of verbs comes from the program rather than from this test.
func TestAVerbRefusesAnArgumentItWillNotUse(t *testing.T) {
	t.Parallel()
	if len(Verbs()) == 0 {
		t.Fatal("the program declares no verbs, so this guards nothing")
	}
	for _, verb := range Verbs() {
		if err := Stray(verb, []string{"/nope/not-a-file.md"}); err == nil {
			t.Errorf("se %s takes a path it will not read and says nothing about it", verb)
		}
		if !strings.Contains(fmt.Sprint(Stray(verb, []string{"/nope"})), "/nope") {
			t.Errorf("se %s refuses without naming what it was handed", verb)
		}
		if err := Stray(verb, nil); err != nil {
			t.Errorf("se %s refuses a call with nothing left over: %v", verb, err)
		}
	}
}

// AND EVERY VERB COMES THROUGH THE ONE DOOR. The rule above is only a rule if
// nothing parses its own flags beside it, so this refuses a second parse
// anywhere but in the door itself.
func TestNothingParsesItsOwnFlags(t *testing.T) {
	t.Parallel()
	here, err := os.ReadDir(".")
	if err != nil {
		t.Fatal(err)
	}
	found, read := 0, 0
	for _, f := range here {
		name := f.Name()
		if !strings.HasSuffix(name, ".go") || strings.HasSuffix(name, "_test.go") {
			continue
		}
		b, err := os.ReadFile(name)
		if err != nil {
			t.Fatalf("%s cannot be read, so this guards nothing: %v", name, err)
		}
		read++
		for i, line := range strings.Split(string(b), nl) {
			// ANY PARSE, NOT ONE SPELLING OF IT. The rule was already stated as
			// nothing parses its own flags, and the pattern matched only
			// .Parse(args), so the one call that still dropped what it was
			// handed was the one the guard could not express: main.go writes
			// flag.Parse() with the arguments implicit.
			if !parses.MatchString(line) {
				continue
			}
			found++
			if name != theDoor {
				t.Errorf("%s:%d parses its own flags. Only %s may, because a verb "+
					"that parses its own can drop what it was handed", name, i+1, theDoor)
			}
		}
	}
	// A CHECK THAT FINDS NOTHING TO CHECK REFUSES.
	if read == 0 {
		t.Fatal("no source was read")
	}
	if found == 0 {
		t.Fatalf("nothing parses flags at all, so %s no longer guards anything", theDoor)
	}
}

const theDoor = "verbs.go"

// A FLAG SET'S PARSE, AND NOT EVERY PARSE. The pattern matched any .Parse(
// and so refused time.Parse, which parses no flags and drops nothing. A flag
// set in this package is the package's own, flag, or a verb's, fs, and the
// test below holds every flag set to the door, so a set under another name
// cannot slip past the narrower pattern.
var parses = regexp.MustCompile(`\b(flag|fs)\.Parse\(`)

var makesFlagSet = regexp.MustCompile(`flag\.NewFlagSet\(`)
var throughTheDoor = regexp.MustCompile(`\bparse\(fs,`)

// EVERY FLAG SET GOES THROUGH THE DOOR. A file that makes one and does not
// hand it to parse has a way of dropping what it was handed, whatever it
// called the set.
func TestEveryFlagSetGoesThroughTheDoor(t *testing.T) {
	t.Parallel()
	here, err := os.ReadDir(".")
	if err != nil {
		t.Fatal(err)
	}
	read := 0
	for _, f := range here {
		name := f.Name()
		if !strings.HasSuffix(name, ".go") || strings.HasSuffix(name, "_test.go") || name == theDoor {
			continue
		}
		b, err := os.ReadFile(name)
		if err != nil {
			t.Fatalf("%s cannot be read, so this guards nothing: %v", name, err)
		}
		read++
		made := len(makesFlagSet.FindAll(b, -1))
		parsed := len(throughTheDoor.FindAll(b, -1))
		if made != parsed {
			t.Errorf("%s makes %d flag set(s) and hands %d to parse(fs, ...), so one is parsed elsewhere or not at all",
				name, made, parsed)
		}
	}
	if read == 0 {
		t.Fatal("no source was read")
	}
}
