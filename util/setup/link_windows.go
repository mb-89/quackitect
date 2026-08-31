package main

import (
	"fmt"
	"os"
	"os/exec"
	"strings"
	"syscall"
)

// A JUNCTION, never a symbolic link. A symbolic link on Windows needs a
// privilege an ordinary account does not hold, and the failure reads as
// "the client does not hold a required privilege", which explains nothing.
// A junction needs no privilege, the editor follows it exactly the same way,
// and v3 already proved the approach.
//
// The command line is built by hand rather than from arguments, because cmd
// takes the rest of the line as written and a path with a space in it does
// not survive the usual escaping.
func makeLink(dest, src string) error {
	out, err := runCmd(fmt.Sprintf(`/c mklink /J "%s" "%s"`, dest, src))
	if err != nil {
		return fmt.Errorf(`could not link the extension into %s
  %s
  This does not need administrator rights. A junction needs both ends on the
  same NTFS volume, so check that neither is a network or removable drive.
  %w`, dest, out, err)
	}
	return nil
}

// A junction is removed with rmdir, never with a recursive delete. A
// recursive delete follows the link and takes what it points at, which here
// is the source tree.
func removeLink(dest string) error {
	if fi, err := os.Lstat(dest); err != nil {
		return nil // nothing there
	} else if fi.Mode()&os.ModeSymlink != 0 || fi.Mode()&os.ModeIrregular != 0 {
		if out, err := runCmd(fmt.Sprintf(`/c rmdir "%s"`, dest)); err != nil {
			return fmt.Errorf("%s: %w", out, err)
		}
		return nil
	}
	if err := os.RemoveAll(dest); err != nil {
		// A loaded extension cannot be replaced: the editor holds the files it
		// is running, and the raw failure names an internal file rather than
		// the cause.
		return err
	}
	return nil
}

func runCmd(line string) (string, error) {
	cmd := exec.Command("cmd")
	cmd.SysProcAttr = &syscall.SysProcAttr{CmdLine: line}
	out, err := cmd.CombinedOutput()
	return strings.TrimSpace(string(out)), err
}
