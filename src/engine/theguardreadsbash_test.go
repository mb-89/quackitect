package main

import (
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

// ONE WALK ANSWERS BOTH QUESTIONS, AND NOTHING ELSE ANSWERS EITHER.
//
// Where the quoted spans lie is one fact about a command. A second pass with
// its own idea of quoting builds a second parse, and at most one of the two is
// bash's. That is how a substitution behind an apostrophe went through the
// gate: the substitution scan demoted the double quote, so it's opened a span
// bash never opened.
//
// THE SOURCE IS READ, because the defect is a shape and not a value. One
// function answers the pair, and every hand that wants the pair calls it.
func TestOneWalkAnswersEveryQuestion(t *testing.T) {
	t.Parallel()
	var answers []string
	var asked int
	for _, name := range theShippedSource(t) {
		file, err := parser.ParseFile(token.NewFileSet(), name, nil, 0)
		if err != nil {
			t.Fatalf("parsing %s: %v", name, err)
		}
		for _, d := range file.Decls {
			if fn, ok := d.(*ast.FuncDecl); ok && answersThePair(fn) {
				answers = append(answers, name+": "+fn.Name.Name)
			}
		}
		ast.Inspect(file, func(n ast.Node) bool {
			as, ok := n.(*ast.AssignStmt)
			if !ok || !namesThePair(as.Lhs) {
				return true
			}
			asked++
			if len(as.Rhs) != 1 || !isCallOf(as.Rhs[0], "theQuotings") {
				t.Errorf("%s takes the pair from something other than theQuotings, "+
					"so this command is parsed twice and at most one parse is bash's", name)
			}
			return true
		})
	}
	if len(answers) != 1 || !strings.HasSuffix(answers[0], ": theQuotings") {
		t.Fatalf("the pair is answered by %v, and one walk answers it once", answers)
	}
	if asked < 2 {
		t.Fatalf("only %d hand asks for the pair, so this guards nothing", asked)
	}

	// AND THE TWO ANSWERS COME OFF THE SAME SPANS. Each row is a command whose
	// two readings a second parse would disagree about.
	for _, one := range []struct {
		what, command string
		live          bool
	}{
		{"an apostrophe before a substitution", `se work --detail "it's $(touch M)"`, true},
		{"an escaped quote before a separator", `se work --detail "a \" ; touch M"`, false},
		{"a separator inside single quotes", `se work --detail 'a; b'`, false},
		{"a substitution inside single quotes", `se work --detail '$(touch M)'`, false},
	} {
		separators, substitutions := theQuotings(one.command)
		if strings.ContainsAny(separators, ";&|<>\n") {
			t.Errorf("%s: the separators reading carries one, and bash reads it as text: %q",
				one.what, separators)
		}
		if got := strings.Contains(substitutions, "$(") || strings.Contains(substitutions, "`"); got != one.live {
			t.Errorf("%s: the substitutions reading says live %v and bash says %v: %q",
				one.what, got, one.live, substitutions)
		}
	}
}

// EVERY STATE BASH'S MANUAL NAMES HAS A ROW, THE BACKSLASH STATE INCLUDED.
//
// The manual's Quoting section names three ways to take a character's meaning
// away: the escape character, single quotes and double quotes. Inside double
// quotes the backslash keeps its meaning only before $, a backtick, a double
// quote, a backslash or a newline. The rows below are one pair per state, and
// the state is named the way the manual names it.
//
// THE BACKSLASH HAD NO ROW AT ALL, and three commands with escaped quotes drove
// past the exception because of it.
func TestTheRowsFollowTheManual(t *testing.T) {
	t.Parallel()
	const lead = "se work --detail "
	states := map[string]bool{}
	for _, one := range []struct {
		state, arg string
		cuts, live bool
	}{
		{"unquoted", "a; touch M", true, false},
		{"unquoted", "a $(touch M)", false, true},
		{"the escape character", `a \; touch M`, false, false},
		{"the escape character", `a \$(touch M)`, false, false},
		{"single quotes", "'a; touch M'", false, false},
		{"single quotes", "'$(touch M)'", false, false},
		{"double quotes", `"a; touch M"`, false, false},
		{"double quotes", `"$(touch M)"`, false, true},
		{"the backslash inside double quotes", `"a \" ; touch M"`, false, false},
		{"the backslash inside double quotes", `"a \$(touch M)"`, false, false},
	} {
		states[one.state] = true
		separators, substitutions := theQuotings(lead + one.arg)
		if cuts := strings.ContainsAny(separators, ";&|<>\n"); cuts != one.cuts {
			t.Errorf("%s, %s: a separator reads live %v and the manual says %v: %q",
				one.state, one.arg, cuts, one.cuts, separators)
		}
		live := strings.Contains(substitutions, "$(") || strings.Contains(substitutions, "`")
		if live != one.live {
			t.Errorf("%s, %s: a substitution reads live %v and the manual says %v: %q",
				one.state, one.arg, live, one.live, substitutions)
		}
	}
	// A STATE WITH NO ROW IS THE DEFECT THIS IS ABOUT, so the states are counted
	// rather than trusted to the reader of the table.
	for _, want := range []string{"unquoted", "the escape character", "single quotes",
		"double quotes", "the backslash inside double quotes"} {
		if !states[want] {
			t.Errorf("the manual names %s and no row drives it", want)
		}
	}
}

// AND THE GUARD IS DRIVEN AGAINST BASH ITSELF.
//
// Every row above is this hand's reading of the manual, and the defect it
// replaces was another hand's reading of the same manual. So the alphabet is
// driven through bash, with a did-a-file-appear oracle: the payload writes a
// file, and whether the file is there afterwards is what bash did.
//
// THE GUARD MUST REFUSE EXACTLY WHAT REACHED THE FILESYSTEM. An exemption over
// a command that wrote is the leak. A refusal over one that wrote nothing is
// the gate refusing the one call an agent with nothing in hand can make.
func TestTheGuardAgreesWithBash(t *testing.T) {
	t.Parallel()
	bash, err := exec.LookPath("bash")
	if err != nil {
		t.Skip("no bash on this machine, and this drives the guard against bash itself")
	}
	wrappers := []struct{ what, before, after string }{
		{"unquoted", " ", ""},
		{"single quotes", " '", "'"},
		{"double quotes", ` "`, `"`},
		{"an apostrophe first, in double quotes", ` "it's `, `"`},
		{"an escaped quote first, in double quotes", ` "a \" `, `"`},
		{"after the escape character", ` \`, ""},
	}
	payloads := []string{"$(touch M)", "`touch M`", "; touch M", "&& touch M", "| touch M", "> M", "\n touch M"}
	driven := 0
	var unparsed []string
	for _, w := range wrappers {
		for _, payload := range payloads {
			command := "./se pull --actor x" + w.before + payload + w.after
			// A COMMAND BASH WILL NOT PARSE IS NOT A COMMAND. An escaped
			// backtick leaves the next one opening a substitution that never
			// closes, and bash answers a syntax error and runs nothing. There
			// is nothing for the guard to be right or wrong about there.
			if !bashParses(t, bash, command) {
				unparsed = append(unparsed, w.what+", "+payload)
				continue
			}
			exempt := runsTheEngine(command)
			wrote := bashWroteAFile(t, bash, command)
			driven++
			if exempt == wrote {
				t.Errorf("%s, %q: the guard exempts it %v and bash wrote a file %v",
					w.what, command, exempt, wrote)
			}
		}
	}
	// EVERY ROW IS ACCOUNTED FOR: driven, or refused by bash before it ran.
	//
	// THE CLAUSE HERE BEFORE COULD NOT FIRE. It read driven < wrappers*payloads
	// - unparsed, and every turn of the loop adds one to exactly one of the two,
	// so the two sides were the same number by construction. It read as a
	// coverage guard and only the literal beside it did any work.
	rows := len(wrappers) * len(payloads)
	if driven+len(unparsed) != rows {
		t.Fatalf("%d driven and %d unparsed of %d rows, so a row went nowhere",
			driven, len(unparsed), rows)
	}
	// AND THE ALPHABET IS THE SIZE IT WAS MEASURED AT. A wrapper or a payload
	// taken out shrinks the product with it, so the row count cannot notice one
	// going missing. These two floors are what notices.
	if len(wrappers) < theWrappersMeasured || len(payloads) < thePayloadsMeasured {
		t.Fatalf("the alphabet is %d wrappers by %d payloads, and it was measured at %d by %d",
			len(wrappers), len(payloads), theWrappersMeasured, thePayloadsMeasured)
	}
	// AND BASH REFUSES EXACTLY THE SHAPES THAT CANNOT PARSE. Two can, both
	// after the escape character: a backslashed backtick leaves the next one
	// opening a substitution that never closes, and a backslashed dollar leaves
	// a bare bracket where bash wants a word. A third refusal is a row nobody
	// meant to write, and a second driven row here is bash reading it anew.
	if len(unparsed) != theUnparsableRows {
		t.Fatalf("bash would not parse %d rows, and %d shapes here cannot parse: %v",
			len(unparsed), theUnparsableRows, unparsed)
	}
}

// The alphabet as it was measured, so a row quietly leaving it is caught.
const (
	theWrappersMeasured = 6
	thePayloadsMeasured = 7
	theUnparsableRows   = 2
)

// bashParses says whether bash reads this command as a command at all, without
// running it. That is bash's own -n.
func bashParses(t *testing.T, bash, command string) bool {
	t.Helper()
	return exec.Command(bash, "-n", "-c", command).Run() == nil
}

// bashWroteAFile runs one command under bash in a folder of its own and answers
// whether the payload's file is there afterwards.
//
// THE ENGINE IS A STUB THAT DOES NOTHING, because what is under test is what
// bash does around it. It answers nought and writes nothing, so a file in that
// folder came from the command's own punctuation.
func bashWroteAFile(t *testing.T, bash, command string) bool {
	t.Helper()
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "se"), []byte("#!/bin/sh\nexit 0\n"), 0o755); err != nil {
		t.Fatal(err)
	}
	// THE MACHINE'S OWN PATH IS KEPT, with the stub's folder in front of it. A
	// PATH holding the folder alone hides touch, and then bash writes nothing
	// whatever the command says and every row agrees with a guard that is wrong.
	cmd := exec.Command(bash, "-c", command)
	cmd.Dir = dir
	cmd.Env = append(os.Environ(), "PATH="+dir+string(os.PathListSeparator)+os.Getenv("PATH"))
	_ = cmd.Run() // a syntax error is bash writing nothing, which is an answer
	_, err := os.Stat(filepath.Join(dir, "M"))
	return err == nil
}

// theShippedSource answers this package's own files, tests left out. A test
// keeps the old two-pass reading on purpose, as the thing the walk is measured
// against, so reading the tests would call that reading a second parse.
func theShippedSource(t *testing.T) []string {
	t.Helper()
	entries, err := os.ReadDir(".")
	if err != nil {
		t.Fatal(err)
	}
	var names []string
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".go") && !strings.HasSuffix(e.Name(), "_test.go") {
			names = append(names, e.Name())
		}
	}
	if len(names) < 50 {
		t.Fatalf("the walk found %d source files, so it is not reading the engine", len(names))
	}
	return names
}

// answersThePair says whether a function answers the two readings of a command,
// which is the walk this token is about.
func answersThePair(fn *ast.FuncDecl) bool {
	if fn.Type.Results == nil {
		return false
	}
	var named []string
	for _, res := range fn.Type.Results.List {
		id, ok := res.Type.(*ast.Ident)
		if !ok || id.Name != "string" {
			return false
		}
		for _, n := range res.Names {
			named = append(named, n.Name)
		}
	}
	return len(named) == 2 && named[0] == "separators" && named[1] == "substitutions"
}

// namesThePair says whether an assignment takes the two readings.
func namesThePair(lhs []ast.Expr) bool {
	for _, e := range lhs {
		if id, ok := e.(*ast.Ident); ok && (id.Name == "separators" || id.Name == "substitutions") {
			return true
		}
	}
	return false
}

// isCallOf says whether an expression is a call of this function by name.
func isCallOf(e ast.Expr, name string) bool {
	call, ok := e.(*ast.CallExpr)
	if !ok {
		return false
	}
	id, ok := call.Fun.(*ast.Ident)
	return ok && id.Name == name
}
