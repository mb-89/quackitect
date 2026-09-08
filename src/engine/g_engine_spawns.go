package main

import (
	"fmt"
	"regexp"
	"strings"
)

// EVERY PLACE THE EXTENSION STARTS THE ENGINE TAKES ITS ARGUMENTS FROM
// engineargs.ts, AND ONLY --work MAY BE WRITTEN AT THE CALL SITE.
//
// THE INCIDENT. A claim that opens with the word every was guarded by a check
// whose entry point was the module the work had just created. That check drove
// nineteen calls through seventeen builders against the real binary, and it was
// thorough about the module and silent about everything else: seven of the eight
// argument lists the extension sends the engine were still written as literals at
// the call site, and no defect in any of them could reach a reader that only ever
// imports engineargs.ts. Later rounds bought one shape each. A start whose
// arguments were a bare name, then two quote characters, then a variable and a
// concatenation, then a flag held one hop away inside an object.
//
// SO THIS DOOR COUNTS FROM THE PRODUCING SIDE, in the file the defect is written
// in, and it refuses by default. An element passes because it matches one of the
// four shapes below and for no other reason, so a shape nobody has thought of is
// refused before it is written.
//
//	...builder(...)   a spread of a call to a builder
//	...name           a spread of somebody else's array, forwarded by a wrapper
//	"--work"          the one flag a call site may write, however quoted
//	name, a.b         a value that carries no flag of its own
//
// --work IS THE EXCEPTION BECAUSE THE CALLER IS THE ONLY THING THAT KNOWS THE
// FOLDER, and it cannot drift quietly: the engine stops working rather than
// minting nothing.
//
// WHAT IT DOES NOT ASK is whether engineargs actually exports the builder that is
// spread, or whether every builder is reached from somewhere. A door sees the one
// file being written and those answers live in another file, so the battery keeps
// that half.
func aStartOfTheEngineWritingItsOwnFlags(_ Roots, _ bool, rel, text string) error {
	if !strings.HasPrefix(rel, "src/extension/") || !strings.HasSuffix(rel, ".ts") {
		return nil
	}
	starters := theEngineStarters(text)
	if len(starters) == 0 {
		if !strings.Contains(text, "child_process") {
			return nil
		}
		return fmt.Errorf("%s reaches node:child_process and binds no starter this door can read. "+
			"A namespace import leaves every start in the file invisible to the reader that holds "+
			"argument lists to src/extension/engineargs.ts, and a file nothing can read is worse "+
			"than a file that fails: no count, no failure and no output. Bind what it uses with a "+
			"braced import, as import { spawn } from \"node:child_process\", and call the bound "+
			"name.", rel)
	}
	for _, call := range theStartCalls(starters, text) {
		before := text[:call[0]]
		where := fmt.Sprintf("%s:%d", rel, strings.Count(before, "\n")+1)
		params := theParametersAround(before)
		args, ok := theArgumentsOfAStart(text, call[1])
		if !ok || len(args) < 2 {
			return fmt.Errorf("%s starts the engine and this door cannot read the call. A start "+
				"nothing can read is a start whose flags nothing is holding against the flags the "+
				"engine has, which is how seven literal argument lists sat at call sites under a "+
				"green check. Write the call with a name as its first argument and an array, or the "+
				"name of one, as its second.", where)
		}
		list := strings.TrimSpace(args[1])
		if !strings.HasPrefix(list, "[") {
			if !aPlainIdentifierInAStart.MatchString(list) {
				return fmt.Errorf("%s starts the engine with %s as its arguments, and this door "+
					"cannot read that. Flags nothing can read are flags nothing is checking. Write "+
					"an array, or the name of one bound just above the call.", where, list)
			}
			if params[list] {
				continue // a wrapper forwarding its own parameter is the door, not a call through it
			}
			value, found := theArrayNamed(list, before)
			if !found {
				return fmt.Errorf("%s starts the engine with %s, and nothing above the call gives "+
					"that name an array this door can read. A start nobody can follow to its "+
					"arguments is checked by nothing at all. Bind the array above the call with "+
					"const, spreading a builder from src/extension/engineargs.ts.", where, list)
			}
			list = value
		}
		for _, el := range theElementsOf(list) {
			one := strings.TrimSpace(el)
			if one == "" {
				continue
			}
			why := whatAStartElementWrites(one, before, text, params)
			if why == "" {
				continue
			}
			return fmt.Errorf("%s starts the engine and %s. Every argument list the extension "+
				"sends the engine is built in src/extension/engineargs.ts, and only --work belongs "+
				"at a call site, because a flag written here is read against nothing: that is how "+
				"seven of eight lists stayed literals while the check over them entered through the "+
				"module and passed. Export a builder from src/extension/engineargs.ts and spread it "+
				"here, as [...theBuilder(), \"--work\", work].", where, why)
		}
	}
	return nil
}

// THE NAMES THIS FILE COULD START A CHILD WITH. The set is asked of the file
// rather than assumed to be the word spawn, because this extension already writes
// import { spawn as spawnRaw } and a rename would otherwise walk past every
// reader at once.
func theEngineStarters(text string) []string {
	seen := map[string]bool{}
	out := []string{}
	add := func(name string) {
		if name != "" && !seen[name] {
			seen[name] = true
			out = append(out, name)
		}
	}
	for _, imp := range aChildProcessImport.FindAllStringSubmatch(text, -1) {
		for _, piece := range strings.Split(imp[1], ",") {
			bound := aBoundStarter.FindStringSubmatch(strings.TrimSpace(piece))
			if bound == nil || !aStarterWord.MatchString(bound[1]) {
				continue
			}
			if bound[2] != "" {
				add(bound[2])
				continue
			}
			add(bound[1])
		}
	}
	// AND THE WRAPPER THAT FORWARDS TO ONE. This extension starts the engine
	// through a local function of its own, so the binding alone reads nothing. A
	// wrapper is a function whose first act is the call, because matching anything
	// looser pulls in every function that merely mentions the name.
	for _, name := range append([]string{}, out...) {
		forwards := regexp.MustCompile(`function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)[^{]*\{\s*return\s+` +
			regexp.QuoteMeta(name) + `\s*\(`)
		for _, m := range forwards.FindAllStringSubmatch(text, -1) {
			add(m[1])
		}
	}
	return out
}

// theStartCalls answers where each start is, as the index of the name and the
// index of the parenthesis after it. The declaration of a wrapper is not a call
// through it, and neither is a property read on some other object.
func theStartCalls(starters []string, text string) [][2]int {
	quoted := make([]string, 0, len(starters))
	for _, name := range starters {
		quoted = append(quoted, regexp.QuoteMeta(name))
	}
	pat := regexp.MustCompile(`\b(?:` + strings.Join(quoted, "|") + `)\s*\(`)
	out := [][2]int{}
	for _, loc := range pat.FindAllStringIndex(text, -1) {
		if loc[0] > 0 {
			if c := text[loc[0]-1]; c == '.' || c == '$' {
				continue
			}
		}
		if strings.HasSuffix(text[:loc[0]], "function ") {
			continue
		}
		out = append(out, [2]int{loc[0], loc[1] - 1})
	}
	return out
}

// theArgumentsOfAStart takes a call apart at the commas that are not inside
// something else, from the parenthesis that opens it. A call that never closes in
// what this can see is answered as unreadable rather than guessed at.
func theArgumentsOfAStart(text string, open int) ([]string, bool) {
	depth := 0
	quote := byte(0)
	start := open + 1
	out := []string{}
	for i := open; i < len(text); i++ {
		c := text[i]
		if quote != 0 {
			if c == '\\' {
				i++
			} else if c == quote {
				quote = 0
			}
			continue
		}
		switch c {
		case '"', '\'', '`':
			quote = c
		case '(', '[', '{':
			depth++
		case ')', ']', '}':
			depth--
			if depth == 0 && c == ')' {
				if aStatementInsideTheCall(text[open : i+1]) {
					return nil, false
				}
				return append(out, text[start:i]), true
			}
		case ',':
			if depth == 1 {
				out = append(out, text[start:i])
				start = i + 1
			}
		}
	}
	return nil, false
}

// theElementsOf takes an array literal apart the same way.
// aStatementInsideTheCall answers whether a statement ends between the
// parentheses this call was read from. A start written in a shape the reader
// cannot follow leaves the brackets unbalanced, the scan then closes on some
// later parenthesis, and what comes back is not the argument list anybody wrote.
// A start read wrong is a start nothing is checking, so it is answered as
// unreadable rather than judged on what the scan happened to reach.
func aStatementInsideTheCall(span string) bool {
	depth := 0
	quote := byte(0)
	for i := 0; i < len(span); i++ {
		c := span[i]
		if quote != 0 {
			if c == '\\' {
				i++
			} else if c == quote {
				quote = 0
			}
			continue
		}
		switch c {
		case '"', '\'', '`':
			quote = c
		case '(', '[', '{':
			depth++
		case ')', ']', '}':
			depth--
		case ';':
			if depth <= 1 {
				return true
			}
		}
	}
	return false
}

func theElementsOf(list string) []string {
	inside := strings.TrimSuffix(strings.TrimPrefix(strings.TrimSpace(list), "["), "]")
	out := []string{}
	depth := 0
	quote := byte(0)
	at := 0
	for i := 0; i < len(inside); i++ {
		c := inside[i]
		if quote != 0 {
			if c == '\\' {
				i++
			} else if c == quote {
				quote = 0
			}
			continue
		}
		switch c {
		case '"', '\'', '`':
			quote = c
		case '(', '[', '{':
			depth++
		case ')', ']', '}':
			depth--
		case ',':
			if depth == 0 {
				out = append(out, inside[at:i])
				at = i + 1
			}
		}
	}
	return append(out, inside[at:])
}

// theParametersAround answers the parameters of the function a call sits in. A
// wrapper forwarding one of its own parameters is the door every other call goes
// through, and that is read from where the call sits rather than guessed from the
// name being forwarded.
func theParametersAround(before string) map[string]bool {
	out := map[string]bool{}
	all := aFunctionHeadInAStart.FindAllStringSubmatch(before, -1)
	if len(all) == 0 {
		return out
	}
	for _, m := range aParameterNameInAStart.FindAllStringSubmatch(all[len(all)-1][1], -1) {
		out[m[1]] = true
	}
	return out
}

// theArrayNamed follows a name back to the array it was given. The nearest
// binding above the call is the one, because two call sites both bind a local
// called args and one map over the file would let the later answer for the
// earlier.
func theArrayNamed(name, before string) (string, bool) {
	value, ok := theValueGiven(name, before)
	if !ok || !strings.HasPrefix(value, "[") {
		return "", false
	}
	return value, true
}

// whatAStartElementWrites answers why one element of an argument list may not
// stand there, or the empty string when it may.
func whatAStartElementWrites(one, before, whole string, params map[string]bool) string {
	if m := aSpreadOfACall.FindStringSubmatch(one); m != nil {
		return ""
	} else if m = aSpreadOfAName.FindStringSubmatch(one); m != nil {
		if params[m[1]] {
			return ""
		}
		return "it spreads " + m[1] + ", an array this door cannot read, and only a wrapper " +
			"forwarding its own parameter may hand one on"
	}
	if strings.HasPrefix(one, "...") {
		return "it spreads something this door cannot read, " + one
	}
	if aWorkFlagInAStart.MatchString(one) {
		return ""
	}
	if m := aQuotedElementInAStart.FindStringSubmatch(one); m != nil {
		return "it writes " + m[1] + " at the call site"
	}
	if why := whatAStartNameHolds(one, before, whole, 0); why != "" {
		return why + ", so it cannot stand as a value the caller owns"
	}
	return ""
}

// whatAStartNameHolds follows a name, a property read or an index to the value it
// was given and answers what it found, or the empty string when it followed the
// binding to something it could read and found no flag.
//
// CLEAN IS EARNED, NOT ASSUMED. Nothing found is not the same answer as no flag,
// and a reader that returned one for the other let a property read whose value is
// a flag, a name pointing at another name, and a call returning a flag all
// through.
func whatAStartNameHolds(one, before, whole string, depth int) string {
	if depth > 5 {
		return "this door will not follow " + one + " any further"
	}
	name := aNameOrReadInAStart.FindStringSubmatch(one)
	if name == nil {
		return "this door cannot read " + one
	}
	value, ok := theValueGiven(name[1], before)
	if !ok {
		if strings.Contains(before, "const "+name[1]) || strings.Contains(before, "let "+name[1]) {
			return name[1] + " is given a bracket this door cannot follow to its end"
		}
		return "nothing above the call gives " + name[1] + " a value this door can read"
	}
	return whatAStartValueIs(value, before, whole, depth)
}

// whatAStartValueIs classifies what a name was given.
func whatAStartValueIs(was, before, whole string, depth int) string {
	// A QUOTED LITERAL OPENING WITH A DASH IS A FLAG, whole or in pieces.
	if held := aDashLiteralInAStart.FindStringSubmatch(was); held != nil {
		return held[1] + " reaches the call site through it"
	}
	// AN OBJECT OR AN ARRAY LITERAL IS READ WHOLE, WHICH MEANS THE NAMES IN IT ARE
	// FOLLOWED TOO. The reader this replaces claimed to read one whole and then
	// answered clean for anything opening with a bracket, so it saw only a flag
	// spelled out inside the literal and a flag one hop further in walked past it.
	if strings.HasPrefix(was, "{") || strings.HasPrefix(was, "[") {
		for _, m := range aValueInsideALiteral.FindAllStringSubmatch(was, -1) {
			said := whatAStartNameHolds(m[1], before, whole, depth+1)
			if strings.Contains(said, "reaches the call site") || strings.Contains(said, "comes back from") {
				return said
			}
		}
		return ""
	}
	// A NAME IS FOLLOWED, and so is a property read or an index through its object,
	// because the flag can be one more hop away in any of them.
	if onward := aNameOrReadInAStart.FindStringSubmatch(was); onward != nil {
		return whatAStartNameHolds(onward[1], before, whole, depth+1)
	}
	// A CALL IS FOLLOWED TO THE FUNCTION THIS FILE DECLARES, read over the whole
	// file rather than the text above the call, because the one that answers the
	// work root is declared below the starts that use it.
	if call := aCallInAStart.FindStringSubmatch(was); call != nil {
		body, found := theBodyOfInAStart(whole, call[1])
		if !found {
			return "nothing in this file declares " + call[1] + ", so this door cannot say what it answers"
		}
		if inside := aDashLiteralInAStart.FindStringSubmatch(body); inside != nil {
			return inside[1] + " comes back from " + call[1] + "()"
		}
		return ""
	}
	return "this door cannot read the value it was given, " + was
}

// theValueGiven answers the value the nearest binding above gives a name.
//
// THE WINDOW IS THE VALUE AND NOT THE LINE. A reader that captured to the first
// newline handed an object written over two lines on as the single character it
// opened with, and one character holds no flag, so a flag two lines down reached
// the call site with nothing failing.
func theValueGiven(name, before string) (string, bool) {
	opens, err := regexp.Compile(`\b(?:const|let|var)\s+` + regexp.QuoteMeta(name) + `\s*(?::[^=]*)?=\s*`)
	if err != nil {
		return "", false
	}
	all := opens.FindAllStringIndex(before, -1)
	if len(all) == 0 {
		return "", false
	}
	at := all[len(all)-1][1]
	rest := before[at:]
	if rest == "" {
		return "", false
	}
	open := rest[0]
	if open == '{' || open == '[' {
		shut := byte('}')
		if open == '[' {
			shut = ']'
		}
		depth := 0
		for i := 0; i < len(rest); i++ {
			if rest[i] == open {
				depth++
				continue
			}
			if rest[i] == shut {
				depth--
				if depth == 0 {
					return strings.TrimSpace(rest[:i+1]), true
				}
			}
		}
		// A BRACKET THAT NEVER CLOSES IN WHAT THIS CAN SEE IS UNREADABLE RATHER THAN
		// CLASSIFIED, because the whole class of defect here is a value judged on the
		// part of it that happened to fit in the window.
		return "", false
	}
	if end := strings.IndexAny(rest, ";\n"); end >= 0 {
		return strings.TrimSpace(rest[:end]), true
	}
	return strings.TrimSpace(rest), true
}

// theBodyOfInAStart answers a function's body, and false when the file declares
// none by that name.
func theBodyOfInAStart(text, name string) (string, bool) {
	head, err := regexp.Compile(`(?:^|\n)(?:async )?function ` + regexp.QuoteMeta(name) + `\s*\(`)
	if err != nil {
		return "", false
	}
	at := head.FindStringIndex(text)
	if at == nil {
		return "", false
	}
	open := strings.Index(text[at[0]:], "{")
	if open < 0 {
		return "", false
	}
	open += at[0]
	depth := 0
	for i := open; i < len(text); i++ {
		if text[i] == '{' {
			depth++
			continue
		}
		if text[i] == '}' {
			depth--
			if depth == 0 {
				return text[open : i+1], true
			}
		}
	}
	return text[open:], true
}

var (
	aChildProcessImport      = regexp.MustCompile(`import\s*\{([^}]*)\}\s*from\s*["']node:child_process["']`)
	aBoundStarter            = regexp.MustCompile(`^(\w+)(?:\s+as\s+(\w+))?$`)
	aStarterWord             = regexp.MustCompile(`^(?:spawn|spawnSync|exec|execFile|execSync|execFileSync|fork)$`)
	aPlainIdentifierInAStart = regexp.MustCompile(`^[A-Za-z_$][\w$]*$`)
	aFunctionHeadInAStart    = regexp.MustCompile(`(?:^|\n)(?:async )?function [A-Za-z_$][\w$]*\s*\(([^)]*)\)`)
	aParameterNameInAStart   = regexp.MustCompile(`(?:^|,)\s*([A-Za-z_$][\w$]*)`)
	aSpreadOfACall           = regexp.MustCompile(`^\.\.\.\s*([A-Za-z_$][\w$]*)\s*\(`)
	aSpreadOfAName           = regexp.MustCompile(`^\.\.\.\s*([A-Za-z_$][\w$]*)\s*$`)
	aWorkFlagInAStart        = regexp.MustCompile("^[\"'`]--work[\"'`]$")
	aQuotedElementInAStart   = regexp.MustCompile("^[\"'`]([^\"'`]*)[\"'`]$")
	aDashLiteralInAStart     = regexp.MustCompile("[\"'`](-[^\"'`]*)[\"'`]")
	aNameOrReadInAStart      = regexp.MustCompile(`^([A-Za-z_$][\w$]*)\s*(?:[.\[][^\]]*\]?)?$`)
	aCallInAStart            = regexp.MustCompile(`^([A-Za-z_$][\w$]*)\s*\(`)
	aValueInsideALiteral     = regexp.MustCompile(`(?:[:,\[{]|^)\s*([A-Za-z_$][\w$]*)\s*(?:[,}\]]|$)`)
)
