// The fill verb: a ticket a person saves with a process and no route takes
// what the mint writes for it, its front and its written chapters riding in
// as the mint's fields.
// [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]
package main

import (
	"fmt"
	"io"
	"regexp"
	"slices"
	"strings"
	"unicode"

	"quackitect/src/index"
	"quackitect/src/modules/check"
	"quackitect/src/note"
	"quackitect/src/pull"
	"quackitect/src/yaml"
)

func init() { register("ticket fill", ticketFill(index.Root)) }

// The flag that prints the filled ticket and writes nothing. [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]
const stdoutFlag = "--stdout"

// The chapters a person writes before the fill, which ride into the mint as they stand. [[spec/schemas/ticket.schema.yaml]]
var writtenChapters = []string{"Ask", "Discussion"}

// A row holding a comment alone, which commentRow in src/pull/pull_route.go names. [[spec/design_output/pull#a-draft-opens]]
var commentRow = regexp.MustCompile(`^\s*<!--.*-->\s*$`)

// [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]
func ticketFill(rootOf func() (string, error)) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		said := argv[min(2, len(argv)):]
		disk, err := workDisk(rootOf)
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		at, found := ticketNamed(disk, said)
		if !found {
			fmt.Fprintf(errs, "%s names no ticket: ./RUNME.sh ticket fill spec/tickets/slow-lint.md\n", nameOr(said, "ticket fill"))
			return exitUsage
		}
		text, _ := disk.Read(at)
		read := note.Read(text)
		held := read.Front.Said
		if holdsRoute(held.Get("steps")) {
			fmt.Fprintf(out, "%s carries a route already, so the fill copies nothing.\n", at)
			return 0
		}
		if strings.TrimSpace(yaml.AsString(held.Get("process"))) == "" {
			_, why := pull.ProcessAt(disk, "")
			fmt.Fprintln(errs, why)
			return exitUsage
		}
		fields := map[string]any{}
		for _, key := range held.Keys() {
			fields[key] = held.Get(key)
		}
		for _, header := range writtenChapters {
			if written := chapterText(read.Sections, header); written != "" {
				fields[header] = written
			}
		}
		schemas := check.SchemasIn(check.TreeOver(disk.Root, rootDisk{disk.Root}))
		if why := withRoute(disk, schemas.Get(ticketKind), fields); why != "" {
			fmt.Fprintln(errs, why)
			return exitUsage
		}
		made, why := check.Minted(schemas, ticketKind, at, fields)
		if why != "" {
			fmt.Fprintln(errs, why)
			return exitUsage
		}
		if slices.Contains(argv, stdoutFlag) {
			fmt.Fprintln(out, strings.TrimRightFunc(made, unicode.IsSpace))
			return 0
		}
		if err := disk.Write(at, made); err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		return routeAnswer(out, 0, "ticket", at, "process", fields["process"])
	}
}

// Whether a front's steps hold anything, as a list or a lone value. [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]
func holdsRoute(steps any) bool {
	if list, isList := steps.([]any); isList {
		return len(list) > 0
	}
	return steps != nil
}

// The rows a top chapter holds past its comments, trimmed, or nothing where the ticket holds no such chapter. [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]
func chapterText(sections []note.Section, header string) string {
	for _, one := range sections {
		if one.Level != 1 || one.Header != header {
			continue
		}
		var rows []string
		for _, row := range one.Own {
			if !commentRow.MatchString(row) {
				rows = append(rows, row)
			}
		}
		return strings.TrimSpace(strings.Join(rows, "\n"))
	}
	return ""
}
