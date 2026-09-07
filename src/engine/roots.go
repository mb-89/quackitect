package main

import (
	"os"
	"path/filepath"
	"quackitect/engine/internal/sessionlog"
	"strings"
)

// Two roots, and neither is declared. The method root is where this program
// lives. The work root is the folder being worked on. v3 made a person
// register them, which bought nothing and annoyed everyone.
type Roots struct {
	Method string
	Work   string

	// THE TOKENS ARE READ ONCE PER PROCESS. Every verb is one process over
	// one folder of files, and it asked for every token five times in one
	// pull and once more for each token it looked at. That is the shape v3
	// had, measured there at thousands of file reads per call. The snapshot
	// is filled the first time anything asks and dropped by every write this
	// process makes, so a verb reads the folder once and what it wrote is
	// what it reads back.
	//
	// It is a pointer, so every copy of these roots shares one snapshot. A
	// Roots built by hand carries none and reads the folder on every ask,
	// which is what a test that edits files under the engine's feet wants.
	// A process that lives longer than one verb holds none either, because a
	// snapshot that outlives the folder it was read from is a second truth.
	snap *snapshot
}

// snapshot is what one process has read of the token folders.
type snapshot struct {
	loaded bool
	tokens []Token
}

// ReadOnce gives these roots a snapshot, so the token folders are read the
// first time anything asks and not again until this process writes.
func (r Roots) ReadOnce() Roots {
	r.snap = &snapshot{}
	return r
}

// forget drops the snapshot, which is what a write does. The next ask reads
// the folder again, and reads what was written.
func (r Roots) forget() {
	if r.snap != nil {
		r.snap.loaded = false
		r.snap.tokens = nil
	}
}

// THE METHOD ROOT IS FOUND BY WHAT IT HOLDS, NOT GUESSED FROM WHERE THE
// PROGRAM SITS.
//
// It was the folder two above the executable, which is true only when the
// program was run out of <method>/.bin. Run from anywhere else it still named a
// folder, with no less confidence, and every path derived from it was wrong: a
// lint over that guess filed findings against files that had nothing to do with
// anything.
//
// So the walk goes up looking for the marker the method root actually carries,
// the processes the engine loads out of it, the same shape projectRoot uses for
// the work root. It answers empty when there is none, because empty is a thing
// the caller can report and stop on, and a guess is not.
// IT STOPS AT THE SAME WALLS THE PROJECT WALK DOES. A stray copy of the method
// under the per-user data folder made every program under the temporary folder
// answer that folder as its method root, and a lint over that guess files
// findings against files that have nothing to do with anything.
func methodRootFrom(start string) string {
	for dir := range walkUp(start) {
		if st, err := os.Stat(SpecAt(dir, "processes")); err == nil && st.IsDir() {
			return dir
		}
	}
	return ""
}

// argValue reads a named flag out of a verb's own arguments, in the two-word
// spelling and the joined one.
//
// EVERY VERB IS ITS OWN COMMAND LINE. The client sends the verb to the engine
// over the folder, so it has to read the roots off those arguments before it
// knows which engine to ask, and it cannot use the flag package to do it.
func argValue(args []string, name string) string {
	for i, a := range args {
		if a == name && i+1 < len(args) {
			return args[i+1]
		}
		if rest, ok := strings.CutPrefix(a, name+"="); ok {
			return rest
		}
	}
	return ""
}

// MethodFound says whether the method root was found at all. A caller that
// needs the method reports this and stops, rather than working from a guess.
func (r Roots) MethodFound() bool { return r.Method != "" }

// TheMethodIsLost is what a caller says when there is no method root to work
// from, written once so every door says the same thing.
func TheMethodIsLost() string {
	return "engine: no method root here. This program looked up from where it " +
		"is for a folder carrying spec/processes and found none, so every path " +
		"under the method would be a guess. Name it: --method <folder>"
}

func FindRoots(workArg, methodArg string) (Roots, error) {
	method := methodArg
	if method != "" {
		abs, err := filepath.Abs(method)
		if err != nil {
			return Roots{}, err
		}
		method = abs
	} else {
		exe, err := os.Executable()
		if err != nil {
			return Roots{}, err
		}
		method = methodRootFrom(filepath.Dir(exe))
	}
	var err error
	work := workArg
	// THE WORK ROOT MAY RIDE OUT OF BAND. RUNME wraps the command line and
	// adds nothing to argv, because an argument slipped in front of the verb
	// sits where dispatch reads os.Args[1]. So the script names the folder in
	// SE_WORK, read only when --work is absent: a flag anybody types still wins.
	if work == "" {
		work = os.Getenv("SE_WORK")
	}
	if work == "" {
		if work, err = os.Getwd(); err != nil {
			return Roots{}, err
		}
	}
	work, err = filepath.Abs(work)
	if err != nil {
		return Roots{}, err
	}
	// AND WHERE THE PROGRAM STANDS OUTSIDE EVERY METHOD, THE FOLDER IT WAS GIVEN
	// IS ASKED. The lookup above starts at the executable, which answers whenever
	// the engine is run out of a method's own .bin and never when it is installed
	// anywhere else: a binary under the temporary folder, or on a person's PATH,
	// found no method however plainly the folder it was handed carried one, and
	// every verb was refused before it reached the socket.
	//
	// THE EXECUTABLE STILL ANSWERS FIRST, so nothing that resolves today resolves
	// differently. This reaches only the case that was a refusal, and it is the
	// same walk for the same marker, started where the caller pointed.
	if method == "" {
		method = methodRootFrom(work)
	}
	return Roots{Method: method, Work: projectRoot(work)}.ReadOnce(), nil
}

// THE PROJECT IS THE FOLDER, NOT THE DIRECTORY SOMEBODY IS STANDING IN.
//
// A guard is started by the harness with whatever the shell's directory
// happens to be. That drifts: a terminal moves into src/mcp and stays
// there. Taking it literally gives that subfolder its own .se, and then the
// record, the ledger and the agent's stop claim all split by directory. A
// claim written at the root cannot be found by a guard standing in a
// subfolder, which is how this was noticed.
//
// So the walk goes UP to the nearest folder that carries .se, which is the
// marker that a folder is a project this system has worked on.
//
// IT STOPS BEFORE THE HOME DIRECTORY. The register lives in a .se there, and
// it is not a project. A walk that accepted it would make every project under
// the home directory resolve to the home directory, which is worse than the
// defect this was written to fix.
//
// AND IT DOES NOT CLIMB OUT OF THE TEMPORARY FOLDER. A folder made under temp
// belongs to whatever made it, and never to an ancestor outside it. A stray .se
// in the per-user data folder, which is where the temporary folder lives on
// Windows, made every temporary tree resolve to that folder: the selftest then
// seeded its project into it, which put a second .se there, which is how it
// kept happening. Two tests answered that folder instead of the tree they made.
//
// A tree with no marker is a folder being driven for the first time, and then
// where somebody is standing is the only answer there is.
func projectRoot(start string) string {
	for dir := range walkUp(start) {
		if st, err := os.Stat(filepath.Join(dir, ".se")); err == nil && st.IsDir() {
			return dir
		}
	}
	return start
}

// WorkMoved says whether a named work folder resolved to a different one.
//
// THE WALK IS RIGHT AND THE SILENCE IS THE DEFECT. projectRoot goes up to the
// nearest folder carrying .se, which is what lets a verb run from a
// subdirectory. So --work naming a folder inside a project answers the
// project.
//
// MEASURED. A mint aimed at a scratch folder under the tree landed in the real
// backlog, under a real id, and nothing said so. The only sign was that it was
// not where it had been asked for.
//
// So the answer is not to stop walking. It is to say the walk happened, to
// whoever named a folder and got another.
func WorkMoved(workArg string) (asked, got string, moved bool) {
	if workArg == "" {
		return "", "", false // nobody named one, so nothing was moved from
	}
	abs, err := filepath.Abs(workArg)
	if err != nil {
		return workArg, workArg, false
	}
	root := projectRoot(abs)
	return abs, root, root != abs
}

// walkUp yields each folder from start upwards, stopping before any folder no
// project may be: the home directory and the temporary folder.
func walkUp(start string) func(func(string) bool) {
	return func(yield func(string) bool) {
		var walls []string
		if home, err := os.UserHomeDir(); err == nil && home != "" {
			walls = append(walls, home)
		}
		if tmp := os.TempDir(); tmp != "" {
			walls = append(walls, tmp)
		}
		for dir := start; ; {
			for _, wall := range walls {
				if sameDir(dir, wall) {
					return
				}
			}
			if !yield(dir) {
				return
			}
			up := filepath.Dir(dir)
			if up == dir {
				return
			}
			dir = up
		}
	}
}

// Windows compares paths without case, and a home directory reached two ways
// is one directory either way.
func sameDir(a, b string) bool {
	if a == b {
		return true
	}
	fa, err1 := os.Stat(a)
	fb, err2 := os.Stat(b)
	return err1 == nil && err2 == nil && os.SameFile(fa, fb)
}

// SpecAt says where a specified folder lives in a tree.
//
// THE SPECIFICATION MOVED OUT OF src. processes, schemas, views and config are
// not written or run: they are what the tree is declared to be, and spec is
// where the declaration lives. src is what a person writes and a machine runs.
//
// ONE FUNCTION, BECAUSE FIVE READERS ASK IT. ProcessDir, SchemaDir, viewFolders,
// DeclaredAt and the method-root probe in FindRoots all name one of these four
// folders, and a move that changes four of them and misses the fifth is the
// shape that has cost this tree five readers in one afternoon.
//
// THE OLD PLACE IS ANSWERED WHILE A TREE STILL CARRIES IT, and the new one is
// asked first, so a tree that has moved is never read out of src. When none
// carries the old one this becomes a join and the second line goes.
func SpecAt(root, name string) string {
	if at := filepath.Join(root, "spec", name); exists(at) {
		return at
	}
	if was := filepath.Join(root, "src", name); exists(was) {
		return was
	}
	return filepath.Join(root, "spec", name)
}

// Private is where material that must not travel is kept. The log lives here
// because it holds prompts.
func (r Roots) Private(parts ...string) string {
	return filepath.Join(append([]string{r.Work, ".se"}, parts...)...)
}

// Runtime is where the live registers are kept: the small files that say what
// this box is doing right now.
//
// THE OWNER COULD NOT TELL STATE FROM LEAVINGS. Twenty-four registers sat loose
// in .se beside the log, the index and whatever an agent had left there, and
// asking which of them mattered meant reading the engine. A folder answers it:
// what is under runtime is live, and what is not is a leaving and may go.
//
// EVERY ONE OF THEM IS DERIVED FROM THIS BOX. None travels, none is a record,
// and a box that lost the lot would rebuild them by running. That is the test
// for whether a file belongs here rather than beside the log.
//
// LEGACY FILES ARE MOVED RATHER THAN LEFT. A tree written before this change
// has them in .se, and a reader that found nothing would silently answer that
// nothing is held: no rung, no hold, nobody owed an answer. TakeUpTheRuntime
// carries them across once, at start.
func (r Roots) Runtime(parts ...string) string {
	return filepath.Join(append([]string{r.Work, ".se", "runtime"}, parts...)...)
}

// theRuntimeRegisters is every file the runtime folder holds. It is the list
// the move reads, so a register added without being named here stays in .se and
// is found by the check rather than by a person wondering where it went.
var theRuntimeRegisters = []string{
	"actors.json", "arrivals.json", "asked.json", "binding.json", "calls.json",
	"claims.json", "emergency.json", "engine.json", "evidence.json",
	"failures.json", "grace.json", "heard.json", "hold.json", "holds.json",
	"ideation.json", "looked.json", "owed.json", "parameters.json", "project.json",
	"results.json", "stop-claim.json", "stops.json", "tested.json",
	"tools.json",
}

// RUNME.JSON IS NOT ONE OF THESE EITHER, and for a sharper reason than
// copy.json. RUNME.sh and RUNME.ps1 read it to find out what to run, and they
// read it BEFORE there is an engine: on a cloud box that is the first thing
// that happens after the clone. Those two scripts are generated from
// internal/runme, so moving the file means changing a template, regenerating
// both scripts, and every clone that already carries the old pair looking in a
// place nothing writes. It is a bootstrap marker rather than a register of what
// this box is doing, so it stays at .se/runme.json.

// COPY.JSON IS NOT ONE OF THESE, and it is the only .se json left outside. It
// is this installation's identity, it lives in the METHOD root rather than the
// work root, and a produced copy gets its own. So it is not state about a run
// and moving it under runtime would put two different roots' files in one
// folder. See CopyID in vehicle.go.

// TakeUpTheRuntime moves the registers a older tree left loose in .se into the
// runtime folder, once. A file already there wins, because it is the one this
// engine has been writing.
func TakeUpTheRuntime(r Roots) {
	if err := os.MkdirAll(r.Runtime(), 0o755); err != nil {
		return
	}
	for _, name := range theRuntimeRegisters {
		was, now := r.Private(name), r.Runtime(name)
		if _, err := os.Stat(now); err == nil {
			continue // this engine has already written it
		}
		if _, err := os.Stat(was); err != nil {
			continue // there was never one
		}
		if err := os.Rename(was, now); err != nil {
			// A register that will not move is left where it is. The reader
			// finds nothing and the box carries on, which is what it does for a
			// register that was never written.
			continue
		}
	}
}

// SessionLog is the file the record is being written to.
func SessionLog(r Roots) string { return filepath.Join(r.Private("log"), sessionlog.Current) }
