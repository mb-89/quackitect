// The reader's verb: every owner prompt, fault and command a chapter holds,
// each with the file and line it stands on, so no reader writes a parser.
// [[spec/tickets/the-retro-finishes-its-asks]]
package main

import (
	"fmt"
	"io"
	"path/filepath"
	"slices"
	"strings"
)

// A helper's transcript stands under this folder, and its prompts come from the hand; the shell tool names a command. [[spec/tickets/the-retro-finishes-its-asks]]
const (
	retroHelpers = "subagents"
	retroShell   = "Bash"
)

// A printed text keeps its first line, cut to this width, and the verb's line names the id at this place. [[spec/tickets/the-retro-finishes-its-asks]]
const (
	retroReadWidth = 200
	retroReadIdAt  = 3
)

// One row a line earns: its kind, and its text. [[spec/tickets/the-retro-finishes-its-asks]]
type retroRow struct {
	kind string
	text string
}

func init() { register("retro read", retroReadVerb(retroRoot)) }

// The text of a message's content: the string, or its text parts joined. [[spec/tickets/the-retro-finishes-its-asks]]
func retroTextOf(content any) string {
	if text, ok := content.(string); ok {
		return text
	}
	list, ok := content.([]any)
	if !ok {
		return ""
	}
	parts := []string{}
	for _, one := range list {
		if retroJSSame(retroJSField(one, "type"), "text") {
			parts = append(parts, retroJSOr(retroJSField(one, "text")))
		}
	}
	return strings.Join(parts, " ")
}

// A text's first line, trimmed and cut to the width. [[spec/tickets/the-retro-finishes-its-asks]]
func retroShortOf(text any) string {
	first, _, _ := strings.Cut(retroJSTrim(retroJSOr(text)), "\n")
	return retroJSSlice(first, retroReadWidth)
}

// Every row one line earns: a fault, an owner prompt, or a shell command. [[spec/tickets/the-retro-finishes-its-asks]]
func retroRowsOf(path, line string) []retroRow {
	read, ok := retroJSParse(line)
	if !ok || !retroJSTruthy(read) {
		return nil
	}
	content := retroJSField(retroJSField(read, "message"), "content")
	parts := retroJSList(content)
	rows := []retroRow{}
	if retroFault.MatchString(line) {
		var said any = retroJSNone{}
		for _, one := range parts {
			if retroJSSame(retroJSField(one, "is_error"), true) {
				said = retroTextOf(retroJSField(one, "content"))
				break
			}
		}
		for _, key := range []string{"msg", "message", "said"} {
			if retroJSNullish(said) {
				said = retroJSField(read, key)
			}
		}
		text, isText := said.(string)
		if !isText {
			text = line
		}
		rows = append(rows, retroRow{kind: "fault", text: retroShortOf(text)})
	} else if retroJSSame(retroJSField(read, "type"), "user") &&
		!slices.Contains(strings.Split(path, "/"), retroHelpers) &&
		retroShortOf(retroTextOf(content)) != "" {
		rows = append(rows, retroRow{kind: "prompt", text: retroShortOf(retroTextOf(content))})
	}
	for _, one := range parts {
		if retroJSSame(retroJSField(one, "type"), "tool_use") && retroJSSame(retroJSField(one, "name"), retroShell) {
			rows = append(rows, retroRow{kind: "command", text: retroShortOf(retroJSField(retroJSField(one, "input"), "command"))})
		}
	}
	return rows
}

// The verb: prints each row of the chapter's lines as `path:line  kind  text`. [[spec/tickets/the-retro-finishes-its-asks]]
func retroReadVerb(root func() string) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		base, name, id := root(), retroWordAt(argv, 2), retroWordAt(argv, retroReadIdAt)
		home, at := "", ""
		if name != "" {
			home = retroHome(base, name)
		}
		if home != "" && id != "" {
			at = filepath.Join(home, retroChaptersFolder, id+".json")
		}
		if at == "" || !retroIsThere(at) {
			shown := id
			if shown == "" {
				shown = "none"
			}
			fmt.Fprintf(errs, "retro read names a chapter the retro holds, and %s stands nowhere under %s.\n", shown, retroChaptersFolder)
			fmt.Fprintln(errs, "  ./RUNME.sh retro read <retro> <chapter>")
			return 2
		}
		chapter, _ := retroJSParse(retroFileText(at))
		lines, _ := retroJSField(chapter, "lines").(*retroJSDict)
		for _, path := range lines.order() {
			file := filepath.Join(home, retroInput, filepath.FromSlash(path))
			if !retroIsThere(file) {
				continue
			}
			text := strings.Split(retroFileText(file), "\n")
			for _, pair := range retroJSList(lines.get(path)) {
				bounds := retroJSList(pair)
				if len(bounds) < 2 {
					continue
				}
				from, to := retroJSToNumber(bounds[0]), retroJSToNumber(bounds[1])
				for line := from; line <= to && line <= float64(len(text)); line++ {
					row := ""
					if place := int(line) - 1; float64(place) == line-1 && place >= 0 {
						row = text[place]
					}
					for _, one := range retroRowsOf(path, row) {
						fmt.Fprintf(out, "%s:%s  %s  %s\n", path, retroJSNumber(line), one.kind, one.text)
					}
				}
			}
		}
		return 0
	}
}
