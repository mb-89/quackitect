package main

import (
	"fmt"
	"regexp"
	"strings"
)

// A DRAWING FILE NEVER SAYS A COLOUR OUT LOUD.
//
// The owner reported a white input four times, on four different controls, and
// each time the answer was to style that one control. That is a defect per
// control forever. A colour written into a page is a colour that is right in one
// theme and wrong in every other, and the whole point of taking the editor's
// look from the sidebar is that both take theirs from the host.
//
// SO A PROPERTY THAT PAINTS TAKES A THEME VARIABLE, AND THE VARIABLE TAKES A
// FALLBACK. An undefined variable with no fallback makes the whole declaration
// invalid at computed value time, and the control then draws whatever the
// browser draws, which is the white the owner kept reporting.
//
// THE FALLBACK HALF IS ASKED OF THE SHARED SHEET ALONE. That sheet is what every
// control in both pages takes, so it is where an undefined name costs a control
// its look. The pages hold hundreds of bare variables for their own furniture
// today, and a rule the tree already breaks everywhere is a wall rather than a
// door. The literal half is asked of every drawing file.
//
// THE CHECK THIS REPLACES LET THE ESCAPE GO ANYWHERE ON THE LINE. It skipped any
// line holding the words "not a theme colour" wherever they sat, so a
// declaration that carried them in a CSS string or in a class name was exempt
// without anybody deciding anything. Here the words have to sit in a comment on
// that line, which is what makes a deliberate colour a decision written down.
func aDrawingFileSaysNoColourOutLoud(_ Roots, _ bool, rel, text string) error {
	if !strings.HasPrefix(rel, "src/extension/") || !strings.HasSuffix(rel, ".ts") {
		return nil
	}
	for i, raw := range strings.Split(text, "\n") {
		line := strings.TrimRight(raw, "\r")
		if aCommentOpensTheLine(line) {
			continue
		}
		code, note := theCodeAndTheNote(line)
		if strings.Contains(strings.ToLower(note), "not a theme colour") {
			continue
		}
		for _, paint := range aPaintingProperty.FindAllStringSubmatch(code, -1) {
			at, prop, value := i+1, paint[1], strings.TrimSpace(paint[2])
			if said := aColourLiteral.FindString(withoutVarCalls(value)); said != "" {
				return fmt.Errorf("%s writes the colour %s into a painting property at line %d, in "+
					"%q. A colour written into a page is right in one theme and wrong in every "+
					"other, which is why the owner reported a white input four times on four "+
					"different controls and the answer each time was to style that one control. "+
					"Take the colour from the host instead, as %s: var(--vscode-input-background, "+
					"transparent), so the theme sets it and the fallback still draws something "+
					"where the host defines no such name. A colour that really is the same in "+
					"every theme says so in a comment on the line, with the words not a theme "+
					"colour.", rel, said, at, strings.TrimSpace(prop+": "+value), prop)
			}
			if rel != theSharedControlSheet {
				continue
			}
			if name, bare := aBareColourVariable(value); bare {
				return fmt.Errorf("%s takes %s from var(%s) at line %d and hands it no fallback. "+
					"An undefined variable makes the whole declaration invalid at computed value "+
					"time, so on a host that defines no such name the control draws whatever the "+
					"browser draws, which is the white input the owner reported four times. This "+
					"is the sheet every control in both pages takes, so one missing name costs "+
					"every control at once. Write %s: var(%s, transparent) or another fallback "+
					"the page can live with.", rel, prop, name, at, prop, name)
			}
		}
	}
	return nil
}

// THE SHEET BOTH PAGES EMBED. The pages draw their own furniture and are judged
// on literals alone, and this one is judged on fallbacks too.
const theSharedControlSheet = "src/extension/controls.ts"

// A PROPERTY THAT PAINTS THE CONTROL, read from the start of a line or from
// behind a bracket or a semicolon, so a property name that merely ends in one of
// these words is not mistaken for the word. A shadow is left out on purpose: it
// is a black at low opacity and it reads the same in every theme.
var aPaintingProperty = regexp.MustCompile(`(?:^|[;{])\s*(background-color|background|border-color|outline-color|accent-color|color|border|fill|stroke)\s*:\s*([^;}]*)`)

// A COLOUR SAID OUT LOUD. Everything here names one fixed colour, and a fixed
// colour is right in one theme and wrong in every other. The words that stand
// for something the host decides, such as transparent, inherit and currentColor,
// are not here.
var aColourLiteral = regexp.MustCompile(`#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\b(?:white|black|red|blue|green|grey|gray|yellow|orange|silver|navy)\b`)

// aCommentOpensTheLine answers whether the line is prose rather than a rule. A
// comment describing the defect is allowed to name the colour the defect drew.
func aCommentOpensTheLine(line string) bool {
	start := strings.TrimSpace(line)
	return strings.HasPrefix(start, "//") || strings.HasPrefix(start, "*") || strings.HasPrefix(start, "/*")
}

// theCodeAndTheNote cuts a line where its comment begins and answers both
// halves. THE COLON IN FRONT IS WHAT SAVES A LINK. A pair of slashes after a
// colon is the middle of a web address rather than the start of a comment, and
// cutting there would take a declaration apart for no reason.
func theCodeAndTheNote(line string) (string, string) {
	cut := strings.Index(line, "/*")
	for at := 0; at < len(line); {
		found := strings.Index(line[at:], "//")
		if found < 0 {
			break
		}
		found += at
		if found > 0 && line[found-1] == ':' {
			at = found + 2
			continue
		}
		if cut < 0 || found < cut {
			cut = found
		}
		break
	}
	if cut < 0 {
		return line, ""
	}
	return line[:cut], line[cut:]
}

// withoutVarCalls answers the value with every var call taken out of it, so what
// is left is what the page says on its own. A FALLBACK INSIDE A VAR CALL IS THE
// GOOD SHAPE, and counting it as a literal would refuse the very thing the rule
// asks for. The brackets are counted rather than scanned to the first one, which
// is where the check this replaces left a stray bracket behind on a nested call.
func withoutVarCalls(value string) string {
	out := value
	for {
		at := strings.Index(out, "var(")
		if at < 0 {
			return out
		}
		end := theVarCallEnd(out, at+3)
		if end < 0 {
			// The call runs past the end of the line, so what it holds is not on
			// this line to judge.
			return out[:at]
		}
		out = out[:at] + out[end+1:]
	}
}

// theVarCallEnd answers where the bracket opened at this index is closed, and
// minus one when the text runs out first.
func theVarCallEnd(s string, open int) int {
	depth := 0
	for i := open; i < len(s); i++ {
		switch s[i] {
		case '(':
			depth++
		case ')':
			depth--
			if depth == 0 {
				return i
			}
		}
	}
	return -1
}

// aBareColourVariable answers the variable a value takes its whole colour from
// when that value is one var call and the call carries no fallback. A value that
// holds more than the call, such as a border shorthand carrying a width and a
// style, is left to the rule about literals.
func aBareColourVariable(value string) (string, bool) {
	v := strings.TrimSpace(value)
	if !strings.HasPrefix(v, "var(") {
		return "", false
	}
	end := theVarCallEnd(v, 3)
	if end != len(v)-1 {
		return "", false
	}
	inner := v[4:end]
	if strings.Contains(inner, ",") {
		return "", false
	}
	return strings.TrimSpace(inner), true
}
