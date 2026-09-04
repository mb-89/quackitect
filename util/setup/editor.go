package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"
)

// The extension is linked, never copied. The build renders the tree, and this
// points the editor at it, so a rebuild needs no second install.
//
// BUILDING IT AND LINKING IT ARE TWO THINGS, AND ONLY THE SECOND NEEDS AN
// EDITOR. Both sat in one function that ran on the desktop profile alone, so a
// headless box never ran npm install and src/extension/node_modules was never
// made. Four checks bundle the extension's TypeScript with the esbuild in that
// folder, and on a fresh Linux clone all four failed with ERR_MODULE_NOT_FOUND
// before they read a line of the tree. The dependencies are the battery's, so
// every profile installs them; the link into the editor's extensions folder
// needs an editor, so it stays behind the desktop profile.

func extensionsDir() string { return filepath.Join(homeDir(), ".vscode", "extensions") }

// buildExtension makes the extension's dependencies and renders it. Every
// profile runs this, because the checks read what it makes.
func buildExtension(root string) error {
	src := filepath.Join(root, "src", "extension")
	if *dry {
		say("  build    the extension would be built in %s", src)
		return nil
	}
	say("  build    the extension")
	if err := runIn(src, "npm", "install", "--silent", "--no-fund", "--no-audit"); err != nil {
		return fmt.Errorf("installing the extension's dependencies failed: %w", err)
	}
	if err := runIn(src, "npm", "run", "build"); err != nil {
		return fmt.Errorf("building the extension failed: %w", err)
	}
	return nil
}

// linkExtension points the editor at the folder buildExtension rendered.
func linkExtension(root, id string) error {
	src := filepath.Join(root, "src", "extension")
	if *dry {
		say("  editor   the extension would be linked from %s", src)
		return nil
	}
	dest := filepath.Join(extensionsDir(), id+"."+id+"-0.1.0")
	if err := os.MkdirAll(extensionsDir(), 0o755); err != nil {
		return err
	}
	if err := replaceLink(dest, src); err != nil {
		return err
	}
	say("  editor   linked at %s", dest)

	if err := registerWithEditor(dest, id); err != nil {
		return fmt.Errorf("registering the extension with the editor failed: %w", err)
	}
	say("  editor   registered")
	return nil
}

// A loaded extension cannot be replaced, because the editor holds the files it
// is running. The raw failure names an internal file and hides the cause, so
// the cause is said instead.
func replaceLink(dest, src string) error {
	if err := removeLink(dest); err != nil {
		return lockedMessage(dest, err)
	}
	if err := makeLink(dest, src); err != nil {
		return err
	}
	// Linking can report success and leave nothing usable behind. The editor
	// loads what is at the other end, so check that end.
	if _, err := os.Stat(filepath.Join(dest, "package.json")); err != nil {
		return fmt.Errorf("the link was made and the editor would find nothing through it: %s", dest)
	}
	return nil
}

func lockedMessage(dest string, err error) error {
	return fmt.Errorf("the installed extension is in use: close every editor window and run this again\n  %s\n  %v", dest, err)
}

// The editor loads what its own list names, and it does not find a linked
// folder on its own. That list holds every extension the person has, so a
// careless write loses somebody else's work. This backs the file up, keeps
// every entry it cannot read, and refuses to write if an id would be lost.
type extEntry struct {
	Identifier struct {
		ID   string `json:"id"`
		UUID string `json:"uuid,omitempty"`
	} `json:"identifier"`
	Version          string          `json:"version"`
	Location         json.RawMessage `json:"location,omitempty"`
	RelativeLocation string          `json:"relativeLocation,omitempty"`
	Metadata         json.RawMessage `json:"metadata,omitempty"`
	Rest             json.RawMessage `json:"-"`
}

func registerWithEditor(dest, id string) error {
	listPath := filepath.Join(extensionsDir(), "extensions.json")
	raw, err := os.ReadFile(listPath)
	if err != nil && !os.IsNotExist(err) {
		return err
	}

	var entries []json.RawMessage
	if len(raw) > 0 {
		if err := json.Unmarshal(raw, &entries); err != nil {
			return fmt.Errorf("the editor's extension list is not readable, so it was left alone: %w", err)
		}
	}

	before := idsIn(entries)
	fullID := id + "." + id

	kept := entries[:0:0]
	for _, e := range entries {
		if idOf(e) == fullID {
			continue // ours, replaced below
		}
		kept = append(kept, e)
	}

	uri := locationPath(dest)
	mine := map[string]any{
		"identifier":       map[string]any{"id": fullID},
		"version":          "0.1.0",
		"location":         map[string]any{"$mid": 1, "path": uri, "scheme": "file"},
		"relativeLocation": filepath.Base(dest),
		"metadata": map[string]any{
			"installedTimestamp": time.Now().UnixMilli(),
			"source":             "vsix",
		},
	}
	mineRaw, err := json.Marshal(mine)
	if err != nil {
		return err
	}
	kept = append(kept, mineRaw)

	// Nothing that was there may vanish. If it would, write nothing.
	after := idsIn(kept)
	for wasID := range before {
		if wasID == fullID {
			continue
		}
		if !after[wasID] {
			return fmt.Errorf("writing the list would have lost %s, so nothing was written", wasID)
		}
	}

	if len(raw) > 0 {
		backup := listPath + ".before-quackitect"
		if err := os.WriteFile(backup, raw, 0o644); err != nil {
			return fmt.Errorf("could not back the list up, so it was left alone: %w", err)
		}
	}
	out, err := json.Marshal(kept)
	if err != nil {
		return err
	}
	tmp := listPath + ".tmp"
	if err := os.WriteFile(tmp, out, 0o644); err != nil {
		return err
	}
	return os.Rename(tmp, listPath)
}

// The editor writes its own entries with a lower-case drive letter, because
// that is how it normalises a file URI. An entry that does not match the
// others is an entry it may not match to the folder on disk.
func locationPath(dest string) string {
	uri := filepath.ToSlash(dest)
	if runtime.GOOS == "windows" {
		if len(uri) > 1 && uri[1] == ':' {
			uri = strings.ToLower(uri[:1]) + uri[1:]
		}
		uri = "/" + uri
	}
	return uri
}

func idsIn(entries []json.RawMessage) map[string]bool {
	out := map[string]bool{}
	for _, e := range entries {
		if id := idOf(e); id != "" {
			out[id] = true
		}
	}
	return out
}

func idOf(e json.RawMessage) string {
	var probe struct {
		Identifier struct {
			ID string `json:"id"`
		} `json:"identifier"`
	}
	if json.Unmarshal(e, &probe) != nil {
		return ""
	}
	return probe.Identifier.ID
}

func runIn(dir, name string, args ...string) error {
	if _, err := exec.LookPath(name); err != nil {
		return fmt.Errorf("%s is not on this machine", name)
	}
	cmd := Quietly(exec.Command(name, args...))
	cmd.Dir = dir
	cmd.Stdout, cmd.Stderr = os.Stdout, os.Stderr
	return cmd.Run()
}

func runtimeIsWindows() bool { return runtime.GOOS == "windows" }
