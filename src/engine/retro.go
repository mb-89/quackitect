package main

import (
	"fmt"
	"os"
	"path/filepath"
	"reflect"
	"sort"
	"strings"
	"time"
)

// ONE COMMAND COLLECTS EVERYTHING A RETRO NEEDS AND DRAINS IT.
//
// THE OWNER'S WORDS: a mechanical command that collects everything a retro
// needs to know about what happened since the last retro, and the collected
// things gone from where they were, so the next retro starts empty and nothing
// is counted twice.
//
// THE ORDER THE OWNER SETTLED: rotate the log first, so the session that is
// running becomes an old file, then drain every old file. The retro then sees
// everything up to the moment it ran.
//
// WHAT IS DRAINED AND WHAT IS COPIED, and the line is who owns the file.
//
// THE LOG AND THE SCRATCHPAD ARE DRAINED. They are inside the folder being
// worked on, they are this machine's rather than the project's, and the owner
// asked for them gone.
//
// THE HARNESS TRANSCRIPTS ARE COPIED. They are not in this tree, one of them is
// being appended to while this runs, and deleting another program's file is not
// this verb's to do. A retro that truncates a running transcript takes the
// session down with it.
//
// THE CHECKS ARE NOT IN THE SCRATCHPAD, which is what makes the sweep safe by
// construction rather than by a keep list that goes stale. util/checks is in
// version control and the retro never looks at it.

// RetroDir is where a retro's folder goes, inside the folder being worked on.
func RetroDir(r Roots) string { return r.Private("retro") }

// Collected says what a retro took and where it put it.
type Collected struct {
	Folder     string   `json:"folder"`
	Logs       int      `json:"logs"`
	Scripts    int      `json:"scripts"`
	Transcript []string `json:"transcripts"`
	Missing    []string `json:"looked_for_and_missing"`
	Kept       []string `json:"kept_and_why"`
}

// AN ACTOR STILL HOLDING WORK STOPS A RETRO, AND THE REFUSAL NAMES THEM.
//
// A sweep is the one operation with no undo, and every actor keeps its files in
// the folder this drains. A retro run while a reviewer is mid-review deletes
// what that reviewer is reading.
//
// REFUSING RATHER THAN SKIPPING. A skip list leaves the retro half done, so the
// next one takes what this one skipped and the drain stops meaning anything. A
// retro is a cycle boundary, and nothing else running is what a boundary is.
func WhoIsStillWorking(r Roots, mine string) []string {
	var busy []string
	for _, t := range Tokens(r) {
		if t.Holder == "" || t.Holder == mine || t.Status.Ended() {
			continue
		}
		busy = append(busy, t.Holder+" holds "+t.ID+" ("+string(t.Status)+")")
	}
	sort.Strings(busy)
	return busy
}

// Retro collects and drains, and answers what it took.
func Retro(r Roots, actor string, transcripts map[string]string) (Collected, error) {
	var got Collected
	if busy := WhoIsStillWorking(r, actor); len(busy) > 0 {
		return got, fmt.Errorf("a retro is a cycle boundary and somebody is still working:\n  %s\n"+
			"Wait for them, or take the work back, and run it again",
			strings.Join(busy, "\n  "))
	}

	// THE LOG IS ROTATED FIRST, so the session that is running becomes an old
	// file and this retro sees it rather than the next one.
	logs := r.Private("log")
	if err := RetireCurrent(logs); err != nil {
		return got, fmt.Errorf("the running log will not set aside: %w", err)
	}

	// TWO RETROS IN ONE SECOND ARE TWO RETROS. The stamp is to the second and
	// the second one collects nothing, so without this they would share a
	// folder and the first one's index would be written over by an empty one.
	// RetireCurrent already answers this shape for the log.
	folder := filepath.Join(RetroDir(r), time.Now().UTC().Format("20060102-150405"))
	for i := 1; ; i++ {
		if _, err := os.Stat(folder); err != nil {
			break
		}
		folder = fmt.Sprintf("%s.%d", filepath.Join(RetroDir(r),
			time.Now().UTC().Format("20060102-150405")), i)
	}
	for _, sub := range []string{"log", "scratchpad", "transcript"} {
		if err := os.MkdirAll(filepath.Join(folder, sub), 0o755); err != nil {
			return got, err
		}
	}
	got.Folder = folder

	// EVERY OLD LOG MOVES. The current one is not there to move, because it was
	// only made again by whoever writes next.
	n, err := drain(logs, filepath.Join(folder, "log"), func(name string) bool {
		return strings.HasPrefix(name, "session-") && strings.HasSuffix(name, ".jsonl")
	})
	if err != nil {
		return got, err
	}
	got.Logs = n

	// THE SCRATCHPAD MOVES EXCEPT FOR TWO THINGS, AND THE INDEX SAYS WHICH.
	//
	// A FILE AN UNFINISHED TOKEN NAMES BY PATH STAYS. A note that cites a
	// scratchpad file as the artefact behind an observation loses it
	// otherwise, and since the observation gate rests on a recorded red
	// rather than on the engine seeing it, that artefact is what a reviewer
	// re-runs. A finished token's citation has done its work and goes.
	//
	// ANOTHER ACTOR'S FOLDER STAYS. The refusal above asks who holds a
	// token, and the folder asks who has files, which are different sets: an
	// agent is holderless for ordinary reasons and is still told to keep its
	// working files here.
	//
	// NARROWED RATHER THAN REFUSED, because a refusal covering everybody who
	// has pulled would refuse nearly always, and a retro nobody can run is
	// not a boundary.
	cited := citedInOpenWork(r)
	pad := r.Private("scratchpad")
	n, err = drain(pad, filepath.Join(folder, "scratchpad"), func(name string) bool {
		if cited[name] {
			got.Kept = append(got.Kept, name+": an unfinished token names it by path")
			return false
		}
		// A FOLDER, AND WHOEVER OWNS IT MAY BE WRITING TO IT.
		//
		// THE INDEX SAYS WHAT THE CODE KNOWS. This kept every directory and
		// wrote that it was another actor's, which the condition never asks:
		// the scratchpad holds a folder called pinrt and nothing says that is
		// an actor. The keep is right and wider than an actor list, so the
		// sentence is widened to match rather than the keep narrowed.
		if isDir(filepath.Join(pad, name)) && name != actor {
			got.Kept = append(got.Kept, name+": a folder, and whoever owns it may be writing to it")
			return false
		}
		return true
	})
	if err != nil {
		return got, err
	}
	got.Scripts = n

	// THE TRANSCRIPTS ARE COPIED, AND THE ONES THAT WERE NOT THERE ARE NAMED.
	// A command silent about what it looked for and missed reads as a command
	// that found everything.
	for _, harness := range sortedKeys(transcripts) {
		from := transcripts[harness]
		if from == "" {
			got.Missing = append(got.Missing, harness+": this machine says nothing about where it keeps one")
			continue
		}
		to := filepath.Join(folder, "transcript", harness+filepath.Ext(from))
		if err := copyFile(from, to, 0o644); err != nil {
			got.Missing = append(got.Missing, harness+": "+err.Error())
			continue
		}
		got.Transcript = append(got.Transcript, to)
	}

	if err := os.WriteFile(filepath.Join(folder, "index.md"), []byte(retroIndex(got)), 0o644); err != nil {
		return got, err
	}
	inSession(r, "retro", actor, "a retro collected "+folder, Yes(),
		map[string]any{"folder": folder, "logs": got.Logs, "scripts": got.Scripts})
	return got, nil
}

// citedInOpenWork answers every scratchpad entry a token that has not ended
// names by path, keyed by the name directly under the scratchpad.
//
// THE ENTRY AND NOT THE FILE. A citation reaching into a folder keeps the
// folder, because taking the folder takes the file.
func citedInOpenWork(r Roots) map[string]bool {
	kept := map[string]bool{}
	for _, t := range Tokens(r) {
		if t.Status.Ended() {
			continue
		}
		for _, one := range everyWordOn(reflect.ValueOf(t)) {
			for _, name := range scratchpadNames(one) {
				kept[name] = true
			}
		}
	}
	return kept
}

// everyWordOn answers every string the record writes for this value, asking
// the type rather than reading a list.
//
// A HAND LIST OF FIELDS IS EXACTLY THE SIZE OF WHAT SOMEBODY HAPPENED TO THINK
// OF. This read five: the detail, the guidance, the reason, the criteria and
// the findings. A citation in an evidence section, in what a reviewer
// re-watched, or in a lesson was invisible, and the sweep it survives has no
// undo. The record grows a field every few days and the walk grew none.
//
// IT FOLLOWS WHAT THE NOTE WRITES: strings, structs, slices of structs and
// maps of string, which is the same boundary wk-24be1c06ae draws over the
// parser, so the two agree by construction rather than by anybody checking.
func everyWordOn(v reflect.Value) []string {
	var out []string
	switch v.Kind() {
	case reflect.String:
		out = append(out, v.String())
	case reflect.Struct:
		for i := 0; i < v.NumField(); i++ {
			if v.Type().Field(i).PkgPath != "" {
				continue // unexported, so the note never writes it
			}
			out = append(out, everyWordOn(v.Field(i))...)
		}
	case reflect.Slice, reflect.Map:
		for _, k := range keysOrIndexes(v) {
			out = append(out, everyWordOn(k)...)
		}
	}
	return out
}

// keysOrIndexes answers the values inside a slice or a map, and a map's keys
// as well, because the note writes a key into a heading.
func keysOrIndexes(v reflect.Value) []reflect.Value {
	var out []reflect.Value
	if v.Kind() == reflect.Map {
		for _, k := range v.MapKeys() {
			out = append(out, k, v.MapIndex(k))
		}
		return out
	}
	for i := 0; i < v.Len(); i++ {
		out = append(out, v.Index(i))
	}
	return out
}

// WHERE A CITATION ENDS. A path in prose is followed by punctuation or by
// nothing, and these are the characters this record's notes put after one.
var breaksACitation = " \t\n\r\"'`,;)]"

// scratchpadNames answers the entry under .se/scratchpad each citation names.
func scratchpadNames(said string) []string {
	// A PATH IS A PATH HOWEVER IT WAS SPELLED. This machine writes a
	// backslash, so a citation pasted out of a shell, an error message or an
	// editor carries one, and reading a single spelling made those invisible
	// to a sweep with no undo. An absolute path carries them too.
	said = strings.ReplaceAll(said, string(rune(92)), "/")
	var out []string
	const lead = ".se/scratchpad/"
	for at := 0; ; {
		i := strings.Index(said[at:], lead)
		if i < 0 {
			return out
		}
		at += i + len(lead)
		end := at
		for end < len(said) && !strings.ContainsRune(breaksACitation, rune(said[end])) {
			end++
		}
		name := said[at:end]
		if cut := strings.IndexByte(name, '/'); cut >= 0 {
			name = name[:cut]
		}
		// A NAME IS WHAT IS LEFT WHEN THE SENTENCE'S PUNCTUATION COMES OFF.
		//
		// The break set above holds the punctuation a SHELL writes and not the
		// punctuation a SENTENCE writes, so a citation in the commonest form
		// English prose has, with the path ending the sentence, came back with
		// its full stop attached, matched nothing on disk, and the drain took
		// the file. Measured on this record: observed-red-criteria.txt, cited
		// once, in that spelling, on the token that promises not to take it.
		//
		// TRIMMED AFTERWARDS RATHER THAN ADDED TO THE BREAK SET, because a
		// character list is complete on the day it is written and this one was
		// not. A file name carries a dot inside it and does not end in one, so
		// what comes off is a trailing RUN of punctuation no name can end in.
		name = strings.TrimRight(name, ".:!?}>")
		if name != "" {
			out = append(out, name)
		}
		at = end
	}
}

// isDir answers whether the path is a directory.
func isDir(path string) bool {
	info, err := os.Stat(path)
	return err == nil && info.IsDir()
}

// drain moves what matches into another folder and leaves the source empty of
// it. Moving rather than copying is the whole point: the next retro starts
// empty and nothing is counted twice.
func drain(from, to string, wanted func(string) bool) (int, error) {
	entries, err := os.ReadDir(from)
	if err != nil {
		if os.IsNotExist(err) {
			return 0, nil
		}
		return 0, err
	}
	moved := 0
	for _, e := range entries {
		if wanted != nil && !wanted(e.Name()) {
			continue
		}
		if err := os.Rename(filepath.Join(from, e.Name()), filepath.Join(to, e.Name())); err != nil {
			return moved, fmt.Errorf("%s will not move: %w", e.Name(), err)
		}
		moved++
	}
	return moved, nil
}

// THE FOLDER SAYS WHAT IS IN IT AND WHAT TO DO WITH IT.
//
// A folder of files is a folder somebody has to work out. The one thing a
// reader needs telling is what v3's retro asked: which scripts here a tool
// could own, and that keeping one means moving it into the method rather than
// leaving it for the next retro to take again.
func retroIndex(got Collected) string {
	var b strings.Builder
	b.WriteString("# A retro\n\nWhat this folder holds, and what to do with it.\n\n")
	fmt.Fprintf(&b, "- log: %d file(s) the record wrote since the last retro\n", got.Logs)
	fmt.Fprintf(&b, "- scratchpad: %d thing(s) an agent wrote while working\n", got.Scripts)
	fmt.Fprintf(&b, "- transcript: %d harness transcript(s), copied\n", len(got.Transcript))
	if len(got.Missing) > 0 {
		b.WriteString("\nLOOKED FOR AND NOT FOUND:\n")
		for _, m := range got.Missing {
			b.WriteString("- " + m + "\n")
		}
	}
	// WHAT WAS LEFT BEHIND, AND WHY, IN THE THING A PERSON OPENS.
	//
	// The keep was built and the half that says what it kept was not, so the
	// index carried three counts and the LOOKED FOR AND NOT FOUND block and
	// no word about anything left in place. A retro that leaves a file and
	// does not say so reads exactly like one that took it.
	//
	// IT IS THE HALF WITH NO OUTPUT, which is why it went missing: the keep
	// can be shown by pointing at a file that is still there, and this one
	// can only be shown by reading the page.
	if len(got.Kept) > 0 {
		b.WriteString("\nLEFT WHERE IT WAS, AND WHY:\n")
		for _, k := range got.Kept {
			b.WriteString("- " + k + "\n")
		}
	}
	b.WriteString("\nA SCRIPT WORTH KEEPING IS MOVED INTO THE METHOD, into util/checks, " +
		"and not left here. This folder is read once. Anything left in it is read " +
		"again by nobody, and a script that earns its place belongs where every " +
		"submission runs it.\n")
	b.WriteString("\nTHE STANDING CHECKS ARE NOT HERE AND WERE NEVER TAKEN. They live in " +
		"util/checks, which is in version control, so a sweep of the scratchpad " +
		"cannot reach them.\n")
	return b.String()
}

// WHERE EACH HARNESS KEEPS ITS TRANSCRIPT, and it is a different answer per
// harness because each one decided for itself.
//
// CLAUDE SAYS SO ITSELF. The guard is handed the transcript's path on every
// tool call and remembers it in heard.json, so the engine knows it without
// guessing.
//
// COPILOT IS BEST EFFORT AND SAYS SO. It keeps its sessions under the editor's
// workspace storage, and which folder belongs to this project is the editor's
// business rather than the engine's. What is here is the folder to look in, and
// a retro that finds nothing says which folder it looked in rather than being
// silent about a harness it missed.
func Transcripts(r Roots) map[string]string {
	out := map[string]string{"claude": "", "copilot": ""}
	if h := loadHeard(r); h.Path != "" {
		if _, err := os.Stat(h.Path); err == nil {
			out["claude"] = h.Path
		}
	}
	if home, err := os.UserHomeDir(); err == nil {
		// The newest chat session under the editor's storage, if there is one.
		if p := newestUnder(filepath.Join(home, "AppData", "Roaming", "Code",
			"User", "workspaceStorage"), ".json"); p != "" {
			out["copilot"] = p
		}
	}
	return out
}

// newestUnder answers the newest file with that suffix below a folder, or
// nothing. A folder that is not there is not an error: it means this machine
// does not run that harness.
func newestUnder(dir, suffix string) string {
	best, newest := "", time.Time{}
	filepath.WalkDir(dir, func(path string, d os.DirEntry, err error) error {
		if err != nil || d.IsDir() || !strings.HasSuffix(path, suffix) {
			return nil
		}
		if !strings.Contains(strings.ToLower(path), "chat") {
			return nil
		}
		info, err := d.Info()
		if err == nil && info.ModTime().After(newest) {
			best, newest = path, info.ModTime()
		}
		return nil
	})
	return best
}
