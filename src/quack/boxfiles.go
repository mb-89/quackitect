// The small reads the box verbs share: whether a path stands, a file's text,
// one string as JSON writes it, the home folder a box names, and the disk
// hand a verb reads, writes and moves files through.
// [[spec/tickets/box-verbs-port-to-go]]
package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"io/fs"
	"os"
	"strings"
	"syscall"
)

// The disk a verb reaches, path by path. A test hands a fake, and the box hands the real one. [[spec/tickets/quack-reaches-the-box-through-doors]]
type diskDoors struct {
	read      func(path string) ([]byte, error)
	write     func(path string, data []byte, perm fs.FileMode) error
	stat      func(path string) (fs.FileInfo, error)
	list      func(path string) ([]fs.DirEntry, error)
	makeAll   func(path string, perm fs.FileMode) error
	remove    func(path string) error
	removeAll func(path string) error
	rename    func(from, to string) error
	appendTo  func(path string, data []byte) error
}

// The disk of the box itself. [[spec/tickets/quack-reaches-the-box-through-doors]]
func realDisk() diskDoors {
	return diskDoors{
		read:      os.ReadFile,
		write:     os.WriteFile,
		stat:      os.Stat,
		list:      os.ReadDir,
		makeAll:   os.MkdirAll,
		remove:    os.Remove,
		removeAll: os.RemoveAll,
		rename:    os.Rename,
		appendTo:  realAppend,
	}
}

// Appends to the file, made where none stands, so a line another writer lands in the meantime stays. [[spec/design_output/log#every-writer-appends]]
func realAppend(path string, data []byte) error {
	file, err := os.OpenFile(path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, appendedMode)
	if err != nil {
		return err
	}
	defer file.Close()
	_, err = file.Write(data)
	return err
}

// The mode an appended file takes where the append makes it. [[spec/design_output/log#every-writer-appends]]
const appendedMode = 0o644

// Whether a path stands. [[spec/tickets/quack-reaches-the-box-through-doors]]
func (d diskDoors) stands(path string) bool {
	_, err := d.stat(path)
	return err == nil
}

// Whether a file stands at the path, a folder reading as none. [[spec/tickets/quack-reaches-the-box-through-doors]]
func (d diskDoors) standsFile(path string) bool {
	said, err := d.stat(path)
	return err == nil && !said.IsDir()
}

// A file's text, or nothing where it reads as none. [[spec/tickets/quack-reaches-the-box-through-doors]]
func (d diskDoors) text(path string) string {
	body, err := d.read(path)
	if err != nil {
		return ""
	}
	return string(body)
}

// The entries of a folder by name, or none where it stands nowhere. [[spec/tickets/quack-reaches-the-box-through-doors]]
func (d diskDoors) listed(path string) []fs.DirEntry {
	entries, err := d.list(path)
	if err != nil {
		return nil
	}
	return entries
}

// The codes a disk error carries, named the way node names them. [[spec/guidance/retro/collect]]
var diskCodes = map[syscall.Errno]string{
	syscall.EBUSY:     "EBUSY",
	syscall.EPERM:     "EPERM",
	syscall.EXDEV:     "EXDEV",
	syscall.EACCES:    "EACCES",
	syscall.ENOENT:    "ENOENT",
	syscall.ENOTEMPTY: "ENOTEMPTY",
	syscall.EEXIST:    "EEXIST",
}

// The code node names a disk error by, or none. [[spec/guidance/retro/collect]]
func diskCode(err error) string {
	var code syscall.Errno
	if errors.As(err, &code) {
		return diskCodes[code]
	}
	return ""
}

// The error a move meets where the folder it moves into stands already. [[spec/guidance/retro/collect]]
func diskTaken(was, now string) error {
	return &os.LinkError{Op: "rename", Old: was, New: now, Err: syscall.EEXIST}
}

// Whether a path stands, a link pointing nowhere reading as none. [[spec/tickets/box-verbs-port-to-go]]
func stands(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

// The text of a file, and whether it reads. [[spec/tickets/box-verbs-port-to-go]]
func readText(path string) (string, bool) {
	text, err := os.ReadFile(path)
	return string(text), err == nil
}

// One string as JSON writes it, the HTML characters plain. [[spec/tickets/box-verbs-port-to-go]]
func jsonString(text string) string {
	var said bytes.Buffer
	writes := json.NewEncoder(&said)
	writes.SetEscapeHTML(false)
	_ = writes.Encode(text)
	return strings.TrimRight(said.String(), "\n")
}

// The home folder a box names, Windows' variable first. [[spec/design_output/extension#a-box-names-its-home]]
func homeOf(env func(string) string) string {
	if home := env("USERPROFILE"); home != "" {
		return home
	}
	return env("HOME")
}
