package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

// THE TWO SUBCOMMANDS LEVEL 1 ADDS. Both read JSON on standard input and
// write JSON on standard output, the way the guard does, because the caller
// is a program and not a person at a terminal.
//
// The lane stub calls these. It holds no rules of its own, so everything a
// rule decides is decided here.

// runHold is the person putting everything down, and picking it up again.
func runHold(c *call) int {
	fs := flag.NewFlagSet("hold", flag.ContinueOnError)
	fs.SetOutput(c.err)
	fs.Usage = func() {
		fmt.Fprintln(c.err, "se hold - stop the agent, or let it go on. Prints what it now is.")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  se hold            say whether it is on")
		fmt.Fprintln(c.err, "  se hold --on")
		fmt.Fprintln(c.err, "  se hold --off")
		fmt.Fprintln(c.err, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	on := fs.Bool("on", false, "put everything on hold")
	off := fs.Bool("off", false, "let it go on")
	by := fs.String("by", "person", "who did it")
	if code, stop := c.parse(fs, "hold"); stop {
		return code
	}

	roots := c.roots
	if !*on && !*off {
		c.answerJSON(LoadHold(roots))
		return 0
	}
	want := HoldOff
	if *on {
		want = HoldHeld
	}
	h, err := SetHold(roots, want, *by)
	if err != nil {
		c.answerJSON(map[string]any{"error": err.Error()})
		return 1
	}
	what := "everything is on hold"
	if !h.On {
		what = "the hold is lifted"
	}
	inSession(roots, "hold", *by, what, Yes(), map[string]any{"on": h.On})
	c.answerJSON(h)
	return 0
}

// runView writes a view file back. A person ticked a column, dragged an edge or
// picked a level, and where that is stored is one place's business.
func runView(c *call) int {
	fs := flag.NewFlagSet("view", flag.ContinueOnError)
	fs.SetOutput(c.err)
	fs.Usage = func() {
		fmt.Fprintln(c.err, "se view - change how a view looks. Prints what it now is.")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  se view --file work --pane left --width title=420")
		fmt.Fprintln(c.err, "  se view --file work --pane left --order title,status")
		fmt.Fprintln(c.err, "  se view --file work --pane left --sort status --direction DESC")
		fmt.Fprintln(c.err, "  se view --file work --pane left --pin open --matching 'status == \"open\"'")
		fmt.Fprintln(c.err, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	file := fs.String("file", "work", "which view file, by name or path")
	pane := fs.String("pane", "", "which view inside the file")
	width := fs.String("width", "", "a column and its width: name=px")
	order := fs.String("order", "", "the columns, in order, comma separated")
	sortBy := fs.String("sort", "", "sort by this column")
	groupBy := fs.String("group", "", "group by this column")
	direction := fs.String("direction", "ASC", "with sort or group: ASC or DESC")
	filter := fs.String("filter", "", "the filter a person built, as JSON groups of rows")
	pin := fs.String("pin", "", "pin a group to the top, by name")
	pinOn := fs.String("matching", "", "with pin: the filter the pinned group keeps")
	unpin := fs.String("unpin", "", "unpin a group, by name")
	// A LEVEL IS ONE LINE OF A SORT OR A GROUPING, and there may be several.
	// With no position named, sort and group write the first, which is what a
	// column heading does.
	at := fs.Int("at", 0, "with sort or group: which level, from 0")
	drop := fs.String("drop", "", "drop a level: sort or group, with at")
	if code, stop := c.parse(fs, "view"); stop {
		return code
	}

	roots := c.roots
	// AN EDIT NEVER WRITES INTO THE METHOD. Every one of this verb's changes is
	// a write, so the file it resolves is the one the folder being worked on
	// owns, copied in from the method the first time somebody edits it.
	path, ok := ViewPathToWrite(roots, *file)
	if !ok {
		c.answerJSON(map[string]any{"error": "no view called " + *file})
		return 1
	}
	if *pane == "" {
		base, err := LoadBase(path)
		if err != nil {
			c.answerJSON(map[string]any{"error": err.Error()})
			return 1
		}
		*pane = base.Views[0].Name
	}

	var wrote error
	switch {
	case *width != "":
		name, px, found := strings.Cut(*width, "=")
		n, _ := strconv.Atoi(px)
		if !found || n == 0 {
			wrote = fmt.Errorf("a width is name=px")
		} else {
			wrote = SetWidth(path, *pane, name, n)
		}
	case *order != "":
		wrote = SetOrder(path, *pane, splitComma(*order))
	case *drop != "":
		key, ok := levelKey(*drop)
		if !ok {
			wrote = fmt.Errorf("a level is sort or group, and this says %q", *drop)
		} else {
			wrote = DropLevel(path, *pane, key, *at)
		}
	case *sortBy != "":
		wrote = SetLevel(path, *pane, "sort", *at, *sortBy, *direction)
	case *groupBy != "":
		wrote = SetLevel(path, *pane, "groupBy", *at, *groupBy, *direction)
	case *filter != "":
		var groups []FilterGroup
		if err := json.Unmarshal([]byte(*filter), &groups); err != nil {
			wrote = fmt.Errorf("the filter will not read: %w", err)
			break
		}
		// WRITTEN IN THE SHAPE THE READER READS. One flat statement was written
		// correctly and read back wrong for anything past a single condition,
		// so a person who added a second group had their table emptied on the
		// next touch of the popover.
		//
		// FilterExpression still exists and is still what compiles a filter for
		// the query. This is about the file.
		if _, wrote = FilterExpression(groups); wrote == nil {
			wrote = SetFilterGroups(path, *pane, groups)
		}
	case *pin != "":
		wrote = AddPin(path, *pane, *pin, *pinOn)
	case *unpin != "":
		wrote = DropPinNamed(path, *pane, *unpin)
	default:
		wrote = fmt.Errorf("say what to change: width, order, sort, group, drop, filter, pin or unpin")
	}
	if wrote != nil {
		c.answerJSON(map[string]any{"error": wrote.Error()})
		return 1
	}
	inSession(roots, "view", "person", *file+"/"+*pane+" changed", Yes(),
		map[string]any{"file": *file, "pane": *pane})
	c.answerJSON(map[string]any{"file": *file, "pane": *pane, "ok": true})
	return 0
}

// levelKey answers the key in the file for what a person calls a level.
func levelKey(said string) (string, bool) {
	switch said {
	case "sort":
		return "sort", true
	case "group", "groupBy":
		return "groupBy", true
	}
	return "", false
}

// runQuery draws a view. It answers the rows grouped, and the renderer is
// whatever asked: a webview, or a person at a terminal reading JSON.
func runQuery(c *call) int {
	fs := flag.NewFlagSet("query", flag.ContinueOnError)
	fs.SetOutput(c.err)
	fs.Usage = func() {
		fmt.Fprintln(c.err, "se query - draw a view over the work. Prints the table as JSON.")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  se query --list          which views exist")
		fmt.Fprintln(c.err, "  se query --view work     draw the first view in work.base")
		fmt.Fprintln(c.err, "  se query --calls         every call a caller makes, as JSON")
		fmt.Fprintln(c.err, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	name := fs.String("view", "work", "which view file, by name or path")
	which := fs.String("pane", "", "which view inside the file (default: the first)")
	list := fs.Bool("list", false, "print the views that exist and exit")
	panes := fs.Bool("panes", false, "print the views this file declares, in order, and exit")
	calls := fs.Bool("calls", false, "print every call a caller makes, as JSON, and exit")
	if code, stop := c.parse(fs, "query"); stop {
		return code
	}

	// THE CALLS COME BEFORE ANY VIEW IS RESOLVED, because the catalog is about
	// this program rather than about the tree, and a caller asking what to send
	// has nothing to send yet.
	//
	// IT IS ONE LINE, where every other answer here is indented. A caller reads
	// it whole either way, and a person greps the call that fetched it out of
	// what came back, which indented JSON puts on four lines.
	if *calls {
		b, err := json.Marshal(TheCatalog())
		if err != nil {
			return c.fail(err)
		}
		fmt.Fprintln(c.out, string(b))
		return 0
	}

	roots := c.roots
	if *list {
		c.answerJSON(map[string]any{"views": Views(roots)})
		return 0
	}
	path, ok := ViewPath(roots, *name)
	if !ok {
		c.answerJSON(map[string]any{"error": "no view called " + *name, "views": Views(roots)})
		return 1
	}
	base, err := LoadBase(path)
	if err != nil {
		c.answerJSON(map[string]any{"error": err.Error()})
		return 1
	}
	// THE FILE DECLARES ITS PANES. Two views side by side is what the file
	// says, not what this program decided.
	if *panes {
		var names []string
		for _, v := range base.Views {
			names = append(names, v.Name)
		}
		c.answerJSON(map[string]any{"panes": names})
		return 0
	}
	view := base.Views[0]
	if *which != "" {
		found := false
		for _, v := range base.Views {
			if v.Name == *which {
				view, found = v, true
			}
		}
		if !found {
			c.answerJSON(map[string]any{"error": "no pane called " + *which})
			return 1
		}
	}
	t, err := Render(base, view, TokenRows(roots))
	if err != nil {
		c.answerJSON(map[string]any{"error": err.Error()})
		return 1
	}
	// EVERY ICON THE EDITOR DRAWS RIDES ALONG, so the client holds no copy of
	// a mark and cannot drift from the table.
	if icons, err := Icons(roots); err == nil {
		t.Icons = icons
	}
	// THE QUERY IS THE SAME THING RENDERED TWICE, and a person may want the
	// other rendering. It rides along so the panel needs no second call.
	if rel, err := filepath.Rel(roots.Method, path); err == nil {
		t.File = filepath.ToSlash(rel)
	} else {
		t.File = filepath.Base(path)
	}
	if b, err := os.ReadFile(path); err == nil {
		t.Source = string(b)
	}
	c.answerJSON(t)
	return 0
}

// inSession puts a lane event in the running session. It writes directly rather
// than through noteInLog, because the actor here is whoever pulled and the
// record has to name them. A lane event outside a session is not lost: the
// token is its own file, and the file is the durable record.
func inSession(r Roots, kind, actor, msg string, ok *bool, data map[string]any) {
	l, err := OpenExistingLog(r.Private("log"))
	if err != nil {
		return
	}
	defer l.Close()
	l.Write("engine", kind, actor, msg, ok, data)
}

// runStop records a named reason for stopping. The list of names is the
// engine's, so an id nobody registered is refused here rather than accepted
// and quietly meaning nothing.
func runStop(c *call) int {
	fs := flag.NewFlagSet("stop", flag.ContinueOnError)
	fs.SetOutput(c.err)
	fs.Usage = func() {
		fmt.Fprintln(c.err, "se stop - name why you are stopping. Prints the claim as JSON.")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  se stop --list                     what is sanctioned")
		fmt.Fprintln(c.err, "  se stop --because broken --why \"...\"")
		fmt.Fprintln(c.err, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	actor := fs.String("actor", "main", "who is stopping")
	because := fs.String("because", "", "which sanctioned stop applies")
	why := fs.String("why", "", "why it applies, in one line")
	list := fs.Bool("list", false, "print what is sanctioned and exit")
	if code, stop := c.parse(fs, "stop"); stop {
		return code
	}

	roots := c.roots
	if *list {
		c.answerJSON(map[string]any{"sanctioned": Sanctioned()})
		return 0
	}
	if err := ClaimStop(roots, *actor, *because, *why); err != nil {
		c.answerJSON(map[string]any{"error": err.Error(), "sanctioned": Sanctioned()})
		return 1
	}
	inSession(roots, "stop", *actor, "claimed a stop: "+*because+" — "+*why, Yes(),
		map[string]any{"because": *because})
	c.answerJSON(map[string]any{"claimed": *because,
		"notice": "Recorded. Ask to stop again and it is granted. Do anything else first and this is gone."})
	return 0
}

// answerJSON is the flag form's, on the process's own streams.
func answerJSON(v any) { (&call{out: os.Stdout, err: os.Stderr}).answerJSON(v) }

func (c *call) answerJSON(v any) {
	b, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		fmt.Fprintln(c.err, err)
		return
	}
	fmt.Fprintln(c.out, string(b))
}

func splitComma(s string) []string {
	var out []string
	for _, p := range strings.Split(s, ",") {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, p)
		}
	}
	return out
}

// orElse is the value, or the fallback where there is none.
//
// ONE OF IT, BECAUSE THERE WAS TWO. or2 here and or3 in view.go were the same
// four lines in the same package, and the number on each was the only thing a
// reader had to tell them apart, which is a name not yet found.
func orElse(s, fallback string) string {
	if s == "" {
		return fallback
	}
	return s
}

// runMove moves a file and repairs what refers to it. It answers what it
// rewrote and what it could not, because the second is work the caller owes.
func runMove(c *call) int {
	fs := flag.NewFlagSet("move", flag.ContinueOnError)
	fs.SetOutput(c.err)
	fs.Usage = func() {
		fmt.Fprintln(c.err, "se move - move a file and fix every reference to it. Prints what changed.")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  se move --from doc/old.md --to doc/new.md")
		fmt.Fprintln(c.err, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	from := fs.String("from", "", "the file to move")
	to := fs.String("to", "", "where it goes")
	if code, stop := c.parse(fs, "move"); stop {
		return code
	}

	roots := c.roots
	if *from == "" || *to == "" {
		c.answerJSON(map[string]any{"error": "say both --from and --to"})
		return 1
	}
	out, err := MoveFile(roots, *from, *to)
	if err != nil {
		c.answerJSON(map[string]any{"error": err.Error()})
		return 1
	}
	inSession(roots, "move", "main", out.Moved.From+" moved to "+out.Moved.To, Yes(),
		map[string]any{"from": out.Moved.From, "to": out.Moved.To,
			"rewritten": len(out.Rewritten), "unrewritten": out.UnrewritN})
	c.answerJSON(out)
	return 0
}

// se retro - collect everything a retro needs into one folder, and drain it.
func runRetro(c *call) int {
	fs := flag.NewFlagSet("retro", flag.ContinueOnError)
	fs.SetOutput(c.err)
	fs.Usage = func() {
		fmt.Fprintln(c.err, "se retro - collect the record and the scratchpad into one folder, and drain them.")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  se retro                 collect, and answer where it put them")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "It rotates the log first, so the session that is running is in the retro.")
		fmt.Fprintln(c.err, "It refuses while anybody else holds work, because a sweep has no undo.")
		fmt.Fprintln(c.err, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	by := fs.String("by", "main", "who is running it. Their own held work does not stop them")
	if code, stop := c.parse(fs, "retro"); stop {
		return code
	}

	roots := c.roots
	got, err := Retro(c.ctx, roots, *by, Transcripts(roots))
	if err != nil {
		c.answerJSON(map[string]any{"error": err.Error()})
		return 1
	}
	c.answerJSON(got)
	return 0
}
