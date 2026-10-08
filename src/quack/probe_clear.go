// The dry probe's clear road. The clone mints its own group, runs on past a
// low handover key through the real pull, and carries a leaf across the clear.
// [[spec/tickets/probes-leave-node]]
package main

import (
	"encoding/json"
	"fmt"
	"path/filepath"
	"regexp"
	"strings"

	"quackitect/src/modules/config"
	"quackitect/src/modules/hooks"
)

// The clear road's words: the group the probe mints, the leaf it carries across the clear, the handover it writes, and what each pull past the clear answers. [[spec/tickets/the-clear-hands-back-the-leaf]]
const (
	dryGroup        = "dry-probe-clears"
	dryLeaf         = "dry-probe-leaf"
	dryHandoverFile = ".se/HANDOVER.md"
	dryHandoverText = "# Handover\n\nThe dry probe stands nothing in hand, and the queue holds what waits.\n"
	dryAnswer       = "The handover stands, and the clear ends this turn."
	dryReadHeld     = "read-handover stands in your hand."
	dryLeafHanded   = "work  " + dryLeaf + " at do"
	dryLeafText     = "---\nkind: [[ticket]]\nstate: open\nsteps:\n  - name: do\n    does: makes the change\n    evidence:\n      - name: says\n        form: text\n        says: what changes\nprocess: [[spec/processes/trivial]]\ngroup: " + dryGroup + "\n---\n\n# Ask\n\nThe leaf the dry probe carries across the clear.\n\n# do\n\n## says\n\n<!-- what changes -->\n\n# Discussion\n"
)

// The author a probe commit in the clone carries. [[spec/tickets/probe-clone-drops-free-tags]]
var dryAuthor = []string{"-c", "user.name=probe", "-c", "user.email=probe@probe"}

// The park line a ticket carries, which the clone drops. [[spec/tickets/prompt-flags-follow-prompt-verb]]
var parkLine = regexp.MustCompile(`(?m)^todo: true\r?\n`)

// One run of the clear road: its words, its exit, and what it says. [[spec/tickets/probes-leave-node]]
type dryRan struct {
	words string
	exit  int
	said  string
}

// What the clear road leaves: its runs, the pull past the clear, the read's pass, and the leaf's commit. [[spec/tickets/probes-leave-node]]
type dryCleared struct {
	runs         []dryRan
	pulled, read string
	committed    dryRan
}

// The session runs on past a low handover key: the handover and the clear off the real pull, the turn's end, then the read, the leaf's commit and a second end. [[spec/tickets/the-clear-hands-back-the-leaf]]
func (s *dryRun) clearRun(env map[string]string) *dryCleared {
	pull := func(words ...string) dryRan {
		argv := append([]string{filepath.Join(s.tree, "RUNME.sh"), "ticket", "pull"}, words...)
		ran := s.d.run(argv, runOpts{cwd: s.tree, env: env, timeout: dryEventWait})
		return dryRan{words: strings.Join(words, " "), exit: ran.code, said: ran.stdout + ran.stderr}
	}
	cleared := &dryCleared{runs: []dryRan{grouped(s.d, s.tree, env)}}
	keyed(s.d.disk, s.tree)
	s.raise("prompt.submit", map[string]any{"text": "carry on", "origin": map[string]any{"kind": dryOwner}})
	s.raise(dryToolCall, map[string]any{"tool": "Read", "file_path": filepath.Join(s.tree, "README.md")})
	cleared.runs = append(cleared.runs, pull())
	_ = s.d.disk.write(filepath.Join(s.tree, filepath.FromSlash(dryHandoverFile)), []byte(dryHandoverText), 0o644)
	cleared.runs = append(cleared.runs, pull("handover", "--pass"))
	s.ends()
	cleared.pulled = pull().said
	cleared.read = pull("--pass").said
	cleared.committed = committedLeaf(s.d, s.tree)
	s.ends()
	return cleared
}

// The probe mints its own group, drops every park, and stands on its work branch as origin holds it, so the handover meets no work the box alone holds. [[spec/tickets/the-clear-carries-no-local-work]] [[spec/tickets/probe-clone-drops-free-tags]]
func grouped(d boxDoors, tree string, env map[string]string) dryRan {
	opts := runOpts{cwd: tree, timeout: dryEventWait}
	minted := d.run([]string{filepath.Join(tree, "RUNME.sh"), "mint", "ticket", "spec/tickets/" + dryGroup + ".md", "--process=trivial"}, runOpts{cwd: tree, env: env, timeout: dryEventWait})
	leaf := filepath.Join(tree, "spec", "tickets", dryLeaf+".md")
	_ = d.disk.makeAll(filepath.Dir(leaf), 0o755)
	_ = d.disk.write(leaf, []byte(dryLeafText), 0o644)
	unparked(d, tree)
	branched := d.run([]string{"git", "checkout", "-q", "-B", "work/" + dryGroup}, opts)
	d.run(append(append([]string{"git"}, dryAuthor...), "commit", "-q", "-a", "--allow-empty", "-m", "dry probe: no ticket of the tree stands tagged"), opts)
	pushed := d.run([]string{"git", "update-ref", "refs/remotes/origin/work/" + dryGroup, "HEAD"}, opts)
	ran := dryRan{words: "mint " + dryGroup}
	for _, one := range []ranResult{minted, branched, pushed} {
		if one.code != 0 {
			ran.exit, ran.said = one.code, one.stdout+one.stderr
			break
		}
	}
	return ran
}

// The clone carries the tickets its source box parks, and a parked ticket goes out ahead of the probe's leaf, so the clone drops every park and commits that. [[spec/tickets/prompt-flags-follow-prompt-verb]]
func unparked(d boxDoors, tree string) {
	opts := runOpts{cwd: tree, timeout: dryEventWait}
	parked := d.run([]string{"git", "grep", "-l", "^todo: true$", "--", "spec/tickets"}, opts)
	if parked.code != 0 {
		return
	}
	var files []string
	for _, file := range strings.Split(parked.stdout, "\n") {
		at := filepath.Join(tree, filepath.FromSlash(file))
		body, err := d.disk.read(at)
		text := string(body)
		if file == "" || err != nil {
			continue
		}
		first := parkLine.FindStringIndex(text)
		if first == nil {
			continue
		}
		if d.disk.write(at, []byte(text[:first[0]]+text[first[1]:]), 0o644) == nil {
			files = append(files, file)
		}
	}
	if len(files) == 0 {
		return
	}
	d.run(append(append(append([]string{"git"}, dryAuthor...), "commit", "-q", "-m", "the probe unparks its clone", "--"), files...), opts)
}

// Sets the handover key under the fill the session reports, so the first measure marks the session due. [[spec/tickets/the-clear-continues-the-session]]
func keyed(disk diskDoors, tree string) {
	at := filepath.Join(tree, filepath.FromSlash(config.Local))
	was := map[string]any{}
	if text, err := disk.read(at); err == nil {
		_ = json.Unmarshal(text, &was)
	}
	context, _ := was["context"].(map[string]any)
	if context == nil {
		context = map[string]any{}
	}
	context["handoverAt"] = dryKey
	was["context"] = context
	text, _ := json.Marshal(was)
	_ = disk.makeAll(filepath.Dir(at), 0o755)
	_ = disk.write(at, append(text, '\n'), 0o644)
}

// The work the leaf makes lands as a commit on the box's branch, and origin carries it. [[spec/tickets/the-clear-hands-back-the-leaf]]
func committedLeaf(d boxDoors, tree string) dryRan {
	opts := runOpts{cwd: tree, timeout: dryEventWait}
	commit := d.run(append(append([]string{"git"}, dryAuthor...), "commit", "-q", "--allow-empty", "-m", dryLeaf+": the leaf lands"), opts)
	pushed := d.run([]string{"git", "update-ref", "refs/remotes/origin/work/" + dryGroup, "HEAD"}, opts)
	for _, one := range []ranResult{commit, pushed} {
		if one.code != 0 {
			return dryRan{words: "commit", exit: one.code, said: one.stdout + one.stderr}
		}
	}
	return dryRan{words: "commit"}
}

// The turn's end clears the conversation once, the resume prompt opens the next, and the read past it hands the leaf. [[spec/tickets/the-clear-continues-the-session]]
func clearHeld(seen drySeen) (bool, string) {
	run := seen.cleared
	if run == nil {
		return false, "the session never reaches the clear"
	}
	before := ""
	for _, one := range run.runs {
		if one.exit != 0 {
			return false, fmt.Sprintf("%sthe pull %s answers %d: %s", before, orElse(one.words, "alone"), one.exit, lastLineOf(one.said))
		}
		before += fmt.Sprintf("the pull %s answers %s; ", orElse(one.words, "alone"), lastLineOf(one.said))
	}
	var clears []hooks.Effect
	for _, post := range seen.posts {
		for _, one := range post.effects {
			if one.Kind == dryClearKind {
				clears = append(clears, one)
			}
		}
	}
	if len(clears) == 0 {
		last := run.runs[len(run.runs)-1]
		return false, fmt.Sprintf("no clear runs, and the pull %s answers: %s", orElse(last.words, "alone"), lastLineOf(last.said))
	}
	if clears[0].Text != hooks.ResumePrompt {
		return false, "the next conversation opens on: " + orElse(lastLineOf(clears[0].Text), "no prompt")
	}
	if !strings.Contains(run.pulled, dryReadHeld) {
		return false, "the pull after the clear answers: " + orElse(lastLineOf(run.pulled), "nothing")
	}
	if !strings.Contains(run.read, dryLeafHanded) {
		return false, "the read's pass hands no leaf: " + orElse(lastLineOf(run.read), "nothing")
	}
	if run.committed.exit != 0 {
		return false, fmt.Sprintf("the leaf's commit answers %d: %s", run.committed.exit, lastLineOf(run.committed.said))
	}
	if len(clears) != 1 {
		return false, fmt.Sprintf("the turn ends run %d clear(s) in all, and one stands", len(clears))
	}
	return true, "the clear runs, the resume prompt opens, the read hands the leaf, the commit lands, and no second clear runs"
}
