package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
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

// runWork mints a token. Anyone may mint: an agent breaking down what it
// holds, a person at a terminal, and later the engine itself. What a minter
// may decide is what the token carries, and the traced field is one of them —
// which is why an agent cannot reach this path except through the lane.
func runWork(args []string) {
	fs := flag.NewFlagSet("work", flag.ExitOnError)
	fs.SetOutput(os.Stdout)
	fs.Usage = func() {
		fmt.Fprintln(os.Stdout, "se work - mint a work token. Prints the token as JSON.")
		fmt.Fprintln(os.Stdout, "")
		fmt.Fprintln(os.Stdout, "  se work --title \"...\" --assignee main")
		fmt.Fprintln(os.Stdout, "  se work --stdin        read the whole token as JSON")
		fmt.Fprintln(os.Stdout, "")
		fs.PrintDefaults()
	}
	work := fs.String("work", "", "the folder being worked on (default: this one)")
	stdin := fs.Bool("stdin", false, "read the token as JSON on standard input")
	title := fs.String("title", "", "what the work is, in four words at most")
	detail := fs.String("detail", "", "the whole instruction, in the words it was asked in")
	assignee := fs.String("assignee", "", "whose token it is")
	guidance := fs.String("guidance", "", "the method, inline")
	guidanceRef := fs.String("guidance-ref", "", "the method, by reference")
	sections := fs.String("evidence", "", "the evidence form: section names, comma separated")
	script := fs.String("evidence-script", "", "the evidence script: it passes when it exits zero")
	scope := fs.String("scope", "", "multi-step, single-step, or token (default: single-step)")
	parent := fs.String("parent", "", "the token this one breaks down")
	dependsOn := fs.String("depends-on", "", "ids that must close first, comma separated")
	traced := fs.Bool("traced", true, "whether this token belongs in the record")
	backlog := fs.Bool("backlog", false, "mint it backlogged: visible, and not work anybody is doing")
	note := fs.Bool("note", false, "a note: ephemeral and backlogged. What a person means by write a note on this")
	activate := fs.String("open", "", "move a backlogged token into the queue, by id")
	first := fs.String("first", "", "instead of minting: put a token at the front of the queue, by id")
	by := fs.String("by", "", "who is minting it. The caller knows, and nothing here can work it out")
	set := fs.String("set", "", "instead of minting: change one thing about a token, by id")
	dup := fs.String("duplicate", "", "instead of minting: settle a token that says the same as another, by id")
	of := fs.String("of", "", "with duplicate: the token it says the same as")
	abort := fs.String("abort", "", "instead of minting: end a token from wherever it stands, by id")
	why := fs.String("why", "", "with abort: why it is ending. An abort with no reason is refused")
	bucket := fs.String("bucket", "", "with set: file it under this grouping. Empty clears it")
	file := fs.String("file", "", "instead of minting: file these ids in one bucket, comma separated")
	named := fs.String("named", "", "with file: what to call it. Empty asks the engine for a free name")
	rename := fs.String("rename", "", "instead of minting: rename a bucket, by the name it has")
	field := fs.String("field", "", "with set: which field to write")
	to := fs.String("to", "", "with set or rename: what to write in it")
	parse(fs, "work", args)

	roots, err := FindRoots(*work)
	if err != nil {
		fail(err)
	}

	// AN ABORT COMES OFF ANY STATE AND CARRIES WHY. It is the door onto the
	// same ending a duplicate takes, for the tokens that stop for every other
	// reason: obsolete, superseded, decided against.
	if *abort != "" {
		t, err := Abort(roots, *abort, *why, or2(*by, "main"))
		if err != nil {
			answerJSON(map[string]any{"error": err.Error()})
			os.Exit(1)
		}
		answerJSON(t)
		return
	}

	// A DUPLICATE IS SETTLED WITHOUT A REVIEW, because nothing was done to
	// review. Two tokens saying one thing is a fault in the backlog rather
	// than work, and the one that stays carries the successor so nothing
	// vanishes: a reader who finds the closed one is sent to the live one.
	if *dup != "" {
		t, err := LoadToken(roots, *dup)
		if err != nil {
			answerJSON(map[string]any{"error": err.Error()})
			os.Exit(1)
		}
		if _, err := LoadToken(roots, *of); err != nil {
			answerJSON(map[string]any{"error": "it duplicates " + *of + ", which does not exist"})
			os.Exit(1)
		}
		if t.Status.Ended() {
			answerJSON(map[string]any{"error": *dup + " is already closed"})
			os.Exit(1)
		}
		t.Status, t.Disposition, t.Successors, t.Holder = ImpDone, Became, []string{*of}, ""
		if err := SaveToken(roots, t); err != nil {
			answerJSON(map[string]any{"error": err.Error()})
			os.Exit(1)
		}
		inSession(roots, "work", or2(*by, "main"), t.ID+" says the same as "+*of, Yes(),
			map[string]any{"id": t.ID, "became": *of})
		answerJSON(t)
		return
	}

	// FILING IS THE ENGINE'S ACT. A person drags a row onto a group and the
	// editor says which token and what to write. What is allowed is decided
	// here, because two places that decide disagree.
	if *set != "" {
		t, err := LoadToken(roots, *set)
		if err != nil {
			answerJSON(map[string]any{"error": err.Error()})
			os.Exit(1)
		}
		if *field != "" {
			if err := WriteFieldBy(&t, *field, *to, or2(*by, "main")); err != nil {
				answerJSON(map[string]any{"error": err.Error()})
				os.Exit(1)
			}
			if err := SaveToken(roots, t); err != nil {
				answerJSON(map[string]any{"error": err.Error()})
				os.Exit(1)
			}
			inSession(roots, "work", or2(*by, "main"), t.ID+" "+*field+" is now "+or2(*to, "empty"), Yes(),
				map[string]any{"id": t.ID, "field": *field})
			answerJSON(t)
			return
		}
		// A DERIVED GROUP CLEARS THE BUCKET. Saying where the work belongs is
		// a stronger statement than the grouping it was filed under, so the
		// grouping goes rather than sitting on top of it.
		want := *bucket
		if Status(want).Known() {
			want = ""
		}
		if err := WriteFieldBy(&t, "bucket", want, or2(*by, "main")); err != nil {
			answerJSON(map[string]any{"error": err.Error()})
			os.Exit(1)
		}
		if err := SaveToken(roots, t); err != nil {
			answerJSON(map[string]any{"error": err.Error()})
			os.Exit(1)
		}
		inSession(roots, "work", or2(*by, "main"), "filed "+t.ID+" under "+or2(t.Bucket, "no bucket"), Yes(),
			map[string]any{"id": t.ID, "bucket": t.Bucket})
		answerJSON(t)
		return
	}

	// WHAT A PERSON OWNS IS THE ORDER, and this is how they say it. It writes
	// seq and nothing else, so which state a token is in stays with the pull.
	// A BUCKET IS THE PERSON'S OWN NAME FOR A GROUP, and filing rows into one is
	// what a person means by making a group out of a selection.
	if *file != "" {
		ids := splitComma(*file)
		name, err := FileInBucket(roots, ids, *named, or2(*by, "main"))
		if err != nil {
			answerJSON(map[string]any{"error": err.Error()})
			os.Exit(1)
		}
		inSession(roots, "work", or2(*by, "main"),
			fmt.Sprintf("%d token(s) filed in %s", len(ids), name), Yes(),
			map[string]any{"bucket": name, "ids": ids})
		answerJSON(map[string]any{"bucket": name, "filed": len(ids)})
		return
	}

	if *rename != "" {
		n, err := RenameBucket(roots, *rename, *to, or2(*by, "main"))
		if err != nil {
			answerJSON(map[string]any{"error": err.Error()})
			os.Exit(1)
		}
		inSession(roots, "work", or2(*by, "main"),
			fmt.Sprintf("%s renamed to %s, %d token(s)", *rename, *to, n), Yes(),
			map[string]any{"from": *rename, "to": *to, "tokens": n})
		answerJSON(map[string]any{"bucket": *to, "moved": n})
		return
	}

	if *first != "" {
		t, err := PutFirst(roots, *first)
		if err != nil {
			answerJSON(map[string]any{"error": err.Error()})
			os.Exit(1)
		}
		// THE ORDER IS A DECISION AND EVERY DECISION IS IN THE RECORD. The
		// queue hands out by seq, so a log that does not say who moved one
		// cannot explain why the next pull answered what it did.
		inSession(roots, "work", or2(*by, "main"),
			fmt.Sprintf("%s put first at seq %d: %s", t.ID, t.Seq, t.Title), Yes(),
			map[string]any{"id": t.ID, "seq": t.Seq})
		answerJSON(t)
		return
	}

	if *activate != "" {
		t, err := Activate(roots, *activate)
		if err != nil {
			answerJSON(map[string]any{"error": err.Error()})
			os.Exit(1)
		}
		answerJSON(t)
		return
	}

	var t Token
	if *stdin {
		b, _ := io.ReadAll(os.Stdin)
		if err := json.Unmarshal(b, &t); err != nil {
			answerJSON(map[string]any{"error": "the token will not read: " + err.Error()})
			os.Exit(1)
		}
	} else {
		t = Token{Title: *title, Detail: *detail, Assignee: *assignee, Guidance: *guidance, GuidanceRef: *guidanceRef,
			Scope: Scope(*scope), Parent: *parent, Traced: *traced,
			DependsOn: splitComma(*dependsOn)}
		// A TOKEN DRAFTS BEFORE IT IS WORKED ON. Which ones is the verb's
		// policy, and StartsAt is where that policy lives.
		t.Status = StartsAt(t)
		if *sections != "" {
			t.Evidence.Sections = splitComma(*sections)
		}
		t.Evidence.Script = *script
	}
	if *note {
		t.Traced, t.Status = false, Backlogged
	}
	if *backlog {
		t.Status = Backlogged
	}
	// WHO MINTED IT IS THE CALLER'S TO SAY. An agent minting through the lane
	// is that agent. A person typing in the panel is the person. The engine
	// sees the same process either way, so guessing here got it wrong.
	t.MintedBy = or2(*by, or2(t.MintedBy, "main"))

	minted, err := Mint(roots, t)
	if err != nil {
		answerJSON(map[string]any{"error": err.Error()})
		os.Exit(1)
	}
	answerJSON(minted)
}

// runHold is the person putting everything down, and picking it up again.
func runHold(args []string) {
	fs := flag.NewFlagSet("hold", flag.ExitOnError)
	fs.SetOutput(os.Stdout)
	fs.Usage = func() {
		fmt.Fprintln(os.Stdout, "se hold - stop the agent, or let it go on. Prints what it now is.")
		fmt.Fprintln(os.Stdout, "")
		fmt.Fprintln(os.Stdout, "  se hold            say whether it is on")
		fmt.Fprintln(os.Stdout, "  se hold --on")
		fmt.Fprintln(os.Stdout, "  se hold --off")
		fmt.Fprintln(os.Stdout, "")
		fs.PrintDefaults()
	}
	work := fs.String("work", "", "the folder being worked on (default: this one)")
	on := fs.Bool("on", false, "put everything on hold")
	off := fs.Bool("off", false, "let it go on")
	by := fs.String("by", "person", "who did it")
	parse(fs, "hold", args)

	roots, err := FindRoots(*work)
	if err != nil {
		fail(err)
	}
	if !*on && !*off {
		answerJSON(LoadHold(roots))
		return
	}
	h, err := SetHold(roots, *on, *by)
	if err != nil {
		answerJSON(map[string]any{"error": err.Error()})
		os.Exit(1)
	}
	what := "everything is on hold"
	if !h.On {
		what = "the hold is lifted"
	}
	inSession(roots, "hold", *by, what, Yes(), map[string]any{"on": h.On})
	answerJSON(h)
}

// runView writes a view file back. A person ticked a column, dragged an edge or
// picked a level, and where that is stored is one place's business.
func runView(args []string) {
	fs := flag.NewFlagSet("view", flag.ExitOnError)
	fs.SetOutput(os.Stdout)
	fs.Usage = func() {
		fmt.Fprintln(os.Stdout, "se view - change how a view looks. Prints what it now is.")
		fmt.Fprintln(os.Stdout, "")
		fmt.Fprintln(os.Stdout, "  se view --file work --pane left --width title=420")
		fmt.Fprintln(os.Stdout, "  se view --file work --pane left --order title,status")
		fmt.Fprintln(os.Stdout, "  se view --file work --pane left --sort status --direction DESC")
		fmt.Fprintln(os.Stdout, "  se view --file work --pane left --pin open --matching 'status == \"open\"'")
		fmt.Fprintln(os.Stdout, "")
		fs.PrintDefaults()
	}
	work := fs.String("work", "", "the folder being worked on (default: this one)")
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
	parse(fs, "view", args)

	roots, err := FindRoots(*work)
	if err != nil {
		fail(err)
	}
	// AN EDIT NEVER WRITES INTO THE METHOD. Every one of this verb's changes is
	// a write, so the file it resolves is the one the folder being worked on
	// owns, copied in from the method the first time somebody edits it.
	path, ok := ViewPathToWrite(roots, *file)
	if !ok {
		answerJSON(map[string]any{"error": "no view called " + *file})
		os.Exit(1)
	}
	if *pane == "" {
		base, err := LoadBase(path)
		if err != nil {
			answerJSON(map[string]any{"error": err.Error()})
			os.Exit(1)
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
		answerJSON(map[string]any{"error": wrote.Error()})
		os.Exit(1)
	}
	inSession(roots, "view", "person", *file+"/"+*pane+" changed", Yes(),
		map[string]any{"file": *file, "pane": *pane})
	answerJSON(map[string]any{"file": *file, "pane": *pane, "ok": true})
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
func runQuery(args []string) {
	fs := flag.NewFlagSet("query", flag.ExitOnError)
	fs.SetOutput(os.Stdout)
	fs.Usage = func() {
		fmt.Fprintln(os.Stdout, "se query - draw a view over the work. Prints the table as JSON.")
		fmt.Fprintln(os.Stdout, "")
		fmt.Fprintln(os.Stdout, "  se query --list          which views exist")
		fmt.Fprintln(os.Stdout, "  se query --view work     draw the first view in work.base")
		fmt.Fprintln(os.Stdout, "")
		fs.PrintDefaults()
	}
	work := fs.String("work", "", "the folder being worked on (default: this one)")
	name := fs.String("view", "work", "which view file, by name or path")
	which := fs.String("pane", "", "which view inside the file (default: the first)")
	list := fs.Bool("list", false, "print the views that exist and exit")
	panes := fs.Bool("panes", false, "print the views this file declares, in order, and exit")
	parse(fs, "query", args)

	roots, err := FindRoots(*work)
	if err != nil {
		fail(err)
	}
	if *list {
		answerJSON(map[string]any{"views": Views(roots)})
		return
	}
	path, ok := ViewPath(roots, *name)
	if !ok {
		answerJSON(map[string]any{"error": "no view called " + *name, "views": Views(roots)})
		os.Exit(1)
	}
	base, err := LoadBase(path)
	if err != nil {
		answerJSON(map[string]any{"error": err.Error()})
		os.Exit(1)
	}
	// THE FILE DECLARES ITS PANES. Two views side by side is what the file
	// says, not what this program decided.
	if *panes {
		var names []string
		for _, v := range base.Views {
			names = append(names, v.Name)
		}
		answerJSON(map[string]any{"panes": names})
		return
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
			answerJSON(map[string]any{"error": "no pane called " + *which})
			os.Exit(1)
		}
	}
	t, err := Render(base, view, TokenRows(roots))
	if err != nil {
		answerJSON(map[string]any{"error": err.Error()})
		os.Exit(1)
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
	answerJSON(t)
}

// runPull is the agent's one verb. It reads an optional payload and answers
// with work, a review, a refusal, or wait.
func runPull(args []string) {
	fs := flag.NewFlagSet("pull", flag.ExitOnError)
	fs.SetOutput(os.Stdout)
	fs.Usage = func() {
		fmt.Fprintln(os.Stdout, "se pull - ask the engine what to do. Prints the answer as JSON.")
		fmt.Fprintln(os.Stdout, "")
		fmt.Fprintln(os.Stdout, "  se pull --actor main               get work")
		fmt.Fprintln(os.Stdout, "  se pull --actor rev --as reviewer  get something to review")
		fmt.Fprintln(os.Stdout, "  echo '{\"id\":\"wk-..\",...}' | se pull --actor main")
		fmt.Fprintln(os.Stdout, "")
		fs.PrintDefaults()
	}
	work := fs.String("work", "", "the folder being worked on (default: this one)")
	actor := fs.String("actor", "main", "who is pulling")
	as := fs.String("as", RoleWorker, "which queue: worker or reviewer")
	parse(fs, "pull", args)

	roots, err := FindRoots(*work)
	if err != nil {
		fail(err)
	}

	var p Payload
	// A pull with nothing on standard input is a pull for work. A terminal
	// gives no end of file, so only a piped payload is read.
	if st, err := os.Stdin.Stat(); err == nil && st.Mode()&os.ModeCharDevice == 0 {
		if b, _ := io.ReadAll(os.Stdin); len(b) > 0 {
			if err := json.Unmarshal(b, &p); err != nil {
				answerJSON(Answer{Pull: AnswerRefused, Notice: "the payload will not read",
					Findings: []Rejection{{Clause: "the payload", Wrong: err.Error(),
						Satisfies: "one JSON object"}}})
				os.Exit(1)
			}
		}
	}

	a := Pull(roots, *actor, *as, p)
	id := ""
	if a.Token != nil {
		id = a.Token.ID
	}
	ok := Yes()
	if a.Pull == AnswerRefused {
		ok = No()
	}
	inSession(roots, "pull", *actor, "pull answered "+a.Pull, ok,
		map[string]any{"role": *as, "id": id})
	answerJSON(a)
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
func runStop(args []string) {
	fs := flag.NewFlagSet("stop", flag.ExitOnError)
	fs.SetOutput(os.Stdout)
	fs.Usage = func() {
		fmt.Fprintln(os.Stdout, "se stop - name why you are stopping. Prints the claim as JSON.")
		fmt.Fprintln(os.Stdout, "")
		fmt.Fprintln(os.Stdout, "  se stop --list                     what is sanctioned")
		fmt.Fprintln(os.Stdout, "  se stop --because broken --why \"...\"")
		fmt.Fprintln(os.Stdout, "")
		fs.PrintDefaults()
	}
	work := fs.String("work", "", "the folder being worked on (default: this one)")
	actor := fs.String("actor", "main", "who is stopping")
	because := fs.String("because", "", "which sanctioned stop applies")
	why := fs.String("why", "", "why it applies, in one line")
	list := fs.Bool("list", false, "print what is sanctioned and exit")
	parse(fs, "stop", args)

	roots, err := FindRoots(*work)
	if err != nil {
		fail(err)
	}
	if *list {
		answerJSON(map[string]any{"sanctioned": Sanctioned()})
		return
	}
	if err := ClaimStop(roots, *actor, *because, *why); err != nil {
		answerJSON(map[string]any{"error": err.Error(), "sanctioned": Sanctioned()})
		os.Exit(1)
	}
	inSession(roots, "stop", *actor, "claimed a stop: "+*because+" — "+*why, Yes(),
		map[string]any{"because": *because})
	answerJSON(map[string]any{"claimed": *because,
		"notice": "Recorded. Ask to stop again and it is granted. Do anything else first and this is gone."})
}

func answerJSON(v any) {
	b, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		return
	}
	fmt.Println(string(b))
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

func or2(s, fallback string) string {
	if s == "" {
		return fallback
	}
	return s
}

// runMove moves a file and repairs what refers to it. It answers what it
// rewrote and what it could not, because the second is work the caller owes.
func runMove(args []string) {
	fs := flag.NewFlagSet("move", flag.ExitOnError)
	fs.SetOutput(os.Stdout)
	fs.Usage = func() {
		fmt.Fprintln(os.Stdout, "se move - move a file and fix every reference to it. Prints what changed.")
		fmt.Fprintln(os.Stdout, "")
		fmt.Fprintln(os.Stdout, "  se move --from doc/old.md --to doc/new.md")
		fmt.Fprintln(os.Stdout, "")
		fs.PrintDefaults()
	}
	work := fs.String("work", "", "the folder being worked on (default: this one)")
	from := fs.String("from", "", "the file to move")
	to := fs.String("to", "", "where it goes")
	parse(fs, "move", args)

	roots, err := FindRoots(*work)
	if err != nil {
		fail(err)
	}
	if *from == "" || *to == "" {
		answerJSON(map[string]any{"error": "say both --from and --to"})
		os.Exit(1)
	}
	out, err := MoveFile(roots, *from, *to)
	if err != nil {
		answerJSON(map[string]any{"error": err.Error()})
		os.Exit(1)
	}
	inSession(roots, "move", "main", out.Moved.From+" moved to "+out.Moved.To, Yes(),
		map[string]any{"from": out.Moved.From, "to": out.Moved.To,
			"rewritten": len(out.Rewritten), "unrewritten": out.UnrewritN})
	answerJSON(out)
}

// se retro - collect everything a retro needs into one folder, and drain it.
func runRetro(args []string) {
	fs := flag.NewFlagSet("retro", flag.ExitOnError)
	fs.SetOutput(os.Stdout)
	fs.Usage = func() {
		fmt.Fprintln(os.Stdout, "se retro - collect the record and the scratchpad into one folder, and drain them.")
		fmt.Fprintln(os.Stdout, "")
		fmt.Fprintln(os.Stdout, "  se retro                 collect, and answer where it put them")
		fmt.Fprintln(os.Stdout, "")
		fmt.Fprintln(os.Stdout, "It rotates the log first, so the session that is running is in the retro.")
		fmt.Fprintln(os.Stdout, "It refuses while anybody else holds work, because a sweep has no undo.")
		fmt.Fprintln(os.Stdout, "")
		fs.PrintDefaults()
	}
	work := fs.String("work", "", "the folder being worked on (default: this one)")
	by := fs.String("by", "main", "who is running it. Their own held work does not stop them")
	parse(fs, "retro", args)

	roots, err := FindRoots(*work)
	if err != nil {
		fail(err)
	}
	got, err := Retro(roots, *by, Transcripts(roots))
	if err != nil {
		answerJSON(map[string]any{"error": err.Error()})
		os.Exit(1)
	}
	answerJSON(got)
}
