package main

import (
	"strings"
	"testing"
)

// THE STRIPPER THAT COULD NOT SEE A LIVE SUBSTITUTION, kept here as the thing
// the current walk is measured against.
//
// It removed single-quoted and double-quoted spans alike. Bash expands $( ) and
// a backtick pair INSIDE double quotes, so everything the shell would have run
// there was invisible to the only scan hunting for them.
//
// IT IS A COPY AND NOT THE GUARD. The defect is pinned in the test rather than
// put back into hook.go, so this check earns its red without the shipped parser
// ever holding the hole.
func theStripperThatDemotedTheDoubleQuote(command string) (separators, substitutions string) {
	var sep, sub strings.Builder
	quote := rune(0)
	for _, r := range command {
		switch {
		case quote != 0:
			if r == quote {
				quote = 0
			}
		case r == '\'' || r == '"':
			quote = r
			sep.WriteRune(' ')
			sub.WriteRune(' ')
		default:
			sep.WriteRune(r)
			sub.WriteRune(r)
		}
	}
	return sep.String(), sub.String()
}

// A DOUBLE-QUOTED SUBSTITUTION IS LIVE, AND THE WALK HAS TO HAND IT TO THE SCAN.
//
// This is the criterion driven through both parsers at once: the old stripper
// hands the substitution scan a string with nothing in it to find, and the
// current walk hands it the substitution bash would have run. A change that put
// the old reading back would make the second half of every row fail.
func TestTheWalkKeepsDoubleQuotedSubstitutionsLive(t *testing.T) {
	t.Parallel()
	const lead = ".bin/se pull --actor x "
	for _, one := range []struct{ what, arg, live string }{
		{"a substitution in double quotes", `"$(touch M)"`, "$("},
		{"backticks in double quotes", "\"`touch M`\"", "`"},
		{"an apostrophe before a substitution", `"it's $(touch M) here"`, "$("},
	} {
		_, wasBlind := theStripperThatDemotedTheDoubleQuote(lead + one.arg)
		if strings.Contains(wasBlind, one.live) {
			t.Errorf("%s: the old stripper is supposed to be blind to this, and this "+
				"check measures the walk against it, so it now measures nothing: %s",
				one.what, lead+one.arg)
		}
		_, sees := theQuotings(lead + one.arg)
		if !strings.Contains(sees, one.live) {
			t.Errorf("%s: bash would run this and the substitution scan is handed a "+
				"string with no %s in it, so the construct is invisible to the only "+
				"scan hunting it: %s", one.what, one.live, lead+one.arg)
		}
		if runsTheEngine(lead + one.arg) {
			t.Errorf("%s: this runs another program and was taken as the engine "+
				"alone: %s", one.what, lead+one.arg)
		}
	}
}

// AND THE WRITE GATE NO LONGER ASKS THE PARSER AT ALL.
//
// The exception this parser once guarded is gone: a shell carries no way to
// name a token, so Bash is refused whatever it says and whatever it holds. That
// is why the criterion "a double-quoted substitution meets the write gate"
// cannot be made red by any change to the quoting walk -- it is true of every
// command, including the harmless one.
//
// SO THE PAIR IS THE POINT. The harmless twin is refused beside the dangerous
// one, and a re-added exception would show up here as the first row passing the
// gate while the second still meets it.
func TestTheWriteGateKeepsNoEngineException(t *testing.T) {
	t.Parallel()
	r := aTreeWithOneStep(t)
	for _, one := range []struct{ what, command string }{
		{"a double-quoted substitution", `.bin/se pull --actor x "$(touch M)"`},
		{"a bare substitution", `.bin/se pull --actor x $(touch M)`},
		{"the engine and nothing else", `.bin/se pull --actor x`},
	} {
		why, refused := WriteNeedsAToken(r, "worker-x", "Bash", "")
		if !refused {
			t.Errorf("%s: a shell command was let past the write gate, so a write "+
				"through it says which work it is nowhere: %s", one.what, one.command)
		}
		if !strings.Contains(why, "se run") {
			t.Errorf("%s: the refusal does not name the verb that takes the token, "+
				"so it is a wall rather than a menu: %s", one.what, why)
		}
	}
}
