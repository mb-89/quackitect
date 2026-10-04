// The disk door the vehicle reads and writes through, and its dry twin, which
// reads the disk and writes nothing.
// [[spec/design_output/doors#one-door-per-outside-thing]]
package vehicle

import (
	"fmt"
	"io/fs"
	"os" // level0: OutsideInDoors - this file is the vehicle's disk door, and every other file takes it off the hand
	"path/filepath"
	"strings"
)

// Entry is one name a folder lists, a dir or a file. [[spec/design_output/doors#one-door-per-outside-thing]]
type Entry struct {
	Name string
	Dir  bool
}

// Disk is the door: the calls src/doors/disk.js answers that a vehicle reaches. [[spec/design_output/doors#one-door-per-outside-thing]]
type Disk interface {
	Read(path string) (string, error)
	Write(path, text string) error
	Exists(path string) bool
	MakeDir(path string) error
	Remove(path string) error
	Runnable(path string) error
	List(path string) ([]Entry, error)
	CopyFolder(from, to string, keeps func(rel string) bool) (int, error)
}

// The mode a run bit sets, as RUNNABLE in src/doors/disk.js. [[spec/design_output/doors#one-door-per-outside-thing]]
const runnable = 0o755

// OS answers the door over the real disk. [[spec/design_output/doors#one-door-per-outside-thing]]
func OS() Disk { return osDisk{} }

// Dry answers a door reading through the one given and writing nothing, which a twin in shadow runs on. [[spec/tickets/runme-hands-verbs-to-quack]]
func Dry(under Disk) Disk { return dryDisk{under} }

type osDisk struct{}

func (osDisk) Read(path string) (string, error) {
	said, err := os.ReadFile(path)
	return string(said), err
}

func (osDisk) Write(path, text string) error { return os.WriteFile(path, []byte(text), 0o666) }

func (osDisk) Exists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

func (osDisk) MakeDir(path string) error { return os.MkdirAll(path, 0o777) }

// A link goes alone, and a folder with everything under it, and a path standing nowhere is no fault. [[spec/design_output/doors#one-door-per-outside-thing]]
func (osDisk) Remove(path string) error {
	if info, err := os.Lstat(path); err == nil && info.Mode()&fs.ModeSymlink != 0 {
		return os.Remove(path)
	}
	return os.RemoveAll(path)
}

func (osDisk) Runnable(path string) error { return os.Chmod(path, runnable) }

func (osDisk) List(path string) ([]Entry, error) {
	said, err := os.ReadDir(path)
	if err != nil {
		return nil, err
	}
	out := make([]Entry, 0, len(said))
	for _, one := range said {
		out = append(out, Entry{Name: one.Name(), Dir: one.IsDir()})
	}
	return out, nil
}

// The files a folder copy carries, counted, as cpSync carries them: bytes and mode, a link as a link to its resolved target, and a path `keeps` refuses left behind with all under it. [[spec/tickets/disk-door-copies-a-folder]]
func (osDisk) CopyFolder(from, to string, keeps func(rel string) bool) (int, error) {
	return copyFolder(from, to, keeps, true)
}

func copyFolder(from, to string, keeps func(rel string) bool, writes bool) (int, error) {
	info, err := os.Stat(from)
	if err != nil {
		return 0, err
	}
	if !info.IsDir() {
		return 0, fmt.Errorf("cannot copy %s, which is no folder, into %s", from, to)
	}
	source, _ := filepath.Abs(from)
	dest, _ := filepath.Abs(to)
	if source == dest {
		return 0, fmt.Errorf("src and dest cannot be the same %s", dest)
	}
	if strings.HasPrefix(dest, source+string(filepath.Separator)) {
		return 0, fmt.Errorf("cannot copy %s to a subdirectory of self %s", from, to)
	}
	count := 0
	err = copyUnder(from, to, "", keeps, writes, &count)
	return count, err
}

func copyUnder(from, to, rel string, keeps func(string) bool, writes bool, count *int) error {
	listed, err := os.ReadDir(from)
	if err != nil {
		return err
	}
	for _, one := range listed {
		next := one.Name()
		if rel != "" {
			next = rel + "/" + one.Name()
		}
		if !keeps(next) {
			continue
		}
		src, dst := filepath.Join(from, one.Name()), filepath.Join(to, one.Name())
		info, err := os.Lstat(src)
		if err != nil {
			return err
		}
		if followed, err := os.Stat(src); err == nil && followed.Mode().IsRegular() {
			*count++
		}
		if !writes {
			if info.IsDir() {
				if err := copyUnder(src, dst, next, keeps, writes, count); err != nil {
					return err
				}
			}
			continue
		}
		switch {
		case info.Mode()&fs.ModeSymlink != 0:
			err = copyLink(src, dst)
		case info.IsDir():
			err = copyDir(src, dst, next, info.Mode().Perm(), keeps, count)
		case info.Mode().IsRegular():
			err = copyFile(src, dst, info.Mode().Perm())
		}
		if err != nil {
			return err
		}
	}
	return nil
}

// A folder new to the copy takes its source's mode once its contents land. [[spec/tickets/disk-door-copies-a-folder]]
func copyDir(src, dst, rel string, mode fs.FileMode, keeps func(string) bool, count *int) error {
	_, err := os.Stat(dst)
	fresh := err != nil
	if fresh {
		if err := os.Mkdir(dst, 0o777); err != nil {
			return err
		}
	}
	if err := copyUnder(src, dst, rel, keeps, true, count); err != nil {
		return err
	}
	if fresh {
		return os.Chmod(dst, mode)
	}
	return nil
}

func copyFile(src, dst string, mode fs.FileMode) error {
	said, err := os.ReadFile(src)
	if err != nil {
		return err
	}
	_ = os.Remove(dst)
	if err := os.WriteFile(dst, said, mode); err != nil {
		return err
	}
	return os.Chmod(dst, mode)
}

// A relative link lands resolved against its source folder, as cpSync writes it. [[spec/tickets/disk-door-copies-a-folder]]
func copyLink(src, dst string) error {
	target, err := os.Readlink(src)
	if err != nil {
		return err
	}
	if !filepath.IsAbs(target) {
		target = filepath.Join(filepath.Dir(src), target)
		if abs, err := filepath.Abs(target); err == nil {
			target = abs
		}
	}
	_ = os.Remove(dst)
	return os.Symlink(target, dst)
}

type dryDisk struct{ under Disk }

func (d dryDisk) Read(path string) (string, error)  { return d.under.Read(path) }
func (dryDisk) Write(string, string) error          { return nil }
func (d dryDisk) Exists(path string) bool           { return d.under.Exists(path) }
func (dryDisk) MakeDir(string) error                { return nil }
func (dryDisk) Remove(string) error                 { return nil }
func (dryDisk) Runnable(string) error               { return nil }
func (d dryDisk) List(path string) ([]Entry, error) { return d.under.List(path) }

// A dry copy counts what a copy carries, and lands nothing. [[spec/tickets/runme-hands-verbs-to-quack]]
func (dryDisk) CopyFolder(from, to string, keeps func(rel string) bool) (int, error) {
	return copyFolder(from, to, keeps, false)
}
