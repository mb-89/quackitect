// The guidance a hand holds: unnamed the held step's notes and the always-on
// ones, named one note, and --step the notes a process step resolves, as
// src/scripts/guidance-verb.js answers it.
// [[spec/design_output/pull#the-work-answer]]
package branches

import (
	"os"
	"path/filepath"
	"slices"
	"strings"

	"quackitect/src/modules/hooks/brief"
	"quackitect/src/yaml"
)

// The folders the notes and the processes stand in, the flags the verb reads, and the mark of a draft note. [[spec/design_input/level-two#guidance]]
const (
	guidanceFolder = "spec/guidance"
	processFolder  = "spec/processes"
	stepFlag       = "--step"
	asFlag         = "--as"
	draftMark      = "_"
)

// Prints the notes the held step reads, the one note named, or a process step's. [[spec/design_output/pull#the-work-answer]]
func guidance(d *Doors, _ string, argv []string) int {
	rest := argv[min(1, len(argv)):]
	if step := flagIn(rest, stepFlag); step != "" {
		return d.stepNotes(step)
	}
	if name := nameIn(rest); name != "" {
		if strings.TrimSpace(d.guidanceText(name)) == "" {
			d.warn("%s names no note, so nothing stands to read.", name)
			d.warn("Run ./RUNME.sh standing to read every note binding this session.")
			return codeRed
		}
		return d.notesSaid([]string{name})
	}
	hand := d.handOf()
	if as := flagIn(rest, asFlag); as != "" {
		hand += " · " + as
	}
	held := d.holdOf(hand)
	if held == nil {
		d.warn("Nothing stands in your hand, so no step names a note.")
		d.warn("Run ./RUNME.sh ticket pull to take a leaf, or name a note.")
		return codeRed
	}
	var paths []string
	for _, one := range held.Reads {
		paths = append(paths, one.Name)
	}
	for _, one := range d.alwaysOn() {
		if !slices.Contains(paths, one) {
			paths = append(paths, one)
		}
	}
	return d.notesSaid(paths)
}

// The value a flag carries, as the next word or after an equals sign. [[spec/design_output/pull#the-work-answer]]
func flagIn(rest []string, flag string) string {
	if at := slices.Index(rest, flag); at >= 0 {
		return strings.TrimSpace(word(rest, at+1))
	}
	for _, one := range rest {
		if said, ok := strings.CutPrefix(one, flag+"="); ok {
			return strings.TrimSpace(said)
		}
	}
	return ""
}

// The note a word names, past the flags and the hand's own name. [[spec/design_output/pull#the-work-answer]]
func nameIn(rest []string) string {
	as := flagIn(rest, asFlag)
	for at := 0; at < len(rest); at++ {
		one := rest[at]
		if one == asFlag {
			at++
			continue
		}
		if strings.HasPrefix(one, "--") || one == as {
			continue
		}
		return strings.TrimSuffix(bare(one), noteEnd)
	}
	return ""
}

// The notes a process step resolves, off the Go guidance rows. [[spec/design_input/level-two#guidance]]
func (d *Doors) stepNotes(step string) int {
	name, path, _ := strings.Cut(step, ":")
	at := processFolder + "/" + name + ".yaml"
	if !d.exists(at) {
		d.warn("%s names no process under %s.", name, processFolder)
		return codeRed
	}
	doc := yaml.New()
	if read := yaml.AsDoc(yaml.Read(d.read(at))); read != nil {
		doc.Set("steps", read.Get("steps"))
	}
	if leafOf(doc, path) == nil {
		d.warn("%s names no step %s, or names one holding steps.", name, path)
		return codeRed
	}
	if d.Guidance == nil {
		return d.notesSaid(nil)
	}
	rows, err := d.Guidance()
	if err != nil {
		d.warn("%v", err)
		return codeRed
	}
	return d.notesSaid(rows[name+":"+path])
}

// A note's text, the work root's over the method root's. [[spec/design_output/vehicle#the-work-root-inherits]]
func (d *Doors) guidanceText(path string) string {
	if d.exists(path + noteEnd) {
		return d.read(path + noteEnd)
	}
	return readFile(d.methodAt(path + noteEnd))
}

// Every note under the guidance folder binding here: one naming no env, or one whose env reads true. [[spec/design_input/level-two#guidance]]
func (d *Doors) alwaysOn() []string {
	var out []string
	root := d.at(guidanceFolder)
	_ = filepath.WalkDir(root, func(at string, entry os.DirEntry, err error) error {
		if err != nil || entry.IsDir() || !strings.HasSuffix(entry.Name(), noteEnd) || strings.HasPrefix(entry.Name(), draftMark) {
			return nil
		}
		rel, _ := filepath.Rel(d.Root, at)
		path := strings.TrimSuffix(filepath.ToSlash(rel), noteEnd)
		if d.bindsHere(d.guidanceText(path)) {
			out = append(out, path)
		}
		return nil
	})
	return out
}

// Whether a note binds here: it names no env, or one it names reads true. [[spec/tickets/cloud-note-reaches-every-step]]
func (d *Doors) bindsHere(text string) bool {
	wants := yaml.StringsOf(frontOf(text).Get("env"))
	var names []string
	for _, one := range wants {
		for _, part := range strings.Split(strings.Trim(strings.TrimSpace(one), "[]"), ",") {
			if part = strings.TrimSpace(part); part != "" {
				names = append(names, part)
			}
		}
	}
	if len(names) == 0 {
		return true
	}
	for _, name := range names {
		said := strings.ToLower(strings.TrimSpace(d.env(name)))
		if said != "" && said != "0" && said != "false" {
			return true
		}
	}
	return false
}

// Prints each note carrying rules, under a heading naming it. [[spec/design_output/pull#the-work-answer]]
func (d *Doors) notesSaid(paths []string) int {
	var rows []string
	for _, path := range paths {
		rules := brief.RulesOf(d.guidanceText(path))
		if len(rules) == 0 {
			continue
		}
		rows = append(append(rows, "", "# Reads "+path, ""), rules...)
	}
	if len(rows) == 0 {
		d.say("No note here carries an Actionables chapter.")
		return codeOK
	}
	d.say("%s", strings.TrimSpace(strings.Join(rows, "\n")))
	return codeOK
}
