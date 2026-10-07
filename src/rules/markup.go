// The markdown text model, ported off Vale 3.20.0 under its MIT licence: the
// front matter's strings, then goldmark's HTML walked block by block, each
// block placed in the source with code and markup masked out of it.
// [[spec/design_output/rules#the-text-model]]
package rules

import (
	"bytes"
	"net/url"
	"regexp"
	"strings"
	"unicode/utf8"

	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/extension"
	goldhtml "github.com/yuin/goldmark/renderer/html"
	"golang.org/x/net/html"
	goyaml "gopkg.in/yaml.v3"
)

const (
	maskCode     = '*'
	maskDone     = '@'
	locateWindow = 64 << 10
	frontFence   = "---"
	plainExt     = ".txt"
	scopeText    = "text"
	scopeHeading = "text.heading."
	scopeFront   = "text.frontmatter."
	scopeAlt     = "text.attr.alt"
	nestedDepth  = 3
)

var (
	goldMd = goldmark.New(
		goldmark.WithExtensions(extension.GFM, extension.Footnote),
		goldmark.WithRendererOptions(goldhtml.WithUnsafe()),
	)
	reExInfo      = regexp.MustCompile("`{3,}.+")
	reLinkRef     = regexp.MustCompile(`\]\[(?:[^]\n]+)\]`)
	reLinkDef     = regexp.MustCompile(`\[(?:[^]\n]+)\]:`)
	reNumericList = regexp.MustCompile(`(?m)^\d+\.`)
	reHeading     = regexp.MustCompile(`^h\d$`)
	skipTags      = []string{"script", "style", "pre", "figure", "noscript", "iframe"}
	skippedInline = []string{"tt", "code", "kbd"}
	inlineTags    = []string{"b", "big", "i", "small", "abbr", "acronym", "cite", "dfn", "em", "kbd", "strong", "a", "br", "img", "span", "sub", "sup", "code", "tt", "del"}
	voidTags      = []string{"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
	attrTags      = []string{"img", "a", "p", "script", "h1", "h2", "h3", "h4", "h5", "h6", "span"}
	attrNames     = []string{"href", "id", "src", "alt"}
	tightEnds     = []rune{'(', '[', '{', '—', '–'}
	starters      = []string{".", "?", "!", ",", ":", ";", ")", "]", "}", "—", "–"}
	tagToScope    = map[string]string{"th": "text.table.header", "td": "text.table.cell", "caption": "text.table.caption", "li": "text.list", "blockquote": "text.blockquote", "figcaption": "text.figure.caption"}
)

// The blocks of a file by its extension: a code file's comments, a plain file whole, and every other file as markdown. [[spec/design_output/rules#the-text-model]]
func blocksOf(ext, text string) []block {
	switch {
	case codeExts[ext]:
		return commentBlocks(ext, text)
	case ext == plainExt:
		return proseBlocks(block{text: text, scope: scopeText + ext, offset: 0}, []byte(text), true)
	}
	return markdownBlocks(ext, text)
}

// Each single-byte rune of a stretch masked, so offsets and rune counts hold. [[spec/design_output/rules#the-text-model]]
func masked(said []byte, mask byte) {
	for at := range said {
		if said[at] < utf8.RuneSelf && said[at] != '\n' {
			said[at] = mask
		}
	}
}

// The source with info strings, link labels and list numbers masked, so a match lands past them. [[spec/design_output/rules#the-text-model]]
func prepMarkdown(content []byte) {
	for _, at := range reExInfo.FindAllIndex(content, -1) {
		ticks := at[0]
		for ticks < at[1] && content[ticks] == '`' {
			ticks++
		}
		masked(content[ticks:at[1]], maskCode)
	}
	for _, at := range reLinkRef.FindAllIndex(content, -1) {
		masked(content[at[0]+2:at[1]-1], maskCode)
	}
	for _, at := range reLinkDef.FindAllIndex(content, -1) {
		masked(content[at[0]+1:at[1]-2], maskCode)
	}
	for _, at := range reNumericList.FindAllIndex(content, -1) {
		masked(content[at[0]:at[1]], maskCode)
	}
}

// The end of the front matter fenced at the top, or 0 where none opens the file. [[spec/design_output/rules#the-text-model]]
func frontEnd(text string) int {
	if !strings.HasPrefix(text, frontFence+"\n") {
		return 0
	}
	for at := len(frontFence) + 1; at < len(text); {
		line, _, _ := strings.Cut(text[at:], "\n")
		next := at + len(line) + 1
		if strings.TrimRight(line, " ") == frontFence {
			return min(next, len(text))
		}
		at = next
	}
	return 0
}

// The front matter's string values, each a block under its key, at its place on its line. [[spec/design_output/rules#the-text-model]]
func frontBlocks(ext, text string, end int) []block {
	var doc goyaml.Node
	body := text[len(frontFence)+1 : end]
	if goyaml.Unmarshal([]byte(body), &doc) != nil || len(doc.Content) == 0 || doc.Content[0].Kind != goyaml.MappingNode {
		return nil
	}
	starts := lineStarts(body)
	out := []block{}
	pairs := doc.Content[0].Content
	for at := 0; at+1 < len(pairs); at += 2 {
		key, value := pairs[at], pairs[at+1]
		if value.Kind != goyaml.ScalarNode || value.Tag != "!!str" || value.Value == "" || value.Line < 1 || value.Line > len(starts) {
			continue
		}
		from := starts[value.Line-1]
		found := strings.Index(body[from:], value.Value)
		if found < 0 {
			continue
		}
		out = append(out, block{text: value.Value, scope: scopeFront + key.Value + ext, offset: len(frontFence) + 1 + from + found})
	}
	return out
}

// The blocks of a markdown file: its front matter's strings, then each block of its HTML as prose. [[spec/design_output/rules#the-text-model]]
func markdownBlocks(ext, text string) []block {
	end := frontEnd(text)
	out := []block{}
	content := []byte(text)
	if end > 0 {
		out = append(out, frontBlocks(ext, text, end)...)
		for at := 0; at < end; at++ {
			if content[at] != '\n' {
				content[at] = ' '
			}
		}
	}
	var rendered bytes.Buffer
	if goldMd.Convert(content, &rendered) != nil {
		return out
	}
	prepMarkdown(content)
	walk := &walker{context: content, z: html.NewTokenizer(&rendered), ext: ext}
	return append(out, walk.blocks()...)
}

// The walk over goldmark's HTML: the source being masked as it is read, and where each search last stopped. [[spec/design_output/rules#the-text-model]]
type walker struct {
	context    []byte
	z          *html.Tokenizer
	ext        string
	cursor     int
	srcCursor  int
	queue      []string
	tagHistory []string
	activeTag  string
	spans      []run
	pending    []string
}

// Masks the first copy of a stretch in the source as read. [[spec/design_output/rules#the-text-model]]
func (w *walker) sub(said string) bool {
	at := bytes.Index(w.context, []byte(said))
	if at < 0 {
		return false
	}
	masked(w.context[at:at+len(said)], maskDone)
	return true
}

// Masks a text out of the source, line by line, else word by word. [[spec/design_output/rules#the-text-model]]
func (w *walker) update(said string) {
	if said == "" {
		return
	}
	for _, line := range strings.Split(said, "\n") {
		if !w.sub(line) {
			for _, word := range strings.Fields(line) {
				w.sub(word)
			}
		}
	}
}

// Masks the attribute values held since the last start tag, past one equal to the element's own text. [[spec/design_output/rules#the-text-model]]
func (w *walker) flush(own string) {
	for _, value := range w.pending {
		if value != own {
			w.update(value)
		}
	}
	w.pending = nil
}

// Closes a block: its texts masked out of the source, and its tags and runs dropped. [[spec/design_output/rules#the-text-model]]
func (w *walker) reset() {
	w.flush("")
	for _, said := range w.queue {
		w.update(said)
	}
	w.queue, w.tagHistory, w.spans = nil, nil, nil
}

// Where a block's text stands in the source past the last block, within the window, or -1. [[spec/design_output/rules#the-text-model]]
func (w *walker) locate(text string) int {
	if text == "" || w.cursor > len(w.context) {
		return -1
	}
	hay := w.context[w.cursor:min(len(w.context), w.cursor+locateWindow)]
	at := bytes.Index(hay, []byte(text))
	if at < 0 {
		return -1
	}
	off := w.cursor + at
	w.cursor = off + len(text)
	return off
}

// Records that a run of the block's text came verbatim from the source past the last run. [[spec/design_output/rules#the-text-model]]
func (w *walker) mapRun(at int, raw string) {
	if raw == "" || w.srcCursor > len(w.context) {
		return
	}
	found := bytes.Index(w.context[w.srcCursor:], []byte(raw))
	if found < 0 {
		return
	}
	src := w.srcCursor + found
	w.srcCursor = src + len(raw)
	w.spans = append(w.spans, run{at: at, src: src, n: len(raw)})
}

// A block of the text read so far, placed by its offset, else by its runs. [[spec/design_output/rules#the-text-model]]
func (w *walker) block(text, scope string, shift int) block {
	floor := w.cursor
	out := block{text: text, scope: scope, offset: w.locate(text), floor: floor}
	if out.offset < 0 {
		out.runs = runsWithin(w.spans, shift, len(text))
		if len(out.runs) > 0 {
			out.floor = out.runs[0].src
		}
	}
	return out
}

// The last tag of the block. [[spec/design_output/rules#the-text-model]]
func (w *walker) lastTag() string {
	if len(w.tagHistory) > 0 {
		return w.tagHistory[len(w.tagHistory)-1]
	}
	return w.activeTag
}

// Whether the block is a list item inside another list item. [[spec/design_output/rules#the-text-model]]
func (w *walker) isNestedList() bool {
	size := len(w.tagHistory)
	if w.lastTag() != "li" || size <= nestedDepth {
		return false
	}
	up1, up2 := w.tagHistory[size-2], w.tagHistory[size-nestedDepth]
	return (up1 == "ol" || up1 == "ul") && up2 == "li"
}

// The blocks one closed element's text makes: a list item, a cell or a heading as prose, else a paragraph. [[spec/design_output/rules#the-text-model]]
func (w *walker) scoped(text string) []block {
	for _, tag := range w.tagHistory {
		scope, found := tagToScope[tag]
		if (found && !contains(inlineTags, tag)) || reHeading.MatchString(tag) {
			if !found {
				scope = scopeHeading + tag
			}
			trimmed := strings.TrimLeft(text, " ")
			return proseBlocks(w.block(trimmed, scope+w.ext, len(text)-len(trimmed)), w.context, false)
		}
	}
	return proseBlocks(w.block(text, scopeText+w.ext, 0), w.context, true)
}

// Masks the attributes a tag carries once its text arrives. [[spec/design_output/rules#the-text-model]]
func (w *walker) replaceToks(tok html.Token) {
	w.flush("")
	if !contains(attrTags, tok.Data) {
		return
	}
	for _, attr := range tok.Attr {
		if contains(attrNames, attr.Key) {
			value := attr.Val
			if attr.Key == "href" {
				value, _ = url.QueryUnescape(value)
			}
			w.pending = append(w.pending, value)
		}
	}
}

// The attribute of a tag by its key. [[spec/design_output/rules#the-text-model]]
func attribute(tok html.Token, key string) string {
	for _, attr := range tok.Attr {
		if attr.Key == key {
			return attr.Val
		}
	}
	return ""
}

// Whether the buffer ends on a bracket or a dash, which binds the inline text after it. [[spec/design_output/rules#the-text-model]]
func endsTight(buf *bytes.Buffer) bool {
	last, _ := utf8.DecodeLastRune(buf.Bytes())
	for _, one := range tightEnds {
		if last == one {
			return true
		}
	}
	return false
}

// A text node as its block takes it: a skipped element masked, and inline text spaced off what came before. [[spec/design_output/rules#the-text-model]]
func clean(text, attr string, skip, inline, spaced, closedInline bool) (string, bool) {
	first, _ := utf8.DecodeRuneInString(text)
	starter := contains(starters, string(first)) && !skip
	if skip || attr == text {
		text = strings.Map(func(one rune) rune {
			if one == '\n' {
				return one
			}
			return maskCode
		}, text)
		skip = false
	}
	if (closedInline && spaced) || (!closedInline && inline && !starter) {
		text = " " + text
	}
	return text, skip
}

// Every block of the HTML, in document order. [[spec/design_output/rules#the-text-model]]
func (w *walker) blocks() []block {
	out := []block{}
	var attr string
	var inBlock, inline, skip, closedInline bool
	buf := &bytes.Buffer{}
	for {
		tokt := w.z.Next()
		tok := w.z.Token()
		txt := html.UnescapeString(strings.TrimSpace(tok.Data))
		isInline := contains(inlineTags, txt)
		switch {
		case tokt == html.ErrorToken:
			return out
		case tokt == html.StartTagToken && !isInline && contains(skipTags, txt):
			inBlock = true
		case inBlock && contains(skipTags, txt):
			inBlock = false
		case tokt == html.StartTagToken:
			if !isInline && !contains(voidTags, txt) && strings.TrimSpace(buf.String()) != "" {
				out = append(out, w.scoped(buf.String())...)
				w.reset()
				buf.Reset()
			}
			if (txt == "em" || txt == "b") && w.lastTag() == "code" {
				txt = "code"
			}
			inline = contains(inlineTags, txt)
			skip = contains(skippedInline, txt) || contains(skipTags, txt)
			closedInline = false
			w.tagHistory = append(w.tagHistory, txt)
			w.activeTag = txt
		case tokt == html.EndTagToken && isInline:
			w.activeTag = ""
			closedInline = true
		case tokt == html.SelfClosingTagToken && isInline:
			inline, closedInline = true, false
		case tokt == html.CommentToken:
			if !inline {
				closedInline = true
			}
			w.update(txt)
		case tokt == html.TextToken:
			if txt != "" {
				w.flush(txt)
				w.queue = append(w.queue, txt)
			}
			if !inBlock && txt != "" {
				if w.isNestedList() && !inline {
					txt = " " + txt
				}
				spaced := tok.Data != "" && strings.ContainsRune(" \t\n\r", rune(tok.Data[0]))
				raw := txt
				txt, skip = clean(txt, attr, skip, inline, spaced, closedInline)
				closedInline = false
				if strings.HasPrefix(txt, " ") && endsTight(buf) {
					txt = txt[1:]
				}
				if body := strings.TrimLeft(txt, " "); body == raw {
					w.mapRun(buf.Len()+(len(txt)-len(body)), raw)
				}
				buf.WriteString(txt)
			}
		}
		if tokt == html.EndTagToken && !isInline {
			if strings.TrimSpace(buf.String()) != "" {
				out = append(out, w.scoped(buf.String())...)
			}
			w.reset()
			buf.Reset()
		}
		attr = attribute(tok, "href")
		if tok.Data == "img" {
			if alt := attribute(tok, "alt"); alt != "" {
				out = append(out, w.block(alt, scopeAlt, 0))
			}
		}
		w.replaceToks(tok)
	}
}
