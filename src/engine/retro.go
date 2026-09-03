package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"reflect"
	"runtime"
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
	Outputs    int      `json:"outputs"`
	Undos      int      `json:"undos"`
	Transcript []string `json:"transcripts"`
	Missing    []string `json:"looked_for_and_missing"`
	Kept       []string `json:"kept_and_why"`

	// WHAT THE ENGINE SENT, MEASURED. The retro is where the size of the thing
	// this engine hands an agent stops being a feeling and becomes a number
	// somebody can watch fall.
	Sent Sizes `json:"sent"`
}

// Sizes is what one turn costs, in bytes, at the places an agent is handed
// something. Each is measured now rather than remembered, so a number here is
// about the tree as it stands.
type Sizes struct {
	Prompt   int `json:"standing_prompt"`
	Tools    int `json:"tool_list,omitempty"`
	Pull     int `json:"a_pull_answer"`
	Refusal  int `json:"a_gate_refusal"`
	OutKept  int `json:"output_kept_on_disk"`
	PageSize int `json:"one_output_window"`
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
		if t.Holder == "" || t.Holder == mine || t.Ended() {
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
	for _, sub := range []string{"log", "scratchpad", "transcript", "out", "undo"} {
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

	// WHAT COMMANDS PRINTED, AND WHAT APPLIES OVERWROTE.
	//
	// Both grow one file per call and nothing drained them, so a folder nobody
	// opens filled with the output of every command ever run. They move whole:
	// a kept output is what an agent was reading and an undo journal is what a
	// change would be put back from, and neither survives the session that made
	// it useful.
	if n, err := drain(outDir(r), filepath.Join(folder, "out"), everyFile); err == nil {
		got.Outputs = n
	}
	if n, err := drain(undoDir(r), filepath.Join(folder, "undo"), everyFile); err == nil {
		got.Undos = n
	}

	got.Sent = whatItSends(r)

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

	if err := writeAtomic(filepath.Join(folder, "index.md"), []byte(retroIndex(got)), 0o644); err != nil {
		return got, err
	}
	inSession(r, "retro", actor, "a retro collected "+folder, Yes(),
		map[string]any{"folder": folder, "logs": got.Logs, "scripts": got.Scripts,
			"outputs": got.Outputs, "undos": got.Undos})
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
		if t.Ended() {
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
// maps of string, which is the boundary the frontmatter reader draws, so the
// two agree by construction rather than by anybody checking.
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
	fmt.Fprintf(&b, "- out: %d kept command output(s)\n", got.Outputs)
	fmt.Fprintf(&b, "- undo: %d journal(s) of what an apply overwrote\n", got.Undos)

	// WHAT THE ENGINE SENDS, AS NUMBERS TO WATCH FALL.
	//
	// A NUMBER NOBODY WATCHES IS A NUMBER THAT GROWS. No single answer is ever
	// obviously too big, which is how the whole of it gets too big with nothing
	// anywhere saying so. These are what a turn pays, measured on this tree at
	// the moment the retro ran.
	b.WriteString("\nWHAT ONE TURN COSTS, IN BYTES:\n")
	for _, row := range []struct {
		n    int
		says string
	}{
		{got.Sent.Tools, "the tool list, sent on every turn"},
		{got.Sent.Prompt, "the standing layer, in the prompt on every turn"},
		{got.Sent.Pull, "a pull answer, at its biggest token"},
		{got.Sent.Refusal, "a gate refusal"},
		{got.Sent.PageSize, "one window of a command's output"},
		{got.Sent.OutKept, "command output kept on disk, before this retro"},
	} {
		fmt.Fprintf(&b, "- %6d  %s\n", row.n, row.says)
	}
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

// everyFile takes everything in a folder, which is what draining one means.
func everyFile(string) bool { return true }

// whatItSends measures the places this engine hands an agent something.
//
// MEASURED NOW, NOT REMEMBERED. Each number is read off the tree as it stands,
// so a retro says what a turn costs today rather than what somebody wrote down
// when they last looked.
//
// A NUMBER NOBODY WATCHES IS A NUMBER THAT GROWS. v3's answers to an agent grew
// until they were the problem, and nothing anywhere said so, because no single
// answer was obviously too big. These are the four an agent pays on every turn
// or close to it, so the retro is where the trend shows.
func whatItSends(r Roots) Sizes {
	out := Sizes{PageSize: ThePageSize}

	// The standing layer, which every turn carries whether or not it is read.
	for _, p := range mustProjections(r) {
		if p.Section != "Actionables" {
			continue
		}
		if b, err := os.ReadFile(filepath.Join(r.Work, filepath.FromSlash(p.Target))); err == nil {
			if len(b) > out.Prompt {
				out.Prompt = len(b)
			}
		}
	}

	// THE TOOL LIST, ASKED OF THE LANE ITSELF. It is the second biggest thing a
	// turn carries and the engine does not own it, so it is measured by asking
	// rather than guessed at. A lane that is not built leaves the number out
	// rather than reporting nought, because nought reads as "it costs nothing".
	out.Tools = theToolList(r)

	// A pull answer, taken without moving anything: the biggest token there is,
	// plus what a pull wraps around it.
	var biggest Token
	for _, t := range Tokens(r) {
		if t.Ended() {
			continue
		}
		if b, err := json.Marshal(t); err == nil && len(b) > len(asSent(biggest)) {
			biggest = t
		}
	}
	if biggest.ID != "" {
		a := Answer{Pull: AnswerWork, Token: &biggest, Notice: workNotice(biggest),
			GuidanceAt: "doc/guidance/work-token.md is in your prompt already"}
		out.Pull = len(asSent(a))
	}

	// A gate refusal, which is the message an agent hits most often when it is
	// getting something wrong.
	out.Refusal = len(theRefusal(r, "main", "Write", "src/engine/x.go"))

	// And what the kept output has grown to since the last retro.
	if names, err := os.ReadDir(outDir(r)); err == nil {
		for _, n := range names {
			if info, err := n.Info(); err == nil {
				out.OutKept += int(info.Size())
			}
		}
	}
	return out
}

// theToolList is how many bytes the lane sends an agent on every turn, or nought
// where there is no lane built to ask.
func theToolList(r Roots) int {
	exe := filepath.Join(r.Method, ".bin", "se-mcp")
	if runtime.GOOS == "windows" {
		exe += ".exe"
	}
	if _, err := os.Stat(exe); err != nil {
		return 0
	}
	cmd := Quietly(exec.Command(exe, "--work", r.Work))
	cmd.Stdin = strings.NewReader(
		`{"jsonrpc":"2.0","id":0,"method":"initialize","params":{}}` + nl +
			`{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}` + nl)
	said, err := cmd.Output()
	if err != nil {
		return 0
	}
	// THE ANSWER TO THE SECOND QUESTION, NOT THE FIRST. Initialize replies with
	// a capabilities block that also holds the word tools, and it is 147 bytes,
	// so matching the word alone measured the wrong line and said the tool list
	// was small.
	for _, line := range strings.Split(string(said), nl) {
		var m struct {
			ID     int `json:"id"`
			Result struct {
				Tools []json.RawMessage `json:"tools"`
			} `json:"result"`
		}
		if json.Unmarshal([]byte(line), &m) == nil && m.ID == 1 && len(m.Result.Tools) > 0 {
			return len(line)
		}
	}
	return 0
}

// mustProjections answers what is projected, or nothing. A retro that cannot
// read the declaration measures what it can rather than refusing to run.
func mustProjections(r Roots) []Projection {
	list, err := LoadProjections(r.Method)
	if err != nil {
		return nil
	}
	return list
}

// asSent is a value the size the agent would receive it, or nothing.
func asSent(v any) []byte {
	b, err := json.Marshal(v)
	if err != nil {
		return nil
	}
	return b
}
