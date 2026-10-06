// The leave: done hands a finished group back, release lets a hold go, and
// read prints what a branch carries, as finish, release and read in
// src/scripts/work.js answer them.
// [[spec/design_output/work#a-box-leaves]]
package branches

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
)

// The stamp the check writes, the retro step a group writes before it leaves, the reason done closes on, and the length of a short commit. [[spec/design_output/work#the-battery-answers-first]]
const (
	checkStamp = runtimeFolder + "/check.json"
	retroRoot  = "retro"
	doneReason = "done"
	shortSha   = 8
	// The width of the float a JSON number decodes to. [[spec/design_output/work#the-battery-answers-first]]
	floatBits = 64
)

// Hands a finished group back: trunk in, the check green, every child closed, the retro written. [[spec/design_output/work#a-group-is-a-ticket]]
func finish(d *Doors, _ string, _ []string) int {
	branch := d.workBranchHere("done")
	if branch == "" {
		return codeRefused
	}
	name := ticketNamed(branch)
	at := ticketAt(name)
	if !d.exists(at) {
		d.warn("%s carries no %s, so there is nothing to hand back.", branch, at)
		return codeRefused
	}
	says, code := d.ready(branch)
	if code != codeOK {
		return code
	}
	if d.leftRefuses(name) {
		return codeRed
	}
	if open := d.retroOpen(d.read(at)); open != "" {
		d.warn("%s stands with %s unwritten, and the retro comes before the box leaves.", name, open)
		d.warn("Run ./RUNME.sh ticket pull %s, write each retro leaf it hands out, then run ./RUNME.sh branch done.", name)
		return codeRed
	}
	moved := d.filesUp(name, d.read(at))
	return d.leaves(branch, at, says, moved)
}

// The first retro leaf that applies on this box and stands unwritten, or nothing. [[spec/design_output/work#a-box-leaves]]
func (d *Doors) retroOpen(text string) string {
	doc := frontOf(text)
	record := entriesOf(doc)
	written := func(path string) bool {
		for at := len(record) - 1; at >= 0; at-- {
			if strings.TrimSpace(asText(record[at].Get("step"))) == path {
				last := record[at]
				return truthy(last.Get("skipped")) || (truthy(last.Get("hash_after")) && !truthy(last.Get("returns")))
			}
		}
		return false
	}
	for _, one := range leavesOf(doc) {
		if strings.Split(one.Path, "/")[0] != retroRoot {
			continue
		}
		if holds, _ := holdsHere(d.cloud(), asText(one.Said.Get("when")), ""); !holds {
			continue
		}
		if !written(one.Path) {
			return one.Path
		}
	}
	return ""
}

// Whether trunk stands in and the check passes on HEAD, and what the check says. [[spec/design_output/work#trunk-comes-in-last-too]]
func (d *Doors) ready(branch string) (string, int) {
	d.quiet("fetch", "origin", trunk)
	if behind, err := strconv.Atoi(d.quiet("rev-list", "--count", "HEAD..origin/"+trunk).Out); err == nil && behind > 0 {
		d.warn("%s holds %d commit(s) %s lacks.", trunk, behind, branch)
		d.warn("Run ./RUNME.sh branch sync, then check, then branch done.")
		d.warn("A branch older than a rule greens itself and reddens trunk.")
		return "", codeRed
	}
	green, says := saysGreen(d.read(checkStamp), d.head())
	if !green {
		d.warn("%s claims nothing yet: %s.", branch, says)
		d.warn("Commit your work, run ./RUNME.sh check, then run branch done.")
		return "", codeRed
	}
	return says, codeOK
}

// What the check's stamp says about one commit: green, or why not. [[spec/design_output/work#the-battery-answers-first]]
func saysGreen(text, sha string) (bool, string) {
	var stamp struct {
		Sha      any `json:"sha"`
		OK       any `json:"ok"`
		Clean    any `json:"clean"`
		At       any `json:"at"`
		Warnings any `json:"warnings"`
		Files    any `json:"files"`
	}
	if text == "" {
		text = "{}"
	}
	if json.Unmarshal([]byte(text), &stamp) != nil {
		stamp.Sha = nil
	}
	at := jsonText(stamp.Sha)
	switch {
	case at == "":
		return false, "no check has run here"
	case at != sha:
		return false, "the check ran against " + shortOf(at)
	case stamp.Clean != true:
		return false, "the check ran over an unclean tree"
	case stamp.OK != true:
		return false, "the check answered red at " + jsonText(stamp.At)
	}
	if warned, _ := stamp.Warnings.(float64); warned > 0 {
		files := 0
		switch held := stamp.Files.(type) {
		case []any:
			files = len(held)
		case nil:
		default:
			files = 1
		}
		return false, fmt.Sprintf("%s warning(s) stand in %d file(s), which ./RUNME.sh lint names", strconv.FormatFloat(warned, 'f', -1, floatBits), files)
	}
	return true, "the check passes on " + shortOf(sha)
}

// A JSON value as JavaScript's String reads it, and nothing for null. [[spec/design_output/work#the-battery-answers-first]]
func jsonText(said any) string {
	switch one := said.(type) {
	case nil:
		return ""
	case string:
		return one
	case float64:
		return strconv.FormatFloat(one, 'f', -1, floatBits)
	}
	return fmt.Sprint(said)
}

// A commit's short form. [[spec/design_output/work#the-battery-answers-first]]
func shortOf(sha string) string {
	if len(sha) <= shortSha {
		return sha
	}
	return sha[:shortSha]
}

// Closes the group done on the branch, drops its cloud marker, commits and pushes, and says what comes next. [[spec/design_output/work#a-box-leaves]]
func (d *Doors) leaves(branch, at, says string, moved []string) int {
	name := strings.TrimPrefix(branch, workBranch)
	after := d.head()
	now := withHashAfter(d.read(at), after)
	now = withField(withField(now, "state", closedState), "reason", doneReason)
	now = withoutField(now, "todo")
	_ = d.write(at, now)
	d.quiet("add", at)
	d.marks(name, false)
	d.quiet("commit", "-m", branch+": the box leaves")
	if !d.loud("push", "origin", branch).OK {
		return codeRed
	}
	d.say("%s carries %s, and %s.", branch, shortOf(after), says)
	if len(moved) == 0 {
		d.say("%s stands %s, and every ticket in it is closed.", name, closedState)
	} else {
		parent := fieldOf(d.read(at), groupField)
		if parent == "" {
			parent = "the top"
		}
		d.say("%s stands %s, and hands %s to %s.", name, closedState, strings.Join(moved, ", "), parent)
	}
	// The pull request opens in the same call, and a run with no token leaves it to the dispatch and the work skill. [[spec/tickets/branch-done-opens-the-pr]]
	row := pullRow{Branch: branch}
	if d.workPull(branch, &row) == codeOK {
		d.say("The pull request over %s against %s stands %s, with auto-merge on: %s", branch, trunk, row.State, row.URL)
		return codeOK
	}
	d.say("%s", row.Why)
	d.say("Open the pull request over %s against %s, with auto-merge on, as the work skill says.", branch, trunk)
	return codeOK
}

// Puts this branch, or the one named, back to todo. [[spec/design_output/work#a-stale-group-is-yours]]
func release(d *Doors, name string, _ []string) int {
	here := d.here()
	branch := workBranch + name
	if name == "" {
		branch = d.workBranchHere("release")
	}
	if branch == "" || d.dirty(branch) {
		return codeRefused
	}
	group := ticketNamed(branch)
	ticket := d.textAt("origin/"+branch, ticketAt(group))
	if !isGroup(ticket) {
		d.warn("%s carries no group at %s.", branch, ticketAt(group))
		return codeRed
	}
	if groupStanding(ticket) == done {
		d.warn("%s stands at %s. Read it before you reopen it.", branch, done)
		return codeRed
	}
	if !d.onBranch(branch) {
		return codeRed
	}
	return d.letGo(branch, group, here)
}

// Prints the group ticket a work branch carries on origin. [[spec/design_output/work#a-group-is-a-ticket]]
func read(d *Doors, name string, _ []string) int {
	if name == "" {
		d.warn("branch read needs a name: ./RUNME.sh branch read fix-lsp")
		return codeRefused
	}
	at := ticketAt(name)
	said := d.textAt("origin/"+workBranch+name, at)
	if !isGroup(said) {
		d.warn("work/%s carries no group at %s.", name, at)
		return codeRed
	}
	d.say("%s", said)
	return codeOK
}
