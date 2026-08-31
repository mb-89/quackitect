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
	// A TREE THAT CARRIES THE METHOD IS A VEHICLE, and the README says RUNME
	// works here once this script has run. RUNME reads .se/runme.json, so
	// this tree has to be seeded like any other vehicle. Seeding never
	// overwrites, so a second run changes nothing.
	if err := seedThroughEngine(*root); err != nil {
		warn("could not seed this copy: %v", err)
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
	out, err := engineSays(root, "--register")
	if err != nil {
		return err
	}
	say("  register %s", firstLine(out))
	return nil
}

// The engine seeds, for the reason it registers: it is the one that reads
// what a vehicle is made of.
func seedThroughEngine(root string) error {
	if *dry {
		say("  seed would be written by the engine")
		return nil
	}
	out, err := engineSays(root, "--init", "vehicle", "--work", root)
	if err != nil {
		return err
	}
	say("  seed     %s", firstLine(out))
	return nil
}

func engineSays(root string, args ...string) (string, error) {
	exe := filepath.Join(root, ".bin", "se")
	if runtime.GOOS == "windows" {
		exe += ".exe"
	}
	out, err := exec.Command(exe, append(args, "--method", root)...).CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("%s: %w", strings.TrimSpace(string(out)), err)
	}
	return string(out), nil
}

func firstLine(s string) string {
	s = strings.TrimSpace(s)
	if i := strings.IndexByte(s, '\n'); i >= 0 {
		return s[:i]
	}
	return s
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
	return alsoWithoutTheSuffix(out, filepath.Join(*root, ".bin", name))
}

// ONE PROGRAM, AND THE NAME THE CAGE CALLS IT BY.
//
// The cage is in version control, so it names one path on every platform, and
// a path that is the same everywhere carries no file extension. Windows runs
// a program by path whatever it is called, because the loader reads the
// header and not the name.
//
// THE SUFFIXED NAME STAYS, because a shell finds a command through PATHEXT
// and RUNME on Windows is a shell. So the file has both names and there is
// only one file: a hard link is the same bytes twice in the folder listing.
// A copy is the fallback, for a filesystem that will not link.
func alsoWithoutTheSuffix(built, plain string) error {
	if built == plain {
		return nil
	}
	_ = os.Remove(plain)
	if err := os.Link(built, plain); err == nil {
		return nil
	} else if runtime.GOOS == "windows" {
		// A HARD LINK TO A FILE NEEDS NO PRIVILEGE, which is what makes it the
		// right one here. A symbolic link is the one that needs a privilege an
		// ordinary account does not hold, and a junction is for folders. It
		// still wants one NTFS volume, and a network or removable drive is not
		// that, so a failure is worth naming rather than hiding in a copy.
		say("  build    could not link %s, so it is a copy: %v", filepath.Base(plain), err)
	}
	in, err := os.ReadFile(built)
	if err != nil {
		return err
	}
	return os.WriteFile(plain, in, 0o755)
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
