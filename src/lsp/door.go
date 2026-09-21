// The one file of this package reading the outside: a command, a file, the
// streams and the signals. Every other file calls one of these, so a reader
// finds the outside in one place.
// [[spec/design_output/doors#a-door-reads-the-outside]]
package main

import (
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

// [[spec/design_output/tree#the-tree-handed-in]]
func gitFiles(root string) (string, error) {
	said := exec.Command("git", "ls-files")
	said.Dir = root
	read, err := said.Output()
	return string(read), err
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
func readDir(path string) ([]fs.DirEntry, error)  { return os.ReadDir(path) }

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

// The disk the tree reads through: the real one here, and a memory one in the cases. [[spec/tickets/a-door-holds-file-calls]]
type Disk interface {
	ReadFile(path string) ([]byte, error)
	Stat(path string) (fs.FileInfo, error)
	ReadDir(path string) ([]fs.DirEntry, error)
	WalkDir(root string, fn fs.WalkDirFunc) error
}

type realDisk struct{}

func (realDisk) ReadFile(path string) ([]byte, error)       { return readFile(path) }
func (realDisk) Stat(path string) (fs.FileInfo, error)      { return statOf(path) }
func (realDisk) ReadDir(path string) ([]fs.DirEntry, error) { return readDir(path) }
func (realDisk) WalkDir(root string, fn fs.WalkDirFunc) error {
	return filepath.WalkDir(root, fn)
}
