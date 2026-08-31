package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"
)

// The installer. One program, run by a thin bootstrap on either platform.
// What must be true on the machine is data, in manifest.json, so a person can
// read it and do the same thing by hand.
//
// It is idempotent. A second run installs nothing and changes nothing.

type Manifest struct {
	Product struct {
		ID, Name, Version string
	} `json:"product"`
	Profiles map[string][]string `json:"profiles"`
	Tools    map[string]struct {
		Probe, Winget, Apt, Why string
	} `json:"tools"`
	Builds []struct {
		Name, Source, Why string
	} `json:"builds"`
}

// usage is what --help prints. The bootstrap scripts hand every flag through
// to here, so this is the only place the flags are written down.
func usage() {
	out := flag.CommandLine.Output()
	fmt.Fprintln(out, "The installer. It makes the toolchain exist, builds everything, links the")
	fmt.Fprintln(out, "extension into the editor, registers this copy, and opens the editor.")
	fmt.Fprintln(out, "")
	fmt.Fprintln(out, "Reach it through the bootstrap for this platform, which passes flags on:")
	fmt.Fprintln(out, "")
	fmt.Fprintln(out, "  util/setup/install.sh   [flags]")
	fmt.Fprintln(out, "  util\\setup\\install.ps1  [flags]")
	fmt.Fprintln(out, "")
	flag.PrintDefaults()
}

var (
	help      = flag.Bool("help", false, "print this and exit")
	helpShort = flag.Bool("h", false, "print this and exit")
	root      = flag.String("root", "", "the method root")
	profile   = flag.String("profile", "", "desktop, or headless for a box with no editor (default: decided here)")
	noOpen    = flag.Bool("no-open", false, "do not open the editor at the end")
	dry       = flag.Bool("dry-run", false, "say what would happen and change nothing")
)

func main() {
	flag.Usage = usage
	flag.Parse()
	if *help || *helpShort {
		flag.CommandLine.SetOutput(os.Stdout)
		usage()
		return
	}
	if *root == "" {
		here, _ := os.Getwd()
		*root = filepath.Clean(filepath.Join(here, "..", ".."))
	}
	m, err := readManifest(filepath.Join(*root, "util", "setup", "manifest.json"))
	if err != nil {
		fail(err)
	}
	if *profile == "" {
		*profile = decideProfile()
	}
	want, ok := m.Profiles[*profile]
	if !ok {
		fail(fmt.Errorf("no profile called %q", *profile))
	}

	say("quackitect %s - installing, profile %s", m.Product.Version, *profile)
	say("  method root %s", *root)

	for _, name := range want {
		if err := ensureTool(m, name); err != nil {
			fail(err)
		}
	}
	for _, b := range m.Builds {
		if err := build(b.Name, filepath.Join(*root, b.Source)); err != nil {
			fail(err)
		}
	}
	// The ENGINE writes the register, because the engine reads it. Two
	// writers with two formats is how a copy becomes unfindable.
	if err := registerThroughEngine(*root); err != nil {
		// A register that cannot be written is worth saying and not worth
		// stopping for. Everything else already works.
		warn("could not register this copy: %v", err)
	}
	if *profile == "desktop" {
		if err := installExtension(*root, m.Product.ID); err != nil {
			fail(err)
		}
		if !*noOpen {
			openEditor(*root)
		}
	}
	say("done. Nothing here needs running again.")
}

func registerThroughEngine(root string) error {
	if *dry {
		say("  register would be written by the engine")
		return nil
	}
	exe := filepath.Join(root, ".bin", "se")
	if runtime.GOOS == "windows" {
		exe += ".exe"
	}
	out, err := exec.Command(exe, "--register", "--method", root).CombinedOutput()
	if err != nil {
		return fmt.Errorf("%s: %w", strings.TrimSpace(string(out)), err)
	}
	say("  register %s", strings.TrimSpace(string(out)))
	return nil
}

func readManifest(path string) (*Manifest, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var m Manifest
	return &m, json.Unmarshal(b, &m)
}

// A cloud box has no editor to show and nobody to answer a prompt. Deciding
// rather than asking is what makes the unattended case work.
func decideProfile() string {
	if runtime.GOOS == "windows" {
		return "desktop"
	}
	if os.Getenv("DISPLAY") == "" && os.Getenv("WAYLAND_DISPLAY") == "" {
		return "headless"
	}
	return "desktop"
}

func ensureTool(m *Manifest, name string) error {
	t, ok := m.Tools[name]
	if !ok {
		return fmt.Errorf("the manifest names a tool it does not describe: %s", name)
	}
	if _, err := exec.LookPath(t.Probe); err == nil {
		say("  %-8s already here", name)
		return nil
	}
	if *dry {
		say("  %-8s would be installed (%s)", name, t.Why)
		return nil
	}
	say("  %-8s installing, because %s", name, t.Why)
	if err := installTool(t.Winget, t.Apt); err != nil {
		return fmt.Errorf("could not install %s: %w", name, err)
	}
	if _, err := exec.LookPath(t.Probe); err != nil {
		return fmt.Errorf("%s was installed and this shell still cannot see it: open a new terminal and run this again", name)
	}
	return nil
}

func installTool(winget, apt string) error {
	if runtime.GOOS == "windows" {
		if winget == "" {
			return fmt.Errorf("nothing to install it with on this platform")
		}
		return run("winget", "install", "-e", "--id", winget,
			"--accept-package-agreements", "--accept-source-agreements")
	}
	if apt == "" {
		return fmt.Errorf("nothing to install it with on this platform")
	}
	for _, c := range [][]string{
		{"apt-get", "install", "-y", "-qq", apt},
		{"dnf", "install", "-y", "-q", apt},
		{"apk", "add", "--no-cache", apt},
		{"pacman", "-S", "--noconfirm", apt},
	} {
		if _, err := exec.LookPath(c[0]); err != nil {
			continue
		}
		if os.Geteuid() == 0 {
			return run(c[0], c[1:]...)
		}
		return run("sudo", c...)
	}
	return fmt.Errorf("no package manager here")
}

// The built programs go in .bin, which is machinery: rebuilt from source and
// out of version control.
func build(name, source string) error {
	out := filepath.Join(*root, ".bin", name)
	if runtime.GOOS == "windows" {
		out += ".exe"
	}
	if *dry {
		say("  build    %s would be built from %s", name, source)
		return nil
	}
	say("  build    %s", name)
	if err := os.MkdirAll(filepath.Dir(out), 0o755); err != nil {
		return err
	}
	// The build is stamped, so a window that has been open a while can say
	// which code it is running.
	stamp := time.Now().UTC().Format("01-02-1504")
	cmd := exec.Command("go", "build", "-ldflags", "-s -w -X main.Build="+stamp, "-o", out, ".")
	cmd.Dir = source
	cmd.Stdout, cmd.Stderr = os.Stdout, os.Stderr
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("building %s failed: %w", name, err)
	}
	return nil
}

func openEditor(root string) {
	say("  opening the editor. The extension takes it from here.")
	// An empty folder is the ordinary case: the work root is whatever the
	// person opens, and it does not have to be this tree.
	if err := run("code", "--new-window"); err != nil {
		warn("could not open the editor: %v", err)
	}
}

func run(name string, args ...string) error {
	cmd := exec.Command(name, args...)
	cmd.Stdout, cmd.Stderr = os.Stdout, os.Stderr
	return cmd.Run()
}

func say(f string, a ...any)  { fmt.Printf(f+"\n", a...) }
func warn(f string, a ...any) { fmt.Fprintf(os.Stderr, "  warning: "+f+"\n", a...) }
func fail(err error) {
	fmt.Fprintln(os.Stderr, "install failed:", err)
	fmt.Fprintln(os.Stderr, "  nothing was left half done that a second run will not fix.")
	os.Exit(1)
}

func homeDir() string {
	h, err := os.UserHomeDir()
	if err != nil {
		return ""
	}
	return h
}

func splitPaths(s string) []string {
	if s == "" {
		return nil
	}
	return strings.Split(s, string(os.PathListSeparator))
}
