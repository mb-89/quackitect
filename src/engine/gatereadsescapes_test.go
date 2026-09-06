package main

import "testing"

// A BACKSLASH ESCAPES THE QUOTE AFTER IT, AND THE GATE DID NOT READ IT.
//
// theQuotings walks the command in bash's own state machine, and every double
// quote ended a double-quoted span whatever stood before it. So an escaped
// quote closed the span in the gate's reading while bash keeps it open, and
// every character after it was read as syntax rather than as text.
//
// MEASURED on this box. se apply carrying a JSON payload was refused three
// times, once for a redirection, once for a second command and once for a
// newline. Each payload sat inside double quotes with its own quotes escaped,
// and not one of the three could write anything.
func TestAnEscapedQuoteDoesNotEndTheSpan(t *testing.T) {
	t.Parallel()
	// THE ENGINE ALONE, AND EVERY OPERATOR IN THEM IS TEXT.
	for _, c := range []string{
		// The reproduction: an se apply payload naming a closing tag.
		`se apply --on wk-1 --edits "[{\"file\":\"a.md\",\"old\":\"</detail>\",\"new\":\"x\"}]"`,
		// A script whose statements are parted inside the quoted argument.
		`se run --on wk-1 --command "python3 -c \"a = 1; b = 2\""`,
		// Prose that quotes somebody.
		`se --answer "he said \"stop\" and meant it"`,
		// A separator escaped outside quotes is a character and not a separator.
		`se --answer hello\;world`,
		// An escaped dollar is a literal dollar, so this substitutes nothing.
		`se work --detail "\$(cat notes.md)"`,
	} {
		if !runsTheEngine(c) {
			t.Errorf("this is the engine alone and the gate took it out: %s -- %s", c, whatDisqualified(c))
		}
	}
	// AND THE SPAN STILL CLOSES ON A QUOTE THAT IS NOT ESCAPED.
	for _, c := range []string{
		// The span closes on the second quote, so what follows is syntax.
		`se --answer "a\"b" > out.md`,
		// The backslash is itself escaped, so the quote after it closes the span.
		`se --answer "a \\" > out.md`,
		// And the plain cases hold as they did.
		`se --version > src/engine/gate.go`,
		`se query --list; touch notes.md`,
		`./RUNME.sh pull --help | head -40`,
		`se work --detail "$(cat notes.md)"`,
	} {
		if runsTheEngine(c) {
			t.Errorf("this is not the engine alone and the write gate was skipped for it: %s", c)
		}
	}
}
