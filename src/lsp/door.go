// The one file of this package reading the outside: a command, a file, the
// streams and the signals. Every other file calls one of these, so a reader
// finds the outside in one place.
// [[spec/design_output/doors#a-door-reads-the-outside]]
package main

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"io/fs"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"
)

// [[spec/design_output/lsp#one-checker-every-front-asks]]
func runs(name string, argv ...string) (string, error) {
	said, err := exec.Command(name, argv...).Output()
	return string(said), err
}

// A tool of the box run at the root, with the text on its input. It answers the output whatever the exit, because Biome exits on a finding, and an error where the tool says nothing. [[spec/design_output/lsp#the-server-runs-the-tools]]
func runsIn(dir, input, name string, argv ...string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), toolWait)
	defer cancel()
	one := exec.CommandContext(ctx, name, argv...)
	one.Dir = dir
	if input != "" {
		one.Stdin = strings.NewReader(input)
	}
	var out, errs bytes.Buffer
	one.Stdout, one.Stderr = &out, &errs
	err := one.Run()
	if err != nil && out.Len() == 0 {
		return "", fmt.Errorf("%v: %s", err, strings.TrimSpace(errs.String()))
	}
	return out.String(), nil
}

// Whether a file stands on the disk, for a tool the box holds. [[spec/design_output/lsp#the-server-runs-the-tools]]
func standsAt(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

// [[spec/design_output/private#the-box-names-the-owner]]
func gitSays(root, key string) string {
	said := exec.Command("git", "config", key)
	said.Dir = root
	read, err := said.Output()
	if err != nil {
		return ""
	}
	return strings.TrimSpace(string(read))
}

// The index door comes up through its own binary, which walks the tree and stands before it answers. [[spec/design_output/index#a-door-comes-back]]
func startsIndex(root, binary string) error {
	one := exec.Command(filepath.Join(root, filepath.FromSlash(binary)), "standing")
	one.Dir = root
	if said, err := one.CombinedOutput(); err != nil {
		return fmt.Errorf("%v: %s", err, strings.TrimSpace(string(said)))
	}
	return nil
}

// [[spec/design_output/lsp#one-checker-every-front-asks]]
func starts(root string) error {
	self, err := os.Executable()
	if err != nil {
		return err
	}

	one := exec.Command(self, "serve")
	one.Dir = root
	one.Env = append(os.Environ(), "QUACKITECT_ROOT="+root)
	if err := one.Start(); err != nil {
		return err
	}
	go one.Wait()

	for waited := 0; waited < standPolls; waited++ {
		if _, err := standingOf(root); err == nil {
			return nil
		}
		time.Sleep(standPoll)
	}
	return errorOf(fmt.Sprintf("the server took longer than %s to stand", time.Duration(standPolls)*standPoll))
}

// The outside every other file of this package reads through. [[spec/design_output/doors#a-door-reads-the-outside]]
var (
	stdin  io.Reader = os.Stdin
	stdout io.Writer = os.Stdout
	stderr io.Writer = os.Stderr
)

func argsOf() []string                     { return os.Args }
func exits(code int)                       { os.Exit(code) }
func envOf(key string) string              { return os.Getenv(key) }
func environOf() []string                  { return os.Environ() }
func pidOf() int                           { return os.Getpid() }
func workDirOf() (string, error)           { return os.Getwd() }
func executableOf() (string, error)        { return os.Executable() }
func readFile(path string) ([]byte, error) { return os.ReadFile(path) }
func writeFile(path string, data []byte, mode fs.FileMode) error {
	return os.WriteFile(path, data, mode)
}
func statOf(path string) (fs.FileInfo, error)     { return os.Stat(path) }
func makeDir(path string, mode fs.FileMode) error { return os.MkdirAll(path, mode) }
func removeFile(path string) error                { return os.Remove(path) }

// The stop a person or a swapped binary sends, so main waits on one channel and names no signal. [[spec/design_output/doors#a-door-reads-the-outside]]
func stops(swapped func(gone func())) <-chan struct{} {
	said := make(chan os.Signal, 1)
	signal.Notify(said, os.Interrupt, syscall.SIGTERM)
	swapped(func() { said <- os.Interrupt })
	out := make(chan struct{})
	go func() {
		<-said
		close(out)
	}()
	return out
}

// The disk the tree reads through: the index in the binary, and a folder a case writes in the cases. So the binary reads no file of the tree past the index. [[spec/design_output/lsp#the-server-reads-the-index]]
type Disk interface {
	ReadFile(path string) ([]byte, error)
	Stat(path string) (fs.FileInfo, error)
	ReadDir(path string) ([]fs.DirEntry, error)
	WalkDir(root string, fn fs.WalkDirFunc) error
}
