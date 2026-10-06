// A code file hands its comments alone to the token rules, each placed at its
// source column, past strings and regex literals.
// [[spec/design_output/rules#the-text-model]]
package rules

import "testing"

// The real Vale answered the hedge at 3:13-16 and 6:4-9 over this file, and no passive. [[spec/design_output/rules#the-text-model]]
func TestACodeFileHandsItsCommentsAloneToTheTokenRules(t *testing.T) {
	t.Parallel()
	found := loaded(t).Lint("a.go", "package a\n\n// The door just reads it, and the file was written by the engine.\nvar a = \"just very\"\n/* It is\n   really there. */\n")
	hedge := ofRule(found, "VoiceParagraph.Hedge")
	if len(hedge) != 2 || hedge[0].Line != 3 || hedge[0].Span != [2]int{13, 16} || hedge[1].Line != 6 || hedge[1].Span != [2]int{4, 9} {
		t.Errorf("the hedge answers %+v", hedge)
	}
	if passive := ofRule(found, "VoiceVale.Passive"); len(passive) > 0 {
		t.Errorf("a comment reads as a sentence: %+v", passive)
	}
}

func TestCommentsSkipStringsAndRegexLiterals(t *testing.T) {
	t.Parallel()
	text := "const a = \"// no\"; const b = /\\/\\/no/; // yes\nconst c = `/* no */`; /* also */\n"
	found := commentBlocks(".js", text)
	if len(found) != 2 || text[found[0].offset:found[0].offset+len(found[0].text)] != "// yes" || found[1].text != "   also   " {
		t.Errorf("the comments read %+v", found)
	}
}

func TestRunningLineCommentsJoinIntoOneBlock(t *testing.T) {
	t.Parallel()
	found := commentBlocks(".go", "// one\n// two\nx := 1 // three\n")
	if len(found) != 2 || found[0].text != "   one\n   two" || found[0].scope != scopeLineComment {
		t.Errorf("the comments read %+v", found)
	}
}
