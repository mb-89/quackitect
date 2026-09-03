package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
)

// se work: mint a token, or move one that exists.
//
// WHAT A TOKEN IS SHAPED LIKE IS NOT THIS FILE'S BUSINESS. The schema says
// what a token may carry and the process says which of it applies, so minting
// is: pick the process, fill what the caller gave, and let the checks refuse
// what does not fit.
func runWork(c *call) int {
	fs := flag.NewFlagSet("work", flag.ContinueOnError)
	fs.SetOutput(c.out)
	fs.Usage = func() {
		fmt.Fprintln(c.out, "se work - mint a work token. Prints the token as JSON.")
		fmt.Fprintln(c.out, "")
		fmt.Fprintln(c.out, "  se work --title \"...\" --process note")
		fmt.Fprintln(c.out, "  se work --template note   print what one starts from")
		fmt.Fprintln(c.out, "  se work --stdin           read the whole token as JSON")
		fmt.Fprintln(c.out, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	template := fs.String("template", "", "instead of minting: print what a token of this process starts from")
	process := fs.String("process", "", "which process shapes this token (default: note)")
	stdin := fs.Bool("stdin", false, "read the token as JSON on standard input")
	title := fs.String("title", "", "what the work is, in four words at most")
	detail := fs.String("detail", "", "what is asked, or what is wrong")
	action := fs.String("proposed-action", "", "what you think should happen about it")
	dependsOn := fs.String("depends-on", "", "ids that must close first, comma separated")
	parent := fs.String("parent", "", "the id this is a part of. That token cannot close while this is open")
	by := fs.String("by", "", "who is minting it")
	on := fs.String("on", "", "instead of minting: say which token you are working on, by id")
	abort := fs.String("abort", "", "instead of minting: end a token from wherever it stands, by id")
	why := fs.String("why", "", "with abort: why it is ending. An abort with no reason is refused")
	putDown := fs.String("put-down", "", "instead of minting: set a token you are holding back, by id")
	set := fs.String("set", "", "instead of minting: change one thing about a token, by id")
	field := fs.String("field", "", "with set: which field to write")
	to := fs.String("to", "", "with set: what to write in it")
	file := fs.String("file", "", "instead of minting: put these ids in one bucket, comma separated")
	bucket := fs.String("bucket", "", "with file: the bucket's name. Empty asks the engine for a free one")
	rename := fs.String("rename", "", "instead of minting: rename a bucket. Say the new name with --to")
	if code, stop := c.parse(fs, "work"); stop {
		return code
	}

	roots := c.roots

	// THE TEMPLATE IS GENERATED, NEVER HAND-WRITTEN. It is the schema and the
	// process read together, so it cannot drift from either.
	if *template != "" {
		out, err := TemplateFor(roots.Method, "work-token", *template)
		if err != nil {
			return c.fail(err)
		}
		fmt.Fprint(c.out, out)
		return 0
	}

	switch {
	case *putDown != "":
		t, err := PutDown(roots, *putDown, orElse(*by, "main"))
		return c.answerOrFail(t, err)
	case *on != "":
		t, err := TakeUp(roots, *on, orElse(*by, "main"))
		return c.answerOrFail(t, err)
	case *abort != "":
		t, err := Abort(roots, *abort, orElse(*by, "main"), *why)
		return c.answerOrFail(t, err)
	// TWO KINDS OF GROUP, AND THIS VERB MAKES THE OTHER ONE. A query is a
	// filter in the view file. A bucket is a name a person gave a handful of
	// tokens, and it moves none of them.
	case *file != "":
		name, err := FileInBucket(roots, splitComma(*file), *bucket, orElse(*by, "main"))
		if err != nil {
			c.answerJSON(map[string]any{"error": err.Error()})
			return 1
		}
		c.answerJSON(map[string]any{"bucket": name, "ids": splitComma(*file)})
		return 0
	case *rename != "":
		moved, err := RenameBucket(roots, *rename, *to, orElse(*by, "main"))
		if err != nil {
			c.answerJSON(map[string]any{"error": err.Error()})
			return 1
		}
		c.answerJSON(map[string]any{"bucket": *to, "was": *rename, "moved": moved})
		return 0
	case *set != "":
		t, err := LoadToken(roots, *set)
		if err != nil {
			c.answerJSON(map[string]any{"error": err.Error()})
			return 1
		}
		if err := WriteFieldBy(&t, *field, *to, orElse(*by, "main")); err != nil {
			c.answerJSON(map[string]any{"error": err.Error()})
			return 1
		}
		return c.answerOrFail(t, SaveToken(roots, t))
	}

	var t Token
	if *stdin {
		b, _ := io.ReadAll(c.in)
		if err := json.Unmarshal(b, &t); err != nil {
			c.answerJSON(map[string]any{"error": "the token will not read: " + err.Error()})
			return 1
		}
	} else {
		t = Token{Title: *title, Detail: *detail, ProposedAction: *action,
			Process: *process, DependsOn: splitComma(*dependsOn), Parent: *parent}
	}
	if t.Process == "" {
		t.Process = orElse(*process, "note")
	}
	// THE PROCESS SAYS WHERE A TOKEN STARTS. It is the state its first
	// activity moves work into, so the engine holds no opinion about it.
	p, err := LoadProcess(roots.Method, t.Process)
	if err != nil {
		c.answerJSON(map[string]any{"error": err.Error()})
		return 1
	}
	if t.Status == "" {
		t.Status = Status(p.StartsAt())
	}
	if t.Guidance == "" {
		if s, err := LoadSchema(roots.Method, "work-token"); err == nil {
			t.Guidance = s.Guidance
		}
	}

	// THE STEPS RIDE ALONG FROM THE BEGINNING, so a token minted from the
	// flags carries what a token written from the template carries.
	if len(t.Submission) == 0 {
		t.Submission = Checklists(p)
	}

	minted, err := Mint(roots, t)
	if err != nil {
		c.answerJSON(map[string]any{"error": err.Error()})
		return 1
	}
	c.answerJSON(minted)
	return 0
}

func (c *call) answerOrFail(t Token, err error) int {
	if err != nil {
		c.answerJSON(map[string]any{"error": err.Error()})
		return 1
	}
	c.answerJSON(t)
	return 0
}
