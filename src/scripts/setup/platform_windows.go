//go:build windows

package main

import (
	"os"
	"path/filepath"
)

// The per-user data folder. Local, never roaming: a compiler is 300 MB that
// no profile sync should carry.
func dataDir() string {
	if d := os.Getenv("LOCALAPPDATA"); d != "" {
		return d
	}
	return filepath.Join(homeDir(), "AppData", "Local")
}

// THE TAR WINDOWS SHIPS, BY PATH. It is bsdtar, which reads a zip. The GNU
// tar that Git puts on PATH does not, and PATH order decides which one the
// name alone would find.
func tarPath() string {
	return filepath.Join(os.Getenv("SystemRoot"), "System32", "tar.exe")
}
