package main

import (
	"fmt"
	"regexp"
	"strings"
)

// THE BURN DOWN BAR DRAWS WHAT IT WAS HANDED AND FORMS NO NUMBER OF ITS OWN.
//
// The owner's words: obviously, the engine should do these calculations. A
// number the editor forms is a number nothing checks, and this record has
// already been bitten by a count that lived only where it was displayed.
//
// FORMING MEANS MAKING ONE OF THE ANSWER'S NUMBERS OUT OF ANOTHER NUMBER rather
// than reading it out of the answer. So this refuses arithmetic, comparison and
// a hand to Math on those numbers inside any function the answer is passed to,
// and it names the number it found being made.
//
// IT TAKES THE SET OF NUMBERS FROM THE DECLARATION IN THE FILE BEING WRITTEN.
// The check this replaces carried a list of four names typed into it and gave up
// unless all four were declared, and the engine had already dropped rate along
// with the review flow that measured it. The editor was therefore pinned to
// declaring a field the answer never carries, and correcting the type would have
// failed the check. The rule is about whatever numbers the answer declares.
//
// IT ALSO REFUSES A DRAWER THAT NEVER TOUCHES THE ANSWER. The check this
// replaces asked only that the word says appeared somewhere in the body, and a
// comment says it. A bar gutted down to an empty span went past that, and that
// is a shape the bar was found in once already: it drew nothing at all before
// the engine answered, so a number arriving later had no node to land in and the
// counter stayed missing for the life of the page. Comments are blanked here
// before anything at all is looked for.

// The three things one byte of TypeScript can be. Text inside a quote is kept,
// because the numbers are drawn from inside a template literal, and only a
// comment is thrown away.
const (
	burnDownAsCode    byte = 0
	burnDownAsText    byte = 1
	burnDownAsComment byte = 2
)

var burnDownDeclared = regexp.MustCompile(`interface[ \t]+Burndown\b`)
var burnDownTypedAs = regexp.MustCompile(`Burndown\b`)
var burnDownNumberLine = regexp.MustCompile(`(?m)^[ \t]*([A-Za-z_$][A-Za-z0-9_$]*)[ \t]*\??[ \t]*:[ \t]*number[ \t]*;?[ \t]*\r?$`)

// burnDownHand is one function the answer is handed to. It arrives either whole,
// under a name, or taken apart into names by a destructuring.
type burnDownHand struct {
	drawer string
	object string
	taken  map[string]string
	body   string
}

func theBurnDownBarDrawsWhatItWasHanded(_ Roots, _ bool, rel, text string) error {
	if !strings.HasSuffix(rel, ".ts") || !strings.Contains(text, "Burndown") {
		return nil
	}
	cls := burnDownClasses(text)
	blank := burnDownBlanked(text, cls)
	numbers := burnDownNumbers(blank, cls)
	if len(numbers) == 0 {
		return nil // the answer is declared elsewhere, so this write does not carry the set
	}
	for _, h := range burnDownHands(blank, cls) {
		if err := h.holds(rel, numbers); err != nil {
			return err
		}
	}
	return nil
}

// holds asks the two questions of one drawer: whether a number was made, and
// whether the answer was drawn at all.
func (h burnDownHand) holds(rel string, numbers []string) error {
	type watch struct {
		said  string
		spans [][2]int
	}
	var watched []watch
	for _, n := range numbers {
		if h.object != "" {
			if s := burnDownReads(h.body, h.object, n); len(s) > 0 {
				watched = append(watched, watch{h.object + "." + n, s})
			}
			continue
		}
		local := h.taken[n]
		if local == "" {
			continue
		}
		if s := burnDownWords(h.body, local); len(s) > 0 {
			watched = append(watched, watch{local, s})
		}
	}
	for _, w := range watched {
		for _, sp := range w.spans {
			if !burnDownFormed(h.body, sp) && !burnDownHandedToMath(h.body, sp) {
				continue
			}
			return fmt.Errorf("%s forms %s inside %s rather than drawing it as it arrived: %q. "+
				"The engine computes every number in the burn down and builds the sentence as well, "+
				"so a number the bar works out from the others is a count that lives only where it "+
				"is displayed, and this record has already been bitten by one. "+
				"Print the field on its own, the way ${b.done} does inside a template, and when the "+
				"bar needs a number nobody sends yet, add the field to Burndown in "+
				"src/engine/burndown.go so TheBurndown computes it and a test can read it.",
				rel, w.said, h.drawer, burnDownAround(h.body, sp))
		}
	}
	if h.object != "" {
		if len(burnDownWords(h.body, h.object)) > 0 {
			return nil
		}
		return fmt.Errorf("%s hands %s the burn down answer as %s and the body never reads it, "+
			"so whatever it draws did not come from the engine. The bar was found empty this way "+
			"once already: it drew nothing before the engine had answered, there was no node for a "+
			"later number to land in, and the counter stayed missing for the life of the page. "+
			"A comment naming the answer does not count, because comments are blanked before this "+
			"looks. Draw a field off it, the way esc(b?.says ?? \"\") does, or drop the parameter.",
			rel, h.drawer, h.object)
	}
	if len(h.taken) == 0 {
		return nil
	}
	for _, local := range h.taken {
		if len(burnDownWords(h.body, local)) > 0 {
			return nil
		}
	}
	return fmt.Errorf("%s takes the burn down answer apart in %s and the body uses none of the "+
		"names it took off it, so whatever it draws did not come from the engine. The bar was "+
		"found empty this way once already, and a number arriving later had no node to land in. "+
		"A comment naming a field does not count, because comments are blanked before this looks. "+
		"Draw one of the names, or stop taking them off the answer.", rel, h.drawer)
}

// burnDownNumbers is the set the answer declares in this very file, in the order
// it declares them.
func burnDownNumbers(blank string, cls []byte) []string {
	loc := burnDownDeclared.FindStringIndex(blank)
	if loc == nil || cls[loc[0]] != burnDownAsCode {
		return nil
	}
	open := strings.IndexByte(blank[loc[0]:], '{')
	if open < 0 {
		return nil
	}
	block, ok := burnDownBlock(blank, cls, loc[0]+open)
	if !ok {
		return nil
	}
	var out []string
	for _, m := range burnDownNumberLine.FindAllStringSubmatch(block, -1) {
		out = append(out, m[1])
	}
	return out
}

// burnDownHands finds every function the answer is passed to, whatever it is
// called. The rule follows the type rather than the one name the bar happens to
// have today.
func burnDownHands(blank string, cls []byte) []burnDownHand {
	var out []burnDownHand
	for _, loc := range burnDownTypedAs.FindAllStringIndex(blank, -1) {
		at := loc[0]
		if cls[at] != burnDownAsCode {
			continue
		}
		colon := burnDownBack(blank, at-1)
		if colon < 0 || blank[colon] != ':' {
			continue // the declaration itself, or a mention that binds nothing
		}
		p := burnDownBack(blank, colon-1)
		if p < 0 {
			continue
		}
		if blank[p] == '?' {
			p = burnDownBack(blank, p-1)
			if p < 0 {
				continue
			}
		}
		h := burnDownHand{}
		start := 0
		if blank[p] == '}' {
			open := burnDownOpener(blank, cls, p)
			if open < 0 {
				continue
			}
			h.taken = burnDownTakenApart(blank[open+1 : p])
			start = open
		} else {
			end := p + 1
			for p >= 0 && burnDownIdentByte(blank[p]) {
				p--
			}
			if p+1 >= end {
				continue
			}
			h.object = blank[p+1 : end]
			start = p + 1
		}
		openParen := burnDownParamOpen(blank, cls, start-1)
		if openParen < 0 {
			continue // a type written somewhere other than a parameter list
		}
		closeParen := burnDownParamClose(blank, cls, openParen)
		if closeParen < 0 {
			continue
		}
		body, ok := burnDownBodyAfter(blank, cls, closeParen)
		if !ok {
			continue // a signature with no body, so there is nothing to judge
		}
		h.body = body
		h.drawer = burnDownDrawerName(blank, openParen)
		out = append(out, h)
	}
	return out
}

// burnDownTakenApart reads the names a destructuring binds, keeping which field
// each one came off.
func burnDownTakenApart(inside string) map[string]string {
	out := map[string]string{}
	for _, part := range strings.Split(inside, ",") {
		part = strings.TrimSpace(part)
		if at := strings.Index(part, "="); at >= 0 {
			part = strings.TrimSpace(part[:at])
		}
		field, local := part, part
		if at := strings.Index(part, ":"); at >= 0 {
			field = strings.TrimSpace(part[:at])
			local = strings.TrimSpace(part[at+1:])
		}
		if burnDownIsName(field) && burnDownIsName(local) {
			out[field] = local
		}
	}
	return out
}

// burnDownDrawerName is what to call the function in a refusal, so the reader is
// sent to the right place.
func burnDownDrawerName(blank string, open int) string {
	i := burnDownBack(blank, open-1)
	if i >= 0 && blank[i] == '=' {
		i = burnDownBack(blank, i-1)
	}
	end := i + 1
	for i >= 0 && burnDownIdentByte(blank[i]) {
		i--
	}
	name := ""
	if i+1 < end {
		name = blank[i+1 : end]
	}
	if name == "" || name == "function" || name == "async" {
		return "the function drawn from it"
	}
	return name
}

// burnDownBodyAfter takes what a function does, given where its parameter list
// closed. It knows a braced body and the one expression of an arrow, and it says
// no to a bare signature so an overload is not read as an empty bar.
func burnDownBodyAfter(blank string, cls []byte, close int) (string, bool) {
	for j := close + 1; j < len(blank) && j-close < 200; {
		c := blank[j]
		if burnDownSpaceByte(c) {
			j++
			continue
		}
		if c == '{' {
			body, _ := burnDownBlock(blank, cls, j)
			return body, true
		}
		if c == '=' && j+1 < len(blank) && blank[j+1] == '>' {
			k := burnDownFwd(blank, j+2)
			if k < len(blank) && blank[k] == '{' {
				body, _ := burnDownBlock(blank, cls, k)
				return body, true
			}
			return burnDownStatement(blank, cls, k), true
		}
		if burnDownIdentByte(c) || strings.IndexByte(":|&<>[],.", c) >= 0 {
			j++
			continue
		}
		return "", false
	}
	return "", false
}

// burnDownStatement is the one expression an arrow returns.
func burnDownStatement(blank string, cls []byte, from int) string {
	depth := 0
	for i := from; i < len(blank); i++ {
		if cls[i] != burnDownAsCode {
			continue
		}
		switch blank[i] {
		case '(', '[', '{':
			depth++
		case ')', ']', '}':
			if depth == 0 {
				return blank[from:i]
			}
			depth--
		case ';':
			if depth == 0 {
				return blank[from : i+1]
			}
		}
	}
	return blank[from:]
}

// burnDownBlock takes the braced block starting at open, counting only the
// braces that are code. A brace in a stylesheet inside a template literal is not
// a block, and counting it would have cut the body in the wrong place.
func burnDownBlock(src string, cls []byte, open int) (string, bool) {
	depth := 0
	for i := open; i < len(src); i++ {
		if cls[i] != burnDownAsCode {
			continue
		}
		switch src[i] {
		case '{':
			depth++
		case '}':
			depth--
			if depth == 0 {
				return src[open : i+1], true
			}
		}
	}
	return src[open:], false
}

// burnDownOpener walks back to the brace that opened the one at.
func burnDownOpener(src string, cls []byte, at int) int {
	depth := 0
	for i := at; i >= 0; i-- {
		if cls[i] != burnDownAsCode {
			continue
		}
		switch src[i] {
		case '}':
			depth++
		case '{':
			depth--
			if depth == 0 {
				return i
			}
		}
	}
	return -1
}

// burnDownParamOpen walks back from a parameter to the bracket that opened the
// list. A brace or a semicolon met on the way out means the type was written
// somewhere that is not a parameter list at all.
func burnDownParamOpen(src string, cls []byte, from int) int {
	parens, braces, brackets := 0, 0, 0
	for i := from; i >= 0 && from-i < 4000; i-- {
		if cls[i] != burnDownAsCode {
			continue
		}
		switch src[i] {
		case ')':
			parens++
		case '(':
			if parens == 0 {
				return i
			}
			parens--
		case '}':
			braces++
		case '{':
			if braces == 0 {
				return -1
			}
			braces--
		case ']':
			brackets++
		case '[':
			if brackets == 0 {
				return -1
			}
			brackets--
		case ';':
			if parens == 0 {
				return -1
			}
		}
	}
	return -1
}

// burnDownParamClose is where that list ends.
func burnDownParamClose(src string, cls []byte, open int) int {
	depth := 0
	for i := open; i < len(src); i++ {
		if cls[i] != burnDownAsCode {
			continue
		}
		switch src[i] {
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

// burnDownReads finds every place a field is read off the answer, allowing the
// question mark and the exclamation the editor writes between the two.
func burnDownReads(body, object, field string) [][2]int {
	var out [][2]int
	for _, w := range burnDownWords(body, object) {
		j := burnDownFwd(body, w[1])
		if j < len(body) && (body[j] == '?' || body[j] == '!') {
			j = burnDownFwd(body, j+1)
		}
		if j >= len(body) || body[j] != '.' {
			continue
		}
		j = burnDownFwd(body, j+1)
		if j+len(field) > len(body) || body[j:j+len(field)] != field {
			continue
		}
		if j+len(field) < len(body) && burnDownIdentByte(body[j+len(field)]) {
			continue
		}
		out = append(out, [2]int{w[0], j + len(field)})
	}
	return out
}

// burnDownWords finds a name standing on its own, so bd is not b and a property
// of something else is not the answer.
func burnDownWords(body, name string) [][2]int {
	var out [][2]int
	for at := 0; at+len(name) <= len(body); {
		i := strings.Index(body[at:], name)
		if i < 0 {
			break
		}
		i += at
		at = i + len(name)
		var before, after byte
		if i > 0 {
			before = body[i-1]
		}
		if at < len(body) {
			after = body[at]
		}
		if burnDownIdentByte(before) || before == '.' || burnDownIdentByte(after) {
			continue
		}
		out = append(out, [2]int{i, at})
	}
	return out
}

// burnDownFormed says whether the number at this span is being made rather than
// read. A number printed between two other numbers is what the bar is for, so
// the brace of a template interpolation stands between the value and the slash
// and nothing here is fooled by it.
func burnDownFormed(body string, sp [2]int) bool {
	if i := burnDownBack(body, sp[0]-1); i >= 0 {
		var before byte
		if i > 0 {
			before = body[i-1]
		}
		switch body[i] {
		case '+', '-', '*', '/', '%', '<':
			return true
		case '>':
			// AN ARROW IS NOT A COMPARISON. A body written as x => b.done
			// reads the number and makes nothing.
			if before != '=' {
				return true
			}
		case '=':
			// A LONE EQUALS IS AN ASSIGNMENT INTO SOMETHING ELSE, which is a
			// read. Doubled, or under a bang or an angle, it is a comparison.
			if before == '=' || before == '!' || before == '<' || before == '>' {
				return true
			}
		}
	}
	j := burnDownFwd(body, sp[1])
	if j < len(body) && body[j] == '!' && (j+1 >= len(body) || body[j+1] != '=') {
		j = burnDownFwd(body, j+1) // a non-null assertion is not arithmetic
	}
	if j >= len(body) {
		return false
	}
	switch body[j] {
	case '+', '-', '*', '/', '%', '<', '>', '=':
		return true
	case '!':
		return j+1 < len(body) && body[j+1] == '='
	}
	return false
}

// burnDownHandedToMath catches the rounding the operators miss. Math.round of a
// number the engine sent is still a number formed where nothing checks it.
func burnDownHandedToMath(body string, sp [2]int) bool {
	for _, w := range burnDownWords(body, "Math") {
		j := burnDownFwd(body, w[1])
		if j >= len(body) || body[j] != '.' {
			continue
		}
		j = burnDownFwd(body, j+1)
		for j < len(body) && burnDownIdentByte(body[j]) {
			j++
		}
		j = burnDownFwd(body, j)
		if j >= len(body) || body[j] != '(' {
			continue
		}
		if sp[0] > j && sp[1] <= burnDownCloser(body, j) {
			return true
		}
	}
	return false
}

// burnDownCloser is where the bracket at open is closed.
func burnDownCloser(body string, open int) int {
	depth := 0
	for i := open; i < len(body); i++ {
		switch body[i] {
		case '(':
			depth++
		case ')':
			depth--
			if depth == 0 {
				return i
			}
		}
	}
	return len(body)
}

// burnDownAround is the line the refusal quotes, so the writer sees the thing
// itself rather than a name for it.
func burnDownAround(body string, sp [2]int) string {
	from := sp[0] - 14
	if from < 0 {
		from = 0
	}
	to := sp[1] + 14
	if to > len(body) {
		to = len(body)
	}
	return strings.Join(strings.Fields(body[from:to]), " ")
}

// burnDownClasses reads the file once and says what each byte is. A rule about
// the bar cannot be met by a word in a comment, which is exactly how the check
// this replaces was passing.
func burnDownClasses(src string) []byte {
	out := make([]byte, len(src))
	var open []byte // the quotes and interpolations we are inside, innermost last
	for i := 0; i < len(src); {
		c := src[i]
		if len(open) == 0 || open[len(open)-1] == '{' {
			if c == '/' && i+1 < len(src) && src[i+1] == '/' {
				for i < len(src) && src[i] != '\n' {
					out[i] = burnDownAsComment
					i++
				}
				continue
			}
			if c == '/' && i+1 < len(src) && src[i+1] == '*' {
				out[i], out[i+1] = burnDownAsComment, burnDownAsComment
				i += 2
				for i < len(src) {
					out[i] = burnDownAsComment
					if src[i] == '*' && i+1 < len(src) && src[i+1] == '/' {
						out[i+1] = burnDownAsComment
						i += 2
						break
					}
					i++
				}
				continue
			}
			out[i] = burnDownAsCode
			switch c {
			case '"', '\'', '`':
				open = append(open, c)
			case '{':
				if len(open) > 0 {
					open = append(open, '{')
				}
			case '}':
				if len(open) > 0 && open[len(open)-1] == '{' {
					open = open[:len(open)-1]
				}
			}
			i++
			continue
		}
		q := open[len(open)-1]
		out[i] = burnDownAsText
		if c == '\\' && i+1 < len(src) {
			out[i+1] = burnDownAsText
			i += 2
			continue
		}
		if c == q {
			open = open[:len(open)-1]
			i++
			continue
		}
		if q == '`' && c == '$' && i+1 < len(src) && src[i+1] == '{' {
			out[i+1] = burnDownAsCode
			open = append(open, '{')
			i += 2
			continue
		}
		if c == '\n' && q != '`' {
			// A PLAIN QUOTE THAT NEVER CLOSED ENDS AT THE LINE, so one stray
			// apostrophe does not swallow the rest of the file. A template is
			// allowed to run over lines, which is how the bar is drawn.
			open = open[:len(open)-1]
			i++
			continue
		}
		i++
	}
	return out
}

// burnDownBlanked wipes the comments and leaves everything else where it was, so
// every offset still points at the same byte of the file.
func burnDownBlanked(src string, cls []byte) string {
	b := []byte(src)
	for i := range b {
		if cls[i] == burnDownAsComment && b[i] != '\n' {
			b[i] = ' '
		}
	}
	return string(b)
}

func burnDownIdentByte(c byte) bool {
	return c == '_' || c == '$' || (c >= '0' && c <= '9') || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')
}

func burnDownSpaceByte(c byte) bool {
	return c == ' ' || c == '\t' || c == '\r' || c == '\n'
}

func burnDownIsName(s string) bool {
	if s == "" || (s[0] >= '0' && s[0] <= '9') {
		return false
	}
	for i := 0; i < len(s); i++ {
		if !burnDownIdentByte(s[i]) {
			return false
		}
	}
	return true
}

func burnDownBack(s string, i int) int {
	for i >= 0 && burnDownSpaceByte(s[i]) {
		i--
	}
	return i
}

func burnDownFwd(s string, i int) int {
	for i < len(s) && burnDownSpaceByte(s[i]) {
		i++
	}
	return i
}
