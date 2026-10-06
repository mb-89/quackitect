// ticket note: a private ticket off the note process, and the hand carries on,
// off note in src/scripts/ticket.js and the Ask's voice in ticket-ask-lint.js.
// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
package main

import (
	"fmt"
	"io"
	"regexp"
	"slices"
	"strings"

	"quackitect/src/index"
	"quackitect/src/modules/check"
	"quackitect/src/modules/git"
	"quackitect/src/note"
	"quackitect/src/pull"
	"quackitect/src/yaml"
)

func init() { register("ticket note", ticketNote(index.Root, registeredRepo)) }

// The process a note mints off, and the kind its log row carries. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
const noteProcess = "note"

// The flag on a note that waits for a person. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
const talkKey = "talk"

// A word this long carries the meaning, where a shorter one joins the sentence. [[spec/tickets/the-verbs-need-no-wrapper]]
const longWord = 5

// The row an open ticket's front carries. [[spec/tickets/the-verbs-need-no-wrapper]]
var standsOpen = regexp.MustCompile(`(?m)^state: open$`)

// What splits a line into its words. [[spec/tickets/the-verbs-need-no-wrapper]]
var wordGap = regexp.MustCompile(`[^a-z0-9]+`)

// What joins the words of a name. [[spec/tickets/prose-verbs-land-first-try]]
var nameGap = regexp.MustCompile(`[-_.]+`)

// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func ticketNote(rootOf func() (string, error), repoAt func(root string) git.Repo) twin {
	return func(argv []string, dry bool, out, errs io.Writer) int {
		said := argv[min(2, len(argv)):]
		name := wordAt(said, 0)
		rest := said[min(1, len(said)):]
		parks, talks := slices.Contains(rest, "--"+todoKey), slices.Contains(rest, "--"+talkKey)
		kept := []string{}
		for _, one := range rest {
			if one != "--"+todoKey && one != "--"+talkKey {
				kept = append(kept, one)
			}
		}
		line := strings.TrimSpace(strings.Join(kept, " "))
		if name == "" || line == "" {
			fmt.Fprintln(errs, `ticket note needs a name and a line: ./RUNME.sh ticket note slow-lint "..."`)
			return exitUsage
		}
		it, code := pullHere(rootOf, repoAt, out, errs)
		if it == nil {
			return code
		}
		// A note lands on its first call, so a name past the cap cuts to its first words and says so. [[spec/tickets/prose-verbs-land-first-try]]
		named := cutTo(name, it.Words)
		if named != name {
			fmt.Fprintf(out, "%s holds more than %d words, so the note stands as %s.\n", name, it.Words, named)
		}
		path := pull.Notes + "/" + named + ".md"
		if it.Disk.Exists(path) {
			fmt.Fprintf(errs, "%s stands already. Name a note nothing holds yet.\n", path)
			return exitUsage
		}
		held, why := pull.ProcessAt(pull.OSDisk{Root: it.Method}, noteProcess)
		if why != "" {
			fmt.Fprintln(errs, why)
			return exitFailed
		}
		if twin := noteTwinOf(it.Disk, line); twin != "" {
			fmt.Fprintf(errs, "%s stands open and carries these words. Add the line there in place of a twin.\n", twin)
		}
		steps := fromHold(held.Route, holdOf(it))
		if talks {
			steps = personDecides(steps)
		}
		fields := map[string]any{"state": "open"}
		if parks {
			fields[todoKey] = true
		}
		text, warned, why := it.RoutedWarned(path, held, steps, line, fields)
		if why != "" {
			fmt.Fprintln(errs, why)
			return exitFailed
		}
		if len(warned) > 0 {
			fmt.Fprintln(errs, pull.AskWarning(path, warned))
		}
		if !dry {
			if err := it.Disk.Write(path, text); err != nil {
				fmt.Fprintln(errs, err)
				return exitFailed
			}
		}
		switch {
		case parks:
			fmt.Fprintf(out, "%s stands at %s, and the next pull hands it back first.\n", path, todoKey)
		case talks:
			fmt.Fprintf(out, "%s stands, and it waits for a person to decide it.\n", path)
		default:
			fmt.Fprintf(out, "%s stands, and it waits for a retro to decide it.\n", path)
		}
		if !dry {
			saidNote(it, line, named)
		}
		return 0
	}
}

// The first open note or ticket whose Ask holds most of the line's longer words. [[spec/tickets/the-verbs-need-no-wrapper]]
func noteTwinOf(disk pull.Disk, line string) string {
	words := longWords(line)
	if len(words) == 0 {
		return ""
	}
	for _, folder := range []string{pull.Notes, pull.Tickets} {
		for _, name := range disk.Files(folder) {
			if !strings.HasSuffix(name, ".md") {
				continue
			}
			text, _ := disk.Read(folder + "/" + name)
			if !standsOpen.MatchString(text) {
				continue
			}
			ask, shared := longWords(askRowsOf(text)), 0
			for word := range words {
				if ask[word] {
					shared++
				}
			}
			if shared*2 > len(words) {
				return folder + "/" + name
			}
		}
	}
	return ""
}

// Every row of a ticket's Ask, its comments among them, as askOf in src/engine/group.js reads it. [[spec/tickets/the-verbs-need-no-wrapper]]
func askRowsOf(text string) string {
	for _, one := range note.Read(text).Sections {
		if strings.ToLower(one.Header) == "ask" {
			return strings.TrimSpace(strings.Join(one.Own, "\n"))
		}
	}
	return ""
}

// The words of a text at least longWord long, lower case. [[spec/tickets/the-verbs-need-no-wrapper]]
func longWords(text string) map[string]bool {
	out := map[string]bool{}
	for _, word := range wordGap.Split(strings.ToLower(text), -1) {
		if len(word) >= longWord {
			out[word] = true
		}
	}
	return out
}

// The first words of a name, as many as the cap holds, joined by a hyphen. [[spec/tickets/prose-verbs-land-first-try]]
func cutTo(name string, most int) string {
	if most <= 0 || check.OverLong(name, most) == "" {
		return name
	}
	kept := []string{}
	for _, part := range nameGap.Split(name, -1) {
		if part != "" && len(kept) < most {
			kept = append(kept, part)
		}
	}
	return strings.Join(kept, "-")
}

// A note asking for a discussion waits for a person, so the pull hands it to no agent at a desk. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func personDecides(steps []any) []any {
	out := make([]any, 0, len(steps))
	for _, one := range steps {
		step := yaml.AsDoc(one)
		if step == nil || yaml.AsString(step.Get("name")) == "" {
			out = append(out, one)
			continue
		}
		put := yaml.New()
		for _, key := range step.Keys() {
			put.Set(key, step.Get(key))
		}
		put.Set("by", pull.Person)
		out = append(out, put)
	}
	return out
}

// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func fromHold(route []any, hold *pull.Hold) []any {
	if hold == nil {
		return route
	}
	return pull.FromHold(route, hold.Ticket, hold.Step)
}

// The first hold on this box whose ticket stands, or none. [[spec/design_output/pull#the-hand-and-the-hold]]
func holdOf(it *pull.It) *pull.Hold {
	if holds := it.EveryHold(); len(holds) > 0 {
		return &holds[0]
	}
	return nil
}

// The note row, its line whole under text, so the answer door reads it off the log. [[spec/design_output/log#what-a-box-writes]]
func saidNote(it *pull.It, line, named string) {
	if it.Log != nil {
		it.Log("info", noteProcess, line, map[string]any{"text": line, "ticket": named})
	}
}
