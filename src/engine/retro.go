package main

import (
	"bufio"
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

// WHAT THE NEXT RETRO READS LIVES WHERE NO DRAIN LOOKS.
//
// A retro's report and its period's counts are the two things a later retro
// reads: one rule scores the last retro's improvements, another compares this
// period's shape against earlier ones. The report was written into the folder
// above, which is the folder a retro fills and empties, and the counts were
// written down nowhere at all. Then the guidance sent the report to doc/retro,
// which git sees and nothing carries off the machine anyway.
//
// THE OWNER'S RULING: it is too early for a proper retro system. The reports
// stay on this machine and out of git, and the drain never touches them. So
// they live here: under .se, which .gitignore covers, and in a folder no drain
// in this file names.
func ReportsDir(r Roots) string { return r.Private("reports") }

// THE COUNTS AND THE REPORT SHARE THE RETRO'S STAMP, so the pair belonging to
// one period is found by name rather than by a list somebody maintains.
const countsSuffix = ".counts.json"

// Counts is one period in numbers: what the retro took, and what a turn cost
// while it was running. The engine writes it, because a number a person is
// asked to copy down is a number that stops being written.
type Counts struct {
	Stamp   string `json:"stamp"`
	Folder  string `json:"folder"`
	Logs    int    `json:"logs"`
	Scripts int    `json:"scripts"`
	Outputs int    `json:"outputs"`
	Undos   int    `json:"undos"`
	Sent    Sizes  `json:"sent"`
}

// Period is what one retro left for the next: its counts, and the report
// whoever ran it wrote, where they wrote one.
type Period struct {
	Stamp  string `json:"stamp"`
	Counts Counts `json:"counts"`
	Report string `json:"report,omitempty"`
}

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

	// WHERE THIS PERIOD IS WRITTEN DOWN, AND WHAT EARLIER ONES LEFT. None of
	// these is in the folder above, which is the folder the next retro empties.
	// A place nobody is told about is a place nobody writes to, so the retro
	// says where its report goes rather than leaving it to be remembered.
	Counts  string   `json:"counts"`
	Report  string   `json:"report"`
	Earlier []Period `json:"earlier"`

	// WHAT THE ENGINE SENT, MEASURED. The retro is where the size of the thing
	// this engine hands an agent stops being a feeling and becomes a number
	// somebody can watch fall.
	Sent Sizes `json:"sent"`

	// HOW THE AGENT WROTE WHILE THE PERIOD RAN, and the file it is written in.
	// The rules refuse a write at the time; this is the same rules read back
	// over a whole session, which is where a habit shows and a single refusal
	// does not.
	Voice string `json:"voice"`

	// The one order over everything the folder holds. The log and the
	// transcripts arrive on separate clocks, so this is where they are read as
	// one run. Unplaced counts the entries whose file carried no stamp at all,
	// because a reading that quietly leaves something out is worse than a
	// reading that says how much it could not take.
	Timeline         string `json:"timeline"`
	TimelineUnplaced int    `json:"timeline_unplaced,omitempty"`
}

// VoiceTally is one rule the agent broke while the period ran: which rule, how
// many times, and where to look.
type VoiceTally struct {
	Rule  string   `json:"rule"`
	Count int      `json:"count"`
	Where []string `json:"where"`
}

// VoiceReading is how the period read: what was looked at, what it broke, or
// why it could not be looked at.
//
// UNAVAILABLE IS NOT NOUGHT. A rules file that will not load and a session with
// nothing wrong in it are opposite answers, and reporting both as nought breaks
// would let the checker rot unnoticed behind a clean-looking number.
type VoiceReading struct {
	RulesFrom   string       `json:"rules_from,omitempty"`
	Messages    int          `json:"messages"`
	Breaches    int          `json:"breaches"`
	ByRule      []VoiceTally `json:"by_rule,omitempty"`
	Unavailable string       `json:"unavailable,omitempty"`
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

// A MANIFEST, NOT COUNTS. One JSONL line per thing: its name in the retro
// folder, where it came from, and its fate. A count is derivable from it,
// and a thing left behind or looked for and missed is on the same page as
// the things taken, so a retro that leaves a file no longer reads exactly
// like one that took it.
type manifestLine struct {
	Name   string `json:"name"`
	Origin string `json:"origin"`
	Fate   string `json:"fate"`
	Why    string `json:"why,omitempty"`
}

// takenLines answers one manifest line per name moved into the retro folder.
func takenLines(sub, origin string, names []string) []manifestLine {
	var out []manifestLine
	for _, name := range names {
		out = append(out, manifestLine{Name: sub + "/" + name, Origin: origin, Fate: "taken"})
	}
	return out
}

// asLines is the manifest as it is written: one JSON object per line.
func asLines(manifest []manifestLine) []byte {
	var b strings.Builder
	for _, l := range manifest {
		if line, err := json.Marshal(l); err == nil {
			b.Write(line)
			b.WriteString("\n")
		}
	}
	return []byte(b.String())
}

// A Transcript is one harness session's record: what the copy is called in the
// retro folder, where it is now, and whose it is.
//
// WHOSE IT IS, OR WHY THAT CANNOT BE SAID. A session file is named by the
// harness's own id and nothing on this machine maps that to an actor, so a
// transcript is attributed where the engine actually knows and is called
// unattributed where it does not. The alternative is a folder of files with
// confident names nobody can check.
type Transcript struct {
	Name string `json:"name"`
	Path string `json:"path"` // empty means it was looked for and not found
	Who  string `json:"who"`
}

// Retro collects and drains, and answers what it took.
func Retro(r Roots, actor string, transcripts []Transcript) (Collected, error) {
	var got Collected
	var manifest []manifestLine
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
	taken, err := drain(logs, filepath.Join(folder, "log"), func(name string) bool {
		return strings.HasPrefix(name, "session-") && strings.HasSuffix(name, ".jsonl")
	})
	if err != nil {
		return got, err
	}
	got.Logs = len(taken)
	sessions := taken // read for voice below, before taken is used again
	manifest = append(manifest, takenLines("log", ".se/log", taken)...)

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
	taken, err = drain(pad, filepath.Join(folder, "scratchpad"), func(name string) bool {
		if cited[name] {
			got.Kept = append(got.Kept, name+": an unfinished token names it by path")
			manifest = append(manifest, manifestLine{Name: name, Origin: ".se/scratchpad",
				Fate: "kept", Why: "an unfinished token names it by path"})
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
			manifest = append(manifest, manifestLine{Name: name, Origin: ".se/scratchpad",
				Fate: "kept", Why: "a folder, and whoever owns it may be writing to it"})
			return false
		}
		return true
	})
	if err != nil {
		return got, err
	}
	got.Scripts = len(taken)
	manifest = append(manifest, takenLines("scratchpad", ".se/scratchpad", taken)...)

	// WHAT COMMANDS PRINTED, AND WHAT APPLIES OVERWROTE.
	//
	// Both grow one file per call and nothing drained them, so a folder nobody
	// opens filled with the output of every command ever run. They move whole:
	// a kept output is what an agent was reading and an undo journal is what a
	// change would be put back from, and neither survives the session that made
	// it useful.
	if taken, err := drain(outDir(r), filepath.Join(folder, "out"), everyFile); err == nil {
		got.Outputs = len(taken)
		manifest = append(manifest, takenLines("out", ".se/out", taken)...)
	}
	if taken, err := drain(undoDir(r), filepath.Join(folder, "undo"), everyFile); err == nil {
		got.Undos = len(taken)
		manifest = append(manifest, takenLines("undo", ".se/undo", taken)...)
	}

	got.Sent = whatItSends(r)

	// HOW THE AGENT WROTE, over the sessions this retro just took. The rules
	// refuse a write at the time and see one file; this is the same rules over
	// a whole period, which is where a habit shows.
	got.Voice = filepath.Join(folder, "voice.json")
	reading, err := json.MarshalIndent(theVoiceOf(r, filepath.Join(folder, "log"), sessions), "", "  ")
	if err != nil {
		return got, err
	}
	if err := writeAtomic(got.Voice, reading, 0o644); err != nil {
		return got, err
	}

	// THE TRANSCRIPTS ARE COPIED, AND THE ONES THAT WERE NOT THERE ARE NAMED.
	// A command silent about what it looked for and missed reads as a command
	// that found everything.
	for _, t := range inNameOrder(transcripts) {
		if t.Path == "" {
			got.Missing = append(got.Missing, t.Name+": "+t.Who)
			manifest = append(manifest, manifestLine{Name: t.Name, Origin: "transcript",
				Fate: "looked for and missing", Why: t.Who})
			continue
		}
		to := filepath.Join(folder, "transcript", t.Name+filepath.Ext(t.Path))
		if err := copyFile(t.Path, to, 0o644); err != nil {
			got.Missing = append(got.Missing, t.Name+": "+err.Error())
			manifest = append(manifest, manifestLine{Name: t.Name, Origin: t.Path,
				Fate: "looked for and missing", Why: err.Error()})
			continue
		}
		got.Transcript = append(got.Transcript, to)
		// WHOSE IT IS GOES ON THE LINE, so a reader of the folder can tell a
		// transcript the engine could attribute from one it could not.
		manifest = append(manifest, manifestLine{Name: "transcript/" + t.Name + filepath.Ext(t.Path),
			Origin: t.Path, Fate: "taken", Why: t.Who})
	}

	// ONE ORDER OVER THE TWO CLOCKS, woven last, because it reads the log this
	// retro drained and the transcripts it has just copied. It leaves both
	// where they are: the sources are the evidence the weave can be checked
	// against, and a reading that consumed them could not be.
	got.Timeline, got.TimelineUnplaced = weaveTimeline(folder, transcripts)

	if err := writeAtomic(filepath.Join(folder, "manifest.jsonl"), asLines(manifest), 0o644); err != nil {
		return got, err
	}

	// WHAT EARLIER RETROS LEFT, READ BEFORE THIS ONE IS ADDED TO IT, so a retro
	// is handed the reports and counts its own rules ask it to score rather than
	// going to look for them. An input you had to hunt for is a defect in this
	// verb, and these two were the ones being hunted.
	stamp := filepath.Base(folder)
	got.Earlier = earlierPeriods(r)
	got.Counts = filepath.Join(ReportsDir(r), stamp+countsSuffix)
	got.Report = filepath.Join(ReportsDir(r), stamp+".md")
	counts, err := json.Marshal(Counts{Stamp: stamp, Folder: folder, Logs: got.Logs,
		Scripts: got.Scripts, Outputs: got.Outputs, Undos: got.Undos, Sent: got.Sent})
	if err != nil {
		return got, err
	}
	if err := writeAtomic(got.Counts, counts, 0o644); err != nil {
		return got, err
	}

	inSession(r, "retro", actor, "a retro collected "+folder, Yes(),
		map[string]any{"folder": folder, "logs": got.Logs, "scripts": got.Scripts,
			"outputs": got.Outputs, "undos": got.Undos, "counts": got.Counts,
			"earlier": len(got.Earlier)})
	return got, nil
}

// theVoiceOf reads the sessions this retro took and answers how the agent wrote
// while the period ran: which rule, how many, and where to look.
//
// ONLY THE AGENT'S WORDS. The record carries three writers and the rules are
// only about one of them. The person writes their prompt however they like, and
// the engine's own messages are nobody's prose to improve, so counting either
// would put the number out of reach of the one who could act on it.
//
// IT NEVER FAILS THE RETRO. A retro is a cycle boundary, and a checker that
// cannot run must not take one down. It says why it could not look, which is a
// different answer from a clean session and is written as one.
func theVoiceOf(r Roots, logDir string, sessions []string) VoiceReading {
	var out VoiceReading
	rules, err := LoadVoiceRules(r.Method)
	if err != nil {
		out.Unavailable = err.Error()
		return out
	}
	out.RulesFrom = rules.Source
	found := map[string][]string{}
	for _, name := range sessions {
		f, err := os.Open(filepath.Join(logDir, name))
		if err != nil {
			continue
		}
		scan := bufio.NewScanner(f)
		// A RECORD IS ONE LINE AND A LINE CAN BE LONG. The scanner's own limit is
		// 64k, and an answer carrying a whole reply passes that, so without this
		// the long records would be dropped and the count would read low while
		// looking like a measurement.
		scan.Buffer(make([]byte, 0, 64<<10), 8<<20)
		for n := 1; scan.Scan(); n++ {
			var rec Record
			if json.Unmarshal(scan.Bytes(), &rec) != nil || rec.Src != "agent" || rec.Msg == "" {
				continue
			}
			out.Messages++
			for _, b := range rules.Check(rec.Msg) {
				out.Breaches++
				found[b.Rule] = append(found[b.Rule],
					fmt.Sprintf("log/%s record %d, %s: %s", name, n, b.Where, b.Says))
			}
		}
		f.Close()
	}
	// BY RULE, IN A FIXED ORDER, so two retros over the same sessions read the
	// same way and a difference between them is about the sessions.
	var rulesBroken []string
	for rule := range found {
		rulesBroken = append(rulesBroken, rule)
	}
	sort.Strings(rulesBroken)
	for _, rule := range rulesBroken {
		where := found[rule]
		// THE COUNT IS WHOLE AND THE PLACES ARE A SAMPLE. A rule broken two
		// hundred times needs the number and somewhere to start, not two hundred
		// lines nobody reads.
		tally := VoiceTally{Rule: rule, Count: len(where), Where: where}
		if len(where) > 10 {
			tally.Where = where[:10]
		}
		out.ByRule = append(out.ByRule, tally)
	}
	return out
}

// earlierPeriods answers what earlier retros left in the reports folder, oldest
// first, pairing a period's counts with its report by the stamp they share.
//
// A PERIOD WITH NO REPORT IS STILL A PERIOD. The counts are the engine's and
// arrive whatever anybody writes afterwards, so a retro nobody wrote up still
// carries numbers the next one can compare against, and the gap shows as a
// period with no report rather than as nothing at all.
func earlierPeriods(r Roots) []Period {
	entries, err := os.ReadDir(ReportsDir(r))
	if err != nil {
		return nil
	}
	found := map[string]*Period{}
	var stamps []string
	at := func(stamp string) *Period {
		p, seen := found[stamp]
		if !seen {
			p = &Period{Stamp: stamp, Counts: Counts{Stamp: stamp}}
			found[stamp], stamps = p, append(stamps, stamp)
		}
		return p
	}
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		name := e.Name()
		switch {
		case strings.HasSuffix(name, countsSuffix):
			p := at(strings.TrimSuffix(name, countsSuffix))
			if b, err := os.ReadFile(filepath.Join(ReportsDir(r), name)); err == nil {
				json.Unmarshal(b, &p.Counts)
			}
		case strings.HasSuffix(name, ".md"):
			at(strings.TrimSuffix(name, ".md")).Report = filepath.Join(ReportsDir(r), name)
		}
	}
	// THE STAMP SORTS BY TIME, being the time written the way it sorts.
	sort.Strings(stamps)
	var out []Period
	for _, s := range stamps {
		out = append(out, *found[s])
	}
	return out
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
// IT ANSWERS THE NAMES IT MOVED, because the manifest carries names and a
// count cannot say which name came from where.
func drain(from, to string, wanted func(string) bool) ([]string, error) {
	entries, err := os.ReadDir(from)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, err
	}
	var moved []string
	for _, e := range entries {
		if wanted != nil && !wanted(e.Name()) {
			continue
		}
		if err := os.Rename(filepath.Join(from, e.Name()), filepath.Join(to, e.Name())); err != nil {
			return moved, fmt.Errorf("%s will not move: %w", e.Name(), err)
		}
		moved = append(moved, e.Name())
	}
	return moved, nil
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
func Transcripts(r Roots) []Transcript {
	return append(claudeSessions(r), copilotChats()...)
}

// claudeSessions answers every session the harness kept for this project.
//
// THE FOLDER IS THE FACT, NOT THE ONE FILE. heard.json holds the single path
// the guard was last handed, so asking it answered whichever agent happened to
// make the most recent tool call, and a session runs ten agents with a
// transcript each. MEASURED: three sessions in the folder, one collected, and
// looked_for_and_missing was empty, so the retro folder read like a complete
// record of the period while holding a third of it.
//
// The harness keeps every session for this project beside the one it named, so
// the folder that path is in is what the engine knows, and the walk goes there.
func claudeSessions(r Roots) []Transcript {
	h := loadHeard(r)
	if h.Path == "" {
		return []Transcript{{Name: "claude",
			Who: "this machine says nothing about where it keeps one"}}
	}
	dir := filepath.Dir(h.Path)
	entries, err := os.ReadDir(dir)
	if err != nil {
		return []Transcript{{Name: "claude", Who: "the folder the guard named, " + dir +
			", will not read: " + err.Error()}}
	}
	heard := filepath.Base(h.Path)
	var out []Transcript
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".jsonl") {
			continue
		}
		// WHOSE IT IS, AND THE ENGINE ONLY EVER KNOWS ONE OF THEM. The file is
		// named by the harness's session id and nothing on this machine maps
		// that to an actor, so the rest are called unattributed rather than
		// given a name a reader would trust.
		who := "unattributed: named by its session, and nothing here says which agent wrote it"
		if e.Name() == heard {
			who = "the session the guard was last handed, from heard.json"
		}
		out = append(out, Transcript{
			Name: "claude-" + strings.TrimSuffix(e.Name(), ".jsonl"),
			Path: filepath.Join(dir, e.Name()),
			Who:  who,
		})
	}
	if len(out) == 0 {
		return []Transcript{{Name: "claude", Who: "no session file under " + dir}}
	}
	return out
}

// copilotChats answers the chat files the editor kept beside the newest one.
//
// BEST EFFORT, AND IT SAYS SO. Which workspace folder belongs to this project is
// the editor's business rather than the engine's, so the newest chat file is
// taken as the way in and its folder is read whole. A retro that finds nothing
// says which folder it looked in rather than being silent about a harness.
func copilotChats() []Transcript {
	home, err := os.UserHomeDir()
	if err != nil {
		return []Transcript{{Name: "copilot", Who: "this machine has no home folder to look under"}}
	}
	store := filepath.Join(home, "AppData", "Roaming", "Code", "User", "workspaceStorage")
	newest := newestUnder(store, ".json")
	if newest == "" {
		return []Transcript{{Name: "copilot", Who: "nothing chat-shaped under " + store}}
	}
	dir := filepath.Dir(newest)
	entries, err := os.ReadDir(dir)
	if err != nil {
		return []Transcript{{Name: "copilot", Path: newest,
			Who: "unattributed: the editor names no agent in the file"}}
	}
	var out []Transcript
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".json") {
			continue
		}
		out = append(out, Transcript{
			Name: "copilot-" + strings.TrimSuffix(e.Name(), ".json"),
			Path: filepath.Join(dir, e.Name()),
			Who:  "unattributed: the editor names no agent in the file",
		})
	}
	if len(out) == 0 {
		return []Transcript{{Name: "copilot", Who: "nothing chat-shaped under " + dir}}
	}
	return out
}

// inNameOrder answers the transcripts sorted by name, so a retro folder and its
// manifest read the same way twice.
func inNameOrder(in []Transcript) []Transcript {
	out := append([]Transcript(nil), in...)
	sort.Slice(out, func(i, j int) bool { return out[i].Name < out[j].Name })
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
