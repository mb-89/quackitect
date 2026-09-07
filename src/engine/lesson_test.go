package main

import (
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

// NOTHING IN THIS PACKAGE CLAIMS A BEHAVIOUR NOBODY CALLS.
//
// MintLessonToken read as the feature: its name and its doc said the engine
// mints a lesson its own token, and nothing anywhere called it. A reviewer
// looking for the behaviour found the function and stopped looking.
//
// THE METHOD SAYS THE OPPOSITE, AND THE METHOD IS RIGHT. reviewing.md: you mint
// the lesson's token and you name it, the engine cannot mint it for you,
// because which class a finding belongs to is a judgment. So the function was
// not unfinished, it was contradicted, and it is gone.
//
// THE CHECK IS OVER THE PACKAGE AND NOT OVER THAT NAME. An exported function in
// this package that nothing calls and no test drives is either dead or a claim,
// and both want saying out loud.
//
// A METHOD IS ONE OF THEM. It was left out on the reasoning that a method is
// reached through its type, and Archived.Where was the counter-example: it
// stated the precedence among an archive row's three objects, readArchived
// stated the same order again, and nothing but a test ever read the method. Two
// statements of one rule, one of them unread, and they can be made to disagree.
// A method carries a claim exactly as a function does.
func TestNoExportedFunctionHereIsUncalled(t *testing.T) {
	t.Parallel()
	root := filepath.Join("..", "..")
	// KNOWN AND SAID, so a reader can tell one from an oversight. Each is
	// reached from outside this package or from a place a search cannot see.
	reached := map[string]string{
		"Retro":      "a verb of the program, reached through the dispatch table",
		"Abort":      "a verb of the program, reached through the dispatch table",
		"PutDown":    "a verb of the program, reached through the dispatch table",
		"Reclaim":    "called on every pull",
		"KnownTools": "called on a first pull",
		// HANDED TO A REGISTER RATHER THAN CALLED. The stop checks are a list
		// the engine builds at start-up, so the name appears as a value and
		// never as a call, which is what the search looks for.
		"AskToStop": "registered as a stop check in init, so it is passed and never called by name",
		// NOTHING YET, AND WHAT OWES IT. The filter builder's per-type
		// offer. The panel that would ask for it is the v3 editor port,
		// and until that lands nothing calls this. It is named
		// here so a reader can tell it from an oversight, which is the
		// answer the method allows and the one silence does not.
		"OperatorsFor": "the filter builder's per-type offer, owed a caller by the v3 editor port",
		// HANDED TO THE LINT'S TABLE AS A VALUE. Each sits in the list of
		// lints in lint.go, written without a bracket, which is the shape a
		// search for a caller cannot see. The same case as AskToStop above.
		"LintGuidance":   "handed to the lint's table in lint.go as a value, so it is passed and never called by name",
		"LintProcesses":  "handed to the lint's table in lint.go as a value, so it is passed and never called by name",
		"LintRationales": "handed to the lint's table in lint.go as a value, so it is passed and never called by name",
		// CALLED THROUGH AN INTERFACE BY SOMEBODY ELSE'S CODE. The name never
		// appears at a call site here, and it never will, because the caller is
		// the standard library reaching the type through an interface.
		"MarshalJSON":   "encoding/json calls it through an interface, never by name",
		"UnmarshalJSON": "encoding/json calls it through an interface, never by name",
		"Unwrap":        "errors.Is and errors.As call it through an interface, never by name",
	}
	declared := exportedFuncs(t, filepath.Join(root, "src", "engine"))
	if len(declared) < 10 {
		t.Fatalf("only %d exported functions were found, so this guards nothing", len(declared))
	}
	// AN EXCLUSION IS HELD AGAINST THE PACKAGE TOO. A name excused here that
	// nothing declares any more is an exclusion nobody will notice has gone
	// stale, which is the same silence this check exists to end.
	for name := range reached {
		if _, there := declared[name]; !there {
			t.Errorf("%s is excused here and this package declares no such function", name)
		}
	}
	// THE TREE IS READ ONCE. It was walked again for every name the package
	// declares, a few hundred names over a few hundred files, and that made
	// this the longest test in the suite at nearly nine seconds.
	calls := theCallsIn(t, root)
	for name, where := range declared {
		if _, said := reached[name]; said {
			continue
		}
		if calls[name] {
			continue
		}
		t.Errorf("%s in %s is exported, nothing calls it, and it is in no exclusion. "+
			"Either it is dead or it is a claim about a behaviour that is not there",
			name, filepath.Base(where))
	}
}

// exportedFuncs answers every exported function and method this package
// declares, keyed by name, with the file it is in. A method is keyed by its own
// name without its receiver, because that is what a caller writes after the dot
// and so what a search for a caller has to look for.
func exportedFuncs(t *testing.T, dir string) map[string]string {
	t.Helper()
	out := map[string]string{}
	entries, err := os.ReadDir(dir)
	if err != nil {
		t.Fatal(err)
	}
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".go") || strings.HasSuffix(e.Name(), "_test.go") {
			continue
		}
		p := filepath.Join(dir, e.Name())
		b, err := os.ReadFile(p)
		if err != nil {
			t.Fatal(err)
		}
		for _, m := range exportedHere.FindAllStringSubmatch(string(b), -1) {
			out[m[1]] = p
		}
	}
	return out
}

// exportedHere matches an exported declaration at the start of a line, function
// or method. The receiver is passed over so the name it answers is the one a
// call site writes.
var exportedHere = regexp.MustCompile(`(?m)^func (?:\([^)]*\) )?([A-Z]\w*)\(`)

// theCallsIn answers every name this tree calls, over one reading of it.
//
// IT WAS A WALK PER NAME. Every exported name the package declares sent a walk
// over every Go file under src, so the reading was done a few hundred times and
// this was the longest test in the suite. The answer is the same either way,
// and the tree is read once for it.
func theCallsIn(t *testing.T, root string) map[string]bool {
	t.Helper()
	calls := map[string]bool{}
	if err := filepath.WalkDir(filepath.Join(root, "src"), func(p string, d os.DirEntry, err error) error {
		if err != nil || d.IsDir() || !strings.HasSuffix(p, ".go") {
			return nil
		}
		b, err := os.ReadFile(p)
		if err != nil {
			return nil
		}
		for _, line := range strings.Split(string(b), nl) {
			if strings.HasPrefix(line, "//") {
				continue
			}
			// THE DECLARATION IS NOT A CALL, and a method's declaration carries
			// its receiver between func and the name, so the name is read off
			// the line and passed over where the two are the same.
			declares := ""
			if m := exportedHere.FindStringSubmatch(line); m != nil {
				declares = m[1]
			}
			for _, m := range aCallHere.FindAllStringSubmatch(line, -1) {
				if m[1] != declares {
					calls[m[1]] = true
				}
			}
		}
		return nil
	}); err != nil {
		t.Fatal(err)
	}
	if len(calls) < 100 {
		t.Fatalf("the walk found %d names being called, so it is not reading the tree", len(calls))
	}
	return calls
}

// aCallHere matches a name with a bracket after it, which is what a call looks
// like wherever it is written, method or function.
var aCallHere = regexp.MustCompile(`([A-Za-z_]\w*)\(`)
