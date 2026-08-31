package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"os"
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
		fmt.Fprintln(os.Stdout, "  se work --form \"...\" --assignee main")
		fmt.Fprintln(os.Stdout, "  se work --stdin        read the whole token as JSON")
		fmt.Fprintln(os.Stdout, "")
		fs.PrintDefaults()
	}
	work := fs.String("work", "", "the folder being worked on (default: this one)")
	stdin := fs.Bool("stdin", false, "read the token as JSON on standard input")
	form := fs.String("form", "", "what work is to be done, in one line")
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
	by := fs.String("by", "", "who is minting it. The caller knows, and nothing here can work it out")
	set := fs.String("set", "", "instead of minting: change one thing about a token, by id")
	bucket := fs.String("bucket", "", "with set: file it under this grouping. Empty clears it")
	_ = fs.Parse(args)

	roots, err := FindRoots(*work)
	if err != nil {
		fail(err)
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
		// A DERIVED GROUP CLEARS THE BUCKET. Saying where the work belongs is
		// a stronger statement than the grouping it was filed under, so the
		// grouping goes rather than sitting on top of it.
		if *bucket == Cleared || Status(*bucket).Known() {
			t.Bucket = ""
		} else {
			t.Bucket = *bucket
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

	if *activate != "" {
		t, err := Activate(roots, *activate)
		if err != nil {
			answerJSON(map[string]any{"error": err.Error()})
			os.Exit(1)
		}
		inSession(roots, "work", or2(*by, "main"), "opened "+t.ID+" from the backlog: "+t.Form, Yes(),
			map[string]any{"id": t.ID})
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
		t = Token{Form: *form, Detail: *detail, Assignee: *assignee, Guidance: *guidance, GuidanceRef: *guidanceRef,
			Scope: Scope(*scope), Parent: *parent, Traced: *traced,
			DependsOn: splitComma(*dependsOn)}
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
	// A minting is an event, so it is in the record like every other one.
	inSession(roots, "work", minted.MintedBy, "minted "+minted.ID+": "+minted.Form, Yes(),
		map[string]any{"id": minted.ID, "assignee": minted.Assignee, "scope": minted.Scope})
	answerJSON(minted)
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
	_ = fs.Parse(args)

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
	_ = fs.Parse(args)

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
	_ = fs.Parse(args)

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
