package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"quackitect/engine/internal/runme"
	"runtime"
	"strings"
)

// SEEDING A FOLDER.
//
// Every project has a RUNME next to its README. RUNME is the one command that
// always works: it installs what has to be installed, then hands every
// argument straight through to the command line interface underneath.
//
// The point is that the convention outlives the implementation. This one runs
// Go. The next may run Python. RUNME does not change.
//
// A VEHICLE IS A PROJECT TOO. It carries the method as well, so it is seeded
// the same way and then has more in it.

type Kind string

const (
	AProject Kind = "project"
	AVehicle Kind = "vehicle"
)

// Runme is what RUNME reads to know what to run. It is data, so the script
// stays short enough that a person can read the whole of it.
type Runme struct {
	Kind Kind `json:"kind"`
	// Both platforms are named, whichever one seeded the folder. A project
	// that moves between hosts then works there without being re-made.
	Install        string `json:"install,omitempty"`
	Command        string `json:"command,omitempty"`
	InstallWindows string `json:"install_windows,omitempty"`
	CommandWindows string `json:"command_windows,omitempty"`
	Driver         string `json:"driver,omitempty"` // or: the copy that drives this folder
	// Sources names the folders the command is built from, separated by
	// spaces, so RUNME can tell a binary that is older than its source from one
	// that is current. A folder with a space in its name is not supported, and
	// no folder that is built from has one. Left empty, RUNME builds only when
	// the command is missing, which is what every project without a build does.
	Sources string `json:"sources,omitempty"`
	Version string `json:"version"`
}

func runmeName() string {
	if runtime.GOOS == "windows" {
		return "RUNME.ps1"
	}
	return "RUNME.sh"
}

// Seed writes what every project has. It never overwrites: a folder that
// already has a README keeps the README it has.
func Seed(roots Roots, kind Kind) ([]string, error) {
	var made []string
	// THE COPY IS ASKED FOR ITS IDENTITY BEFORE ANYTHING IS WRITTEN, and the
	// identity itself is not wanted here. A method root that cannot say which
	// copy it is has nothing to seed from, so this is the check and not a
	// value: it was read into id, thrown away nine lines later with `_ = id`,
	// and the blank identifier hid that the value had no use.
	if _, err := CopyID(roots.Method); err != nil {
		return nil, err
	}

	r := Runme{Kind: kind, Version: "0.1.0"}
	if kind == AVehicle {
		r.Command = ".bin/se"
		r.Install = "util/setup/install.sh"
		r.CommandWindows = `.bin\se.exe`
		r.InstallWindows = `util\setup\install.ps1`
		// The three folders manifest.json builds from. Installing builds all of
		// them, so a write to any one makes every binary in .bin stale together.
		r.Sources = "src/engine src/viewer src/mcp"
	}
	if err := writeNew(filepath.Join(roots.Work, ".se", "runme.json"), mustIndent(r), &made); err != nil {
		return made, err
	}
	// THE SCRIPT FOR THIS HOST, and only this one. A project that moves gets
	// the other one the next time init is run there, and keeps both. That is
	// why init is worth pressing on a folder that is already a project.
	if err := writeNew(filepath.Join(roots.Work, runmeName()), runme.Script(), &made); err != nil {
		return made, err
	}
	if err := writeNew(filepath.Join(roots.Work, "README.md"),
		readmeFor(kind, filepath.Base(roots.Work)), &made); err != nil {
		return made, err
	}
	if err := writeNew(filepath.Join(roots.Work, ".gitignore"), gitignore(), &made); err != nil {
		return made, err
	}
	// A VEHICLE DRIVES ITSELF, and that is not a choice anybody has to make.
	//
	// A project's driver is left unrecorded on purpose. The choice is made
	// the first time the folder is started, and it is asked once. Running
	// init again clears it, which is how a project is moved to another
	// vehicle: re-init, then start, and the question comes back.
	if kind == AVehicle {
		if _, err := Attach(roots); err != nil {
			return made, err
		}
	} else if err := Detach(roots); err != nil {
		return made, err
	}
	return made, nil
}

func writeNew(path, content string, made *[]string) error {
	if _, err := os.Stat(path); err == nil {
		return nil // a folder keeps what it already has
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	mode := os.FileMode(0o644)
	if strings.HasSuffix(path, ".sh") {
		mode = 0o755
	}
	if err := writeAtomic(path, []byte(content), mode); err != nil {
		return err
	}
	*made = append(*made, path)
	return nil
}

func mustIndent(v any) string {
	b, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return "{}"
	}
	return string(b) + "\n"
}

func exeName(n string) string {
	if runtime.GOOS == "windows" {
		return n + ".exe"
	}
	return n
}

func readmeFor(kind Kind, name string) string {
	what := "A project."
	extra := ""
	if kind == AVehicle {
		what = "A vehicle: it carries the method, and it is a project as well."
		extra = "\n## The method\n\n" +
			"guidance/ is authored. util/ holds what is run. src/ holds what is\n" +
			"written. .bin/ holds what was built.\n"
	}
	return fmt.Sprintf("# %s\n\n%s\n\n## Run it\n\n    %s --help\n\n"+
		"RUNME is the one command that always works. It installs what has to be\n"+
		"installed, then hands every argument through to the command line\n"+
		"interface. Ask it what it takes. That stays true whatever this project\n"+
		"is written in.\n\n"+
		"## What is private\n\n"+
		".se/ holds the record, the parameters, and the copy that drives this\n"+
		"folder. Nothing in it travels.\n%s",
		name, what, runmeCall(), extra)
}

func runmeCall() string {
	if runtime.GOOS == "windows" {
		return ".\\RUNME.ps1"
	}
	return "./RUNME.sh"
}

func gitignore() string {
	return ".se/\n.bin/\nnode_modules/\n_to_delete/\n"
}
