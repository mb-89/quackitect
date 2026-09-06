package main

import (
	"encoding/json"
	"flag"
	"fmt"

	saidbefore "quackitect/engine/internal/said"
)

// THE RECORD VERBS. What the person said, what was answered, and what the
// configuration is, as verbs the engine that lives runs, so the lane and the
// command line reach them without starting a process. The flag form of each
// stays for a person at a prompt, and both call the same functions.

func runSaid(c *call) int {
	fs := flag.NewFlagSet("said", flag.ContinueOnError)
	fs.Usage = func() {
		fmt.Fprintln(c.err, "se said - put what the person said in the record, word for word.")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  se said --text \"...\" --actor main")
		fmt.Fprintln(c.err, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	text := fs.String("text", "", "their sentence, whole")
	actor := fs.String("actor", "", "who was told. Empty writes the record and owes nobody")
	if code, stop := c.parse(fs, "said"); stop {
		return code
	}
	if *text == "" {
		return c.fail(fmt.Errorf("say what they said, with --text"))
	}
	// ONE PROMPT, ONE RECORD. The engine copies the same messages off the
	// transcript, so this refuses a repeat rather than asking the caller to
	// check.
	if saidbefore.Already(SessionLog(c.roots), *text) {
		fmt.Fprintln(c.out, "already recorded")
		return 0
	}
	noteInLog(c.roots.Private("log"), "user", "prompt", *text, nil, nil)
	if err := TheyAskedIfNamed(c.roots, *actor, *text); err != nil {
		return c.fail(err)
	}
	fmt.Fprintln(c.out, "recorded")
	return 0
}

func runAnswer(c *call) int {
	fs := flag.NewFlagSet("answer", flag.ContinueOnError)
	fs.Usage = func() {
		fmt.Fprintln(c.err, "se answer - put your answer to them in the record.")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  se answer --text \"...\" --actor main")
		fmt.Fprintln(c.err, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	text := fs.String("text", "", "the answer, whole")
	actor := fs.String("actor", "", "who is answering. Empty writes the record and clears nobody")
	if code, stop := c.parse(fs, "answer"); stop {
		return code
	}
	if *text == "" {
		return c.fail(fmt.Errorf("say what you answered, with --text"))
	}
	noteInLog(c.roots.Private("log"), "agent", "answer", *text, nil, nil)
	if err := TheyWereAnsweredIfNamed(c.roots, *actor); err != nil {
		return c.fail(err)
	}
	// AND THE PERSON'S OWN PRESS, WHICH NAMES NO AGENT. See ThePersonWasAnswered.
	if err := ThePersonWasAnswered(c.roots); err != nil {
		return c.fail(err)
	}
	// AND ON A CLOUD BOX THE RECORD IS NOT WHERE THEY READ IT.
	//
	// THE OWNER'S RULING: answer me in the chat, or I do not see it. A desk has
	// a person beside it and a panel that draws the record, so "recorded" is the
	// whole story there. Nobody sits beside a cloud box, and the chat is the only
	// surface it has. So the same word is true and misleading at once, and this
	// says the half it left out.
	//
	// THE CARD ALREADY SAYS IT. A card is read once, at session start, and this
	// is needed at the moment the verb is used. Where the box is comes off the
	// one host table, so nothing here keeps a second list of variables.
	if TheHost(c.roots.Method).Cloud {
		fmt.Fprintln(c.out, "recorded. Nobody reads the record on a cloud box, "+
			"so say this answer in the chat as well, whole.")
		return 0
	}
	fmt.Fprintln(c.out, "recorded")
	return 0
}

func runConfig(c *call) int {
	fs := flag.NewFlagSet("config", flag.ContinueOnError)
	fs.Usage = func() {
		fmt.Fprintln(c.err, "se config - print every parameter, its value, and where the value came from.")
		fmt.Fprintln(c.err, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	if code, stop := c.parse(fs, "config"); stop {
		return code
	}
	v, err := LoadValues(c.roots)
	if err != nil {
		return c.fail(err)
	}
	out, _ := json.MarshalIndent(map[string]any{
		"value": v.Value, "from": v.From, "emergency": LoadEmergency(c.roots)}, "", "  ")
	fmt.Fprintln(c.out, string(out))
	return 0
}
