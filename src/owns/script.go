// The JS walk: a scan past comments, strings, templates and regular
// expressions into tokens, and a read of each owned name off them.
// [[spec/design_output/doors#nothing-walks-around-a-door]]
package owns

import (
	"sort"
	"strings"

	"quackitect/src/yaml"
)

// The kinds a token takes. [[spec/design_output/doors#nothing-walks-around-a-door]]
const (
	word   = 'w'
	mark   = 'p'
	quoted = 's'
	number = 'n'
	nodeAt = "node:"
	newAt  = "new "
	// The token before a global object, three back from the global it reaches, and a bare constructor's closing parenthesis, three past new. [[spec/design_output/doors#nothing-walks-around-a-door]]
	pastOwner = 3
	closedAt  = 3
)

// The words after which a slash opens a regular expression. [[spec/design_output/doors#nothing-walks-around-a-door]]
var beforeRegex = map[string]bool{"return": true, "typeof": true, "instanceof": true, "in": true, "of": true, "new": true, "delete": true, "void": true, "throw": true, "case": true, "do": true, "else": true, "yield": true, "await": true}

// The globals naming the global object, through which a global is reached as a member. [[spec/design_output/doors#nothing-walks-around-a-door]]
var globalObjects = map[string]bool{"globalThis": true, "window": true, "self": true, "global": true}

// The words declaring a local, which shadows a global of its name. [[spec/design_output/doors#nothing-walks-around-a-door]]
var declaring = map[string]bool{"const": true, "let": true, "var": true, "function": true, "class": true}

type tok struct {
	kind   byte
	text   string
	line   int
	column int
}

// The scanner's place in the text, and the tokens it has read. [[spec/design_output/doors#nothing-walks-around-a-door]]
type scanner struct {
	text   string
	at     int
	line   int
	start  int
	depth  int
	holes  []int
	tokens []tok
}

// Moves to the offset, counting the lines it passes. [[spec/design_output/doors#nothing-walks-around-a-door]]
func (one *scanner) to(next int) {
	if next > len(one.text) {
		next = len(one.text)
	}
	for ; one.at < next; one.at++ {
		if one.text[one.at] == '\n' {
			one.line++
			one.start = one.at + 1
		}
	}
}

func (one *scanner) emit(kind byte, text string, from, line, start int) {
	one.tokens = append(one.tokens, tok{kind: kind, text: text, line: line, column: from - start + 1})
}

// Whether a slash here opens a regular expression, off the token before it. [[spec/design_output/doors#nothing-walks-around-a-door]]
func (one *scanner) regexHere() bool {
	if len(one.tokens) == 0 {
		return true
	}
	last := one.tokens[len(one.tokens)-1]
	switch last.kind {
	case word:
		return beforeRegex[last.text]
	case mark:
		return last.text != ")" && last.text != "]" && last.text != "}"
	}
	return false
}

// Scans a template from past its opening backtick or a closing brace, to its end or its next hole. [[spec/design_output/doors#nothing-walks-around-a-door]]
func (one *scanner) template() {
	for at := one.at; at < len(one.text); at++ {
		switch {
		case one.text[at] == '\\':
			at++
		case one.text[at] == '`':
			one.to(at + 1)
			return
		case one.text[at] == '$' && at+1 < len(one.text) && one.text[at+1] == '{':
			one.to(at + 2)
			one.holes = append(one.holes, one.depth)
			return
		}
	}
	one.to(len(one.text))
}

// Scans a quoted string, and keeps its text. [[spec/design_output/doors#nothing-walks-around-a-door]]
func (one *scanner) quoted(quote byte) {
	from, line, start := one.at, one.line, one.start
	var said strings.Builder
	at := one.at + 1
	for ; at < len(one.text) && one.text[at] != quote && one.text[at] != '\n'; at++ {
		if one.text[at] == '\\' && at+1 < len(one.text) {
			at++
		}
		said.WriteByte(one.text[at])
	}
	one.to(at + 1)
	one.emit(quoted, said.String(), from, line, start)
}

// Scans a regular expression, or answers false where the line ends inside it. [[spec/design_output/doors#nothing-walks-around-a-door]]
func (one *scanner) regex() bool {
	class := false
	for at := one.at + 1; at < len(one.text); at++ {
		switch one.text[at] {
		case '\n':
			return false
		case '\\':
			at++
		case '[':
			class = true
		case ']':
			class = false
		case '/':
			if class {
				continue
			}
			for at++; at < len(one.text) && wordByte(one.text[at]); at++ {
			}
			one.emit(quoted, "", one.at, one.line, one.start)
			one.to(at)
			return true
		}
	}
	return false
}

func wordByte(char byte) bool {
	return char == '_' || char == '$' || char >= 'a' && char <= 'z' || char >= 'A' && char <= 'Z' || char >= '0' && char <= '9' || char >= 0x80
}

// The tokens of a script, past its comments. [[spec/design_output/doors#nothing-walks-around-a-door]]
func scan(text string) []tok {
	one := &scanner{text: text, line: 1}
	for one.at < len(text) {
		char := text[one.at]
		next := byte(0)
		if one.at+1 < len(text) {
			next = text[one.at+1]
		}
		switch {
		case char == ' ' || char == '\t' || char == '\r' || char == '\n':
			one.to(one.at + 1)
		case char == '/' && next == '/':
			end := strings.IndexByte(text[one.at:], '\n')
			if end < 0 {
				end = len(text) - one.at
			}
			one.to(one.at + end)
		case char == '/' && next == '*':
			end := strings.Index(text[one.at+2:], "*/")
			if end < 0 {
				one.to(len(text))
			} else {
				one.to(one.at + 2 + end + 2)
			}
		case char == '"' || char == '\'':
			one.quoted(char)
		case char == '`':
			one.emit(quoted, "", one.at, one.line, one.start)
			one.to(one.at + 1)
			one.template()
		case char == '}' && len(one.holes) > 0 && one.holes[len(one.holes)-1] == one.depth:
			one.holes = one.holes[:len(one.holes)-1]
			one.to(one.at + 1)
			one.template()
		case char == '/' && one.regexHere() && one.regex():
		case wordByte(char) && (char < '0' || char > '9'):
			from := one.at
			end := from
			for end < len(text) && wordByte(text[end]) {
				end++
			}
			one.emit(word, text[from:end], from, one.line, one.start)
			one.to(end)
		case char >= '0' && char <= '9':
			from := one.at
			end := from
			for end < len(text) && (wordByte(text[end]) || text[end] == '.') {
				end++
			}
			one.emit(number, text[from:end], from, one.line, one.start)
			one.to(end)
		default:
			switch char {
			case '{':
				one.depth++
			case '}':
				one.depth--
			}
			one.emit(mark, string(char), one.at, one.line, one.start)
			one.to(one.at + 1)
		}
	}
	return one.tokens
}

// The token at an offset from k, or an empty one past either end. [[spec/design_output/doors#nothing-walks-around-a-door]]
func tokAt(tokens []tok, k int) tok {
	if k < 0 || k >= len(tokens) {
		return tok{}
	}
	return tokens[k]
}

func is(one tok, kind byte, text string) bool { return one.kind == kind && one.text == text }

// The owned module a specifier names: the module itself, or a module below it. [[spec/design_output/doors#a-door-declares-what-it-owns]]
func moduleOf(owned map[string]*claim, modules []string, specifier string) string {
	if owned[specifier] != nil {
		return specifier
	}
	for _, one := range modules {
		if strings.HasPrefix(specifier, one+"/") {
			return one
		}
	}
	return ""
}

// The walks of a script: a node: module it imports, a global or a member of one it reads, and a constructor it calls bare. [[spec/design_output/doors#nothing-walks-around-a-door]]
func jsWalks(at, text string, owned map[string]*claim) []Walk {
	if len(owned) == 0 {
		return nil
	}
	modules := []string{}
	for name := range owned {
		if strings.HasPrefix(name, nodeAt) {
			modules = append(modules, name)
		}
	}
	sort.Strings(modules)
	lines := yaml.SplitLines(text)
	tokens := scan(text)
	var out []Walk
	walk := func(where tok, name string) {
		if one := owned[name]; one != nil && !one.held {
			out = append(out, walkAt(at, lines, where.line, where.column, name, one))
		}
	}
	statement := -1
	for k, one := range tokens {
		prev, next := tokAt(tokens, k-1), tokAt(tokens, k+1)
		switch one.kind {
		case quoted:
			name := moduleOf(owned, modules, one.text)
			if name == "" {
				continue
			}
			switch {
			case is(prev, word, "from") && statement >= 0:
				walk(tokens[statement], name)
			case is(prev, word, "from") || is(prev, word, "import"):
				walk(tokAt(tokens, k-1), name)
			case is(prev, mark, "(") && (is(tokAt(tokens, k-2), word, "import") || is(tokAt(tokens, k-2), word, "require")):
				walk(tokAt(tokens, k-2), name)
			}
		case word:
			if (one.text == "import" || one.text == "export") && !is(prev, mark, ".") {
				statement = k
			}
			if one.text == "new" && next.kind == word && !is(tokAt(tokens, k+2), mark, ".") {
				bare := !is(tokAt(tokens, k+2), mark, "(") || is(tokAt(tokens, k+closedAt), mark, ")")
				if bare {
					walk(one, newAt+next.text+"()")
				}
				continue
			}
			if is(prev, word, "new") || declaring[prev.text] && prev.kind == word {
				continue
			}
			if is(prev, mark, ".") {
				owner := tokAt(tokens, k-2)
				if owner.kind != word || !globalObjects[owner.text] || is(tokAt(tokens, k-pastOwner), mark, ".") {
					continue
				}
			}
			if is(next, mark, ":") && (is(prev, mark, "{") || is(prev, mark, ",")) {
				continue
			}
			if is(next, mark, ".") && tokAt(tokens, k+2).kind == word {
				if member := one.text + "." + tokAt(tokens, k+2).text; owned[member] != nil {
					walk(one, member)
					continue
				}
			}
			walk(one, one.text)
		}
	}
	return out
}
