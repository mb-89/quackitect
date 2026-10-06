// The comments of a code file, which a token rule reads alone: each comment
// in place with its markers blanked, and a run of line comments at one column
// joined, as Vale's tree-sitter pass joins them.
// [[spec/design_output/rules#the-text-model]]
package rules

import "strings"

const (
	scopeLineComment  = "text.comment.line"
	scopeBlockComment = "text.comment.block"
	regexOpeners      = "(,=:[!&|?{};+-*%<>~^"
	goExt             = ".go"
)

// The extensions read as code. [[spec/design_output/rules#the-text-model]]
var codeExts = map[string]bool{goExt: true, ".js": true, ".mjs": true, ".cjs": true, ".jsx": true, ".ts": true, ".tsx": true}

// One comment: where it stands, its column, and whether it is a line comment. [[spec/design_output/rules#the-text-model]]
type comment struct {
	begin, end, line, column int
	lineComment              bool
}

// Every comment of a code file, past strings, template strings and regex literals. [[spec/design_output/rules#the-text-model]]
func commentsOf(text string, regexes bool) []comment {
	out := []comment{}
	line, lineStart := 1, 0
	last := byte(0)
	for at := 0; at < len(text); at++ {
		one := text[at]
		switch {
		case one == '\n':
			line, lineStart = line+1, at+1
			continue
		case strings.HasPrefix(text[at:], "//"):
			end := strings.IndexByte(text[at:], '\n')
			if end < 0 {
				end = len(text) - at
			}
			out = append(out, comment{begin: at, end: at + end, line: line, column: at - lineStart, lineComment: true})
			at += end - 1
		case strings.HasPrefix(text[at:], "/*"):
			end := strings.Index(text[at+2:], "*/")
			stop := len(text)
			if end >= 0 {
				stop = at + 2 + end + 2
			}
			out = append(out, comment{begin: at, end: stop, line: line, column: at - lineStart})
			line += strings.Count(text[at:stop], "\n")
			if nl := strings.LastIndexByte(text[at:stop], '\n'); nl >= 0 {
				lineStart = at + nl + 1
			}
			at = stop - 1
		case one == '"' || one == '\'' || one == '`' || (one == '/' && regexes && strings.IndexByte(regexOpeners, last) >= 0):
			stop := closing(text, at)
			line += strings.Count(text[at:stop], "\n")
			if nl := strings.LastIndexByte(text[at:stop], '\n'); nl >= 0 {
				lineStart = at + nl + 1
			}
			at = stop - 1
		}
		if one != ' ' && one != '\t' {
			last = text[at]
		}
	}
	return out
}

// The end of a literal opened at a quote, a backtick or a regex slash; a quote or a slash closes at its line's end. [[spec/design_output/rules#the-text-model]]
func closing(text string, at int) int {
	open := text[at]
	inClass := false
	for end := at + 1; end < len(text); end++ {
		switch one := text[end]; {
		case one == '\\' && open != '`':
			end++
		case one == '\\' && open == '`' && end+1 < len(text) && text[end+1] == '`':
			end++
		case one == '\n' && open != '`':
			return end
		case open == '/' && one == '[':
			inClass = true
		case open == '/' && one == ']':
			inClass = false
		case one == open && !inClass:
			return end + 1
		}
	}
	return len(text)
}

// The comments as blocks: line comments at one column on running lines joined, each with its markers blanked in place. [[spec/design_output/rules#the-text-model]]
func commentBlocks(ext, text string) []block {
	found := commentsOf(text, ext != goExt)
	out := []block{}
	for at := 0; at < len(found); at++ {
		one := found[at]
		scope := scopeBlockComment
		end := one.end
		if one.lineComment {
			scope = scopeLineComment
			for next := at + 1; next < len(found) && found[next].lineComment && found[next].line == found[next-1].line+1 && found[next].column == one.column; next++ {
				end, at = found[next].end, next
			}
		}
		out = append(out, block{text: blanked(text[one.begin:end]), scope: scope, offset: one.begin})
	}
	return out
}

// A comment with its markers and each continuation line's leading star turned to spaces, so its bytes keep their places. [[spec/design_output/rules#the-text-model]]
func blanked(said string) string {
	lines := strings.Split(said, "\n")
	for at, line := range lines {
		body := strings.TrimLeft(line, " \t")
		lead := len(line) - len(body)
		switch {
		case strings.HasPrefix(body, "//"):
			body = "  " + body[2:]
		case strings.HasPrefix(body, "/**"):
			body = "   " + body[3:]
		case strings.HasPrefix(body, "/*"):
			body = "  " + body[2:]
		case at > 0 && strings.HasPrefix(body, "*") && !strings.HasPrefix(body, "*/"):
			body = " " + body[1:]
		}
		if strings.HasSuffix(body, "*/") {
			body = body[:len(body)-2] + "  "
		}
		lines[at] = line[:lead] + body
	}
	return strings.Join(lines, "\n")
}
