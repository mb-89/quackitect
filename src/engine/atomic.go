package main

import (
	"os"
	"path/filepath"
)

// EVERY WRITE IS ATOMIC, SO A CRASH LEAVES THE OLD FILE RATHER THAN HALF A NEW ONE.
//
// os.WriteFile truncates and then writes. A process that dies between the two
// leaves an empty or half-written file, and every loader in this program
// swallows a read failure into an empty value: loadOwed, loadClaims,
// loadTickets, LoadEvidence, loadHeard. So the obligation, the claim and the
// ticket do not come back wrong, they come back GONE, and nothing says they
// were ever there.
//
// IT MATTERS HERE MORE THAN IN MOST PROGRAMS. The guard is a fresh process on
// every tool call, several run at once, and the machine it runs on is somebody's
// laptop that gets shut. SaveToken already did this by hand for the one file
// that holds a token; this is the same three lines, named, for the rest.
//
// THE TEMPORARY FILE IS BESIDE THE TARGET, because rename is only atomic within
// a filesystem and the temp directory is often another one.
func writeAtomic(path string, b []byte, mode os.FileMode) error {
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}
	f, err := os.CreateTemp(dir, filepath.Base(path)+".*.tmp")
	if err != nil {
		return err
	}
	name := f.Name()
	if _, err := f.Write(b); err != nil {
		f.Close()
		os.Remove(name)
		return err
	}
	// THE BYTES ARE ON THE DISK BEFORE THE NAME POINTS AT THEM. Without this a
	// power cut can leave the rename durable and the contents not, which is the
	// one case that turns an atomic write back into a truncating one.
	if err := f.Sync(); err != nil {
		f.Close()
		os.Remove(name)
		return err
	}
	if err := f.Close(); err != nil {
		os.Remove(name)
		return err
	}
	if err := os.Chmod(name, mode); err != nil {
		os.Remove(name)
		return err
	}
	if err := os.Rename(name, path); err != nil {
		os.Remove(name)
		return err
	}
	return nil
}
