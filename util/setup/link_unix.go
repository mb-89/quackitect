//go:build !windows

package main

import "os"

func makeLink(dest, src string) error { return os.Symlink(src, dest) }

func removeLink(dest string) error {
	fi, err := os.Lstat(dest)
	if err != nil {
		return nil
	}
	if fi.Mode()&os.ModeSymlink != 0 {
		return os.Remove(dest)
	}
	return os.RemoveAll(dest)
}
