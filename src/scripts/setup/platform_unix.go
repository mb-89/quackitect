//go:build !windows

package main

import (
	"os"
	"path/filepath"
)

// The per-user data folder, where the XDG base directory rule puts it.
func dataDir() string {
	if d := os.Getenv("XDG_DATA_HOME"); d != "" {
		return d
	}
	return filepath.Join(homeDir(), ".local", "share")
}

// The system tar reads a .tar.xz on its own once xz is on the machine.
func tarPath() string { return "tar" }
